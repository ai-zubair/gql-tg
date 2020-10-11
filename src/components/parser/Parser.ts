import { writeFileSync } from 'fs';
import { 
  ROOT_OP_NAMES, 
  GQL_INPUT_TYPES, 
  GQL_OUTPUT_TYPES,  
  TokenizedTypeDefinition, 
  GQLRootOperationTupleMap, 
  RootOperationTuple, 
  ERargumentDefinition, 
  ERreturnDefinition, 
  ExecutionRequestDefinition, 
  GQL_NAMED_TYPES, 
  GQLNamedTypeMap,
  GQLRootOperationMap,
  GQLRootOperation,
  GQLExecutionRequest,
  ExecutionRequestArg,
  ArgTuple,
  ExecutionRequestReturn,NonScalarTypeMap,
  NonScalarTypeField,
  NonScalarFieldReturn,
  GQLschemaMap,
  GQLschemaParser
} from '../../types';

import { 
  EMPTY_STRING_PATTERN, 
  ROOT_OP_PATTERN,
  ER_SPLIT_PATTERN, 
  SIGNATURE_SPLIT_PATTERN, 
  ARG_SPLIT_PATTERN, 
  REQUIRED_ARG_PATTERN, 
  STRIP_WRAPPING_TYPE_PATTERN, 
  LIST_PATTERN, 
  LIST_VALUE_OPTIONAL_PATTERN, 
} from '../../patterns';

import { scalarTypeMap } from '../../constants';

import { Tokenizer } from '../tokenizer/Tokenizer';

interface GQLschemaTokenizer{
  typeDefinitions: TokenizedTypeDefinition[];
  rootOperationDefinitions: TokenizedTypeDefinition[];
  nonScalarTypeDefinitions: TokenizedTypeDefinition[];
  parsingDelimiter: string;
}

class Parser implements GQLschemaParser {
  public tokenizer: GQLschemaTokenizer;
  private rootOperationDefTupleMap: GQLRootOperationTupleMap;
  private namedTypeMap: GQLNamedTypeMap = {};
  public parsedSchema: GQLschemaMap;

  constructor(public schemaURL: string, customTokenizer?: GQLschemaTokenizer) {
    this.tokenizer = customTokenizer || new Tokenizer(schemaURL);
    this.rootOperationDefTupleMap = this.generateRootOperationDefTuples();
    this.namedTypeMap = this.mapTypeLabelsToNamedTypes();
    this.parsedSchema = this.parseSchema();
  }

  private mapTypeLabelsToNamedTypes(): GQLNamedTypeMap{
    const rootOpPattern = new RegExp(ROOT_OP_PATTERN, 'i');
    const nonScalarTypeDefinitions = this.tokenizer.typeDefinitions.filter( typeDefinition => !rootOpPattern.test(typeDefinition));
    const typeMap = {...scalarTypeMap};
    nonScalarTypeDefinitions.forEach( typeDefinition => {
      const typeDefTuple = typeDefinition.split(/::/);
      const nonScalarTypeName = typeDefTuple[0];
      const nonScalarTypeLabel = typeDefTuple[1];
      typeMap[nonScalarTypeLabel] = nonScalarTypeName.toUpperCase();
    })
    return typeMap;
  }

  private generateRootOperationDefTuples(): GQLRootOperationTupleMap {
    if(this.tokenizer.rootOperationDefinitions.length === 0){
      throw new Error("No root operation type defintions found in the schema file!"); 
    }
    const defTupleMap: GQLRootOperationTupleMap = {
      [ROOT_OP_NAMES.QUERY]: undefined,
      [ROOT_OP_NAMES.MUTATION]: undefined,
      [ROOT_OP_NAMES.SUBSCRIPTION]: undefined
    }
    this.tokenizer.rootOperationDefinitions.forEach( (rootOpDef: TokenizedTypeDefinition) => {
      let rootDefTuple: RootOperationTuple = rootOpDef.split(this.tokenizer.parsingDelimiter);
      const rootOpName = rootDefTuple.splice(0,2)[1].toUpperCase();
      defTupleMap[rootOpName] = rootDefTuple.length > 0 ? rootDefTuple : undefined;
    })
    return defTupleMap;
  }

  private parseArgumentDefinition(argDefString: ERargumentDefinition): ExecutionRequestArg{
    const argSplitPattern = new RegExp(ARG_SPLIT_PATTERN);
    const argTuple = argDefString.split(argSplitPattern) as ArgTuple;
    const argName = argTuple[0];
    const argTypeSignature = argTuple[1];
    const isOptional = !new RegExp(REQUIRED_ARG_PATTERN).test(argTypeSignature);
    const argDefWithoutWrapgType = argTypeSignature.replace('!','');
    const argType = this.namedTypeMap[argDefWithoutWrapgType] as GQL_INPUT_TYPES;
    const scalarTypeName = argType === GQL_INPUT_TYPES.SCALAR ? argDefWithoutWrapgType: undefined;
    const nonScalarTypeName = argType !== GQL_INPUT_TYPES.SCALAR ? argDefWithoutWrapgType : undefined;
    return {
      argName,
      argType,
      scalarTypeName,
      nonScalarTypeName,
      isOptional
    }
  }

  private parseReturnDefinition( execReqReturnString: ERreturnDefinition): ExecutionRequestReturn{
    const isOptional = !new RegExp(REQUIRED_ARG_PATTERN).test(execReqReturnString);
    const isList = new RegExp(LIST_PATTERN).test(execReqReturnString);
    const isListValueOptional = isList ? new RegExp(LIST_VALUE_OPTIONAL_PATTERN).test(execReqReturnString): undefined;
    const stripWrappingTypesPattern = new RegExp(STRIP_WRAPPING_TYPE_PATTERN,'g');
    const returnDefWithoutWrapgType = execReqReturnString.replace(stripWrappingTypesPattern,'');
    const returnType = this.namedTypeMap[returnDefWithoutWrapgType] as GQL_OUTPUT_TYPES;
    const scalarTypeName = returnType === GQL_OUTPUT_TYPES.SCALAR ? returnDefWithoutWrapgType: undefined;
    const nonScalarTypeName = returnType !== GQL_OUTPUT_TYPES.SCALAR ? returnDefWithoutWrapgType: undefined;
    return {
      returnType,
      scalarTypeName,
      nonScalarTypeName,
      isOptional,
      isList,
      isListValueOptional
    }
  }

  private parseExecutionRequestDefinition(execRequestTuple: ExecutionRequestDefinition): GQLExecutionRequest{
    const execRequestSignature = execRequestTuple[0];
    const execRequestReturnVal = execRequestTuple[1];
    const emptySignatureSegmentPattern = new RegExp(EMPTY_STRING_PATTERN);
    const execRequestSignatureSplitPattern = new RegExp(SIGNATURE_SPLIT_PATTERN);
    const execRequestSignatureTuple = execRequestSignature.split(execRequestSignatureSplitPattern)
                                                          .filter( signatureSegment => !emptySignatureSegmentPattern.test(signatureSegment) );
    const execRequestName = execRequestSignatureTuple[0];
    const execRequestArgs = execRequestSignatureTuple.length-1;
    const execRequestArgDefs = [];
    for (let argDefIndex = 1; argDefIndex < execRequestSignatureTuple.length; argDefIndex++) {
      const argDef = this.parseArgumentDefinition(execRequestSignatureTuple[argDefIndex]);
      execRequestArgDefs.push(argDef);
    }
    const execRequestReturn = this.parseReturnDefinition(execRequestReturnVal);
    return {
      requestName: execRequestName,
      requestArgs: execRequestArgs,
      requestArgDefs: execRequestArgDefs,
      requestReturn: execRequestReturn
    }
  }

  private parseRootOperations(): GQLRootOperationMap{
    const operationMap: GQLRootOperationMap = {
      [ROOT_OP_NAMES.QUERY]: this.rootOperationDefTupleMap[ROOT_OP_NAMES.QUERY] ? {} as GQLRootOperation : undefined,
      [ROOT_OP_NAMES.MUTATION]: this.rootOperationDefTupleMap[ROOT_OP_NAMES.MUTATION] ? {} as GQLRootOperation : undefined,
      [ROOT_OP_NAMES.SUBSCRIPTION]: this.rootOperationDefTupleMap[ROOT_OP_NAMES.SUBSCRIPTION] ? {} as GQLRootOperation : undefined,
    }
    for (const rootOpName in this.rootOperationDefTupleMap) {
      const rootOpTuple = this.rootOperationDefTupleMap[rootOpName];
      if(rootOpTuple){
        operationMap[rootOpName].rootOperationName = rootOpName as ROOT_OP_NAMES;
        operationMap[rootOpName].permittedRequests = [];
        for(const executionRequestString of rootOpTuple){
          const execReqStringSeparatorPattern = new RegExp(ER_SPLIT_PATTERN);
          const execRequestTuple = executionRequestString.split(execReqStringSeparatorPattern)
          const execRequest = this.parseExecutionRequestDefinition(execRequestTuple as ExecutionRequestDefinition);
          operationMap[rootOpName].permittedRequests.push(execRequest);
        }
      }
    }
    return operationMap;
    
  }

  private parseNonScalarTypeDefinitions(): NonScalarTypeMap {
    const nonScalarTypeMap: NonScalarTypeMap = {};
    this.tokenizer.nonScalarTypeDefinitions.forEach( (nonScalarTypeDef: TokenizedTypeDefinition) => {
      const nonScalarTypeDefTuple = nonScalarTypeDef.split(this.tokenizer.parsingDelimiter);
      const typeName = nonScalarTypeDefTuple[0].toUpperCase() as GQL_NAMED_TYPES;
      const typeLabel = nonScalarTypeDefTuple[1];
      const typeFields = nonScalarTypeDefTuple.length > 2 ? [] as NonScalarTypeField[] : undefined;
      for (let typeFieldIndex = 2; typeFieldIndex < nonScalarTypeDefTuple.length; typeFieldIndex++) {
        const isEnumOrUnionType = typeName === GQL_NAMED_TYPES.ENUM || typeName === GQL_NAMED_TYPES.UNION;
        const fieldTuple = nonScalarTypeDefTuple[typeFieldIndex].split(':');
        const fieldLabel = fieldTuple[0];
        const fieldReturn = isEnumOrUnionType ? undefined : this.parseReturnDefinition(fieldTuple[1]) as NonScalarFieldReturn;
        typeFields.push({
          fieldLabel,
          fieldReturn
        })
      }
      nonScalarTypeMap[typeLabel] = {
        typeName,
        typeLabel,
        typeFields
      }
    });
    return nonScalarTypeMap;
  }

  private parseSchema(): GQLschemaMap {
    const rootOperations = this.parseRootOperations();
    const nonScalarTypes = this.parseNonScalarTypeDefinitions();
    writeFileSync('./parsedSchema.json', JSON.stringify({rootOperations, nonScalarTypes}, undefined, 2));
    return{
      rootOperations,
      nonScalarTypes
    }
  }
}

export { GQLschemaTokenizer, Parser };
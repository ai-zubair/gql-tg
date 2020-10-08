import { writeFileSync } from 'fs';
import { GQLRootOperationTupleMap, GQLRootOperationMap, GQLRootOperation, GQLExecutionRequest, ExecutionRequestArg, ArgTuple, ExecutionRequestReturn, ROOT_OP_NAMES, GQL_INPUT_TYPES, GQL_OUTPUT_TYPES, GQLschemaParser, TokenizedTypeDefinition, ERargumentDefinition, ERreturnDefinition, ExecutionRequestDefinition, RootOperationTuple } from '../../types';
import { EMPTY_STRING_PATTERN, ER_SPLIT_PATTERN, SIGNATURE_SPLIT_PATTERN, ARG_SPLIT_PATTERN, REQUIRED_ARG_PATTERN, LIST_VALUE_OPTIONAL_PATTERN, STRIP_WRAPPING_TYPE_PATTERN, LIST_PATTERN } from '../../patterns';
import { SchemaParser } from '../parser/SchemaParser';

class DefinitionGenerator {
  public schemaParser: GQLschemaParser;
  private rootOperationDefTupleMap: GQLRootOperationTupleMap;

  constructor(public schemaURL: string, customSchemaParser?: GQLschemaParser) {
    this.schemaParser = customSchemaParser || new SchemaParser(schemaURL);
    this.rootOperationDefTupleMap = this.generateRootOperationDefTuples();
  }

  private generateRootOperationDefTuples(): GQLRootOperationTupleMap {
    if(this.schemaParser.rootOperationDefinitions.length === 0){
      throw new Error("No root operation type defintions found in the schema file!"); 
    }
    const defTupleMap: GQLRootOperationTupleMap = {
      [ROOT_OP_NAMES.QUERY]: undefined,
      [ROOT_OP_NAMES.MUTATION]: undefined,
      [ROOT_OP_NAMES.SUBSCRIPTION]: undefined
    }
    this.schemaParser.rootOperationDefinitions.forEach( (rootOpDef: TokenizedTypeDefinition) => {
      let rootDefTuple: RootOperationTuple = rootOpDef.split(this.schemaParser.parsingDelimiter);
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
    const argType = this.schemaParser.namedTypeMap[argDefWithoutWrapgType] as GQL_INPUT_TYPES;
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
    const returnType = this.schemaParser.namedTypeMap[returnDefWithoutWrapgType] as GQL_OUTPUT_TYPES;
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
    const execRequestSignatureTuple = execRequestSignature.split(execRequestSignatureSplitPattern).filter( signatureSegment => !emptySignatureSegmentPattern.test(signatureSegment) );
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

  public parseRootOperations(): GQLRootOperationMap{
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
    writeFileSync('./test.json',JSON.stringify(operationMap,undefined,2));
    return operationMap;
    
  }
}

export { DefinitionGenerator };
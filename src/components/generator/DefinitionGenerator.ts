import { writeFileSync } from 'fs';
import { GQLRootOperationTupleMap, GQLRootOperationMap, GQLRootOperation, GQLExecutionRequest, ExecutionRequestArg, ArgTuple, ExecutionRequestReturn, ROOT_OP_NAMES, GQL_INPUT_TYPES, GQL_OUTPUT_TYPES, GQLschemaParser } from '../../types';
import { CHARAC_CLEAN_PATTERN, EMPTY_STRING_PATTERN, ER_SPLIT_PATTERN, SIGNATURE_SPLIT_PATTERN, ARG_SPLIT_PATTERN, REQUIRED_ARG_PATTERN } from '../../constants';
import { SchemaParser } from '../parser/SchemaParser';

class DefinitionGenerator {
  public schemaParser: GQLschemaParser;
  private rootOperationDefTupleMap: GQLRootOperationTupleMap;

  constructor(public schemaURL: string) {
    this.schemaParser = new SchemaParser(schemaURL);
    this.rootOperationDefTupleMap = this.generateRootOperationDefTuples();
  }

  private generateRootOperationDefTuples(): GQLRootOperationTupleMap {
    if(this.schemaParser.rootOperationDefinitions.length === 0){
      throw new Error("No root operation type defintions found in the schema file!"); 
    }
    const charCleanPattern = new RegExp(CHARAC_CLEAN_PATTERN, 'gi');
    const characterCleanedRootDefintions = this.schemaParser.rootOperationDefinitions.map( (defString):string => defString.replace(charCleanPattern,''));
    const defTupleMap: GQLRootOperationTupleMap = {
      [ROOT_OP_NAMES.QUERY]: undefined,
      [ROOT_OP_NAMES.MUTATION]: undefined,
      [ROOT_OP_NAMES.SUBSCRIPTION]: undefined
    }
    characterCleanedRootDefintions.forEach( rootDefString => {
      console.log(rootDefString);
      let rootDefTuple = rootDefString.split(this.schemaParser.parsingDelimiter);
      const rootOpName = rootDefTuple.shift().toUpperCase();
      const emptyAttributePattern = new RegExp(EMPTY_STRING_PATTERN);
      rootDefTuple = rootDefTuple.filter( execRequest => !emptyAttributePattern.test(execRequest) );
      defTupleMap[rootOpName] = rootDefTuple.length > 0 ? rootDefTuple : undefined;
    })
    return defTupleMap;
  }

  private getExecRequestArgDefinition(argDefString: string): ExecutionRequestArg{
    const argSplitPattern = new RegExp(ARG_SPLIT_PATTERN);
    const argTuple = argDefString.split(argSplitPattern) as ArgTuple;
    const argName = argTuple[0];
    const argTypeSignature = argTuple[1];
    const isOptional = !new RegExp(REQUIRED_ARG_PATTERN).test(argTypeSignature);
    const argType = this.schemaParser.namedTypeMap[argTypeSignature.replace('!','')] as GQL_INPUT_TYPES;
    const scalarTypeName = argType === GQL_INPUT_TYPES.SCALAR ? argTypeSignature.replace('!',''): undefined;
    const nonScalarTypeName = argType !== GQL_INPUT_TYPES.SCALAR ? argTypeSignature.replace('!','') : undefined;
    return {
      argName,
      argType,
      scalarTypeName,
      nonScalarTypeName,
      isOptional
    }
  }

  private getExecRequestReturnDefinition( execReqReturnString: string): ExecutionRequestReturn{
    const isOptional = !new RegExp(REQUIRED_ARG_PATTERN).test(execReqReturnString);
    const isList = new RegExp('^\\[').test(execReqReturnString);
    const isListValueOptional = isList ? new RegExp('\\w\\]\\W?$').test(execReqReturnString): undefined;
    const returnType = this.schemaParser.namedTypeMap[execReqReturnString.replace(/\[|\]|!/g,'')] as GQL_OUTPUT_TYPES;
    const scalarTypeName = returnType === GQL_OUTPUT_TYPES.SCALAR ? execReqReturnString.replace(/\[|\]|!/g,''): undefined;
    const nonScalarTypeName = returnType !== GQL_OUTPUT_TYPES.SCALAR ? execReqReturnString.replace(/\[|\]|!/g,''): undefined;
    
    return {
      returnType,
      scalarTypeName,
      nonScalarTypeName,
      isOptional,
      isList,
      isListValueOptional
    }
  }

  private generateExecRequest(execRequestTuple: string[]): GQLExecutionRequest{
    const execRequestSignature = execRequestTuple[0];
    const execRequestReturnVal = execRequestTuple[1];
    const emptySignatureSegmentPattern = new RegExp(EMPTY_STRING_PATTERN);
    const execRequestSignatureSplitPattern = new RegExp(SIGNATURE_SPLIT_PATTERN);
    const execRequestSignatureTuple = execRequestSignature.split(execRequestSignatureSplitPattern).filter( signatureSegment => !emptySignatureSegmentPattern.test(signatureSegment) );
    const execRequestName = execRequestSignatureTuple[0];
    const execRequestArgs = execRequestSignatureTuple.length-1;
    const execRequestArgDefs = [];
    for (let argDefIndex = 1; argDefIndex < execRequestSignatureTuple.length; argDefIndex++) {
      const argDef = this.getExecRequestArgDefinition(execRequestSignatureTuple[argDefIndex]);
      execRequestArgDefs.push(argDef);
    }
    const execRequestReturn = this.getExecRequestReturnDefinition(execRequestReturnVal);
    return {
      requestName: execRequestName,
      requestArgs: execRequestArgs,
      requestArgDefs: execRequestArgDefs,
      requestReturn: execRequestReturn
    }
  }

  public generateRootOperationTypeDefinitions(): GQLRootOperationMap{
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
          const execRequest = this.generateExecRequest(execRequestTuple);
          operationMap[rootOpName].permittedRequests.push(execRequest);
        }
      }
    }
    writeFileSync('./test.json',JSON.stringify(operationMap,undefined,2));
    return operationMap;
    
  }
}

export { DefinitionGenerator };
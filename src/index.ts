import { readFileSync } from 'fs';
import { GQLRootOperationTupleMap, GQLRootOperationMap, GQLRootOperation, ROOT_OP_NAMES, GQLExecutionRequest, ExecutionRequestArg } from './types';
import { DEF_GEN_PATTERN, DELIM, ROOT_OP_PATTERN, CHARAC_CLEAN_PATTERN, EMPTY_STRING_PATTERN, ER_SPLIT_PATTERN, SIGNATURE_SPLIT_PATTERN } from './constants';

const generateTypeDefinitionStrings = (schemaURL: string): string[] => {
  if(!schemaURL.endsWith('.graphql')){
    throw new Error("Schema file must be a graphql file!");
  }
  try{
    const schemaFileData = readFileSync(schemaURL,{
      encoding: "utf-8"
    })
    const defGenPattern = new RegExp(DEF_GEN_PATTERN,'i');
    const typeDefinitionList = schemaFileData.split(defGenPattern);
    const emptyDefPattern = new RegExp(EMPTY_STRING_PATTERN);
    const cleanedDefinitionList = typeDefinitionList.map( typeDefinition => typeDefinition.trim().replace(/\n/g, DELIM)).filter( typeDef => !emptyDefPattern.test(typeDef));
    return cleanedDefinitionList;
  }catch(err){
    throw new Error("Failed to generate type definition strings!");
  }
}

const getRootOperationDefinitionStrings = (typeDefinitionStrings: string[]): string[] => {
  const rootOpPattern = new RegExp(ROOT_OP_PATTERN, 'i');
  const rootOperationTypeDefinitions = typeDefinitionStrings.filter( typeDefinition => rootOpPattern.test(typeDefinition));
  return rootOperationTypeDefinitions;
}

const generateRootOperationDefTuples = (rootOperationDefinitionStrings: string[]): GQLRootOperationTupleMap => {
  if(rootOperationDefinitionStrings.length === 0){
    throw new Error("No root operation type defintions found in the schema file!"); 
  }
  const charCleanPattern = new RegExp(CHARAC_CLEAN_PATTERN, 'gi');
  const characterCleanedRootDefintions = rootOperationDefinitionStrings.map( (defString):string => defString.replace(charCleanPattern,''));
  const defTupleMap: GQLRootOperationTupleMap = {
    [ROOT_OP_NAMES.QUERY]: undefined,
    [ROOT_OP_NAMES.MUTATION]: undefined,
    [ROOT_OP_NAMES.SUBSCRIPTION]: undefined
  }
  characterCleanedRootDefintions.forEach( rootDefString => {
    let rootDefTuple = rootDefString.split(DELIM);
    const rootOpName = rootDefTuple.shift().toUpperCase();
    const emptyAttributePattern = new RegExp(EMPTY_STRING_PATTERN);
    rootDefTuple = rootDefTuple.filter( execRequest => !emptyAttributePattern.test(execRequest) );
    defTupleMap[rootOpName] = rootDefTuple;
  })
  return defTupleMap;
}

const getExecRequestArgDefinition = (argDefString: string): ExecutionRequestArg => {

}

const getExecRequestReturnDefinition = ( execReqReturnString: string[]): ExecutionRequestReturn => {

}

const generateExecRequest = (execRequestTuple: string[]): GQLExecutionRequest => {
  const execRequestSignature = execRequestTuple[0];
  const execRequestReturnVal = execRequestTuple[1];
  const emptySignatureSegmentPattern = new RegExp(EMPTY_STRING_PATTERN);
  const execRequestSignatureSplitPattern = new RegExp(SIGNATURE_SPLIT_PATTERN);
  const execRequestSignatureTuple = execRequestSignature.split(execRequestSignatureSplitPattern).filter( signatureSegment => !emptySignatureSegmentPattern.test(signatureSegment) );
  const execRequestName = execRequestSignatureTuple[0];
  const execRequestArgs = execRequestSignatureTuple.length-1;
  const execRequestArgDefs = [];
  for (let argDefIndex = 1; argDefIndex < execRequestSignatureTuple.length; argDefIndex++) {
    const argDef = getExecRequestArgDefinition(execRequestSignatureTuple[argDefIndex]);
    execRequestArgDefs.push(argDef);
  }
  const execRequestReturn = getExecRequestReturnDefinition(execRequestReturnVal);
  return {
    requestName: execRequestName,
    requestArgs: execRequestArgs,
    requestArgDefs: execRequestArgDefs,
    requestReturn: execRequestReturn
  }
}

const generateRootOperationTypeDefinitions = (rootOpTupleMap: GQLRootOperationTupleMap): GQLRootOperationMap => {
  const operationMap: GQLRootOperationMap = {
    [ROOT_OP_NAMES.QUERY]: rootOpTupleMap[ROOT_OP_NAMES.QUERY] ? {} as GQLRootOperation : undefined,
    [ROOT_OP_NAMES.MUTATION]: rootOpTupleMap[ROOT_OP_NAMES.MUTATION] ? {} as GQLRootOperation : undefined,
    [ROOT_OP_NAMES.SUBSCRIPTION]: rootOpTupleMap[ROOT_OP_NAMES.SUBSCRIPTION] ? {} as GQLRootOperation : undefined,
  }
  for (const rootOpName in rootOpTupleMap) {
    const rootOpTuple = rootOpTupleMap[rootOpName];
    if(rootOpTuple){
      operationMap[rootOpName].rootOperationName = rootOpName as ROOT_OP_NAMES;
      operationMap[rootOpName].permittedRequests = [];
      for(const executionRequestString of rootOpTuple){
        const execReqStringSeparatorPattern = new RegExp(ER_SPLIT_PATTERN);
        const execRequestTuple = executionRequestString.split(execReqStringSeparatorPattern)
        const execRequest = generateExecRequest(execRequestTuple);
        operationMap[rootOpName].permittedRequests.push(execRequest);
      }
    }
  }
  return operationMap;
  
}

generateRootOperationTypeDefinitions(generateRootOperationDefTuples(getRootOperationDefinitionStrings(generateTypeDefinitionStrings('./mockup.schema.graphql'))));

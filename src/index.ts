import { readFileSync } from 'fs';
import { GQLRootOperationTupleMap, GQLRootOperationMap, GQLRootOperation, ROOT_OP_NAMES, GQLExecutionRequest } from './types';
import { DEF_GEN_PATTERN, DELIM, ROOT_OP_PATTERN, CHARAC_CLEAN_PATTERN, EMPTY_STRING_PATTERN, ER_SIGNATURE_SPLIT_PATTERN } from './constants';

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

const generateExecRequest = (execRequestTuple: string[]): GQLExecutionRequest => {
  console.log(execRequestTuple);
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
      for(const executionRequestSignature of rootOpTuple){
        const execReqSignatureSeparatorPattern = new RegExp(ER_SIGNATURE_SPLIT_PATTERN);
        const execRequestSignatureTuple = executionRequestSignature.split(execReqSignatureSeparatorPattern)
        const execRequest = generateExecRequest(execRequestSignatureTuple);
        operationMap[rootOpName].permittedRequests.push(execRequest);
      }
    }
  }
  return operationMap;
  
}

generateRootOperationTypeDefinitions(generateRootOperationDefTuples(getRootOperationDefinitionStrings(generateTypeDefinitionStrings('./mockup.schema.graphql'))));

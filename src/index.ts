import { readFileSync } from 'fs';
import { GQLRootOperationTupleMap, GQLRootOperationMap, ROOT_OP_NAMES } from './types';
import { DEF_GEN_PATTERN, DELIM, ROOT_OP_PATTERN, CHARAC_CLEAN_PATTERN, EMPTY_STRING_PATTERN } from './constants';

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
    const cleanedDefinitionList = typeDefinitionList.map( typeDefinition => typeDefinition.trim().replace(/\n/g, DELIM));
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
    rootDefTuple = rootDefTuple.filter( attributes => !emptyAttributePattern.test(attributes) );
    defTupleMap[rootOpName] = rootDefTuple;
  })
  return defTupleMap;
}

const generateRootOperationTypeDefinitions = (rootOpDetails: GQLRootOperationTupleMap): GQLRootOperationMap => {

  return {
    [ROOT_OP_NAMES.QUERY]: undefined,
    [ROOT_OP_NAMES.MUTATION]: undefined,
    [ROOT_OP_NAMES.SUBSCRIPTION]: undefined,
  }
  
}

console.log(generateRootOperationDefTuples(getRootOperationDefinitionStrings(generateTypeDefinitionStrings('./mockup.schema.graphql'))));

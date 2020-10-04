import { readFileSync } from 'fs';
import { GQLRootOperation } from './types';
import { QUERY_OP_PATTERN, MUTATION_OP_PATTERN, SUBSCRIPTION_OP_PATTERN } from './constants';

const generateTypeDefinitionStrings = (schemaURL: string): string[] => {
  try{
    const schemaFileData = readFileSync(schemaURL,{
      encoding: "utf-8"
    })
    const typeDefinitionList = schemaFileData.split(/\n(?=type|input|enum)/);
    const cleanedDefinitionList = typeDefinitionList.map( typeDefinition => typeDefinition.trim().replace(/\n/g,""));
    return cleanedDefinitionList;
  }catch(err){
    throw new Error("Failed to generate type definition strings!");
  }
}

const getRootOperationDefinitionStrings = (typeDefinitionStrings: string[]): string[] => {
  const rootOpPattern = new RegExp(`${QUERY_OP_PATTERN}|${MUTATION_OP_PATTERN}|${SUBSCRIPTION_OP_PATTERN}`,'i');         //|\\b${ROOT_OP_NAMES.MUTATION}\\b(?=\s{|\{)|\\b${ROOT_OP_NAMES.SUBSCRIPTION}\\b(?=\s{|\{)`,'i');
  const rootOperationTypeDefinitions = typeDefinitionStrings.filter( typeDefinition => rootOpPattern.test(typeDefinition));
  return rootOperationTypeDefinitions;
}



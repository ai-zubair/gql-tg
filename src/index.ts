import { readFileSync } from 'fs';

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

const generateTypeDefinitionObjects = (typeDefinitionStrings: string[]) => {
  
}

console.log(generateTypeDefinitionStrings("./mockup.schema.graphql"));
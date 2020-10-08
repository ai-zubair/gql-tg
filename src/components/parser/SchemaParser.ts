import { readFileSync } from 'fs';
import { GQLNamedTypeMap, GQLschemaParser } from '../../types';
import { DEF_GEN_PATTERN, DELIM, ROOT_OP_PATTERN, EMPTY_STRING_PATTERN, DELIM_INSERTION_PATTERN, STX_CHARAC_PATTERN, scalarTypeMap } from '../../constants';

class SchemaParser implements GQLschemaParser{

  public parsingDelimiter: string = DELIM;
  public typeDefinitions: string[] = [];
  public rootOperationDefinitions: string[] = [];
  public namedTypeMap: GQLNamedTypeMap = {};
  
  constructor(public schemaURL: string) {
    this.typeDefinitions = this.generateTypeDefinitionStrings(schemaURL);
    this.rootOperationDefinitions = this.getRootOperationDefinitionStrings();
    this.namedTypeMap = this.getNamedTypeMap();
  }

  private generateTypeDefinitionStrings(schemaURL: string): string[]{
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
      const delimInsertionPattern = new RegExp(DELIM_INSERTION_PATTERN,'gi');
      const stxCharacPattern = new RegExp(STX_CHARAC_PATTERN,'gi')
      const cleanedDefinitionList = typeDefinitionList.filter( typeDef => !emptyDefPattern.test(typeDef))
                                                      .map( typeDef => typeDef.replace(delimInsertionPattern,this.parsingDelimiter).replace(stxCharacPattern,''));
      return cleanedDefinitionList;
    }catch(err){
      throw new Error("Failed to generate type definition strings!");
    }
  }

  private getRootOperationDefinitionStrings(): string[]{
    const rootOpPattern = new RegExp(ROOT_OP_PATTERN, 'i');
    const rootOperationTypeDefinitions = this.typeDefinitions.filter( typeDefinition => rootOpPattern.test(typeDefinition));
    return rootOperationTypeDefinitions;
  }
  
  private getNamedTypeMap(): GQLNamedTypeMap{
    const rootOpPattern = new RegExp(ROOT_OP_PATTERN, 'i');
    const nonScalarTypeDefinitions = this.typeDefinitions.filter( typeDefinition => !rootOpPattern.test(typeDefinition));
    const typeMap = {...scalarTypeMap};
    nonScalarTypeDefinitions.forEach( typeDefinition => {
      const typeDefTuple = typeDefinition.split(/::/);
      const nonScalarTypeName = typeDefTuple[0];
      const nonScalarTypeLabel = typeDefTuple[1];
      typeMap[nonScalarTypeLabel] = nonScalarTypeName.toUpperCase();
    })
    return typeMap;
  }
}

export { SchemaParser };
import { readFileSync } from 'fs';
import { TokenizedTypeDefinition } from '../../types';
import { 
  DEF_GEN_PATTERN, 
  ROOT_OP_PATTERN, 
  EMPTY_STRING_PATTERN, 
  DELIM_INSERTION_PATTERN, 
  STX_CHARAC_PATTERN,
  TERMINAL_DELIM_PATTERN
} from '../../patterns';
import {
  DELIM,
  INCORRECT_SCHEMA_FILE_NAME_ERROR,
  INCORRECT_SCHEMA_FILE_PATH_ERROR,
  OUTPUT_STRING_ENCODING,
  SCHEMA_FILE_EXTENSION 
} from '../../constants';
import { GQLschemaTokenizer } from '../parser/Parser';
import { resolve } from 'path';

class Tokenizer implements GQLschemaTokenizer{

  public parsingDelimiter: string = DELIM;
  public typeDefinitions: TokenizedTypeDefinition[] = [];
  public rootOperationDefinitions: TokenizedTypeDefinition[] = [];
  public nonScalarTypeDefinitions: TokenizedTypeDefinition[] = [];
  public schemaPath: string;
  
  constructor(schemaPath: string) {
    this.schemaPath = resolve(process.cwd(),schemaPath);
    this.typeDefinitions = this.tokenizeTypeDefinitions();
    this.rootOperationDefinitions = this.getTokenizedRootOperationDefinitions();
    this.nonScalarTypeDefinitions = this.getNonScalarTypeDefinitions();
  }

  private tokenizeTypeDefinitions(): TokenizedTypeDefinition[]{
    if(!this.schemaPath.endsWith(SCHEMA_FILE_EXTENSION)){
      throw new Error(INCORRECT_SCHEMA_FILE_NAME_ERROR);
    }
    try{
      const schemaFileData = readFileSync(this.schemaPath,{
        encoding: OUTPUT_STRING_ENCODING
      })
      const defGenPattern = new RegExp(DEF_GEN_PATTERN,'i');
      const typeDefinitionList = schemaFileData.split(defGenPattern);
      const emptyDefPattern = new RegExp(EMPTY_STRING_PATTERN);
      const delimInsertionPattern = new RegExp(DELIM_INSERTION_PATTERN,'gi');
      const stxCharacPattern = new RegExp(STX_CHARAC_PATTERN,'gi');
      const terminalDelimPattern = new RegExp(TERMINAL_DELIM_PATTERN);
      const cleanedDefinitionList = typeDefinitionList.filter( typeDef => !emptyDefPattern.test(typeDef))
                                                      .map( typeDef => typeDef.replace(delimInsertionPattern,this.parsingDelimiter)
                                                                              .replace(stxCharacPattern,'')
                                                                              .replace(terminalDelimPattern,''));
      return cleanedDefinitionList;
    }catch(err){
      throw new Error(INCORRECT_SCHEMA_FILE_PATH_ERROR);
    }
  }

  private getTokenizedRootOperationDefinitions(): TokenizedTypeDefinition[]{
    const rootOpPattern = new RegExp(ROOT_OP_PATTERN, 'i');
    const rootOperationTypeDefinitions = this.typeDefinitions.filter( typeDefinition => rootOpPattern.test(typeDefinition));
    return rootOperationTypeDefinitions;
  }
  
  private getNonScalarTypeDefinitions(): TokenizedTypeDefinition[]{
    const rootOpPattern = new RegExp(ROOT_OP_PATTERN, 'i');
    const nonScalarTypeDefinitions = this.typeDefinitions.filter( typeDefinition => !rootOpPattern.test(typeDefinition) );
    return nonScalarTypeDefinitions;
  }

}

export { Tokenizer };
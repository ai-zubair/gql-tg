import { appendFileSync, writeFileSync } from "fs";
import {
  GenericField,
  GenericFieldType,
  GQLExecutionRequest,
  GQLschemaMap,
  GQLschemaParser,
  GQL_NAMED_TYPES,
  NonScalarFieldTranspiler,
  NonScalarType,
  NonScalarTypeField
} from "../../types";

import { 
  TRANSPILED_SCALARS_MAP,
  TRANSPILED_NON_SCALARS_MAP,
  MAPPED_NON_SCALARS,
  INTRO_TEXT,
  ARG_SUFFIX,
  LIST_SUFFIX,
  INDENT_SPACE,
  EXPORT,
  NEW_LINE,
  UNION_BAR
} from '../../constants';

import { CAMEL_CASE_PATTERN, FIRST_LETTER_PATTERN, UNION_BAR_PATTERN } from '../../patterns';
import { Parser } from "../parser/Parser";

class Transpiler {
  private parsedSchema: GQLschemaMap;
  private transpiledNonScalars: Map<NonScalarType, Boolean> = new Map();
  public schemaParser: GQLschemaParser;
  private transpiledSchema: string = INTRO_TEXT;

  constructor(schemaURL: string, customParser?:GQLschemaParser) {
    this.schemaParser = customParser || new Parser(schemaURL);
    this.parsedSchema = this.schemaParser.parsedSchema;
  }

  transpileSchema(){
    for (const rootOperationName in this.parsedSchema.rootOperations) {
      const rootOperation = this.parsedSchema.rootOperations[rootOperationName];
      rootOperation.permittedRequests.forEach((executionRequest: GQLExecutionRequest)=>{
        const transpiledExecutionRequest = this.transpileParsedExecutionRequest(executionRequest, rootOperationName);
        this.writeToTranspiledSchema(transpiledExecutionRequest);
      });
    }
    writeFileSync('./definitions.ts',this.transpiledSchema);
  }

  writeToTranspiledSchema(transpiledDefinition: string){
    if(transpiledDefinition){
      this.transpiledSchema = this.transpiledSchema.concat(transpiledDefinition);
    }
  }

  transpileParsedExecutionRequest(executionRequest: GQLExecutionRequest, rootOperationName: string): string{
    if(executionRequest.requestArgs > 0){
      const transpiledReqArgsLabel = this.joinIntoCamelCase(executionRequest.requestName, rootOperationName, ARG_SUFFIX);
      const transpiledArgList = executionRequest.requestArgDefs.map(this.transpileGenericField);
      const transpiledArgs = transpiledArgList.join('');
      const transpiledArgDef = this.formatIntoTranspiledTypeDefinition(transpiledReqArgsLabel, transpiledArgs, MAPPED_NON_SCALARS.INTERFACE);
      return transpiledArgDef;
    }else{
      return "";
    }
  }

  transpileGenericField = (field: GenericField): string => {
    const { fieldLabel, fieldType } = field;
    const scalarReturnType = fieldType.scalarTypeName;
    const nonScalarReturnType = fieldType.nonScalarTypeName;
    const listWrappingType = fieldType.isList ? LIST_SUFFIX : '';
    const mappedType = scalarReturnType ? `${TRANSPILED_SCALARS_MAP[scalarReturnType]}${listWrappingType}` : `${nonScalarReturnType}${listWrappingType}`;
    if(nonScalarReturnType && !this.isNonScalarTypeTranspiled(nonScalarReturnType)){
      this.transpileParsedNonScalar(nonScalarReturnType);
    }
    return this.formatIntoTranspiledFieldDefinition(fieldLabel, mappedType, fieldType.isOptional);
  }

  transpileParsedExecReqReturn(execReqReturn: GenericFieldType): string{
    return ""
  }

  transpileParsedNonScalar(nonScalarTypeName: string){
    const nonScalarType = this.parsedSchema.nonScalarTypes[nonScalarTypeName];
    const nonScalarFieldTranspiler = this.nonScalarFieldTranspilerFactory(nonScalarType.nativeType);
    const mappedNonScalarType = TRANSPILED_NON_SCALARS_MAP[nonScalarType.nativeType];
    const transpiledFieldList = nonScalarType.typeFields.map(nonScalarFieldTranspiler);
    const terminalBarPattern =  new RegExp(UNION_BAR_PATTERN);
    const transpiledFields = transpiledFieldList.join('').replace(terminalBarPattern,'');
    const transpiledFieldDef = this.formatIntoTranspiledTypeDefinition(nonScalarTypeName, transpiledFields, mappedNonScalarType);
    this.transpiledNonScalars.set(nonScalarType, true);
    return Promise.resolve().then(()=>{
      appendFileSync('./definitions.ts',`${transpiledFieldDef}`)
    });
  }

  nonScalarFieldTranspilerFactory(nativeTypeName: string): NonScalarFieldTranspiler{
    switch(nativeTypeName){
      case GQL_NAMED_TYPES.ENUM:
        return (field: NonScalarTypeField)=>`${INDENT_SPACE}${field.fieldLabel}${NEW_LINE}`;
      case GQL_NAMED_TYPES.UNION:
        return (field: NonScalarTypeField)=>`${INDENT_SPACE}${field.fieldLabel} ${UNION_BAR}`;
      default:
        return this.transpileGenericField;
    }
  }

  isNonScalarTypeTranspiled(nonScalarTypeName: string){
    const nonScalarType = this.parsedSchema.nonScalarTypes[nonScalarTypeName];
    return this.transpiledNonScalars.has(nonScalarType);
  }

  formatIntoTranspiledTypeDefinition(defLabel: string, defTypes: string, typeName: string): string{
    switch(typeName){
      case MAPPED_NON_SCALARS.TYPE:
        return `${NEW_LINE}${EXPORT} ${typeName} ${defLabel} = ${defTypes}`;    
      default:
        return `${NEW_LINE}${EXPORT} ${typeName} ${defLabel}{${NEW_LINE}${defTypes}}${NEW_LINE}`;
    }
  }

  formatIntoTranspiledFieldDefinition(fieldName: string, fieldType: string, isOptional: boolean): string{
    return isOptional ? `${INDENT_SPACE}${fieldName}?: ${fieldType};${NEW_LINE}` : `${INDENT_SPACE}${fieldName}: ${fieldType};${NEW_LINE}`;
  }

  joinIntoCamelCase(...str: string[]): string {
    const titleCasedStrings = str.map((str: string):string => {
      const lowerCasedString = this.hasCamelCasing(str) ? str : str.toLowerCase();
      const firstLetterPattern = new RegExp(FIRST_LETTER_PATTERN);
      const camedlCasedString = lowerCasedString.replace(firstLetterPattern,str[0].toUpperCase());
      return camedlCasedString;
    });
    return titleCasedStrings.join('');
  }

  hasCamelCasing(str: string): boolean{
    const camelCasePattern = new RegExp(CAMEL_CASE_PATTERN);
    return camelCasePattern.test(str);
  }
}

export { Transpiler };
import { writeFileSync } from "fs";
import { performance } from 'perf_hooks';
import { resolve } from 'path';
import {
  ExecRequestArg,
  GenericField,
  GQLExecutionRequest,
  GQLschemaMap,
  GQLschemaParser,
  GQL_NAMED_TYPES,
  NonScalarFieldTranspiler,
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

import { 
  CAMEL_CASE_PATTERN, 
  FIRST_LETTER_PATTERN, 
  UNION_BAR_PATTERN 
} from '../../patterns'

import { Parser } from "../parser/Parser";

class Transpiler {
  private parsedSchema: GQLschemaMap;
  private transpiledSchema: string = INTRO_TEXT;
  public schemaParser: GQLschemaParser;
  private transpiledDefinitions = 0;
  public definitionsPath: string;

  constructor(schemaPath: string = './schema.graphql', definitionsPath: string = './definitions.ts', customParser?:GQLschemaParser) {
    this.schemaParser = customParser || new Parser(schemaPath);
    this.parsedSchema = this.schemaParser.parsedSchema;
    this.definitionsPath = resolve(process.cwd(),definitionsPath);
    if(!this.definitionsPath.endsWith('.ts')){
      throw new Error("Output file must be a TS file.");
    }
  }

  public transpileSchema(){
    const defWritingStart = performance.now();
    for (const rootOperationName in this.parsedSchema.rootOperations) {
      const rootOperation = this.parsedSchema.rootOperations[rootOperationName];
      rootOperation.permittedRequests.forEach((executionRequest: GQLExecutionRequest)=>{
        const transpiledExecutionRequest = this.transpileParsedExecutionRequest(executionRequest, rootOperationName);
        this.writeToTranspiledSchema(transpiledExecutionRequest);
      });
    }
    for (const nonScalarTypeName in this.parsedSchema.nonScalarTypes) {
      const transpiledNonScalar = this.transpileParsedNonScalar(nonScalarTypeName);
      this.writeToTranspiledSchema(transpiledNonScalar);
    }
    const defWritingEnd = performance.now();
    const timeTakenToWriteDefinitions = defWritingEnd - defWritingStart;
    try{
      writeFileSync(this.definitionsPath,this.transpiledSchema);
    }catch(err){
      throw new Error("Invalid Output File Path!");
    }
    process.stdout.write(`[SUCCESS]: ${this.transpiledDefinitions} definitions written to ${this.definitionsPath} in ${(timeTakenToWriteDefinitions).toFixed(2)}ms\n`);
  }

  private writeToTranspiledSchema(transpiledDefinition: string){
    if(transpiledDefinition){
      this.transpiledDefinitions++;
      this.transpiledSchema = this.transpiledSchema.concat(transpiledDefinition);
    }
  }

  private transpileParsedExecutionRequest(executionRequest: GQLExecutionRequest, rootOperationName: string): string{
    if(executionRequest.requestArgs > 0){
      const transpiledReqArgsLabel = this.joinIntoCamelCase(executionRequest.requestName, rootOperationName, ARG_SUFFIX);
      return this.transpileParsedExecReqArg(executionRequest.requestArgDefs, transpiledReqArgsLabel);
    }
  }

  private transpileParsedExecReqArg(execReqArgs: ExecRequestArg[], transpiledReqArgsLabel: string): string{
    const transpiledArgList = execReqArgs.map(this.transpileGenericField);
    const transpiledArgs = transpiledArgList.join('');
    const transpiledArgDef = this.formatIntoTranspiledTypeDefinition(transpiledReqArgsLabel, transpiledArgs, MAPPED_NON_SCALARS.INTERFACE);
    return transpiledArgDef;
  }

  private transpileGenericField = (field: GenericField): string => {
    const { fieldLabel, fieldType } = field;
    const scalarReturnType = fieldType.scalarTypeName;
    const nonScalarReturnType = fieldType.nonScalarTypeName;
    const listWrappingType = fieldType.isList ? LIST_SUFFIX : '';
    const mappedType = scalarReturnType ? `${TRANSPILED_SCALARS_MAP[scalarReturnType]}${listWrappingType}` : `${nonScalarReturnType}${listWrappingType}`;
    return this.formatIntoTranspiledFieldDefinition(fieldLabel, mappedType, fieldType.isOptional);
  }

  private transpileParsedNonScalar(nonScalarTypeName: string){
    const nonScalarType = this.parsedSchema.nonScalarTypes[nonScalarTypeName];
    const nonScalarFieldTranspiler = this.nonScalarFieldTranspilerFactory(nonScalarType.nativeType);
    const mappedNonScalarType = TRANSPILED_NON_SCALARS_MAP[nonScalarType.nativeType];
    const transpiledFieldList = nonScalarType.typeFields.map(nonScalarFieldTranspiler);
    const terminalBarPattern =  new RegExp(UNION_BAR_PATTERN);
    const transpiledFields = transpiledFieldList.join('').replace(terminalBarPattern,'');
    const transpiledFieldDef = this.formatIntoTranspiledTypeDefinition(nonScalarTypeName, transpiledFields, mappedNonScalarType);
    return transpiledFieldDef;
  }

  private nonScalarFieldTranspilerFactory(nativeTypeName: string): NonScalarFieldTranspiler{
    switch(nativeTypeName){
      case GQL_NAMED_TYPES.ENUM:
        return (field: NonScalarTypeField)=>`${INDENT_SPACE}${field.fieldLabel} = \'${field.fieldLabel}\',${NEW_LINE}`;
      case GQL_NAMED_TYPES.UNION:
        return (field: NonScalarTypeField)=>`${INDENT_SPACE}${field.fieldLabel} ${UNION_BAR}`;
      default:
        return this.transpileGenericField;
    }
  }

  private formatIntoTranspiledTypeDefinition(defLabel: string, defTypes: string, typeName: string): string{
    switch(typeName){
      case MAPPED_NON_SCALARS.TYPE:
        return `${NEW_LINE}${EXPORT} ${typeName} ${defLabel} = ${defTypes};${NEW_LINE}`;    
      default:
        return `${NEW_LINE}${EXPORT} ${typeName} ${defLabel}{${NEW_LINE}${defTypes}}${NEW_LINE}`;
    }
  }

  private formatIntoTranspiledFieldDefinition(fieldName: string, fieldType: string, isOptional: boolean): string{
    return isOptional ? `${INDENT_SPACE}${fieldName}?: ${fieldType};${NEW_LINE}` : `${INDENT_SPACE}${fieldName}: ${fieldType};${NEW_LINE}`;
  }

  private joinIntoCamelCase(...str: string[]): string {
    const titleCasedStrings = str.map((str: string):string => {
      const lowerCasedString = this.hasCamelCasing(str) ? str : str.toLowerCase();
      const firstLetterPattern = new RegExp(FIRST_LETTER_PATTERN);
      const camedlCasedString = lowerCasedString.replace(firstLetterPattern,str[0].toUpperCase());
      return camedlCasedString;
    });
    return titleCasedStrings.join('');
  }

  private hasCamelCasing(str: string): boolean{
    const camelCasePattern = new RegExp(CAMEL_CASE_PATTERN);
    return camelCasePattern.test(str);
  }
}

export { Transpiler };
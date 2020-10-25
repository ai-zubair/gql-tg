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
  NEW_LINE,
  UNION_BAR,
  INCORRECT_OUTPUT_FILE_NAME_ERROR,
  DEF_FILE_EXTENSION,
  DEFAULT_SCHEMA_PATH,
  DEFAULT_DEFINITIONS_PATH,
  INCORRECT_OUTPUT_FILE_PATH_ERROR
} from '../../constants';

import { 
  UNION_BAR_PATTERN 
} from '../../patterns'

import { 
  formatIntoTranspiledTypeDefinition,
  formatIntoTranspiledFieldDefinition,
  joinIntoCamelCase
} from './utils';

import { Parser } from "../parser/Parser";

class Transpiler {
  private parsedSchema: GQLschemaMap;
  private transpiledSchema: string = INTRO_TEXT;
  public schemaParser: GQLschemaParser;
  private transpiledDefinitions = 0;
  public definitionsPath: string;

  constructor(schemaPath: string = DEFAULT_SCHEMA_PATH, definitionsPath: string = DEFAULT_DEFINITIONS_PATH, customParser?:GQLschemaParser) {
    this.schemaParser = customParser || new Parser(schemaPath);
    this.parsedSchema = this.schemaParser.parsedSchema;
    this.definitionsPath = resolve(process.cwd(),definitionsPath);
    if(!this.definitionsPath.endsWith(DEF_FILE_EXTENSION)){
      throw new Error(INCORRECT_OUTPUT_FILE_NAME_ERROR);
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
      throw new Error(INCORRECT_OUTPUT_FILE_PATH_ERROR);
    }
    process.stdout.write(`\x1b[32m[Success]: ${this.transpiledDefinitions} definitions written to ${this.definitionsPath} in ${(timeTakenToWriteDefinitions).toFixed(2)}ms\n\x1b[37m`);
  }

  private writeToTranspiledSchema(transpiledDefinition: string){
    if(transpiledDefinition){
      this.transpiledDefinitions++;
      this.transpiledSchema = this.transpiledSchema.concat(transpiledDefinition);
    }
  }

  private transpileParsedExecutionRequest(executionRequest: GQLExecutionRequest, rootOperationName: string): string{
    if(executionRequest.requestArgs > 0){
      const transpiledReqArgsLabel = joinIntoCamelCase(executionRequest.requestName, rootOperationName, ARG_SUFFIX);
      return this.transpileParsedExecReqArg(executionRequest.requestArgDefs, transpiledReqArgsLabel);
    }
  }

  private transpileParsedExecReqArg(execReqArgs: ExecRequestArg[], transpiledReqArgsLabel: string): string{
    const transpiledArgList = execReqArgs.map(this.transpileGenericField);
    const transpiledArgs = transpiledArgList.join('');
    const transpiledArgDef = formatIntoTranspiledTypeDefinition(transpiledReqArgsLabel, transpiledArgs, MAPPED_NON_SCALARS.INTERFACE);
    return transpiledArgDef;
  }

  private transpileGenericField = (field: GenericField): string => {
    const { fieldLabel, fieldType } = field;
    const scalarReturnType = fieldType.scalarTypeName;
    const nonScalarReturnType = fieldType.nonScalarTypeName;
    const listWrappingType = fieldType.isList ? LIST_SUFFIX : '';
    const mappedType = scalarReturnType ? `${TRANSPILED_SCALARS_MAP[scalarReturnType]}${listWrappingType}` : `${nonScalarReturnType}${listWrappingType}`;
    return formatIntoTranspiledFieldDefinition(fieldLabel, mappedType, fieldType.isOptional);
  }

  private transpileParsedNonScalar(nonScalarTypeName: string){
    const nonScalarType = this.parsedSchema.nonScalarTypes[nonScalarTypeName];
    const nonScalarFieldTranspiler = this.nonScalarFieldTranspilerFactory(nonScalarType.nativeType);
    const mappedNonScalarType = TRANSPILED_NON_SCALARS_MAP[nonScalarType.nativeType];
    const transpiledFieldList = nonScalarType.typeFields.map(nonScalarFieldTranspiler);
    const terminalBarPattern =  new RegExp(UNION_BAR_PATTERN);
    const transpiledFields = transpiledFieldList.join('').replace(terminalBarPattern,'');
    const transpiledFieldDef = formatIntoTranspiledTypeDefinition(nonScalarTypeName, transpiledFields, mappedNonScalarType);
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
}

export { Transpiler };
import { appendFileSync, writeFileSync } from "fs";
import { 
  ExecRequestArg,
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
  transpiledScalarsMap,
  transpiledNonScalarsMap,
  MappedNonScalars
} from '../../constants';
import { Parser } from "../parser/Parser";

class Transpiler {
  private parsedSchema: GQLschemaMap;
  private transpiledNonScalars: Map<NonScalarType, Boolean> = new Map();
  public schemaParser: GQLschemaParser;
  private transpiledSchema: string = `/* Auto-Generated Typed Defintions via GQL-TYPE-GEN @ ${new Date()}*/`;

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
      const transpiledReqArgsLabel = this.joinIntoCamelCase(executionRequest.requestName, rootOperationName, "ARGS");
      const transpiledArgList = executionRequest.requestArgDefs.map(this.transpileGenericField);
      const transpiledArgs = transpiledArgList.join('');
      const transpiledArgDef = this.formatIntoTranspiledTypeDefinition(transpiledReqArgsLabel, transpiledArgs, MappedNonScalars.INTERFACE);
      return transpiledArgDef;
    }else{
      return "";
    }
  }

  transpileGenericField = (field: GenericField): string => {
    const { fieldLabel, fieldType } = field;
    const scalarReturnType = fieldType.scalarTypeName;
    const nonScalarReturnType = fieldType.nonScalarTypeName;
    const listWrappingType = fieldType.isList ? '[]' : '';
    const mappedType = scalarReturnType ? `${transpiledScalarsMap[scalarReturnType]}${listWrappingType}` : `${nonScalarReturnType}${listWrappingType}`;
    if(nonScalarReturnType && !this.isNonScalarTypeTranspiled(nonScalarReturnType)){
      this.transpileParsedNonScalar(nonScalarReturnType);
    }
    return this.formatIntoTranspiledFieldDefinition(fieldLabel, mappedType, fieldType.isOptional);
  }

  transpileParsedExecReqReturn(execReqReturn: GenericFieldType): string{
    return "";
  }

  transpileParsedNonScalar(nonScalarTypeName: string){
    const nonScalarType = this.parsedSchema.nonScalarTypes[nonScalarTypeName];
    const nonScalarFieldTranspiler = this.nonScalarFieldTranspilerFactory(nonScalarType.nativeType);
    const mappedNonScalarType = transpiledNonScalarsMap[nonScalarType.nativeType];
    const transpiledFieldList = nonScalarType.typeFields.map(nonScalarFieldTranspiler);
    const transpiledFields = transpiledFieldList.join('').replace(/\|$/,'');
    const transpiledFieldDef = this.formatIntoTranspiledTypeDefinition(nonScalarTypeName, transpiledFields, mappedNonScalarType);
    this.transpiledNonScalars.set(nonScalarType, true);
    return Promise.resolve().then(()=>{
      appendFileSync('./definitions.ts',`${transpiledFieldDef}`)
    });
  }

  nonScalarFieldTranspilerFactory(nativeTypeName: string): NonScalarFieldTranspiler{
    switch(nativeTypeName){
      case GQL_NAMED_TYPES.ENUM:
        return (field: NonScalarTypeField)=>`  ${field.fieldLabel}\n`;
      case GQL_NAMED_TYPES.UNION:
        return (field: NonScalarTypeField)=>`  ${field.fieldLabel} |`;
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
      case MappedNonScalars.TYPE:
        return `\nexport ${typeName} ${defLabel} = ${defTypes}`;    
      default:
        return `\nexport ${typeName} ${defLabel}{\n${defTypes}}\n`;
    }
  }

  formatIntoTranspiledFieldDefinition(fieldName: string, fieldType: string, isOptional: boolean): string{
    return isOptional ? `  ${fieldName}?: ${fieldType};\n` : `  ${fieldName}: ${fieldType};\n`;
  }

  joinIntoCamelCase(...str: string[]): string {
    const titleCasedStrings = str.map((str: string):string => {
      const lowerCasedString = this.hasCamelCasing(str) ? str : str.toLowerCase();
      const camedlCasedString = lowerCasedString.replace(/^\w/,str[0].toUpperCase());
      return camedlCasedString;
    });
    return titleCasedStrings.join('');
  }

  hasCamelCasing(str: string): boolean{
    const camelCasePattern = new RegExp('(?<=[a-z])[A-Z]');
    return camelCasePattern.test(str);
  }
}

export { Transpiler };
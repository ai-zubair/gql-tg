import { appendFileSync, writeFileSync } from "fs";
import { 
  ExecRequestArg,
  GenericFieldType,
  GQLExecutionRequest,
  GQLschemaMap,
  GQLschemaParser,
  GQL_NAMED_TYPES,
  NonScalarType,
  NonScalarTypeField,
  NonScalarTypeMap
} from "../../types";
import { transpiledScalarsMap } from '../../constants';
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
      const transpiledArgList = executionRequest.requestArgDefs.map(this.transpileParsedExecReqArgument);
      const transpiledArgs = transpiledArgList.join('');
      const transpiledArgDef = this.formatIntoTranspiledTypeDefinition(transpiledReqArgsLabel, transpiledArgs, "INTERFACE");
      return transpiledArgDef;
    }else{
      return "";
    }
  }

  transpileParsedExecReqArgument = (execReqArg: ExecRequestArg): string =>{
    const nonScalarTypeName = execReqArg.fieldType.nonScalarTypeName;
    const scalarTypeName = execReqArg.fieldType.scalarTypeName;
    const mappedType = scalarTypeName ? transpiledScalarsMap[scalarTypeName] : nonScalarTypeName;
    if(nonScalarTypeName && !this.isNonScalarTypeTranspiled(nonScalarTypeName)){
      this.transpileParsedNonScalar(nonScalarTypeName);
    }
    return this.formatIntoTranspiledFieldDefinition(execReqArg.fieldLabel, mappedType, execReqArg.fieldType.isOptional);

  }

  transpileParsedExecReqReturn(execReqReturn: GenericFieldType): string{
    return "";
  }

  transpileParsedNonScalar(nonScalarTypeName: string){
    const nonScalarType = this.parsedSchema.nonScalarTypes[nonScalarTypeName];
    const isEnumType = nonScalarType.typeName === GQL_NAMED_TYPES.ENUM; 
    const isUnionType = nonScalarType.typeName === GQL_NAMED_TYPES.UNION;
    if(isEnumType){
      const transpiledEnteryList = nonScalarType.typeFields.map( field => `  ${field.fieldLabel}\n`);
      const transpiledEntries = transpiledEnteryList.join('');
      const transpiledEnteryDef = this.formatIntoTranspiledTypeDefinition(nonScalarTypeName, transpiledEntries, "ENUM");
      return Promise.resolve(1).then(()=>{
        appendFileSync('./definitions.ts',`${transpiledEnteryDef}`)
      });
    }
    if(isUnionType){
      const transpiledUnionList = nonScalarType.typeFields.map( field => ` ${field.fieldLabel} |`);
      const transpiledUnion = transpiledUnionList.join('').replace(/\|$/,'');
      const transpiledEnteryDef = this.formatIntoTranspiledTypeDefinition(nonScalarTypeName, transpiledUnion, "UNION");
      return Promise.resolve(1).then(()=>{
        appendFileSync('./definitions.ts',`${transpiledEnteryDef}`)
      });
    }else{
      const transpiledFieldList = nonScalarType.typeFields.map(this.transpileNonScalarField);
      const transpiledFields = transpiledFieldList.join('');
      const transpiledFieldDef = this.formatIntoTranspiledTypeDefinition(nonScalarTypeName, transpiledFields, "INTERFACE");
      this.transpiledNonScalars.set(nonScalarType, true);
      return Promise.resolve(1).then(()=>{
        appendFileSync('./definitions.ts',`${transpiledFieldDef}`)
      });
    }
  }

  transpileNonScalarField = (field: NonScalarTypeField): string => {
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

  isNonScalarTypeTranspiled(nonScalarTypeName: string){
    const nonScalarType = this.parsedSchema.nonScalarTypes[nonScalarTypeName];
    return this.transpiledNonScalars.has(nonScalarType);
  }

  formatIntoTranspiledTypeDefinition(defLabel: string, defTypes: string, typeName: string): string{
    switch(typeName){
      case "INTERFACE":
        return `\nexport ${typeName.toLowerCase()} ${defLabel}{\n${defTypes}}\n`;
      case "ENUM":
        return `\nexport ${typeName.toLowerCase()} ${defLabel}{\n${defTypes}}\n`;
      case "UNION":
        return `\nexport type ${defLabel} = ${defTypes}`;    
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
import { appendFileSync, writeFileSync } from "fs";
import { ExecutionRequestArg, ExecutionRequestReturn, GQLExecutionRequest, GQLschemaMap, GQLschemaParser, GQL_NAMED_TYPES, NonScalarType } from "../../types";
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
    // writeFileSync('./definitions.ts',this.transpiledSchema);
  }

  writeToTranspiledSchema(transpiledDefinition: string){
    if(transpiledDefinition){
      this.transpiledSchema.concat(transpiledDefinition);
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

  transpileParsedExecReqArgument(execReqArg: ExecutionRequestArg): string{
    const nonScalarTypeName = execReqArg.nonScalarTypeName;
    const scalarTypeName = execReqArg.scalarTypeName;
    const mappedType = scalarTypeName ? transpiledScalarsMap[scalarTypeName] : nonScalarTypeName;
    if(nonScalarTypeName && !this.isNonScalarTypeTranspiled(nonScalarTypeName)){
      this.transpileParsedNonScalar(nonScalarTypeName);
    }
    return this.formatIntoTranspiledFieldDefinition(execReqArg.argName, mappedType, execReqArg.isOptional);

  }

  transpileParsedExecReqReturn(execReqReturn: ExecutionRequestReturn): string{
    return "";
  }

  transpileParsedNonScalar(nonScalarTypeName: string){
    const nonScalarType = this.parsedSchema.nonScalarTypes[nonScalarTypeName];
    const isUnionOrEnumType = nonScalarType.typeName === GQL_NAMED_TYPES.ENUM || nonScalarType.typeName === GQL_NAMED_TYPES.UNION;
    let fieldDefinitions = '';
    if(isUnionOrEnumType){
      //handle accordingly
    }else{
      nonScalarType.typeFields.forEach( field =>{
        if(field.fieldReturn.scalarTypeName){
          fieldDefinitions += field.fieldReturn.isOptional ?  `  ${field.fieldLabel}?: ${transpiledScalarsMap[field.fieldReturn.scalarTypeName]};\n` : `  ${field.fieldLabel}: ${transpiledScalarsMap[field.fieldReturn.scalarTypeName]};\n`;

        }else{
          fieldDefinitions += field.fieldReturn.isOptional ?  `  ${field.fieldLabel}?: ${field.fieldReturn.nonScalarTypeName};\n` : `  ${field.fieldLabel}: ${field.fieldReturn.nonScalarTypeName};\n`;
          const nonScalarType = this.parsedSchema.nonScalarTypes[field.fieldReturn.nonScalarTypeName];
          const isNonScalarTypeDecompiled = this.transpiledNonScalars.has(nonScalarType);
          isNonScalarTypeDecompiled ? null : this.transpileParsedNonScalar(nonScalarType);
        }
      });
    }
    this.transpiledNonScalars.set(nonScalarType, true);
    Promise.resolve(1).then(()=>{
      // appendFileSync('./definitions.ts',`\n export interface ${nonScalarType.typeLabel}{\n${fieldDefinitions}}`)
    });
  }

  isNonScalarTypeTranspiled(nonScalarTypeName: string){
    const nonScalarType = this.parsedSchema.nonScalarTypes[nonScalarTypeName];
    return this.transpiledNonScalars.has(nonScalarType);
  }

  formatIntoTranspiledTypeDefinition(defLabel: string, defTypes: string, typeName: string): string{
    return `\nexport ${typeName.toLowerCase()} ${defLabel}{\n${defTypes}}\n`;
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
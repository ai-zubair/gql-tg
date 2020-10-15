import { appendFileSync, fstat, writeFileSync } from "fs";
import { ExecutionRequestArg, ExecutionRequestReturn, GQLExecutionRequest, GQLschemaMap, GQLschemaParser, GQL_NAMED_TYPES, NonScalarType } from "../../types";
import { decompilationScalarTypeMap } from '../../constants';
import { Parser } from "../parser/Parser";
import { exec } from "child_process";

class Decompiler {
  private parsedSchema: GQLschemaMap;
  private decompiledNonScalarTypes: Map<NonScalarType, Boolean> = new Map();
  public schemaParser: GQLschemaParser;
  private decompiledSchema: string = `/* Auto-Generated Typed Defintions via GQL-TYPE-GEN @ ${new Date()}*/`;
  private decompiledNonScalars: string = '';

  constructor(schemaURL: string, customParser?:GQLschemaParser) {
    this.schemaParser = customParser || new Parser(schemaURL);
    this.parsedSchema = this.schemaParser.parsedSchema;
  }

  decompileSchema(){
    for (const rootOperationName in this.parsedSchema.rootOperations) {
      const rootOperation = this.parsedSchema.rootOperations[rootOperationName];
      rootOperation.permittedRequests.forEach((executionRequest: GQLExecutionRequest)=>{
        this.decompiledSchema += this.decompileExecutionRequest(executionRequest, rootOperationName);
      });
    }
    writeFileSync('./definitions.ts',this.decompiledSchema+this.decompiledNonScalars);
  }

  decompileExecutionRequest(executionRequest: GQLExecutionRequest, rootOperationName: string): string{
    if(executionRequest.requestArgs > 0){
      const execReqArgLabel = this.joinIntoCamelCase(executionRequest.requestName, rootOperationName.toLowerCase(), "args");
      let decompiledArgTypes = ``;
      executionRequest.requestArgDefs.forEach((requestArg: ExecutionRequestArg) =>{
        decompiledArgTypes += this.decompileExecReqArgument(requestArg);
      })
      const decompiledExecReqArgs = this.formatIntoTypeDefinitionString(execReqArgLabel, decompiledArgTypes, "interface");
      return decompiledExecReqArgs;
    }
  }

  decompileExecReqArgument(execReqArg: ExecutionRequestArg): string{
    let mappedType: string;
    if(execReqArg.scalarTypeName){
      mappedType = decompilationScalarTypeMap[execReqArg.scalarTypeName];
    }else{
      mappedType = execReqArg.nonScalarTypeName;
      const nonScalarType = this.parsedSchema.nonScalarTypes[mappedType];
      const isNonScalarTypeDecompiled = this.decompiledNonScalarTypes.has(nonScalarType);
      isNonScalarTypeDecompiled ? null : this.decompileNonScalarType(nonScalarType);
    }
    return execReqArg.isOptional ? `  ${execReqArg.argName}?: ${mappedType};\n` : `  ${execReqArg.argName}: ${mappedType};\n`;

  }

  decompileExecReqReturn(execReqReturn: ExecutionRequestReturn): string{
    return "";
  }

  decompileNonScalarType(nonScalarType: NonScalarType){
    const isUnionOrEnumType = nonScalarType.typeName === GQL_NAMED_TYPES.ENUM || nonScalarType.typeName === GQL_NAMED_TYPES.UNION;
    let fieldDefinitions = '';
    if(isUnionOrEnumType){
      //handle accordingly
    }else{
      nonScalarType.typeFields.forEach( field =>{
        if(field.fieldReturn.scalarTypeName){
          fieldDefinitions += field.fieldReturn.isOptional ?  `  ${field.fieldLabel}?: ${decompilationScalarTypeMap[field.fieldReturn.scalarTypeName]};\n` : `  ${field.fieldLabel}: ${decompilationScalarTypeMap[field.fieldReturn.scalarTypeName]};\n`;

        }else{
          fieldDefinitions += field.fieldReturn.isOptional ?  `  ${field.fieldLabel}?: ${field.fieldReturn.nonScalarTypeName};\n` : `  ${field.fieldLabel}: ${field.fieldReturn.nonScalarTypeName};\n`;
          const nonScalarType = this.parsedSchema.nonScalarTypes[field.fieldReturn.nonScalarTypeName];
          const isNonScalarTypeDecompiled = this.decompiledNonScalarTypes.has(nonScalarType);
          isNonScalarTypeDecompiled ? null : this.decompileNonScalarType(nonScalarType);
        }
      });
    }
    this.decompiledNonScalarTypes.set(nonScalarType, true);
    Promise.resolve(1).then(()=>{
      appendFileSync('./definitions.ts',`\n export interface ${nonScalarType.typeLabel}{\n${fieldDefinitions}}`)
    });
  }

  formatIntoTypeDefinitionString(defLabel: string, defTypes: string, typeName: string): string{
    return `\nexport ${typeName} ${defLabel}{\n${defTypes}}\n`;
  }

  joinIntoCamelCase(...str: string[]): string {
    const titleCasedStrings = str.map( str => str.replace(/^\w/,str[0].toUpperCase()));
    return titleCasedStrings.join('');
  }
}

export { Decompiler };
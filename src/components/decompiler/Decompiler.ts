import { writeFileSync } from "fs";
import { ExecutionRequestArg, ExecutionRequestReturn, GQLExecutionRequest, GQLschemaMap, GQLschemaParser } from "../../types";
import { decompilationScalarTypeMap } from '../../constants';
import { Parser } from "../parser/Parser";
import { exec } from "child_process";

class Decompiler {
  public schemaParser: GQLschemaParser;
  private parsedSchema: GQLschemaMap;

  constructor(schemaURL: string, customParser?:GQLschemaParser) {
    this.schemaParser = customParser || new Parser(schemaURL);
    this.parsedSchema = this.schemaParser.parsedSchema;
  }

  decompileSchema(){
    let decompiledSchema = "/* Auto-Generated Typed Defintions via GQL-TYPE-GEN */";
    for (const rootOperationName in this.parsedSchema.rootOperations) {
      const rootOperation = this.parsedSchema.rootOperations[rootOperationName];
      rootOperation.permittedRequests.forEach((executionRequest: GQLExecutionRequest)=>{
        decompiledSchema += this.decompileExecutionRequest(executionRequest, rootOperationName);
      });
    }
    writeFileSync('./definitions.ts',decompiledSchema);
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
    const mappedType = execReqArg.scalarTypeName ? decompilationScalarTypeMap[execReqArg.scalarTypeName] : execReqArg.nonScalarTypeName;
    return execReqArg.isOptional ? `  ${execReqArg.argName}?: ${mappedType};\n` : `  ${execReqArg.argName}: ${mappedType};\n`;

  }

  decompileExecReqReturn(execReqReturn: ExecutionRequestReturn): string{
    return "";
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
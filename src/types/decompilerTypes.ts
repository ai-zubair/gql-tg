import { ROOT_OP_NAMES, GQL_NAMED_TYPES, GQL_INPUT_TYPES, GQL_OUTPUT_TYPES } from './gqlTypes';

export interface GQLRootOperationMap {
  [ROOT_OP_NAMES.QUERY]?: GQLRootOperation;
  [ROOT_OP_NAMES.MUTATION]?: GQLRootOperation;
  [ROOT_OP_NAMES.SUBSCRIPTION]?: GQLRootOperation;
  [key: string]: GQLRootOperation | undefined;
}

export interface GQLRootOperation {
  rootOperationName: ROOT_OP_NAMES;
  permittedRequests: GQLExecutionRequest[]
}

export interface GQLExecutionRequest{
  requestName: string;
  requestArgs: number;
  requestArgDefs: ExecutionRequestArg[]
  requestReturn: ExecutionRequestReturn
}

export interface ExecutionRequestArg {
  argName: string;
  argType: GQL_INPUT_TYPES;
  scalarTypeName?: string;
  nonScalarTypeName?: string;
  isOptional: boolean;
}

export interface ExecutionRequestReturn {
  returnType: GQL_OUTPUT_TYPES;
  scalarTypeName?: string;
  nonScalarTypeName?: string;
  isOptional: boolean;
  isList: boolean;
  isListValueOptional?: boolean; 
}

export interface NonScalarTypeMap {
  [nonScalarTypeLabel: string]: NonScalarType;
}

export interface NonScalarType {
  typeName: GQL_NAMED_TYPES;
  typeLabel: string;
  typeFields?: NonScalarTypeField[]
}

export interface NonScalarTypeField {
  fieldLabel: string;
  fieldReturn?: NonScalarFieldReturn ;
}

export interface NonScalarFieldReturn extends ExecutionRequestReturn{
 
}

export interface GQLschemaMap {
  rootOperations: GQLRootOperationMap;
  nonScalarTypes: NonScalarTypeMap;
}

export interface GQLschemaParser{
  parsedSchema: GQLschemaMap;
}
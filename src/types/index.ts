export enum ROOT_OP_NAMES {
  QUERY = "QUERY",
  MUTATION = "MUTATION",
  SUBSCRIPTION = "SUBSCRIPTION"
}

export enum GQL_NAMED_TYPES {
  SCALAR = "SCALAR",
  ENUM = "ENUM",
  OBJECT = "OBJECT",
  INPUT = "INPUT",
  INTERFACE = "INTERFACE",
  UNION = "UNION"
}

export enum GQL_INPUT_TYPES {
  SCALAR = "SCALAR",
  ENUM = "ENUM",
  INPUT = "INPUT"
}

export enum GQL_OUTPUT_TYPES {
  SCALAR = "SCALAR",
  ENUM = "ENUM",
  OBJECT = "OBJECT",
}

export enum GQL_WRAPPER_TYPES {
  LIST = "LIST",
  NON_NULL = "NON_NULL"
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
  isOptional: boolean;
}

export interface ExecutionRequestReturn {
  type: GQL_OUTPUT_TYPES;
  isOptional: boolean;
  isList: boolean;
  isListValueOptioal: boolean; 
}
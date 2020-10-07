export enum ROOT_OP_NAMES {
  QUERY = "QUERY",
  MUTATION = "MUTATION",
  SUBSCRIPTION = "SUBSCRIPTION"
}

export enum GQL_NAMED_TYPES {
  SCALAR = "SCALAR",
  ENUM = "ENUM",
  OBJECT_TYPE = "TYPE",
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

export interface GQLRootOperationTupleMap {
  [ROOT_OP_NAMES.QUERY]: string[] | undefined;
  [ROOT_OP_NAMES.MUTATION]: string[] | undefined;
  [ROOT_OP_NAMES.SUBSCRIPTION]: string[] | undefined;
  [key: string]: string[] | undefined;
}

export interface GQLRootOperationMap {
  [ROOT_OP_NAMES.QUERY]: GQLRootOperation |  undefined;
  [ROOT_OP_NAMES.MUTATION]: GQLRootOperation | undefined;
  [ROOT_OP_NAMES.SUBSCRIPTION]: GQLRootOperation | undefined;
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

export type ArgTuple = [string, string];

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

export interface GQLNamedTypeMap{
  [GQLtypeLabel: string]: GQL_NAMED_TYPES | GQL_INPUT_TYPES | GQL_OUTPUT_TYPES;
}
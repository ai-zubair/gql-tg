import { ROOT_OP_NAMES, GQL_INPUT_TYPES, GQL_OUTPUT_TYPES } from './gqlTypes';

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
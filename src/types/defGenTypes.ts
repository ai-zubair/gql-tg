import { ROOT_OP_NAMES, GQL_INPUT_TYPES, GQL_OUTPUT_TYPES, GQL_NAMED_TYPES } from './gqlTypes';

/**
 * @type ExecutionRequestSignature =>
 * GQL execution request(operation) stringified in the same form as 
 * 'operationName(operationArg1: ArgType1!, operationArg2: ArgType2)'
 */
export type ERsignature = string;

/**
 * @type OperationArguement =>
 * GQL operation arguement stringified in the same form as 'GQLoperationArgumentLabel:Type!'
 */
export type ERargumentDefinition = string;

/**
 * @type OperationReturnDefinition
 * GQL operation return type stringified in the same form as '[GQLoperationReturnType!]!'
 */
export type ERreturnDefinition = string;

/**
 * @type ExecutionRequestDefinition =>
 * Tuple representing the stringified version of a GQL operation as
 * [operationSignature: ERsignature, operationReturn: ERreturnDefinition]
 */
export type ExecutionRequestDefinition = [ERsignature, ERreturnDefinition];

/**
 * @type RootOperationTuple
 * Tuple containing the stringified versions of GQL operations available under the specified root operation besides the root operation
 * label and root operation type.
 * e.g. A RootOperationTuple for the Query Op may look like ['type', 'Query', 'posts(keyword:String):[Posts!]!' , 'comments:[Comments!]!']
 */
export type RootOperationTuple = string[];

export interface GQLRootOperationTupleMap {
  [ROOT_OP_NAMES.QUERY]: RootOperationTuple | undefined;
  [ROOT_OP_NAMES.MUTATION]: RootOperationTuple | undefined;
  [ROOT_OP_NAMES.SUBSCRIPTION]: RootOperationTuple | undefined;
  [key: string]: RootOperationTuple | undefined;
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
  fieldReturn: NonScalarFieldReturn | undefined;
}

export interface NonScalarFieldReturn extends ExecutionRequestReturn{
 
}
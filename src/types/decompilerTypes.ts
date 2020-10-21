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
  requestArgDefs: ExecRequestArg[];
  requestReturn: ExecRequestReturn;
}

export interface ExecRequestArg extends GenericField{

}

export interface ExecRequestReturn extends GenericFieldType{

}

export interface GenericField{
  fieldLabel: string;
  fieldType: GenericFieldType;
}

export interface GenericFieldType{
  nativeType: GQL_INPUT_TYPES | GQL_OUTPUT_TYPES | GQL_NAMED_TYPES;
  scalarTypeName?: string;
  nonScalarTypeName?: string;
  isOptional: boolean;
  isList?: boolean;
  isListValueOptional?: boolean; 
}

export interface NonScalarTypeMap {
  [nonScalarTypeLabel: string]: NonScalarType;
}

export interface NonScalarType {
  nativeType: GQL_NAMED_TYPES;
  typeLabel: string;
  typeFields?: NonScalarTypeField[]
}

export interface NonScalarTypeField extends GenericField{

}

export interface GQLschemaMap {
  rootOperations: GQLRootOperationMap;
  nonScalarTypes: NonScalarTypeMap;
}

export interface GQLschemaParser{
  parsedSchema: GQLschemaMap;
}

export interface NonScalarFieldTranspiler{
  (field: NonScalarTypeField): string;
}
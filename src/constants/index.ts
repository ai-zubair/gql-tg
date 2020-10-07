import { GQL_INPUT_TYPES, GQL_NAMED_TYPES, ROOT_OP_NAMES } from '../types/index';
export * from './patterns';

export const DELIM = '::';

export const scalarTypeMap = {
  "String": GQL_NAMED_TYPES.SCALAR, 
  "ID": GQL_NAMED_TYPES.SCALAR, 
  "Int": GQL_NAMED_TYPES.SCALAR, 
  "Float": GQL_NAMED_TYPES.SCALAR, 
  "Boolean": GQL_NAMED_TYPES.SCALAR, 
}
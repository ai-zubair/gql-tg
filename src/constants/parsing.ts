import { GQL_NAMED_TYPES } from '../types';

export const DELIM = '::';

export const scalarTypeMap = {
  "String": GQL_NAMED_TYPES.SCALAR, 
  "ID": GQL_NAMED_TYPES.SCALAR, 
  "Int": GQL_NAMED_TYPES.SCALAR, 
  "Float": GQL_NAMED_TYPES.SCALAR, 
  "Boolean": GQL_NAMED_TYPES.SCALAR, 
}
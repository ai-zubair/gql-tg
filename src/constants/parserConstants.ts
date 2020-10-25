import { GQL_NAMED_TYPES } from '../types';

export const SCALAR_TYPE_MAP = {
  "String": GQL_NAMED_TYPES.SCALAR, 
  "ID": GQL_NAMED_TYPES.SCALAR, 
  "Int": GQL_NAMED_TYPES.SCALAR, 
  "Float": GQL_NAMED_TYPES.SCALAR, 
  "Boolean": GQL_NAMED_TYPES.SCALAR, 
}

export const FIELD_SEPARATOR = ':';

export const LIST_WRAPPING_TYPE = "!";

export const NO_TYPE_DEFINITIONS_FOUND_ERROR = "\x1b[31m[Error]: No type defintions found in the schema file!\x1b[37m";
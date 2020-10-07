import { GQL_INPUT_TYPES, ROOT_OP_NAMES } from '../types/index';
export * from './patterns';

export const DELIM = '::';

export const typeMap = {
  "STRING": GQL_INPUT_TYPES.SCALAR, 
  "ID": GQL_INPUT_TYPES.SCALAR, 
  "INT": GQL_INPUT_TYPES.SCALAR, 
  "FLOAT": GQL_INPUT_TYPES.SCALAR, 
  "BOOLEAN": GQL_INPUT_TYPES.SCALAR, 
}
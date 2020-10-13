import { GQL_SCALAR_TYPES } from '../types';

export const decompilationScalarTypeMap = {
  [GQL_SCALAR_TYPES.INT] : 'number',
  [GQL_SCALAR_TYPES.FLOAT]: 'number',
  [GQL_SCALAR_TYPES.STRING]: 'string',
  [GQL_SCALAR_TYPES.ID]: 'string',
  [GQL_SCALAR_TYPES.BOOLEAN]: 'boolean'
}
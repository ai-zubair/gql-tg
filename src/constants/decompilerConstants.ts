import { GQL_NAMED_TYPES, GQL_SCALAR_TYPES } from '../types';

export const transpiledScalarsMap = {
  [GQL_SCALAR_TYPES.INT]: 'number',
  [GQL_SCALAR_TYPES.FLOAT]: 'number',
  [GQL_SCALAR_TYPES.STRING]: 'string',
  [GQL_SCALAR_TYPES.ID]: 'string',
  [GQL_SCALAR_TYPES.BOOLEAN]: 'boolean'
}

export const transpiledNonScalarsMap = {
  [GQL_NAMED_TYPES.ENUM]: 'enum',
  [GQL_NAMED_TYPES.INPUT]: 'interface',
  [GQL_NAMED_TYPES.INTERFACE]: 'interface',
  [GQL_NAMED_TYPES.OBJECT_TYPE]: 'interface',
  [GQL_NAMED_TYPES.UNION]: 'type'
}

export enum MappedNonScalars {
  ENUM = 'enum',
  INTERFACE = 'interface',
  TYPE = 'type'
}
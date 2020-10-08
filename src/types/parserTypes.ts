import {  GQL_NAMED_TYPES, GQL_INPUT_TYPES, GQL_OUTPUT_TYPES} from './gqlTypes';

export interface GQLNamedTypeMap{
  [GQLtypeLabel: string]: GQL_NAMED_TYPES | GQL_INPUT_TYPES | GQL_OUTPUT_TYPES;
}

export interface GQLschemaParser{
  typeDefinitions: string[];
  rootOperationDefinitions: string[];
  namedTypeMap: GQLNamedTypeMap;
}
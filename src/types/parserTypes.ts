import {  GQL_NAMED_TYPES, GQL_INPUT_TYPES, GQL_OUTPUT_TYPES} from './gqlTypes';

export interface GQLNamedTypeMap{
  [GQLtypeLabel: string]: GQL_NAMED_TYPES | GQL_INPUT_TYPES | GQL_OUTPUT_TYPES;
}

/**
 * @type TokenizedTypeDefinition =>
 * GQL Type definition string tokenized  with the delimiter :: in the form 
 * GQL_NAMED_TYPE::TYPE_LABEL::TYPE_FIELD_1::TYPE_FIELD_2::TYPE_FIELD_3
 * 
 * e.g. type::Query::posts(keyword:String):[Posts!]!::users:[Users!]!
 * 
 * e.g. input::UserCreateArgs::email:String!::password:String!
 */

export type TokenizedTypeDefinition = string;

export interface GQLschemaParser{
  typeDefinitions: TokenizedTypeDefinition[];
  rootOperationDefinitions: TokenizedTypeDefinition[];
  nonScalarTypeDefinitions: TokenizedTypeDefinition[];
  namedTypeMap: GQLNamedTypeMap;
  parsingDelimiter: string;
}
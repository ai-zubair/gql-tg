import { ROOT_OP_NAMES, GQL_NAMED_TYPES } from '../types';

export const DEF_GEN_PATTERN = `\\n(?=\\s*${GQL_NAMED_TYPES.OBJECT_TYPE}|\\s*${GQL_NAMED_TYPES.INPUT}|\\s*${GQL_NAMED_TYPES.ENUM}|\\s*${GQL_NAMED_TYPES.INTERFACE}|\\s*${GQL_NAMED_TYPES.UNION})`;

export const QUERY_OP_PATTERN = `\\b${ROOT_OP_NAMES.QUERY}(?=\\s*{)`;

export const MUTATION_OP_PATTERN = `\\b${ROOT_OP_NAMES.MUTATION}(?=\\s*{)`;

export const SUBSCRIPTION_OP_PATTERN = `\\b${ROOT_OP_NAMES.SUBSCRIPTION}(?=\\s*{)`;

export const ROOT_OP_PATTERN = `${QUERY_OP_PATTERN}|${MUTATION_OP_PATTERN}|${SUBSCRIPTION_OP_PATTERN}`;

export const CHARAC_CLEAN_PATTERN = `\\s+|${GQL_NAMED_TYPES.OBJECT_TYPE}|{|}`;

export const EMPTY_STRING_PATTERN = `^$`;

export const ER_SPLIT_PATTERN = `(?<=\\)|^\\w+):`;

export const SIGNATURE_SPLIT_PATTERN = `\\(|,|\\)`;

export const ARG_SPLIT_PATTERN = `:`;

export const REQUIRED_ARG_PATTERN = `!$`;
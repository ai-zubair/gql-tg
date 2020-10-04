import { ROOT_OP_NAMES } from '../types';

export const QUERY_OP_PATTERN = `\\b${ROOT_OP_NAMES.QUERY}(?=\\s*{)`;

export const MUTATION_OP_PATTERN = `\\b${ROOT_OP_NAMES.MUTATION}(?=\\s*{)`;

export const SUBSCRIPTION_OP_PATTERN = `\\b${ROOT_OP_NAMES.SUBSCRIPTION}(?=\\s*{)`;
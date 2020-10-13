export enum ROOT_OP_NAMES {
  QUERY = "QUERY",
  MUTATION = "MUTATION",
  SUBSCRIPTION = "SUBSCRIPTION"
}

export enum GQL_NAMED_TYPES {
  SCALAR = "SCALAR",
  ENUM = "ENUM",
  OBJECT_TYPE = "TYPE",
  INPUT = "INPUT",
  INTERFACE = "INTERFACE",
  UNION = "UNION"
}

export enum GQL_SCALAR_TYPES {
  INT = 'Int',
  FLOAT = 'Float',
  ID = 'ID',
  STRING = 'String',
  BOOLEAN = 'Boolean',
}

export enum GQL_INPUT_TYPES {
  SCALAR = "SCALAR",
  ENUM = "ENUM",
  INPUT = "INPUT"
}

export enum GQL_OUTPUT_TYPES {
  SCALAR = "SCALAR",
  ENUM = "ENUM",
  OBJECT = "OBJECT",
}

export enum GQL_WRAPPER_TYPES {
  LIST = "LIST",
  NON_NULL = "NON_NULL"
}
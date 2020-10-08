export const ER_SPLIT_PATTERN = `(?<=\\)|^\\w+):`;

export const SIGNATURE_SPLIT_PATTERN = `\\(|,|\\)`;

export const ARG_SPLIT_PATTERN = `:`;

export const REQUIRED_ARG_PATTERN = `!$`;

export const LIST_VALUE_OPTIONAL_PATTERN = `\\w\\]\\W?$`;

export const STRIP_WRAPPING_TYPE_PATTERN = `\\[|\\]|!`;

export const LIST_PATTERN = `^\\[`;
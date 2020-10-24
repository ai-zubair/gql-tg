import { 
  MAPPED_NON_SCALARS,
  INDENT_SPACE,
  EXPORT,
  NEW_LINE
} from '../../constants';

import { 
  CAMEL_CASE_PATTERN, 
  FIRST_LETTER_PATTERN
} from '../../patterns'

export function formatIntoTranspiledTypeDefinition(defLabel: string, defTypes: string, typeName: string): string{
  switch(typeName){
    case MAPPED_NON_SCALARS.TYPE:
      return `${NEW_LINE}${EXPORT} ${typeName} ${defLabel} = ${defTypes};${NEW_LINE}`;    
    default:
      return `${NEW_LINE}${EXPORT} ${typeName} ${defLabel}{${NEW_LINE}${defTypes}}${NEW_LINE}`;
  }
}

export function formatIntoTranspiledFieldDefinition(fieldName: string, fieldType: string, isOptional: boolean): string{
  return isOptional ? `${INDENT_SPACE}${fieldName}?: ${fieldType};${NEW_LINE}` : `${INDENT_SPACE}${fieldName}: ${fieldType};${NEW_LINE}`;
}

export function joinIntoCamelCase(...str: string[]): string {
  const titleCasedStrings = str.map((str: string):string => {
    const lowerCasedString = this.hasCamelCasing(str) ? str : str.toLowerCase();
    const firstLetterPattern = new RegExp(FIRST_LETTER_PATTERN);
    const camedlCasedString = lowerCasedString.replace(firstLetterPattern,str[0].toUpperCase());
    return camedlCasedString;
  });
  return titleCasedStrings.join('');
}

export function hasCamelCasing(str: string): boolean{
  const camelCasePattern = new RegExp(CAMEL_CASE_PATTERN);
  return camelCasePattern.test(str);
}
import { Parser } from './components/parser/Parser';

const schemaDefGen = new Parser('./mockup.schema.graphql');
schemaDefGen.parseSchema();
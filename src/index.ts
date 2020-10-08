import { DefinitionGenerator } from './components/generator/DefinitionGenerator';

const schemaDefGen = new DefinitionGenerator('./mockup.schema.graphql');
schemaDefGen.generateRootOperationTypeDefinitions();
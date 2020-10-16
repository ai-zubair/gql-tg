import { Transpiler } from './components/transpiler/Transpiler';

const decomp = new Transpiler('./mockup.schema.graphql');
decomp.transpileSchema();
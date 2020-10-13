import { Decompiler } from './components/decompiler/Decompiler';

const decomp = new Decompiler('./mockup.schema.graphql');
decomp.decompileSchema();
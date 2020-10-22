#! /usr/bin/env node
import { Transpiler } from './components/transpiler/Transpiler';
const transpiler = new Transpiler('./mockup.schema.graphql');
transpiler.transpileSchema();
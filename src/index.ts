#! /usr/bin/env node
import { Transpiler } from './components/transpiler/Transpiler';
const transpiler = new Transpiler(process.argv[2], process.argv[3]);
transpiler.transpileSchema();
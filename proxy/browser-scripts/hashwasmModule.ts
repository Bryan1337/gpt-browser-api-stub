import fs from 'fs';

const hashwasmModule = fs.readFileSync(`${process.cwd()}/compiled/hashWasmModule.compiled.ts`)
export default hashwasmModule;
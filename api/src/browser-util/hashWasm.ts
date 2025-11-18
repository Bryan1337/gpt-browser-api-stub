import fs from "fs";
import path from "path";

export type HashWasmUtil = typeof import("hash-wasm");

const hashWasmUtil = fs.readFileSync(
	path.resolve("node_modules/hash-wasm/dist/index.umd.js")
);

const hashWasmUtilWrapped = `
  (function() {
    const module = { exports: {} };
    const exports = module.exports;
    ${hashWasmUtil}
    return module.exports;
  })()
`;

export default hashWasmUtilWrapped;

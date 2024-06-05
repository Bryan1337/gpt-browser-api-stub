import fs from "fs";

const hashwasmModule = fs.readFileSync(
	`${process.cwd()}/compiled/hashWasmModule.compiled.js`
);
export default hashwasmModule;

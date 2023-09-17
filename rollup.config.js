import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
	input: "src/index.ts",
	plugins: [
		commonjs(),
		json(),
		nodeResolve({
			browser: true,
			preferBuiltins: false,
			dedupe: ["buffer"],
			extensions: [".js", ".ts"],
			mainFields: ["browser", "module", "main"],
			resolveOnly: ["assert"],
		}),
		typescript({
			tsconfig: "./tsconfig.esm.json",
			moduleResolution: "node",
			target: "es2019",
			outputToFilesystem: false,
		}),
		terser(),
	],
	external: ["@solana/web3.js", "@coral-xyz/anchor"],
	output: {
		file: "dist/browser/index.js",
		format: "es",
		sourcemap: true,
		inlineDynamicImports: true,
	},
};

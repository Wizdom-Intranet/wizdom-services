import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import serve from 'rollup-plugin-serve';
const rollup = require('rollup');
const input = "src/main.ts";

console.log(rollup);

export default [
    { // bundlers builds
        input: input,
        external: Object.keys(pkg.dependencies || {}), //
        plugins: [
            typescript()
        ],
        output: [
            {
                file: pkg.module,
                format: 'es'
            }
        ]
    }
];
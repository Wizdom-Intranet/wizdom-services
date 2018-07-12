import typescript from 'rollup-plugin-typescript2';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import sourcemaps from 'rollup-plugin-sourcemaps';
import copy from 'rollup-plugin-cpy';
import pkg from './package.json';
const rollup = require('rollup');
const input = "src/main.ts";

export default [
    {
        input: input,
        external: Object.keys(pkg.dependencies || {}), //
        plugins: [
            typescript(),
            generatePackageJson({
                baseContents: {
                    name: pkg.name,
                    version: pkg.version,
                    description: pkg.description,
                    main: pkg.main.replace(/^dist\//,''),
                    types: pkg.types.replace(/^dist\//,''),
                    module: pkg.module.replace(/^dist\//,''),
                    author: pkg.author,
                    license: pkg.license
                }
            }),
            copy({
                files: ["./README.md"],
                dest: "dist",
                verbose: true
            }),
            sourcemaps,
        ],
        output: [
            {
                file: pkg.module,
                sourceMap: true,
                format: 'es',
            }
        ]
    }
];
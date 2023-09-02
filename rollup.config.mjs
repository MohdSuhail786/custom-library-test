import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import scss from "rollup-plugin-scss"
import json from "@rollup/plugin-json";
import alias from '@rollup/plugin-alias';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { dts } from "rollup-plugin-dts";
import path from "path";

import packageJson from "./package.json" assert { type: "json" };;

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    external: ['react', 'react-dom', 'axios'],
    plugins: [
        resolve(),
      commonjs(),
      nodePolyfills(),
      typescript({ tsconfig: "./tsconfig.json" }),
      scss({
        output: 'dist/common.css'
      }),
      json(),
      alias({
        entries: [
          { find: './screens', replacement: './src/screens' }, // Adjust the path accordingly
        ],
        'react': path.resolve( './node_modules/react'),
        'react-dom': path.resolve( './node_modules/react-dom')
      }),
    ],
  },
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    external: ['react', 'react-dom'],
    
    plugins: [resolve(),dts(),
      alias({
        'react': path.resolve( './node_modules/react'),
        'react-dom': path.resolve( './node_modules/react-dom')
      }),
    ],
  },
];
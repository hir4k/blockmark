import terser from "@rollup/plugin-terser";
import postcss from "rollup-plugin-postcss";
import cssnano from "cssnano";

export default {
    input: "src/index.js",
    output: [
        {
            file: 'dist/bm.js',
            format: 'iife',
            name: 'BlockMark',
            plugins: [terser()]
        }
    ],
    plugins: [
        postcss({
            extract: true,
            minimize: true,
            plugins: [cssnano()],
        }),
    ]
};

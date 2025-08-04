export default {
    build: {
        lib: {
            entry: 'src/index.js',
            name: 'BlockMark',
            fileName: (format) => `blockmark.${format}.js`,
        },
    },
};

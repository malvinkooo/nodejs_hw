require('./functions/print.js');
const { filterFiles } = require('./functions/filterFiles.js');
const argv = require('minimist')(process.argv.slice(2));
const { EXT } = process.env;

let colorsList = argv.colors.replace(/[\[\]]/g, "");
colorsList = colorsList ? colorsList.split(",") : [];

let extList = EXT.replace(/[\[\]]/g, "");
extList = extList ? extList.split(",") : [];

const res = filterFiles(argv.path, extList, argv.deep);
print(res, colorsList);
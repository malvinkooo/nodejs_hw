const argv = require('minimist')(process.argv.slice(2));
const { EXT } = process.env;
const { homedir } = require('os');
const chalk = require("chalk");

let colorsList = (argv.colors && (typeof argv.colors != 'boolean')) ? argv.colors.replace(/[\[\]]/g, "") : null;
colorsList = colorsList ? colorsList.split(",") : [];
colorsList.forEach(element => {
    if(!chalk[element]) {
        console.error(chalk.red( `Invalid argument in colors: ${element}` ));
        process.exit(1);
        return false;
    }
});

let extList = EXT ? EXT.replace(/[\[\]]/g, "") : null;
extList = extList ? extList.split(",") : [];

const currPath = (argv.path && (typeof argv.path != 'boolean')) ? argv.path : homedir();
const deep = (argv.deep && (typeof argv.deep != 'boolean')) ? parseInt(argv.deep) : 0;
const search = (argv.search && (typeof argv.search != 'boolean')) ? argv.search : '';

module.exports = {
    extList,
    colorsList,
    currPath,
    deep,
    search,
};

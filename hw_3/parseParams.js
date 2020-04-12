const argv = require('minimist')(process.argv.slice(2));
const { homedir } = require('os');
const chalk = require("chalk");

exports.parseParams = function() {
    let colorsList = (argv.colors && (typeof argv.colors != 'boolean')) ? argv.colors.replace(/[\[\]]/g, "") : null;
    colorsList = colorsList ? colorsList.split(",") : [];
    colorsList.forEach(element => {
        if(!chalk[element]) {
            throw new Error(`Invalid argument in colors: ${element}`);
        }
    });

    const currPath = (argv.path && (typeof argv.path != 'boolean')) ? argv.path : homedir();
    const deep = (argv.deep && (typeof argv.deep != 'boolean')) ? parseInt(argv.deep) : 0;
    const search = (argv.search && (typeof argv.search != 'boolean')) ? argv.search : '';

    let ext;
    let regExp;
    if(argv.name && (typeof argv.name != 'boolean')) {
        let fileParams = argv.name.split("\\");

        regExp = fileParams[0];
        ext = fileParams[1];
    } else {
        throw new Error("Name is required.");
    }

    return {
        colorsList,
        deep,
        fileParams: {
            currPath,
            ext,
            regExp,
            search,
        }
    };
}

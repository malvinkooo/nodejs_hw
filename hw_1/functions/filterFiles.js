const { readdirSync, statSync } = require('fs');
const { extname } = require('path');
const path = require("path");
const { isExtMatched } = require('./functions.js');

exports.filterFiles = (currPath, filters, deep) => {
    deep = (deep === 0) ? -1 : deep;
    return filterFiles(currPath, filters, deep);
}

function filterFiles (currPath, filters, deep) {
    let result = [];

    if (deep === 0) {
        return result;
    }

    readdirSync(currPath).forEach(element => {
        const elementPath = path.join(currPath, element);
        const stats = statSync(elementPath);

        if(stats.isDirectory()) {
            result = [...result, ...filterFiles(elementPath, filters, deep-1)];
        } else {
            if(isExtMatched(filters, extname(element))) {
                result[result.length] = element;
            }
        }
    });

    return result;
}
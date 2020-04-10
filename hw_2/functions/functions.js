const chalk = require("chalk");

function isExtMatched(extArr, currExt) {
    if(!extArr.length) return true;
    return extArr.includes(currExt);
}

function print (list, colorsList) {
    if(!colorsList.length) {
        colorsList = ['red', 'green', 'blue'];
    }

    list.forEach((element, i) => {
        console.log( chalk[colorsList[i%colorsList.length]](element) );
    });
}

module.exports = {
    isExtMatched,
    print,
}
const chalk = require("chalk");

function print (list, colorsList) {
    if(!colorsList.length) {
        colorsList = ['red', 'green', 'blue'];
    }

    list.forEach((element, i) => {
        console.log( chalk[colorsList[i%colorsList.length]](element) );
    });
}

module.exports = {
    print,
}
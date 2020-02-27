const chalk = require("chalk");

global.print = (list, colorsList) => {
    if(!colorsList.length) {
        colorsList = ['red', 'green', 'blue'];
    }

    list.forEach((element, i) => {
        console.log( chalk[colorsList[i%colorsList.length]](element) );
    });
}

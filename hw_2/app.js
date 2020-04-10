const { print } = require('./functions/functions.js');
const { currPath, deep, extList, colorsList, search } = require('./parseParams.js');

const Finder = require('./Finder.js');
const finder = new Finder(currPath, extList, deep, search);

finder.once('started', () => {
    console.log('started');
    finder.parse();
});

finder.on('file', data => {
    console.log('Receive file', data);
});

finder.on('processing', data => {
    console.log('DATA', data);
});

finder.on('finished', data => {
    print(data, colorsList);
    console.log('finished');
});
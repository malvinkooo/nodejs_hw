const { print } = require('./functions/functions.js');
const { parseParams } = require('./parseParams.js');

const Finder = require('./Finder.js');
let finder;
let colorsList, deep, fileParams;

try {
    const params = parseParams();
    colorsList = params.colorsList;
    deep = params.deep;
    fileParams = params.fileParams;
    
    finder = new Finder(deep, fileParams);
} catch(err) {
    console.log(err);
    process.exit(1);
    return false;
}

finder.once('started', async () => {
    console.log('Started');
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

finder.on("error", err => {
    console.log(err);
    process.exit(1);
    return false;
});
function isExtMatched(extArr, currExt) {
    let result = !extArr.length;

    extArr.forEach(element => {
        if (element === currExt) {
            result = true;
            return result;
        }
    });

    return result;
}

module.exports = {
    isExtMatched,
}
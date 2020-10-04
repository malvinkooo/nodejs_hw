exports.paramsGetById = (req, res, next) => {
    const { id } = req.params;
    const idNumber = Number(id);
    const isNumber = !isNaN(idNumber);

    if(!isNumber) {
        next("Id is not a number.");
    } else {
        req.params.id = idNumber;
        next();
    }
}

exports.updateMessageValidation = (req, res, next) => {
    next();
}
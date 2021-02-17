const Joi = require('joi');

module.exports = (schema, request, response, next) => {
    const { error } = Joi.validate(request, schema);

    if (error)
        return requestResponder.sendBadRequestError(response);

    next();
}
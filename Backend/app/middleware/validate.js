

const validate = (Schema) => {
    return (req, res, next) => {
        const { error, value } = Schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        req.body = value;

        next();

    }
}

module.exports = validate;
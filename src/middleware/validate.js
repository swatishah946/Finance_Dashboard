const validate = (schema, options = {}) => {
  const { abortEarly = false, stripUnknown = true } = options;

  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly,
      stripUnknown,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }

    req.validatedBody = value;
    next();
  };
};

export default validate;

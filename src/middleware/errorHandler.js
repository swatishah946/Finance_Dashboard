const errorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors.map((e) => e.path);
    return res.status(409).json({
      error: 'Conflict',
      message: `${fields.join(', ')} already exists`,
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Invalid Reference',
      message: 'Referenced record does not exist',
    });
  }

  if (err.isApplicationError) {
    return res.status(err.status || 400).json({
      error: err.name || 'Application Error',
      message: err.message,
    });
  }

  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong. Please try again later.',
  });
};

export default errorHandler;

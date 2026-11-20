export const notFound = (req, res) =>
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode;
  if (!status) {
    if (['MulterError', 'ValidationError', 'CastError'].includes(err.name)) status = 400;
    else if (err.code === 11000) status = 409;
    else status = 500;
  }
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? 'Something went wrong on the server' : err.message });
};

export const notFoundMiddleware = (_req, res) => {
  res.status(404).json({ error: "not_found" });
};

export const errorMiddleware = (err, _req, res, _next) => {
  console.error('Error:', err.message || err);
  
  // Log stack trace for debugging
  if (err.stack) {
    console.error(err.stack);
  }
  
  const status = err.status || 500;
  const code = err.code || "internal_error";
  
  res.status(status).json({
    error: code,
    message: err.message || "Unexpected error",
  });
};

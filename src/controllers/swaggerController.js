const path = require("path");

/**
 * Serve swagger.yaml file
 * No JWT or auth middleware should be applied to this route
 */
exports.getSwaggerSpec = (req, res) => {
  const swaggerPath = path.join(__dirname, "../swagger/swagger.yaml");

  res.setHeader("Content-Type", "application/yaml");
  res.sendFile(swaggerPath);
};

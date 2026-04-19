const jwt = require("jsonwebtoken");

/**
 * Requires `Authorization: Bearer <access_jwt>`.
 * Attaches decoded payload to `req.user` ({ id, email, iat, exp }).
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid Authorization format" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired access token" });
    }
    req.user = user;
    if (process.env.AUTH_DEBUG !== "false" && user?.email) {
      console.log("[auth-middleware] Protected route —", req.method, req.path, "user:", user.email);
    }
    next();
  });
}

module.exports = authMiddleware;

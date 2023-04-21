const jwt = require("jsonwebtoken");

const middlewareController = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.token;
    if (!authHeader) {
      return res.status(403).json("You are not authenticated!");
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) return res.status(403).json("Token is not valid!");

      req.user = user;
      next();
    });
  },

  verifyTokenAndAuthorization: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.isAdmin) {
        next();
      } else {
        return res.status(403).json("You are not alowed to do that!");
      }
    });
  },

  verifyTokenAndAdmin: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.isAdmin) {
        next();
      } else {
        return res.status(403).json("You are not alowed to do that1!");
      }
    });
  },
};

module.exports = middlewareController;

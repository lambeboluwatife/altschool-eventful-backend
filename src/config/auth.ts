import { Request, Response, NextFunction } from "express";

module.exports = {
  ensureAuthenticated: function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (req.isAuthenticated()) {
      return next();
    }
    // req.flash("error_msg", "Please log in to view this resource");
    res.redirect("/users/login");
  },
};

import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

let userVerify = (request :Request, response : Response, next: () => void) => {
  // get token from header
  const token = request.query;
  if (!token) {
    return response
      .status(401)
      .json({ msg: "No Token , authorization denied" });
  }

  // verify the token
  try {
    if (process.env.JWT_SECRET_KEY) {
      const Token = token.token.toString()
      const decoded = jwt.verify(Token, process.env.JWT_SECRET_KEY) as JwtPayload;
      request.user = decoded.user;
      next();
    }
  } catch (error) {
    response.status(401).json({ msg: "Token is not valid" });
  }
};

export default userVerify;

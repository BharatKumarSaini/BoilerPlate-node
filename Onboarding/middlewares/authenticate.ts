import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from 'jsonwebtoken';



let authenticate = (request : Request , response : Response , next : NextFunction) => {
    // get token from header
    const token = request.header('x-auth-token');
    if(!token){
        return response.status(401).json({msg : 'No Token , authorization denied'});
    }

    // verify the token
    try {
        if (process.env.JWT_SECRET_KEY) {
           
                let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) as JwtPayload;
                request.user = decoded.user;
                next();
        }
    }
    catch (error) {
        response.status(401).json({msg : 'Token is not valid'});
    }
};

export default authenticate
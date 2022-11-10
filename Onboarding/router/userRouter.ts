import express from 'express';
const router = express.Router();
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


import { Request, Response } from 'express';


/*
    @usage : Register a User
    @url : /api/users/register
    @fields : name , email , password
    @method : POST
    @access : PUBLIC
 */
router.post('/register', [
    body('name').notEmpty().withMessage('Name is Required'),
    body('email').notEmpty().withMessage('Email is Required'),
    body('password').notEmpty().withMessage('Password is Required'),
], async (request: Request, response: Response) => {
    
    

    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(401).json({errors : errors.array()})
    }
    try {
        
        let {name , email , password} = request.body;

        // check if the user is exists
        let user  = await User.findOne({email : email});
        if(user){
            return response.status(401).json({errors : [{msg : 'User is Already Exists'}]});
        }

        // encode the password
        const salt : string = await bcrypt.genSalt(10);
        const passwordHash : string = await bcrypt.hash(password , salt);
        
        // save user to db
        user = new User({name , email , passwordHash });
        await user.save();
        response.status(200).json({msg : 'Registration is Success'});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Login a User
    @url : /api/users/login
    @fields : email , password
    @method : POST
    @access : PUBLIC
 */
router.post('/login' , [
    body('email').notEmpty().withMessage('Email is Required'),
    body('password').notEmpty().withMessage('Password is Required'),
], async (request : Request , response : Response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(401).json({errors : errors.array()})
    }
    try {
        let {email , password} = request.body;
        let user  = await User.findOne({email : email});
        if (!user) {
            return response.status(401).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }
        else {
            // check password
            let isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return response.status(401).json({ errors: [{ msg: 'Invalid Credentials' }] })
            }

            // create a token
            let payload = {
                user: {
                    id: user.id,
                    name: user.name as string
                }
            };
            if (process.env.JWT_SECRET_KEY) {
                jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: 360000000 }, (err, token) => {
                    if (err) throw err;
                    response.status(200).json({
                        msg: 'Login is Success',
                        token: token
                    });
                })
            }
        }
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});


/*
    @usage : Verify the Email
    @url : /api/users/verify
    @fields : link
    @method : POST
    @access : PUBLIC
 */

    router.post("/verify/:id/:token", async (req, res) => {
        try {
          const user = await User.findOne({ _id: req.params.id });
          if (!user) return res.status(400).send("Invalid link");
      
          const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
          });
          if (!token) return res.status(400).send("Invalid link");
      
          await User.updateOne({ _id: user._id, verified: true });
          await Token.findByIdAndRemove(token._id);
      
          res.send("email verified sucessfully");
        } catch (error) {
          res.status(400).send("An error occured");
        }
      });


module.exports = router;
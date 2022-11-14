import express from 'express';
import axios from 'axios'
const router = express.Router();
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from "../utils/email";
import {OAuth2Client} from 'google-auth-library'
import { Request, Response } from 'express';
import authenticate from '../middlewares/authenticate';


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
        
        const {name , email , password} = request.body;

        // check if the user is exists
        let user  = await User.findOne({email : email}) as any;
        if (user) {
            return response.status(401).json({ errors: [{ msg: 'User is Already Exists' }] });
        } else {

            // encode the password
            const salt: string = await bcrypt.genSalt(10);
            const passwordHash: string = await bcrypt.hash(password, salt);
        
            // save user to db
            user = new User({ name, email, passwordHash }) ;
            await user.save();
            let payload = {
                user: {
                    id: user.id,
                    name: user.name,
                }
            };
            if (process.env.JWT_SECRET_KEY) {
                jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7d" }, async (err, token) => {
                    if (token) {
                        const link = `process.env.BASE_URL/api/users/verify?x-auth-token=${token}`;
                        await sendEmail(email, "Verify Email", link, 'emailVerification.ejs.html');
                    }
                    else {
                        throw err;
                    }
                })
            }
            response.status(200).json({ msg: 'Registration is Successful and Verification Email Send' });
        }
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
        let user  = await User.findOne({email : email}) as any;
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
            const payload = {
                user: {
                    id: user.id,
                    name: user.name,
                }
            };
            if (process.env.JWT_SECRET_KEY) {
                jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7d" }, (err, token) => {
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
    @method : get
    @access : PUBLIC
 */

    router.get("/verify", authenticate, async (request, response) => {
        try {
            const user = await User.findById(request.user.id) as any;
            if (!user) return response.status(400).send("Invalid link");
            user.verified = true;
            await user.save()
            response.status(200).json({
                msg: 'Email Verified',
                User: user
            });
      
        } catch (error) {
            response.status(400).send("An error occured");
        }
    });
      

    /*
    @usage : Social Login
    @url : /api/users/socialAuth
    @fields : type, access token
    @method : post
    @access : PUBLIC
 */


    router.post("/socialAuth",async (request, response) => {
        try {
            const socialData = request.body
            if (socialData.type === 'Google') {
                const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
                const client = new OAuth2Client(CLIENT_ID)
                const ticket = await client.verifyIdToken({
                    idToken: socialData.accessToken,
                    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
                    // Or, if multiple clients access the backend:
                    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
                })
                const Data = ticket.getPayload()
                const name = Data?.name;
                const email = Data?.email;

                const Socialuser = new User({ name, email }) as any;
                await Socialuser.save();
                let payload = {
                    user: {
                        id: Socialuser.id,
                        name: Socialuser.name,
                    }
                };
                if (process.env.JWT_SECRET_KEY) {
                    jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7d" }, async (err, token) => {
                        if (token) {
                            const link = `process.env.BASE_URL/api/users/verify?x-auth-token=${token}`;
                            await sendEmail(email, "Verify Email", link, 'emailVerification.ejs.html');
                        }
                        else {
                            throw err;
                        }
                    })
                }
                response.status(200).json({ msg: 'Registration is Successful and Verification Email Send' });
            }

            if (socialData.type === 'Facebook') {
            const checkFacebookUser = await axios.get(`https://graph.facebook.com/me?access_token=${socialData.accessToken}`)
            if (checkFacebookUser) {
                const facbookUser = checkFacebookUser.data
                return response.send({ success: true, message: 'login sucessfully', facbookUser })
            }
            return response.status(400).send({ erro: true, message: 'user not verify' })
            }
            if (socialData.type === 'Twitter') {
            return response.send({ success: true, message: 'login sucessfully' })
            }
            return response.status(400).send({ erro: true, message: 'type is not defined' })
        } catch (e: any) {
            return response.status(500).send({ errorMessage: e.message })
        }   
    });

module.exports = router;
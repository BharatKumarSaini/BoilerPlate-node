import express from 'express';
const app = express();
import cors from 'cors';
import dotEnv from 'dotenv';
import mongoose from 'mongoose';

import {Request , Response} from 'express'

// configure cors
app.use(cors());

// configure express to receive form data
app.use(express.json());

// configure dotEnv
dotEnv.config({ path: './.env' });
let port: number = 5000;
if (process.env.PORT) {
    port = +process.env.PORT;
}
// configure mongodb connection
if (process.env.MONGO_DB_CLOUD_URL) {
    mongoose.connect(process.env.MONGO_DB_CLOUD_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    }).then(() => {
        console.log('Connected to MongoDB Cloud Successfully......');
    }).catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
}

// simple request
app.get('/', (request: Request, response: Response) => {
    console.log(request);
    
    response.send(`<h2>Welcome to User Onboarding BoilerPlate </h2>`);
});

// router configuration
app.use('/api/users' , require('./router/userRouter'));

app.listen(port, () => {
    console.log(`Express Server is started at PORT : ${port}`);
});
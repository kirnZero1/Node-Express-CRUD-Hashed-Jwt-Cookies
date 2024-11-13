import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import {usersRoute} from './route/userRoutes'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser())

app.use(cors({
    origin:'http://localhost:3000',
    methods:['GET','PUT','PATCH','DELETE','POST']
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/users', usersRoute)

mongoose.connect(`${process.env.MONGO_URI}`)
        .then(() => {
            app.listen(process.env.PORT, () => {
                console.log('Database and Server is now connected at PORT '+process.env.PORT)
            })
        })
        .catch((error) => console.log(error))
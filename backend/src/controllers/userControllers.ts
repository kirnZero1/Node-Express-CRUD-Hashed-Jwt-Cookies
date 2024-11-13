import express,{Request, Response} from 'express';
import mongoose from 'mongoose';
import { usersData } from '../model/userData';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const salt = 10;

export const getUsers = async (req:Request, res:Response) => {
        try{

            const users = await usersData.find({}).sort({createdAt:-1})
            if(!users){
                return res.status(200).json({Error: 'Data not found. Please contact your Web Admin.'})
            }
            return res.status(200).json(users)

        }catch(error){
            return res.status(500).json({Error: error})
        }
}

export const getUser = async (req:Request, res:Response) => {
    try{
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(200).json({Error: 'There is no such user id. User id not found.'})
        }
        const users = await usersData.findById({_id: id})
        if(!users){
            return res.status(200).json({Error: 'Data not found. Please contact your Web Admin.'})
        }
        return res.status(200).json(users)

    }catch(error){
        return res.status(500).json({Error: error})
    }
}

export const deleteUser = async (req:Request, res:Response) => {
    try{
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(200).json({Error: 'There is no such user id. User id not found.'})
        }
        const users = await usersData.findByIdAndDelete({_id: id})
        if(!users){
            return res.status(200).json({Error: 'User not deleted. Please check UserId. Please contact your Web Admin.'})
        }
        return res.status(200).json(users)

    }catch(error){
        return res.status(500).json({Error: error})
    }
}


export const createUser = async (req:Request, res:Response) => {
    try{
        const {username, password, email, isAdmin} = req.body;
        if(!req.body){
            return res.status(404).json({Error: 'Please input valid credentials'})
        }
        const usernames = await usersData.findOne({username: username})
        if(usernames){
            return res.status(400).json({Error: 'Username already in use. Please input a valid username. Thank you.'})
        }
        const emails = await usersData.findOne({email: email})
        if(emails){
            return res.status(400).json({Error: 'Email already in use. Please input a valid email. Thank you.'})
        }

        bcrypt.hash(password, salt, async (err, hash) => {

            if(err){
                return res.status(400).json({Error: 'Error hashing password.'})
            }else{
                const users = await usersData.create({username: username, password: hash, email: email, isAdmin: isAdmin})
                if(!users){
                    return res.status(200).json({Error: 'User not created. Please input proper credentials.'})
                }

                const token = jwt.sign({username: users.username,password: users.password, email: users.email, isAdmin: users.isAdmin},`${process.env.SECRET_PASSWORD}`,{expiresIn: 60 * 60 * 1000})

                res.cookie('jwt',token,{maxAge: 60 * 60 * 1000})

                return res.status(200).json({token, users})
            }
        })


    }catch(error){
        return res.status(500).json({Error: error})
    }
}

export const updateUser = async (req:Request, res:Response) => {
    // change password has too many credentials.
    // hindi pa tapos, ung sa change password ng bcrypt, need ng old password and new password to change.
    // whole update only. 
    // Only to see how Update works. hawag palitan ung encrypt password, hindi gagana sa login.
    try{
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(200).json({Error: 'There is no such user id. User id not found.'})
        }

        const {username, password, email, isAdmin} = req.body;

        if(!req.body){
            return res.status(404).json({Error: 'Please input valid credentials'})
        }

        const users = await usersData.findByIdAndUpdate({_id:id},{username: username, password: password, email: email, isAdmin: isAdmin})
                if(!users){
                        return res.status(200).json({Error: 'User not updated. Please input proper credentials.'})
                }
                return res.status(200).json(users)
            
            
    }catch(error){
        return res.status(500).json({Error: error})
    }
}

export const loginUser = async (req:Request, res:Response) => {
    try{
        const {email, password} = req.body;
        if(!req.body){
            return res.status(404).json({Error: 'Please input valid credentials'})
        }

        const user = await usersData.findOne({email: email})
        if(user){
            if(user.password === password){
                const token = jwt.sign({id: user.id,username: user.username,password: user.password, email: user.email, isAdmin: user.isAdmin},`${process.env.SECRET_PASSWORD}`,{expiresIn: 60 * 60 * 1000})
                res.cookie('jwt',token,{maxAge: 60 * 60 * 1000})
                return res.status(200).json({Success: 'Successfully log in. You will redirect to home page', token})
            }else{
                res.redirect('/login')
                return res.status(400).json({Error: 'Password is incorrect.'})
            }

        }else{
            return res.status(400).json({Error: 'Email not found.'})
        }


    }catch(error){
        return res.status(500).json({Error: error})
    }
}


export const logoutUser = async (req:Request, res:Response) => {
    const token = req.cookies.jwt
    
    if(token){
        jwt.verify(token, `${process.env.SECRET_PASSWORD}`, async (err:any, decoded:any) => {
            if(err){
                console.log(err.message)
                return res.status(404).json({error: 'Error logout token not matched'})
            }else{
                console.log('User logout successfully')
                return res.clearCookie('jwt').status(200).json({messgae: 'Logged-out successfully'})
            }
        })
    }
}

module.exports = {
    getUsers, getUser, deleteUser, createUser, updateUser, loginUser, logoutUser
}
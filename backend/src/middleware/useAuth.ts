import express, {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

export const useAuth = async (req: Request,res: Response, next: NextFunction) =>{
    const token = req.cookies.jwt
    
    if(token){
        jwt.verify(token, `${process.env.SECRET_PASSWORD}`, async (err:any, decodedToken:any) => {
            if(err){
                console.log(err.message)
                return res.redirect('/login')
            }else{
                console.log({UserToken: decodedToken})
                next();
            }
        })

    }else{
       return res.redirect('/login')
    }

}


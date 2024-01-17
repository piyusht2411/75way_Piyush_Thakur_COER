import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken' ;
import User from '../model/schema';
//authentication function
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.cookies.authToken ;
    const refreshToken = req.cookies.refreshToken ;
    //if auth token and refersh token both doesn't exist
    if(!authToken || !refreshToken){
        return res.status(401).json({message : " Authentication Failed : No authToken or refreshToken is provided "})
    }
    //verify auth token

    jwt.verify(authToken,process.env.JWT_SECRET_KEY||"",(err:any,decode:any)=>{
        
        if(err) {
            jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET_KEY||"",(refreshErr:any,refreshDecode:any)=> {
                //if refresh token gives error
                if(refreshErr){
                    return res.status(401).json({message : " Authentication Failed : Both tokens are invalid"}) ;
                }
                else{
                    //generate new auth token and refersh token
                    const newAuthToken = jwt.sign({userId : refreshDecode.userId},process.env.JWT_SECRET_KEY||"",{expiresIn : '30m'});
                    const newRefreshToken = jwt.sign({userId : refreshDecode.userId},process.env.JWT_REFRESH_SECRET_KEY||"",{expiresIn : '2h'})
                     //save auth token and referesh token in cookies
                    res.cookie('authToken',newAuthToken,{httpOnly:true}) ;
                    res.cookie('refreshToken',newRefreshToken,{httpOnly : true }) ;
                    console.log(refreshDecode.userId,"liasd")
                 
                    req.userId = refreshDecode.userId ;
                    next() ;
                }
            })
        }
        else{
            req.userId = decode.userId ;
            next();
   }
})
};
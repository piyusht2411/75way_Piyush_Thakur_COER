import express, { Express, Request, Response , Application, NextFunction} from 'express';
import { RequestHandler } from 'express';
import { genSaltSync, hashSync,compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from 'uuid';
import User from '../model/schema';
import {sendMail} from '../util/emailer'

interface recipentdata{
  receiverId:string;
  amount:number;
  
}
const generateUniqueId = ()=>{
  const v4options = {
  random: [
      0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36,
  ],
  };
  return  uuidv4(v4options);
}
//for sign up
export const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, phone, password, wallet } = req.body;
    //for validation
    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const pass:RegExp=  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    
        // check input for validation
        if (!pass.test(password.toString())) {
          return res.status(407).json({ message: 'Enter valid password with uppercase, lowercase, number & @' });
        }
        if (!expression.test(email.toString())) {
          return res.status(407).json({ message: 'Enter valid email' });
        }
        if(typeof phone !== 'number' && (""+phone).length !== 10 ) {
          return res.status(407).json({ message: 'Phone number should only have 10 digits, No character allowed.' });
        }

    const existinguser = await User.findOne({ email });
//if user is already exist
    if (existinguser) {
      return res.status(407).json({ message: 'User already Exist' });
    }
    //hashing password
    const salt = genSaltSync(10);
    const hashPassword = hashSync(password, salt);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashPassword,
      wallet
    

    });
    //save new user
    await newUser.save();
    res.status(200).json({ message: 'registred successfully' })

  } catch (err) {
    res.status(407).json({ message: err });

  }

};
//for signing in
export const signIn:RequestHandler = async(req, res, next) => {
  

  try{
      const {email,password} = req.body ;
      const user = await User.findOne({email}) ;

      // Checking if the email exists in database 
      if(!user){
          return res.status(400).json({ok:false,message:"Invalid Credentials"}) ;
      }

      // comapring password entered with database hashed Password
      const isPasswordMatch = await compareSync(password,user.password) ;
      if(!isPasswordMatch){
          return res.status(400).json({ok:false,message:"Invalid Credentials"}); 
      }

      // Generating tokens
      const authToken = jwt.sign({userId : user.id},process.env.JWT_SECRET_KEY||" ",{expiresIn : '30m'}) ;
      const refreshToken = jwt.sign({userId : user.id},process.env.JWT_REFRESH_SECRET_KEY||" ",{expiresIn : '2h'}) ;

      // Saving tokens in cookies 
      res.cookie('authToken',authToken,({httpOnly : true})) ;
      res.cookie('refreshToken',refreshToken,({httpOnly:true})) ;

      return res.status(200).json({ok:true,message : "Login Successful",userid:user.id}) ;

  }
  catch(err){
      next(err);
 }
  
};
// for checking balance of a user
export const getBalance:RequestHandler = async(req, res, next) => {
  try{
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user){
      return res.status(400).json({ok:false,message:"Invalid Credentials"}) ;
    } 
    return res.status(200).json({ok:true,balance:user.wallet}) ;  


  }catch(err){
    res.status(407).json({ message: err });
  }

};
//for sign out
export const signout:RequestHandler = (req, res, next) => {
  try{
    //clearing cookies
      res.clearCookie('authToken') ;
      res.clearCookie('refreshToken');
      return res.status(200).json({ok:true,message:"User has been logged out"}) ;
  }
  catch(err){
      next(err) ;
  }
};
//send money to other users
export const sendMoney:RequestHandler = async(req, res, next) => {
  try{
    //sender id => user who want to send money he 
    // receiver id => in which user we want to send money
    // amount => how much money do want to send in reciever's wallet
    // sender id will be send in parameter and reciever id and amount will be sent by body
    const senderId = req.params.id;
  const receiverId = req.body.receiverId;
  const amount = req.body.amount;
 // if the sender id and receiver id are same
  if (senderId === receiverId){
    return res.status(400).json({ message: "Cannot transfer to the same account" });
  }
  // find sender and reciever in database
  const sender = await User.findOne({_id: senderId});
  const receiver =  await User.findOne({_id: receiverId});
  // if sender is not in database
  if(!sender){
    return res.status(400).json({ok:false,message:"sender not found"}) ;
  }
  //if reciecver is not in database
  if(!receiver){
    return res.status(400).json({ok:false,message:"receiver not found"}) ;
  }
  
  let senderBalance = sender.wallet;
//if sender's balance is less than the sending amount
  if(senderBalance< amount){
    return res.status(400).json({ok:false,message:"Insufficient Funds"}) ;
  } 
  sender.wallet = Number(sender.wallet)- amount;
  receiver.wallet = Number(receiver.wallet) + Number(amount);
  // sender's transaction data 
  const sendertransactiondata = {
    id: generateUniqueId(),
    amount: amount,
    timestamp: new Date()
};
// receiver's transaction data
const receivertransactiondata = {
    id: generateUniqueId(),
    amount: amount,
    timestamp: new Date()
};
// push sender's transaction data and reciever's data to their recpective transition array
sender.transition.push(sendertransactiondata);
      receiver.transition.push(receivertransactiondata);
// update sender and reciecver's wallet
  await User.findByIdAndUpdate(
    sender._id,
    { wallet: sender.wallet,timeStamp:new Date() },
    { new: true }
  );
  const data = await User.findByIdAndUpdate(
    receiver._id,
    { wallet: receiver.wallet,timeStamp:new Date() },
    { new: true }
  );
  await sender.save();
  await receiver.save();

  let email = receiver.email;
  // for sending mail to reciever that they have recieved the money
sendMail(email,"Money trasnfered", "Money transfered in your wallet successfully");

res.status(200).json({ok:true,message:"money sent successfully"}) ;

  }catch(error){
    res.status(407).json({ message: error });
  }
};

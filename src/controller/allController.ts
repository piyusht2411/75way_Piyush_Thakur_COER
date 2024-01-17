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

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, phone, password, wallet } = req.body;
    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const pass:RegExp=  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    
        // check input for correctness
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
//sign out
export const signout:RequestHandler = (req, res, next) => {
  try{
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
    const senderId = req.params.id;
  const receiverId = req.body.receiverId;
  const amount = req.body.amount;
 
  if (senderId === receiverId){
    return res.status(400).json({ message: "Cannot transfer to the same account" });
  }
  const sender = await User.findOne({_id: senderId});
  const receiver =  await User.findOne({_id: receiverId});
  
  if(!sender){
    return res.status(400).json({ok:false,message:"sender not found"}) ;
  }
  if(!receiver){
    return res.status(400).json({ok:false,message:"receiver not found"}) ;
  }
  let senderBalance = sender.wallet;

  if(senderBalance< amount){
    return res.status(400).json({ok:false,message:"Insufficient Funds"}) ;
  } 
  sender.wallet = Number(sender.wallet)- amount;
  receiver.wallet = Number(receiver.wallet) + Number(amount);
  const sendertransactiondata = {
    id: generateUniqueId(),
    amount: amount,
    timestamp: new Date()
};
const receivertransactiondata = {
    id: generateUniqueId(),
    amount: amount,
    timestamp: new Date()
};
sender.transition.push(sendertransactiondata);
      receiver.transition.push(receivertransactiondata);

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

// for sending mail to the receiver's email
  let email = receiver.email;
//   const transporter = nodemailer.createTransport({
//     host: process.env.NODEMAIL_EMAIL_HOST,
//     port: 587,
//     secure:false,
//     auth: {
//         user: process.env.NODEMAIL_EMAIL,
//         pass: process.env.NODEMAIL_PASS
//     }
// });
// let info = await transporter.sendMail({
//   from: '"Piyush" <piyush@thakur.com>', // sender address
//   to: email, // list of receivers
//   subject: "Money transftered ", // Subject line
//   text: "Money is transfered in your wallet successfully", // plain text body
//   html: "<b>Money is transfered in your wallet successfully</b>", // html body
// });
sendMail(email,"Money trasnfered", "Money transfered in your wallet successfully");

res.status(200).json({ok:true,message:"money sent successfully"}) ;

  }catch(error){
    res.status(407).json({ message: error });
  }
};

//receive money from other users

export const receiveMoney:RequestHandler = async(req, res, next) => {
  try{
    const receiverId = req.params.id;
  const senderId = req.body.senderId;
  const amount = req.body.amount;
 
  if (senderId === receiverId){
    return res.status(400).json({ message: "Cannot transfer to the same account" });
  }
  const receiver =  await User.findOne({_id: receiverId});
  const sender = await User.findOne({_id: senderId});
 
  
  if(!sender){
    return res.status(400).json({ok:false,message:"sender not found"}) ;
  }
  if(!receiver){
    return res.status(400).json({ok:false,message:"receiver not found"}) ;
  }
  let senderBalance = sender.wallet;

  if(senderBalance< amount){
    return res.status(400).json({ok:false,message:"Insufficient Funds"}) ;
  } 
  sender.wallet = Number(sender.wallet)- amount;
  receiver.wallet = Number(receiver.wallet) + Number(amount);
  await User.findByIdAndUpdate(
    sender._id,
    { wallet: sender.wallet },
    { new: true }
  );
  const data = await User.findByIdAndUpdate(
    receiver._id,
    { wallet: receiver.wallet },
    { new: true }
  );
  await sender.save();
  await receiver.save();

// for sending mail to the receiver's email
  let email = receiver.email;
  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAIL_EMAIL_HOST,
    port: 587,
    secure:false,
    auth: {
        user: process.env.NODEMAIL_EMAIL,
        pass: process.env.NODEMAIL_PASS
    }
});
let info = await transporter.sendMail({
  from: '"Piyush" <piyush@thakur.com>', // sender address
  to: email, // list of receivers
  subject: "Money transftered ", // Subject line
  text: "Money is transfered in your wallet successfully", // plain text body
  html: "<b>Money is transfered in your wallet successfully</b>", // html body
});

res.status(200).json({ok:true,message:"money receive successfully"}) ;

  }catch(error){
    res.status(407).json({ message: error });
  }
};

// const payment = async (req:Request,res:Response)=>{
//   const recipent:recipentdata = req.body;
//   // check if the username and password of the user with id req.id is valid
//   const user = await User.findById(req.id);
//   if (!user) {
//       res.status(400).send('Invalid user ID');
//       return;
//   }
//   // const validPassword = await bcrypt.compare(req.body.password, user.password);
//   if (password) {
//       res.status(400).send('Invalid password');
//       return;
//   }
//   const sender = user;
//   const receiver = await User.findOne({ username: recipent.recipent_username });
//   if (!sender || !receiver) {
//       res.status(400).send('Invalid sender or receiver');
//       return;
//   }
//   if (sender.wallet < recipent.transfer_money) {
//       res.status(400).send('Insufficient balance');
//       return;
//   }
//   try {
//       sender.wallet -= recipent.transfer_money;
//       receiver.wallet += recipent.transfer_money;
//       const sendertransactiondata = {
//           id: generateUniqueId(),
//           amount: -recipent.transfer_money,
//           timestamp: new Date()
//       };
//       const receivertransactiondata = {
//           id: generateUniqueId(),
//           amount: recipent.transfer_money,
//           timestamp: new Date()
//       };
//       sender.transition.push(sendertransactiondata);
//       receiver.transition.push(receivertransactiondata);
//       await sender.save();
//       await receiver.save();
//       console.log('payment done');
//       res.send({
//           message:"transition successful"
//       });
//   } catch (error) {
//       res.send({
//           message:"transition failed"
//       })
//   }
// }
// export {payment};

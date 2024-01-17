import express, {Router, Express, Request, Response , Application} from 'express';
import {register,signIn, getBalance,signout, sendMoney} from "../controller/allController";
import { authenticateToken } from '../middleware/authenticateToken';


const router = Router();
router.post('/register', register);
router.get('/signout', signout);

router.post('/signin', signIn);
router.put('/sendMoney/:id',authenticateToken, sendMoney);
router.get('/getbalance/:id',authenticateToken, getBalance);
// router.get('/sendmail', sendMail);
export default router;
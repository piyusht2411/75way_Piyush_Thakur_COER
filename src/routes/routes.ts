import express, {Router, Express, Request, Response , Application} from 'express';
import {register,signIn, getBalance,signout, sendMoney, receiveMoney} from "../controller/allController";
import { authenticateToken } from '../middleware/authenticateToken';
import {hour, day, week, month, year,} from '../controller/filter';
//routers
const router = Router();
router.post('/register', register);
router.get('/signout', signout);

router.post('/signin', signIn);
router.put('/sendMoney/:id',authenticateToken, sendMoney);
router.put('/receiveMoney/:id',authenticateToken, receiveMoney);
router.get('/getbalance/:id',authenticateToken, getBalance);
router.get('/hour/:id',authenticateToken, hour);
router.get('/day/:id',authenticateToken, day);
router.get('/week/:id',authenticateToken, week);
router.get('/month/:id',authenticateToken, month);
router.get('/year/:id',authenticateToken, year);
export default router;
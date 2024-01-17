import { Request,Response } from "express"
import User  from '../model/schema';
// for hour filtering
export const hour = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const hourTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 1 * 60 * 60 * 1000);
            res.send(hourTransactions);
        } catch (error) {
            res.status(407).json({ message: error });
        }
}
// for daywise filtering
export const day = async (req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const dayTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 24 * 60 * 60 * 1000);
            res.send(dayTransactions);
        } catch (error) {
            res.status(407).json({ message: error });
        }
}
// for week filtering
export const week = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const weekTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 7 * 24 * 60 * 60 * 1000);
            res.send(weekTransactions);
        } catch (error) {
            res.status(407).json({ message: error });
        }
}
// for monthly filtering
export const month = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const monthTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 30 * 24 * 60 * 60 * 1000);
            res.send(monthTransactions);
        } catch (error) {
            res.status(407).json({ message: error });
        }
}
// for yearly filtering
export const year = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const yearTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 365 * 24 * 60 * 60 * 1000);
            res.send(yearTransactions);
        } catch (error) {
            res.status(407).json({ message: error });
        }
}

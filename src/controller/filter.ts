import { Request,Response } from "express"
import User  from '../model/schema';
// this file is used for getting transition history by applying filters

// for hour filtering
export const hour = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const hourlyTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 1 * 60 * 60 * 1000);
            res.send(hourlyTransactions);
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
            const weeklyTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 7 * 24 * 60 * 60 * 1000);
            res.send(weeklyTransactions);
        } catch (error) {
            res.status(407).json({ message: error });
        }
}
// for monthly filtering
export const month = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const monthlyTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 30 * 24 * 60 * 60 * 1000);
            res.send(monthlyTransactions);
        } catch (error) {
            res.status(407).json({ message: error });
        }
}
// for yearly filtering
export const year = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const yearlyTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 365 * 24 * 60 * 60 * 1000);
            res.send(yearlyTransactions);
        } catch (error) {
            res.status(407).json({ message: error });
        }
}

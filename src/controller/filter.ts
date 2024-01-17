import { Request,Response } from "express"
import User  from '../model/schema';
export const hour = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const lastHourTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 1 * 60 * 60 * 1000);
            res.send(lastHourTransactions);
        } catch (error) {
            res.status(500).send('Error retrieving last hour transactions');
        }
}
export const day = async (req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const lastDayTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 24 * 60 * 60 * 1000);
            res.send(lastDayTransactions);
        } catch (error) {
            res.status(500).send('Error retrieving last day transactions');
        }
}
export const week = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const lastWeekTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 7 * 24 * 60 * 60 * 1000);
            res.send(lastWeekTransactions);
        } catch (error) {
            res.status(500).send('Error retrieving last week transactions');
        }
}
export const month = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const lastMonthTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 30 * 24 * 60 * 60 * 1000);
            res.send(lastMonthTransactions);
        } catch (error) {
            res.status(500).send('Error retrieving last month transactions');
        }
}
export const year = async(req:Request,res:Response)=>{
        try {
            const id = req.params.id;
            const user = await User.findById(id);
            const lastYearTransactions = user?.transition.filter(transaction => (Date.now() - new Date(transaction.timestamp).getTime()) <= 365 * 24 * 60 * 60 * 1000);
            res.send(lastYearTransactions);
        } catch (error) {
            res.status(500).send('Error retrieving last year transactions');
        }
}

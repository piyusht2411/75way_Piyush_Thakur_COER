import mongoose from 'mongoose';

export const connectDB = (url:string) => {
    console.log("Conneted to database successfully!")
    return mongoose.connect(url)
}
import mongoose from 'mongoose';
//function for connecting database
export const connectDB = (url:string) => {
    console.log("Conneted to database successfully!")
    return mongoose.connect(url)
}
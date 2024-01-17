import { Schema, model } from 'mongoose';

interface User {
  name: string;
  email: string;
  phone: number;
  password: string;
 wallet:Number

}

const schema = new Schema<User>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
 
  wallet:{
    type: Number,
    default: 10

  },
}, { timestamps: true });


export default model<User>('User', schema)
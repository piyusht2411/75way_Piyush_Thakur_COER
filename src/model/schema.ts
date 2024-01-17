import mongoose from 'mongoose';
//schema of users
const schema = new mongoose.Schema({
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
    default: 10,
  },
  transition:{
    type:Array
  }
}, { timestamps: true });


export default mongoose.model('User', schema)
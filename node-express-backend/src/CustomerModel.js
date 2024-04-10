import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const custSchema = new Schema({
  name: String,
  movie: String,
  email: {type: String, required: true}
})

const customerModel = model('Info', custSchema);

export default customerModel;
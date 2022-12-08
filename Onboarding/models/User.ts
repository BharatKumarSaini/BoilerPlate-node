import mongoose from "mongoose";

 const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String},
    verified: {type: Boolean, required: false, default: false},
  },
  { timestamps: true }
 );


 export interface UserSchema extends mongoose.Document 
  {
    name?: string,
    email?: string,
    password?: string,
    verified?: boolean,
  }
;


const User = mongoose.model<UserSchema>("user", UserSchema);
export default User

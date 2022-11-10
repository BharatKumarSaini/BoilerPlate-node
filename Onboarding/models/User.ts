import mongoose from "mongoose";

let UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: {type: Boolean, required: false, default: false},
  },
  { timestamps: true }
);

const User = mongoose.model("user", UserSchema);
export default User

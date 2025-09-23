import mongoose, { Schema } from "mongoose";

interface IUser {
    handle: string
    name: string
    email: string
    password: string
}

const userSchema = new Schema({
    handle: {
        type: String,
        require: true,
        trim: true,
        lowercase: true,
        unique: true
        
    },
    name: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    }
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
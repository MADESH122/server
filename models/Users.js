const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    images: [
        {
            username: String,
            image: String,
            likes: { type: Number, default: 0 },
            comments: [{ text: String, username: String }]
        }
    ]
})



const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel
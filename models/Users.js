const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    image: String,
    likes: { type: Number, default: 0 },
    comments: [{ text: String, user: String }],
    name: String,
    password: String
})

const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel
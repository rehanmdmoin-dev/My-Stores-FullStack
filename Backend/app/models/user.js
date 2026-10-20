const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});



module.exports = mongoose.model('user', UserSchema);
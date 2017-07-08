var mongoose = require('mongoose');

var userSchema = mongoose.Schema( {
    "firstname": {
        type: String,
        required: true,
        lowercase: true
    },
    "lastname": {
        type: String,
        required: true,
        lowercase: true
    },
    "phone": {
        type: String,
        required: true,
        lowercase: true
    },
    "email": {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    "username": {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    "password": {
        type: String,
        required: true,
        lowercase: true
    },
    "role": {
        type: String,
        required: true,
        lowercase: true
    },
    "registered_date": {
        type: Date,
        default: Date.now
    }
}, {collection: "administrators"});

var Admin = module.exports = mongoose.model("Admin", userSchema);

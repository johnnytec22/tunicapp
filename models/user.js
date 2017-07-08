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
    "address": {
        type: String,
        required: true,
        lowercase: true
    },
    "location": {
        "town": {
            type: String,
            required: true,
            lowercase: true
        },
        "city": {
            type: String,
            required: true,
            lowercase: true
        },
        "country": {
            type: String,
            lowercase: true
        }
    },
    "username": {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    "password": {
        type: String,
        required: true
    },
    "registered_date": {
        type: Date,
        default: Date.now
    }
}, {collection: "users"});

var User = module.exports = mongoose.model("User", userSchema);

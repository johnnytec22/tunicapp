var mongoose = require('mongoose');

var userSchema = mongoose.Schema( {
    "firstname": {
        type: String,
        required: true
    },
    "lastname": {
        type: String,
        required: true
    },
    "phone": {
        type: String,
        required: true
    },
    "email": {
        type: String,
        unique: true,
        required: true
    },
    "address": {
        type: String,
        required: true
    },
    "location": {
        "town": {
            type: String,
            required: true
        },
        "city": {
            type: String,
            required: true
        },
        "country": {
            type: String
        }
    },
    "username": {
        type: String,
        unique: true,
        required: true
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

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
    "username": {
        type: String,
        unique: true,
        required: true
    },
    "password": {
        type: String,
        required: true
    },
    "role": {
        type: String,
        required: true
    },
    "registered_date": {
        type: Date,
        default: Date.now
    }
}, {collection: "administrators"});

var Admin = module.exports = mongoose.model("Admin", userSchema);

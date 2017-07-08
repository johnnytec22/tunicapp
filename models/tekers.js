
var mongoose = require('mongoose');

var tekerSchema = mongoose.Schema( {

    "image_url": {
        type: String,
        lowercase: true
    },

    "message": {
        type: String,
        lowercase: true
    },

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
        required: true,
        unique: true,
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
    "fields": {
        type: [String]
    },
    "years_of_experience": {
        type: Number
    },
    "registered_date": {
        type: Date,
        default: Date.now
    }
}, {collection: "tekers"});

var Teker = module.exports = mongoose.model("Teker", tekerSchema);
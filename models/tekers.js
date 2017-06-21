
var mongoose = require('mongoose');

var tekerSchema = mongoose.Schema( {

    "image_url": {
        type: String
    },

    "message": {
        type: String
    },

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
        required: true,
        unique: true
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
    "fields": {
        type: Array
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
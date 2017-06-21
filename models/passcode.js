var mongoose = require('mongoose');

var codeSchema = mongoose.Schema( {
    "keyword": {
        type: String,
        required: true,
        unique: true
    },
    "access_password" : {
        type: String,
        required: true,
        unique: true
    }
}, { collection: 'admin_access_control_details'});

var Code = module.exports = mongoose.model('Code', codeSchema);


var express = require('express');
var route = express.Router();
var bcrypt = require('bcryptjs');
var async = require('async');
var Admin = require('../models/admin');
var User = require('../models/user');
var Teker = require('../models/tekers');





//GETS ALL USERS AND LIST THEM - DASHBOARD FUNCTIONALITY AND ALSO VIEW ALL SEARCH FUNCTIONALITY
route.get('/', function(req, res)  {

    if (req.session && req.session.admin) {
        Admin.findOne({ email: req.session.admin }, function(err, admin) {

            if (!admin){
                req.session.reset();
                res.redirect('/admin/login');
            }else {
                    req.session.admin = admin.email;
                    res.locals.admin = {
                        id : admin._id,
                        username: admin.username
                    };
                    async.parallel({
                        users_count: function(callback) {
                            User.count(callback);
                        },
                        tekers_count: function(callback) {
                            Teker.count(callback);
                        },
                        admins_count: function(callback) {
                            Admin.count(callback);
                        },
                        users : function(callback) {
                            User.find().sort({registered_date: -1}).select('_id firstname lastname username phone email registered_date').limit(50).exec(callback);
                        }
                    }, function(err, results) {
                        res.render('admin_dashboard/users_view.jade', { error: err, data: results });
                    });
                }
        });
    }else {
        res.redirect('/admin/login')
    }

});


//SEARCH ROUTE
route.post('/find', function(req, res) {
    if (req.session && req.session.admin) {
        Admin.findOne({ email : req.session.admin} , function(err, admin) {
            if(!admin){
                req.session.reset();
                res.redirect('/admin/login');
            }else{
                req.session.admin = admin.email;
                res.locals.admin = {
                    id : admin._id,
                    username: admin.username
                };

                req.checkBody('search_string', 'Invalid input!').notEmpty();
    
                var error = req.validationErrors();
                if (error){
                    req.flash('error', 'Search field is required');
                    res.redirect('/admins');
                }else{
                    var search_string = req.body.search_string;
                    User.find({$or:[ {'username':  { $regex : new RegExp(search_string, "i") }}, {'email':  { $regex : new RegExp(search_string, "i") }}, {'firstname': { $regex : new RegExp(search_string, "i") }}, {'lastname': { $regex : new RegExp(search_string, "i") }}, {'phone':  { $regex : new RegExp(search_string, "i") }} ]}).sort({registered_date: -1}).select('_id username firstname lastname phone email registered_date role').exec(function(err, users) {
                        if(!(users.length > 0)){
                            req.flash('error', 'Admin not found!');
                            res.redirect('/admins');
                        }else{

                            async.parallel({
                                    users_count: function(callback) {
                                        User.count(callback);
                                    },
                                    tekers_count: function(callback) {
                                        Teker.count(callback);
                                    },
                                    admins_count: function(callback) {
                                        Admin.count(callback);
                                    }
                                }, function(err, results) {
                                    var data = {
                                        users : users,
                                        results : results
                                    }
                                    res.render('admin_dashboard/users_view.jade', { errors: err, data});
                            });
                        }
                    })
                }
            }
        })
    }else{
        res.redirect('/admin/login');
    }

    
});


//A REQUEST TO EDIT USER INFO
route.get('/:id/edit', function(req, res)  {

    if (req.session && req.session.admin) {
        Admin.findOne({ email: req.session.admin }, function(err, admin) {

            if (!admin){
                req.session.reset();
                res.redirect('/admin/login');
            }else {
                    req.session.admin = admin.email;
                    res.locals.admin = {
                        id : admin._id,
                        username: admin.username
                    };
                    async.parallel({
                        users_count: function(callback) {
                            User.count(callback);
                        },
                        tekers_count: function(callback) {
                            Teker.count(callback);
                        },
                        admins_count: function(callback) {
                            Admin.count(callback);
                        },
                        user : function(callback) {
                            User.findOne({_id: req.params.id}).select('_id firstname username lastname phone email location address').exec(callback);
                        }
                    }, function(err, results) {
                        res.render('admin_dashboard/edit_user.jade', { error: err, data: results });
                    });
                }
        });
    }else {
        res.redirect('/admin/login')
    }

});


//MAKING PUT REQUEST TO UPDATE A USER'S Data
//NOTE THAT I USED post INSTEAD OF put HTTP METHOD...
route.post('/:id/edited', function(req, res) {
    if (req.session && req.session.admin){
        Admin.findOne({email : req.session.admin}, function(err, admin) {
            if (!admin){
                req.session.reset();
                res.redirect('/admin/login');
            }else{
                req.session.admin = admin.email;
                res.locals.admin = {
                    id : admin._id,
                    username : admin.username
                };
                var location_details = {
                    town: req.body.town,
                    city: req.body.city,
                    country: req.body.country
                };


                var user_updates = {
                    message: req.body.message,
                    username: req.body.username,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    phone: req.body.phone,
                    email: req.body.email,
                    location: location_details,
                    address: req.body.address
                };

                User.findByIdAndUpdate({_id : req.params.id}, user_updates, function(err, edited_user) {
                    if (!edited_user){
                        req.flash('error', 'Something went wrong, Please try again');
                        res.redirect('/tekers/'+req.params.id+'/edit');
                    }else{
                        //go and delete the tekers old picture
                        req.flash('success', edited_user.firstname+' data was Successfully updated!');
                        res.redirect('/users/'+req.params.id+'/edit');
                    }
                });
            }
        })
    }else{
        res.redirect('/admin/login');
    }
});


//DELETING USER INFO
//NOTE THAT I USED get INSTEAD OF delete HTTP METHOD..
route.get('/:id/delete', function(req, res) {
    //checking for sesssion
    if (req.session && req.session.admin ) {
        Admin.findOne({ email : req.session.admin }, function(err, admin) {
            if(!admin) {
                req.session.reset();
                res.redirect('/admin/login');
            }else{
                req.session.admin = admin.email;
                res.locals.admin = {
                    id : admin._id,
                    firstname : admin.firstname,
                    username: admin.username
                };
                User.findOneAndRemove({_id : req.params.id}, function(err, deleted_user) {
                    if(err){
                        req.flash('error', 'Something went wrong, please try again.');
                        res.redirect('/users');
                    }else{
                        req.flash('success', deleted_user.firstname+' was successfully deleted!');
                        res.redirect('/users');
                    }
                });
            }
        })
    }else{
        res.redirect('/admin/login');
    }
    
});

module.exports = route;




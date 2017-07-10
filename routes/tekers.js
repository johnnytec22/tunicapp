
var express = require('express');
var route = express.Router();
var bcrypt = require('bcryptjs');
var async = require('async');
var Admin = require('../models/admin');
var User = require('../models/user');
var Teker = require('../models/tekers');

//ADDING A NEW TEKER


route.post('/add', function(req, res) {
    if (req.session && req.session.admin){
        Admin.findOne({email: req.session.admin}, function(err, admin) {
            if (!admin) {
                req.session.reset();
                res.redirect('/admin/login');
            }else{
                req.session.admin = admin.email;
                res.locals.admin = {
                    id : admin._id,
                    username : admin.username
                };
                if (!req.files){
                    req.flash('error', 'No File was uploaded');
                    res.redirect('/admin/admin_dashboard');
                }
                var teker_picture_data = req.files.display_picture;
                if (!teker_picture_data){
                    req.flash('error', 'Picture was not uploaded');
                    res.redirect('/admin/admin_dashboard');
                }else{
                    teker_picture_data.mv('./public/images/technician_pictures/'+teker_picture_data.name, function(err) {
                        if (err){
                            req.flash('error', 'An Error occured while uploading your file, Please Try again.');
                            res.redirect('/admin/admin_dashboard');
                        }else{
                            var location_details = {
                                town: req.body.town,
                                city: req.body.city,
                                country: req.body.country
                            };


                            var teker = {
                                image_url: 'images/technician_pictures/'+teker_picture_data.name,
                                message: req.body.message,
                                firstname: req.body.firstname,
                                lastname: req.body.lastname,
                                phone: req.body.phone,
                                email: req.body.email,
                                location: location_details,
                                fields: req.body.field,
                                years_of_experience: req.body.years_of_experience
                            };

                            Teker.create(teker, function(err, added_teker){
                                if(err){
                                    if(err.code === 11000){
                                        req.flash('error', 'A user with the entered email Already exist!');
                                    }else{
                                        req.flash('error', 'Empty required field');
                                    }
                                    res.redirect('/admin/admin_dashboard');
                                }else{
                                    req.flash('success', added_teker.firstname+'\'s data was Successfully Saved');
                                    res.redirect('/admin/admin_dashboard');
                                }
                            });
                            
                        }
                    });
                }
            }
        });
    }else{
        res.redirect('/admin/login');
    }
});



//GETS ALL TEKERS AND LIST THEM - DASHBOARD FUNCTIONALITY AND ALSO VIEW ALL SEARCH FUNCTIONALITY
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
                        tekers : function(callback) {
                            Teker.find().sort({registered_date: -1}).select('_id firstname lastname phone email registered_date').limit(20).exec(callback);
                        }
                    }, function(err, results) {
                        res.render('admin_dashboard/tekers_view.jade', { error: err, data: results });
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
                    Teker.find({$or:[ {'username':  { $regex : new RegExp(search_string, "i") }}, {'email':  { $regex : new RegExp(search_string, "i") }}, {'firstname': { $regex : new RegExp(search_string, "i") }}, {'lastname': { $regex : new RegExp(search_string, "i") }}, {'phone':  { $regex : new RegExp(search_string, "i") }}, {'role': { $regex : new RegExp(search_string, "i") } } ]}).sort({registered_date: -1}).select('_id username firstname lastname phone email registered_date role').exec(function(err, tekers) {
                        if(!(tekers.length > 0)){
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
                                        tekers : tekers,
                                        results : results
                                    }
                                    res.render('admin_dashboard/tekers_view.jade', { errors: err, data});
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


//EDITING TEKER INFO
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
                        teker : function(callback) {
                            Teker.findOne({_id: req.params.id}).select(' _id firstname lastname phone email image_url message location fields years_of_experience').exec(callback);
                        }
                    }, function(err, results) {
                        res.render('admin_dashboard/edit_teker.jade', { error: err, data: results });
                    });
                }
        });
    }else {
        res.redirect('/admin/login')
    }

});


//MAKING PUT REQUEST TO UPDATE A Technician Data
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

                if (req.files.display_picture){

                    req.files.display_picture.mv('./public/images/technician_pictures/'+req.files.display_picture.name, function(err) {
                        if (err){
                            req.flash('error', 'An Error occured while uploading your file, Please Try again.');
                            res.redirect('/tekers/'+req.params.id+'/edit');
                        }else{
                            var location_details = {
                                town: req.body.town,
                                city: req.body.city,
                                country: req.body.country
                            };


                            var teker_updates = {
                                image_url: 'images/technician_pictures/'+req.files.display_picture.name,
                                message: req.body.message,
                                firstname: req.body.firstname,
                                lastname: req.body.lastname,
                                phone: req.body.phone,
                                email: req.body.email,
                                location: location_details,
                                fields: req.body.field,
                                years_of_experience: req.body.years_of_experience
                            };

                            Teker.findByIdAndUpdate({_id : req.params.id}, teker_updates, function(err, edited_teker) {
                                if (err){
                                    req.flash('error', 'Something went wrong, Please try again');
                                    res.redirect('/tekers/'+req.params.id+'/edit');
                                }else{
                                    //go and delete the tekers old picture
                                    req.flash('success', edited_teker.firstname+' data was Successfully updated!');
                                    res.redirect('/tekers/'+req.params.id+'/edit');
                                }
                            });
                        }
                    });

                }else{
                    var location_details = {
                        town: req.body.town,
                        city: req.body.city,
                        country: req.body.country
                    };


                    var teker_updates = {
                        message: req.body.message,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        phone: req.body.phone,
                        email: req.body.email,
                        location: location_details,
                        fields: req.body.field,
                        years_of_experience: req.body.years_of_experience
                    };

                    Teker.findByIdAndUpdate({_id : req.params.id}, teker_updates, function(err, edited_teker) {
                        if (err){
                            req.flash('error', 'Something went wrong, Please try again');
                            res.redirect('/tekers/'+req.params.id+'/edit');
                        }else{
                            //go and delete the tekers old picture
                            req.flash('success', edited_teker.firstname+' data was Successfully updated!');
                            res.redirect('/tekers/'+req.params.id+'/edit');
                        }
                    });
                }
            }
        })
    }else{
        res.redirect('/admin/login');
    }
});


//DELETING TEKER INFO
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
                    firstname : admin.firstname
                };
                Teker.findOneAndRemove({_id : req.params.id}, function(err, deleted_teker) {
                    if(err){
                        req.flash('error', 'Something went wrong, please try again.');
                        res.redirect('/tekers');
                    }else{
                        req.flash('success', deleted_teker.firstname+' was successfully deleted!');
                        res.redirect('/tekers');
                    }
                });
            }
        })
    }else{
        res.redirect('/admin/login');
    }
    
});

module.exports = route;




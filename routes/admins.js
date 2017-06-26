var express = require('express');
var bcrypt = require('bcryptjs');
var async = require('async');
var Admin = require('../models/admin');
var User = require('../models/user');
var Teker = require('../models/tekers');
var route = express.Router();


//GET A LIST OF ADMINISTRATORS
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
                        admins : function(callback) {
                            Admin.find().sort({registered_date: -1}).select('_id firstname lastname phone email registered_date role').limit(20).exec(callback);
                        }
                    }, function(err, results) {
                        res.render('admin_dashboard/admins_view.jade', { error: err, data: results });
                    });
                }
        });
    }else {
        res.redirect('/admin/login')
    }

});


//ASKING FOR ADMIN REGISTERATION FORM..
route.get('/register', function(req, res) {
    if(req.session && req.session.admin) {
        Admin.findOne({email: req.session.admin}, function(err, admin) {
            if (!admin) {
                req.session.reset();
                res.redirect('/admin/login');
            }else{
                req.session.admin = admin.email;
                res.locals.admin = {
                    id : admin._id,
                    username: admin.username
                };
                if (admin.role === 'super admin'){
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
                        admin : function(callback) {
                            Admin.findOne({_id: req.params.id}).select('_id firstname lastname phone email username role').exec(callback);
                        }
                    }, function(err, results) {
                        res.render('admin_dashboard/admin_register.jade', { errors: err, data: results });
                    });
                }else{
                    req.flash('error', 'Sorry, Only Super Administrators can register an Administrator');
                    res.redirect('/admin/admin_dashboard');
                }
            }
        })
    }else{
        res.redirect('/admin/login');
    }
});



//POSTING ADMIN'S DATA FOR REGISTERATION
//ROUTE FOR REGISTERING ADMINISTRATORS - posting registration informations
route.post('/register', function(req, res) {
    if(req.session && req.session.admin) {
        Admin.findOne({email: req.session.admin}, function(err, admin) {
            if(!admin) {
                req.session.reset();
                res.redirect('/admin/login');
            }else{
                req.session.admin = admin.email;
                res.locals.admin = {
                    id : admin._id,
                    username : admin.username
                }
                if (admin.role === 'super admin'){
                    req.checkBody('admin_password', 'password is required').notEmpty();
                    var error = req.validationErrors();

                    if (error){
                        req.flash('error', error[0].msg);
                        res.redirect('/admins/register');
                    }else{
                        var salt = bcrypt.genSaltSync(10);
                        var hash = bcrypt.hashSync(req.body.admin_password, salt);

                        var admin = {
                            firstname: req.body.admin_firstname,
                            lastname: req.body.admin_lastname,
                            phone: req.body.admin_phone,
                            email: req.body.admin_email,
                            username: req.body.admin_username,
                            password: hash,
                            role: req.body.admin_role
                        };
                        
                        Admin.create(admin, function(err, admin) {
                            if (err) {
                                var error = "Empty required field, please try again";
                                if (err.code === 11000) {
                                    error = "Email or Username already exist"
                                }
                                req.flash('error', error);
                                res.redirect('/admins/register');
                            }else{
                                req.flash('success', 'Admin '+admin.firstname+' has been successfully register.');
                                res.redirect('/admins/register');
                            }

                        });
                    }
                }else{
                    req.flash('error', 'Sorry, Only Super Administrators can perform this operation');
                    res.redirect('/admins');
                }
            }
        })
    }else{
        res.redirect('/admin/login');
    }

    
    
});

//EDITING AN ADMIN'S DATA
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
                    
                    if (admin.role === 'super admin') {
                        Admin.findById({_id : req.params.id}, function(err, admin_to_update) {
                            if (!admin_to_update) {
                                req.flash('error', 'Something went wrong, Please try again');
                                res.redirect('/admins');
                            }else{
                                if(admin_to_update.role === 'super admin'){
                                    req.flash('error', 'Sorry, You cannot edit a Super Administrator');
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
                                            },
                                            admin : function(callback) {
                                                Admin.findOne({_id: req.params.id}).select('_id firstname lastname phone email username role').exec(callback);
                                            }
                                        }, function(err, results) {
                                            res.render('admin_dashboard/edit_admin.jade', { error: err, data: results });
                                    });
                                }
                            }
                        })
                        
                    }else{
                        req.flash('error', 'Sorry, Only Super Administrators can perform this operation');
                        res.redirect('/admins');
                    }
                    
                }
        });
    }else {
        res.redirect('/admin/login');
    }

});


//MAKING PUT REQUEST TO UPDATE An Administrator's Data
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
                if(admin.role === 'super admin') {
                    Admin.findById({_id : req.params.id}, function(err, admin_to_update) {
                        if (!admin_to_update) {
                            req.flash('error', 'Something went wrong, Please try again.');
                            res.redirect('/admins');
                        }else{
                            if (admin_to_update.role === 'super admin'){
                                req.flash('error', 'Sorry, You cannot edit a Super Administrator!');
                                res.redirect('/admins');
                            }else{
                                var admin_updates = {
                                    firstname: req.body.admin_firstname,
                                    lastname: req.body.admin_lastname,
                                    phone: req.body.admin_phone,
                                    email: req.body.admin_email,
                                    username: req.body.admin_username,
                                    role: req.body.admin_role
                                };

                                Admin.findByIdAndUpdate({_id : req.params.id}, admin_updates, function(err, edited_admin) {
                                    if (err){
                                        req.flash('error', 'Something went wrong, Please try again');
                                        res.redirect('/admins');
                                    }else{
                                        req.flash('success', edited_admin.username+' data was Successfully updated!');
                                        res.redirect('/admins/'+req.params.id+'/edit');
                                    }
                                });
                            }
                        }
                    });
                    
                }else{
                    req.flash('error', 'Sorry, Only Super Administrators can perform this operation');
                    res.redirect('/admins');
                }

            }
        });
    }else{
        res.redirect('/admin/login');
    }

});



//MAKING A REQUEST FOR AN ADMIN TO BE DELETED
//NOTE THAT I USED get INSTEAD OF delete HTTP METHOD..
route.get('/:id/delete', function(req, res) {
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
                
                if (admin.role === 'super admin') {

                    Admin.findById({_id : req.params.id}, function(err, admin_to_delete) {
                        if(!admin_to_delete){
                            req.flash('error', 'Something went wrong, Please try again');
                            res.redirect('/admins');
                        }else{
                            if(admin_to_delete.role === 'super admin'){
                                req.flash('error', 'Sorry, You cannot delete a Super Administrator');
                                res.redirect('/admins');
                            }else{
                                Admin.findByIdAndRemove({_id : req.params.id}, function(err, deleted_admin) {
                                    if(err){
                                        req.flash('error', 'Something went wrong, please try again.');
                                        res.redirect('/admins');
                                    }else{
                                        req.flash('success', deleted_admin.username + ' was successfully deleted!');
                                        res.redirect('/admins');
                                    }
                                });
                            }
                        }
                    });

                }else{
                    req.flash('error', 'Sorry, Only Super Administrator can perform this operation!');
                    res.redirect('/admins');
                }
                
            }
        });
    }else{
        res.redirect('/admin/login');
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
                    Admin.find({$or:[ {'username':  { $regex : new RegExp(search_string, "i") }}, {'email':  { $regex : new RegExp(search_string, "i") }}, {'firstname': { $regex : new RegExp(search_string, "i") }}, {'lastname': { $regex : new RegExp(search_string, "i") }}, {'phone':  { $regex : new RegExp(search_string, "i") }}, {'role': { $regex : new RegExp(search_string, "i") } } ]}).sort({registered_date: -1}).select('_id username firstname lastname phone email registered_date role').exec(function(err, admins) {
                        if(!(admins.length > 0)){
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
                                        admins : admins,
                                        results : results
                                    }
                                    res.render('admin_dashboard/admins_view.jade', { errors: err, data});
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





module.exports = route;
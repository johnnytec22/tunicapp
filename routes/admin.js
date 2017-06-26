var express = require('express');
var bcrypt = require('bcryptjs');
var async = require('async');
var Admin = require('../models/admin');
var User = require('../models/user');
var Teker = require('../models/tekers');
var route = express.Router();





//REQUESTING FOR LOGIN PAGE
route.get('/login', function(req, res) {
    res.render('admin_pages/admin_login.jade');
});


//ADMIN LOGIN
route.post('/login', function(req, res) {
    var querry = {username: req.body.username};
    
    Admin.findOne(querry, function(err, admin) {
        if (!admin) {
            req.flash('error', 'Incorrect username or password');
            res.render('admin_pages/admin_login.jade');
        }else {
            if (bcrypt.compareSync(req.body.password, admin.password)) {
                req.session.admin = admin.email;
                req.flash('success', 'Welcome, Admin '+admin.firstname);
                res.redirect('/admin/admin_dashboard');
            }else{
                req.flash('error', "Incorrect username or password");
                res.render('admin_pages/admin_login.jade');
            }
        }

    });
});

//ADMIN LOGOUT
route.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/admin/login');
})



//ADMIN DASHBOARD VIEW REQUEST - admin must be logged in
route.get('/admin_dashboard', function(req, res)  {

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
                        latest_users: function(callback) {
                            User.find().sort({registered_date: -1}).select('firstname lastname email registered_date').limit(10).exec(callback);
                        },
                        tekers_count: function(callback) {
                            Teker.count(callback);
                        },
                        admins_count: function(callback) {
                            Admin.count(callback);
                        }
                    }, function(err, results) {
                        res.render('admin_dashboard/admin_dashboard.jade', {errors : err, data: results });
                    });
                }
        });
    }else {
        res.redirect('/admin/login');
    }

});


module.exports = route;
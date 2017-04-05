 var express = require('express');
 var path = require('path');

 exports = module.exports = function(users, chathistory) {
    var _users = users;
    var _chathistory = chathistory;
    var router = express.Router();


     router.route('/')
         .get(function(req, res) {
             res.sendFile(path.join(__dirname + '/index.html'));
         });

    router.route('/users')
        .get(function(req, res) {
            res.status(200).send({errors: null, data: _users.getAll()});
        });    
        
    router.route('/history')
        .get(function(req, res) {
            res.status(200).send({errors: null, data: _chathistory.getAll()});
        });

     return {
         router: router
     }
 };
 
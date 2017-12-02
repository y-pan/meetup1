const vars = require('../config/vars');
const secret = require('../config/secret');          // secret info like db connection(has username and pass)

const express = require('express');
const router = express.Router();
//const passport = require('passport');
//const jwt = require('jsonwebtoken');

const User = require('../models/user');    // user mongoose model
const Group = require('../models/group');  // user will join group 

// 
router.get('/', (req, res)=>{res.send("api version: 1");});

// here is the business
//router.get('/user', passport.authenticate('jwt',{session:false}), (req, res)=>{
    //res.json({ "adminAuthenticated": true });
//});  

// ### Register : req.body is better maintainable, just need to modify model and done
router.post('/user/register',(req,res,next)=>{
    let newUser;
    newUser = new User(req.body);  
    console.log(newUser.email);

    // check if email already used, don't proceed

    User.getUserByQueryJson({"email":newUser.email},(err,data)=>{
        if(err){
            res.json({"err":vars.MSG.ERROR_CONNECTION});
        }else{
            if(data){
                res.json({"err":vars.MSG.ERROR_EMAIL_DUPLICATED});
            }else{
                // ok to use this email, clientside should check password valid(not empty, ...)
                User.addUser(newUser, (err, data)=>{
                    if(err){res.json({"err":vars.MSG.ERROR_OPERATIO});}
                    else{ res.json({"data":data});}
                });
            }
        }
    })


    // User.getUserByQueryJson({"email":newUser.email},(err,data)=>{
    //     if(err){
    //         res.json({"err":vars.MSG.ERROR_CONNECTION,"data":null});
    //     }else{
    //         if(data){
    //             res.json({"err":vars.MSG.ERROR_EMAIL_DUPLICATED, "data":null});
    //         }else{
    //             // ok to use this email, clientside should check password valid(not empty, ...)
    //             User.addUser(newUser, (err, data)=>{
    //                 if(err){res.json({"err":vars.MSG.ERROR_OPERATION, "data":null});}
    //                 else{ res.json({"err":null,"data":data});}
    //             });
    //         }
    //     }
    // })


    
});

// ### login: http://localhost:3000/api/user/login?email=panyunkui2@gmail.com&password=111
router.post("/user/login", (req, res)=>{
    let obj = {};
    let email = req.query.email;
    let password = req.query.password;
    if(email && password){          // post via url
        obj = {email,password};
    }else{                          // post via body 
        obj = req.body;
    }
    
    User.getUserByQueryJson(obj,(err,data)=>{
        if(err){
            res.json({"err":vars.MSG.ERROR_CONNECTION});
        }else{
            if(!data){
                res.json({"err":vars.MSG.ERROR_NOTFOUND});
            }else{
                res.json({"data":data});
            }
        }
    })

    // User.getUserByQueryJson(obj,(err,data)=>{
    //     if(err){
    //         res.json({"err":vars.MSG.ERROR_CONNECTION,"data":null});
    //     }else{
    //         if(!data){
    //             res.json({"err":vars.MSG.ERROR_NOTFOUND,"data":null});
    //         }else{
    //             res.json({"err":null,"data":data});
    //         }
    //     }
    // })
})

// 
router.get('/user', (req, res)=>{
    
    User.findAll((err,data)=>{
        res.json(data);
    })
});




router.get('/group', (req, res)=>{
    Group.findAll((err,data)=>{
        res.json(data);
    })
});


//http://localhost:5000/api/user_gps?email=panyunkui@gmail.com&lat=-123.111&lon=111.000&code=abc
router.get('/user_gps/', (req,res,next)=>{
    console.log('user_gps');
    let email = req.query.email;
    let lat = req.query.lat;
    let lon = req.query.lon;
    let code= req.query.code;

    User.updateGps(email, lat, lon, code, (err, data)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(data);
        }
    })
})



module.exports = router; 
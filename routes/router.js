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

// http://localhost:3000/api/user/login?email=panyunkui2@gmail.com&password=111
router.post("/user/login/", (req, res)=>{
    let email = req.query.email;
    let password = req.query.password;
    let obj = {email,password}
    console.log("reg request using obj", obj);
    
    User.getUserByQueryJson(obj,(err,data)=>{
        // console.log("validate: err="+err+"\ndata="+data);
        if(err){
            res.json({"err":err,"data":null});
        }else{
            if(data){
                res.json({"err":null,"data":data});
            }else{
                res.json({"err":"User not found","data":null});
            }
            
        }
    })
    // User.getUserByEmailPassword(email,password,(err,data)=>{
    //     console.log("validate: err="+err+"\ndata="+data);
    //     if(err){
    //         res.json({"err":err,"data":null});
    //     }else{
    //         if(data){
    //             res.json({"err":null,"data":data});
    //         }else{
    //             res.json({"err":"User not found","data":null});
    //         }
            
    //     }
    // })
    
})




router.get('/user', (req, res)=>{
    User.findAll((err,data)=>{
        res.json(data);
    })
});
router.post('/user',(req,res,next)=>{
    let newUser = new User(req.body);
    User.addUser(newUser, (err, data)=>{
        if(err){res.json({success:false, msg:"Operation failed - " + err});}
        else{res.json({success:true, msg:"User added successfully."});}
    });
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
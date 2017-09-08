// data rules: no duplicated email among users, so you can 
// loc: [lat, lon]
const vars = require('../config/vars');
const mongoose = require('mongoose');
const Group = require('./group');
const Lib = require('../Lib/lib1');
const UserSchema = mongoose.Schema({
    email:{type:String, require:true},
    name:{type:String, require:true },
    number:{type:String},
    password:{type:String},
    groupCodes:{type:[String]},
    loc: { type: [Number]}
    
},{collection:'user'});

/**
{
    "email":"panyunkui2@gmail.com",
    "name":"Yun",
    "number":"6471231234",
    "password":"111",
    "groupCodes":["abc123"],
    "loc": [100.11,-55.78]
}
 */

const User = module.exports = mongoose.model('user',UserSchema);

module.exports.findAll = (callback) =>{
    User.find({},callback);
};

module.exports.addUser = (newUser, callback) =>{
    newUser.save(callback); // newUser is a mongoose object
};

module.exports.getUserByEmail = (email, callback)=>{
    const query = {email:email};
    User.findOne(query, callback);
};

module.exports.getUserByEmail_p = (email) =>{
    return new Promise((resolve, reject) =>{
        const query = {email:email};
        User.findOne(query,(err,data)=>{
            if(err){ reject(vars.MSG.ERROR_CONNECTION); }
            else if(!data){
                reject(vars.MSG.ERROR_NOTFOUND);
            }
            else{ resolve(data); }
        });
    });
}



module.exports.getUserById = (id,callback)=>{
    User.findById(id, callback); // id refers to _id. When mongodb saves an data object(document) into collection, it creats unique _id within the document, as an additional attribute
};

module.exports.updateUserById = (id, body, callback) => {
    User.findById(id, (err, userFound)=>{
        if(err){ throw err;}
        else {
            userFound.name = body.name || userFound.name;
            userFound.number = body.number || userFound.number;
            userFound.email = body.email || userFound.email;
            userFound.groupCodes = body.groupCodes || userFound.groupCodes;
            userFound.loc = body.loc || userFound.loc;

            userFound.save((err, userFound) =>{
                if(err) {callback(err,null); }
                else{ callback(null, userFound); }
            })
        }
    })    
};
// status:0 - not connected, -1 - not found 
module.exports.deleteUserById = (id, callback) => {
    User.findById(id, (err, userFound)=>{
        if(err){callback({code:vars.msgCode.notConnected})}
        else if(!userFound){ callback({code:vars.msgCode.notFound}); }
        else{userFound.remove((err, userFound)=>{
            if(err){ callback({code:vars.msgCode.dbOperationError})}
            else{ callback({code:vars.msgCode.success})}
        })}
    });
};

module.exports.updateGps = (email,lat,lon,code,callback) =>{
    
    Promise.all([User.getUserByEmail_p(email), Group.getGroupByCode_p(code)]).then(responses=>{
        let _user = responses[0];
        let _group = responses[1];
        //console.log("\n+++++++++++++++++++\n" + _user);
        //console.log("\n*******************\n" + _group);
        // now to calculate distance of 
        _user.save()

        _user.loc = [lat,lon];
        _user.save((err, user) =>{
            if(err) {callback(err,null); }
            else{ 
                //callback(null, user); 
                //get distance
                // Lib to do distance _user.loc and _group.loc  !!!!!!!!!!!!!!!
            }
        })
    }).catch(errors => {
        callback("Some error happened", null);
    })
/*
    User.getUserByEmail_p(email).then((user)=>{
        //callback(null,user);
        let _user = user;
        // save to db
        console.log("user not yet saved to db");
        Group.getGroupByCode_p(code).then((group)=>{
            console.log("+++++++++++++++++++" + _user);
            console.log("*******************" + group);
        }).catch((err) =>{ callback(err,null)})
    }).catch((err)=>{
        callback(err,null);
    })*/
} 

//(callback(null,data)).catch(callback("error",null));
    /*
    User.getUserByEmail(email,(err,userFound)=>{
        if(err){ callback(vars.MSG.ERROR_CONNECTION, null); }
        else if(!userFound) { callback(vars.MSG.ERROR_NOTFOUND, null); }
        else{
            //callback(null, userFound);
            // so user fould, update user gps
            userFound.loc = [lat,lon];
            userFound.save((err, userFound) =>{
                if(err) {callback(err,null); }
                else{ 
                    callback(null, userFound); 
                
                }
            })
            
        }
       
    }) ;*/
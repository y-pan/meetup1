// user has multiple groups, one host group, others are guest groups
// group has event gps, set by host group
// distance between user and group need to be close enough to mark user attended group, group will record user

// data rules: no duplicated code, members and membersIn is email
// loc: [lat, lon]

const mongoose = require('mongoose');

const GroupSchema = mongoose.Schema({
    name:{type:String, require:true},
    code:{type:String, require:true},
    discription:{type:String},
    size:{type:Number},
    owner:{type:String},
    members:{type:[String]},
    membersIn:{type:[String]},
    radius:{type:Number},
    loc: { type: [Number]},
    eventStartTime:{type: Date, default: Date.now},
    eventEndTime:{type: Date}
},{collection:'group'});


//coordinates:req.body.coordinates.split(',').map(Number)

//var distance = require('gps-distance');
// Measure between two points: 
//var result = distance(45.527517, -122.718766, 45.373373, -121.693604);


const Group = module.exports = mongoose.model('group',GroupSchema);

module.exports.findAll = (callback) =>{
    Group.find({},callback);
};

module.exports.addGroup = (newGroup, callback) =>{
    newGroup.save(callback); // newGroup is a mongoose object
};

module.exports.getGroupByCode_p = (code) => {
    return new Promise((resolve, reject) => {
        const query = {code:code};
        Group.findOne(query, (err, data)=>{
            if(err){ reject(vars.MSG.ERROR_CONNECTION); }
            else if(!data){
                reject(vars.MSG.ERROR_NOTFOUND);
            }
            else{ resolve(data); }
        });
    }); 
};


module.exports.getGroupByName = (name, callback)=>{
    const query = {name:name};
    Group.findOne(query, callback);
};


module.exports.getGroupById = (id,callback)=>{
    Group.findById(id, callback); // id refers to _id. When mongodb saves an data object(document) into collection, it creats unique _id within the document, as an additional attribute
};

module.exports.updateGroupById = (id, body, callback) => {
    Group.findById(id, (err, groupFound)=>{
        if(err){ throw err;}
        else {
            groupFound.name = body.name || groupFound.name;
            groupFound.number = body.number || groupFound.number;
            groupFound.groupCodes = body.groupCodes || groupFound.groupCodes;
            groupFound.geometry = body.geometry || groupFound.geometry;

            groupFound.save((err, groupFound) =>{
                if(err) {callback(err,null); }
                else{ callback(null, groupFound); }
            })
        }
    })    
};

module.exports.deleteGroupById = (id, callback) => {
    Group.findById(id, (err, groupFound)=>{
        if(err){callback({connected:false})}
        else if(!groupFound){ callback({connected:true, found:false}); }
        else{groupFound.remove((err, groupFound)=>{
            if(err){ callback({connected:true, found: true, removed:false})}
            else{ callback({connected:true, found: true, removed:true})}
        })}
    });
};
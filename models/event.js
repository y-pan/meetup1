// user has multiple events, host event / guest event
// event has event gps, set by host event
// distance between user and event need to be close enough to mark user attended event, event will record user

// data rules: no duplicated code, members and membersIn is email
// loc: [lat, lon]

const mongoose = require('mongoose');

const EventSchema = mongoose.Schema({
    host_id:{type:String, require:true},
    title:{type:String, require:true},
    discription:{type:String},
    subtitle:{type:String},
    latitude:{type:Number},
    longitude:{type:Number},
    date:{type:String}, /* start date of event */
    address:{type:String},

    members:{type:[String]},  /* members' _id who are enrolled to attend event */
    membersIn:{type:[String]},/* members' _id who actually marked attendance during valid time, within radius  */

    size:{type:Number},    /* max audience size */
    radius:{type:Number},   /* radius, within radius will be marked as attended, within valid duration */
    duration:{type:Number}  /* number of hours from the start date, so end-date = start-data + duration */

},{collection:'event'});
// eventStartTime:{type: Date, default: Date.now},

//coordinates:req.body.coordinates.split(',').map(Number)

//var distance = require('gps-distance');
// Measure between two points: 
//var result = distance(45.527517, -122.718766, 45.373373, -121.693604);

const Event = module.exports = mongoose.model('event',EventSchema);

module.exports.findAll = (callback) =>{
    Event.find({},callback);
};

module.exports.addEvent = (newEvent, callback) =>{
    newEvent.save(callback); // newEvent is a mongoose object
};

module.exports.getEventsByQueryJson = (jsonObject, callback)=>{
    const query = jsonObject;
    Event.find(query, callback); 
};

module.exports.getEventByQueryJson = (jsonObject, callback)=>{
    const query = jsonObject;
    Event.findOne(query, callback); 
};





// ===========================================
module.exports.getEventsByHostId = (host_id, callback)=>{
    const query = {host_id:host_id};
    

    Event.find(query, callback);
};
module.exports.getEventByCode_p = (code) => {
    return new Promise((resolve, reject) => {
        const query = {code:code};
        Event.findOne(query, (err, data)=>{
            if(err){ reject(vars.MSG.ERROR_CONNECTION); }
            else if(!data){
                reject(vars.MSG.ERROR_NOTFOUND);
            }
            else{ resolve(data); }
        });
    }); 
};


module.exports.getEventByName = (name, callback)=>{
    const query = {name:name};
    Event.findOne(query, callback);
};




module.exports.getEventById = (id,callback)=>{
    Event.findById(id, callback); // id refers to _id. When mongodb saves an data object(document) into collection, it creats unique _id within the document, as an additional attribute
};

module.exports.updateEventById = (id, body, callback) => {
    Event.findById(id, (err, eventFound)=>{
        if(err){ throw err;}
        else {
            eventFound.name = body.name || eventFound.name;
            eventFound.number = body.number || eventFound.number;
            eventFound.eventCodes = body.eventCodes || eventFound.eventCodes;
            eventFound.geometry = body.geometry || eventFound.geometry;

            eventFound.save((err, eventFound) =>{
                if(err) {callback(err,null); }
                else{ callback(null, eventFound); }
            })
        }
    })    
};

module.exports.deleteEventById = (id, callback) => {
    Event.findById(id, (err, eventFound)=>{
        if(err){callback({connected:false})}
        else if(!eventFound){ callback({connected:true, found:false}); }
        else{eventFound.remove((err, eventFound)=>{
            if(err){ callback({connected:true, found: true, removed:false})}
            else{ callback({connected:true, found: true, removed:true})}
        })}
    });
};
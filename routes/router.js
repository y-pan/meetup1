const vars = require('../config/vars');
const secret = require('../config/secret');          // secret info like db connection(has username and pass)

const express = require('express');
const router = express.Router();
//const passport = require('passport');
//const jwt = require('jsonwebtoken');

const User = require('../models/user');    // user mongoose model
//const Group = require('../models/group');  // user will join group 
const Event = require('../models/event');  // user will join event 

// 
router.get('/', (req, res) => { res.send("api version: 1"); });

// here is the business
//router.get('/user', passport.authenticate('jwt',{session:false}), (req, res)=>{
//res.json({ "adminAuthenticated": true });
//});  

// ### [1] Register : req.body is better maintainable, just need to modify model and done
router.post('/user/register', (req, res, next) => {
    let newUser;
    newUser = new User(req.body);
    console.log(newUser.email);

    // check if email already used, don't proceed

    User.getUserByQueryJson({ "email": newUser.email }, (err, data) => {
        if (err) {
            res.json({ "err": vars.MSG.ERROR_CONNECTION });
        } else {
            if (data) {
                res.json({ "err": vars.MSG.ERROR_EMAIL_DUPLICATED });
            } else {
                // ok to use this email, clientside should check password valid(not empty, ...)
                User.addUser(newUser, (err, data) => {
                    if (err) { res.json({ "err": vars.MSG.ERROR_OPERATIO }); }
                    else { 
                        data.password = ""; // empty password for security purpose
                        res.json({ "data": data }); 
                    }
                });
            }
        }
    })
});

// ### [2] login: http://localhost:3000/api/user/login?email=panyunkui2@gmail.com&password=111
router.post("/user/login", (req, res) => {
    let obj = {};
    let email = req.query.email;
    let password = req.query.password;
    if (email && password) {          // post via url
        obj = { email, password };
    } else {                          // post via body 
        //obj = req.body;   // simply using req.body is not safe
        obj = { "email": req.body.email, "password": req.body.password }
    }

    User.getUserByQueryJson(obj, (err, data) => {
        if (err) {
            res.json({ "err": vars.MSG.ERROR_CONNECTION });
        } else {
            if (!data) {
                res.json({ "err": vars.MSG.ERROR_NOTFOUND });
            } else {
                data.password = ""; // empty password for security purpose
                res.json({ "data": data });
            }
        }
    })
})

// ### [2.2] https://meetus01.herokuapp.com/api/user?id=5a3005f4a0b4fd00046e940d (except for password, which is erased, but still there is a field call "password" in json)

router.get("/user", (req, res) => {
    let obj = {};
    let _id = req.query.id;
    if (_id) {          // post via url
        obj = { "_id":_id };
    } else {
        res.json({"err": vars.MSG.ERROR_NOTFOUND});
        return;
    }

    User.getUserByQueryJson(obj, (err, data) => {
        if (err) {
            res.json({ "err": vars.MSG.ERROR_CONNECTION });
        } else {
            if (!data) {
                res.json({ "err": vars.MSG.ERROR_NOTFOUND });
            } else {
                data.password = "";  // remove password for security purpose, UI don't want to show it
                res.json({ "data": data });
            }
        }
    });

})

// ### [3] host create event: http://localhost:3000/api/event
router.post('/event', (req, res) => {
    let newEvent = new Event(req.body);
    console.log(newEvent);

    // check if host_id exists in db
    User.getUserByQueryJson({ "_id": newEvent.host_id }, (err, data) => {
        if (err) {
            res.json({ "err": vars.MSG.ERROR_CONNECTION });
        } else {
            if (!data || data.length == 0) {
                res.json({ "err": vars.MSG.ERROR_HOST_NOTFOUND });
            } else {
                // check if title already used, don't proceed
                Event.getEventByQueryJson({ "title": newEvent.title }, (err, data) => {
                    if (err) {
                        res.json({ "err": vars.MSG.ERROR_CONNECTION });
                    } else {
                        if (data) {
                            res.json({ "err": vars.MSG.ERROR_EVENT_TITLE_DUPLICATED });
                        } else {
                            // ok to use this event, clientside should check other fields if valid(not empty, ...)
                            Event.addEvent(newEvent, (err, data) => {
                                if (err) { res.json({ "err": vars.MSG.ERROR_OPERATIO }); }
                                else { res.json({ "data": data }); }
                            });
                        }
                    }
                });
            }
        }
    })
});

// ### [4] host retrieve all hosting events: http://localhost:3000/api/host_event, http://localhost:3000/api/host_event?host_id=5a2b4f4d166e4d26b8e7cf45

router.post('/host_event', (req, res) => {
    //  {"host_id":"host_id"} */   // obj = req.body  simply using req.body as whole is bad for security concern, but it is lazy way for good code maintainance
    let obj = {};
    let host_id = req.query.host_id;
    if (host_id) {          // post via url
        obj = { "host_id": host_id };
    } else {                          // post via body 
        //obj = req.body;   // simply using req.body is not safe
        obj = { "host_id": req.body.host_id };
    }
    console.log("to post event: " + obj.host_id);
    Event.getEventsByQueryJson(obj, (err, data) => {
        if (err) {
            res.json({ "err": vars.MSG.ERROR_CONNECTION });
            throw err;
        } else {
           
            if (!data || data.length == 0) {
                res.json({ "err": vars.MSG.ERROR_NOTFOUND });
                console.log(vars.MSG.ERROR_NOTFOUND)
            } else {
                res.json({ "data": data });
                console.log(data)
                
            }
        }
    });
});

// new: 
// ### [5] host update a hosting event by event id : http://localhost:3000/api/host_event?event_id=5a2b5122565205215414ba5f
/**
{
    "title": "Christmas Holiday party 4", "subtitle": "sub2"
}
 */
// enforced title must be unique when updating event details
router.put('/host_event', (req, res) =>{
    console.log("[5] req.query.event_id=" + req.query.event_id);

    // check if title already used, don't proceed
    if(req.body.title){
        console.log("[5] req.body.title=" + req.body.title);
        
        Event.getEventByQueryJson({ "title": req.body.title }, (err, data) => {
            if (err) {
                res.json({ "err": vars.MSG.ERROR_CONNECTION });
            } else {
                console.log("[5] 1 req.body.title");
                
                if (data) {
                    console.log("[5] 2 req.body.title");
                    
                    res.json({ "err": vars.MSG.ERROR_EVENT_TITLE_DUPLICATED });
                } else {
                    console.log("[5] 3 req.body.title");
                    // title is fine
                    Event.updateEventById(req.query.event_id, req.body, (err, data) => {
                        if(err){
                            res.json({"err": err}); // model class specified err message already
                        }else{
                            if(!data){
                                res.json({"err":vars.MSG.ERROR_NOTFOUND});
                            }else{
                                res.json({"data":data});
                            }
                            
                        }
                    });
                }
            }
        });
    }else{
        // no change in title
        Event.updateEventById(req.query.event_id, req.body, (err, data) => {
            if(err){
                res.json({"err": err}); // model class specified err message already
            }else{
                if(!data){
                    res.json({"err":vars.MSG.ERROR_NOTFOUND});
                }else{
                    res.json({"data":data});
                }
            
            }
        });
    }
});



// ### [6] host delete a hosting event by event_id : http://localhost:3000/api/host_event?event_id=5a2b52b1fed30b195843a2f5
/**
 * return the original data
 * 
 */
router.delete('/host_event',(req, res)=>{
    // console.log("[6] req.query.event_id=" + req.query.event_id);
    
    Event.deleteEventById(req.query.event_id, (err, data)=>{
        console.log("[6] delete event: " + err + "\n" + data);
        if(err){ 
            res.json({"err":vars.MSG.ERROR_OPERATION}); // model class specified err message already
            console.log("[6] failed to delete event where event_id = " )
        } else{    
            if(!data){
                console.log("[6] event NOT deleted"  )
                res.json({"err":vars.MSG.ERROR_NOTFOUND}); 
            } else{
                console.log("[6] event now deleted : " + data )
                res.json({"data":data}); 
            }

        }
    });
});

// ------------------------------------------------------------
// ### for admin to get all users
router.get('/user', (req, res) => {

    User.findAll((err, data) => {
        res.json(data);
    })
});
// ### for admin to get all events

router.get('/event', (req, res) => {
    Event.findAll((err, data) => {
        res.json(data);
    })
});


//http://localhost:5000/api/user_gps?email=panyunkui@gmail.com&lat=-123.111&lon=111.000&code=abc
router.get('/user_gps/', (req, res, next) => {
    console.log('user_gps');
    let email = req.query.email;
    let lat = req.query.lat;
    let lon = req.query.lon;
    let code = req.query.code;

    User.updateGps(email, lat, lon, code, (err, data) => {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    })
})



module.exports = router; 
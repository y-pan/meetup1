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
                    else { res.json({ "data": data }); }
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
                res.json({ "data": data });
            }
        }
    })

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

// ### [4] host get hosting events: http://localhost:3000/api/host_event

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

    Event.getEventsByQueryJson(obj, (err, data) => {
        if (err) {
            res.json({ "err": vars.MSG.ERROR_CONNECTION });
        } else {
            if (!data || data.length == 0) {
                res.json({ "err": vars.MSG.ERROR_NOTFOUND });
            } else {
                res.json({ "data": data });
            }
        }
    });
});

// ### [5?] host update a hosting event : http://localhost:3000/api/host_event?id=123abd123jkl
router.put('/host_event/:id', (req, res) =>{
    Event.updateEventById(req.params.id, req.body, (err, data) => {
        if(err){
            res.json({"err": err}); // model class specified err message already
        }else{
            res.json({"data":data});
        }
    });

});

// ### [6?] host delete a hosting event
router.delete('/host_event/:id',(req, res)=>{
    Event.deleteEventById(req.params.id, (err, data)=>{
        if(err){ 
            res.json({"err":err}); // model class specified err message already
        } else{ 
            res.json({"data":data}); 
        }
    });
});



router.get('/user', (req, res) => {

    User.findAll((err, data) => {
        res.json(data);
    })
});

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
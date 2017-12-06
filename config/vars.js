module.exports = {
    isDbLocal:false,    
    port:3000,
    msgCode:{
        notConnected:0,
        notFound:1,
        dbOperationError:2,
        success:100
    },
    MSG:{
        ERROR_CONNECTION:"Error in databas connection",
        ERROR_NOTFOUND:"Data not found in database",
        ERROR_OPERATION:"Operation failed in database",
        ERROR_EMAIL_DUPLICATED:"Email is already used",

        ERROR_EVENT_TITLE_DUPLICATED:"Event title duplicated",
        ERROR_HOST_NOTFOUND:"Host user not found in database",



        SUCCESS:"Operation done sucessfully"
    }
    
    
    
}

// isDbLocal => use local mongodb, otherwise use cloud mongodb
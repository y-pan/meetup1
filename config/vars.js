module.exports = {
    port:3000,
    isDbLocal:true,
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
        SUCCESS:"Operation done sucessfully"
    }
    
    
    
}

// isDbLocal => use local mongodb, otherwise use cloud mongodb
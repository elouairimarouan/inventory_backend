const mongoose = require('mongoose');


const activityLoggerSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, 
    },
    action :{
        type: String,
        required: true,

    },
    entity :{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required:true,
    },    entityId :{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
        ipAddress: {
        type: String,
    },
},{ timestamps: true});

module.exports = mongoose.model('ActivityLogger', activityLoggerSchema);

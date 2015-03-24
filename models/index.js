var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/npmTracker');
// mongoose.connect(process.env.MONGOLAB_URI)
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

var Schema = mongoose.Schema;

var packageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    downloads: [{
            day: {type: String, required:true},
            downloads: {type: Number, required:true},
            date: {type:Date,required:true},
            _id:false
    }],
    totalDownloads: Number,
    lastDate: String //use string to validate vs day
})

//packageSchema.pre('save',function(){ write a hook to add to total Downloads})
//write post save hook to $sort the downloads array on date for ease of read?
//mongo docs:'without sort mongo does not guarantee order of query results'
//so don't think sorting on insert serves any purpose
//also need to convert them all to date objects, but do that in the route
//also eventually need a pre-save hook to reset the start/end dates if necessary?

var npmPackage = mongoose.model('Package', packageSchema);


module.exports = {
    "npmPackage": npmPackage
};
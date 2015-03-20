var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/npmTracker');
// mongoose.connect(process.env.MONGOLAB_URI)
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
console.log('RUN')

var Schema = mongoose.Schema;

var packageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    downloads: [{
            day: {type: String, required:true},
            downloads: {type: Number, required:true}
    }],
    totalDownloads: Number
})

//packageSchema.pre('save',function(){ write a hook to add to total Downloads})


var npmPackage = mongoose.model('Package', packageSchema);


module.exports = {
    "npmPackages": npmPackage
};
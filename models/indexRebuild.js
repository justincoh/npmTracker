var mongoose = require('mongoose');

if (typeof process.env.MONGOLAB_URI !== 'undefined') {
    mongoose.connect(process.env.MONGOLAB_URI)
} else {
    mongoose.connect('mongodb://localhost/npmTrackerV2');
};
var async = require('async');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

var Schema = mongoose.Schema;

var packageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    totalDownloads: Number,
    minDate: Date,
    maxDate: Date
});

var downloadSchema = new Schema({
	date: {type:Date,required:true},
	downloads: {type:Number, required:true},
	packageInfo: {type: Schema.Types.ObjectId, ref: 'PackageInfo'},
    packageName: {type:String, required:true} //duplicated to make lookup easier on initial GET
})

// //How to tie this together
// //need to go through download docs and update packageinfo
// packageSchema.pre('save',function(next){
//     if(this.isNew){
//         var maxDate = new Date('2000-01-01');
        
//     }
// })











var npmPackage = mongoose.model('PackageInfo', packageSchema);
var downloadSchema = mongoose.model('Downloads', downloadSchema);

module.exports = {
	'PackageInfo':npmPackage,
	'Downloads':downloadSchema
}


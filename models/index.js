var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/npmTracker');
// mongoose.connect(process.env.MONGOLAB_URI)
var async = require('async');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

var Schema = mongoose.Schema;

var packageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    downloads: [{
        day: {
            type: String,
            required: true
        },
        downloads: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        _id: false
    }],
    totalDownloads: Number,
    lastDate: String //use string to validate vs day TODO
});

packageSchema.pre('save', function(next) {
    //going to have to do pre-update with a static, mongoose doesn't handle it
    if (this.isNew) {
        var totalDownloads = 0;
        this.downloads.forEach(function(record) {
            totalDownloads += record.downloads;
        });
        this.totalDownloads = totalDownloads;
    }
    next();

});

packageSchema.statics.recalculateTotals = function() {
    this.find().exec(function(err, docsArray) {
        async.each(docsArray, function(doc, callback) {
            var newTotal = 0;
            doc.downloads.forEach(function(entry){
                newTotal+=entry.downloads;
            });
            doc.totalDownloads = newTotal;
            doc.save();
            callback(null);
        }, function(err) {
            if (err) {
                return console.error('Error Updating Totals')
            } 
            return console.log('Totals Updated')
        })
    })
}


//mongo docs:'without sort mongo does not guarantee order of query results'

var npmPackage = mongoose.model('Package', packageSchema);


module.exports = {
    "npmPackage": npmPackage
};
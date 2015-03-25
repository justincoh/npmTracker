var express = require('express');
var router = express.Router();
var models = require('../models/index.js')

/* GET home page. */
router.get('/', function(req, res) {
    
    return res.render('index')
});


router.get('/populate', function(req, res) {
	models.npmPackage.find().exec(function(err, docs) { 
	//limit this to 5

        res.json(docs);



    });
})













module.exports = router;
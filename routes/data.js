'use strict';
var express = require('express');

var router = express.Router();

router.get('/?', function(req,res){
	console.log(Object.keys(req))
	res.status(200).send();
});


module.exports = router;
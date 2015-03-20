'use strict';
var express = require('express');

var router = express.Router();

router.get('/?', function(req,res){
	console.log('Req Query ',req.query)
	console.log('Req params ',req.params)
	res.status(200).send();
});


module.exports = router;
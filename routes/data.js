'use strict';
var express = require('express');
var router = express.Router();
var models = require('../models/index.js');
var request = require('request');

//Example API Calls
//Broken by day: https://api.npmjs.org/downloads/range/2014-01-03:2014-02-03/jquery

router.get('/?', function(req,res){
	var startDate = req.query.startDate;
	var endDate =  req.query.endDate;
	var packageName = req.query.name;

	var databasePromise = models.npmPackages.findOne({name:packageName}).exec()

	databasePromise.then(function(res){
		if(res === null){//go to api and get it
		}
		console.log("databasePromise res ",res)
	})
	// var monthlyBreakdown =

	console.log('Req Query ',req.query)
	
	res.status(200).send();
});


module.exports = router;
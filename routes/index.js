var express = require('express');
var router = express.Router();
var npmPackages = require('../models/index.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

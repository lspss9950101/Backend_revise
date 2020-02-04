var express = require('express');
var router = express.Router();

var initContainers = require('./../graduate/initContainers.js');
var fetchData = require('./../graduate/fetchData.js');
var mergeDuplicate = require('./../graduate/mergeDuplicates.js');
var classifyCourses = require('./../graduate/classifyCourses.js');
var handleExceptions = require('./../graduate/handleExceptions.js');
var moveCourses = require('./../graduate/moveCourses.js');
var generateSummary = require('./../graduate/generateSummary.js');

function echo(req, res, next){
	console.log(require('util').inspect(req.csca, false, null, true));
	next();
}

router./*post*/get('/student/graduate/detail', 
	initContainers, 
	fetchData,
	mergeDuplicate, 
	classifyCourses, 
	handleExceptions, 
	moveCourses, 
	generateSummary, 
	//echo,
	(req, res, next) => {
		res.json(req.csca.summary);
		//res.json(req.csca);
	}
);

module.exports = router;

var express = require('express');
var router = express.Router();

router.post('/student/graduate/detail', 
	initContainers, 
	queryDB, 
	mergeDuplicate, 
	classifyCourses, 
	handleExceptions, 
	moveCourses, 
	generateSummary, 
	(req, res, next) => {
		res.send(req.data.summary);
	}
);

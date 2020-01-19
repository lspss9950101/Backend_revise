var express = require('express');
var router = express.Router();

router.post('/student/graduate/detail', queryDB, mergeDuplicate, classifyCourses, handleExceptions, includeOffsets, moveCourses, generateSummary, (req, res, next) => {
	res.send(req.data.summary);
});

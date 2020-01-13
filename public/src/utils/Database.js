var query = require('query');
var AsyncFlow = require('asynchronous-flow');

//
// Query Course
//

function queryCourse(req, res, next){
	req.data.course_data = {};

	let flow = new AsyncFlow();
	flow.setArgs(req)
		.setErrorHandler((err) => {
			console.log('>> Error : ', err);
			res.status(500).end();
		})
		.flow(	queryOffsetCorse,
			queryPassedCourse,
			queryOnCourse,
			queryCourseMoveRecord,
			(req) => {
			next();
		});
}

function queryOffsetCorse(req, res, next){
	let student_id = req.data.student_id;
	query.ShowUserOffset(student_id, (err, result) => {
		if(err)next(err);
		else{
			req.data.course_data.offset_course = JSON.parse(result);
			next();
		}
	});
}

function queryPassedCourse(req, res, next){
	let student_id = req.data.student_id;
	query.ShowUserAllScore(student_id, (err, result) => {
		if(err)next(err);
		else{
			req.data.course_data.passed_course = JSON.parse(result);
			next();
		}
	});
}

function queryOnCourse(req, res, next){
	let student_id = req.data.student_id;
	query.ShowUserOnCos(student_id, (err, result) => {
		if(err)next(err);
		else {
			req.data.course_data.on_course = JSON.parse(result);
			next();
		}
	});
}

function queryCourseMoveRecord(req, res, next){
	let student_id = req.data.student_id;
	query.ShowCosMotionLocation(student_id, (err, result) => {
		if(err)next(err);
		else{
			req.data.course_data.move_record = JSON.parse(result);
			next();
		}
	});
}

//
// Course Rules
//

function queryCompulsoryList(req, res, next){
	let student_id = req.data.student_id;
	query.ShowCosGroup(student_id, (err, result) => {
		if(err)res.status(500).end();
		else{
			req.data.course_rule.compulsory = JSON.parse(result);
			next();
		}
	});
}



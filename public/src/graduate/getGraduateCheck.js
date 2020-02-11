var query = require('./../../../../../db/msql');

function getGraduateCheck(req, res, next){
	req.csca = {};
	req.csca.student_id = res.locals.studentId;
	fetchDataInParallel(req)
	.then(() => {
		let default_field;
		switch(req.csca.user_info.program){
			case '資電': case 'D':
				default_field = 3;
				break;
			case '資工': case 'A': case 'B':
				default_field = 2;
				break;
			default:
				default_field = 0;
		}
		req.csca.check_state = {};

		req.csca.check_state.status = (req.csca.user_info.graduate_submit == null) ? 0 : parseInt(req.csca.user_info.graduate_submit);
		req.csca.check_state.general_course_type = (req.csca.user_info.submit_type == null) ? null : parseInt(req.csca.user_info.submit_type);
		req.csca.check_state.professional_field = (req.csca.user_info.net_media == null) ? default_field : parseInt(req.csca.user_info.net_media);

		if(req.csca.student_graduate_state.submit_status == '3')
			req.csca.check_state.reject_reason = req.csca.student_graduate_state.reject_reason;

		next();
	})
	.catch((err) => {
		console.log(err);
		res.redirect('/');
	});
}

async function fetchDataInParallel(req){
	let funcs = [
		fetchUserInfo,
		fetchStudentGraduate
	];

	let promise_list = [];
	funcs.forEach((func) => {
		promise_list.push(new Promise((resolve, reject) => {
			func(req, resolve, reject);
		}));
	});

	return await Promise.all(promise_list);
}

function fetchUserInfo(req, resolve, reject){
	query.ShowUserInfo(req.csca.student_id, (err, result) => {
		if(err)reject(err);
		let user_info = JSON.parse(result);
		req.csca.user_info = user_info[0];
		resolve();
	});
}

function fetchStudentGraduate(req, resolve, reject){
	query.ShowStudentGraduate({student_id: req.csca.student_id}, (err, result) => {
		if(err)reject(err);
		let student_graduate_state = JSON.parse(result);
		req.csca.student_graduate_state = student_graduate_state[0];
		resolve();
	});
}


module.exports = getGraduateCheck;

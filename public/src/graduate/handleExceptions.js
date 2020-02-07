var Course = require('./Container/Course.js');

function handleExceptions(req, res, next){
	DlabAndMicroControllerBefore105(req);
	QualifiedProElective(req);
	next();
}

function DlabAndMicroControllerBefore105(req){
	if(req.csca.student_id && req.csca.student_id.startsWith('05')){
		let target_course;
		let extra_one_credit_course;

		target_course = req.csca.compulsory.courses.find((course) => (course.cname == '數位電路實驗'));
		if(target_course != null){
			extra_one_credit_course = Object.assign(new Course(), target_course);
			extra_one_credit_course.real_credit = 1;
			extra_one_credit_course.moved = true;
			req.csca.classes.pro_elective.courses.push(extra_one_credit_course);
			target_course.real_credit = 2;
		}

		target_course = req.csca.compulsory.courses.find((course) => (course.cname == '微處理機系統實驗'));
		if(target_course != null){
			extra_one_credit_course = Object.assign(new Course(), target_course);
			extra_one_credit_course.real_credit = 1;
			extra_one_credit_course.moved = true;
			req.csca.classes.pro_elective.courses.push(extra_one_credit_course);
			target_course.real_credit = 2;
		}
	}
}

function QualifiedProElective(req){
	let qualified_course_code = [
		'ECM9032',
		'IAA5718'
	];

	let unchanged = [], moved = [];
	req.csca.classes.elective.courses.forEach((course) => {
		if(qualified_course_code.some((code) => (course.code == code))){
			course.moved = true;
			moved.push(course);
		}
		else unchanged.push(course);
	});

	req.csca.classes.elective.courses = unchanged;
	req.csca.classes.pro_elective.courses.push(...moved);
}

module.exports = handleExceptions;

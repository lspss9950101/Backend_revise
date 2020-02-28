var Course = require('./Container/Course.js');

function handleExceptions(req, res, next){
	DlabAndMicroControllerBefore105(req);
	QualifiedProElective(req);
	next();
}

function DlabAndMicroControllerBefore105(req){
	if(req.csca.student_id && parseInt(req.csca.student_id.substr(0, 2)) <= 5){
		let target_course;
		let extra_one_credit_course;

		target_course = req.csca.classes.compulsory.courses.find((course) => (course.getRepresentingData().cname.startsWith('數位電路實驗')));
		if(target_course != null){
			extra_one_credit_course = Object.assign(new Course(), target_course);
			extra_one_credit_course.code += '_one';
			extra_one_credit_course.real_credit = 1;
			extra_one_credit_course.moved = true;
			req.csca.classes.pro_elective.courses.push(extra_one_credit_course);
			target_course.real_credit = 2;
		}

		target_course = req.csca.classes.compulsory.courses.find((course) => (course.getRepresentingData().cname.startsWith('微處理機系統實驗')));
		if(target_course != null){
			extra_one_credit_course = Object.assign(new Course(), target_course);
			extra_one_credit_course.code += '_one';
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

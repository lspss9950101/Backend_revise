function generateSummary(req, res, next){
	req.csca.summary = {};

	Object.values(req.csca.classes).forEach((course_class) => {course_class.calculateCredit()});

	let total_credit = 0, total_require = 0, english_credit = 0, english_courses = [];

	let credit_classes = [
		'compulsory',
		'pro_elective',
		'elective',
		'language',
		'general_old'
	];

	Object.values(req.csca.classes).forEach((course_class) => {
		req.csca.summary[course_class.title] = course_class.format(req.csca.student_id);
	});

	credit_classes.forEach((class_title) => {
		total_credit += req.csca.classes[class_title].credit;
		total_require += req.csca.classes[class_title].require;
		english_credit += req.csca.classes[class_title].english_credit;
		english_courses.push(...req.csca.classes[class_title].english_courses);
	});

	if(req.csca.data.user_info.submit_type != '1')total_require += 2;

	req.csca.summary.total = {
		acquire: total_credit,
		require: total_require,
	};
		
	req.csca.summary.english = {
		acquire: english_credit,
		require: 1,
		course: english_courses.map((course) => (course.format(req.csca.student_id)))
	};

	next();
}

module.exports = generateSummary;

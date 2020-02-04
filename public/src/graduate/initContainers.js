var CourseClass = require('./Container/CourseClass.js');

function initContainers(req, res, next){
	req.csca = {};

	req.csca.data = {
		taken_courses:		[],
		on_courses: 		[],
		offset_courses: 	[],
		moved_records: 		[],

		compulsory_rules:	[],
		required_credit:	{}
	};

	req.csca.rules = {
		compulsory:	{course_rules: [], codes: []}
	};

	req.csca.courses = {};

	req.csca.classes = {
		compulsory:	new CourseClass('共同必修'),
		pro_elective:	new CourseClass('專業選修'),
		elective:	new CourseClass('其他選修'),
		language:	new CourseClass('外語'),
		general_old:	new CourseClass('通識(舊制)'),
		general_new:	new CourseClass('通識(新制)'),
		PE:		new CourseClass('體育'),
		service:	new CourseClass('服務學習'),
		art:		new CourseClass('藝文賞析'),
		uncount:	new CourseClass('不計入畢業學分'),
		graduate:	new CourseClass('抵免研究所課程'),
		addition:	new CourseClass('雙主修、輔系、學分學程')
	};

	next();
}

module.exports = initContainers;

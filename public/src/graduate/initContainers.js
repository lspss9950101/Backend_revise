var CourseClass = require('./Container/CourseClass.js');

function initContainers(req, res, next){
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
		uncount:	new CourseClass('其他不計入畢業學分'),
		graduate:	new CourseClass('抵免研究所課程'),
		addition:	new CourseClass('雙主修、輔系、學分學程')
	};

	if(req.csca.data.required_credit)completeClassDetails(req);

	next();
}

function completeClassDetails(req){
	req.csca.classes.compulsory.require = parseFloat(req.csca.data.required_credit.compulsory);
	req.csca.classes.pro_elective.require = parseFloat(req.csca.data.required_credit.pro_elective);
	req.csca.classes.elective.require = parseFloat(req.csca.data.required_credit.elective);
	req.csca.classes.language.require = parseFloat(req.csca.data.required_credit.language);

	req.csca.classes.general_old.require = 20;
	req.csca.classes.general_new.require = {
		total:	22,
		core:	6,
		basic:	6,
		cross:	6
	};
	req.csca.classes.PE.require = 6;
	req.csca.classes.service.require = 2;
	req.csca.classes.art.require = 2;
}

module.exports = initContainers;

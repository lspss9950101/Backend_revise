var CourseClass = require('./Container/CourseClass.js');

function initContainers(req, res, next){
	req.csca.courses = {};

	req.csca.classes = {
		compulsory:	new CourseClass('compulsory'),
		pro_elective:	new CourseClass('professional'),
		elective:	new CourseClass('other'),
		language:	new CourseClass('language'),
		general_old:	new CourseClass('general'),
		general_new:	new CourseClass('general_new'),
		PE:		new CourseClass('pe'),
		service:	new CourseClass('service'),
		art:		new CourseClass('art'),
		uncount:	new CourseClass('exclusion'),
		graduate:	new CourseClass('graduate'),
		addition:	new CourseClass('dmajor_minor_program')
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

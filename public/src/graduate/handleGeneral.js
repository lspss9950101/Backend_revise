var Course = require('./Container/Course.js');

function handleGeneral(req, res, next){
	req.csca.classes.general_new.courses = req.csca.classes.general_old.courses.map((course) => (Object.assign(new Course(), course)));

	req.csca.classes.general_old.courses.forEach((course) => {
		course.dimension = course.dimension || course.brief.split('/')[0];
	});

	req.csca.classes.general_new.courses.forEach((course) => {
		course.dimension = course.dimension || course.brief_new.split('(')[0];
	});

	next();
}

module.exports = handleGeneral;

function generateSummary(req, res, next){
	formatCompulsory(req);

	req.csca.summary = [];

	Object.values(req.csca.classes).forEach((course_class) => {course_class.calculateCredit()});

	let classes = req.csca.classes;
	let statistic = {
		total: 			0,
		total_require: 		0,
		compulsory: 		classes.compulsory.credit,
		compulsory_require: 	classes.compulsory.require,
		pro: 			classes.pro_elective.credit,
		pro_require: 		classes.pro_elective.require,
		english: 		0,
		english_require: 	1,
		other: 			classes.elective.credit,
		other_require: 		classes.elective.require,
		general: 		classes.general_old.credit,
		general_require: 	classes.general_old.require,
		general_new: 		classes.general_new.credit.total,
		general_new_require: 	classes.general_new.require.total,
		pe: 			classes.PE.credit,
		pe_require: 		classes.PE.require,
		language: 		classes.language.credit,
		language_require: 	classes.language.require,
		service: 		classes.service.credit,
		service_require: 	classes.service.require,
		art: 			classes.art.credit,
		art_require: 		classes.art.require,
		military: 		classes.uncount.credit,
		graduate: 		classes.graduate.credit,
		dmajor_minor_program: 	classes.addition.credit,
		exclusion:		classes.uncount.credit
	};

	Object.values(req.csca.classes).forEach((course_class) => {
		if(isNaN(course_class.credit))
			statistic.total += course_class.credit.total;
		else
			statistic.total += course_class.credit;

		if(course_class.require != null){
			if(isNaN(course_class.require))
				statistic.total_require += course_class.require.total;
			else
				statistic.total_require += course_class.require;
		}
		statistic.english += course_class.english_credit;
		req.csca.summary.push(course_class.format());
	});

	statistic.total -= req.csca.classes.general_old.credit;

	req.csca.summary.push(statistic);

	next();
}

function formatCompulsory(req){
	req.csca.classes.compulsory.courses = [];
	req.csca.rules.compulsory.course_rules.forEach((rule) => {
		if(rule.courses.length == 0)
			req.csca.classes.compulsory.courses.push(rule.createEmptyCourse());
		else
			req.csca.classes.compulsory.courses.push(...rule.courses);
	});
}

module.exports = generateSummary;

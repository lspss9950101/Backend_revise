function generateSummary(req, res, next){
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
		graduate: 		classes.graduate.credit,
		dmajor_minor_program: 	classes.addition.credit,
		exclusion:		classes.uncount.credit
	};

	let credit_classes = [
		'compulsory',
		'pro_elective',
		'elective',
		'language',
		'general_old'
	];

	Object.values(req.csca.classes).forEach((course_class) => {
		req.csca.summary.push(course_class.format());
	});

	credit_classes.forEach((class_title) => {
		statistic.total += req.csca.classes[class_title].credit;
		statistic.total_require += req.csca.classes[class_title].require;
		statistic.english += req.csca.classes[class_title].english_credit;
	});

	if(req.csca.classes.elective.require == 11)statistic.total_require += 2;

	req.csca.summary.push(statistic);

	next();
}

module.exports = generateSummary;

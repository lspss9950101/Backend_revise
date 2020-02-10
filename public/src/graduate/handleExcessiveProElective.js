function handleExcessiveProElective(req, res, next){
	req.csca.classes.pro_elective.calculateCredit();
	let required_credit = req.csca.classes.pro_elective.require;
	let credit = req.csca.classes.pro_elective.credit;

	while(credit > required_credit){
		if(credit - required_credit < 3){
			let one_credit_course_idx = req.csca.classes.pro_elective.courses.findIndex((course) => (course.realCredit == 1));
			if(one_credit_course_idx == -1)break;
			let one_credit_course = req.csca.classes.pro_elective.courses[one_credit_course_idx];
			req.csca.classes.pro_elective.courses.splice(one_credit_course_idx, 1);
			req.csca.classes.elective.courses.push(one_credit_course);
		}else{
			let three_credit_course_idx = req.csca.classes.pro_elective.courses.findIndex((course) => (course.realCredit == 3));
			let three_credit_course = req.csca.classes.pro_elective.courses[three_credit_course_idx];
			req.csca.classes.pro_elective.courses.splice(three_credit_course_idx, 1);
			req.csca.classes.elective.courses.push(three_credit_course);
		}
	}

	next();
}

module.exports = handleExcessiveProElective;

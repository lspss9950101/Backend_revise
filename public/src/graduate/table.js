function mergeDuplicate(req, res, next){
	req.data.course_data.passed_course.forEach((course) => {
		if(req.data.courses[course.cos_code])req.data.courses.append(course);
		else req.data.course[course.cos_code] = new Course(course);
	});
	req.data.course_data.on_course.forEach((course) => {
		if(req.data.courses[course.cos_code])req.data.courses.append(course);
		else req.data.course[course.cos_code] = new Course(course);
	});
	next();
}

function classifyCourses(req, res, next){
	classifyCoursesByDefault(req, res, () => {
		handleCompulsory(req);
		handlePCB(req);
		handleService(req);
		handleLanguage(req);
		handleExcessiveProElective(req);
		handleGeneralDimension(req);

		next();
	})
}

function handleExceptions(req, res, next){
	next();
}

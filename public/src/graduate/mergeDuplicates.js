function mergeDuplicate(req, res, next){
	req.csca.data.taken_course.forEach((course) => {
		if(req.csca.courses[course.code])req.csca.courses.append(course);
		else req.csca.course[course.code] = new Course(course);
	});
	req.csca.data.on_course.forEach((course) => {
		if(req.csca.courses[course.code])req.csca.courses.append(course);
		else req.csca.course[course.code] = new Course(course);
	});

	next();
}

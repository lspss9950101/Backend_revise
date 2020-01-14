function parseCourse(req, res, next){
	req.data.course_data.offset_course.foreach((raw_course) => {
		let course = new Course(raw_course);
		req.courses.offset.push(course);
	});
	req.data.course_data.passed_course.foreach((raw_course) => {
		let course = new Course(raw_course);
		req.courses.passed.push(course);
	});
	req.data.course_data.on_course.foreach((raw_course) => {
		let course = new Course(raw_course);
		req.courses.on.push(course);
	});
	next();
}

function mergeDuplicate(req, res, next) {
	req.csca.data.taken_courses.forEach((course) => {
		if (req.csca.courses[course.code])req.csca.courses[course.code].append(course);
		else req.csca.courses[course.code] = course;
	});
	req.csca.data.on_courses.forEach((course) => {
		if (req.csca.courses[course.code])req.csca.courses[course.code].append(course);
		else req.csca.courses[course.code] = course;
	});

	next();
}

module.exports = mergeDuplicate;

class CourseClass{
	constructor(title, require){
		this.title = title;
		this.credit = 0;
		this.require = require;
		this.course = [];
	}

	addCourse(course){
		this.course.push(course);
		this.credit += course.real_credit;
	}

	removeCourse(index){
		this.credit -= course.real_credit;
		this.course[index] = {};
	}

	format(){

	}
}

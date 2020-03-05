var english_credit_blacklist = require('./../static/additional_condition.js').english_credit_blacklist;
var CS_course_codes_prefix = require('./../static/additional_condition.js').CS_course_codes_prefix;

var Course = require('./Course.js');

class CourseClass {
	constructor(title) {
		this.title = title;
		this.credit = 0;
		this.english_credit = 0;
		this.courses = [];
		this.english_courses = [];
	}

	calculateCredit() {
		if (this.title == 'general_new') {
			this.credit = {
				total:	0,
				core:	0,
				basic:	0,
				cross:	0
			};
			this.english_credit = 0;
			this.courses.forEach((course) => {
				if (!course.has_passed) return;
				this.credit.total += course.real_credit;
				switch (course.dimension[0]) {
					case '核':
						this.credit.core += course.real_credit;
						break;
					case '校':
						this.credit.basic += course.real_credit;
						break;
					case '跨':
						this.credit.cross += course.real_credit;
						break;
				}
			});
		} else if (this.title == 'pe' || this.title == 'service' || this.title == 'art') {
			this.credit = 0;
			this.english_credit = 0;
			this.credit = this.courses.filter((course) => (course.has_passed)).length;
		} else {
			this.credit = 0;
			this.english_courses = [];
			this.courses.forEach((course) => {
				if (!course.has_passed) return;
				const representing_data = course.getRepresentingData();
				this.credit += course.real_credit;
				if (representing_data.english && !english_credit_blacklist.some((cname) => (representing_data.cname.includes(cname))) && CS_course_codes_prefix.some((prefix) => (course.code.startsWith(prefix))) && !course.code.endsWith('_one')) {
					const new_course = Object.assign(new Course(), course);
					new_course.real_credit = new_course.original_credit;
					this.english_courses.push(new_course);
				}
			});
			this.english_credit = this.english_courses.length;
		}
	}

	format(student_id) {
		const formatted_courses = this.courses.map((course) => (course.format(student_id)));

		const result = {
			acquire:	this.credit,
			require:	this.require,
			course: formatted_courses,
		};

		return result;
	}
}

module.exports = CourseClass;

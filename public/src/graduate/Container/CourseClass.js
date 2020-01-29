var english_credit_blacklist;

class CourseClass{
	constructor(title){
		this.title = title;
		this.credit = 0;
		this.require = -1;
		this.english_credit = 0;
		this.courses = [];
	}

	calculateCredit(){
		this.credit = 0;
		this.english_credit = 0;
		courses.forEach((course) => {
			this.credit += course.real_credit;
			if(course.typeext == '英文授課' && english_credit_blacklist.every((cname) => (course.cname != cname)) && course.code.startsWith('DCP'))
				this.english_credit += course.real_credit;
		});
	}

	format(){
		let formatted_courses = this.courses.map((course) => (course.format()));

		let result = {
			title:		this.title,
			credit:		this.credit,
			require:	this.require,
			course: 	formatted_courses,
		};
		
		return result;
	}
}

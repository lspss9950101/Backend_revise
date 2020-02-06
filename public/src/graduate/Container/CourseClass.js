var english_credit_blacklist = require('./../static/additional_condition.js').english_credit_blacklist;

class CourseClass{
	constructor(title){
		this.title = title;
		this.credit = 0;
		this.english_credit = 0;
		this.courses = [];
	}

	calculateCredit(){
		if(this.title == '通識(新制)'){
			this.credit = {
				total:	0,
				core:	0,
				basic:	0,
				cross:	0
			};
			this.english_credit = 0;
			this.courses.forEach((course) => {
				if(!course.has_passed)return;
				this.credit.total += course.real_credit;
				switch(course.dimension[0]){
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
		}else{
			this.credit = 0;
			this.english_credit = 0;
			this.courses.forEach((course) => {
				if(!course.has_passed)return;
				this.credit += course.real_credit;
				if(course.typeext == '英文授課' && !english_credit_blacklist.some((cname) => (course.cname == cname)) && course.code.startsWith('DCP'))
					this.english_credit += course.real_credit;
			});
		}
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

module.exports = CourseClass;

class Course{
	constructor(raw_course){
		this.code = raw_course.cos_code;
		this.cname = raw_course.cos_cname;
		this.ename = raw_course.cos_ename;
		this.type = raw_course.cos_type;

		this.typeext = raw_course.cos_typeext;
		this.brief = raw_course.brief;
		this.brief_new = raw_course.brief_new;
		this.original_credit = raw_course.cos_credit;
		this.real_credit = raw_course.cos_credit;

		this.year = raw_course.cos_year;
		this.semester = raw_course.semester;
		this.moved = false;
		this.reason = '';

		this.score = {(year + '-' + semester) : raw_course.score};
		this.score_level = {(year + '-' + semester) : raw_course.score_level};
		this.pass_fail = {(year + '-' + semester) : (raw_course.pass_fail == '通過')};
		this.dimension = '';
	}

	append(course){
		let time_id = course.cos_year + '-' + course_semester;
		this.score[time_id] = course.score;
		this.score_level[time_id] = course.score_level;
		this.pass_fail[time_id] = (course.pass_fail == '通過');
	}

	format(){
		let result = {
			cn:			this.cname,
			en:			this.ename,
			score:			this.score,
			code:			this.code,
			realCredit:		this.real_credit,
			originalCredit:		this.original_credit,
			type:			this.type,
			complete:		this.pass_fail,
			grade:			this.score_level,
			english:		(this.typeext.includes('英文授課')), 
			year:			this.year,
			semester:		this.semester,
			reason:			this.reason,
			move:			this.moved,
			dimension:		this.dimension
		};

		return result;
	}
};

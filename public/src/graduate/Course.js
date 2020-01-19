class Course{
	constructor(raw_course){
		this.cos_code = raw_course.cos_code;
		this.cos_cname = raw_course.cos_cname;
		this.cos_ename = raw_course.cos_ename;
		this.cos_type = raw_course.cos_type;
		this.cos_typeext = raw_course.cos_typeext;
		this.brief = raw_course.brief;
		this.brief_new = raw_course.brief_new;
		this.cos_credit = raw_course.cos_credit;
		this.real_credit = raw_course.cos_credit;

		this.cos_year = raw_course.cos_year;
		this.semester = raw_course.semester;
		this.moved = false;
		this.reason = '';

		this.score = {(cos_year + '-' + semester) : raw_course.score};
		this.score_level = {(cos_year + '-' + semester) : raw_course.score_level};
		this.pass_fail = {(cos_year + '-' + semester) : (raw_course.pass_fail == '通過')};
	}

	append(course){
		let time_id = course.cos_year + '-' + course_semester;
		this.score[time_id] = course.score;
		this.score_level[time_id] = course.score_level;
		this.pass_fail[time_id] = (course.pass_fail == '通過');
	}

	format(){
		let result = {
			cn:			this.cos_cname,
			en:			this.cos_ename,
			score:			this.score,
			code:			this.cos_code,
			realCredit:		this.real_credit,
			originalCredit:		this.cos_credit,
			type:			this.cos_type,
			complete:		this.pass_fail,
			grade:			this.score_level,
			english:		(this.cos_typeext.includes('英文授課')), //uncertain
			year:			this.cos_year,
			semester:		this.semester,
			reason:			this.reason,
			move:			this.moved,
			dimension:
		};

		return result;
	}
};

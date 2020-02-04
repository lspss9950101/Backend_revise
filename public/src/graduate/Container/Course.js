class Course{
	constructor(raw_course){
		if(!raw_course)return;
		this.code = raw_course.cos_code;
		this.cname = raw_course.cos_cname;
		this.ename = raw_course.cos_ename;
		this.type = raw_course.cos_type;

		this.typeext = (raw_course.cos_typeext || '');
		this.brief = raw_course.brief;
		this.brief_new = raw_course.brief_new;
		this.original_credit = parseFloat(raw_course.cos_credit);
		this.real_credit = parseFloat(raw_course.cos_credit);

		this.year = (raw_course.cos_year || raw_course.year);
		this.semester = raw_course.semester;
		this.moved = false;
		this.reason = '';

		if(this.year){
			let time_id = this.year + '-' + this.semester;
			this.score = {};
			this.score_level = {};
			this.pass_fail = {};
			this.score[time_id] = (raw_course.score || -1);
			this.score_level[time_id] = (raw_course.score_level || '0');
			this.pass_fail[time_id] = (raw_course.pass_fail == '通過' || raw_course.pass_fail == null);
		}

		this.dimension = '';
	}

	append(course){
		let time_id = course.year + '-' + course.semester;
		this.score = {...this.score, ...course.score};
		this.score_level = {...this.score_level, ...course.score_level};
		this.pass_fail = {...this.pass_fail, ...course.pass_fail};
	}
/*
	copy(){
		let result = Object.assign({}, this);
		result.score = Object.assign({}, this.score);
		result.score_level = Object.assign({}, this.score_level);
		result.pass_fail = Object.assign({}, this.pass_fail);
		return result;
	}
*/
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

module.exports = Course;
class Course{
	constructor(raw_course, is_dummy){
		if(!raw_course)return;
		this.code = raw_course.cos_code;
		this.cname = raw_course.cos_cname;
		this.ename = raw_course.cos_ename || '';
		this.type = raw_course.cos_type;

		this.typeext = (raw_course.cos_typeext || '');
		this.brief = raw_course.brief;
		this.brief_new = raw_course.brief_new;
		this.original_credit = parseFloat(raw_course.cos_credit);
		this.real_credit = parseFloat(raw_course.cos_credit);

		this.moved = false;
		if(raw_course.year)this.reason = 'now';
		else if(raw_course.offset_type == '抵免')this.reason = 'free1';
		else if(raw_course.offset_type == '免修')this.reason = 'free2';
		else this.reason = '';

		this.has_passed = (raw_course.pass_fail == '通過');

		let year = (raw_course.cos_year || raw_course.year);
		let semester = raw_course.semester;
		this.score = {};
		this.score_level = {};
		this.pass_fail = {};
		if(year){
			let time_id = year + '-' + semester;
			this.score[time_id] = (parseInt(raw_course.score) || -1);
			this.score_level[time_id] = (raw_course.score_level || '0');
			this.pass_fail[time_id] = (raw_course.pass_fail == '通過');
		}

		this.dimension = null;
		this.department = raw_course.cos_dep;
		this.is_dummy = (is_dummy == true);
	}

	append(course){
		this.score = {...this.score, ...course.score};
		this.score_level = {...this.score_level, ...course.score_level};
		this.pass_fail = {...this.pass_fail, ...course.pass_fail};

		this.has_passed = this.has_passed || course.has_passed;
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
			complete:		this.has_passed,
			grade:			this.score_level,
			english:		(this.typeext.includes('英文授課')), 
			reason:			this.reason,
			move:			this.moved,
			dimension:		this.dimension
		};

		return result;
	}
};

module.exports = Course;

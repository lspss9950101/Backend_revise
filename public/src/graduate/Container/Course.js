class Course{
	constructor(raw_course, student_id, is_dummy){
		if(!raw_course)return;
		this.code = raw_course.cos_code;
		this.type = raw_course.cos_type;
		this.brief = raw_course.brief;
		this.brief_new = raw_course.brief_new;
		this.original_credit = parseFloat(raw_course.cos_credit);
		this.real_credit = raw_course.year ? 0 : this.original_credit;
		this.moved = false;
		this.has_passed = (raw_course.pass_fail == '通過');
		this.dimension = null;
		this.department = raw_course.cos_dep;
		this.is_dummy = (is_dummy == true);

		this.data = {};

		let year = (raw_course.cos_year || raw_course.year);
		let semester = raw_course.semester;
		let time_id = is_dummy ? 'dummy' : year + '-' + semester;

		this.data[time_id] = {
			cname:		raw_course.cos_cname,
			ename:		raw_course.cos_ename || '',
			typeext:	raw_course.cos_typeext || '',
			pass_fail:	raw_course.pass_fail == '通過',
			score:		{
						year:		parseInt(year),
						score:		parseInt(raw_course.score) || -1,
						grade:		raw_course.score_level || '0',
						semester:	time_id
					},
			english:	(raw_course.cos_typeext || '').includes('英文授課'),
			reason:		''
		}

		if(raw_course.year)this.data[time_id].reason = 'now';
		else if(raw_course.offset_type == '抵免')this.data[time_id].reason = 'free1';
		else if(raw_course.offset_type == '免修')this.data[time_id].reason = 'free2';
	}

	append(course){
		this.data = {...this.data, ...course.data};
		this.real_credit = this.real_credit || course.real_credit;
		this.has_passed = this.has_passed || course.has_passed;
	}

	split(time_id){
		let split_course = Object.assign(new Course(), this);
		split_course.data = {};
		split_course.data[time_id] = this.data[time_id];
		delete this.data[time_id];

		this.has_passed = Object.values(this.data).some((data) => (data.pass_fail));
		
		return split_course;
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
	amount(){
		return this.data.length;
	}

	getRepresentingData(){
		return Object.values(this.data)[0];
	}

	format(student_id){
		let representing_data = this.getRepresentingData();
		let result = {
			cn:			representing_data.cname,
			en:			representing_data.ename,
			scores:			is_dummy ? [] : Object.values(this.data).map((data) => (data.score)).map((score) => ({
				score: score.score,
				grade: score.grade,
				year: score.year - 99 - parseInt(student_id.substr(0, 2)),
				semester: score.semester
			})),
			code:			this.code,
			realCredit:		this.real_credit,
			originalCredit:		this.original_credit,
			type:			this.type,
			complete:		this.has_passed,
			english:		representing_data.english, 
			reason:			representing_data.reason,
			move:			this.moved,
			dimension:		this.dimension
		};

		return result;
	}
};

module.exports = Course;

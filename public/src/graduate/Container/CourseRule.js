var Course = require('./Course.js');

class CourseRule{
	constructor(raw_rule){
		this.cname = raw_rule.cos_cname;
		this.ename = raw_rule.cos_ename;
		this.codes = raw_rule.cos_codes;
		this.courses = [];
	}

	createEmptyCourse(){
		let dummy_raw_course = {
			cos_cname:	this.cname,
			cos_ename:	this.ename,
			score:		'',
			cos_code:	'',
			cos_credit:	0,
			cos_type:	'',
			pass_fail:	'',
			score_level:	{},
			cos_typeext:	'',
			cos_year:	'',
			semester:	'',
			brief:		'',
			brief_new:	''
		};

		return new Course(dummy_raw_course);
	}
}

module.exports = CourseRule;

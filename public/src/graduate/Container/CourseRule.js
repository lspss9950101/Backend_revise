var Course = require('./Course.js');

class CourseRule {
	constructor(raw_rule) {
		this.cname = raw_rule.cos_cname;
		this.ename = raw_rule.cos_ename;
		this.type = raw_rule.cos_type;
		this.codes = raw_rule.cos_codes;
		this.courses = [];
	}

	createEmptyCourse() {
		const dummy_raw_course = {
			cos_cname:	this.cname,
			cos_ename:	this.ename,
			score:	'',
			cos_code:	'',
			cos_credit:	0,
			cos_type:	this.type || '',
			pass_fail:	'',
			score_level:	'',
			cos_typeext:	'',
			brief:	'',
			brief_new:	'',
			cos_dep:	''
		};

		return new Course(dummy_raw_course, true);
	}
}

module.exports = CourseRule;

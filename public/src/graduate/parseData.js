var Course = require('./Container/Course.js');
var CourseRule = require('./Container/CourseRule.js');

function parseData(req, res, next){
	parseTakenCourses(req);
	parseOnCourse(req);
	parseOffsetCourse(req);
	parseMovedRecords(req);
	parseCompulsoryRules(req);
	parseLanguageRules(req);
	parseRequiredCreditNum(req);
	parseUserInfo(req);
	parseStudentGraduate(req);

	next();
}

function parseTakenCourses(req){
	if(!req.csca.raw_data.user_all_score)return;
	if(!req.csca.data)req.csca.data = {};
	req.csca.data.taken_courses = req.csca.raw_data.user_all_score.map((course) => (new Course(course)));
}

function parseOnCourse(req){
	if(!req.csca.raw_data.user_on_cos)return;
	if(!req.csca.data)req.csca.data = {};
	req.csca.data.on_courses = req.csca.raw_data.user_on_cos.map((course) => (new Course(course)));
}

function parseOffsetCourse(req){
	if(!req.csca.raw_data.user_offset)return;
	if(!req.csca.data)req.csca.data = {};
	req.csca.data.offset_courses = req.csca.raw_data.user_offset;
}

function parseMovedRecords(req){
	if(!req.csca.raw_data.cos_motion_locate)return;
	if(!req.csca.data)req.csca.data = {};
	req.csca.data.moved_records = req.csca.raw_data.cos_motion_locate;
}

function parseCompulsoryRules(req){
	if(!req.csca.raw_data.cos_group)return;
	if(!req.csca.rules)req.csca.rules = {};
	req.csca.rules.compulsory = {};
	req.csca.rules.compulsory.codes = [];
	if(req.body.professional_field == 0){
		req.csca.rules.compulsory.course_rules = req.csca.raw_data.cos_group.filter((rule) => (rule.type == '網路' || rule.type == '必修')).map((rule) => {
			req.csca.rules.compulsory.codes.push(...rule.cos_codes);
			return new CourseRule(rule);
		});
	}else if(req.body.professional_field == 0){
		req.csca.rules.compulsory.course_rules = req.csca.raw_data.cos_group.filter((rule) => (rule.type == '多媒體' || rule.type == '必修')).map((rule) => {
			req.csca.rules.compulsory.codes.push(...rule.cos_codes);
			return new CourseRule(rule);
		});
	}else{
		req.csca.rules.compulsory.course_rules = req.csca.raw_data.cos_group.filter((rule) => (rule.type == '必修')).map((rule) => {
			req.csca.rules.compulsory.codes.push(...rule.cos_codes);
			return new CourseRule(rule);
		});
	}
}

function parseLanguageRules(req){
	let dummy_raw_data_freshman_one = {
		cos_cname:	'大一英文（一）',
		cos_ename:	'Freshman English (I)',
		cos_type:	'外語',
		cos_codes:	[]
	};
	let dummy_raw_data_freshman_two = {
		cos_cname:	'大一英文（二）',
		cos_ename:	'Freshman English (II)',
		cos_type:	'外語',
		cos_codes:	[]
	};
	let dummy_raw_data_advanced = {
		cos_cname:	'進階英文',
		cos_ename:	'',
		cos_type:	'外語',
		cos_codes:	[]
	};

	if(!req.csca.rules)req.csca.rules = {};
	req.csca.rules.language = {
		freshman_one:	new CourseRule(dummy_raw_data_freshman_one),
		freshman_two:	new CourseRule(dummy_raw_data_freshman_two),
		advanced:	new CourseRule(dummy_raw_data_advanced)
	};
}

function parseRequiredCreditNum(req){
	if(!req.csca.raw_data.graduate_rule)return;
	if(!req.csca.data)req.csca.data = {};
	req.csca.data.required_credit = {
		compulsory:	req.csca.raw_data.graduate_rule[0].require_credit,
		pro_elective:	req.csca.raw_data.graduate_rule[0].pro_credit,
		elective:	req.csca.raw_data.graduate_rule[0].free_credit,
		language:	req.csca.raw_data.graduate_rule[0].foreign_credit
	};
}

function parseUserInfo(req){
	if(!req.csca.raw_data.user_info)return;
	if(!req.csca.data)req.csca.data = {};
	[req.csca.data.user_info] = req.csca.raw_data.user_info;
}

function parseStudentGraduate(req){
	if(!req.csca.raw_data.student_graduate)return;
	if(!req.csca.data)req.csca.data = {};
	[req.csca.data.graduate_status] = req.csca.raw_data.student_graduate;
}

module.exports = parseData;

var Course = require('./Container/Course.js');
var CourseRule = require('./Container/CourseRule.js');

var query = require('./../../../../../db/msql');

function fetchData(req, res, next){
	req.csca.student_id = res.locals.studentId;
	fetchDataInParallel(req)
	.then(() => {
		completeClassDetails(req);
		next();
	})
	.catch((err) => {
		console.log(err);
	})
}

async function fetchDataInParallel(req){
	let funcs = [
		fetchTakenCourses,
		fetchOnCourses,
		fetchOffsetCourses,
		fetchMovedRecords,
		fetchCompulsoryRules,
		fetchLanguageRules,
		fetchRequiredCreditNum,
		fetchUserInfo
	];

	let promise_list = [];
	funcs.forEach((func) => {
		promise_list.push(new Promise((resolve, reject) => {
			func(req, resolve, reject);
		}));
	});

	return await Promise.all(promise_list);
}

function fetchTakenCourses(req, resolve, reject){
	query.ShowUserAllScore(req.csca.student_id, (err, result) => {
		if(err)reject(err);
		let courses = JSON.parse(result);
		courses.forEach((course) => {
			req.csca.data.taken_courses.push(new Course(course));
		});
		resolve();
	});
}

function fetchOnCourses(req, resolve, reject){
	query.ShowUserOnCos(req.csca.student_id, (err, result) => {
		if(err)reject(err);
		let courses = JSON.parse(result);
		courses.forEach((course) => {
			req.csca.data.on_courses.push(new Course(course));
		});
		resolve();
	});
}

function fetchOffsetCourses(req, resolve, reject){
	query.ShowUserOffset(req.csca.student_id, (err, result) => {
		if(err)reject(err);
		let offsets = JSON.parse(result);
		req.csca.data.offset_courses = offsets;
		resolve();
	});
}

function fetchMovedRecords(req, resolve, reject){
	query.ShowCosMotionLocate(req.csca.student_id, (err, result) => {
		if(err)reject(err);
		let records = JSON.parse(result);
		req.csca.data.moved_records = records;
		resolve();
	});
}

function fetchCompulsoryRules(req, resolve, reject){
	query.ShowCosGroup(req.csca.student_id, (err, result) => {
		if(err)reject(err);
		let rules = JSON.parse(result);
		req.csca.data.compulsory_rules = rules;
		if(req.body.professional_field == 0){
			rules.filter((rule) => (rule.type == '網路' || rule.type == '必修')).forEach((rule) => {
				req.csca.rules.compulsory.course_rules.push(new CourseRule(rule));
				req.csca.rules.compulsory.codes.push(...rule.cos_codes);
			});
		}else if(req.body.professional_field == 1){
			rules.filter((rule) => (rule.type == '多媒體' || rule.type == '必修')).forEach((rule) => {
				req.csca.rules.compulsory.course_rules.push(new CourseRule(rule));
				req.csca.rules.compulsory.codes.push(...rule.cos_codes);
			});
		}else{
			rules.filter((rule) => (rule.type == '必修')).forEach((rule) => {
				req.csca.rules.compulsory.course_rules.push(new CourseRule(rule));
				req.csca.rules.compulsory.codes.push(...rule.cos_codes);
			});
		}
		resolve();
	});
}

function fetchLanguageRules(req, resolve, reject){
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

	req.csca.rules.language = {
		freshman_one:	new CourseRule(dummy_raw_data_freshman_one),
		freshman_two:	new CourseRule(dummy_raw_data_freshman_two),
		advanced:	new CourseRule(dummy_raw_data_advanced)
	};

	resolve();
}

function fetchRequiredCreditNum(req, resolve, reject){
	query.ShowGraduateRule(req.csca.student_id, (err, result) => {
		if(err)reject(err);
		let credit_nums = JSON.parse(result)[0];
		req.csca.data.required_credit = {
			compulsory:	credit_nums.require_credit,
			pro_elective:	credit_nums.pro_credit,
			elective:	credit_nums.free_credit,
			language:	credit_nums.foreign_credit
		};
		resolve();
	});
}

function fetchUserInfo(req, resolve, reject){
	query.ShowUserInfo(req.csca.student_id, (err, result) => {
		if(err)reject(err);
		let info = JSON.parse(result)[0];
		req.csca.data.user_info = info;
		resolve();
	});
}

function completeClassDetails(req){
	req.csca.classes.compulsory.require = parseFloat(req.csca.data.required_credit.compulsory);
	req.csca.classes.pro_elective.require = parseFloat(req.csca.data.required_credit.pro_elective);
	req.csca.classes.elective.require = parseFloat(req.csca.data.required_credit.elective);
	req.csca.classes.language.require = parseFloat(req.csca.data.required_credit.language);

	req.csca.classes.general_old.require = 20;
	req.csca.classes.general_new.require = {
		total:	22,
		core:	6,
		basic:	6,
		cross:	6
	};
	req.csca.classes.PE.require = 6;
	req.csca.classes.service.require = 2;
	req.csca.classes.art.require = 2;
}

module.exports = fetchData;

var Course = require('./Container/Course.js');

var CS_dept_code_prefix = require('./static/additional_condition.js').CS_course_codes_prefix;

function classifyCourses(req, res, next){
	classifyCoursesByDefault(req);
	
	handleCompulsory(req);
	handleOffset(req);
	handlePCB(req);
	handleMentorTime(req);
	formatCompulsory(req);
	handleService(req);
	handleLanguage(req);
	splitSamelyCodedCourse(req);

	next();
}

function classifyCoursesByDefault(req){
	let class_list = [
		{'class': 'compulsory', 	valid: classifyCompulsory},
		{'class': 'service', 		valid: classifyService},
		{'class': 'pro_elective', 	valid: classifyProElective},
		{'class': 'uncount', 		valid: classifyUncount},
		{'class': 'language', 		valid: classifyLanguage},
		{'class': 'PE',			valid: classifyPE},
		{'class': 'art', 		valid: classifyArt},
		{'class': 'general_old',	valid: classifyGeneral},
		{'class': 'elective', 		valid: classifyElective},
		{'class': 'graduate', 		valid: classifyGraduate},
		{'class': 'addition', 		valid: classifyAddition}
	];

	Object.values(req.csca.courses).forEach((course) => {
		for(let i = 0; i < class_list.length; i++){
			if(class_list[i].valid(course, req)){
				req.csca.classes[class_list[i]['class']].courses.push(course);
				break;
			}
		}
	});
}

function classifyCompulsory(course, req){
	if(req.csca.rules.compulsory.codes.some((code) => (course.code == code))){
		let representing_data = course.getRepresentingData();
		if(representing_data.cname.startsWith('微分方程') || representing_data.cname.startsWith('訊號與系統')){
			return (course.department == '資工系' || course.department == '電資共同');
		}else return true;
	}else return false;
}

function classifyService(course){
	return course.getRepresentingData().cname.includes('服務學習');
}

function classifyProElective(course){
	let representing_data = course.getRepresentingData();
	if(representing_data.cname.startsWith('微分方程') || representing_data.cname.startsWith('訊號與系統')){
		return (course.department == '資工系' || course.department == '電資共同');
	}else{
		return CS_dept_code_prefix.some((prefix) => (course.code.startsWith(prefix)));
	}
}

function classifyUncount(course){
	if(course.type == '軍訓')return true;
	if(course.type == '選修' && course.code.startsWith('MIN'))return true;
	let representing_data = course.getRepresentingData();
	if(representing_data.cname.includes('教學實務'))return true;
	if(representing_data.cname.includes('個別研究'))return true;
	return false;
}

function classifyLanguage(course){
	return course.type == '外語';
}

function classifyPE(course){
	return course.brief.includes('體育');
}

function classifyArt(course){
	return course.brief.includes('藝文賞析');
}

function classifyGeneral(course){
	return course.type == '通識';
}

function classifyElective(course){
	if(course.code.startsWith('GEC') || course.code.startsWith('CGE'))return false;
	if(course.code.startsWith('MIN'))return false;
	if(course.getRepresentingData().cname.includes('教學實務'))return false;
	if(course.getRepresentingData().cname.includes('個人研究'))return false;
	return true;
}

function classifyGraduate(course){
	return false;
}

function classifyAddition(course){
	return false;
}

//
//
//
//
//

function handleCompulsory(req){
	req.csca.classes.compulsory.courses.forEach((course) => {
		for(let i = 0; i < req.csca.rules.compulsory.course_rules.length; i++){
			if(req.csca.rules.compulsory.course_rules[i].codes.includes(course.code)){
				req.csca.rules.compulsory.course_rules[i].courses.push(course);
				break;
			}
		}
	});

	req.csca.rules.compulsory.course_rules.forEach((rule) => {
		if(rule.cname == '導師時間')return;
		if(rule.cname.startsWith('物化生')){
			rule.ext = {
				physic: [],
				chemistry: [],
				biology: []
			};

			rule.courses.forEach((course) => {
				let representing_data = course.getRepresentingData();
				if(representing_data.cname.includes('物理'))rule.ext.physic.push(course);
				else if(representing_data.cname.includes('化學'))rule.ext.chemistry.push(course);
				else if(representing_data.cname.includes('生物'))rule.ext.biology.push(course);
			});

			let passed_idx, first_passed_course;

			if(rule.ext.physic.length > 1){
				passed_idx = rule.ext.physic.findIndex((course) => (course.pass_fail));
				if(passed_idx == -1)passed_idx = 0;
				first_passed_course = rule.ext.physic[passed_idx];
				rule.ext.physic.splice(passed_idx, 1);
				rule.ext.physic.forEach((course) => {
					course.moved = true;
					if(course.type == '通識')
						req.csca.classes.general_old.courses.push(course);
					else
						req.csca.classes.elective.courses.push(course);
				});
				rule.ext.physic = [first_passed_course];
			}
			if(rule.ext.chemistry.length > 1){
				passed_idx = rule.ext.chemistry.findIndex((course) => (course.pass_fail));
				if(passed_idx == -1)passed_idx = 0;
				first_passed_course = rule.ext.chemistry[passed_idx];
				rule.ext.chemistry.splice(passed_idx, 1);
				rule.ext.chemistry.forEach((course) => {
					course.moved = true;
					if(course.type == '通識')
						req.csca.classes.general_old.courses.push(course);
					else
						req.csca.classes.elective.courses.push(course);
				});
				rule.ext.chemistry = [first_passed_course];
			}
			if(rule.ext.biology.length > 1){
				passed_idx = rule.ext.biology.findIndex((course) => (course.pass_fail));
				if(passed_idx == -1)passed_idx = 0;
				first_passed_course = rule.ext.biology[passed_idx];
				rule.ext.biology.splice(passed_idx, 1);
				rule.ext.biology.forEach((course) => {
					course.moved = true;
					if(course.type == '通識')
						req.csca.classes.general_old.courses.push(course);
					else
						req.csca.classes.elective.courses.push(course);
				});
				rule.ext.biology = [first_passed_course];
			}

		}else if(rule.courses.length > 1){
			let passed_idx = rule.courses.findIndex((course) => (course.pass_fail));
			if(passed_idx == -1)passed_idx = 0;
			let first_passed_course = rule.courses[passed_idx];
			rule.courses.splice(passed_idx, 1);

			rule.courses.forEach((course) => {
				course.moved = true;
			});
			if(CS_dept_code_prefix.some((prefix) => (first_passed_course.code.startsWith(prefix)))){
				req.csca.classes.pro_elective.courses.push(...rule.courses);
			}else{
				req.csca.classes.elective.courses.push(...rule.courses);
			}

			rule.courses = [first_passed_course];
		}
	});
}

//Rules not confirmed.
function handleOffset(req){
	let english_offset = req.csca.data.offset_courses.find((course) => (course.cos_cname == '外語榮譽學分'));
	if(english_offset){
		let parsed_raw_course = {
			cos_code:	english_offset.cos_code,
			cos_cname:	english_offset.cos_cname,
			cos_ename:	'',
			cos_type:	english_offset.cos_type,
			brief:		english_offset.brief,
			cos_credit:	english_offset.credit,
			cos_year:	english_offset.apply_year,
			semester:	english_offset.apply_semester,
			score:		english_offset.score,
			pass_fail:	'通過'
		};
		let course = new Course(parsed_raw_course);
		course.getRepresentingData().reason = 'free2';
		req.csca.classes.language.courses.push(course);
	}
}

function handlePCB(req){
	let PCB1 = req.csca.rules.compulsory.course_rules.find((rule) => (rule.cname == '物化生三選一(一)'));
	let PCB2 = req.csca.rules.compulsory.course_rules.find((rule) => (rule.cname == '物化生三選一(二)'));

	if(PCB1.ext.physic.length && PCB2.ext.physic.length){
		PCB1.courses = [PCB1.ext.physic[0]];
		PCB2.courses = [PCB2.ext.physic[0]];

		PCB1.ext.physic.splice(0, 1);
		PCB2.ext.physic.splice(0, 1);

		//One credit of physic can be move to pro_elective
		let extra_credit_course;
		
		PCB1.courses[0].real_credit = 3;
		extra_credit_course = Object.assign(new Course(), PCB1.courses[0]);
		//extra_credit_course = PCB1.courses[0].copy();
		//extra_credit_course.code += '_one';
		extra_credit_course.code += '_one';
		extra_credit_course.real_credit = 1;
		extra_credit_course.moved = true;
		req.csca.classes.pro_elective.courses.push(extra_credit_course);

		PCB2.courses[0].real_credit = 3;
		extra_credit_course = Object.assign(new Course(), PCB2.courses[0]);
		//extra_credit_course = PCB2.courses[0].copy();
		//extra_credit_course.code += '_one';
		extra_credit_course.code += '_one';
		extra_credit_course.real_credit = 1;
		extra_credit_course.moved = true;
		req.csca.classes.pro_elective.courses.push(extra_credit_course);
	}else if(PCB1.ext.chemistry.length && PCB2.ext.chemistry.length){
		PCB1.courses = [PCB1.ext.chemistry[0]];
		PCB2.courses = [PCB2.ext.chemistry[0]];

		PCB1.ext.chemistry.splice(0, 1);
		PCB2.ext.chemistry.splice(0, 1);
	}else if(PCB1.ext.biology.length && PCB2.ext.biology.length){
		PCB1.courses = [PCB1.ext.biology[0]];
		PCB2.courses = [PCB2.ext.biology[0]];

		PCB1.ext.biology.splice(0, 1);
		PCB2.ext.biology.splice(0, 1);
	}else{
		PCB1.courses = (PCB1.ext.physic[0] ? [PCB1.ext.physic[0]] : []);
		PCB2.courses = (PCB2.ext.physic[0] ? [PCB2.ext.physic[0]] : []);

		if(PCB1.courses[0])PCB1.ext.physic.splice(0, 1);
		if(PCB2.courses[0])PCB2.ext.physic.splice(0, 1);
	}

	[...PCB1.ext.physic, ...PCB2.ext.physic, ...PCB1.ext.chemistry, ...PCB2.ext.chemistry, ...PCB1.ext.biology, ...PCB2.ext.biology].forEach((course) => {
		course.moved = true;
		if(course.type == '通識')
			req.csca.classes.general_old.courses.push(course);
		else
			req.csca.classes.elective.courses.push(course);
	});
}

function handleMentorTime(req){
	let course_rule = req.csca.rules.compulsory.course_rules.find((rule) => (rule.cname == '導師時間'));
	course_rule.courses.forEach((course) => {
		if(course.department != '資工系' && !course.is_dummy)course.getRepresentingData().reason = 'notCS';
	});
	while(course_rule.courses.length < 2)course_rule.courses.push(course_rule.createEmptyCourse());
}

function formatCompulsory(req){
	req.csca.classes.compulsory.courses = [];
	req.csca.rules.compulsory.course_rules.forEach((rule) => {
		if(rule.courses.length == 0)
			req.csca.classes.compulsory.courses.push(rule.createEmptyCourse(req.csca.student_id));
		else
			req.csca.classes.compulsory.courses.push(...rule.courses);
	});
}

function handleService(req){
	req.csca.classes.service.courses.filter((course) => (course.cname == '服務學習(一)')).forEach((course) => {
		if(course.department != '資工系' && !course.is_dummy)course.getRepresentingData().reason = 'notCS';
	});
}

function handleLanguage(req){
	switch(req.csca.data.user_info.en_certificate){
		case '1':{
			break;
		}
		case '2': case '3': case '4':{
			let empty_advanced = req.csca.rules.language.advanced.createEmptyCourse();
			while(req.csca.classes.language.courses.length < 4)
				req.csca.classes.language.courses.push(empty_advanced);
			break;
		}
		default:{
			let freshman_one = null;
			let freshman_two = null;
			let advanced = [];
			let other_language = [];

			req.csca.classes.language.courses.forEach((course) => {
				let representing_data = course.getRepresentingData();
				if(representing_data.cname == '大一英文（一）')freshman_one = course;
				else if(representing_data.cname == '大一英文（二）')freshman_two = course;
				else if(representing_data.cname.includes('英文'))advanced.push(course);
				else other_language.push(course);
			});

			if(!freshman_one)
				freshman_one = req.csca.rules.language.freshman_one.createEmptyCourse();
			if(!freshman_two)
				freshman_two = req.csca.rules.language.freshman_two.createEmptyCourse();
			
			let empty_advanced = req.csca.rules.language.advanced.createEmptyCourse();
			while(advanced.length < 2)advanced.push(empty_advanced);
			for(let i = 0; i < 2; i++){
				let representing_data = advanced[i].getRepresentingData();
				advanced[i].real_credit = 0;
				if(representing_data.reason == '')representing_data.reason = 'english';
			}
			while(advanced.length + other_language.length < 4)advanced.push(empty_advanced);

			req.csca.classes.language.courses = [freshman_one, freshman_two, ...advanced, ...other_language];

			break;
		}
	}
}

function splitSamelyCodedCourse(req){
	let course_list = [
		{'class': 'compulsory', 'cname': '導師時間', 'specified': false},
		{'class': 'PE', 'cname': '體育', 'specified': false},
		{'class': 'art', 'cname': '藝文賞析教育', 'specified': true}
	];

	course_list.forEach((course_detail) => {
		let course_class = req.csca.classes[course_detail['class']];
		let result_courses = []; 

		course_class.courses.forEach((course) => {
			let representing_data = course.getRepresentingData();
			result_courses.push(course);
			if(course_detail.specified ? (representing_data.cname == course_detail.cname) : (representing_data.cname.includes(course_detail.cname))){
				while(Object.keys(course.data).filter((time_id) => (course.data[time_id].pass_fail)).length > 1){
					let passed_time_id = Object.keys(course.data).find((time_id) => (course.data[time_id].pass_fail));
					result_courses.push(course.split(passed_time_id));
				}
			}
		});

		course_class.courses = result_courses;
	});
}

module.exports = classifyCourses;

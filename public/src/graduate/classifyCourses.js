var Course = require('./Container/Course.js');

var CS_dept_code_prefix = require('./static/additional_condition.js').CS_course_code_prefix;

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
	return req.csca.rules.compulsory.codes.some((code) => (course.code == code));
}

function classifyService(course){
	return course.cname.includes('服務學習');
}

function classifyProElective(course){
	return CS_dept_code_prefix.some((prefix) => (course.code.startsWith(prefix)));
}

function classifyUncount(course){
	if(course.type == '軍訓')return true;
	if(course.type == '選修' && course.code.startsWith('MIN'))return true;
	if(course.cname.includes('教學實務'))return true;
	if(course.cname.includes('個別研究'))return true;
	return false;
}

function classifyLanguage(course){
	return course.type == '外語';
}

function classifyPE(course){
	return course.cname.includes('體育');
}

function classifyArt(course){
	return course.cname == '藝文賞析教育';
}

function classifyGeneral(course){
	return course.type == '通識';
}

function classifyElective(course){
	if(course.code.startsWith('GEC') || course.code.startsWith('CGE'))return false;
	if(course.code.startsWith('MIN'))return false;
	if(course.cname.includes('教學實務'))return false;
	if(course.cname.includes('個人研究'))return false;
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

function classifyCourses(req, res, next){
	classifyCoursesByDefault(req);
	
	excludeUnmatchedDiffEqAndSignalAndSystemFromCompulsory(req);
	handleCompulsory(req);
	includeMatchedDiffEqAndSignalAndSystemInProElective(req);
	handleOffset(req);
	handlePCB(req);
	handleService(req);
	handleLanguage(req);
	handleExcessiveProElective(req);
	handleGeneral(req);
	splitMentorTime(req);
	splitPE(req);
	splitArt(req);

	next();
}

function excludeUnmatchedDiffEqAndSignalAndSystemFromCompulsory(req){
	let unchanged = [], excluded = [];

	req.csca.classes.compulsory.courses.forEach((course) => {
		if(course.department != '資工系' && course.department != '電資共同'){
			if(course.cname.startsWith('微分方程')){
				excluded.push(course);
				return;
			}else if(course.cname.startsWith('訊號與系統')){
				excluded.push(course);
				return;
			}
		}
		unchanged.push(course);
	});

	req.csca.classes.compulsory.courses = unchanged;
	req.csca.classes.elective.courses.push(...excluded);
}

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
		if(rule.cname.startsWith('物化生')){
			rule.ext = {
				physic: [],
				chemistry: [],
				biology: []
			};

			rule.courses.forEach((course) => {
				if(course.cname.includes('物理'))rule.ext.physic.push(course);
				else if(course.cname.includes('化學'))rule.ext.chemistry.push(course);
				else if(course.cname.includes('生物'))rule.ext.biology.push(course);
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

function includeMatchedDiffEqAndSignalAndSystemInProElective(req){
	let unchanged = [], included = [];

	req.csca.classes.elective.courses.forEach((course) => {
		if(course.department == '資工系' || course.department == '電資共同'){
			if(course.cname.startsWith('微分方程')){
				included.push(course);
				return;
			}else if(course.cname.startsWith('訊號與系統')){
				included.push(course);
				return;
			}
		}
		unchanged.push(course);
	});

	req.csca.classes.elective.courses = unchanged;
	req.csca.classes.pro_elective.courses.push(...included);
}

//Rules not confirmed.
function handleOffset(req){

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
		extra_credit_course.real_credit = 1;
		extra_credit_course.moved = true;
		req.csca.classes.pro_elective.courses.push(extra_credit_course);

		PCB2.courses[0].real_credit = 3;
		extra_credit_course = Object.assign(new Course(), PCB2.courses[0]);
		//extra_credit_course = PCB2.courses[0].copy();
		//extra_credit_course.code += '_one';
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
		PCB2.courses = (PCB2.ext.physic[0] ? [PCB1.ext.physic[0]] : []);

		if(PCB1.courses[0])PCB1.ext.physic.splice(0, 1);
		if(PCB2.courses[0])PCB2.ext.physic.splice(0, 1);
	}

	Array.of(...PCB1.ext.physic, ...PCB2.ext.physic, ...PCB1.ext.chemistry, ...PCB2.ext.chemistry, ...PCB1.ext.biology, ...PCB2.ext.biology).forEach((course) => {
		course.moved = true;
		if(course.type == '通識')
			req.csca.classes.general_old.courses.push(course);
		else
			req.csca.classes.elective.courses.push(course);
	});
}

function handleService(req){

}

function handleLanguage(req){
	switch(req.csca.data.user_info.en_certificate){
		case 1:
			break;
		case 2: case 3: case 4:
			break;
		default:
			break;
	}
}

function handleExcessiveProElective(req){
	req.csca.classes.pro_elective.calculateCredit();
	let required_credit = req.csca.classes.pro_elective.require;
	let credit = req.csca.classes.pro_elective.credit;

	while(credit > required_credit){
		if(credit - required_credit < 3){
			let one_credit_course_idx = req.csca.classes.pro_elective.courses.findIndex((course) => (course.realCredit == 1));
			if(one_credit_course_idx == -1)break;
			let one_credit_course = req.csca.classes.pro_elective.courses[one_credit_course_idx];
			req.csca.classes.pro_elective.courses.splice(one_credit_course_idx, 1);
			req.csca.classes.elective.courses.push(one_credit_course);
		}else{
			let three_credit_course_idx = req.csca.classes.pro_elective.courses.findIndex((course) => (course.realCredit == 3));
			let three_credit_course = req.csca.classes.pro_elective.courses[three_credit_course_idx];
			req.csca.classes.pro_elective.courses.splice(three_credit_course_idx, 1);
			req.csca.classes.elective.courses.push(three_credit_course);
		}
	}
}

function handleGeneral(req){
	req.csca.classes.general_new.courses = req.csca.classes.general_old.courses.map((course) => (Object.assign(new Course(), course)));

	req.csca.classes.general_old.courses.forEach((course) => {
		course.dimension = course.brief.split('/')[0];
	});

	req.csca.classes.general_new.courses.forEach((course) => {
		course.dimension = course.brief_new.split('(')[0];
	});
}

function splitMentorTime(req){

}

function splitPE(req){

}

function splitArt(req){

}

module.exports = classifyCourses;

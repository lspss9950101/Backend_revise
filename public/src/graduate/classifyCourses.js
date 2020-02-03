var CS_dept_code_prefix = require('./static/CS_prefix.js');

function classifyCoursesByDefault(req){
	let class_list = [
		{'class': 'compulsory', 	valid: classifyCompulsory},
		{'class': 'proElective', 	valid: classifyProElective},
		{'class': 'uncount', 		valid: classifyUncount},
		{'class': 'language', 		valid: classifyLanguage},
		{'class': 'PE',			valid: classifyPE},
		{'class': 'service', 		valid: classifyService},
		{'class': 'art', 		valid: classifyArt},
		{'class': 'elective', 		valid: classifyElective},
		{'class': 'general', 		valid: classifyGeneral},
		{'class': 'graduate', 		valid: classifyGraduate},
		{'class': 'addition', 		valid: classifyAddition}
	];

	req.data.courses.forEach((course) => {
		for(let i = 0; i < class_list.length; i++){
			if(class_list[i].valid(course)){
				req.csca.classes[class_list[i]['class']].courses.push(course);
				break;
			}
		}
	});
}

function classifyCompulsory(course){
	return req.csca.rules.compulsory_codes[course.code] == true;
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
	return course.type == '外文';
}

function classifyPE(course){
	return course.cname.includes('體育');
}

function classifyService(course){
	return course.cname.includes('服務學習');
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
	
	handleCompulsory(req);
	handleOffset(req);
	handlePCB(req);
	handleService(req);
	handleLanguage(req);
	handleExcessiveProElective(req);
	handleGeneralDimension(req);

	next();
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
				req.csca.classes.elective.courses = req.csca.classes.elective.courses.concat(rule.ext.physic);
				rule.ext.physic = [first_passed_course];
			}
			if(rule.ext.chemistry.length > 1){
				passed_idx = rule.ext.chemistry.findIndex((course) => (course.pass_fail));
				if(passed_idx == -1)passed_idx = 0;
				first_passed_course = rule.ext.chemistry[passed_idx];
				rule.ext.chemistry.splice(passed_idx, 1);
				req.csca.classes.elective.courses = req.csca.classes.elective.courses.concat(rule.ext.chemistry);
				rule.ext.chemistry = [first_passed_course];
			}
			if(rule.ext.biology.length > 1){
				passed_idx = rule.ext.biology.findIndex((course) => (course.pass_fail));
				if(passed_idx == -1)passed_idx = 0;
				first_passed_course = rule.ext.biology[passed_idx];
				rule.ext.biology.splice(passed_idx, 1);
				req.csca.classes.elective.courses = req.csca.classes.elective.courses.concat(rule.ext.biology);
				rule.ext.biology = [first_passed_course];
			}

		}else if(rule.courses.length > 1){
			let passed_idx = rule.courses.findIndex((course) => (course.pass_fail));
			if(passed_idx == -1)passed_idx = 0;
			let first_passed_course = rule.courses[passed_idx];
			rule.courses.splice(passed_idx, 1);

			if(CS_dept_code_prefix.some((prefix) => (first_passed_course.code.startsWith(prefix)))){
				req.csca.classes.pro_elective.courses = req.csca.classes.pro_elective.courses.concat(rule.courses);
			}else{
				req.csca.classes.elective.courses  = req.csca.classes.elective.courses.concat(rule.courses);
			}

			rule.courses = [first_passed_course];
		}
	});
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
		extra_credit_course = Object.assign({}, PCB1.courses[0]);
		//extra_credit_course = PCB1.courses[0].copy();
		//extra_credit_course.code += '_one';
		extra_credit_course.real_credit = 1;
		req.csca.classes.pro_elective.courses.push(extra_credit_course);

		PCB2.courses[0].real_credit = 3;
		extra_credit_course = Object.assign({}, PCB2.courses[0]);
		//extra_credit_course = PCB2.courses[0].copy();
		//extra_credit_course.code += '_one';
		extra_credit_course.real_credit = 1;
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

	req.csca.classes.elective.courses.push(...PCB1.ext.physic);
	req.csca.classes.elective.courses.push(...PCB2.ext.physic);
	req.csca.classes.elective.courses.push(...PCB1.ext.chemistry);
	req.csca.classes.elective.courses.push(...PCB2.ext.chemistry);
	req.csca.classes.elective.courses.push(...PCB1.ext.biology);
	req.csca.classes.elective.courses.push(...PCB2.ext.biology);
}

//Rules not confirmed.
function handleService(req){
	let service1 = false, service2 = false;
	req.csca.classes.service.courses.forEach((course) => {
		if(service1 == true && service2 == true)break;
		if(course.code.startsWith('DCP') && course.cname == '服務學習(一)')service1 = true; //course.code == 'DCP1194'
		else if(course.cname.includes('服務學習(二)') || course.cname.includes('服務學習二'))service2 = true;
	});
}

function handleLanguage(req){

}

function handleExcessiveProElective(req){

}

function handleGeneralDimension(req){

}

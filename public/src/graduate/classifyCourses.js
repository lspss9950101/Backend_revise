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
		for(let i = 0; i < req.csca.rules.course_rules.length; i++){
			if(req.csca.rules.course_rules[i].codes.includes(course.code)){
				req.csca.rules.course_rules[i].courses.push(course);
				break;
			}
		}
	});
}

function handleOffset(req){

}

function handlePCB(req){
	let idx_PCB1 = req.csca.rules.course_rules.findIndex((rule) => (rule.cname == '物化生三選一(一)'));
	let idx_PCB2 = req.csca.rules.course_rules.findIndex((rule) => (rule.cname == '物化生三選一(二)'));

}

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

var CS_dept_code_prefix;

function classifyCoursesByDefault(req, res, callback){
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
				req.data.course_class[class_list[i]['class']].courses.push(course);
				break;
			}
		}
	});
	callback();
}

function classifyCompulsory(course){
	return req.data.course_rules.compulsory_codes[course.code] == true;
}

function classifyProElective(course){
	return CS_dept_code_prefix.some((prefix) => (course.cos_code.startsWith(prefix)));
}

function classifyUncount(course){
	if(course.cos_type == '軍訓')return true;
	if(course.cos_type == '選修' && course.cos_code.startsWith('MIN'))return true;
	if(course.cos_cname.includes('教學實務'))return true;
	if(course.cos_cname.includes('個別研究'))return true;
	return false;
}

function classifyLanguage(course){
	return course.cos_type == '外文';
}

function classifyPE(course){
	return course.cos_cname.includes('體育');
}

function classifyService(course){
	return course.cos_cname.includes('服務學習');
}

function classifyArt(course){
	return course.cos_cname == '藝文賞析教育';
}

function classifyGeneral(course){
	return course.cos_type == '通識';
}

function classifyElective(course){
	if(course.cos_code.startsWith('GEC') || course.cos_code.startsWith('CGE'))return false;
	if(course.cos_code.startsWith('MIN'))return false;
	if(course.cos_cname.includes('教學實務'))return false;
	if(course.cos_cname.includes('個人研究'))return false;
	return true;
}

function classifyGraduate(course){
	return false;
}

function classifyAddition(course){
	return false;
}


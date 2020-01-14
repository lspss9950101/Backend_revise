var CS_dept_code_prefix;

function ClassifyCourseByDefault(req, res, next){
	let class_list = [
		{'class': 'compulsory', 	valid: classifyCompulsory},
		{'class': 'proElective', 	valid: classifyProElective},
		{'class': 'elective', 		valid: classifyElective},
		{'class': 'general', 		valid: classifyGeneral},
		{'class': 'language', 		valid: classifyLanguage},
		{'class': 'PE',			valid: classifyPE},
		{'class': 'service', 		valid: classifyService},
		{'class': 'art', 		valid: classifyArt},
		{'class': 'uncount', 		valid: classifyUncount},
		{'class': 'graduate', 		valid: classifyGraduate},
		{'class': 'addition', 		valid: classifyAddition}
	];

	req.data.course_data.offset_course.forEach((course) => {
		for(int i = 0; i < class_list.length; i++){
			if(class_list[i].valid(course)){
				req.courses.offset[class_list[i]['class']].addCourse(courses);
				break;
			}
		}
	});

	req.data.course_data.passed_course.forEach((course) => {
		for(int i = 0; i < class_list.length; i++){
			if(class_list[i].valid(course)){
				req.courses.passed[class_list[i]['class']].addCourse(courses);
				break;
			}
		}
	});

	req.data.course_data.on_course.forEach((course) => {
		for(int i = 0; i < class_list.length; i++){
			if(class_list[i].valid(course)){
				req.courses.on[class_list[i]['class']].addCourse(courses);
				break;
			}
		}
	});
}

function classifyCompulsory(course){
	return req.data.course_rules.compulsory_codes[course.code] == true;
}

function classifyProElective(course){
	return CS_dept_code_prefix.some((prefix) => (course.cos_code.startsWith(prefix)));
}

function classifyElective(course){
	if(course.cos_code.startsWith('GEC') || course.cos_code.startsWith('CGE'))return false;
	if(course.cos_code.startsWith('MIN'))return false;
	if(course.cos_cname.includes('教學實務'))return false;
	if(course.cos_cname.includes('個人研究'))return false;
	return true;
}

function classifyGeneral(course){
	return course.cos_type == '通識';
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

function classifyUncount(course){
	if(course.cos_type == '軍訓')return true;
	if(course.cos_type == '選修' && course.cos_code.startsWith('MIN'))return true;
	if(course.cos_cname.includes('教學實務'))return true;
	if(course.cos_cname.includes('個別研究'))return true;
	return false;
}

function classifyGraduate(course){
	return false;
}

function classifyAddition(course){
	return false;
}

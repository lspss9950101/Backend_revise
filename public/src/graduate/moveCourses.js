function moveCourses(req, res, next){
	let mapping = {
		'專業選修':			'pro_elective',
		'其他選修':			'elective',
		'外語':				'language',
		'服務學習':			'service',
		'抵免研究所課程':		'graduate',
		'雙主修、輔系、學分學程':	'addition'
	};

	let move_data = {
		pro_elective:	[],
		elective:	[],
		language:	[],
		general_old:	[],
		service:	[],
		graduate:	[],
		addition:	[]
	};

	let move_results = {
		pro_elective:	[],
		elective:	[],
		language:	[],
		general_old:	[],
		service:	[],
		graduate:	[],
		addition:	[]
	};

	req.csca.data.moved_records.forEach((moved_record) => {
		let move_destination = {
			target:		moved_record.cos_cname,
			destination:	moved_record.now_pos.startsWith('通識') ? 'general_old' : mapping[moved_record.now_pos],
			dimension:	moved_record.now_pos.split('-')[1]
		};

		let original_position = moved_record.orig_pos.startsWith('通識') ? 'general_old' : mapping[moved_record.orig_pos];
		move_data[original_position].push(move_destination);
	});

	Object.keys(move_data).forEach((class_title) => {
		if(move_data[class_title].length == 0)return;
		move_data[class_title].forEach((record) => {
			if(class_title == 'general_old' && move_data.destination == 'general_old'){
				let course = req.csca.classes[class_title].courses.find((course) => (course.cname == record.target));
				course.dimension = record.dimension;
			}else{
				let course_idx = req.csca.classes[class_title].courses.findIndex((course) => (course.cname == record.target));
				if(course_idx == -1)return;
				req.csca.classes[class_title].courses[course_idx].moved = true;
				move_results[record.destination].push(req.csca.classes[class_title].courses[course_idx]);
				req.csca.classes[class_title].courses.splice(course_idx, 1);
			}
		});
	});

	Object.keys(move_results).forEach((class_title) => {
		req.csca.classes[class_title].courses.push(...move_results[class_title]);
	});

	next();
}

module.exports = moveCourses;

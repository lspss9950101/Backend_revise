var Course = require('./Container/Course.js');

function followRemainingRules(req, res, next) {
	handleExcessiveProElective(req);
	moveCourses(req);
	handleGeneral(req);

	next();
}

function handleExcessiveProElective(req) {
	req.csca.classes.pro_elective.calculateCredit();
	const required_credit = req.csca.classes.pro_elective.require;
	let credit = req.csca.classes.pro_elective.credit;

	while (credit > required_credit) {
		if (credit - required_credit < 3) {
			const one_credit_course_idx = req.csca.classes.pro_elective.courses.findIndex((course) => (course.real_credit == 1));
			if (one_credit_course_idx == -1) break;
			const one_credit_course = req.csca.classes.pro_elective.courses[one_credit_course_idx];
			req.csca.classes.pro_elective.courses.splice(one_credit_course_idx, 1);
			credit -= 1;
			req.csca.classes.elective.courses.push(one_credit_course);
		} else {
			const three_credit_course_idx = req.csca.classes.pro_elective.courses.findIndex((course) => (course.real_credit == 3));
			const three_credit_course = req.csca.classes.pro_elective.courses[three_credit_course_idx];
			req.csca.classes.pro_elective.courses.splice(three_credit_course_idx, 1);
			credit -= 3;
			req.csca.classes.elective.courses.push(three_credit_course);
		}
	}
}

function moveCourses(req) {
	const mapping = {
		'專業選修':	'pro_elective',
		'其他選修':	'elective',
		'外語':	'language',
		'服務學習':	'service',
		'抵免研究所課程':	'graduate',
		'雙主修、輔系、學分學程':	'addition'
	};

	const move_data = {
		pro_elective:	[],
		elective:	[],
		language:	[],
		general_old:	[],
		service:	[],
		graduate:	[],
		addition:	[]
	};

	const move_results = {
		pro_elective:	[],
		elective:	[],
		language:	[],
		general_old:	[],
		service:	[],
		graduate:	[],
		addition:	[]
	};

	req.csca.data.moved_records.forEach((moved_record) => {
		const move_destination = {
			target:	moved_record.cos_cname,
			destination:	moved_record.now_pos.startsWith('通識') ? 'general_old' : mapping[moved_record.now_pos],
			dimension:	moved_record.now_pos.split('-')[1]
		};

		const original_position = moved_record.orig_pos.startsWith('通識') ? 'general_old' : mapping[moved_record.orig_pos];
		move_data[original_position].push(move_destination);
	});

	Object.keys(move_data).forEach((class_title) => {
		if (move_data[class_title].length == 0) return;
		move_data[class_title].forEach((record) => {
			if (class_title == 'general_old' && move_data.destination == 'general_old') {
				const course = req.csca.classes[class_title].courses.find((course) => (course.getRepresentingData().cname == record.target));
				course.dimension = record.dimension;
			} else {
				const course_idx = req.csca.classes[class_title].courses.findIndex((course) => (course.getRepresentingData().cname == record.target));
				if (course_idx == -1) return;
				req.csca.classes[class_title].courses[course_idx].moved = true;
				move_results[record.destination].push(req.csca.classes[class_title].courses[course_idx]);
				req.csca.classes[class_title].courses.splice(course_idx, 1);
			}
		});
	});

	Object.keys(move_results).forEach((class_title) => {
		req.csca.classes[class_title].courses.push(...move_results[class_title]);
	});
}

function handleGeneral(req) {
	req.csca.classes.general_new.courses = req.csca.classes.general_old.courses.map((course) => (Object.assign(new Course(), course)));

	req.csca.classes.general_old.courses.forEach((course) => {
		course.dimension = course.dimension || course.brief.split('/')[0];
	});

	req.csca.classes.general_new.courses.forEach((course) => {
		course.dimension = course.dimension || course.brief_new.split('(')[0];
	});
}

module.exports = followRemainingRules;

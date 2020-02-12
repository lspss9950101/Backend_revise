var query = require('./../../../../../db/msql');

function updateStudentList(req, res, next) {
	var courseResult = req.csca.summary;
	var studentId = req.csca.student_id;
	var info = req.csca.data.user_info;
	var list = {
		'student_id': '',
		'sname': '',
		'program': '',
		'total_credit': 0,
		'en_course': 0,
		'submit_status': 0,
		'graduate_status': 0,
		'pro': 1,
		'other': 1,
		'net': [],
		'media': [],
		'submit_type': -1,
		'old_total': 1,
		'old_contemp': 2,
		'old_culture': 2,
		'old_history': 2,
		'old_citizen': 2,
		'old_group': 2,
		'old_science': 2,
		'new_total': 1,
		'new_core_total': 0,
		'new_core_society': 2,
		'new_core_humanity': 2,
		'new_basic': 1,
		'new_cross': 1,
		'en_status': 1,
		'en_total': 1,
		'en_basic': 1,
		'en_advanced': 1,
		'pe': 6,
		'service': 2,
		'art': 2,
		'mentor': 2,
		'compulse': [],
		'current': []
	};

	var will_list = {
		'total': 0,
		'compulse': 0,
		'pro': 0,
		'other': 0,
		'en_total': 0,
		'en_basic': 0,
		'en_advanced': 0,
		'old_total': 0,
		'old_contemp': 0,
		'old_culture': 0,
		'old_history': 0,
		'old_citizen': 0,
		'old_group': 0,
		'old_science': 0,
		'new_total': 0,
		'new_core_total': 0,
		'new_core_society': 0,
		'new_core_humanity': 0,
		'new_basic': 0,
		'new_cross': 0,
		'pe': 0,
		'service': 0,
		'art': 0,
		'mentor': 0,
		'en_course': 0,
		'net': 9,
		'media': 9
	};

	var [compulse, pro, other, lang, general_old, general_new, pe, service, art, military, graduate, addition_program, credit] = courseResult;
	list.student_id = info.student_id;
	list.sname = info.sname;
	list.program = info.program;

	if (info.graduate_submit === null) {
		info.graduate_submit = '0';
	}
	list.submit_status = parseInt(info.graduate_submit);


	//general_old

	if (info.submit_type === null) {
		info.submit_type = '0';
	}
	list.submit_type = parseInt(info.submit_type);
	list.old_total = credit.general_require - credit.general;
	var mapping = {
		'文化': 'culture',
		'公民': 'citizen',
		'群己': 'group',
		'自然': 'science',
		'歷史': 'history',
		'通識': 'contemp'
	};
	var old = {
		'culture': 2,
		'citizen': 2,
		'group': 2,
		'science': 2,
		'history': 2,
		'contemp': 2
	};
	var will_old = {
		'culture': 0,
		'citizen': 0,
		'group': 0,
		'science': 0,
		'history': 0,
		'contemp': 0
	};
	for (var i = 0; i < general_old.course.length; i++) {
		if (general_old.course[i].complete) {
			old[mapping[general_old.course[i].dimension]] -= general_old.course[i].realCredit;
		} else {
			if (general_old.course[i].reason === 'now') {
				will_list.total += general_old.course[i].originalCredit;
				will_list.old_total += general_old.course[i].originalCredit;
				will_old[mapping[general_old.course[i].dimension]] += general_old.course[i].originalCredit;
			}
		}
	}
	list.old_culture = old.culture;
	list.old_citizen = old.citizen;
	list.old_group = old.group;
	list.old_science = old.science;
	list.old_history = old.history;
	list.old_contemp = old.contemp;
	will_list.old_culture = will_old.culture;
	will_list.old_citizen = will_old.citizen;
	will_list.old_group = will_old.group;
	will_list.old_science = will_old.science;
	will_list.old_history = will_old.history;
	will_list.old_contemp = will_old.contemp;
	var old_pass = (list.old_culture <= 0 && list.old_citizen <= 0 && list.old_group <= 0 && list.old_science <= 0 && list.old_history <= 0 && list.old_contemp <= 0 && list.old_total <= 0);
	var will_old_pass = (list.old_culture - will_list.old_culture <= 0 && list.old_citizen - will_list.old_citizen <= 0 && list.old_group - will_list.old_group <= 0 && list.old_science - will_list.old_science <= 0 && list.old_history - will_list.old_history <= 0 && list.old_contemp - will_list.old_contemp <= 0 && list.old_total - will_list.old_total <= 0);

	//general_new
	list.new_total = credit.general_new_require - credit.general_new;
	list.new_core_total = general_new.require.core;
	for (var i = 0; i < general_new.course.length; i++) {
		if (general_new.course[i].complete && general_new.course[i].dimension != '') {
			if (general_new.course[i].dimension.substring(0, 1) === '核') {
				if (general_new.course[i].dimension.substring(3, 5) === '社會') {
					list.new_core_society -= general_new.course[i].realCredit;
					list.new_core_total -= general_new.course[i].realCredit;
				} else if (general_new.course[i].dimension.substring(3, 5) === '人文') {
					list.new_core_humanity -= general_new.course[i].realCredit;
					list.new_core_total -= general_new.course[i].realCredit;
				}
			}
		} else {
			if (general_new.course[i].reason === 'now') {
				will_list.total += general_new.course[i].originalCredit;
				will_list.new_total += general_new.course[i].originalCredit;
				if (general_new.course[i].dimension.substring(0, 1) === '核') {
					if (general_new.course[i].dimension.substring(3, 5) === '社會') {
						will_list.new_core_total += general_new.course[i].originalCredit;
						will_list.new_core_society += general_new.course[i].originalCredit;
					} else if (general_new.course[i].dimension.substring(3, 5) === '人文') {
						will_list.new_core_total += general_new.course[i].originalCredit;
						will_list.new_core_humanity += general_new.course[i].originalCredit;
					}
				} else if (general_new.course[i].dimension.substring(0, 1) === '跨') {
					will_list.new_cross += general_new.course[i].originalCredit;
				} else if (general_new.course[i].dimension.substring(0, 1) === '校') {
					will_list.new_cross += general_new.course[i].originalCredit;
				}
			}
		}
	}
	list.new_basic = general_new.require.basic - general_new.credit.basic;
	list.new_cross = general_new.require.cross - general_new.credit.cross;
	var new_pass = (list.new_total <= 0 && list.new_core_total <= 0 && list.new_core_society <= 0 && list.new_core_humanity <= 0 && list.new_basic <= 0 && list.new_cross <= 0);
	var will_new_pass = (list.new_total + will_list.new_total <= 0 && list.new_core_total + will_list.new_core_total <= 0 && list.new_core_society + will_list.new_core_society <= 0 && list.new_core_humanity + will_list.new_core_humanity <= 0 && list.new_basic + will_list.new_basic <= 0 && list.new_cross + will_list.new_cross <= 0);

	var general_pass = false;
	var will_general_pass = false;
	if (parseInt(studentId.substring(0, 2)) <= 5) {
		if (list.submit_type === 0) {
			general_pass = old_pass;
			will_general_pass = will_old_pass;
		} else if (list.submit_type === 1) {
			general_pass = new_pass;
			will_general_pass = will_new_pass;
		}
	} else {
		general_pass = new_pass;
		will_general_pass = will_new_pass;
	}

	//lang
	if (info.en_certificate === null) {
		info.en_certificate = '0';
	}
	list.en_status = parseInt(info.en_certificate);
	list.en_total = credit.language_require - credit.language;
	var basic_credit = 0;
	var advanced_credit = 0;
	var second_credit = 0;
	var will_basic = 0;
	var will_advanced = 0;
	var will_second = 0;
	for (var i = 0; i < lang.course.length; i++) {
		if (lang.course[i].complete) {
			if (lang.course[i].cn.substring(0, 2) === '大一') {
				basic_credit += lang.course[i].realCredit;
			} else if (lang.course[i].cn.substring(0, 4) === '進階英文') {
				advanced_credit += lang.course[i].realCredit;
			} else {
				second_credit += lang.course[i].realCredit;
			}
		} else {
			if (lang.course[i].reason === 'now') {
				if (lang.course[i].cn.substring(0, 2) === '大一') {
					will_basic += lang.course[i].originalCredit;
				} else if (lang.course[i].cn.substring(0, 4) === '進階英文') {
					will_advanced += lang.course[i].originalCredit;
				} else {
					will_second += lang.course[i].originalCredit;
				}
			}
		}
	}
	if (list.en_status === 0) {
		list.en_basic = 4 - basic_credit;
		list.en_advanced = 4 - advanced_credit - second_credit;
		list.en_total = 8 - basic_credit - second_credit - advanced_credit;
		will_list.en_basic = list.en_basic - will_basic;
		will_list.en_advanced = list.en_advanced - will_advanced - will_second;
		will_list.en_total = list.en_total - will_basic - will_second - will_advanced;
	} else if (list.en_status === 2 || list.en_status === 3 || list.en_status === 4) {
		list.en_basic = 4 - basic_credit;
		list.en_advanced = 4 - advanced_credit - second_credit;
		if (list.en_advanced < 0)
			list.en_basic += list.en_advanced;
		list.en_total = 8 - basic_credit - advanced_credit - second_credit;
		will_list.en_basic = list.en_basic - will_basic;
		will_list.en_advanced = list.en_advanced - will_advanced;
		if (will_list.en_advanced < 0)
			will_list.en_basic += will_list.en_advanced;
		will_list.en_total = list.en_total - will_basic - will_advanced - will_second;
	} else if (list.en_status === 1) {
		list.en_basic = 0;
		list.en_advanced = 0;
		list.en_total = 0;
	}

	var en_pass = (list.en_total <= 0 && list.en_basic <= 0 && list.en_advanced <= 0);
	var will_en_pass = (will_list.en_total <= 0 && will_list.en_basic <= 0 && will_list.en_advanced <= 0);

	var net_map = {
		'計算機網': 0,
		'網路程式': 1,
		'網路通訊': 2
	};
	var media_map = {
		'計算機圖': 0,
		'影像處理': 1,
		'數值方法': 2
	};
	var net_course = ['計算機網路概論', '網路程式設計概論', '網路通訊原理'];
	var media_course = ['計算機圖學概論', '影像處理概論', '數值方法'];
	var net_complete = [0, 0, 0];
	var media_complete = [0, 0, 0];
	var net_credit = 9;
	var media_credit = 9;

	for (var i = 0; i < compulse.course.length; i++) {
		if (compulse.course[i].complete) {
			if (compulse.course[i].cn.substring(0, 4) === '導師時間') {
				list.mentor -= 1;
			} else {
				var cn = compulse.course[i].cn;
				if (compulse.course[i].english === true && compulse.course[i].code.substring(0, 3) === 'DCP') {
					list.en_course = 1;
				}

				if (cn.substring(0, 7) === '計算機網路概論' || cn.substring(0, 8) === '網路程式設計概論' || cn.substring(0, 6) === '網路通訊原理') {
					net_credit -= 3;
					net_complete[net_map[cn.substring(0, 4)]] = 1;
				} else if (cn.substring(0, 7) === '計算機圖學概論' || cn.substring(0, 6) === '影像處理概論' || cn.substring(0, 4) === '數值方法') {
					media_credit -= 3;
					media_complete[media_map[cn.substring(0, 4)]] = 1;
				}
			}
		} else {
			if (compulse.course[i].reason === 'now') {
				list.current.push(compulse.course[i].cn);
				if (compulse.course[i].cn.substring(0, 4) === '導師時間') {
					will_list.mentor += 1;
				} else {
					var cn = compulse.course[i].cn;
					if (compulse.course[i].english === true && compulse.course[i].code.substring(0, 3) === 'DCP') {
						will_list.en_course = 1;
					}
					if (cn.substring(0, 7) === '計算機網路概論' || cn.substring(0, 8) === '網路程式設計概論' || cn.substring(0, 6) === '網路通訊原理') {
						will_list.net += 3;
					} else if (cn.substring(0, 7) === '計算機圖學概論' || cn.substring(0, 6) === '影像處理概論' || cn.substring(0, 4) === '數值方法') {
						will_list.media += 3;
					}
				}
				will_list.compulse += compulse.course[i].originalCredit;
				will_list.total += compulse.course[i].originalCredit;
			} else {
				list.compulse.push(compulse.course[i].cn);
			}
		}
	}

	for (var i = 0; i < pro.course.length; i++) {
		if (pro.course[i].complete) {
			var cn = pro.course[i].cn;
			if (pro.course[i].english === true && pro.course[i].code.substring(0, 3) === 'DCP') {
				list.en_course = 1;
			}
			if (cn.substring(0, 7) === '計算機網路概論' || cn.substring(0, 8) === '網路程式設計概論' || cn.substring(0, 6) === '網路通訊原理') {
				net_credit -= 3;
				net_complete[net_map[cn.substring(0, 4)]] = 1;
			} else if (cn.substring(0, 7) === '計算機圖學概論' || cn.substring(0, 6) === '影像處理概論' || cn.substring(0, 4) === '數值方法') {
				media_credit -= 3;
				media_complete[media_map[cn.substring(0, 4)]] = 1;
			}
		} else {
			if (pro.course[i].reason === 'now') {
				var cn = pro.course[i].cn;
				if (pro.course[i].english === true && pro.course[i].code.substring(0, 3) === 'DCP') {
					will_list.en_course = 1;
				}
				if (cn.substring(0, 7) === '計算機網路概論' || cn.substring(0, 8) === '網路程式設計概論' || cn.substring(0, 6) === '網路通訊原理') {
					will_list.net += 3;
				} else if (cn.substring(0, 7) === '計算機圖學概論' || cn.substring(0, 6) === '影像處理概論' || cn.substring(0, 4) === '數值方法') {
					will_list.media += 3;
				}
				will_list.pro += pro.course[i].originalCredit;
				will_list.total += pro.course[i].originalCredit;
			}
		}
	}

	for (var i = 0; i < 3; i++) {
		if (net_complete[i] === 1) {
			list.net.push(net_course[i]);
		}
		if (media_complete[i] === 1) {
			list.media.push(media_course[i]);
		}
	}

	list.net_credit = net_credit;
	list.media_credit = media_credit;

	for (var i = 0; i < other.course.length; i++) {
		if (!other.course[i].complete && other.course[i].reason === 'now') {
			will_list.other += other.course[i].originalCredit;
			will_list.total += other.course[i].originalCredit;
		}
	}

	for (var i = 0; i < pe.course.length; i++) {
		if (!pe.course[i].complete && pe.course[i].reason === 'now') {
			will_list.pe += 1;
		}
	}

	for (var i = 0; i < service.course.length; i++) {
		if (!service.course[i].complete && service.course[i].reason === 'now') {
			will_list.service += 1;
		}
	}

	for (var i = 0; i < art.course.length; i++) {
		if (!art.course[i].complete && art.course[i].reason === 'now') {
			will_list.art += 1;
		}
	}

	list.total_credit = credit.total;
	var total_pass = list.total_credit >= credit.total_require;
	var will_total_pass = (list.total_credit + will_list.total) >= credit.total_require;

	list.pro = credit.pro_require - credit.pro;
	var pro_pass = list.pro <= 0;
	var will_pro_pass = (list.pro - will_list.pro) <= 0;

	list.other = credit.other_require - credit.other;
	var other_pass = list.other <= 0;
	var will_other_pass = (list.other - will_list.other) <= 0;

	list.pe = credit.pe_require - credit.pe;
	var pe_pass = list.pe <= 0;
	var will_pe_pass = (list.pe - will_list.pe) <= 0;

	list.service = credit.service_require - credit.service;
	var service_pass = list.service <= 0;
	var will_service_pass = (list.service - will_list.service) <= 0;

	list.art = credit.art_require - credit.art;
	var art_pass = list.art <= 0;
	var will_art_pass = (list.art - will_list.art) <= 0;

	var mentor_pass = list.mentor <= 0;
	var will_mentor_pass = (list.mentor - will_list.mentor) <= 0;

	var net_media_pass = (net_credit <= 0 || media_credit <= 0);
	var will_net_media_pass = (list.net - will_list.net <= 0 || list.media - will_list.media <= 0);

	var eng_pass = list.en_course === 1;
	var will_eng_pass = (list.en_course == 1) || (will_list.en_course == 1);

	var compulse_pass = (credit.compulsory_require - credit.compulsory) <= 0;
	var will_compulse_pass = (credit.compulsory_require - credit.compulsory - will_list.compulse) <= 0;

	var no_compulse_current = list.current.length <= 0;

	var pass = (total_pass && compulse_pass && pro_pass && other_pass && general_pass && en_pass && pe_pass && service_pass && art_pass && mentor_pass && eng_pass && no_compulse_current);

	var will_pass = (will_total_pass && will_compulse_pass && will_pro_pass && will_other_pass && will_general_pass && will_en_pass && will_pe_pass && will_service_pass && will_art_pass && will_mentor_pass && will_eng_pass);

	if (pass) {
		list.graduate_status = 2;
	} else if (will_pass) {
		list.graduate_status = 1;
	} else {
		list.graduate_status = 0;
	}

	list.pro = Math.max(0, list.pro);
	list.other = Math.max(0, list.other);
	list.old_total = Math.max(0, list.old_total);
	list.old_contemp = Math.max(0, list.old_contemp);
	list.old_culture = Math.max(0, list.old_culture);
	list.old_history = Math.max(0, list.old_history);
	list.old_citizen = Math.max(0, list.old_citizen);
	list.old_group = Math.max(0, list.old_group);
	list.old_science = Math.max(0, list.old_science);
	list.new_total = Math.max(0, list.new_total);
	list.new_core_total = Math.max(0, list.new_core_total);
	list.new_core_society = Math.max(0, list.new_core_society);
	list.new_core_humanity = Math.max(0, list.new_core_humanity);
	list.new_basic = Math.max(0, list.new_basic);
	list.new_cross = Math.max(0, list.new_cross);
	list.en_total = Math.max(0, list.en_total);
	list.en_basic = Math.max(0, list.en_basic);
	list.en_advanced = Math.max(0, list.en_advanced);
	list.pe = Math.max(0, list.pe);
	list.service = Math.max(0, list.service);
	list.art = Math.max(0, list.art);
	list.mentor = Math.max(0, list.mentor);

	query.CreateStudentGraduate(list, function(err, result2) {
		if (err) {
			throw err;
			res.redirect('/');
		} else if (!result2) {
			res.redirect('/');
		} else {
			result2 = JSON.parse(result2);
			req.studentListUpdate = result2;
			if (req.studentListUpdate)
				next();
			else
				return;
		}
	});


}

module.exports = updateStudentList;

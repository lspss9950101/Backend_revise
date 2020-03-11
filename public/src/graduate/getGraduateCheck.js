function getGraduateCheck(req, res, next) {
	let default_field;
	switch (req.csca.data.user_info.program) {
		case '資電': case 'D':
			default_field = 3;
			break;
		case '資工': case 'A': case 'B':
			default_field = 2;
			break;
		default:
			default_field = 0;
	}
	req.csca.check_state = {};
	req.csca.check_state.status = (req.csca.data.user_info.graduate_submit == null) ? 0 : parseInt(req.csca.data.user_info.graduate_submit);
	req.csca.check_state.general_course_type = (req.csca.data.user_info.submit_type == null) ? null : parseInt(req.csca.data.user_info.submit_type);
	req.csca.check_state.professional_field = (req.csca.data.user_info.net_media == null) ? default_field : parseInt(req.csca.data.user_info.net_media);

	if (req.csca.data.graduate_status.submit_status == '3') req.csca.check_state.reject_reason = req.csca.data.graduate_status.reject_reason;

	next();
}

module.exports = getGraduateCheck;

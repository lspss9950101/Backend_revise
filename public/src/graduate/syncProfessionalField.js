var query = require('./../../../../../db/msql');

function syncProfessionalField(req, res, next) {
	if (req.body.professional_field != null) {
		const parameters = {
			id:	res.locals.studentId,
			graduate_submit:	4,
			submit_type:	2,
			net_media:	req.body.professional_field
		};
		query.SetGraduateSubmitStatus(parameters, (err, result) => {
			if (err || !result)next(err);
			next();
		});
	} else next();
}

module.exports = syncProfessionalField;

var query = require('./../../../../../db/msql');

function syncProfessionalField(req, res, next){
	if(req.body.professional_field != null){
		query.SetGraduateSubmitStatus(, (err, result) => {
			if(err || !result)next(err);
			next();
		});
	}else next();
}

module.exports = syncProfessionalField;

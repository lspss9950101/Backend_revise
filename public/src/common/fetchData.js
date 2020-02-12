var query = require('./../../../../../db/msql');

function fetchData(req, res, next){
	req.csca.raw_data = {};
	fetchDataInParallel(req)
	.then(() => (next()))
	.catch((err) => {
		console.error(err);
		res.redirect('/');
	});
}

async function fetchDataInParallel(req){
	let query_list = req.csca.query_list;
	let promise_list = [];
	query_list.forEach((query_target) => {
		promise_list.push(new Promise((resolve, reject) => {
			let special_syntax_list = [
				'ShowStudentGraduate'
			];
			let syntax = special_syntax_list.some((func_name) => (func_name == query_target.func_name))) ? {student_id: req.csca.student_id} : req.csca.student_id;
			query[query_target.func_name](syntax, (err, result) => {
				if(err || result == null)reject({err: err, result: result});
				req.csca.raw_data[query_target.container_name] = JSON.parse(result);
				resolve();
			});
		}));
	});

	return await Promise.all(promise_list);
}

module.exports = fetchData;

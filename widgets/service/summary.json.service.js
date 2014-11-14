
const PATH = require("path");
const FS = require("fs");
// TODO: Remove this odd path once dynamic code loading finds dependency properly.
const REQUEST = require(PATH.join(__dirname, "../../node_modules/request"));



var pioConfig = JSON.parse(FS.readFileSync(PATH.join(__dirname, "../../../.pio.json"), "utf8"));


var checks = null;
function getChecks(callback) {
	// TODO: Re-fetch every so often.
	if (checks) {
		return callback(null, checks);
	}
	// @see https://github.com/pinf-io/github.com_fzaninotto_uptime#get-checks
	var url = "http://127.0.0.1:" + 8117 + "/api/checks";
	return REQUEST(url, function (err, res, body) {
		if (err) return next(err);
		checks = {
			byName: [],
			byId: []
		};
		JSON.parse(body).forEach(function (check) {
			checks.byName[check.name] = check;
			checks.byId[check._id] = check;
		});
		return callback(null, checks);
	});	
}



exports.app = function (req, res, next) {

	function getCheck(callback) {
		return getChecks(function (err, checks) {
			if (err) return next(err);

			if (req.query.checkId) {
				if (!checks.byId[req.query.checkId]) {
					res.writeHead(404);
					return res.end();
				}
				return callback(null, checks.byId[req.query.checkId]);
			}

			var checkName = pioConfig['config']['pio'].hostname + "~" + req.query.serviceId + "~" + "/_internal_status";

			if (!checks.byName[checkName]) {
				res.writeHead(404);
				return res.end();
			}
			return callback(null, checks.byName[checkName]);
		});
	}

	return getCheck(function (err, check) {
		if (err) return next(err);

		// @see https://github.com/pinf-io/github.com_fzaninotto_uptime#get-checksidstatstype
		var url = "http://127.0.0.1:" + 8117 + "/api/checks/" + check._id + "/stats/hour?begin=" + Math.floor(Date.now() - 60 * 60 * 1000) + "&end=" + Date.now();

		return REQUEST(url, function (err, _res, body) {
			if (err) return next(err);

			function respond(body) {
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Content-Length": body.length,
	                "Cache-Control": "max-age=30"  // seconds
				});
			    return res.end(body);
			}

			var summary = [];

			var checks = JSON.parse(body);

			checks.forEach(function (check) {
				summary.push({
					time: (new Date(check.timestamp)).getTime(),
					up: check.isUp,
					responsive: check.isResponsive,
					responseTime: check.time,
					details: check.details
				});
			});

			return respond(JSON.stringify(summary, null, 4));
		});
	});
}

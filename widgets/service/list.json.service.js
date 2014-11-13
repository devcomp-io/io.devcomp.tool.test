
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
		checks = {};
		JSON.parse(body).forEach(function (check) {
			checks[check.name] = check;
		});
		return callback(null, checks);
	});	
}



exports.app = function (req, res, next) {

	return getChecks(function (err, checks) {
		if (err) return next(err);

		var services = {};

		for (var id in checks) {
			var idParts = id.split("~");

			services[idParts[1]] = {
				checkId: checks[id]._id
			};
		}

		function respond(body) {
			res.writeHead(200, {
				"Content-Type": "application/json",
				"Content-Length": body.length
			});
		    return res.end(body);
		}

		return respond(JSON.stringify(services, null, 4));
	});
}


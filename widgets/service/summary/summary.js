
define([
	"./summary/jquery.sparkline.v2.1.2.js"
], function(SPARKLINE) {

	return function() {
		var self = this;

		var tagContentConfig = JSON.parse(self.tagContent);
		var dataUrl = self.config.serviceBaseUri + "/io.devcomp.tool.test/service/summary.json";
		if (tagContentConfig.checkId) {
			dataUrl += "?checkId=" + tagContentConfig.checkId;
		} else
		if (tagContentConfig.serviceId) {
			dataUrl += "?serviceId=" + tagContentConfig.serviceId;
		}

		return self.hook(
			{
				"htm": "./" + self.widget.id + ".htm"
			},
			{
				"data": dataUrl
			},
			[
				{
					resources: [ "htm", ],
					streams: [ "data" ],
					handler: function(_htm, _data) {

						function renderSparklines(node, responseTimes, availableFlags) {
							var width = node.width();
							var height = node.height();

							//console.log("Log into node of size", width, "x", height, "responseTimes:", responseTimes, "availableFlags:", availableFlags);

							var barWidth = Math.floor(width/availableFlags.length) - 1;
							var availableHeight = Math.floor(height / 3);

							width = (barWidth+1) * availableFlags.length;

							$('.sparkline-response-time', node).sparkline(responseTimes, {
								type: 'line',
								width: width + "px",
								height: (height-availableHeight) + "px",
								spotColor: false,
								minSpotColor: false,
								maxSpotColor: false,
								chartRangeMin: 10,
								chartRangeMax: 50,
								normalRangeMin: 10,
								normalRangeMax: 30,
								drawNormalOnTop: true
							});
							$('.sparkline-response-time').css("height", (height-availableHeight) + "px" );

							$('.sparkline-available', node).sparkline(availableFlags, {
								type: 'tristate',
								barWidth: barWidth,
								height: (availableHeight-1) + "px",
								fillColor: false,
								posBarColor: 'green',
								negBarColor: 'red',
								zeroBarColor: 'orange',
								disableInteraction: true
							});
							$('.sparkline-available').css("height", (availableHeight-1) + "px" );
						}


						_data.on("data", function(summary) {

//console.log("summary", summary);

							return self.setHTM(_htm).then(function (tag) {

								var responseTimes = [];
								var availableFlags = [];

								summary.forEach(function (frame) {

									if (frame.up && frame.responsive) {
										availableFlags.push(10);
									} else {
										availableFlags.push(-10);
									}

									responseTimes.push(frame.responseTime);
								});

								renderSparklines($("DIV.sparklines-layered", tag), responseTimes, availableFlags);
							});
						});
					}
				}
			]
		);
	};
});

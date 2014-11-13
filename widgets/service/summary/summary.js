
define([
	"./summary/jquery.sparkline.v2.1.2.js"
], function(SPARKLINE) {

	return function() {
		var self = this;

		return self.hook(
			{
				"htm": "./" + self.widget.id + ".htm"
			},
			{},
			[
				{
					resources: [ "htm" ],
					handler: function(_htm) {

						return self.setHTM(_htm).then(function (tag) {

							function renderSparklines(node, responseTimes, availableFlags) {
								var width = node.width();
								var height = node.height();

								//console.log("Log into node of size", width, "x", height, "responseTimes:", responseTimes, "availableFlags:", availableFlags);

								var barWidth = Math.floor(width/availableFlags.length) - 1;
								var availableHeight = height / 3;

								$('.sparkline-response-time', node).sparkline(responseTimes, {
									type: 'line',
									width: width + "px",
									height: height + "px",
									spotColor: false,
									minSpotColor: false,
									maxSpotColor: false,
									colorMap: $.range_map({
									    '1:10': 'green',
									    '-1:-10': 'red'
									}),
									disableInteraction: true
								} );

								$('.sparkline-available', node).sparkline(availableFlags, {
									type: 'tristate',
									barWidth: barWidth,
									height: availableHeight + "px",
									fillColor: false,
									posBarColor: 'green',
									negBarColor: 'red',
									zeroBarColor: 'orange',
									disableInteraction: true
								});
								$('.sparkline-available').css("top", (height-availableHeight) + "px" );
							}


							var responseTimes = [];
							var availableFlags = [];
							for (var i=1 ; i <= 60 ; i++) {

								if (i%20 > 0.5) {
									responseTimes.push(20 + i);
								} else {
									responseTimes.push(30 + i);
								}

								if (i%17 === 0) {
									availableFlags.push(0);
								} else
								if (i%8 === 0) {
									availableFlags.push(-10);
								} else {
									availableFlags.push(10);
								}
							}

							renderSparklines($("DIV.sparklines-layered", tag), responseTimes, availableFlags);
						});
					}
				}
			]
		);
	};
});

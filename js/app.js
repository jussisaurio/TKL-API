// Calculates the distance (m) between two map locations with the Haversine formula
		function calcDistance (lat1, lng1, lat2, lng2) {

			// converts degrees to radians
			function toRadians(x) {
   				return x * Math.PI / 180;
			}


			var earthRadius = 6371000; // 6 371 km
			
			var lat1Rad = toRadians(lat1);
			var lat2Rad = toRadians(lat2);
			var latDelta = toRadians(lat2-lat1);
			var lngDelta = toRadians(lng2-lng1);

			var a = Math.sin(latDelta/2) * Math.sin(latDelta/2) // sin^2
			+ Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        	Math.sin(lngDelta/2) * Math.sin(lngDelta/2); /// sin^2

			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

			var distance = earthRadius * c;

			return distance;
		}

		function calcCoords (lat1, lng1, maxDistance) {

			// converts degrees to radians
			function toRadians(x) {
   				return x * Math.PI / 180;
			}

			function toDegrees(x) {

				return x * 180 / Math.PI;
			}

			// alert ("Osoitteen koordinaatit: " + lat1 + ", " + lng1);
			var earthRadius = 6371000; // 6 371 km

			// absolute bearing
			var bearing = [toRadians(315), toRadians(45), toRadians(135), toRadians(225)]; // NW NE SE SW

			lat1 = toRadians(lat1);
			lng1 = toRadians(lng1);
			// coordinate box
			var box = {};

			box.latNW = Math.asin( Math.sin(lat1)*Math.cos(maxDistance/earthRadius) +
                    Math.cos(lat1)*Math.sin(maxDistance/earthRadius)*Math.cos(bearing[0]) );
			
			box.lngNW = lng1 + Math.atan2(Math.sin(bearing[0])*Math.sin(maxDistance/earthRadius)*Math.cos(lat1),
                         Math.cos(maxDistance/earthRadius)-Math.sin(lat1)*Math.sin(box.latNW));

			box.latSE = Math.asin( Math.sin(lat1)*Math.cos(maxDistance/earthRadius) +
                    Math.cos(lat1)*Math.sin(maxDistance/earthRadius)*Math.cos(bearing[2]) );
			
			box.lngSE = lng1 + Math.atan2(Math.sin(bearing[2])*Math.sin(maxDistance/earthRadius)*Math.cos(lat1),
                         Math.cos(maxDistance/earthRadius)-Math.sin(lat1)*Math.sin(box.latSE));

			// convert back to degrees before returning the coordinate box object
			box.latNW = toDegrees(box.latNW);
			box.lngNW = toDegrees(box.lngNW);
			box.latSE = toDegrees(box.latSE);
			box.lngSE = toDegrees(box.lngSE);

			//alert ("Rajat: " + box.latNW + ", " + box.lngNW + ", " + box.latSE + ", " + box.lngSE);

			return box;
			
	
		}

var app = angular.module('bussiopas', []);


app.controller ('mainCtrl', ['$scope', '$timeout', function($scope, $timeout){

	$scope.busStops = [];
	$scope.processTime = "";
	$scope.startTime=0;
	$scope.endTime=0;
	$scope.startLocation = {};
	$scope.destination = {};

	$scope.roundToInt = function(value) {

		return Math.round(value);
	};

	$scope.lookForStop = function () {

			if ($scope.destination.status === "ZERO_RESULTS") {

				alert("Kirjoitithan kadunnimen oikein (katu numero)?");
			}
		
			if ($scope.destination.status === "OK") {

				
				// save coordinates in variables
				//var startLat = $scope.startLocation.results[0].geometry.location.lat;
				//var startLng = $scope.startLocation.results[0].geometry.location.lng;
				var destinationLat = $scope.destination.results[0].geometry.location.lat;
				var destinationLng = $scope.destination.results[0].geometry.location.lng;

				var numberOfStopsFound = 0;
				var maxDist = 400; // meters
				do {
					
				
					// calculate coordinate box from which to search for bus stops
					// get a northwest to southeast coordinate box with given max distance in each direction
					var coordBox = calcCoords(destinationLat, destinationLng, maxDist);

					
					// get the stop points inside this coordinate box
					// for some gay reason the API wants the smallest coordinate values first, so the box is
					// from bottom left to top right, i.e. (latSE,lngNW : latNW,lngSE)
					// could just change the return values in coordBox to latSW lngSW latNE lngNE but too lazy
					$.ajax({
  						url: "http://data.itsfactory.fi/journeys/api/1/stop-points?location=" + coordBox.latSE +","+ coordBox.lngNW + ":" + coordBox.latNW +","+ coordBox.lngSE,
  						dataType: 'json',
  						async: false,
  						success: function(data) {
    						
    						var howManyToFind = 3;
    						// if found at least the minimum number of bus stops
    						if (data.data.headers.paging.pageSize >= howManyToFind) {

    							numberOfStopsFound = data.data.headers.paging.pageSize;
    							

    							var busStops = [];

    							data.body;

								var smallestDistance = Number.MAX_VALUE;
								var nearestStop ="";

								for (var a=0; a < data.body.length; a++) {

									var coordinates = data.body[a].location.split(",");

									var dist = calcDistance(destinationLat, destinationLng, coordinates[0], coordinates[1]);

									busStops[a] = {"name": data.body[a].name, "distance": dist};

								}

								// sort stops in ascending order by distance
								busStops.sort(function(a,b) {

									return a.distance - b.distance;
								});

								// print time in milliseconds
								$scope.endTime = new Date().getTime();
								$scope.processTime = "Laskettu " + ($scope.endTime - $scope.startTime) + " millisekunnissa";
								// select three nearest stops
								$scope.busStops = busStops.slice(0,3);
								

    						// if found zero bus stops increase distance and search again
    						} else {
    							// alert ("Maxdist = " + maxDist);
    							maxDist = maxDist + 100;
    						}
  						}
					});

				}
				while (numberOfStopsFound < howManyToFind);
				// loop ends when at least 3 stops found


				
			}
		} //lookForStop ends

	// User clicks on submit button
	$scope.getLines = function() {

		$scope.startTime = new Date().getTime();

		// lets add Tampere to the submitted address so that our API only finds Tampere locations
		// $scope.startAddress = "http://api.okf.fi/gis/1/geocode.json?address="+$scope.aloitus+"+Tampere";
		$scope.destinationAddress = "http://api.okf.fi/gis/1/geocode.json?address="+$scope.osoite+"+Tampere";
		
		/*$.ajax({
  				url: $scope.startAddress,
  				dataType: 'json',
  				async: false,
  				success: function(data) {

  					$scope.startLocation = data;
  				}
  				});*/

		$.ajax({
  				url: $scope.destinationAddress,
  				dataType: 'json',
  				async: false,
  				success: function(data) {

  					$scope.destination = data;
  				}
  				});

			

		$scope.lookForStop();

		
	};


	


}]);
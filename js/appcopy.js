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

var app = angular.module('bussiopas', []);


app.controller ('mainCtrl', ['$scope', function($scope){

	$scope.nearestStop ="";
	$scope.processTime = "";
	$scope.startTime=0;
	$scope.endTime=0;

	$scope.lookForStop = function (data) {

			

			if (data.status === "ZERO_RESULTS") {

				$scope.nearestStop = "Kirjoitithan kadunnimen oikein (katu numero)?";
				$scope.nearestDistance ="";
			}
		
			if (data.status === "OK") {

				$scope.nearestStop = "Osoite OK, etsitään lähin pysäkki...";

				// save coordinates in variables
				var givenLat = data.results[0].geometry.location.lat;
				var givenLng = data.results[0].geometry.location.lng;

				
				$.getJSON("http://data.itsfactory.fi/journeys/api/1/stop-points", function(stopdata){

					var busStops = stopdata.body;

					var smallestDistance = Number.MAX_VALUE;
					var nearestStop ="";

					busStops.forEach(function (stop) {

						var coordinates = stop.location.split(",");

						var dist = calcDistance(givenLat, givenLng, coordinates[0], coordinates[1]);

						if (dist < smallestDistance) {

							smallestDistance = dist;
							nearestStop = stop.name;
						}

					});

			
				$scope.nearestStop = nearestStop;
				$scope.nearestDistance = "("+Math.round(smallestDistance) + " m)";
				$scope.endTime = new Date().getTime();
				$scope.processTime = "Laskettu " + ($scope.endTime - $scope.startTime) + " millisekunnissa";

			});

			

		}
		} //lookForStop ends

	// User clicks on submit button
	$scope.getLines = function() {

		
		$scope.startTime = new Date().getTime();
		// $scope.nearestStop !== "Tarkistetaan että osoite löytyy...") {

		// lets add Tampere to the submitted address so that our API only finds Tampere locations
		$scope.addressToFind = "http://api.okf.fi/gis/1/geocode.json?address="+$scope.osoite+"+Tampere";
		
		// fetch JSON file from API
		$.getJSON($scope.addressToFind, $scope.lookForStop);

			



		
	};


	


}]);
var app = angular.module('bussiopas', []);


app.controller ('mainCtrl', ['$scope', function($scope){



	$scope.getLines = function() {


		$.getJSON("http://data.itsfactory.fi/journeys/api/1/lines?description=" + $scope.pysakki, function(json){


				$scope.tiedot=json.body;
				$scope.linjat=[];

				$scope.tiedot.forEach(function(linja){

					var keys = Object.keys(linja);

					$scope.linjat.push([linja.name, linja.description]);
				});

				

		});
	};
	


}]);
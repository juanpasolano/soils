
var app = angular.module('theapp', ['ngRoute']);


app.config([ '$routeProvider',
	function($routeProvider){
		$routeProvider
		.when('/home', {
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})
		.when('/periodictable', {
			templateUrl: 'partials/periodicTable.html',
			controller: 'PeriodicTableCtrl'
		})
		.otherwise({
			redirectTo:'/home'
		});
	}
]);


/*MAIN CONTROLLER*/
app.controller('MainCtrl', function($scope) {
  $scope.welcome = 'Hello world! This is HTML5 Boilerplate.';
});

/*Home controller*/
app.controller('HomeCtrl', function($scope){

});

/*PeriiodicTable CONTROLLER*/
app.controller('PeriodicTableCtrl', function($scope, DataServices){
	var gotElements = function(data){
		$scope.elements = DataServices.substractElements(data);
	};
	DataServices.getPeriodicTable().success(gotElements);
});

/*PERIODIC TABLE DIRECTIVE*/
app.directive('mbPeriodicTable', function($interpolate, $compile){
	return {
		scope: {
			elements : '=mbPeriodicTable'
		},
		link: function(scope, element, attrs){
			scope.$watch('elements', function(n,o){
				if(n){
					buildTable();
				}
			});
			scope.clickit = function(n){
				if(n){
					console.log(_.findWhere(scope.elements, {number:n}));
				}
			};
			var buildTable = function(){
				var template = '<div class="element {{hasData ? "hasData": ""}}" ng-click="clickit({{hasData ? number: null}})">'+
					'<div class="number">{{number}}</div>'+
					'<div class="small">{{small}}</div>'+
					'<div class="name">{{name}}</div>'+
				'</div>';

				var interpolateFn = $interpolate(template);
				angular.forEach(scope.elements, function(v, k){
					var html = $compile(angular.element(interpolateFn(v)))(scope);
					element.append(html);
					if(v.number == 1){
						$(element).append(emptyElems(16));
					}else if(v.number == 4 || v.number == 12){
						$(element).append(emptyElems(10));
					}
				});
			};
			var emptyElems = function(num){
				var template = '<div class="empty"></div>';
				var str = '';
				for (var i = 0; i < num; i++) {
					str += template;
				}
				return str;
			};
		}
	};
});

/*DATA SERVICES: for getting the data*/
app.factory('DataServices',[ '$http', '$rootScope',
	function($http, $rootScope){
		var server = 'http://localhost:8000/www/data/';
		return {
			getPeriodicTable :  function(){
				return $http.get(server+'periodicTable.json')
					.success(function(data){
						console.log('gotElements');
					});
			},
			substractElements : function(data){
				var elements = [];
				angular.forEach(data.table, function(value, key){
					angular.forEach(value.elements, function(v, k){
						elements.push(v);
					});
				});
				return elements;
			}
		};
	}
]);









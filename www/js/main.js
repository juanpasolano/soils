
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
		.when('/detail/element/:id', {
			templateUrl: 'partials/detail.html',
			controller: 'DetailElementCtrl'
		})
		.otherwise({
			redirectTo:'/home'
		});
	}
]);


/*MAIN CONTROLLER*/
app.controller('MainCtrl', function($scope) {
  $scope.welcome = 'Hello world! This is HTML5 Boilerplate.';
  $scope.toggleMenu = function(){
		var menu = $('#mainMenu');
		menu.toggleClass('open');
		if(menu.hasClass('open')){
			menu.find('.menuBtn').html('&#10060;');
		}else{
			menu.find('.menuBtn').html('&#9776;');
		}
  };
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
app.directive('mbPeriodicTable', function($interpolate, $compile, $location){
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
					$location.path('/detail/element/'+n);
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
						element.append(emptyElems(16));
					}else if(v.number == 4 || v.number == 12){
						element.append(emptyElems(10));
					}else if(v.number == 118){
						element.append(emptyElems(21));
					}else if(v.number == 71){
						element.append(emptyElems(3));
					}
				});
				centerTable();
			};
			var emptyElems = function(num){
				var template = '<div class="empty"></div>';
				var str = '';
				for (var i = 0; i < num; i++) {
					str += template;
				}
				return str;
			};
			var centerTable =  function(){
				var eh = $(element).height();
				var wh = $(window).height();
				var diff = (wh/2)-(eh/2);
				$(element).css('margin-top', diff);
			};
		}
	};
});



app.controller('DetailElementCtrl', function($scope, $compile, $http, $templateCache, $timeout, $rootScope, DataServices, $routeParams){

	var gotElements = function(data){
		$rootScope.elementsInfo = data;
		getElement();
	};

	var getElement = function(){
		$scope.element = _.findWhere($rootScope.elementsInfo, {"number":parseInt($routeParams.id,10)});
		compileText();
	};
	var compileText = function(){
		$http.get('partials/'+$scope.element.text, {cache: $templateCache}).success(function(tplContent){
			$('#information .content').append($compile(tplContent)($scope));
		}).error(function(e){
			console.log('Cannot load text');
		});
	};

	if(!$rootScope.elementsInfo){
		DataServices.getElemntsInfo().success(gotElements);
	}else{
		getElement();
	}


	$scope.currentHorizon = 'A';

	$scope.linkedOverlay = 'blank.png';
	$scope.showInfoMap = function(map){
		$scope.linkedOverlay = map;
	};
	$scope.hideInfoMap = function(map){
		$scope.linkedOverlay = 'blank.png';
	};
});

/*DATA SERVICES: for getting the data*/
app.factory('DataServices',[ '$http', '$rootScope',
	function($http, $rootScope){
		var server = 'http://juanpablosolano.com/usgs/data/';
		// var server = 'http://juanpablosolano.com/usgs/data/';
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
				angular.forEach(data.lanthanoids, function(value, key){
					elements.push(value);
				});
				angular.forEach(data.actinoids, function(value, key){
					elements.push(value);
				});
				return elements;
			},
			getElemntsInfo : function(){
				return $http.get(server+'elementsInfo.json')
					.success(function(data){
						console.log('gotElementsInfo');
					});
			}
		};
	}
]);


app.filter("byTowFilter", function(){
    return function(input, test){
			if(input){
				var newArray = [];
				for(var x = 0; x < input.length; x+=2){
					newArray.push(input[x]);
				}
				return newArray;
			}
    };
});









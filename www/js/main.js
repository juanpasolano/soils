
var app = angular.module('theapp', ['ngRoute']);


app.config([ '$routeProvider',
	function($routeProvider){
		$routeProvider
		.when('/home', {
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})
		.when('/mineralogy', {
			templateUrl: 'partials/mineralogy.html',
			controller: 'MineralogyCtrl'
		})
		.when('/periodictable', {
			templateUrl: 'partials/periodicTable.html',
			controller: 'PeriodicTableCtrl'
		})
		.when('/detail/element/:id', {
			templateUrl: 'partials/detail.html',
			controller: 'DetailElementCtrl'
		})
		.when('/detail/mineralogy/:id', {
			templateUrl: 'partials/detail.html',
			controller: 'DetailElementCtrl'
		})
		.when('/about', {
			templateUrl: 'partials/about.html'
		})
		.when('/downloads', {
			templateUrl: 'partials/downloads.html'
		})
		.otherwise({
			redirectTo:'/home'
		});
	}
]);


/*MAIN CONTROLLER*/
app.controller('MainCtrl', function($scope, $window) {
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
/*DETAIL FO ELEMENTS CONTROLLE*/
app.controller('DetailElementCtrl', function($scope, $compile, $http, $window, $location, $templateCache, $timeout, $rootScope, DataServices, $routeParams){

	var gotElements = function(data){
		$rootScope.elementsInfo = data;
		getElementById();
	};

	var getElementById = function(){
		$scope.element = _.findWhere($rootScope.elementsInfo, {"number":parseInt($routeParams.id,10)});
		console.log($scope.element);
		compileText();
	};
	var compileText = function(){
		if($scope.element){
			if($scope.currentHorizon == '5'){
				$http.get('assets/'+$scope.element.Top5.text, {cache: $templateCache}).success(function(tplContent){
					$('#information .content').html($compile(tplContent)($scope));
				}).error(function(e){
					console.log('Cannot load text');
				});
			}else if($scope.currentHorizon == 'A'){
				$http.get('assets/'+$scope.element.A_Horizon.text, {cache: $templateCache}).success(function(tplContent){
					$('#information .content').html($compile(tplContent)($scope));
				}).error(function(e){
					console.log('Cannot load text');
				});
			}else{
				$http.get('assets/'+$scope.element.C_Horizon.text, {cache: $templateCache}).success(function(tplContent){
					$('#information .content').html($compile(tplContent)($scope));
				}).error(function(e){
					console.log('Cannot load text');
				});
			}
		}
	};

	if(!$rootScope.elementsInfo){
		DataServices.getElemntsInfo().success(gotElements);
	}else{
		getElementById();
	}

	$scope.overlays = [
		{status: false,name: 'Physiography', img: 'Physiography.png'},
		{status: false,name: 'Glacial Limits', img: 'Glacial_Limits.png'},
		{status: false,name: 'Geology', img: 'Geology.png'}
		// {status: false,name: 'Glacial boundaries', img: 'mapOverlay1.png'},
		// {status: false,name: 'Precipitation', img: 'mapOverlay1.png'},
		// {status: false,name: 'Soil orders', img: 'mapOverlay1.png'},
		// {status: false,name: 'Ecoregions', img: 'mapOverlay1.png'},
		// {status: false,name: 'Landcover', img: 'mapOverlay1.png'},
		// {status: false,name: 'Agriculture', img: 'mapOverlay1.png'}
	]


	if( $location.$$path.split('/')[2] == 'mineralogy'){
		$scope.isMineral =  true;
		$scope.currentHorizon = 'A';
	}else{
		$scope.currentHorizon = '5';
	}


	$scope.$watch('currentHorizon', function(){
		compileText();
	})
	$scope.getCurrentDetails = function(){
		if($scope.element){
			if($scope.currentHorizon == '5'){
				return $scope.element.Top5;
			}else if($scope.currentHorizon == 'A'){
				return $scope.element.A_Horizon;
			}else{
				return $scope.element.C_Horizon;
			}
		}
	}
	$scope.linkedOverlay = 'blank.png';
	$scope.showInfoMap = function(map){
		$scope.linkedOverlay = map;
	};
	$scope.hideInfoMap = function(map){
		$scope.linkedOverlay = 'blank.png';
	};

	$scope.toggleOverlays = function(index){
		if($scope.overlays[index].status){
			$scope.overlays[index].status = false
		}else{
			angular.forEach($scope.overlays, function(value, key){
				value.status = false;
			});
			$scope.overlays[index].status =  true;
		}
	}

	$scope.toggleOverlaySelector = function(){
		$('.overlayMapMenuBox').slideToggle(200);
	};


  $scope.goBack = function(){
		if( $location.$$path.split('/')[2] == 'mineralogy'){
			$location.path('/mineralogy');
		}else{
			$location.path('/periodictable');
		}
  }
});

app.controller('MineralogyCtrl', function($scope){

});

/*DATA SERVICES: for getting the data*/
app.factory('DataServices',[ '$http', '$rootScope', '$location',
	function($http, $rootScope, $location){

		if($location.$$host == 'localhost'){
			var server = 'http://localhost:8000/www/data/';
		}else{
			var server = 'http://juanpablosolano.com/usgs/data/';
		}
		console.log($location.$$host);
		return {
			getPeriodicTable :  function(){
				console.log('getting elem');
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
				return $http.get(server+'elementsInfo_FS.json')
					.success(function(data){
						console.log('gotElementsInfo');
					});
			}
		};
	}
]);

/*FILTERS*/
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
				var diff = ((wh-68)/2)-(eh/2);
				$(element).css('margin-top', diff);
			};
		}
	};
});

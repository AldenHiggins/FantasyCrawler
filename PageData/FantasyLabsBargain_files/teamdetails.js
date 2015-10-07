(function () {
    var app = angular.module('teamDetailsApp', ['ngTouch', 'ngSanitize', "ui.bootstrap", "angular-skycons", "highcharts-ng", 'ui.grid', 'ui.grid.expandable', 'ui.grid.autoResize']);

    app.factory('VegasService', function ($http, $rootScope) {
        return {
            getRootUrl: function () {
                return '/api/';
            },
            getVegasDetailsByEvent: function (eventId) {
                //return the promise directly.
                var url = this.getRootUrl() + 'vegas/events/' + eventId;
                return $http.get(url)
                          .then(function (result) {
                              return result.data;
                          });
            }
        }
    });

    app.factory('SportEventDetailService', function ($http, $rootScope) {
        return {
            getRootUrl: function () {
                return '/api/';
            },
            getEvent: function (eventId) {
                //return the promise directly.
                var url = this.getRootUrl() + '/sportevents/' + eventId + '/';
                return $http.get(url)
                          .then(function (result) {
                              return result.data;
                          });
            }
            ,
            getEventDetails: function (eventId) {
                //return the promise directly.
                var url = this.getRootUrl() + '/sportevents/' + eventId + '/details/';
                return $http.get(url)
                          .then(function (result) {
                              return result.data;
                          });
            }
        }
    });

    app.controller('TeamController', function ($rootScope, $scope, $http, $modalInstance, SportEventDetailService)
    {
        $scope.sportEventDetail = null;
        $scope.sportevent = $rootScope.sportEvent;
        $scope.vegasRunsOpenHome = null;
        $scope.vegasRunsOpenVisitor = null;
        $scope.isMLB = ($scope.sportevent.SportId == 3);
        $scope.valueLabel = $scope.isMLB ? "runs" : "pts";

        SportEventDetailService.getEvent($scope.sportevent.EventId).then(function (sportEvent) {
            $scope.sportevent = sportEvent;
            $scope.setWeather();
        });
        SportEventDetailService.getEventDetails($scope.sportevent.EventId).then(function (sporteventDetail) {
            $scope.sportEventDetail = sporteventDetail;
        });
        $scope.setWeather = function () {
            for (var index in $scope.sportevent.EventWeatherItems) {
                if (index != 'has') {
                    var item = $scope.sportevent.EventWeatherItems[index];
                    var myDate = Date.parse(item.WeatherTime);
                    precip.push({ x: myDate, y: item.PrecipProbability * 100 });
                    temps.push({ x: myDate, y: item.Temperature });
                }
            }
            $scope.weatherConfig.series = [];
            $scope.weatherConfig.series.push({
                name: '% Precip',
                type: 'areaspline',
                yAxis: 1,
                data: precip,
                tooltip: {
                    valueSuffix: ' %'
                }
            });
            $scope.weatherConfig.series.push({
                name: 'Temperature',
                type: 'line',
                data: temps,
                tooltip: {
                    valueSuffix: ' °F'
                }
            });
            $rootScope.$broadcast('highchartsng.reflow');
        }

        $scope.weatherSize = "60";
        $scope.weatherColor = "#606060";
        
        $scope.weatherConfig = {
            chart: {
                type: 'spline',
                height: 200,
                width: 400,
                zoom: 'xy'
            },
            title: {
                text: null
            },
            xAxis: [{
                type: 'datetime',
                labels: {
                    format: '{value:%a %I:%M %P}',
                    rotation: -45,
                    align: 'right'
                },
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}°F',
                    style: {
                        color: Highcharts.getOptions().colors[3]
                    }
                },
                title: {
                    text: 'Temperature',
                    style: {
                        color: Highcharts.getOptions().colors[3]
                    }
                },
                opposite: true,
                min: 0,
                tickInterval: 25
            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: '% Precip',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value} %',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                min: 0, 
                max: 100,
                tickInterval: 25
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 80,
                verticalAlign: 'top',
                y: 55,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            series: []
        }

        var precip = [];
        var temps = [];

       

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });

    app.controller('VegasController', function ($rootScope, $scope, $http, VegasService) {
        $scope.vegas = {};
        $scope.lineChartConfig = {
            options: {
                chart: {
                    type: 'spline',
                    height: 200,
                    width:400,
                    zoom: 'xy'
                }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    format: '{value:%a %I:%M %P}',
                    rotation: -45,
                    align: 'right'
                }
            },
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value} ' + $scope.valueLabel
                },
                title: {
                    text: 'Expected Score'
                }

            }],
            title: {
                text: null
            },
            series: [],
            loading: false
        };

        $scope.loadChart = function () {
            var visitorScores = [];
            var homeScores = [];

            var date = null;
            for (var index = 0; index < $scope.vegas.Scores.length; index++) {
                var item = $scope.vegas.Scores[index];
                if (index == 0)
                {
                    $scope.$parent.vegasRunsOpenHome = item.HomeScore;
                    $scope.$parent.vegasRunsOpenVisitor = item.VisitorScore;
                }
                var date = new Date(Date.parse(item.Date));
                visitorScores.push({ x: date, y: item.VisitorScore });
                homeScores.push({ x: date, y: item.HomeScore });
            }

            $scope.lineChartConfig.series = [];
            $scope.lineChartConfig.series.push({
                name: $scope.vegas.SportEvent.HomeTeam,
                type: 'line',
                color: Highcharts.getOptions().colors[0],
                data: homeScores,
                step: true
            });
            $scope.lineChartConfig.series.push({
                name: $scope.vegas.SportEvent.VisitorTeam,
                type: 'line',
                color: 'black',
                data: visitorScores,
                step: true
            });

            $rootScope.$broadcast('highchartsng.reflow');

        }

        VegasService.getVegasDetailsByEvent($rootScope.sportEvent.EventId).then(function (vegas) {
            $scope.vegas = vegas;
            $scope.loadChart();
        });
    });
})();
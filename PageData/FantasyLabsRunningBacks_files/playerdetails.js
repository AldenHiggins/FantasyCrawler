    (function () {
        var app = angular.module('playerDetailsApp', ['ngTouch', 'ngSanitize', "ui.bootstrap", "highcharts-ng", 'ui.grid', 'ui.grid.expandable', 'ui.grid.autoResize']);

        app.filter('valChange', function () {

            // Create the return function
            // set the required parameter name to **number**
            return function (number) {

                // Ensure that the passed in data is a number
                if (isNaN(number)) {

                    return number;

                } else {

                    if (number < 0) {
                        return number + " ↓";
                    }
                    else if (number == 0) {
                        return number;
                    }
                    else {
                        return "+" + number + " ↑";
                    }
                }
            }
        });

        app.factory('PlayerDetailsService', function ($http, $rootScope, DataItemsService) {
            return {
                getRootUrl: function () {
                    return '/api/players/' + $rootScope.playerId;
                },
                getPlayerSalaries: function () {
                    //return the promise directly.
                    return $http.get(this.getRootUrl() + '/salaries/' + $rootScope.sourceId)
                              .then(function (result) {
                                  return result.data;
                              });
                },
                getTrends: function () {
                    //return the promise directly.
                    return $http.get(this.getRootUrl() + '/trends/' + $rootScope.sourceId + "?EventId=" + $rootScope.eventId)
                              .then(function (result) {
                                  return result.data;
                              });
                },
                getGameLogs: function () {
                 
                    return $http.get(this.getRootUrl() + '/gamelog/' + $rootScope.sourceId + "/"  )
                              .then(function (result) {
                                  return result.data;
                              });
                },
                getPlayer: function (playerId) {
                    //return the promise directly.
                    return $http.get(this.getRootUrl() + "?SourceId=" + $rootScope.sourceId)
                              .then(function (result) {
                                  //resolve the promise as the data
                                  return result.data;
                              });
                },
                getPlayerDetails: function (sportId) {
                    //return the promise directly.
                    return $http.get('/api/systems/playerranks/' + $rootScope.playerId + "?SourceId=" + $rootScope.sourceId + "&EventId=" + $rootScope.eventId + "&SportId=" + sportId)
                              .then(function (result) {
                                  return result.data;
                              });
                },
                getPlayerNews: function () {
                    //return the promise directly.
                    return $http.get('/api/playernews/player/' + $rootScope.playerId)
                              .then(function (result) {
                                  //resolve the promise as the data
                                  return result.data;
                              })
                }
            }
        });


        app.filter('dynamicFilter', function ($filter) {
            return function (value, filterName) {
                if (!filterName)
                    return value;
                else if (filterName == "date")
                    return $filter('date')(value, "MM/dd");
                else if (filterName == "currency")
                    return value > 0 ? $filter('currency')(value, undefined, 0) : "";
                else if (filterName == "number")
                    return $filter('number')(value,  2);
                return $filter(filterName)(value);
            };
        });
   
        app.controller('PlayerDetailController', function ($rootScope, $scope, $http, $filter, PlayerDetailsService, $sessionStorage, $modal, $modalInstance, DataItemsService) {
            $scope.currentPlayer = null;
            $scope.currentView = 'normal';
            $scope.salaryChartView = 'last10';
            $scope.pointsPlusMinusPct = 0;
            $scope.salaryChange = 0;
            $scope.currentPlayerDetails = null;
            $scope.playerLogs = null;
            $scope.systems = null;
            $scope.selectedSource = null;
            $scope.currentPage = 1;
            $scope.itemsPerPage = 5;
            $scope.isModal = true;

            if (typeof playerId != "undefined") {
                $rootScope.playerId = playerId;
                $rootScope.eventId = eventId;
                $rootScope.selectedSource = { "SourceId": 4, "DisplayName": "DraftKings" };
                $scope.isModal = false;
            }
            $scope.gameLogLayouts = {};
            $scope.gameLogLayouts[301] = [
                { name: "date", field: 'SalaryDate', width: 50, displayName: 'Date', cellFilter: 'date', enableColumnMenu: false },
                { name: "opp", field: 'OpposingTeam', width: 150, displayName: 'Opponent', enableColumnMenu: false },
                { name: "salary", field: 'Salary', width: 70, displayName: 'Salary', cellFilter: 'currency', enableColumnMenu: false },
                { name: "points", field: 'ActualPoints', width: 70, displayName: 'Points', cellFilter: 'number', enableColumnMenu: false },
                { name: "ab", field: 'AB', width: 40, displayName: 'AB', enableColumnMenu: false },
                { name: "h", field: 'H', width: 40, displayName: 'H', enableColumnMenu: false },
                { name: "d", field: 'Doubles', width: 40, displayName: '2B', enableColumnMenu: false },
                { name: "t", field: 'Triples', width: 40, displayName: '3B', enableColumnMenu: false },
                { name: "hr", field: 'HR', width: 40, displayName: 'HR', enableColumnMenu: false },
                { name: "rbi", field: 'RBI', width: 40, displayName: 'RBI', enableColumnMenu: false },
                { name: "bb", field: 'BB', width: 40, displayName: 'BB', enableColumnMenu: false },
                { name: "so", field: 'SO', width: 40, displayName: 'K', enableColumnMenu: false },
                { name: "sb", field: 'SB', width: 40, displayName: 'SB', enableColumnMenu: false },
            ];
            $scope.gameLogLayouts[302] = [
                { name: "date", field: 'SalaryDate', width: 50, displayName: 'Date', cellFilter: 'date', enableColumnMenu: false },
                { name: "opp", field: 'OpposingTeam', width: 150, displayName: 'Opponent', enableColumnMenu: false },
                { name: "salary", field: 'Salary', width: 70, displayName: 'Salary', cellFilter: 'currency', enableColumnMenu: false },
                { name: "points", field: 'ActualPoints', width: 70, displayName: 'Points', cellFilter: 'number', enableColumnMenu: false },
                { name: "ip", field: 'PitchIP', width: 40, displayName: 'IP' },
                { name: "so", field: 'PitchSO', width: 40, displayName: 'SO' },
                { name: "so", field: 'PitchBB', width: 40, displayName: 'BB' },
                { name: "so", field: 'PitchH', width: 40, displayName: 'H' },
                { name: "so", field: 'PitchHR', width: 40, displayName: 'HR' },
                { name: "so", field: 'PitchR', width: 40, displayName: 'R' },
                { name: "so", field: 'PitchER', width: 40, displayName: 'ER' },
            ];
            $scope.gameLogLayouts[101] = [
                { name: "date", field: 'SalaryDate', width: 50, displayName: 'Date', cellFilter: 'date', enableColumnMenu: false },
                { name: "opp", field: 'OpposingTeam', width: 200, displayName: 'Opponent', enableColumnMenu: false },
                { name: "salary", field: 'Salary', width: 70, displayName: 'Salary', cellFilter: 'currency', enableColumnMenu: false },
                { name: "points", field: 'ActualPoints', width: 70, displayName: 'Points', cellFilter: 'number', enableColumnMenu: false },
                { name: "points", field: 'PassingAttempts', width: 70, displayName: 'Att', enableColumnMenu: false },
                { name: "points", field: 'PassingCompletions', width: 70, displayName: 'Comp', enableColumnMenu: false },
                { name: "ip", field: 'PassingYards', width: 40, displayName: 'Pass Yds' },
                { name: "ip", field: 'PassingTouchdowns', width: 40, displayName: 'Pass TD' },
                { name: "ip", field: 'PassingInterceptions', width: 40, displayName: 'Pass Int' },
                { name: "ip", field: 'RushingAttempts', width: 40, displayName: 'Rush Att' },
                { name: "ip", field: 'RushingYards', width: 40, displayName: 'Rush Yds' },
            ];

            $scope.gameLogLayouts[102] = [
                { name: "date", field: 'SalaryDate', width: 50, displayName: 'Date', cellFilter: 'date', enableColumnMenu: false },
                { name: "opp", field: 'OpposingTeam', width: 200, displayName: 'Opponent', enableColumnMenu: false },
                { name: "salary", field: 'Salary', width: 70, displayName: 'Salary', cellFilter: 'currency', enableColumnMenu: false },
                  { name: "points", field: 'ActualPoints', width: 70, displayName: 'Points', cellFilter: 'number', enableColumnMenu: false },

                { name: "ip", field: 'RushingAttempts', width: 40, displayName: 'Rush Att' },
                { name: "ip", field: 'RushingYards', width: 40, displayName: 'Rush Yds' },
                { name: "ip", field: 'RushingTouchdowns', width: 40, displayName: 'Rush TD' },
                { name: "ip", field: 'RushingYardsPerAttempt', width: 40, displayName: 'Rush Yds/Att' },
                { name: "ip", field: 'ReceivingTargets', width: 40, displayName: 'Targets' },
                { name: "ip", field: 'Receptions', width: 40, displayName: 'Rec' },
                { name: "ip", field: 'ReceivingYards', width: 40, displayName: 'Rec Yds' },
                { name: "ip", field: 'ReceivingTouchdowns', width: 40, displayName: 'Rec TD' },
                { name: "ip", field: 'ReceivingYardsPerReception', width: 40, displayName: 'Rec Yds/Att' },

            ];
            $scope.gameLogLayouts[103] = [
             { name: "date", field: 'SalaryDate', width: 50, displayName: 'Date', cellFilter: 'date', enableColumnMenu: false },
             { name: "opp", field: 'OpposingTeam', width: 200, displayName: 'Opponent', enableColumnMenu: false },
             { name: "salary", field: 'Salary', width: 70, displayName: 'Salary', cellFilter: 'currency', enableColumnMenu: false },
             { name: "points", field: 'ActualPoints', width: 70, displayName: 'Points', cellFilter: 'number', enableColumnMenu: false },
             { name: "ip", field: 'ReceivingTargets', width: 40, displayName: 'Targets' },
             { name: "ip", field: 'Receptions', width: 40, displayName: 'Rec' },
             { name: "ip", field: 'ReceivingYards', width: 40, displayName: 'Rec Yds' },
                { name: "ip", field: 'ReceivingTouchdowns', width: 40, displayName: 'Rec TD' },
             { name: "ip", field: 'ReceivingYardsPerReception', width: 40, displayName: 'Rec Yds/Att' },

            ];
            $scope.gameLogLayouts[104] = [
           { name: "date", field: 'SalaryDate', width: 50, displayName: 'Date', cellFilter: 'date', enableColumnMenu: false },
           { name: "opp", field: 'OpposingTeam', width: 200, displayName: 'Opponent', enableColumnMenu: false },
           { name: "salary", field: 'Salary', width: 70, displayName: 'Salary', cellFilter: 'currency', enableColumnMenu: false },
           { name: "points", field: 'ActualPoints', width: 70, displayName: 'Points', cellFilter: 'number', enableColumnMenu: false },
           { name: "ip", field: 'ReceivingTargets', width: 40, displayName: 'Targets' },
           { name: "ip", field: 'Receptions', width: 40, displayName: 'Rec' },
           { name: "ip", field: 'ReceivingYards', width: 40, displayName: 'Rec Yds' },
                { name: "ip", field: 'ReceivingTouchdowns', width: 40, displayName: 'Rec TD' },
           { name: "ip", field: 'ReceivingYardsPerReception', width: 40, displayName: 'Rec Yds/Att' },

            ];

          
            $scope.selectedSource = $rootScope.selectedSource;
            if ($scope.selectedSource != null)
                $rootScope.sourceId = $scope.selectedSource.SourceId;

            if (typeof $rootScope.sourceId  == 'undefined')
                $rootScope.sourceId = 4;

            $scope.allDataItems = DataItemsService.getAllDataItemByName()

            $scope.openTeam = function () {
                $rootScope.sportEvent = { EventId: $scope.currentPlayerDetails.Properties.EventId };
             
                var modalInstance = $modal.open({
                    templateUrl: '/TeamDetails/templates/team-detail.html?unique=' + new Date().getUTCMilliseconds().toString(),
                    controller: 'TeamController',
                    size: 'lg'
                });
                $scope.cancel();
            };
            $scope.getTooltip = function (name) {
                return DataItemsService.getDataItemByName(name).HelpContents;
            }
            PlayerDetailsService.getPlayer().then(function (playerData) {
                $scope.currentPlayer = playerData;
                PlayerDetailsService.getPlayerDetails($scope.currentPlayer.SportId).then(function (playerDetails) {
                    $scope.currentPlayerDetails = playerDetails;
                    $scope.loadGameLogs();
                    debugger;
                    $scope.bellConfig.series = [];
                    $scope.bellConfig.series.push({
                        name: 'Exp Points',
                        type: 'spline',
                        yAxis: 0,
                        color: Highcharts.getOptions().colors[0],
                        data: bellCurve($scope.currentPlayerDetails.Properties.Floor_Data, $scope.currentPlayerDetails.Properties.AvgPts_Data, $scope.currentPlayerDetails.Properties.Ceiling_Data)
                    });
                });
             
            });
          
            $scope.refreshView = function () {
                $rootScope.$broadcast('highchartsng.reflow');
            };

            $scope.setView = function (view) {
                $scope.currentView = view;
                $scope.refreshView();
            };

            if (typeof $rootScope.currentDetailView != 'undefined') {
                $scope.currentView = $rootScope.currentDetailView;
            }
            $scope.setSalaryChart = function (view) {
                $scope.salaryChartView = view;
                $scope.loadChart();
            };

            $scope.getTeam = function () {
                $scope.salaryChartView = view;
                $scope.loadChart();
            };

            $scope.toggleTrendVisible = function (trend) {
                trend.FiltersVisible = !trend.FiltersVisible;
            };
            $scope.getProgressBarClass = function (property) {
                var val = $scope.currentPlayerDetails.Properties[property];
                return 'val-' + (Math.round(val / 10) * 10).toString();
            };
            $scope.pieConfig = {
                options: {
                    chart: {
                        type: 'pie',
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        width: 175, height: 160,
                        legend: {
                            enabled: false
                        },
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.0f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                distance: -25,
                                format: '{point.percentage:.0f} %',
                                color: '#fff'
                            },
                            showInLegend: false
                        }
                    }
                },
                series: [],
                title: {
                    text: null
                },
                loading: false
            };

            $scope.pieConfigAvg = {
                options: {
                    chart: {
                        type: 'pie',
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        width: 175, height: 160,
                        legend: {
                            enabled: false
                        },
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.0f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                distance: -25,
                                format: '{point.percentage:.0f} %',
                                color: '#fff'
                            },
                            showInLegend: false
                        }
                    }
                },
                series: [],
                title: {
                    text: null
                },
                loading: false
            };

            $scope.chartConfig = {
                options: {
                    chart: {
                        type: 'spline',
                        height: 200,
                        width: 400,
                        zoom: 'xy',
                        alignTicks: false
                    },
                    legend: {
                        enabled: false
                    }
                },
                xAxis: {
                    categories: [],
                    labels: {
                        rotation: -90
                    }
                },
                yAxis: [{ // Primary yAxis
                    labels: {
                        format: '${value}k',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    gridLineWidth: 0,
                    title: {
                        text: 'Salary',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    opposite: true

                }, { // Secondary yAxis
                   
                    title: {
                        text: 'Points +/-',
                        style: {
                            color: 'black'
                        }
                    },
                    labels: {
                        format: '{value} pts',
                        style: {
                            color: 'black'
                        }
                    }

                }],
                title: {
                    text: null
                },
                series: [],
                loading: false
            }
          
            $scope.bellConfig = {
                options: {
                    chart: {
                        type: 'spline',
                        height: 150,
                        width: 400,
                        zoom: 'xy',
                        alignTicks: false
                    },
                    legend: {
                        enabled: false
                    },
                    tooltip: {
                        formatter: function () {
                            return 'In our projections <b>' + parseInt(this.x.toString()) +
                                '</b> pts occurs <b>' + Math.round(this.y * 100) + ' % of the time</b>';
                        }
                    },
                },
                yAxis: [{ 
                    title: {
                        text: 'Points Exp',
                        style: {
                            color: 'black'
                        }
                    },
                    labels: {
                        enabled: false
                    },

                }],
                title: {
                    text: null
                },
                series: [],
                loading: false
            }

            function monthDiff(d1, d2) {
                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months -= d1.getMonth() + 1;
                months += d2.getMonth();
                return months <= 0 ? 0 : months;
            }

            function parseDate(s) {
                var b = s.split(/\D+/);
                return new Date(b[0], --b[1], b[2]);
            }

            $scope.loadChart = function () {


                var salaries = [];
                var points = [];
                var dates = [];
                var totalPoints = 0;
                var terribleCount = 0;
                var averageCount = 0;
                var aboveCount = 0;
                var breakoutCount = 0;
                var totalCount = 0;
                var firstSalary = null;
                var lastSalary = null;
                var startIndex = 0;

                if ($scope.salaryChartView == 'last10' && $scope.playerSalaries.length > 10)
                    startIndex =  $scope.playerSalaries.length - 10;
                if ($scope.playerSalaries.length > 0) {
                    lastSalary = $scope.playerSalaries[$scope.playerSalaries.length - 1];
                    lastSalary.FullDate = parseDate(lastSalary.Properties.SalaryDate);
                }
                for (var index = startIndex; index < $scope.playerSalaries.length; index++) {
                    var item = $scope.playerSalaries[index];
                    if (item.Properties.Salary == 0 && data.length == 0)
                        continue;
                    item.FullDate = parseDate(item.Properties.SalaryDate);
                    if ($scope.salaryChartView == 'month' && monthDiff(item.FullDate, lastSalary.FullDate) != 0)
                        continue;
                    if (firstSalary == null)
                        firstSalary = item;
                    var dateString = (item.FullDate.getMonth() + 1) + '/' + item.FullDate.getDate();
                    dates.push(dateString);
                    salaries.push(item.Properties.Salary / 1000);
                    points.push(item.Properties.PointsPlusMinus)

                    totalPoints += item.Properties.PointsPlusMinus;
                    if (item.Properties.PointsPlusMinus > 0)
                        aboveCount += 1;

                    if (item.Properties.ActualPoints >= (item.Properties.Ceiling))
                        breakoutCount += 1;
                    else if (item.Properties.ActualPoints <= (item.Properties.Floor))
                        terribleCount += 1;
                    else averageCount += 1;
                    totalCount += 1;
                    
                }
                
                
                $scope.totalPlusMinus = totalCount > 0 ? totalPoints / totalCount : 0;
                $scope.pointsPlusMinusPct = totalCount > 0 ? 100*  aboveCount / totalCount : 0;
                $scope.salaryChange = firstSalary == null ? 0 : lastSalary.Properties.Salary - firstSalary.Properties.Salary;
                $scope.chartConfig.xAxis.categories = dates;
                $scope.chartConfig.xAxis.tickInterval = parseInt((dates.length / 10).toString());
                $scope.chartConfig.series = [];
               

                $scope.chartConfig.series.push({
                    name: 'Salaries',
                    type: 'spline',
                    yAxis: 0,
                    color: Highcharts.getOptions().colors[0],
                    data: salaries
                });
                $scope.chartConfig.series.push({
                    name: 'Points',
                    type: 'column',
                    yAxis: 1,
                    color: 'green',
                    negativeColor: 'red',
                    data: points
                });
                if (totalCount > 0) {
                    $scope.pieConfig.series = [];
                    $scope.pieConfig.series.push({
                        type: 'pie',
                        name: 'Player Performance',
                        data: [
                            { name: 'Terrible', y: terribleCount * 100 / totalCount, color: 'red' },
                            ['Average', averageCount * 100 / totalCount],
                             { name: 'Upside', y: breakoutCount * 100 / totalCount, color: 'green' },
                        ]
                    });
                    $scope.pieConfigAvg.series = [];
                    $scope.pieConfigAvg.series.push({
                        type: 'pie',
                        name: 'Avg Performance',
                        data: [
                            { name: 'Terrible', y: $scope.currentPlayerDetails.Properties.PosSeasonX0, color: 'red' },
                            ['Average', $scope.currentPlayerDetails.Properties.PosSeasonX1],
                             { name: 'Upside', y: $scope.currentPlayerDetails.Properties.PosSeasonX2, color: 'green' },
                        ]
                    });


                }

                $rootScope.$broadcast('highchartsng.reflow');

            }

            $scope.openPlayerImpact = function (PlayerId, EventId, currentDetailView) {
                $rootScope.playerId = PlayerId;
                $rootScope.eventId = EventId;
                $rootScope.selectedSource = $scope.selectedSource;
                var modalInstance = $modal.open({
                    templateUrl: '/playerDetails/templates/player-impact.html?unique=' + new Date().getUTCMilliseconds().toString(),
                    controller: 'PlayerImpactController',
                    size: 'lg'
                });
                modalInstance.result.then(function (selectedItem) {

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
                return false;
            }

            $scope.pastSalaryGridOptions = {
                    enableRowHeaderSelection: false,
                    multiSelect: false,
                    modifierKeysToMultiSelect: false,
                    noUnselect: true,
                    columnDefs: [
                        { name: "date", field: 'Properties.SalaryDate', width: 50, displayName: 'Date', cellFilter: 'date:"MM/dd"', enableColumnMenu: false },
                        { name: "opp", field: 'Properties.OpposingTeam', width: 150, displayName: 'Opponent', enableColumnMenu: false },
                        { name: "exppts", field: 'Properties.ExpectedPoints', width: 50, displayName: 'Exp Pts', cellFilter: 'number:2', enableColumnMenu: false },
                        { name: "actpts", field: 'Properties.ActualPoints', width: 50, displayName: 'Act Pts', cellFilter: 'number:2', enableColumnMenu: false },
                        { name: "salary", field: 'Properties.Salary', width: 70, displayName: 'Salary', cellFilter: 'currency:undefined:0', enableColumnMenu: false },
                    ]
            };
            $scope.gameLogGridOptions = {
                enableRowHeaderSelection: false,
                multiSelect: false,
                modifierKeysToMultiSelect: false,
                noUnselect: true,
               
            };

         

            $scope.getSystems = function (pro) {
                var systems = [];
                if (!$scope.systems)
                    return [];
                $scope.systems.forEach(function (obj) {
                    if ((obj.UserId == 8 && pro) || (obj.UserId != 8 && !pro))
                        systems.push(obj);
                });
                return systems;
            };

            var filterNews = function () {
                if ($scope.newsItems != null) {
                    var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
                      end = begin + $scope.itemsPerPage;
                    $scope.filteredNews = $scope.newsItems.slice(begin, end);
                }
            }

            $scope.$watch('currentPage + itemsPerPage', function () {
                filterNews();
            });

            PlayerDetailsService.getPlayerNews().then(function (news) {
                $scope.newsItems = news;
                $scope.totalItems = $scope.newsItems.length;

                for (var index in $scope.newsItems) {
                    var objProj = $filter('filter')($scope.newsItems[index].PlayerProjectionChanges, $scope.filterProjectionChange);
                    if (objProj != null && objProj[0] != null && objProj[0].Properties != null) {
                        $scope.newsItems[index].PointsChange = objProj[0].Properties.PointsChange;
                        $scope.newsItems[index].Points = objProj[0].Properties.Points;
                    }
                    else {
                        $scope.newsItems[index].PointsChange = 0;
                        $scope.newsItems[index].Points = 0;
                    }
                }

                filterNews();
            });

            $scope.filterProjectionChange = function (projChange) {
                if (projChange.Properties.SourceId == $rootScope.sourceId)
                    return true;
                else
                    return false;
            };


            PlayerDetailsService.getTrends().then(function (systems) {
                $scope.systems = systems;
            });
            PlayerDetailsService.getPlayerSalaries().then(function (playerSalaries) {
                $scope.playerSalaries = playerSalaries
                $scope.pastSalaryGridOptions.data = $scope.playerSalaries;
            });
          
            $scope.loadGameLogs = function () {
                PlayerDetailsService.getGameLogs().then(function (playerLogs) {
                   
                    if (playerLogs.length > 0) {
                        $scope.gameLogGridOptions.columnDefs = $scope.gameLogLayouts[$scope.currentPlayerDetails.PositionId];
                        $scope.playerLogs = playerLogs
                        $scope.gameLogGridOptions.data = $scope.playerLogs;
                    }

                    $scope.loadChart();
                });

            };

            $scope.getPlayerLogVal = function (row, col) {



                return row[col];
            }

            $scope.ok = function () {
                $modalInstance.close($scope.items);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

        });


       
    })();
    var bellCurve = function (floor, avg, ceiling) {
        var Xres = 125;
        var mean = ((floor + 4 * avg + ceiling) / 6);  // E = (a + 4m + b) / 6
        var std = ((ceiling - floor) / 6); // SD = (b − a) / 6
        var Xmin = mean - 2 * std;
        var Xmax = mean + 2 * std;
        var Xrel = (Xmax - Xmin) / Xres;
        var Xgaussian = [];
        var results = [];
        for (var i = 0; i < Xres + 1; i++) {
            var Xindex = (Xmin + i * Xrel);
            var result = [Xindex, (1 / (std * Math.sqrt(2.0 * Math.PI))) * (Math.exp(-(Math.pow(Xindex - mean, 2) / (2 * Math.pow(std, 2)))))];
            results.push(result);
        }
        return results;
    };
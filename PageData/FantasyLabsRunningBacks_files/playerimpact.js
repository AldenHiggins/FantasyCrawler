(function () {
    var app = angular.module('playerImpactApp', ['ngTouch', 'ngSanitize', "ui.bootstrap", "highcharts-ng", 'ui.grid', 'ui.grid.expandable', 'ui.grid.autoResize']);


    app.factory('PlayerImpactService', function ($http, $rootScope, DataItemsService) {
        return {
            getRootUrl: function () {
                return '/api/players/' + $rootScope.playerId;
            },
            getPlayerAlerts: function () {

                return $http.get('/api/alerts/players/' + $rootScope.playerId + "/")
                          .then(function (result) {
                              return result.data;
                          });
            },
            getPlayerImpact: function (alertId) {
                return $http.get('/api/players/impact/' + alertId + "/")
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
            }
        }
    });


    app.controller('PlayerImpactController', function ($rootScope, $scope, $modal, $http, $modalInstance, $sessionStorage, DataItemsService, PlayerImpactService) {
        $scope.currentPlayer = null;
        $scope.selectedSource = null;
        $scope.playerAlert = null;
        $scope.playerChanges = [];
        $scope.impactColumnDefs = [
          { group: "sysName", displayName: "Player", field: "FullName", width: 120, valueGetter: valueGetter, cellClass: 'pimact-Player' },
          { group: "sysName", displayName: "Pos", field: "PositionName", width: 40, valueGetter: valueGetter, cellClass: 'pimact-Salary' },
          { group: "sysName", displayName: "Salary", field: "Salary", width: 50, valueGetter: valueGetter, cellClass: 'pimact-Salary' },
          { group: "sysName", displayName: "Prior Proj", field: "PriorProj", valueGetter: valueGetter, width: 60, cellClass: 'pimact-PriorProj' },
          { group: "sysName", displayName: "Proj", field: "Proj", width: 50, valueGetter: valueGetter, cellClass: 'pimact-Proj' },
          { group: "sysName", displayName: "Proj &Delta;", field: "ProjChange", valueGetter: valueGetter, cellRenderer: renderProjChange, width: 60, cellClass: 'pimact-ProjChange' },

        ];
        function valueGetter(params) {
            return params.data.Properties[params.colDef.field];
        }
        function renderProjChange(params) {
            var html = '';
            if (params.value > 0) {
                html += '<span style="color:green"> ';
            }
            else if (params.value < 0) {
                html += '<span style="color:red" >';
            }
            else {
                html += '<span  >';
            }

            html += params.value + "</span>";

            if (params.value > 0) {
                html += '<span style="color:green" class="fa fa-arrow-up"></span>';
            }
            else if (params.value < 0) {
                html += '<span style="color:red" class="fa fa-arrow-down"></span>';
            }
            
            return html;
        }
        $scope.renderPlayerName = function (params) {
            var playerDetails = params.value;
            playerDetails += "<span class='icon-" + params.data.Properties["InjuryStatus"] + "' title='" + params.data.Properties["InjuryStatus"] + "'><span>"
            return '<span><a href="#" onclick="return angular.element(this).scope().openPlayerDetails(' + params.data.Properties.PlayerId + ',' + params.data.Properties.EventId + ')">' + playerDetails + '</a></span>';
        }
        $scope.gridImpact = {
            columnDefs: $scope.impactColumnDefs,
            rowData: null,
            dontUseScrolls: false,
            enableSorting: true,
            angularCompileRows: true
        };
        $scope.selectedSource = $rootScope.selectedSource;
        if ($scope.selectedSource != null)
            $rootScope.sourceId = $scope.selectedSource.SourceId;

        if (typeof $rootScope.sourceId == 'undefined')
            $rootScope.sourceId = 4;

        $scope.allDataItems = DataItemsService.getAllDataItemByName()

        $scope.openTeam = function () {
      
            var modalInstance = $modal.open({
                templateUrl: '/TeamDetails/templates/team-detail.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'TeamController',
                size: 'lg'
            });
            $scope.cancel();
        };
     
        PlayerImpactService.getPlayer().then(function (playerData) {
            $scope.currentPlayer = playerData;
            PlayerImpactService.getPlayerAlerts($scope.currentPlayer.PlayerId).then(function (alerts) {
                if (alerts.length == 0)
                    return;

                alerts.forEach(function (alert) {
                    alert.Detail = JSON.parse(alert.AlertDetails);
                });
                
                $scope.playerAlert = (alerts[0]);
                PlayerImpactService.getPlayerImpact($scope.playerAlert.AlertId).then(function (playerChanges) {
                    $scope.playerChanges = playerChanges;
                });
            });

        });
        $scope.loadImpact = function () {
            setTimeout(function () {
                if ($scope.gridImpact.api) {
                    $scope.gridImpact.rowData = $scope.playerChanges;
                    $scope.gridImpact.api.onNewRows();
                    $scope.gridImpact.api.setSortModel([{ field: 'ProjChange', sort: 'desc' }]);
                }
                $scope.isBusy = false;
            }, 1);
        };
        PlayerImpactService.getPlayer().then(function (playerData) {
            $scope.currentPlayer = playerData;
            PlayerImpactService.getPlayerAlerts($scope.currentPlayer.PlayerId).then(function (alerts) {
                if (alerts.length == 0)
                    return;

                alerts.forEach(function (alert) {
                    alert.Detail = JSON.parse(alert.AlertDetails);
                });

                $scope.playerAlert = (alerts[0]);
                PlayerImpactService.getPlayerImpact($scope.playerAlert.AlertId).then(function (playerChanges) {
                    $scope.playerChanges = playerChanges;
                    $scope.loadImpact();
                });
            }); 
        });
     

        $scope.ok = function () {
            $modalInstance.close($scope.items);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });



})();
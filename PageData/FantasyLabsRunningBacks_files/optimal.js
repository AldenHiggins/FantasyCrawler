
(function () {
    var app = angular.module('optimalLineupApp', ['angularSpinner']);

    app.factory('OptimalPlayerService', function ($http) {
        return {
            getOptimalPlayers: function (lineup) {               
                    return $http({
                        method: "post",
                        url: "/api/lineups/optimal/",
                        data: lineup
                    })                
            },
            createLineup: function (lineup) {
                return $http({
                    method: "post",
                    url: "/api/lineups/create/",
                    data: lineup
                })
            },
            getMyLineups: function (modelId) {
                return $http.get('/api/lineups/' + modelId + '/')
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })
            },
            deleteLineup: function (lineupId) {
                return $http.get('/api/lineups/' + lineupId + '/delete/')
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })
            },
            getOptimalBase: function () {
                return $http.get('/api/lineups/optimal/')
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })
            }
        }
    });

    app.controller('MyLineupController', function ($rootScope, $scope, $modalInstance, $window, OptimalPlayerService) {
        OptimalPlayerService.getMyLineups($rootScope.modelId).then(function (data) {
            sendMessage("DK", data);
        });

        $scope.delete = function (lineup) {
            OptimalPlayerService.deleteLineup(lineup.SystemLineupId).then(function () {
                OptimalPlayerService.getMyLineups($rootScope.modelId).then(function (systemLineups) {
                    $scope.systemLineups = systemLineups;
                });
            })
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    app.controller('OptimalLineupController', function ($scope, $modal, $window, $rootScope, $http, $filter, uiGridConstants, OptimalPlayerService, SourcesService, usSpinnerService) {
        $scope.filteredPlayers = null;
        $scope.optimalLineup = null;
        $scope.salaryDate = $window.currentDate;
        $scope.allowOptimal = true;
        $scope.flexRB = true;
        $scope.flexWR = true;
        $scope.flexTE = true;
        $scope.isNFL = ($scope.$parent.currentSportId == 1);
        $scope.showFlex = false;
        $scope.hidePoints = $window.isLive;
        
        OptimalPlayerService.getOptimalBase().then(function (obj) {
            $scope.optimalLineup = obj;
            $scope.optimalLineup.LineupName = "Optimal Lineup Name";
        });
        
        $scope.$on('optimalLockChange', function (e, player) {
            if ($scope.allOptimalPlayers != null) {
                $scope.allOptimalPlayers.forEach(function (obj) {
                    if (obj.FantasyResultId == player.FantasyResultId) {
                        obj.IsExcluded = player.IsExcluded;
                        obj.IsLocked = player.IsLocked;
                    }
                });
            }
            $scope.refreshPlayers();
        });

        $scope.lockPlayer = function (player) {
            player.IsLocked = !player.IsLocked;
            $scope.$parent.players.forEach(function (obj) {
                if (obj.FantasyResultId == player.FantasyResultId &&
                    $scope.$parent.selectedSource.SourceId == obj.Properties.SourceId) {
                    obj.IsLocked = player.IsLocked;
                }
            });
            $scope.refreshPlayers();
            $scope.$parent.refreshPlayers();
        };

        $scope.excludePlayer = function (player) {
            player.IsExcluded = true;
            player.IsLocked = false;
            $scope.$parent.players.forEach(function (obj) {
                if (obj.FantasyResultId == player.FantasyResultId &&
                    $scope.$parent.selectedSource.SourceId == obj.Properties.SourceId) {
                    obj.IsExcluded = true;
                    obj.IsLocked = false;
                }
            });
            $scope.refreshPlayers();
            $scope.$parent.refreshPlayers();
        };

        $scope.clearLocks = function () {
            if ($scope.allOptimalPlayers != null) {
                $scope.allOptimalPlayers.forEach(function (obj) {
                    obj.IsLocked = false;
                });
            }
            $scope.$parent.players.forEach(function (obj) {
                if ($scope.$parent.selectedSource.SourceId == obj.Properties.SourceId) {
                    obj.IsLocked = false;
                }
            });
            $scope.refreshPlayers();
            $scope.$parent.refreshPlayers();
        };

        $scope.includeTeam = function (player) {
            $scope.$parent.players.forEach(function (obj) {
                if (obj.Properties.Team == player.Properties.Team &&
                    $scope.$parent.selectedSource.SourceId == obj.Properties.SourceId) {
                    obj.IsExcluded = false;
                }
            });
            $scope.refreshPlayers();
            $scope.$parent.refreshPlayers();
        };

        $scope.includePlayer = function (player) {
            player.IsExcluded = false;
            $scope.$parent.players.forEach(function (obj) {
                if (obj.FantasyResultId == player.FantasyResultId &&
                    $scope.$parent.selectedSource.SourceId == obj.Properties.SourceId) {
                    obj.IsExcluded = false;
                }
            });
            $scope.refreshPlayers();
            $scope.$parent.refreshPlayers();
        };
        
        $scope.refreshPlayers = function () {
            $scope.excludedPlayers = $filter('filter')($scope.$parent.players, $scope.filterPlayersExcluded);
            $scope.optimalPlayers = $filter('filter')($scope.allOptimalPlayers, $scope.filterOptimal);
            //$scope.$apply()
        };

        $scope.refreshLineup = function () {
            $scope.loadOptimal();
        };

        $scope.$on('refreshOptimal', function () {
            $scope.refreshLineup();
        });

        $scope.$on('refreshExcludedPlayers', function () {
            $scope.refreshPlayers();
            $scope.refreshLineup();
        });
                
        $scope.$on('toggleOptimalLineup', function () {
            $('#optimal-lineup').toggle();
            if ($('#player-model-grid').hasClass('col-md-9')) {
                $('#player-model-grid').removeClass('col-md-9');
                $('#player-model-grid').addClass('col-md-12');
            }
            else {
                $('#player-model-grid').removeClass('col-md-12');
                $('#player-model-grid').addClass('col-md-9');
            }
            $scope.loadOptimal();
        });
        $scope.$on('showOptimal', function () {
            $scope.loadOptimal();
        });
        $scope.saveLineup = function () {
            var lineup = new Object();

            lineup.SystemId = $scope.$parent.modelId;
            lineup.SourceId = $scope.$parent.selectedSource.SourceId;
            lineup.ContestGroupId = $scope.$parent.selectedContestGroup.ContestGroupId;
            lineup.Name = $scope.optimalLineup.LineupName;
            lineup.Players = [];
        
            if ($scope.optimalPlayers != null) {
                $scope.optimalPlayers.forEach(function (obj) {
                    lineup.Players.push(obj);
                });
            }

            OptimalPlayerService.createLineup(lineup).then(function (players) {
               
            });
        };

        $scope.loadOptimal = function () {
            usSpinnerService.spin('spinner-1');
            debugger;
            $scope.showFlex = ($scope.isNFL && ($scope.$parent.selectedSource != null && ($scope.$parent.selectedSource.SourceId == 4 || $scope.$parent.selectedSource.SourceId == 11)));
            
            $scope.optimalLineup.LockedPlayers = [];
            $scope.optimalLineup.ExcludedPlayers = [];
            $scope.optimalLineup.Flex = [];
            $scope.optimalLineup.SalaryDate = $scope.salaryDate;

            if ($scope.flexRB)
                $scope.optimalLineup.Flex.push("RB");
            if ($scope.flexWR)
                $scope.optimalLineup.Flex.push("WR");
            if ($scope.flexTE)
                $scope.optimalLineup.Flex.push("TE");

            if ($scope.$parent.players != null) {
                $scope.$parent.players.forEach(function (obj) {
                    if ($scope.$parent.selectedSource.SourceId == obj.Properties.SourceId && obj.IsLocked)
                        $scope.optimalLineup.LockedPlayers.push(obj.FantasyResultId);
                });
            }

            if ($scope.excludedPlayers != null) {
                $scope.excludedPlayers.forEach(function (obj) {
                    $scope.optimalLineup.ExcludedPlayers.push(obj.FantasyResultId);
                });
            }

            $scope.optimalLineup.ModelId = $scope.$parent.modelId;
            $scope.optimalLineup.SourceId = $scope.$parent.selectedSource.SourceId;
          
            OptimalPlayerService.getOptimalPlayers($scope.optimalLineup).then(function (players) {
                $scope.allOptimalPlayers = players.data;
                $scope.optimalPlayers = $filter('filter')($scope.allOptimalPlayers, $scope.filterOptimal);
                if (players.data != null && players.data.length > 0) {
                    $('.lineup-grid').show();
                    $('#optimalError').hide();
                }
                else {
                    $('.lineup-grid').hide();
                    $('#optimalError').show();
                }
                usSpinnerService.stop('spinner-1');
            });
        };    

        $scope.filterOptimal = function (player) {
            if (player.IsExcluded) 
                return false;
            else
                return true;
        };
        
        $scope.filterPlayersExcluded = function (player) {
            if ($scope.$parent.selectedSource != null && player.Properties.SourceId > 0) {
                if ($scope.$parent.selectedSource.SourceId != player.Properties.SourceId)
                    return false;
            }

            if (player.IsExcluded) {
                return true;
            }

            return false;
        };
                
        $scope.totalSalary = function () {
            var salary = 0;
            if ($scope.optimalPlayers != null) {
                for (var pos in $scope.optimalPlayers) {
                    if ($scope.optimalPlayers[pos].Salary != null)
                        salary += $scope.optimalPlayers[pos].Salary;
                }
            }
            return salary;
        }

        $scope.totalProjPoints = function () {
            var points = 0;
            if ($scope.optimalPlayers != null) {
                for (var pos in $scope.optimalPlayers) {
                    if ($scope.optimalPlayers[pos].Points != null)
                        points += $scope.optimalPlayers[pos].Points;
                }
            }
            return points;
        }

        $scope.totalPoints = function () {
            var points = 0;
            if ($scope.optimalPlayers != null) {
                for (var pos in $scope.optimalPlayers) {
                    if ($scope.optimalPlayers[pos].ActualPoints != null)
                        points += $scope.optimalPlayers[pos].ActualPoints;
                }
            }
            return points;
        }
        $scope.totalScore = function () {
            var score = 0;
            if ($scope.optimalPlayers != null) {
                for (var pos in $scope.optimalPlayers) {
                    if ($scope.optimalPlayers[pos].Score != null)
                        score += $scope.optimalPlayers[pos].Score;
                }
            }
            return score;
        }

        $scope.totalCap = function () {
            var cap = 0;
            if ($scope.optimalPlayers != null) {
                for (var pos in $scope.optimalPlayers) {
                    if ($scope.optimalPlayers[pos].CapPercent != null)
                        cap += $scope.optimalPlayers[pos].CapPercent;
                }
            }
            return cap;
        }

        $scope.showLineups = function () {
            $rootScope.modelId = $scope.$parent.modelId;
            var modalInstance = $modal.open({
                templateUrl: '/Lineups/templates/lineups.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'MyLineupController',
                size: 'lg',
                resolve: {
                    system: function () {
                        return $scope.system;
                    }
                }
            });
        };
    });
})();

(function () {
    var app = angular.module('app', ['optimalApp']);
})();

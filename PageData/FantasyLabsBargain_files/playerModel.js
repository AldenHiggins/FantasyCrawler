

(function ($, sr) {

    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
        var timeout;
        threshold = 50;
        return function debounced() {
            var obj = this, args = arguments;
            function delayed() {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            };

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 100);
        };
    }
    // smartresize 
    jQuery.fn[sr] = function (fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery, 'smartresize');


$(window).smartresize(function () {
    doResize();
});

var doResize = function () {
    var height = calcDataTableHeight();
    var width = Math.floor($(window).width());
    var headerHeight = isFree ? 160 : 150;

    if (isAffiliate)
        headerHeight = 90;

    if (width > 991) {
        $(".rankScroller").css('height', (height - 285) + 'px');
        $(".alertsScroller").css('height', (height - 205) + 'px');
        $("#playerModelGrid").css('height', (height - headerHeight) + 'px');
        $("#optimizer").css('height', (height - 245) + 'px');
        $('#excluded-players').css('height', (height - 196) + 'px');
    }
    else {
        $(".rankScroller").css('height', (500) + 'px');
        $(".alertsScroller").css('height', (500) + 'px');
        $("#playerModelGrid").css('height', (1000) + 'px');
        $("#optimizer").css('height', (310) + 'px');
        $('#excluded-players').css('height', (350) + 'px');
    }

    console.log('resize:' + height.toString());
}
var calcDataTableHeight = function () {
    var h = Math.floor($(window).height());
    var containerHeight = $(".container").height();
    return (h - containerHeight);
};

(function () {
    var app = angular.module('playerTrackerApp', ['ui.bootstrap', 'ui.slider', 'ui.bootstrap', 'xeditable', 'angularGrid', 'ngStorage']);
    app.run(function (editableOptions) {
        editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
    });
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
    app.filter('brief', function () {
        return function (input, words) {
            if (isNaN(words)) return input;
            if (words <= 0) return '';
            if (input) {
                var inputWords = input.split(/\s+/);
                if (inputWords.length > words) {
                    input = inputWords.slice(0, words).join(' ') + '…';
                }
            }
            return input;
        };
    });

    app.factory('PlayerService', function ($http) {
        return {
            savePlayerValue: function (systemId, fantasyResultId, fieldName, date, value) {
                return $http.get('/api/playermodel/' + systemId + '/customize/' + fantasyResultId + '/' + fieldName + "/" + date.replace(new RegExp('/', 'g'), '_') + "?value=" + value)
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })
            },
            getPlayers: function (system, eventDate, modelId) {

                var queryString = "?modelId=" + modelId;

                return $http.get('/api/playermodel/' + system.SportId + '/' + eventDate.replace(new RegExp('/', 'g'), '_') + "/" + queryString)
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })
            },
            getPlayerRanks: function (sportId, eventDate, modelId, positionId, system) {
                var queryString = "?modelId=" + modelId + "&positionId=" + positionId;
                system.SystemFilters.forEach(function (obj) {
                    if (obj.Active && obj.ItemType == positionId)
                        queryString += "&rank" + obj.DataItemId + "=" + obj.RankValue;
                });

                return $http.get('/api/playermodel/' + sportId + '/' + eventDate.replace(new RegExp('/', 'g'), '_') + "/ranks/" + queryString)
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })
            },
            getModels: function (sportId) {
                //return the promise directly.
                return $http.get('/api/systems/models/' + sportId + '/')
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })
            },
            getModel: function (modelId) {
                //return the promise directly.
                return $http.get('/api/systems/models/detail/' + modelId + '/')
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })
            },
            getProModels: function (sportId) {
                //return the promise directly.
                return $http.get('/api/systems/models/' + sportId + '/?memberId=8')
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })
            },
            refreshResult: function (systemId, sourceId, positionId) {
                var url = '/api/systems/' + systemId + '/result/?sourceId=' + sourceId + "&positionId=" + positionId;
                return $http.get(url)
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          });
            },
            getColumnGroups: function () {
                return {
                    "Group_0": {
                        "GroupId": 0,
                        "GroupName": "Player",
                        "DefaultSort": 0,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_1": {
                        "GroupId": 1,
                        "GroupName": "Team",
                        "DefaultSort": 1,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_2": {
                        "GroupId": 2,
                        "GroupName": "Vegas",
                        "DefaultSort": 2,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_3": {
                        "GroupId": 3,
                        "GroupName": "Opp Stat",
                        "DefaultSort": 3,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_4": {
                        "GroupId": 4,
                        "GroupName": "Time",
                        "DefaultSort": 4,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_5": {
                        "GroupId": 5,
                        "GroupName": "Stat",
                        "DefaultSort": 5,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_6": {
                        "GroupId": 6,
                        "GroupName": "Fantasy Season",
                        "DefaultSort": 6,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_7": {
                        "GroupId": 7,
                        "GroupName": "Fantasy Month",
                        "DefaultSort": 7,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_8": {
                        "GroupId": 8,
                        "GroupName": "Stat Split",
                        "DefaultSort": 8,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_10": {
                        "GroupId": 10,
                        "GroupName": "Weather",
                        "DefaultSort": 10,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_11": {
                        "GroupId": 11,
                        "GroupName": "Trends",
                        "DefaultSort": 11,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_12": {
                        "GroupId": 12,
                        "GroupName": "Passing Year",
                        "DefaultSort": 5,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_13": {
                        "GroupId": 13,
                        "GroupName": "Rushing Year",
                        "DefaultSort": 5,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_14": {
                        "GroupId": 14,
                        "GroupName": "Receiving Year",
                        "DefaultSort": 5,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    },
                    "Group_15": {
                        "GroupId": 15,
                        "GroupName": "Projections",
                        "DefaultSort": 4,
                        "PositionIds": [101, 102, 103, 104, 105, 301, 302]
                    }
                };
            }
        }
    });
    app.factory('SystemService', function ($http) {
        return {
            deleteSystem: function (system) {
                //return the promise directly.
                return $http.get('/api/systems/' + system.SystemId + '/delete')
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          });
            },
            saveColumns: function (system) {
                var queryString = "?modelId=" + system.SystemId;
                system.SystemView.SystemViewColumns.forEach(function (obj) {
                    queryString += "&col-" + obj.DataItemId + '=' + obj.Active
                });
                return $http.get('/api/systems/' + system.SystemId + '/columns/' + queryString)
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          });
            },
            saveSystem: function (currentSystem) {
                //return the promise directly.
                //data.fantasylabs.com/api/systems/1/filters/601/?StringValue=Home
                var queryString = '';
                queryString += '?systemId=' + currentSystem.SystemId + '&systemName=' + currentSystem.SystemName + '&sportId=' + currentSystem.SportId + '&positionId=' + currentSystem.PositionId + '&sourceId=' + currentSystem.SourceId + '&copySystemId=' + currentSystem.CopySystemId + '&showCurrentMatches=' + currentSystem.ShowCurrentMatches;
                return $http.get('/api/systems/' + currentSystem.SystemId + '/save/' + queryString)
                         .then(function (result) {
                             //resolve the promise as the data
                             return result.data;
                         });
            },
        }
    });

    app.factory('FiltersService', function ($http) {
        return {
            getDataItemsRanks: function (sportId) {
                //return the promise directly.
                return $http.get('/api/filters/ranks/' + sportId)
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          });
            }
        }
    });
    app.factory('SportEventService', function ($http) {
        return {
            getEvents: function (sportId, eventDate) {
                //return the promise directly.
                return $http.get('/api/sportevents/' + sportId + '/' + eventDate.replace(new RegExp('/', 'g'), '_'))
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          });
            }
        };
    });
    app.factory('SourcesService', function ($http) {
        return {
            getSourceData: function (sportId, salaryDate) {
                //return the promise directly.
                return $http.get('/api/sourcedata/' + sportId + '/' + salaryDate.replace(new RegExp('/', 'g'), '_'))
                            .then(function (result) {
                                //resolve the promise as the data
                                return result.data;
                            });
            }
        }
    });
    app.factory('NotificationService', function () {
        return {
            items: {},
            clear: function () {
                toastr.clear();
            },
            warning: function (id, text, title) {
                if (this.items[id] != null)
                    return;

                toastr.options.onShown = function () {
                    $(".toast-close-all").show();
                }
                toastr.options.onHidden = function () {
                    if ($(".toast").length == 0)
                        $(".toast-close-all").hide();
                }
                this.items[id] = toastr.warning(text, title);
            },
            success: function (text, title) {
                toastr.options = {
                    "closeButton": true,
                    "timeOut": 0,
                    "hideDuration": 5,
                    "extendedTimeOut": 0,
                    "tapToDismiss": true
                }
                toastr.options.onShown = function () {
                    $(".toast-close-all").show();
                }
                toastr.options.onHidden = function () {
                    if ($(".toast").length == 0)
                        $(".toast-close-all").hide();
                }
                toastr.success(text, title);
            }
        };
    });
    app.filter('percentage', ['$filter', function ($filter) {
        return function (input, decimals) {
            if (input == null)
                return '';
            return $filter('number')(input, decimals) + '%';
        };
    }]);
    app.filter('playerLink', ['$filter', function ($filter) {
        return function (input, decimals) {
            return $filter('number')(input, decimals) + '%';
        };
    }]);

    app.controller('PlayerModelController', function ($scope, $filter, $log, $rootScope, $http, $timeout, $modal, $location, SystemService, uiGridConstants, PlayerService, SourcesService, FiltersService, NotificationService,
                    SportEventService, $sessionStorage, DataItemsService, AlertsService) {
        $scope.players = null;
        $scope.filteredPlayers = [];
        $scope.sportEvents = null;
        $scope.groups = null;
        $scope.positions = null;
        $scope.filteredGroups = null;
        $scope.filteredPos = null;
        $scope.selectedPlayer = null;
        $scope.selectedGroup = null;
        $scope.selectedSource = null;
        $scope.selectedPos = null;
        $scope.currentDate = currentDate;
        $scope.currentSportId = 3;
        $scope.modelId = 0;
        $scope.alertId = 0;
        $scope.alertMode = "default";
        $scope.viewedAlertCount = -1;
        $scope.minPct = 0;
        $scope.maxPct = 100;
        $rootScope.systemColumns = [];
        $scope.system = null;
        $scope.gridApi = null;
        $scope.playersById = {};
        $scope.playersByComp = {};
        $scope.rankDataItems = [];
        $scope.searchText = '';
        $scope.percentTotal = '';
        $scope.models = null;
        $scope.modelChanged = false;
        $scope.contestGroups = [];
        $scope.alerts = [];
        $scope.sortedAlerts = [];
        $scope.selectedContestGroups = {};
        $scope.selectedContestGroup = null;
        $scope.mode = 'build';
        $scope.positionIds = { sports_1: [101, 102, 103, 104, 105, 106],sports_2: [201] , sports_3: [301, 302] };
        if (sportId)
            $scope.currentSportId = sportId;

        $rootScope.currentSportId = $scope.currentSportId;
        $scope.rangeItem = {
        }
        $scope.salaryRange = {
        }
        $scope.setDate = function (newDate) {

            if (newDate != currentDate)
                document.location.href = document.location.href.split('?')[0] + '?date=' + newDate.replace("/", "").replace("/", "");


        }
        $scope.getKey = function (obj) {
            return 'f' + obj.Properties.FantasyResultId.toString();
        }
        $scope.getCompKey = function (obj) {
            return 'c' + obj.Properties.EventId.toString() + ":" + obj.Properties.PlayerId.toString() + ":" + obj.Properties.SourceId.toString();
        }
        $scope.getCompKeyByDetails = function (EventId, PlayerId, SourceId) {
            return 'c' + EventId.toString() + ":" + PlayerId.toString() + ":" + SourceId.toString();
        }
        $scope.getTooltip = function (id) {
            return DataItemsService.getDataItem(id).HelpContents;
        }
        $scope.getPopover = function (obj) {
            var popover = '<table class="table table-striped table-bordered"><tbody>';
            popover += '<tr><td>Consistency<td><span class="label label-sm label-success label-mini">75% </span></td></tr>';
            popover += '<tr><td>Upside<td><span class="label label-sm label-success label-mini">75% </span></td></tr>';
            popover += '<tr><td>Duds<td><span class="label label-sm label-success label-mini">75% </span></td></tr>';
            popover += '</tbody></table>';
            return popover;
        };

        $scope.resultsPopover = {
            content: ' ',
            templateUrl: 'myPopoverTemplate.html',
            title: 'Model Results'
        };

        $scope.refreshRankSliders = function (oldVal, newVal) {
            var percentTotalOld = 0;
            var percentTotalNew = 0;
            var currentFilter = null;
            if (oldVal == null || ranksChanging)
                return;
            ranksChanging = true;

            for (var idx = 0; idx < newVal.length; idx++) {
                var objNew = newVal[idx];
                var objOld = oldVal[idx];
                if (objOld == null)
                    continue;
                if (objNew == null || $scope.selectedGroup == null || objNew.ItemType != $scope.selectedGroup.PositionId)
                    continue;
                if (objNew.RankValue != objOld.RankValue)
                    currentFilter = objNew;
                if ($scope.systemResult != null)
                    $scope.modelChanged = true;
                if (!isNaN(objNew.RankValue))
                    percentTotalNew += objNew.RankValue;
            }

            if (percentTotalNew > 100) {
                NotificationService.warning("pointsMax", "You have used all 100 points, to add points remove points from a different slider.", "Points Exceeded");
                if (currentFilter)
                    currentFilter.RankValue = currentFilter.RankValue - (percentTotalNew - 100);
            }
            else
                $scope.percentTotal = percentTotalNew;

            ranksChanging = false;
        }

        $scope.refreshRank = function () {
            PlayerService.getPlayerRanks($scope.currentSportId, $scope.currentDate, $scope.modelId, $scope.selectedGroup.PositionId, $scope.system).then(function (ranks) {
                $scope.refreshResult();
                $scope.modelChanged = false;
                for (var index = 0; index < ranks.length; index++) {
                    var obj = ranks[index];
                    if ($scope.playersById[$scope.getKey(obj)] != null)
                        $scope.playersById[$scope.getKey(obj)].Score = obj.Score;
                }
                $scope.refreshPlayers();
            });
        }

        $scope.setFilterTab = function (tabView) {

        }

        $scope.selectContestGroup = function (clearLocks) {

            if ($scope.selectedContestGroups == null || $scope.selectedContestGroup == null)
                return;

            $scope.selectedContestGroups[$scope.selectedContestGroup.SourceId] = $scope.selectedContestGroup;
            if ($scope.selectedContestGroup != null && $scope.players != null) {
                $scope.players.forEach(function (obj) {
                    if (obj.SourceId == $scope.selectedSource.SourceId) {
                        if ($scope.selectedContestGroup.Events != null && $scope.selectedContestGroup.Events.length > 0) {
                            obj.IsExcluded = true;
                            if (clearLocks)
                                obj.IsLocked = false;
                            for (var pos in $scope.selectedContestGroup.Events) {
                                if (obj.Properties.EventId == $scope.selectedContestGroup.Events[pos].SportEventId) {
                                    obj.IsExcluded = false;
                                }
                            }
                        }
                        else
                            obj.IsExcluded = false;
                        $scope.$broadcast('optimalLockChange', obj);
                    }
                });
                $scope.refreshPlayers();
            }
        }
        $scope.new = function () {
            var modalInstance = $modal.open({
                templateUrl: '/PlayerModel/templates/modal-system.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'ModelEditController',
                size: 'lg',
                resolve: {
                    system: function () {
                        return { SystemId: 0, SystemName: '', SportId: $scope.currentSportId, PositionId: ($scope.currentSportId * 100) + 1, SourceId: 4 };;
                    },
                    action: function () {
                        return 'add';
                    }
                }
            });
        };
        $scope.toggleLineup = function () {
            $scope.mode = "optimize";
            if ($('#optimal-lineup-button').text() == "Hide Optimizer")
                $('#optimal-lineup-button').text("Show Optimizer");
            else
                $('#optimal-lineup-button').text("Hide Optimizer");
            $scope.$broadcast('toggleOptimalLineup');
        }
        $scope.showOptimizer = function () {
            if ($scope.mode == "alerts")
                $scope.viewedAlertCount = $scope.alerts.length;
            $scope.mode = "optimize";

            $scope.$broadcast('showOptimal');
        }
        $scope.showRatings = function () {
            if ($scope.mode == "alerts")
                $scope.viewedAlertCount = $scope.alerts.length;
            $scope.mode = "build";

            $scope.$broadcast('showRatings');
        }
        $scope.showAlerts = function () {
            $scope.mode = "alerts";
            $scope.viewedAlertCount = $scope.alerts.length;
            $scope.$broadcast('showAlerts');
        }
        $scope.refreshEvents = function () {
            SportEventService.getEvents($scope.currentSportId, $scope.currentDate).then(function (events) {
                $scope.sportEvents = events;
            });
        }

        $scope.refreshPlayers = function () {
            $scope.filteredPlayers = $filter('filter')($scope.players, $scope.filterPlayers);
        }
        $scope.greaterThan = function (prop, val) {
            return function (item) {
                return item[prop] > val;
            }
        }
        $scope.pointsAvailable = function () {
            return 100 - $scope.percentTotal;
        }

        $scope.getSystemResultPct = function (name) {
            if (!$scope.system || !$scope.selectedGroup)
                return 0;
            var sourceId = $scope.selectedSource == null ? 4 : $scope.selectedSource.SourceId
            var obj = $scope.system.SystemResults[sourceId * 1000 + $scope.selectedGroup.PositionId];
            if (obj)
                return $scope.system.SystemResults[sourceId * 1000 + $scope.selectedGroup.PositionId][name];
            else
                return '';
        }
        $scope.isFirstPlayerLoad = true;
        $scope.getPlayers = function () {
            if ($scope.system == null)
                return;
            PlayerService.getPlayers($scope.system, $scope.currentDate, $scope.modelId).then(function (players) {

                $scope.players = players;
                for (var index = 0; index < $scope.players.length; index++) {
                    var obj = $scope.players[index];
                    var current = $scope.playersById[$scope.getKey(obj)];
                    if (current) {
                        obj.IsLocked = current.IsLocked;
                        obj.IsExcluded = current.IsExcluded;
                    }
                    for (var attrname in obj.Properties) {
                        if (!obj.hasOwnProperty(attrname)) {
                            obj[attrname] = obj.Properties[attrname];
                        }
                    }
                    $scope.playersById[$scope.getKey(obj)] = obj;
                    $scope.playersByComp[$scope.getCompKey(obj)] = obj;
                }
                if ($scope.isFirstPlayerLoad) {
                    $scope.getAlerts();
                    $scope.isFirstPlayerLoad = false;
                    $scope.selectedPlayer = $scope.players[0];
                    $scope.selectContestGroup(false);
                    $scope.filteredGroups = $filter('filter')($scope.groups, $scope.filterGroups);
                    if ($scope.filteredGroups != null)
                        $scope.selectedGroup = $scope.filteredGroups[0];
                    $scope.filteredPos = $filter('filter')($scope.positions, $scope.filterPositions);
                }
                $scope.refreshPlayers();
                $timeout(function () {
                    $scope.getPlayers();
                }, 120000);
            });
        }



        function addAlert(alert) {
            var index = -1;
            for (var idx = 0; idx < $scope.alerts.length; idx++) {
                var existingAlert = $scope.alerts[idx];
                if (existingAlert.PlayerId == alert.PlayerId && existingAlert.AlertType == 1) {
                    index = idx;
                    break;
                }
                else if (existingAlert.Detail.TeamId == alert.Detail.TeamId && existingAlert.AlertType == 2) {
                    index = idx;
                    break;
                }
            }
            if (index > -1) {
                $scope.alerts.splice(index, 1);
            }

            $scope.alerts.splice(0, 0, alert);
            $scope.sortedAlerts = $scope.alerts.sort(function (a, b) {
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(b.CreatedDate) - new Date(a.CreatedDate);
            });
        }
        $scope.getAlertCount = function () {
            if ($scope.viewedAlertCount < 0)
                return 0;
            else
                return $scope.alerts.length - $scope.viewedAlertCount;
        };



        $scope.getAlerts = function () {
           
            AlertsService.getAlerts($scope.currentSportId, $scope.alertId).then(function (alerts) {

                $timeout(function () {
                    $scope.getAlerts();
                }, 30000);

                if (alerts == null)
                    return;
                if (alerts.length > 0 && $scope.alertId > 0)
                    $scope.alertMode = "new-alerts";

                alerts.forEach(function (alert) {
                    alert.Detail = JSON.parse(alert.AlertDetails);
                    addAlert(alert);
                    if (alert.AlertId > $scope.alertId) {
                        $scope.alertId = alert.AlertId;
                    }

                    alert.getPlayerDetails = function () {
                        var source = $scope.selectedSource == null ? 4 : $scope.selectedSource.SourceId;
                        if (alert.PlayerProjectionChanges) {
                            for (var idx = 0; idx < alert.PlayerProjectionChanges.length; idx++) {
                                if (alert.PlayerProjectionChanges[idx].Properties.SourceId == source)
                                    return alert.PlayerProjectionChanges[idx];
                            }
                        }

                        return null;
                    }

                });
                if ($scope.viewedAlertCount < 1)
                    $scope.viewedAlertCount = $scope.alerts.length;

             
            });
          
          

        }

        var ranksChanging = false;
        $scope.refreshSources = function () {
            SourcesService.getSourceData($scope.currentSportId, $scope.currentDate).then(function (sourceData) {
                $scope.sources = sourceData.Sources;
                $scope.selectedSource = $scope.sources[0];

                $scope.groups = sourceData.SourcePositionGroups;
                $rootScope.systemColumns = [];
                $scope.selectGroup($scope.groups[0]);

                $scope.positions = sourceData.SourcePositions;
                $scope.selectedPos = $scope.positions[0];
                $scope.filteredGroups = $filter('filter')($scope.groups, $scope.filterGroups);
                $scope.selectedGroup = $scope.filteredGroups[0];
                $scope.filteredPos = $filter('filter')($scope.positions, $scope.filterPositions);

                $scope.contestGroups = sourceData.ContestGroups;

                var sourceId = $scope.selectedSource == null ? 4 : $scope.selectedSource.SourceId;
                if ($scope.contestGroups != null && $scope.contestGroups.length > 0) {
                    $scope.contestGroups.forEach(function (obj) {
                        if ($scope.selectedContestGroups[obj.SourceId] == null && obj.DisplayName != "All")
                            $scope.selectedContestGroups[obj.SourceId] = obj;

                        if (obj.SourceId == sourceId && $scope.selectedContestGroup == null && obj.DisplayName != "All") {
                            $scope.selectedContestGroup = obj;
                        }
                    });
                }
            });
        };

        $scope.refreshEvents();
        $scope.refreshSources();

        $scope.selectPos = function (val) {
            $scope.selectedPos = val;
        }
        $scope.selectGroup = function (val) {
            if (val != null) {
                if ($scope.selectedGroup == null || val.PositionId != $scope.selectedGroup.PositionId)
                    $rootScope.systemColumns = [];

                $scope.selectedGroup = val;
            }

            if ($scope.filterPositions) {
                $scope.filteredPos = $filter('filter')($scope.positions, $scope.filterPositions);
            }

            $scope.refreshPlayers();
            $scope.refreshResult();
        }
        $scope.selectSource = function (val) {
            $scope.selectedSource = val;
            $scope.selectedSource = val;
            $scope.selectedContestGroup = $scope.selectedContestGroups[val.SourceId];
            $scope.selectContestGroup(false);
            $scope.filteredGroups = $filter('filter')($scope.groups, $scope.filterGroups);
            $scope.selectGroup($scope.filteredGroups[0]);
            $scope.$broadcast('refreshExcludedPlayers');
        };

        $scope.filterGroups = function (group) {
            if (group.SourceId == $scope.selectedSource.SourceId || group.SourceId == 0)
                return true;
            else
                return false;
        };

        $scope.filterPositions = function (pos) {
            if (pos.SourcePositionGroupId == $scope.selectedGroup.SourcePositionGroupId)
                return true;
            else
                return false;
        };


        $scope.filterPlayers = function (player) {

            if ($scope.selectedSource != null) {
                if ($scope.selectedSource.SourceId != player.Properties.SourceId)
                    return false;
            }

            if (player.IsExcluded)
                return false;

            if ($scope.selectedGroup.SourcePositionGroupId == 0)
                return true;
            else {
                if ($scope.filteredPos != null) {
                    for (var pos in $scope.filteredPos) {
                        if (player.Properties.Position == $scope.filteredPos[pos].PositionName) {
                            return true;
                        }
                    }
                    return false;
                }
            }

            return true;
        };
        $scope.addMore = function () {
            var modalInstance = $modal.open({
                templateUrl: '/PlayerModel/templates/modal-addrank.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'RankEditController',
                size: 'lg',
                resolve: {
                    system: function () {
                        return $scope.system;
                    },
                    positionId: function () {
                        return $scope.selectedGroup.PositionId
                    },
                    dataItems: function () {
                        return DataItemsService.getAllDataItems();
                    }
                }
            });
            modalInstance.result.then(function (system) {
                $scope.system = system;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.editColumns = function () {
            var modalInstance = $modal.open({
                templateUrl: '/PlayerModel/templates/model-columns.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'ModelColumnsController',
                size: 'lg',
                resolve: {
                    system: function () {
                        return $scope.system;
                    }
                }
            });
            modalInstance.result.then(function (system) {
                $scope.system = system;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.edit = function (item, action) {
            if (item == null)
                item = { SystemId: 0, SystemName: '', SportId: 3, PositionId: 301, SourceId: 4 };

            var modalInstance = $modal.open({
                templateUrl: '/PlayerModel/templates/modal-system.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'ModelEditController',
                size: 'lg',
                resolve: {
                    system: function () {
                        return $scope.system;
                    },
                    action: function () {
                        return 'copy';
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.open = function (item, action) {
            if ($scope.system == null)
                $scope.system = { SystemId: 0, SystemName: '', SportId: $scope.currentSportId, PositionId: ($scope.currentSportId * 100) + 1, SourceId: 4 };

            var modalInstance = $modal.open({
                templateUrl: '/PlayerModel/templates/modal-open.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'SystemModalInstanceController',
                size: 'lg',
                resolve: {
                    models: function () {
                        return $scope.models;
                    },
                    system: function () {
                        return $scope.system;
                    }
                }
            });


            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openGettingStarted = function () {
            var modalInstance = $modal.open({
                templateUrl: '/GettingStarted/templates/getting-started.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'GettingStartedController',
                size: 'lg'
            });
            modalInstance.result.then(function (selectedItem) {

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
            return false;
        }

        $scope.openPlayerByFantasyResultId = function (obj) {
            var obj = $scope.playersById['f' + obj.FantasyResultId.toString()];
            return $scope.openPlayerDetails(obj.PlayerId, obj.EventId);
        };
        $scope.saveChanges = function (FantasyResultId, Field, Value, Params) {
            var obj = $scope.playersById['f' + FantasyResultId.toString()];

            if (obj[Field] != Value) {
                if (Value == "null")
                    Params.data.Properties[Field + "|custom"] = null;
                else
                    Params.data.Properties[Field + "|custom"] = Value;
                PlayerService.savePlayerValue($scope.system.SystemId, FantasyResultId, Field, $scope.currentDate, Value).then(function (result) {
                    if (result) {
                        obj = result;
                        for (var attrname in obj.Properties) {
                            if (!obj.hasOwnProperty(attrname)) {
                                obj[attrname] = obj.Properties[attrname];
                                Params.data[attrname] = obj.Properties[attrname];
                            }
                        }
                        Params.data["Score"] = obj["Score"];
                        $scope.playersById[$scope.getKey(obj)] = obj;
                        Params.api.softRefreshView();
                    }
                });
                obj[Field + "|custom"] = Value;
            }
            return false;
        }

        $scope.clearChange = function (FantasyResultId, Field, Params) {
            $scope.saveChanges(FantasyResultId, Field, "null", Params)
            return false;
        }
        var getFirstEventId = function (playerId) {
            for (var index = 0; index < $scope.players.length; index++) {
                var obj = $scope.players[index];
                if (obj.PlayerId == playerId)
                    return obj.EventId;
            }
            return 0;
        }
        $scope.openPlayerImpact = function (PlayerId, EventId, currentDetailView) {
            $rootScope.playerId = PlayerId;
            if (EventId == 0) {
                EventId = getFirstEventId(PlayerId);
            }
            $rootScope.eventId = EventId;
            if ($scope.selectedSource != null) {
                $rootScope.selectedSource = $scope.selectedSource;
            }
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

        $scope.openPlayerDetails = function (PlayerId, EventId, currentDetailView) {
            $rootScope.playerId = PlayerId;
            if (EventId == 0) {
                EventId = getFirstEventId(PlayerId);
            }
            $rootScope.eventId = EventId;
            if ($scope.selectedSource != null) {
                $rootScope.selectedSource = $scope.selectedSource;
            }
            $rootScope.currentDetailView = currentDetailView;
            var modalInstance = $modal.open({
                templateUrl: '/playerDetails/templates/player-detail-' + $scope.currentSportId + '.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'PlayerDetailController',
                size: 'lg'
            });
            modalInstance.result.then(function (selectedItem) {

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
            return false;
        }
        //column Renderers

        $scope.refreshResult = function () {
            var sourceId = $scope.selectedSource == null ? 4 : $scope.selectedSource.SourceId;
            var positionId = $scope.selectedGroup == null ? $scope.currentSportId * 100 + 1 : $scope.selectedGroup.PositionId;
            PlayerService.refreshResult($scope.modelId, sourceId, positionId).then(function (result) {
                if (result) {
                    $scope.systemResult = result;
                    $scope.system.SystemResults[result.ResultType] = result;
                }

            });
        }

        $scope.getCurrentFilters = function () {
            var filtered = [];
            if ($scope.system == null || $scope.selectedGroup == null)
                return filtered;
            for (var i = 0; i < $scope.system.SystemFilters.length; i++) {
                var item = $scope.system.SystemFilters[i];
                if (item.ItemType == $scope.selectedGroup.PositionId && item.Active) {
                    filtered.push(item);
                }
            }
            return filtered;
        }
        $scope.lockPlayer = function (fantasyResultId) {
            $scope.players.forEach(function (obj) {
                if (obj.Properties.FantasyResultId == fantasyResultId) {
                    obj.IsLocked = !obj.IsLocked;
                    $scope.$broadcast('optimalLockChange', obj);
                }
            });
        }
        $scope.likePlayer = function (fantasyResultId) {
            $scope.players.forEach(function (obj) {
                if (obj.Properties.FantasyResultId == fantasyResultId) {
                    obj.Watch = !obj.Watch;
                    obj["Watch|custom"] = obj.Watch;
                    $scope.saveChanges(fantasyResultId, "Watch", obj.Watch)
                }
            });
        }
        $scope.excludeTeam = function (team) {
            $scope.players.forEach(function (obj) {
                if (obj.Properties.Team == team) {
                    obj.IsExcluded = true;
                    obj.IsLocked = false;
                    $scope.$broadcast('optimalLockChange', obj);
                }
            });
            $scope.refreshPlayers();
        }
        function rankSort(a, b) {


            var aColumn = JSON.parse(DataItemsService.getDataItem(a.DataItemId).ColumnDetails);
            var bColumn = JSON.parse(DataItemsService.getDataItem(b.DataItemId).ColumnDetails);
            if (aColumn.rankSort == "undefined")
                return 1;
            if (bColumn.rankSort == "undefined")
                return -1;
            if (aColumn.rankSort[$scope.currentSportId - 1] < bColumn.rankSort[$scope.currentSportId - 1])
                return -1;
            if (aColumn.rankSort[$scope.currentSportId - 1] > bColumn.rankSort[$scope.currentSportId - 1])
                return 1;
            return 0;
        }


        $scope.getRanksByPositionId = function (positionId) {
            var list = DataItemsService.getAllDataItems();

            var returnList = [];
            for (var idx = 0; idx < list.length; idx++) {
                var di = list[idx];
                if (di && di.IsRank) {
                    var column = DataItemsService.getColumnDetails(di.PropertyName)
                    if (column) {
                        if (typeof column.pos !== 'undefined') {
                            column.visible = column.pos.has(positionId);
                        }
                        else
                            column.visible = true;
                        if (column.visible) {
                            returnList.push(di);
                        }
                    }
                }

            }
            return returnList;
        }

        $scope.buildRankDataItems = function (dataItems) {
            if ($scope.system == null)
                return;
            $scope.rankDataItems = dataItems;

            $scope.positionIds["sports_" + $scope.currentSportId].forEach(function (positionId) {
                var addItems = [];
                var currentCount = 0;
                $scope.getRanksByPositionId(positionId).forEach(function (dataItem) {
                    var isAdded = false;
                    $scope.system.SystemFilters.forEach(function (filter) {
                        if (filter.DataItemId == dataItem.DataItemId && filter.ItemType == positionId) {
                            filter.DataItem = dataItem;
                            isAdded = true;
                            currentCount++;
                        }
                    });
                    if (!isAdded) {
                        addItems.push(dataItem);
                    }
                });
                addItems.forEach(function (dataItem) {
                    var systemFilter = {};
                    systemFilter.SystemFilterId = 0;
                    systemFilter.DataItemId = dataItem.DataItemId;
                    systemFilter.FilterName = dataItem.DataItemName;
                    systemFilter.Active = currentCount < 4;
                    systemFilter.ItemType = positionId;
                    systemFilter.DataItem = dataItem;
                    currentCount++;
                    $scope.system.SystemFilters.push(systemFilter);

                });

                $scope.system.SystemFilters = $scope.system.SystemFilters.sort(rankSort);
                $scope.refreshRankSliders($scope.system.SystemFilters, $scope.system.SystemFilters);
            });
        }


        PlayerService.getModels($scope.currentSportId).then(function (systemModels) {
            $scope.percentTotal = 0;
            $scope.models = systemModels.Models;

            if (systemModels.Models.length > 0) {
                for (var idx = 0; idx < systemModels.Models.length; idx++) {
                    var model = systemModels.Models[idx];
                    if (model.Status == 1) {

                        $scope.modelId = model.SystemId;
                        $scope.system = model;
                        $scope.system.SystemFilters.forEach(function (obj) {
                            if (obj.ItemType == $scope.currentSportId * 100 + 1)
                                $scope.percentTotal += obj.RankValue;
                        });

                        $scope.refreshResult();
                        break;
                    }
                }
                if ($scope.modelId == 0)
                    $scope.modelId = systemModels.Models[0].SystemId;
                $scope.getPlayers();
                $scope.buildRankDataItems(systemModels.DataItemsByPositionId);

            }
            else {
                $scope.open();
            }
            $scope.saveSystem = function () {
                SystemService.saveSystem($scope.system).then(function (data) {
                });
            };


            $scope.clearSearch = function () {
                $scope.searchText = '';
            };

            $scope.$watch('system.SystemFilters', function (newVal, oldVal) {
                $scope.refreshRankSliders(oldVal, newVal);
            }, true);
        });

    });


    app.controller('FreeResourcesController', function ($scope, $filter, $log, $rootScope, $http, $timeout, $modal, $location, SystemService, uiGridConstants, PlayerService, SourcesService, FiltersService, NotificationService, SportEventService, $sessionStorage, DataItemsService) {
        $scope.players = null;
        $scope.filteredPlayers = [];
        $scope.sportEvents = null;
        $scope.groups = null;
        $scope.positions = null;
        $scope.filteredGroups = null;
        $scope.filteredPos = null;
        $scope.selectedPlayer = null;
        $scope.selectedGroup = null;
        $scope.selectedSource = null;
        $scope.selectedPos = null;
        $scope.currentDate = currentDate;
        $scope.currentSportId = 3;
        $scope.modelId = 0;
        $scope.minPct = 0;
        $scope.maxPct = 100;
        $rootScope.systemColumns = [];
        $scope.system = null;
        $scope.gridApi = null;
        $scope.playersById = {};

        $scope.rankDataItems = [];
        $scope.searchText = '';
        $scope.percentTotal = '';
        $scope.models = null;
        $scope.modelChanged = false;
        $scope.positionIds = { sports_3: [301, 302], sports_1: [101, 102, 103, 104, 105, 106] };
        $scope.contestGroups = [];
        $scope.selectedContestGroups = {};
        $scope.selectedContestGroup = null;
        $scope.loadOptimal = true;
        $scope.mode = "build";

        if (sportId)
            $scope.currentSportId = sportId;



        $scope.rangeItem = {
        }
        $scope.salaryRange = {
        }


        $scope.getKey = function (obj) {
            return 'f' + obj.Properties.FantasyResultId.toString();
        }
        $scope.getTooltip = function (id) {
            return DataItemsService.getDataItem(id).HelpContents;
        }
        $scope.getPopover = function (obj) {
            var popover = '<table class="table table-striped table-bordered"><tbody>';
            popover += '<tr><td>Consistency<td><span class="label label-sm label-success label-mini">75% </span></td></tr>';
            popover += '<tr><td>Upside<td><span class="label label-sm label-success label-mini">75% </span></td></tr>';
            popover += '<tr><td>Duds<td><span class="label label-sm label-success label-mini">75% </span></td></tr>';
            popover += '</tbody></table>';
            return popover;
        };

        $scope.resultsPopover = {
            content: 'Hello, World!',
            templateUrl: 'myPopoverTemplate.html',
            title: 'Model Results'
        };


        $scope.setFilterTab = function (tabView) {

        }

        $scope.selectContestGroup = function (clearLocks) {

            if ($scope.selectedContestGroups == null || $scope.selectedContestGroup == null)
                return;

            $scope.selectedContestGroups[$scope.selectedContestGroup.SourceId] = $scope.selectedContestGroup;
            if ($scope.selectedContestGroup != null && $scope.players != null) {
                $scope.players.forEach(function (obj) {
                    if (obj.SourceId == $scope.selectedSource.SourceId) {
                        if ($scope.selectedContestGroup.Events != null && $scope.selectedContestGroup.Events.length > 0) {
                            obj.IsExcluded = true;
                            if (clearLocks)
                                obj.IsLocked = false;
                            for (var pos in $scope.selectedContestGroup.Events) {
                                if (obj.Properties.EventId == $scope.selectedContestGroup.Events[pos].SportEventId) {
                                    obj.IsExcluded = false;
                                }
                            }
                        }
                        else
                            obj.IsExcluded = false;
                        $scope.$broadcast('optimalLockChange', obj);
                    }
                });
                $scope.refreshPlayers();
            }
        }


        $scope.refreshEvents = function () {
            SportEventService.getEvents($scope.currentSportId, $scope.currentDate).then(function (events) {
                $scope.sportEvents = events;
            });
        }

        $scope.refreshPlayers = function () {
            $scope.filteredPlayers = $filter('filter')($scope.players, $scope.filterPlayers);
        }
        $scope.greaterThan = function (prop, val) {
            return function (item) {
                return item[prop] > val;
            }
        }
        $scope.pointsAvailable = function () {
            return 100 - $scope.percentTotal;
        }

        $scope.getSystemResultPct = function (name) {
            if (!$scope.system || !$scope.selectedGroup)
                return 0;
            var sourceId = $scope.selectedSource == null ? 4 : $scope.selectedSource.SourceId
            var obj = $scope.system.SystemResults[sourceId * 1000 + $scope.selectedGroup.PositionId];
            if (obj)
                return $scope.system.SystemResults[sourceId * 1000 + $scope.selectedGroup.PositionId][name];
            else
                return '';
        }
        $scope.isFirstPlayerLoad = true;
        $scope.getPlayers = function () {
            if ($scope.system == null)
                return;
            PlayerService.getPlayers($scope.system, $scope.currentDate, $scope.modelId).then(function (players) {

                $scope.players = players;
                for (var index = 0; index < $scope.players.length; index++) {
                    var obj = $scope.players[index];
                    var current = $scope.playersById[$scope.getKey(obj)];
                    if (current) {
                        obj.IsLocked = current.IsLocked;
                        obj.IsExcluded = current.IsExcluded;
                    }
                    for (var attrname in obj.Properties) {
                        if (!obj.hasOwnProperty(attrname)) {
                            obj[attrname] = obj.Properties[attrname];
                        }
                    }
                    $scope.playersById[$scope.getKey(obj)] = obj;

                }
                if ($scope.isFirstPlayerLoad) {
                    $scope.isFirstPlayerLoad = false;
                    $scope.selectedPlayer = $scope.players[0];
                    $scope.selectContestGroup(false);
                    $scope.filteredGroups = $filter('filter')($scope.groups, $scope.filterGroups);
                    if ($scope.filteredGroups != null)
                        $scope.selectedGroup = $scope.filteredGroups[0];
                    $scope.filteredPos = $filter('filter')($scope.positions, $scope.filterPositions);
                }
                $scope.refreshPlayers();
                if ($scope.modelId == 42696 && $scope.loadOptimal) {
                    $scope.$broadcast('refreshOptimal');
                    $scope.loadOptimal = false;
                }
                $timeout(function () {
                     $scope.getPlayers();
                }, 120000)
            });
        }
        
       

        var ranksChanging = false;


        $scope.refreshSources = function () {
            SourcesService.getSourceData($scope.currentSportId, $scope.currentDate).then(function (sourceData) {
                $scope.sources = sourceData.Sources;
                $scope.selectedSource = $scope.sources[0];

                $scope.groups = sourceData.SourcePositionGroups;
                $rootScope.systemColumns = [];
                $scope.selectGroup($scope.groups[0]);

                $scope.positions = sourceData.SourcePositions;
                $scope.selectedPos = $scope.positions[0];
                $scope.filteredGroups = $filter('filter')($scope.groups, $scope.filterGroups);
                $scope.selectedGroup = $scope.filteredGroups[0];
                $scope.filteredPos = $filter('filter')($scope.positions, $scope.filterPositions);

                $scope.contestGroups = sourceData.ContestGroups;

                var sourceId = $scope.selectedSource == null ? 4 : $scope.selectedSource.SourceId
                if ($scope.contestGroups != null && $scope.contestGroups.length > 0) {
                    $scope.contestGroups.forEach(function (obj) {
                        if ($scope.selectedContestGroups[obj.SourceId] == null && obj.DisplayName != "All")
                            $scope.selectedContestGroups[obj.SourceId] = obj;

                        if (obj.SourceId == sourceId && $scope.selectedContestGroup == null && obj.DisplayName != "All") {
                            $scope.selectedContestGroup = obj;
                        }
                    });
                }
            });
        };

        $scope.refreshEvents();
        $scope.refreshSources();

        $scope.selectPos = function (val) {
            $scope.selectedPos = val;
        }
        $scope.selectGroup = function (val) {
            if (val != null) {
                if ($scope.selectedGroup == null || val.PositionId != $scope.selectedGroup.PositionId)
                    $rootScope.systemColumns = [];

                $scope.selectedGroup = val;
            }

            if ($scope.filterPositions) {
                $scope.filteredPos = $filter('filter')($scope.positions, $scope.filterPositions);
            }

            $scope.refreshPlayers();
            $scope.refreshResult();
        }
        $scope.selectSource = function (val) {
            $scope.selectedSource = val;
            $scope.selectedSource = val;
            $scope.selectedContestGroup = $scope.selectedContestGroups[val.SourceId];
            $scope.selectContestGroup(false);
            $scope.filteredGroups = $filter('filter')($scope.groups, $scope.filterGroups);
            $scope.selectGroup($scope.filteredGroups[0]);
            $scope.$broadcast('refreshExcludedPlayers');
        };

        $scope.filterGroups = function (group) {
            if (group.SourceId == $scope.selectedSource.SourceId || group.SourceId == 0)
                return true;
            else
                return false;
        };

        $scope.filterPositions = function (pos) {
            if (pos.SourcePositionGroupId == $scope.selectedGroup.SourcePositionGroupId)
                return true;
            else
                return false;
        };


        $scope.filterPlayers = function (player) {

            if ($scope.selectedSource != null) {
                if ($scope.selectedSource.SourceId != player.Properties.SourceId)
                    return false;
            }

            if (player.IsExcluded)
                return false;

            if ($scope.selectedGroup.SourcePositionGroupId == 0)
                return true;
            else {
                if ($scope.filteredPos != null) {
                    for (var pos in $scope.filteredPos) {
                        if (player.Properties.Position == $scope.filteredPos[pos].PositionName) {
                            return true;
                        }
                    }
                    return false;
                }
            }

            return true;
        };
        $scope.addMore = function () {
            var modalInstance = $modal.open({
                templateUrl: '/PlayerModel/templates/modal-addrank.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'RankEditController',
                size: 'lg',
                resolve: {
                    system: function () {
                        return $scope.system;
                    },
                    positionId: function () {
                        return $scope.selectedGroup.PositionId
                    },
                    dataItems: function () {
                        return DataItemsService.getAllDataItems();
                    }
                }
            });
            modalInstance.result.then(function (system) {
                $scope.system = system;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.editColumns = function () {
            var modalInstance = $modal.open({
                templateUrl: '/PlayerModel/templates/model-columns.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'ModelColumnsController',
                size: 'lg',
                resolve: {
                    system: function () {
                        return $scope.system;
                    }
                }
            });
            modalInstance.result.then(function (system) {
                $scope.system = system;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.edit = function (item, action) {
            if (item == null)
                item = { SystemId: 0, SystemName: '', SportId: 3, PositionId: 301, SourceId: 4 };

            var modalInstance = $modal.open({
                templateUrl: '/PlayerModel/templates/modal-system.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'ModelEditController',
                size: 'lg',
                resolve: {
                    system: function () {
                        return item;
                    },
                    action: function () {
                        return 'copy';
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.open = function (item, action) {
            if ($scope.system == null)
                $scope.system = { SystemId: 0, SystemName: '', SportId: $scope.currentSportId, PositionId: ($scope.currentSportId * 100) + 1, SourceId: 4 };

            var modalInstance = $modal.open({
                templateUrl: '/PlayerModel/templates/modal-open.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'SystemModalInstanceController',
                size: 'lg',
                resolve: {
                    models: function () {
                        return $scope.models;
                    },
                    system: function () {
                        return $scope.system;
                    }
                }
            });


            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openGettingStarted = function () {
            var modalInstance = $modal.open({
                templateUrl: '/GettingStarted/templates/getting-started.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'GettingStartedController',
                size: 'lg'
            });
            modalInstance.result.then(function (selectedItem) {

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
            return false;
        }
        $scope.openPlayerByFantasyResultId = function (obj) {
            var obj = $scope.playersById['f' + obj.FantasyResultId.toString()];
            return $scope.openPlayerDetails(obj.PlayerId, obj.EventId);
        };

        $scope.openPlayerDetails = function (PlayerId, EventId, currentDetailView) {
            $rootScope.playerId = PlayerId;
            $rootScope.eventId = EventId;
            if ($scope.selectedSource != null) {
                $rootScope.selectedSource = $scope.selectedSource;
            }
            $rootScope.currentDetailView = currentDetailView;
            var modalInstance = $modal.open({
                templateUrl: '/playerDetails/templates/player-detail-' + $scope.currentSportId + '.html?unique=' + new Date().getUTCMilliseconds().toString(),
                controller: 'PlayerDetailController',
                size: 'lg'
            });
            modalInstance.result.then(function (selectedItem) {

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
            return false;
        }
        //column Renderers

        $scope.refreshResult = function () {

        }

        $scope.getCurrentFilters = function () {
            var filtered = [];
            if ($scope.system == null || $scope.selectedGroup == null)
                return filtered;
            for (var i = 0; i < $scope.system.SystemFilters.length; i++) {
                var item = $scope.system.SystemFilters[i];
                if (item.ItemType == $scope.selectedGroup.PositionId && item.Active) {
                    filtered.push(item);
                }
            }
            return filtered;
        }
        $scope.lockPlayer = function (fantasyResultId) {
            $scope.players.forEach(function (obj) {
                if (obj.Properties.FantasyResultId == fantasyResultId) {
                    obj.IsLocked = !obj.IsLocked;
                    $scope.$broadcast('optimalLockChange', obj);
                }
            });
        }
        $scope.excludeTeam = function (team) {
            $scope.players.forEach(function (obj) {
                if (obj.Properties.Team == team) {
                    obj.IsExcluded = true;
                    obj.IsLocked = false;
                    $scope.$broadcast('optimalLockChange', obj);
                }
            });
            $scope.refreshPlayers();
        }
        $scope.buildRankDataItems = function (dataItems) {

        }
        PlayerService.getModel(systemId).then(function (systemModels) {
            $scope.percentTotal = 0;
            $scope.models = systemModels.Models;

            if (systemModels.Models.length > 0) {
                $scope.system = systemModels.Models[0];

                if ($scope.modelId == 0)
                    $scope.modelId = systemModels.Models[0].SystemId;
                $scope.getPlayers();
            }

            $scope.saveSystem = function () {
                SystemService.saveSystem($scope.system).then(function (data) {
                });
            };


            $scope.clearSearch = function () {
                $scope.searchText = '';
            };


            $scope.$watch('system.SystemFilters', function (newVal, oldVal) {
                var percentTotalOld = 0;
                var percentTotalNew = 0;
                var currentFilter = null;
                if (oldVal == null || ranksChanging)
                    return;
                ranksChanging = true;

                for (var idx = 0; idx < newVal.length; idx++) {
                    var objNew = newVal[idx];
                    var objOld = oldVal[idx];
                    if (objOld == null)
                        continue;
                    if (objNew == null || $scope.selectedGroup == null || objNew.ItemType != $scope.selectedGroup.PositionId)
                        continue;
                    if (objNew.RankValue != objOld.RankValue)
                        currentFilter = objNew;
                    if ($scope.systemResult != null)
                        $scope.modelChanged = true;
                    if (!isNaN(objNew.RankValue))
                        percentTotalNew += objNew.RankValue;
                }

                if (percentTotalNew > 100) {

                    NotificationService.warning("pointsMax", "You have used all 100 points, to add points remove points from a different slider.", "Points Exceeded");
                    if (currentFilter)
                        currentFilter.RankValue = currentFilter.RankValue - (percentTotalNew - 100);
                }
                else
                    $scope.percentTotal = percentTotalNew;

                ranksChanging = false;

            }, true);
        });

    });


    app.controller("ModelGridController", function ($scope, $rootScope, $filter, PlayerService, DataItemsService) {

        $scope.isBusy = false;

        $scope.reload = function () {
            if (!$scope.isBusy) {
                $scope.isBusy = true;
                setTimeout(function () {
                    if ($scope.gridOptions.api) {
                        if ($rootScope.systemColumns.length == 0) {
                            $scope.setColumns();
                            $scope.gridOptions.columnDefs = $rootScope.systemColumns;

                            $scope.gridOptions.api.onNewCols();

                            if ($scope.modelId == 42696)
                                $scope.gridOptions.api.setSortModel([{ field: 'AvgPts', sort: 'desc' }]);
                            else
                                $scope.gridOptions.api.setSortModel([{ field: 'Score', sort: 'desc' }]);
                        }
                        $scope.gridOptions.rowData = $scope.filteredPlayers;
                        $scope.gridOptions.api.onNewRows();



                    }
                    $scope.isBusy = false;
                }, 1);
            }
        };



        $scope.$watch('filteredPlayers', function () {
            $scope.reload();
        });

        $scope.$watch('system.SystemView', function () {
            $scope.reload();
        });
        $scope.$watch('searchText', function () {
            $scope.gridOptions.quickFilterText = $scope.searchText;
            $scope.gridOptions.api.onNewRows();
        });

        $scope.setColumns = function () {
            if ($scope.system == null || $scope.system.SystemView == null || $rootScope.systemColumns.length > 0)
                return;

            $rootScope.systemColumns = [];
            var width = 0;
            var columnHeaders = '';
            var columnGroupHeader = '';
            var currentColSpan = 0;
            var posId = $scope.selectedGroup == null ? ($scope.currentSportId * 100) + 1 : $scope.selectedGroup.PositionId;

            var columnGroups = PlayerService.getColumnGroups();
            //if ($scope.system.SystemView.SystemViewColumns[0].DataItemId!=4)
            //    $scope.system.SystemView.SystemViewColumns.splice(0, 0, { Active: true, DataItemId: 4 });


            for (var index = 0; index < $scope.system.SystemView.SystemViewColumns.length; index++) {
                var col = $scope.system.SystemView.SystemViewColumns[index];
                col.DataItem = DataItemsService.getDataItem(col.DataItemId);
                if (!col.Active)
                    continue;
                currentColSpan++;
                var column = JSON.parse(col.DataItem.ColumnDetails);
                if (column["hidden"])
                    continue;

                if (isFree && col.DataItem.PropertyName == "Watch") {
                    continue;
                }

                column["class"] = col.DataItem.DataItemName.split(' ').join('_');
                if (column["data"])
                    column["field"] = column["data"].replace("Properties.", "");

                if (column["field"] == "Score")
                    column["sort"] = "desc"

                var groupId = col.DataItem.DataItemType < 0 ? 0 : col.DataItem.DataItemType;
                column["headerGroup"] = columnGroups["Group_" + groupId.toString()].GroupName;
                if (groupId == 15 && !isFree)
                    column["headerGroup"] += " (Click to Edit)";
                column["headerName"] = column["title"];
                column["headerTooltip"] = DataItemsService.getDataItem(col.DataItemId).HelpContents;
                if (typeof column.pos !== 'undefined') {
                    column.visible = column.pos.has(posId);
                }
                else
                    column.visible = true;

                if (typeof column.sortFunction !== 'undefined') {
                    column["comparator"] = $scope[column.sortFunction];
                }
                if (typeof column.renderFunction !== 'undefined' && typeof $scope[column.renderFunction] == 'function') {
                    if (column.renderFunction.indexOf("renderInput") > -1 && !isFree) {
                        column.editable = true;
                        column.volatile = true;
                        column.newValueHandler = function (params) {
                            var valueAsNumber = parseFloat(params.newValue);
                            if (isNaN(valueAsNumber)) {
                                window.alert("Invalid value " + params.newValue + ", must be a number");
                            } else {
                                $scope.saveChanges(params.data.FantasyResultId, params.colDef.field, valueAsNumber, params);

                            }
                        }
                        column.cellRenderer = $scope[column.renderFunction];
                    }
                    else
                        column.cellRenderer = $scope[column.renderFunction];
                }
                else if (typeof column.renderFunction !== 'undefined' && typeof DataItemsService[column.renderFunction] == 'function') {
                    column.cellRenderer = DataItemsService[column.renderFunction];
                }
                else
                    column.cellRenderer = $scope.renderDefault;


                if (typeof column.cssRender !== 'undefined' && typeof $scope[column.cssRender] == 'function') {
                    column.cellClass = $scope[column.cssRender];
                }
                else
                    column.cellClass = column["field"] + " Group_" + groupId.toString();
                column.valueGetter = $scope.propGetter;

                if (column.visible)
                    $rootScope.systemColumns.push(column);


            }

        }

        $scope.propGetter = function (params) {
            if (params.data[params.colDef.field])
                return params.data[params.colDef.field];
            else
                return params.data.Properties[params.colDef.field];
        }

        $scope.gridOptions = {
            columnDefs: null,
            rowData: null,
            dontUseScrolls: false,
            pinnedColumnCount: hardwareModel == 'iPhone' ? 2 : 6,
            cellValueChanged: function () { $scope.gridOptions.api.softRefreshView(); },
            groupHeaders: true,
            enableSorting: true,
            quickFilterText: $scope.searchText,
            rowSelection: 'multiple',
        };

        $scope.setCSS = function (params, field) {
            return "rating-" + (!params.data[field] || params.data[field] == -1 ? 999 : Math.round(params.data[field] / 10) * 10).toString();
        }
        $scope.setCSSInverse = function (params, field) {
            if (params.data[field] != 0 && (!params.data[field] || params.data[field] == -1))
                return "rating-999";
            else {
                return "rating-" + (100 - Math.round(params.data[field] / 10) * 10).toString();
            }
        }
        $scope.setCssPPG = function (params) {
            return $scope.setCSS(params, "Season_PPG_Percentile");
        }
        $scope.setCssScore = function (params) {
            return $scope.setCSS(params, "Score");
        }
        $scope.setWOBAScore = function (params) {
            return $scope.setCSS(params, "wOBA_Percentile");
        }
        $scope.setCssCeiling = function (params) {
            return $scope.setCSS(params, "CeilingPct");
        }
        $scope.setOppPlusMinus = function (params) {
            return $scope.setCSS(params, "OppPlusMinusPct");
        }

        $scope.setCssFloor = function (params) {
            return $scope.setCSS(params, "FloorPct");
        }
        $scope.setCssProjPlusMinus = function (params) {
            return $scope.setCSS(params, "ProjPlusMinusPct");
        }
        $scope.setCssProj = function (params) {
            return $scope.setCSS(params, "ProjPct");
        }
        $scope.setCssProjPtPerDPct = function (params) {
            return $scope.setCSS(params, "PtPerDPct");
        }
        $scope.setISOScore = function (params) {
            return $scope.setCSS(params, "ISO_Pct");
        }
        $scope.setVegasScoreOpp = function (params) {
            if (params.data["PositionId"] == 302)
                return $scope.setCSS(params, "Vegas");
            else
                return "Vegas Group_2";
        }
        $scope.setCssPrecip = function (params) {
            return "PrecipProb Weather " + $scope.setCSSInverse(params, "PrecipProb");

        }
        $scope.setVegasScore = function (params) {
            if (params.data["PositionId"] == 301)
                return $scope.setCSS(params, "Vegas");
            else
                return "Vegas Group_2";
        }

        $scope.setWeatherScore = function (params) {
            return $scope.setCSS(params, "WeatherRating");
        }
        $scope.setSOScore = function (params) {
            return $scope.setCSS(params, "SO_Per_9Pct");
        }
        $scope.setWHIPScore = function (params) {
            return $scope.setCSS(params, "WHIP_Pct");
        }
        $scope.setCssSalaryMovement = function (params) {
            return $scope.setCSS(params, "Salary_Movement");
        }
        $scope.setCssX1 = function (params) {
            return $scope.setCSS(params, "Consistency");
        }
        $scope.setCssX2 = function (params) {
            return $scope.setCSS(params, "Upside");
        }
        $scope.setCssBargain = function (params) {
            return $scope.setCSS(params, "Site_Salary");
        }


        $scope.renderInput = function (params) {
            var value = params.value == null ? "" : params.value;
            var endHtml = "";
            if (typeof params.data.Properties[params.colDef.field + "|custom"] !== 'undefined' && params.data.Properties[params.colDef.field + "|custom"] != null) {
                value = params.data.Properties[params.colDef.field + "|custom"];
                var eSpan = document.createElement('span');
                eSpan.innerHTML = '<span>' + value + '</span><a id="b" href="#" ><i style="margin-left:2px;" class="fa fa-close"></i></a>';
                eSpan.querySelector('#b').addEventListener('click', function () {
                    $scope.clearChange(params.data.Properties.FantasyResultId, params.colDef.field, params);
                });
                return eSpan;
            }
            else
                return '<span>' + value + '</span>' + endHtml;
        };


        $scope.renderProjPlusMinus = function (params) {
            if (typeof params.data.Properties["AvgPts|custom"] !== 'undefined' && params.data.Properties["AvgPts|custom"] != null)
                return Math.round(10.0 * (params.data.Properties["AvgPts|custom"] - params.data.Properties["ImpPts"])) / 10;
            else
                return Math.round(10.0 * (params.data.Properties["AvgPts"] - params.data.Properties["ImpPts"])) / 10;
        }
        $scope.renderPointsPerSalary = function (params) {
            if (typeof params.data.Properties["AvgPts|custom"] !== 'undefined' && params.data.Properties["AvgPts|custom"] != null)
                return Math.round(10000.0 * params.data.Properties["AvgPts|custom"] / params.data.Properties["Salary"]) / 10;
            else
                return Math.round(10000.0 * params.data.Properties["AvgPts"] / params.data.Properties["Salary"]) / 10;
        }
        $scope.renderPlayerName = function (params) {
            var playerDetails = params.value;
            playerDetails += "<span class='icon-" + params.data.Properties["InjuryStatus"] + "' title='" + params.data.Properties["InjuryStatus"] + "'><span>"
            return '<span><a href="#" onclick="return angular.element(this).scope().openPlayerDetails(' + params.data.Properties.PlayerId + ',' + params.data.Properties.EventId + ')">' + playerDetails + '</a></span>';
        }

        $scope.renderLineupOrder = function (params) {
            var playerDetails = params.value;
            if (params.data.Properties["Confirmed"] != null)
                playerDetails += "<i class='icon-confirmed-" + params.data.Properties["Confirmed"] + "' title='" + params.data.Properties["Confirmed"] + "'><i>"
            return playerDetails;
        }
        $scope.renderDefault = function (params) {
            return params.value == null ? '&nbsp;' : "<span>" + params.value + "</span>";
        }
        $scope.renderPct = function (params) {
            return params.value == null ? '&nbsp;' : params.value + '%';
        }

        $scope.renderScore = function (params) {
            return params.value == -1 ? 'N/A' : params.value;
        }
        $scope.renderPlayerWatch = function (params) {

            if (typeof params.data.Properties[params.colDef.field + "|custom"] !== 'undefined') {
                params.data.Watch = params.data.Properties[params.colDef.field + "|custom"];
            }

            var lockedClass = 'notwatched';
            if (params.data.Watch)
                lockedClass = 'watched';
            return '<i class="fa fa-thumbs-up ' + lockedClass + '" id="fr-' + params.data.FantasyResultId + '" onclick="toggleWatch(this)"></i>';

        }
        $scope.RenderLock = function (params) {
            var lockedClass = '';
            if (!params.data.IsLocked)
                lockedClass = 'unlock';
            return '<i class="fa fa-lock ' + lockedClass + '" id="fr-' + params.data.FantasyResultId + '" onclick="togglePlayer(this)"></i>';

        }
        $scope.renderWatch = function (params) {
            var lockedClass = '';
            if (!params.data.IsLocked)
                lockedClass = 'unlock';
            return '<i class="fa fa-lock ' + lockedClass + '" id="fr-' + params.data.FantasyResultId + '" onclick="togglePlayer(this)"></i>';

        }

        $scope.renderUmp = function (params) {
            var badge = 'default';
            if (!params.data.Ump)
                return '<span>&nbsp;</span>';

            if (!params.data.OfficialPlusMinus)
                return params.data.Ump;

            var val = $filter('number')(params.data.OfficialPlusMinus, 1);
            if (params.data.OfficialPlusMinus > .0) {
                badge = 'success';
                val = "+" + val;
            }
            else if (params.data.OfficialPlusMinus < -.1)
                badge = 'warning';

            return '<span  style="font-size:90%" class="umpSpan badge badge-' + badge + '">' + val + '</span>&nbsp;' + params.data.Ump;
        }
        $scope.renderTeam = function (params) {
            var lockedClass = '';
            if (!params.data.IsLocked)
                lockedClass = 'unlock';
            return params.data.Team + '<i class="fa fa-times" title="Exclude Players from this Team" id="fr-' + params.data.Team + '" onclick="excludeTeam(this)"></i>';
        }

        $scope.renderTrends = function (params) {
            var checked = '';
            if (params.data.Watch)
                checked = 'checked';
            var btnStyle = 'btn-default';
            if (params.data.Trend >= 5)
                btnStyle = 'btn-success';
            return '<button style="height:25px;width:30px;padding: 2px;" onclick="return angular.element(this).scope().openPlayerDetails(' + params.data.PlayerId + ',' + params.data.EventId + ', \'trends\')" class="btn ' + btnStyle + '">' + params.data.Trend + '</button>';
        }
        $scope.renderMyTrends = function (params) {
            var checked = '';
            var btnStyle = 'btn-default';
            if (params.data.MyTrends >= 2)
                btnStyle = 'btn-success';
            return '<button style="height:25px;width:30px;padding: 2px;" onclick="return angular.element(this).scope().openPlayerDetails(' + params.data.PlayerId + ',' + params.data.EventId + ', \'trends\')" class="btn ' + btnStyle + '">' + params.data.MyTrends + '</button>';
        }

        $scope.ceilingSort = function (value1, value2, data1, data2, isInverted) {

            return $scope.sortFunction("Ceiling", value1, value2, data1, data2, isInverted);
        }
        $scope.floorSort = function (value1, value2, data1, data2, isInverted) {
            return $scope.sortFunction("Floor", value1, value2, data1, data2, isInverted);
        }
        $scope.avgPtsSort = function (value1, value2, data1, data2, isInverted) {
            return $scope.sortFunction("AvgPts", value1, value2, data1, data2, isInverted);
        }
        $scope.sortFunction = function (field, value1, value2, data1, data2, isInverted) {
            if (data1.data.Properties[field + "|custom"] != "undefined" && data1.data.Properties[field + "|custom"] != null)
                value1 = data1.data.Properties[field + "|custom"];
            if (data2.data.Properties[field + "|custom"] != "undefined" && data2.data.Properties[field + "|custom"] != null)
                value2 = data2.data.Properties[field + "|custom"];

            return value1 - value2;
        }
        $scope.clearSearch = function () {
            $scope.searchText = '';
        };
    });
    app.controller('ModelColumnsController', function ($rootScope, $scope, $log, $modalInstance, system, $window, SystemService, PlayerService) {
        $scope.system = system;
        $scope.save = function () {
            SystemService.saveColumns($scope.system).then(function (ranks) {
                document.location.href = document.location.href;
            });
        };

        $scope.setActive = function (column) {
            column.Active = !column.Active;
        }
        $scope.getEditableColumns = function () {
            var filtered = [];
            var columnGroups = PlayerService.getColumnGroups();
            filtered = $scope.system.SystemView.SystemViewColumns.slice(7);
            filtered.forEach(function (col) {
                col.groupName = columnGroups["Group_" + col.DataItem.DataItemType.toString()].GroupName;
            });
            return filtered;
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
    app.controller('RankEditController', function ($rootScope, $scope, $log, $modalInstance, system, positionId, $window, dataItems) {
        $scope.system = system;
        $scope.positionId = positionId;
        $scope.dataItems = dataItems;
        $scope.save = function () {
            $scope.system.SystemFilters.forEach(function (filter) {
                if (!filter.Active) {
                    filter.RankValue = 0;
                }
            });
            $modalInstance.close($scope.system);
        };
        $scope.getCurrentFilters = function () {
            var filtered = [];
            if ($scope.system == null || $scope.positionId == null)
                return filtered;
            for (var i = 0; i < $scope.system.SystemFilters.length; i++) {
                var item = $scope.system.SystemFilters[i];
                item.DataItem = $scope.dataItems[item.DataItemId];
                if (item.ItemType == $scope.positionId) {
                    filtered.push(item);
                }
            }
            return filtered;
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    app.controller('ModelEditController', function ($rootScope, $scope, $log, $modalInstance, system, $window, action) {
        $scope.system = system;
        $scope.action = action;
        $scope.SystemName = "";

        if (action == "copy")
            $scope.SystemName = $scope.system.SystemName + " - Copy";

        $scope.save = function () {
            $window.location.href = $window.location.href.split('?')[0] + "?id=" + $scope.system.SystemId.toString() + "&systemName=" + $scope.SystemName + "&action=" + action + "&sportId=" + $scope.system.SportId.toString();
        };


        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
    app.controller('SystemModalInstanceController', function ($rootScope, $log, $scope, $modalInstance, $modal, models, system, $window, SystemService, PlayerService) {
        $scope.models = models;
        $scope.system = system;
        $scope.modelOpenView = models.length > 0 ? "my" : "all";
        $scope.proModels = [];


        $scope.renderModelName = function (params) {
            params.$scope.openModel = $scope.openModel;
            var systemName = params.data.SystemName;
            if (params.data.CopySystemId != null && params.data.CopySystemId != 355)
                systemName += "<i class='fa fa-copy'></i>"
            return '<a   href="#" ng-click="openModel(data.SystemId)">' + systemName + '</a>';
        }
        $scope.rendeProrModelName = function (params) {
            params.$scope.openModel = $scope.openModel;
            return '<a  href="#" ng-click="openModel(data.SystemId)">{{data.SystemName}}</a><br><button class="btn btn-info" style="margin-top:8px;"  ng-click="openModel(data.SystemId)" href="#"><i class="fa fa-copy"></i>Copy</button>';
        }
        $scope.renderPosPlusMinus = function (params, sourceId, pos) {
            var posResult = params.data.SystemResults[(sourceId * 1000) + pos];
            if (!posResult)
                return '';

            if (posResult.PointsPlusMinus > 0)
                return '<span  class="percentageArrow up"><span class="ng-binding">' + Math.round(parseFloat(posResult.PointsPlusMinus) * 10) / 10 + '</span></span>';
            else
                return '<span class="percentageArrow down"><span class="ng-binding">' + Math.round(parseFloat(posResult.PointsPlusMinus) * 10) / 10 + '</span></span>';
        };
        $scope.renderQBPlusMinus = function (params) {
            return "DK:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 101) + "<br>FD:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 101);
        }
        $scope.renderRBPlusMinus = function (params) {
            return "DK:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 102) + "<br>FD:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 102);
        }
        $scope.renderWRPlusMinus = function (params) {
            return "DK:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 103) + "<br>FD:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 103);
        }
        $scope.renderTEPlusMinus = function (params) {
            return "DK:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 104) + "<br>FD:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 104);
        }
        $scope.renderDPlusMinus = function (params) {
            return "DK:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 105) + "<br>FD:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 105);
        }
        $scope.renderBatterPlusMinus = function (params) {
            return "DK:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 301) + "<br>FD:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 301);
        }
        $scope.renderPitcherPlusMinus = function (params) {
            return "DK:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 302) + "<br>FD:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 302);
        }

        $scope.renderPlusMinusProNFL = function (params) {
            var plusMinus = '<table><tr><td>';
            plusMinus += "&nbsp;&nbsp;&nbsp;DK <hr style='margin:0px;'>QB:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 101);
            plusMinus += "<br>RB:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 102);
            plusMinus += "<br>WR:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 103);
            plusMinus += "<br>TE:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 104);
            plusMinus += "</td><td>";
            plusMinus += "&nbsp;&nbsp;&nbsp;FD<hr style='margin:0px;'>QB:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 101);
            plusMinus += "<br>RB:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 102);
            plusMinus += "<br>WR:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 103);
            plusMinus += "<br>TE:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 104);
            plusMinus += '</td></tr></table>';
            return plusMinus;
        }

        $scope.renderPlusMinusPro = function (params) {
            var plusMinus = '';
            plusMinus = "DK Batters:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 301);
            plusMinus += "<br>DK Pitchers:&nbsp;" + $scope.renderPosPlusMinus(params, 4, 302);
            plusMinus += "<hr style='margin:4px;'>";
            plusMinus += "FD Batters:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 301);
            plusMinus += "<br>FD Pitchers:&nbsp;" + $scope.renderPosPlusMinus(params, 3, 302);
            return plusMinus;
        }
        $scope.renderDelete = function (params) {
            if ($scope.system.SystemId == params.data.SystemId)
                return '<div style="color:green;padding: 8px 10px;">Active</div>';

            params.$scope.delete = $scope.delete;
            return '<a class="btn btn-default btn-sm"  ng-click="delete(data)" href="#">Delete</a>';
        }
        $scope.renderCopy = function (params) {

            params.$scope.openModel = $scope.openModel;
            return '';
        }
        $scope.renderModelImage = function (params) {
            params.$scope.openModel = $scope.openModel;
            return '<a  href="#" ng-click="openModel(data.SystemId)"><div class="bkgd-' + params.data.Tags + '"></div></a>';
        }
        $scope.columnDefs = [];
        $scope.columnDefs[1] = [
            { group: "sysName", displayName: "Model Name", field: "SystemName", width: 200, cellRenderer: $scope.renderModelName, cellClass: 'systemopen-name' },
            { group: "sysName", displayName: "QB +/-", field: "SystemName", width: 90, cellRenderer: $scope.renderQBPlusMinus, cellClass: 'systemopen-results' },
           { group: "sysName", displayName: "RB +/-", field: "SystemName", width: 90, cellRenderer: $scope.renderRBPlusMinus, cellClass: 'systemopen-results' },
           { group: "sysName", displayName: "WR +/-", field: "SystemName", width: 90, cellRenderer: $scope.renderWRPlusMinus, cellClass: 'systemopen-results' },
            { group: "sysName", displayName: "TE +/-", field: "SystemName", width: 90, cellRenderer: $scope.renderTEPlusMinus, cellClass: 'systemopen-results' },
            { group: "sysName", displayName: "D +/-", field: "SystemName", width: 90, cellRenderer: $scope.renderDPlusMinus, cellClass: 'systemopen-results' },

           { group: "sysName", displayName: "Status", field: "SystemName", width: 70, cellRenderer: $scope.renderDelete, cellClass: 'systemopen-options' },

        ];
        $scope.columnDefs[3] = [
           { group: "sysName", displayName: "Model Name", field: "SystemName", width: 300, cellRenderer: $scope.renderModelName, cellClass: 'systemopen-name' },
           { group: "sysName", displayName: "Batter +/-", field: "SystemName", width: 100, cellRenderer: $scope.renderBatterPlusMinus, cellClass: 'systemopen-results' },
          { group: "sysName", displayName: "Pitcher +/-", field: "SystemName", width: 100, cellRenderer: $scope.renderPitcherPlusMinus, cellClass: 'systemopen-results' },
           { group: "sysName", displayName: "", field: "SystemName", width: 150, cellRenderer: $scope.renderDelete, cellClass: 'systemopen-options' },

        ];
        $scope.rendeProModelDesc = function (params) {
            return '<small>' + params.data.SystemDescription + "</small>";
        }
        $scope.proColumnDefs = [];
        $scope.proColumnDefs[1] = [
         { group: "sysName", displayName: "Model Type", field: "SystemId", width: 125, cellRenderer: $scope.renderModelImage, cellClass: 'systemopen-img' },
         { group: "sysName", displayName: "Model Name", field: "SystemName", width: 175, cellRenderer: $scope.rendeProrModelName, cellClass: 'systemopen-name' },
          { group: "sysName", displayName: "Description", field: "SystemDescription", width: 250, cellRenderer: $scope.rendeProModelDesc, cellClass: 'systemopen-desc' },
         { group: "sysName", displayName: "+/-", field: "SystemId", width: 150, cellRenderer: $scope.renderPlusMinusProNFL, cellClass: 'systemopen-results' },

        ];
        $scope.proColumnDefs[3] = [
             { group: "sysName", displayName: "Model Type", field: "SystemId", width: 125, cellRenderer: $scope.renderModelImage, cellClass: 'systemopen-img' },
             { group: "sysName", displayName: "Model Name", field: "SystemName", width: 175, cellRenderer: $scope.rendeProrModelName, cellClass: 'systemopen-name' },
              { group: "sysName", displayName: "Description", field: "SystemDescription", width: 275, cellRenderer: $scope.rendeProModelDesc, cellClass: 'systemopen-desc' },
             { group: "sysName", displayName: "+/-", field: "SystemId", width: 129, cellRenderer: $scope.renderPlusMinusPro, cellClass: 'systemopen-results' },

        ];
        $scope.gridOptions = {
            columnDefs: $scope.columnDefs[$scope.currentSportId],
            rowData: null,
            dontUseScrolls: false,
            enableSorting: true,
            angularCompileRows: true,
            rowHeight: 40,
            headerHeight: 40

        };

        $scope.gridProOptions = {
            columnDefs: $scope.proColumnDefs[$scope.currentSportId],
            rowData: null,
            dontUseScrolls: false,
            enableSorting: true,
            angularCompileRows: true,
            rowHeight: 80,
            headerHeight: 25

        };

        $scope.reloadPro = function () {
            setTimeout(function () {
                if ($scope.gridProOptions.api) {
                    $scope.gridProOptions.rowData = $scope.proModels;
                    $scope.gridProOptions.api.onNewRows();
                    $scope.gridProOptions.api.setSortModel([{ field: 'SystemName', sort: 'asc' }]);


                }
                $scope.isBusy = false;
            }, 1);
        };

        PlayerService.getProModels(system.SportId).then(function (systemModels) {
            $scope.proModels = systemModels.Models;
            $scope.reloadPro();
        });

        $scope.reload = function () {
            setTimeout(function () {
                if ($scope.gridOptions.api) {
                    $scope.gridOptions.rowData = $scope.models;
                    $scope.gridOptions.api.onNewRows();


                }
                $scope.isBusy = false;
            }, 1);
        };

        $scope.reload();
        $scope.reloadPro();
        $scope.delete = function (system) {
            var deleteUser = $window.confirm('Are you sure you want to delete the system?');
            if (deleteUser) {
                SystemService.deleteSystem(system).then(function (items) {
                    for (var idx = 0; idx < $scope.models.length; idx++) {
                        if ($scope.models[idx] == system) {
                            $scope.models.splice(idx, 1);
                        }
                    }
                    $scope.reload();
                });
            }
        };

        $scope.setModelOpenView = function (view) {
            $scope.modelOpenView = view;
        };

        $scope.openModel = function (id) {
            $window.location.href = $window.location.href.split('?')[0] + "?action=open&id=" + id.toString();
        };
        $scope.save = function () {

        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    doResize();

})();

(function () {
    var app = angular.module('app', ['playerTrackerApp', 'playerDetailsApp', 'optimalLineupApp', 'teamDetailsApp', 'globalApp', 'playerImpactApp']);
})();

excludeTeam = function (item) {
    var obj = $(item);
    var id = obj.prop("id").split('-')[1];
    angular.element(item).scope().excludeTeam(id);
}

togglePlayer = function (item) {
    var obj = $(item);
    var id = parseInt(obj.prop("id").split('-')[1]);

    if (obj.hasClass("unlock"))
        obj.removeClass("unlock");
    else
        obj.addClass("unlock");

    angular.element(item).scope().lockPlayer(id);

}
toggleWatch = function (item) {
    var obj = $(item);
    var id = parseInt(obj.prop("id").split('-')[1]);

    if (obj.hasClass("notwatched"))
        obj.removeClass("notwatched");
    else
        obj.addClass("notwatched");

    angular.element(item).scope().likePlayer(id);

}


window.onload = function () {

    var sq = {};
    sq.e = $(".ag-pinned-cols-viewport")[0];
    if (sq.e.addEventListener) {
        sq.e.addEventListener("mousewheel", MouseWheelHandler, false);
        sq.e.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    }
    else sq.e.attachEvent("onmousewheel", MouseWheelHandler);



    function MouseWheelHandler(e) {
        // cross-browser wheel delta
        var e = window.event || e;
        var delta = Math.max(-9999, Math.min(9999, (e.wheelDelta || -e.detail))) * 4;
        var scrollTop = $(".ag-body-viewport").scrollTop()
        $(".ag-body-viewport").scrollTop(scrollTop - delta);
        return false;
    }




}
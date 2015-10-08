function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function logout() {
    $.post("/api/account/logout/", function (data) {
        document.location.href = '/account/login/';
    });
    return false;
}
Array.prototype.has = function (value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === value) return true;
    }
    return false;
};
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

(function () {
 
    var globalModule = angular.module('globalApp', []);
    globalModule.directive('ngConfirmClick', [
    function () {
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click', function (event) {
                    if (window.confirm(msg)) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
    }]);

       
    globalModule.controller('GettingStartedController', function ( $scope, $modal, $http, $modalInstance, $sessionStorage) {
            $scope.currentView = 'Lineups';

            $scope.setView = function (view) {
                $scope.currentView = view;
            };


            $scope.ok = function () {
                $modalInstance.close($scope.items);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

        });

    globalModule.factory('AlertsService', function ($http) {
        return {
            getAlerts: function (sportId, lastRequestId) {
                return $http.get('/api/alerts/' + sportId + '/after/' + lastRequestId + "/")
                          .then(function (result) {
                              //resolve the promise as the data
                              return result.data;
                          })



            }
        }
    });



    globalModule.service('DataItemsService', function ($http, $sessionStorage) {
        var that = this;
        that.currentVersionDataItemsService = $sessionStorage.currentVersionDataItemsService;
        that.currentVersion = "1.2";
        that.buildDataItems = function (dataItems) {
            var items = [];
            var itemsByName = {};
            var columnDetails = {};

            dataItems.forEach(function (obj) {
                items[obj.DataItemId] = obj;
                itemsByName[obj.PropertyName] = obj;
                try
                {
                columnDetails[obj.PropertyName] = JSON.parse(obj.ColumnDetails);
                }
                catch(e)
                {

                }
            });
            $sessionStorage.allDataItems = items;
            $sessionStorage.allDataItemsByName = itemsByName;
            $sessionStorage.columnDetails = columnDetails;
        };
        that.getColumnDetails = function (name) {
            return $sessionStorage.columnDetails[name];
        };
        that.getAllDataItemByName = function () {
            return $sessionStorage.allDataItemsByName;
        };
        that.getDataItemByName = function (name) {
            return $sessionStorage.allDataItemsByName[name];
        };
        that.getDataItem = function (id) {
            return $sessionStorage.allDataItems[id];
        };
        that.getAllDataItems = function () {
            return $sessionStorage.allDataItems;
        };

        that.getDataItems = function () {
            return $sessionStorage.dataItems;
        };

        that.renderPlayerName = function (params) {
            var playerDetails = params.value;
            if (params.data.Properties["InjuryStatus"])
                playerDetails += "<i class='icon-" + params.data.Properties["InjuryStatus"] + "' title='" + params.data.Properties["InjuryStatus"] + "'><i>"
            return '<a href="#" onclick="return angular.element(this).scope().openPlayerDetails(' + params.data.Properties.PlayerId + ')">' + playerDetails + '</a>';
        };
        that.renderPct = function (params) {
            return params.value == null ? '' : params.value + '%';
        };
     
        that.renderMoney = function (params) {
            return params.value == null ? '' : '$' + params.value;
        };

        that.setup = function () {
            //return the promise directly.
            return $http.get('/api/filters/', { async: false })
                      .then(function (result) {
                          $sessionStorage.dataItems = result.data;
                          that.buildDataItems(result.data);
                          $sessionStorage.currentVersionDataItemsService = that.currentVersion;
                      });
        };
        that.getFilterHelp = function (dataItemId) {
            $sessionStorage.allDataItems[dataItemId].HelpContents;
        }
        if (!$sessionStorage.allDataItems || $sessionStorage.currentVersionDataItemsService != that.currentVersion) {
            this.setup();
        }
    }
    
    );

})();

'use strict';

(function () {

    /**
     * @ngdoc overview
     * @name ngStorage
     */

    angular.module('ngStorage', []).

    /**
     * @ngdoc object
     * @name ngStorage.$localStorage
     * @requires $rootScope
     * @requires $window
     */

    factory('$localStorage', _storageFactory('localStorage')).

    /**
     * @ngdoc object
     * @name ngStorage.$sessionStorage
     * @requires $rootScope
     * @requires $window
     */

    factory('$sessionStorage', _storageFactory('sessionStorage'));

    function _storageFactory(storageType) {
        return [
            '$rootScope',
            '$window',
            '$log',

            function (
                $rootScope,
                $window,
                $log
            ) {
                // #9: Assign a placeholder object if Web Storage is unavailable to prevent breaking the entire AngularJS app
                var webStorage = $window[storageType] || ($log.warn('This browser does not support Web Storage!'), {}),
                    $storage = {
                        $default: function (items) {
                            for (var k in items) {
                                angular.isDefined($storage[k]) || ($storage[k] = items[k]);
                            }

                            return $storage;
                        },
                        $reset: function (items) {
                            for (var k in $storage) {
                                '$' === k[0] || delete $storage[k];
                            }

                            return $storage.$default(items);
                        }
                    },
                    _last$storage,
                    _debounce;

                for (var i = 0, k; i < webStorage.length; i++) {
                    // #8, #10: `webStorage.key(i)` may be an empty string (or throw an exception in IE9 if `webStorage` is empty)
                    (k = webStorage.key(i)) && 'ngStorage-' === k.slice(0, 10) && ($storage[k.slice(10)] = angular.fromJson(webStorage.getItem(k)));
                }

                _last$storage = angular.copy($storage);

                $rootScope.$watch(function () {
                    _debounce || (_debounce = setTimeout(function () {
                        _debounce = null;

                        if (!angular.equals($storage, _last$storage)) {
                            angular.forEach($storage, function (v, k) {
                                angular.isDefined(v) && '$' !== k[0] && webStorage.setItem('ngStorage-' + k, angular.toJson(v));

                                delete _last$storage[k];
                            });

                            for (var k in _last$storage) {
                                webStorage.removeItem('ngStorage-' + k);
                            }

                            _last$storage = angular.copy($storage);
                        }
                    }, 100));
                });

                // #6: Use `$window.addEventListener` instead of `angular.element` to avoid the jQuery-specific `event.originalEvent`
                'localStorage' === storageType && $window.addEventListener && $window.addEventListener('storage', function (event) {
                    if ('ngStorage-' === event.key.slice(0, 10)) {
                        event.newValue ? $storage[event.key.slice(10)] = angular.fromJson(event.newValue) : delete $storage[event.key.slice(10)];

                        _last$storage = angular.copy($storage);

                        $rootScope.$apply();
                    }
                });

                return $storage;
            }
        ];
    }

})();


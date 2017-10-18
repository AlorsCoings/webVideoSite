(function() {
    'use strict';

    angular.module('videoSiteApp')
        .directive('loading', loading);

    function loading() {
        var directive = {
            template: '<div><div ng-show="loading" class="loading-container"></div><div ng-hide="loading" ng-transclude></div></div>',
            restrict: 'A',
            transclude: true,
            replace: true,
            scope: {
                loading: "=loading"
            },
            compile: function compile(element, attrs, transclude) {
                var spinner = new Spinner().spin();
                var loadingContainer = element.find(".loading-container")[0];
                if (angular.isDefined(loadingContainer))
                    loadingContainer.appendChild(spinner.el);
            }
        };
        return directive;
    }
})();

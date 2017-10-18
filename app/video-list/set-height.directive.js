(function() {
    'use strict';

    angular
        .module('videoList')
        .directive('setHeight', setHeight);

    function setHeight() {

        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;

        function link(scope, element) {
            scope.$on('imageLoaded', function() {
                var figure = angular.element(element.children()[0]);
                var newHeight = figure[0].offsetHeight + 50;
                element.height(newHeight + 'px');
            });
        }
    }

})();

(function() {
    'use strict';

    angular
        .module('videoList')
        .directive('imageOnLoad', imageOnLoad);

    function imageOnLoad() {
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element) {
            element.bind('load', function() {
                scope.$emit('imageLoaded');
            });
        }
    }
})();

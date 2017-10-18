(function() {
    'use strict';

    angular
        .module('videoSiteApp')
        .config(config);

    config.$inject = [
        '$locationProvider',
        '$routeProvider'
    ];

    function config($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');

        $routeProvider.
        when('/videos', {
            template: '<video-list></video-list>'
        }).
        when('/videos/playlist/:playlistId', {
            template: '<video-list></video-list>'
        }).
        otherwise('/videos');
    }
})();

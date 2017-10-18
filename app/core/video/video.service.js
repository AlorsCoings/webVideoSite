(function() {
    'use strict';

    angular
        .module('core.video')
        .factory('Video', Video);

    Video.$inject = ['$resource'];

    function Video($resource) {
        var service = $resource('videos/videos.json/:videoId', {
            videoId: '@id'
        }, {
            query: {
                method: 'GET',
                isArray: true
            }
        });

        return service;
    }
})();

(function() {
    'use strict';

    angular
        .module('core.playlist')
        .factory('Playlist', Playlist);

    Playlist.$inject = ['$resource'];

    function Playlist($resource) {
        var service = $resource('videos/:playlistId.json/:videoId', {
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

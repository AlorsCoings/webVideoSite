(function() {
    'use strict';

    angular
        .module('core', [
        'ngCookies',
        'core.video',
        'core.socket',
        'core.playlist',
        'core.user',
        'core.player'
    ]);
})();

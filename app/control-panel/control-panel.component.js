(function() {
    'use strict';

    angular
        .module('controlPanel')
        .component('controlPanel', {
            templateUrl: 'control-panel/control-panel.template.html',
            controller: ControlPanelController
        });

    ControlPanelController.$inject = [
        'VideoPlayer',
        'socket'
    ];

    function ControlPanelController(VideoPlayer, socket) {
        var self = this;
        self.moreButtons = false;
        self.pauseButton = "glyphicon-question-sign";
        self.switchButtonsArrow = switchButtonsArrow;
        self.switchButtons = switchButtons;
        self.pause = pause;
        self.stop = stop;
        self.stopAll = stopAll;
        self.fastBackward = fastBackward;
        self.backward = backward;
        self.forward = forward;
        self.fastForward = fastForward;
        self.volumeUp = volumeUp;
        self.volumeDown = volumeDown;
        self.nextAudio = nextAudio;
        self.previousAudio = previousAudio;
        self.nextSubtitle = nextSubtitle;
        self.previousSubtitle = previousSubtitle;
        self.toggleSubtitles = toggleSubtitles;

        socket.on("pause", function(data) {
            if (data.playing) {
                if (data.pause) {
                    self.pauseButton = "glyphicon-play";
                } else {
                    self.pauseButton = "glyphicon-pause";
                }
            } else {
                self.pauseButton = "glyphicon-question-sign";
            }
        });

        function switchButtonsArrow() {
            if (self.moreButtons) {
                return "glyphicon-circle-arrow-down";
            } else {
                return "glyphicon-circle-arrow-up";
            }
        }

        function switchButtons() {
            self.moreButtons = !self.moreButtons;
        }

        function pause() {
            VideoPlayer.pause();
        }

        function stop() {
            VideoPlayer.stop();
        }

        function stopAll() {
            VideoPlayer.stopAll();
        }

        function fastBackward() {
            VideoPlayer.fastBackward();
        }

        function backward() {
            VideoPlayer.backward();
        }

        function forward() {
            VideoPlayer.forward();
        }

        function fastForward() {
            VideoPlayer.fastForward();
        }

        function volumeUp() {
            VideoPlayer.volumeUp();
        }

        function volumeDown() {
            VideoPlayer.volumeDown();
        }

        function nextAudio() {
            VideoPlayer.nextAudio();
        }

        function previousAudio() {
            VideoPlayer.previousAudio();
        }

        function nextSubtitle() {
            VideoPlayer.nextSubtitle();
        }

        function previousSubtitle() {
            VideoPlayer.previousSubtitle();
        }

        function toggleSubtitles() {
            VideoPlayer.toggleSubtitles();
        }
    }
})();

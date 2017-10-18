(function() {
        'use strict';

        angular
            .module('core.player')
            .factory('VideoPlayer', VideoPlayer);

        VideoPlayer.$inject = ['socket'];

        function VideoPlayer(socket) {
            var service = {
                play: play,
                pause: pause,
                stop: stop,
                stopAll: stopAll,
                fastBackward: fastBackward,
                backward: backward,
                forward: forward,
                fastForward: fastForward,
                volumeUp: volumeUp,
                volumeDown: volumeDown,
                nextAudio: nextAudio,
                previousAudio: previousAudio,
                nextSubtitle: nextSubtitle,
                previousSubtitle: previousSubtitle,
                toggleSubtitles: toggleSubtitles
            };
            return service;

            function play(nameFile, title, videoId, option) {
                socket.emit("video", {
                    action: "play",
                    title: title,
                    videoId: videoId,
                    option: option,
                    file: [nameFile]
                });
            }

            function pause() {
                socket.emit("video", {
                    action: "pause"
                })
            }

            function stop() {
                socket.emit("video", {
                    action: "quit"
                })
            }

            function stopAll() {
                socket.emit("video", {
                    action: "quitAll"
                })
            }

            function fastBackward() {
                socket.emit("video", {
                    action: "fast-backward"
                })
            }

            function backward() {
                socket.emit("video", {
                    action: "backward"
                })
            }

            function forward() {
                socket.emit("video", {
                    action: "forward"
                })
            }

            function fastForward() {
                socket.emit("video", {
                    action: "fast-forward"
                })
            }

            function volumeUp() {
                socket.emit("video", {
                    action: "volume-up"
                })
            }

            function volumeDown() {
                socket.emit("video", {
                    action: "volume-down"
                })
            }

            function nextAudio() {
                socket.emit("video", {
                    action: "next-audio"
                })
            }

            function previousAudio() {
                socket.emit("video", {
                    action: "previous-audio"
                })
            }

            function nextSubtitle() {
                socket.emit("video", {
                    action: "next-subtitle"
                })
            }

            function previousSubtitle() {
                socket.emit("video", {
                    action: "previous-subtitle"
                })
            }

            function toggleSubtitles() {
                socket.emit("video", {
                    action: "toggle-subtitles"
                })
            }
        }
})();

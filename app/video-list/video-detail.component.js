(function() {
    'use strict';

    angular
        .module('videoList')
        .component('videoDetail', {
            templateUrl: 'video-list/video-detail.template.html',
            controller: VideoDetailController,
            bindings: {
                video: '<',
                onGlyphiconChange: '&',
                onAlreadySeen: '&',
                onUpdateVideo: '&',
                onPlayVideo: '&'
            }
        });

    VideoDetailController.$inject = ['$timeout'];

    function VideoDetailController($timeout) {
        var self = this;
        self.clicked = false;
        self.hrefLink = "";
        self.glyphiconChange = glyphiconChange;
        self.playVideo = playVideo;
        self.hasFile = hasFile;
        self.alreadySeen = alreadySeen;
        self.updateDurationClass = updateDurationClass;
        self.durationClass = "col-xs-12";

        self.$onInit = function() {
            updateHref();
            updateDurationClass();
        }

        function updateDurationClass() {
            if (self.video.type === "Video") {
                self.durationClass = "col-xs-6";
            }
        }

        function updateHref() {
            if (angular.isUndefined(self.video.file)) {
                self.hrefLink = "#!/videos/" + self.video.videoId;
            }
        }

        function glyphiconChange() {
            return self.onGlyphiconChange(self.video);
        }

        function playVideo() {
            self.clicked = true;
            if (angular.isDefined(self.video.file)) {
                self.onPlayVideo(self.video);
                $timeout(function() {
                    self.onUpdateVideo(self.video);
                    self.clicked = false;
                }, 2000);
            }
        }

        function alreadySeen() {
            self.onAlreadySeen(self.video);
        }

        function hasFile() {
            return angular.isDefined(self.video.file);
        }
    }
})();

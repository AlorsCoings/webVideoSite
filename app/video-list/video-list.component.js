(function() {
    'use strict';

    angular
        .module('videoList')
        .component('videoList', {
            templateUrl: 'video-list/video-list.template.html',
            controller: VideoListController
        });

    VideoListController.$inject = [
        '$location',
        '$filter',
        '$routeParams',
        '$timeout',
        '$scope',
        'Playlist',
        'Video',
        'User',
        'VideoPlayer'
    ];

    function VideoListController($location, $filter, $routeParams, $timeout, $scope,
        Playlist, Video, User, VideoPlayer) {
        var self = this;
        var playlistId = $routeParams.playlistId;
        $scope.loading = true;
        self.isPlaylistVideo = false;
        self.showHome = false;
        self.alreadySeen = alreadySeen;
        self.glyphiconChange = glyphiconChange;
        self.playVideo = playVideo;
        self.updateVideo = updateVideo;
        self.orderBy = User.orderBy;
        self.age = User.age;
        self.playAll = playAll;
        self.orderByChange = orderByChange;
        self.ageChange = ageChange;
        self.returnHome = returnHome;

        getVideos();

        function orderByChange(newValue) {
            User.updateOrderBy(newValue);
        }

        function ageChange(newValue) {
            User.updateAge(newValue);
            updateNumberVideos();
        }

        function loadingDone() {
            $timeout(function() {
                $scope.loading = false;
            }, 0);
        }

        // check age
        function updateNumberVideos() {
            for (var video of self.videos) {
                var videoPlaylistId = video.videoId.replace(/playlist\/(.*)$/, "$1");
                Playlist.query({
                    playlistId: videoPlaylistId
                }, function(data) {
                    var nbSeenVideos = 0;
                    var nbVideos = 0;
                    for (var playlistVideo of data) {
                        if (checkAge(playlistVideo)) {
                            if (playlistVideo.seen && playlistVideo.type === "Video") {
                                nbSeenVideos++;
                            }
                            nbVideos++;
                        }
                    }
                    var tempPlaylistId = data[0].videoId.replace(/(playlist\/.*)\/.*$/, "$1");
                    for (var videoTemp of self.videos) {
                        if (videoTemp.videoId === tempPlaylistId) {
                            if (nbSeenVideos === 0) {
                                videoTemp.numberVideosString = nbVideos;
                            } else {
                                videoTemp.numberVideosString = nbSeenVideos + '/' + nbVideos;
                            }
                        }
                    }
                });
            }
        }

        function videoSelectionDone() {
            loadingDone();
            updateNumberVideos();
        }

        function getVideos() {
            if (angular.isDefined(playlistId)) {
                self.isPlaylistVideo = true;
                self.videos = Playlist.query({
                    playlistId: playlistId
                }, loadingDone)
            } else {
                self.videos = Video.query({}, videoSelectionDone)
            }
        }

        function alreadySeen(video) {
            if (angular.isDefined(video)) {
                if (video.type === "Video") {
                    if (angular.isUndefined(video.seen) ||
                        video.seen === false) {
                        video.seen = true;
                    } else {
                        video.seen = false;
                    }
                    if (self.isPlaylistVideo) {
                        Playlist.save({
                            playlistId: playlistId
                        }, video);
                    } else {
                        Video.save(video);
                    }
                    self.glyphiconChange();
                }
            }
        }

        function glyphiconChange(video) {
            if (angular.isDefined(video)) {
                if (angular.isUndefined(video.seen) || video.seen === false) {
                    return "glyphicon-eye-open";
                } else {
                    return "glyphicon-eye-close";
                }
            }
        }

        function updateVideo(video) {
            if (video.type === "Video") {
                video.seen = true;
                if (self.isPlaylistVideo) {
                    Playlist.save({
                        playlistId: playlistId
                    }, video);
                } else {
                    Video.save(video);
                }
            }
        }

        function playVideo(video) {
            VideoPlayer.play(video.file, video.title,
                video.videoId, video.option);
        }

        function playAll() {
            for (var video of self.videos) {
                VideoPlayer.play(video.file, video.title,
                    video.videoId, video.option);
            }
        }

        function returnHome() {
            $location.path("/videos");
            self.query = "";
        }

        function checkAge(item) {
            if (item.age == 0) {
                return true;
            } else {
                switch (self.age) {
                    case 'child':
                        return item.age <= 3;
                    case 'baby':
                        return item.age <= 1;
                    case 'greatChild':
                        return (item.age > 3 && item.age < 18);
                    case 'adult':
                        return item.age >= 18;
                    case 'all':
                        return true;
                    default:
                        return item.age <= 3;
                }
            }
        }

        $scope.checkAge = function(prop) {
            return function(item) {
                if (item[prop] == 0) {
                    return true;
                } else {
                    switch (self.age) {
                        case 'child':
                            return item[prop] <= 3;
                        case 'baby':
                            return item[prop] <= 1;
                        case 'greatChild':
                            return (item[prop] > 3 && item[prop] < 18);
                        case 'adult':
                            return item[prop] >= 18;
                        case 'all':
                            return true;
                        default:
                            return item[prop] <= 3;
                    }
                }
            }
        }

        $scope.checkDescription = function(query) {
            return function(item) {
                var videoDescription = $filter('filter')([item], {
                    description: query
                })[0];
                var videoTitle = $filter('filter')([item], {
                    title: query
                })[0];
                return (angular.isDefined(videoDescription) ||
                    angular.isDefined(videoTitle));
            }
        }

        $scope.$watchCollection('filteredVideos',
            function(newVideos, oldVideos) {
                if (oldVideos && newVideos && newVideos.length === 0) {
                    self.showHome = true;
                } else {
                    self.showHome = false;
                }
            });
    }
})();

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan'); // formerly express.logger
var errorhandler = require('errorhandler');
var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.set('port', 8000);
app.engine('html', require('ejs').renderFile);

// express/connect middleware
app.use(favicon(__dirname + '/app/favicon.ico'));
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// serve up static assets
app.use(express.static(path.join(__dirname, 'app')));

app.post('/videos/videos.json', function(req, res) {
    var fs = require('fs');
    var fileName = __dirname + '/app/videos/videos.json';
    var fileContent = fs.readFileSync(fileName);
    var content = JSON.parse(fileContent);
    var videoUpdated = req.body;
    for (var i in content) {
        if (content[i].videoId === videoUpdated.videoId) {
            content[i] = videoUpdated;
            console.log("Updated " + content[i]);
            break;
        }
    }
    fs.writeFile(fileName, JSON.stringify(content, null, 4), function(err) {
        if (err) return console.log(err);
        console.log('writing to ' + fileName);
    });
});

app.post('/videos/:playlist', function(req, res) {
    var fs = require('fs');
    var fileName = __dirname + '/app/videos/' + req.params.playlist;
    var fileContent = fs.readFileSync(fileName);
    var content = JSON.parse(fileContent);
    var videoUpdated = req.body;
    for (var i in content) {
        if (content[i].videoId === videoUpdated.videoId) {
            content[i] = videoUpdated;
            console.log("found!");
            break;
        }
    }
    fs.writeFile(fileName, JSON.stringify(content, null, 4), function(err) {
        if (err) return console.log(err);
        console.log('writing to ' + fileName);
    });
});

// development only
if ('development' === app.get('env')) {
    app.use(errorhandler());
}

// omxcontrol

var exec = require('child_process').exec;
var pipe = false;
var map = false;
var playlistVideos = [];

function turn_on_and_switch_tv() {
    console.log('Turning on tv');
    exec('echo "on 0" | cec-client -s');
    console.log('Switching to raspberry pi input (1.0.0.0) for tv');
    exec('echo "tx 4F:82:10:00" | cec-client -s');
}

function omx(mapper) {
    map = mapper;
    return omx.express;
}

omx.start = function(onFinish) {
    turn_on_and_switch_tv();
    if (!pipe && playlistVideos.length > 0) {
        var video = playlistVideos.shift();
        var videoFile = video.file;
        var option = video.option;
        var tempPipe = 'omxcontrol' + guid();
        pipe = tempPipe;
        exec('mkfifo ' + pipe);
        videoPlaying = true;
        videoPause = false;
        io.emit("pause", {
            playing: videoPlaying,
            pause: videoPause
        });
        if (!option) {
            option = "";
        }
        console.log('omxplayer "' + videoFile + '" ' + option + ' < ' + pipe);
        exec('omxplayer "' + videoFile + '" ' + option + ' < ' + pipe, function(error, stdout, stderr) {
            console.log(stdout);
            console.log("killing temp pipe");
            if (pipe == tempPipe) {
                exec('rm ' + tempPipe);
                pipe = false;
            }
            if (playlistVideos.length > 0) {
                omx.start();
            }
            if (onFinish) {
                onFinish(error, stdout, stderr);
            }
        });
        exec('echo . > ' + tempPipe);
    }
};

omx.sendKey = function(key) {
    if (!pipe) return;
    exec('echo -n ' + key + ' > ' + pipe);
};

omx.mapKey = function(command, key, then) {
    omx[command] = function() {
        omx.sendKey(key);
        if (then) {
            then();
        }
    };
};

omx.resetPipe = function() {
    console.log("reset asked");
    exec('rm ' + pipe);
    pipe = false;
    exec('pkill omxplayer');
}

omx.mapKey('pause', 'p');
omx.mapKey('quit', 'q', function() {
    console.log("quit asked");
    omx.resetPipe();
    if (playlistVideos.length > 0) {
        omx.start();
    }
});

// Create unique id
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

//Run and pipe shell script output
// function run_shell(cmd, args, cb, end) {
//     var spawn = require('child_process').spawn,
//         child = spawn(cmd, args),
//         me = this;
//     child.stdout.on('readable', function() {
//         cb(me, child.stdout);
//     });
//     child.stdout.on('end', end);
// }

// Socket.io Communication
var videoPlaying = false;
var videoPause = false;
io.sockets.on('connection', function(socket) {
    io.emit("pause", {
        playing: videoPlaying,
        pause: videoPause
    });
    socket.on("log", function(data) {
        console.log(data);
    });
    socket.on("video", function(data) {
        switch (data.action) {
            case 'play':
                console.log(data);
                playlistVideos.push(data);
                omx.start( // function(error, stdout, stderr) {
                    //     videoPlaying = false;
                    //     io.emit("pause", {
                    //         playing: videoPlaying,
                    //         pause: videoPause
                    //     });
                    // }
                );
                break;
            case 'pause':
                videoPause = !videoPause;
                io.emit("pause", {
                    playing: videoPlaying,
                    pause: videoPause
                });
                omx.pause();
                break;
            case 'quit':
                videoPlaying = false;
                io.emit("pause", {
                    playing: videoPlaying,
                    pause: videoPause
                });
                omx.quit();
                break;
            case 'quitAll':
                videoPlaying = false;
                io.emit("pause", {
                    playing: videoPlaying,
                    pause: videoPause
                });
                playlistVideos = [];
                omx.quit();
                break;
            case 'fast-backward':
                omx.sendKey("^[[B");
                break;
            case 'backward':
                omx.sendKey("^[[D");
                break;
            case 'forward':
                omx.sendKey("^[[C");
                break;
            case 'fast-forward':
                omx.sendKey("^[[A");
                break;
            case 'volume-up':
                omx.sendKey("+");
                break;
            case 'volume-down':
                omx.sendKey("-");
                break;
            case 'next-audio':
                omx.sendKey("k");
                break;
            case 'previous-audio':
                omx.sendKey("j");
                break;
            case 'next-subtitle':
                omx.sendKey("m");
                break;
            case 'previous-subtitle':
                omx.sendKey("n");
                break;
            case 'toggle-subtitles':
                omx.sendKey("s");
                break;
            case 'show-info':
                omx.sendKey("z");
                break;
            default:
                console.log('Did not find any correspondance for ' + data.action);
        }
    });
});

// Start server
server.listen(app.get('port'), function() {
    console.log('server listening on port ' + app.get('port'));
});

#!/usr/bin/perl

use strict;
use warnings;
use Encode qw(encode decode);
binmode STDOUT, ":utf8";
use utf8;
use JSON;
use POSIX qw(strftime);

my $runningFile = "/tmp/downloadLatest.running";
# Check if a current process is already running
if (-e $runningFile) {
    print "Process is already running";
} else {
    open(my $runningHandle, ">", "$runningFile") or
        die "Can't open file " . $runningFile;
    my $currentTime = strftime "%a %b %e %H:%M:%S %Y", localtime;
    print $runningHandle $currentTime;
    close $runningHandle;

    # Setup directory
    my $directory = "/home/pi/webVideoSite/downloadLatest/";
    my $videoDirectory = "/media/hdd/Videos/";
    my $jsonDirectory = "/home/pi/webVideoSite/app/videos/";
    my $imageDirectory = "/home/pi/webVideoSite/app/images/ToSmall/";
    my $smallImageDirectory = "/home/pi/webVideoSite/app/images/";

    my $youtubeListFile = $directory . "lists";

    # Retrive youtube playlists
    open(my $youtubePlaylistsInfo, "<", "$youtubeListFile") or
        die "Can't open file $youtubeListFile";

    # Parse each line
    while (my $line = <$youtubePlaylistsInfo>) {

        my ($youtubePlaylist, $partOrAll, $latestVideoFileTitle, $playlistFile) = split / /, $line;
        print "\tyoutubePlaylist: $partOrAll $youtubePlaylist\n";

        # Remove newline and co
        $playlistFile =~ s/\R//g;

        print "\tname: $latestVideoFileTitle: $playlistFile\n";

        my $latestVideoFile = $directory . $playlistFile;
        print "\tlatestVideoFile: $latestVideoFile\n";

        # Check the latest video url found
        open(my $latestVideoUrlFile, "<", "$latestVideoFile") or
            die "Can't open file $latestVideoFile";
        print "Reading " . $latestVideoFile . "\n";
        my $latestVideoUrl = <$latestVideoUrlFile>;
        close $latestVideoUrlFile;
        $latestVideoUrl =~ s/\R//g;

        # Download the html page of the youtube channel
        my $html = `curl -sS -L --compressed -A "Mozilla/5.0 (compatible)" "$youtubePlaylist"`  or die  "\nThere was a problem downloading the HTML page.\n\n";
        $html = decode( 'utf-8', $html );

        # Retrive the video url and title
        my $regexExpr; ;
        if($partOrAll =~ m/all/){
            $regexExpr = '<h3 class="yt-lockup-title';
        } else {
            $regexExpr = '<tr class="pl-video yt-uix-tile';
        }
        my ($newVideoUrl) = $html =~ m/\Q$regexExpr\E.*href="([^"]*)"/i;
        $newVideoUrl = "https://www.youtube.com". $newVideoUrl;
        my ($newVideoTitle) = $html =~ m/\Q$regexExpr\E.*title="([^"]*)"/i;
        $newVideoTitle =~ s/&#39;/'/g;
        $newVideoTitle =~ s/»//g;
        $newVideoTitle =~ s/\//-/g;
        $newVideoTitle =~ s/«//g;
        $newVideoTitle =~ s/#//g;
        $newVideoTitle =~ s/—//g;
        $newVideoTitle =~ s/\?//g;
        $newVideoTitle =~ s/!//g;
        $newVideoTitle =~ s/C[’_']est ça l[’_']histoire //g;
        $newVideoTitle =~ s/Confessions d[’_']Histoire\s*-//g;
        $newVideoTitle =~ s/DATAGUEULE//gi;
        $newVideoTitle =~ s/Le Moment Meurice//gi;
        $newVideoTitle =~ s/Science étonnante//gi;
        $newVideoTitle =~ s/e-penser//gi;
        $newVideoTitle =~ s/e penser//gi;
        $newVideoTitle =~ s/Heureka//gi;
        $newVideoTitle =~ s/Heu?reka//gi;
        $newVideoTitle =~ s/La drôle d[’_']humeur de Pierre-Emmanuel Barré//gi;
        $newVideoTitle =~ s/([^\d]*)([\d\.]*)(.*)/$2 - $1$3/i;
        $newVideoTitle =~ s/-\s*$//gi;
        $newVideoTitle =~ s/^\s*-//gi;
        $newVideoTitle =~ s/^\s*//g;
        $newVideoTitle =~ s/\s*$//g;
        $newVideoTitle =~ s/  / /g;
        $newVideoTitle =~ s/--/-/g;
        my $newVideoTitleUnderscore = $newVideoTitle;
        $newVideoTitleUnderscore =~ s/ /_/g;

        print "newVideoUrl: " . $newVideoUrl . "\n";
        print "newVideoTitle: " . $newVideoTitle . "\n";
        print "newVideoTitleUnderscore: " . $newVideoTitleUnderscore . "\n";

        # Remove url options from playlist video
        my $smallNewVideoUrl = $newVideoUrl;
        $smallNewVideoUrl =~ s/([^&]*)&.*$/$1/;
        my $smallLatestVideoUrl = $latestVideoUrl;
        $smallLatestVideoUrl =~ s/([^&]*)&.*$/$1/;
        print "smallNewVideoUrl: " . $smallNewVideoUrl . "\n";
        print "smallLatestVideoUrl: " . $smallLatestVideoUrl . "\n";

        # Check if the video title is empty
        unless ($newVideoTitle =~ m//) {

            # Is the latest video the true latest
            unless ($smallNewVideoUrl eq $smallLatestVideoUrl) {

                # Download the latest video in the corresponding directory
                my $destinationFile = $videoDirectory . $latestVideoFileTitle . "/" . $newVideoTitleUnderscore;
                system("/usr/local/bin/youtube-dl", "$newVideoUrl", "--no-playlist", "--limit-rate", "200K", "--output",
                       $destinationFile . ".%(ext)s", "--format", "mp4");
                my $videoFullPath = $destinationFile . ".mp4";
                my $durationVideo = `/usr/bin/avconv -i "$videoFullPath" 2>&1 | grep -oP "(?<=Duration: ).*(?=\.[0-9][0-9], start.*)"`;
                print "Duration pre  video: " . $durationVideo . "\n";
                $durationVideo =~ s/\R//g;
                $durationVideo =~ s/00:(\d\d:\d\d)/$1/;
                $durationVideo =~ s/0(\d:.*)/$1/;
                print "Duration post video: " . $durationVideo . "\n";
                if ( $? == -1 ) {
                    print "youtube-dl failed: $!\n";
                } else {
                    printf "youtube-dl exited with value %d", $? >> 8;

                    my $tempImageFile = $imageDirectory . $newVideoTitleUnderscore . ".jpg";
                    system("/usr/bin/ffmpegthumbnailer", "-i", "$destinationFile" . ".mp4", "-s", "0", "-t", "10", "-o", $tempImageFile);
                    if ( $? == -1 ) {
                        print "ffmpegthumbnailer failed: $!\n";
                    } else {
                        printf "ffmpegthumbnailer exited with value %d", $? >> 8;
                        my $smallImageFile = $smallImageDirectory . "small-" . $newVideoTitleUnderscore . ".jpg";
                        system("/usr/bin/convert", $tempImageFile, "-resize",  "300x400", "-density", "1x1", "-gravity", "center", "-crop", "300x400+0+0", "+repage", $smallImageFile);
                        if ( $? == -1 ) {
                            print "Convert failed: $!\n";
                        } else {
                            printf "Convert exited with value %d", $? >> 8;
                            # Delete temporary image file
                            print "Delete " . $tempImageFile;
                            unlink($tempImageFile);

                            # Write the latest video url
                            open(my $latestVideoUrlFileOutput, ">", "$latestVideoFile") or
                                die "Can't open file " . $latestVideoFile;
                            print $latestVideoUrlFileOutput "$newVideoUrl";
                            close $latestVideoUrlFileOutput;

                            # If ok write info to json file
                            my $jsonFile = $jsonDirectory . $latestVideoFileTitle . ".json";
                            my $json;
                            {
                                local $/; # Enable 'slurp' mode
                                open(my $fh, "<", $jsonFile);
                                $json = <$fh>;
                                close $fh;
                            }
                            my $data = decode_json($json);
                            my $newData = {
                                title=>"$newVideoTitle",
                                type=>"Video",
                                duration=>$durationVideo,
                                image=>"images/small-" . $newVideoTitleUnderscore . ".jpg",
                                file=>$videoDirectory . $latestVideoFileTitle . "/" . $newVideoTitleUnderscore . ".mp4",
                                videoId=>"playlist/". $latestVideoFileTitle . "/" . $newVideoTitleUnderscore,
                                age=>18,
                                seen=>JSON::false};
                            push @$data, $newData;
                            open my $fh, ">", $jsonFile;
                            print $fh encode_json($data);
                            close $fh;
                        }
                    }
                }
            }
        }
    }
    close $youtubePlaylistsInfo;
    unlink $runningFile;
}

#!/usr/bin/perl

use strict;
use warnings;
use Encode qw(encode decode);
binmode STDOUT, ":utf8";
use utf8;
use JSON;

use File::Basename;
use File::Copy qw(move);

my $numArgs = $#ARGV + 1;
if ($numArgs < 1) {
    print "\nUsage: . " . $0 . " files\n";
    exit;
}

my $filePath;
my $i = 0;

while ($i < $numArgs) {
    $filePath = $ARGV[$i];
    $filePath = decode( 'utf-8', $filePath );
    $i++;
    unless (-e $filePath) {
        print "File " . $filePath . " does not exist\n";
    } else {
        my $fileName = basename($filePath);
        my $extensionFormat = $fileName;
        $extensionFormat =~ s/.*(\.[^\.]*)$/$1/;
        print "extensionFormat: " . $extensionFormat . "\n";
        $fileName =~ s/(.*)\.[^\.]+$/$1/;
        print "fileName: " . $fileName . "\n";
        my $customDirectory = basename(dirname($filePath));
        if ($customDirectory eq "./") {
            $customDirectory = basename(dirname(dirname($filePath)));
        }
        print "customDirectory: " . $customDirectory . "\n";

        my $jsonDirectory = "/home/pi/webVideoSite/app/videos/";
        my $imageDirectory = "/home/pi/webVideoSite/app/images/ToSmall/";
        my $smallImageDirectory = "/home/pi/webVideoSite/app/images/";

        my $videoDirectory = "/media/hdd/Videos/" . $customDirectory . "/";
        my $videoFileTitle = $customDirectory;

        print "videoDirectory: " . $videoDirectory . "\n";
        print "videoFileTitle: " . $videoFileTitle . "\n";

        my $fileNameUnderscore = $fileName;
        $fileNameUnderscore =~ s/ /_/g;
        $fileName =~ s/_/ /g;

        print "fileName: " . $fileName . "\n";
        print "fileNameUnderscore: " . $fileNameUnderscore . "\n";

        # Rename file
        my $oldName = $videoDirectory . $fileName . $extensionFormat;
        my $newName = $videoDirectory . $fileNameUnderscore . $extensionFormat;
        print "Rename " . $oldName . " in " . $newName;
        move($oldName, $newName);

        my $destinationFile = $videoDirectory . $fileNameUnderscore;
        my $destinationFileComplete = $destinationFile . $extensionFormat;
        print "Looking for " . $destinationFileComplete . "\n";
        if (-e $destinationFileComplete) {
            system("/usr/bin/ffmpegthumbnailer", "-i", "$destinationFileComplete", "-s", "0", "-t", "10", "-o", $imageDirectory . $fileNameUnderscore . ".jpg");
            if ( $? == -1 ) {
                print "ffmpegthumbnailer failed: $!\n";
            } else {
                printf "ffmpegthumbnailer exited with value %d", $? >> 8;
                my $tempImageFile = $imageDirectory . $fileNameUnderscore . ".jpg";
                system("/usr/bin/convert", $tempImageFile, "-resize",  "300x400^", "-density", "1x1", "-gravity", "center", "-crop", "300x400+0+0", "+repage", $smallImageDirectory . "small-" . $fileNameUnderscore . ".jpg");
                if ( $? == -1 ) {
                    print "Convert failed: $!\n";
                } else {
                    printf "Convert exited with value %d", $? >> 8;

                    print "Delete " . $tempImageFile . "\n";
                    unlink($tempImageFile);

                    my $durationVideo = `/usr/bin/avconv -i "$destinationFileComplete" 2>&1 | grep -oP "(?<=Duration: ).*(?=\.[0-9][0-9], start.*)"`;
                    print "Duration pre video: " . $durationVideo . "\n";
                    $durationVideo =~ s/\R//g;
                    $durationVideo =~ s/00:(\d\d:\d\d)/$1/;
                    $durationVideo =~ s/0(\d:.*)/$1/;
                    print "Duration post video: " . $durationVideo . "\n";

                    # If ok write info to json file
                    my $jsonFile = $jsonDirectory . $videoFileTitle . ".json";
                    my $json;
                    {
                        local $/; # Enable 'slurp' mode
                        open(my $fh, "<", $jsonFile);
                        $json = <$fh>;
                        close $fh;
                    }
                    my $data = decode_json($json);
                    my $newData = {
                        title=>"$fileName",
                        type=>"Video",
                        duration=>$durationVideo,
                        image=>"images/small-" . $fileNameUnderscore . ".jpg",
                        file=>$videoDirectory . $fileNameUnderscore . $extensionFormat,
                        videoId=>"playlist/". $videoFileTitle . "/" . $fileNameUnderscore,
                        age=>18,
                        seen=>JSON::false};
                    push @$data, $newData;
                    open my $fh, ">", $jsonFile;
                    print $fh encode_json($data);
                    close $fh;
                }
            }
        } else {
            print "Did not find " . $destinationFile . $extensionFormat . "\n";
        }
    }
}

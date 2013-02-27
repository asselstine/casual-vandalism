// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require_tree .

var i = 0;
$(document).ready(function () {
    $(".nav-collapse").click(function() {
       $(this).collapse('hide');
    });
    $(document).bind("dblclick", function (e) {
        e.preventDefault();
    });
    $(".overlay").hide();
    Hammer($(".overlay")[0]).on("tap touch release", function (e) {
        e.stopPropagation();
    });
    Hammer($("#help-dialog")[0]).on("tap touch release", function (e) {
        $("#help-dialog").fadeOut();
        $(".overlay").fadeOut();
        e.stopPropagation();
    });
    $("#help-dialog").hide();
});

//A hash of [message] => true | false which represents which help the user has seen
var helpWhichHasBeenSeen = {};

function help(msg) {
    if (!helpWhichHasBeenSeen[msg]) {
        info(msg);
        helpWhichHasBeenSeen[msg] = true;
    }
}

function info(msg) {
    $("#help-dialog").html(msg);
    $(".overlay").fadeIn();
    $("#help-dialog").show();
}

function lock(msg) {
    $("#locked-dialog").html(msg);
    $(".overlay").fadeIn();
    $("#locked-dialog").show();
}

function unlock() {
    $(".overlay").fadeOut();
    $("#locked-dialog").fadeOut();
}

function bodyLog(msg) {
    $("body").prepend( "<p>" + msg + "</p>");
}


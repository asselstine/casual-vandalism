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
    $(window).scroll(function() {
        if (window.matchMedia("(min-device-width: 320px) and (max-device-width: 480px)").matches) {
            doUpdateFonts();
        }
    });
    $(window).resize(function () {
       if (window.matchMedia("(min-device-width: 320px) and (max-device-width: 480px)").matches) {
           doUpdateFonts();
       }
    });
    $(".nav-collapse").click(function() {
       $(this).collapse('hide');
    });
});

function doUpdateFonts() {
    window.setTimeout(updateFonts, 200);
}

function updateFonts() {
    try {
        var fontSize = window.innerWidth / 16;
        var newTop = $(window).scrollTop() + "px";
        var newLeft = $(document).scrollLeft() + "px";
        $(".controls a").css("font-size", fontSize + "px");
        $(".controls").css("position", "absolute");
        //bodyLog("top: " + newTop + ", " + newLeft);
        $(".controls").css("top", newTop);
        $(".controls").css("left", newLeft);
    } catch (e) {
        alert(e.message);
    }
    /*

    $(".controls").css("top", newTop);
    */
}

function bodyLog(msg) {
    $("body").prepend( "<p>" + msg + "</p>");
}


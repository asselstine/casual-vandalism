$(document).ready(function () {
    init_canvas();
    $('canvas').hide();
    $('canvas').attr("width", "200");
    $('canvas').attr("height", "200");
    $('.canvas_ghost').hide();
    $("#cancel").click(function (){
        switch_to_browse_mode();
    });
    $("#select_draw").click(function (e) {
        normalizeEvent(e);

        if ($(document).width() > 420) {
            $('canvas').hide();
            $(".canvas_ghost").show();
            move_ghost(e.pageY, e.pageX);

            //add the ghost follow
            $(document).bind("mousemove.select", function (e) {
                move_ghost(e.pageY, e.pageX);
            });

            //make sure ghost clears when the user clicks
            $(document).bind("mousedown.select", function (e) {
                //remove ghost listeners
                $(document).unbind(".select");
                //hide the ghost
                $(".canvas_ghost").hide();

                switch_to_edit_mode(e.pageY, e.pageX);
            });
        } else {
            switch_to_mobile_edit_mode();
        }
    });
});

function move_ghost(top, left) {
    $('.canvas_ghost').css("top", top);
    $('.canvas_ghost').css("left", left);
}

function switch_to_mobile_edit_mode() {
    switch_to_edit_mode($(window).scrollTop(), $(window).scrollLeft());
}

function switch_to_edit_mode(top, left) {
    move_canvas(top, left);
    clear_canvas();
    $("canvas").show();
    $(".browse_mode").hide();
    $(".edit_mode").show();
}

function switch_to_browse_mode() {
    $(".browse_mode").show();
    $(".edit_mode").hide();
    clear_canvas();
    $('canvas').hide();
}

function move_canvas(top, left) {
    $('canvas').css("top", top);
    $('canvas').css("left", left);
}

color = "#df4b26";
size = 4;

context = null;
paint = false;

clickX = new Array();
clickY = new Array();
clickDrag = new Array();
currentColor = new Array();
currentSize = new Array();

function clear_canvas() {
    clickX = new Array();
    clickY = new Array();
    clickDrag = new Array();
    currentColor = new Array();
    currentSize = new Array();
    redraw();
}

function init_canvas() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext("2d");
    bind_events();
}

function bind_events() {
    $('#canvas').bind("touchstart", function(e) {
        e.preventDefault();
        normalizeEvent(e, false);
        start(e);
    });
    $('#canvas').bind("touchmove", function (e) {
        e.preventDefault();
        normalizeEvent(e, true);
        move(e);
    });
    $('#canvas').bind("touchend", stop);
    $('#canvas').bind("touchcancel", stop);
    $("#upload").click(upload);
    $('#canvas').mousemove(move);
    $('#canvas').mousedown(start);
    $('#canvas').mouseup(stop);
    $('#canvas').mouseleave(stop);
}



function addCanvasClick(e, isDragging) {
    var offset = $("#canvas").offset();
    addClick(e.pageX - offset.left, e.pageY - offset.top, isDragging);
}

function start(e) {
    paint = true;
    addCanvasClick(e, false);
    redraw();
}

function move(e) {
    if (paint) {
        addCanvasClick(e, true);
        redraw();
    }
}

function stop(e) {
    paint = false;
   // alert("collected number of events: [" + clickX.length+"]");
}

function addClick(x, y, isDragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(isDragging);
    currentColor.push(color);
    currentSize.push(size);

}

function redraw() {
    canvas.width = canvas.width;
    context.lineJoin = "round";
    for (var i = 0; i < clickX.length; i++) {
        context.beginPath();
        if (clickDrag[i] && i) {
            context.moveTo(clickX[i-1], clickY[i-1]);
        } else {
            context.moveTo(clickX[i]-1, clickY[i]-1);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.strokeStyle = currentColor[i];
        context.lineWidth = currentSize[i];
        context.stroke();
    }
}


function getImageBlob() {
    var dataUrl = canvas.toDataURL();
    var binary = atob(dataUrl.split(',')[1]);
   /*
    var array = [];
    for (var i= 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    */


    var ab = new ArrayBuffer(binary.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < binary.length; i++) {
        ia[i] = binary.charCodeAt(i);
    }
    return new Blob([ab], {type: 'image/png'});
}

function upload() {
    var fd = new FormData();
    fd.append("image[x]", $("#canvas").css("left"));
    fd.append("image[y]", $("#canvas").css("top"));
    fd.append("image[canvas]", getImageBlob());
    $.ajax({
        url: "/images.json",
        type: "POST",
        dataType: "json",
        data: fd,
        success: function () {
            window.location.href = "/";
        },
        error: function () {

        },
        processData: false,  // tell jQuery not to process the data
        contentType: false   // tell jQuery not to set contentType
    });
}

function normalizeEvent(e, isDragging) {
    var props = ['clientX', 'clientY', 'pageX', 'pageY'],
        i, l, n;

    if (['touchstart', 'touchmove', 'touchend'].indexOf(e.type) > -1) {
        for (i = 0, l = props.length; i < l; i++) {
            n = props[i];
            e[n] = e.originalEvent.targetTouches[0][n];
        }
    }
    //$("body").append('<p>' + event.pageX + ", " + event.pageY + " & " + isDragging + '</p>');
    return e;
}

/*

 On phones: zoom in

 */
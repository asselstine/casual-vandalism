$(document).ready(function () {
    init_canvas();
    $('canvas').hide();
    $('canvas').attr("width", "200");
    $('canvas').attr("height", "200");
    $('.canvas_ghost').hide();

    $("#select_draw").click(function (e) {
        normalizeEvent(e);

        $('canvas').hide();
        $(".canvas_ghost").show();
        $('.canvas_ghost').css("top", e.pageY);
        $('.canvas_ghost').css("left", e.pageX);
        $(document).bind("mousemove.select", function (e) {
            $('.canvas_ghost').css("top", e.pageY);
            $('.canvas_ghost').css("left", e.pageX);
        });
        $(document).bind("mousedown.select", function (e) {
            $('canvas').css("top", e.pageY);
            $('canvas').css("left", e.pageX);
            $(document).unbind(".select");
            $(".canvas_ghost").hide();
            clear_canvas();
            $("canvas").show();
        });

    });
});

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
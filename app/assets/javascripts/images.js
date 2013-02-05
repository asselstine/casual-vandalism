//Where the 'draw' canvas select starts
var selectStartX;
var selectStartY;
var selectEndX;
var selectEndY;

function is_touch_device() {
    return !!('ontouchstart' in window) // works on most browsers
        || !!('onmsgesturechange' in window); // works on ie10
}

function select_start(e) {
    selectStartX = e.pageX;
    selectStartY = e.pageY;
    //show ghost, and resize it
    set_ghost(e.pageY, e.pageX, "1px", "1px");
    $(".canvas_ghost").show();
}

function select_move(e) {
    selectEndX = e.pageX;
    selectEndY = e.pageY;
    var newWidth = selectEndX - selectStartX;
    var newHeight = selectEndY - selectStartY;
    $(".canvas_ghost")  .css("width",newWidth+"px")
        .css("height", newHeight+"px");
}

function select_end() {
    $("canvas").css("top", $(".canvas_ghost").css("top") )
        .css("left", $(".canvas_ghost").css("left"))
        .css("width", $(".canvas_ghost").css("width"))
        .css("height", $(".canvas_ghost").css("height"));
    $("canvas")[0].width = $(".canvas_ghost").width();
    $("canvas")[0].height = $(".canvas_ghost").height();
    //e.pageY, e.pageX
    switch_to_edit_mode();
    $(document).unbind(".select");
    $("body").unbind(".select");
    $(".canvas_ghost").hide();
}

function move_ghost(top, left) {
    $('.canvas_ghost').css("top", top);
    $('.canvas_ghost').css("left", left);
}

function set_ghost(top, left, width, height) {
    $('.canvas_ghost')  .css("top", top)
                        .css("left", left)
        .css("width",width)
        .css("height", height);
}

function switch_to_edit_mode() {
    $(document).unbind(".select");
    clear_canvas();
    $("canvas").show();
    $(".select_mode").hide();
    $(".browse_mode").hide();
    $(".edit_mode").show();
}

function switch_to_browse_mode() {
    $(document).unbind(".select");
    $(".canvas_ghost").hide();
    $(".edit_mode").hide();
    $(".select_mode").hide();
    $('canvas').hide();
    clear_canvas();
    $(".browse_mode").show();
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
    $('canvas').hide();
    $('canvas').attr("width", "200");
    $('canvas').attr("height", "200");
    $('.canvas_ghost').hide();
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
   // $('#canvas').mouseleave(stop);
    $("#cancel").click(function (){
        switch_to_browse_mode();
    });
    $("#clear").click(function () {
        clear_canvas();
    });
    $(".cancel_select").click(function () {
        switch_to_browse_mode();
    });
    $("#select_draw").click(function (e) {
        $(".browse_mode").hide();
        $(".select_mode").show();
        if (!is_touch_device()) {
            $(document).bind("mousedown.select", select_start);
            $(document).bind("mousemove.select", select_move);
            $(document).bind("mouseup.select", select_end);
        } else {
            $("body").bind("touchstart.select", function (e) {
                e.preventDefault();
                normalizeEvent(e);
                select_start(e);
            });
            $("body").bind("touchmove.select", function (e) {
                normalizeEvent(e);
                select_move(e);
            });
            $("body").bind("touchend.select", select_end);
            $("body").bind("touchcancel.select", select_end);
        }
    });
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
    //alert("collected number of events: [" + clickX.length+"]");
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

    var poffset = $("#canvas").parent().offset();
    var top = $("#canvas").offset().top - poffset.top;
    var left = $("#canvas").offset().left - poffset.left;

    fd.append("image[x]", left);
    fd.append("image[y]", top);
    fd.append("image[canvas]", getImageBlob());
    $.ajax({
        url: document.URL + "/images.json",
        type: "POST",
        dataType: "json",
        data: fd,
        success: function (data, status) {
            $(".background").attr("src", data.background_url); //append("<img style='z-index: -1; position: absolute; top: " + data.image.y + "px; left: " + data.image.x + "px;' src='"+data.image_url+"'/>");
        },
        complete : function () {
            switch_to_browse_mode();
        },
        processData: false,  // tell jQuery not to process the data
        contentType: false   // tell jQuery not to set contentType
    });
}

function normalizeEvent(e, isDragging) {
    var props = ['clientX', 'clientY', 'pageX', 'pageY'],
        i, l, n;

    if (['touchstart', 'touchmove', 'touchend', 'touchcancel'].indexOf(e.type) > -1) {
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
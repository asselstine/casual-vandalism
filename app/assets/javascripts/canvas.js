var context;
var paint;


var SMALL_SIZE = 2;
var MEDIUM_SIZE = 8;
var LARGE_SIZE = 24;

var colors = [
    "#ff1517",
    "#150fff",
    "#fafffb",
    "#000000",
    "#01e411",
    "#a37d04"
];

var color = "#df4b26";
var size = SMALL_SIZE;

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var currentColor = new Array();
var currentSize = new Array();

function switch_to_edit_mode() {
    bind_draw_events();
    unbind_nav_events();
    $(".btn-select-size").addClass("active");
    $("#nav").removeClass("active");
}

function switch_to_nav_mode() {
    unbind_draw_events();
    bind_nav_events();
    $(".btn-select-size").removeClass("active");
    $(".btn-colorwheel").removeClass("active");
    $("#nav").addClass("active");
}

function setActivePencilMode(elem) {
    switch_to_edit_mode();
    $(".select-size li.active").removeClass("active");
    $(elem).parent().addClass("active");
    $(".btn-select-size").addClass("active");
}

function init_colors() {
    $("#color1").addClass("active");
    color = $("#color1").css("background-color");
    $(".select-color a").click(function () {
        color = $(this).css("background-color");
        switch_to_edit_mode();
    });
}

function init_canvas() {
    context = canvas[0].getContext("2d");
    paint = false;

    init_colors();

    $("#undo").click(undo);
    $("#edit").click(switch_to_edit_mode);
    $("#nav").click(function (e) {
        if ($(this).hasClass("active")) {
            unbind_nav_events();
            $(this).removeClass("active");
            $(this).blur();
        } else {
            switch_to_nav_mode();
        }
    });
    $("#upload").click(function () {
        upload();
    });
    $("#small").click(function () {
        size = SMALL_SIZE;
        setActivePencilMode(this);
    });
    $("#medium").click(function () {
        size = MEDIUM_SIZE;
        setActivePencilMode(this);
    });
    $("#large").click(function () {
        size = LARGE_SIZE;
        setActivePencilMode(this);
    });
    $("#color1").click(function () {
        color = $(this).css("background-color");
    });
}

function unbind_draw_events() {
    Hammer(canvas[0]).off("touch drag release", canvas_event_handler);
    canvas.unbind(".draw");
}

function bind_draw_events() {
    Hammer(canvas[0]).on( "touch drag release", canvas_event_handler);
    canvas.bind("touchstart.draw", function (e) {
        e.preventDefault();
    });
    canvas.bind("touchmove.draw", function (e) {
        e.preventDefault();
    });
}

function canvas_event_handler(e) {
    switch (e.type) {
        case "touch":
            start(e);
            e.preventDefault();
            e.stopPropagation();
            break;
        case "drag":
            move(e);
            e.stopPropagation();
            e.preventDefault();
            break;
        case "release":
            stop(e);
            e.stopPropagation();
            break;
        default:
            break;
    }
}

function addCanvasClick(e, isDragging) {
    var coords = pageToCanvasCoords(e.gesture.center.pageX, e.gesture.center.pageY);
    addClick(coords.x, coords.y, isDragging);
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
}

function addClick(x, y, isDragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(isDragging);
    currentColor.push(color);
    currentSize.push(size);
}

function undo() {
    if (clickX.length == 0) {
        return;
    }
    for (var i = clickX.length - 1; i >= 0; i--) {
        clickX.pop();
        clickY.pop();
        var drag = clickDrag.pop();
        currentColor.pop();
        currentSize.pop();
        if (!drag) {
             //then this is the last and we should return
            break;
        }
    }
    redraw();
}

function redraw() {
    context.clearRect ( 0, 0, imageWidth, imageHeight );

    for (var i = 0; i < clickX.length; i++) {

        //This block handles begins
        if (i == 0) { //if first path
            context.beginPath();
            context.moveTo(clickX[i]-1, clickY[i]-1);
            context.lineTo(clickX[i], clickY[i]);
        } else if (!clickDrag[i]) { //if new path
            context.beginPath();
            context.moveTo(clickX[i], clickY[i]);
        } else { //we are continuing
            context.lineTo(clickX[i], clickY[i]);
        }

        if (i == (clickX.length-1) || !clickDrag[i+1]) { //if this is the last segment of the path
            context.lineJoin = "round";
            context.strokeStyle = currentColor[i];
            context.lineWidth = currentSize[i];
            context.stroke();
        }
    }
}

function getImageBlob() {
    var dataUrl = canvas[0].toDataURL();
    var binary = atob(dataUrl.split(',')[1]);
    var ab = new ArrayBuffer(binary.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < binary.length; i++) {
        ia[i] = binary.charCodeAt(i);
    }
    return new Blob([ab], {type: 'image/png'});
}

function upload() {
    var fd = new FormData();
    fd.append("image[x]", 0);
    fd.append("image[y]", 0);
    fd.append("image[canvas]", getImageBlob());
    $(".upload-alert").alert();
    $.ajax({
        url: $("#wall_images_path").html() + ".json",
        type: "POST",
        dataType: "json",
        data: fd,
        success: function (data, status) {
            $("#background").attr("src", data.background_url); //append("<img style='z-index: -1; position: absolute; top: " + data.image.y + "px; left: " + data.image.x + "px;' src='"+data.image_url+"'/>");
        },
        complete : function () {
            $(".upload-alert").alert('close');
        },
        processData: false,  // tell jQuery not to process the data
        contentType: false   // tell jQuery not to set contentType
    });
}

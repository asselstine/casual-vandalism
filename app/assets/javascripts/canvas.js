var context;
var paint;

Array.prototype.peek = function() {
    return this[this.length-1];
};

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
var size = MEDIUM_SIZE;

var clickHistory = new Array();

function pushHistory(x, y, isDragging) {
    var recall = {
        clickX: x,
        clickY: y,
        clickDrag: isDragging,
        currentColor: color,
        currentSize: size
    };
    clickHistory.push(recall);
}

function switch_to_edit_mode() {
    disable_nav_mode();
    disable_zoom_mode();
    disable_color_wheel();
    bind_draw_events();
    $(".btn-select-size").removeClass("active");
    $(".draw-mode").addClass("active");
    help("You can draw on the canvas by dragging.  Try changing the size or color using the provided menus.");
}

function disable_edit_mode() {
    $(".draw-mode").removeClass("active");
    unbind_draw_events();
}

function disable_nav_mode() {
    unbind_nav_events();
    $("#nav").removeClass("active");
}

function disable_color_wheel() {
    $(".btn-colorwheel").removeClass("active");
}

function switch_to_nav_mode() {
    disable_edit_mode();
    disable_color_wheel();
    disable_zoom_mode();
    unbind_zoom_events();
    bind_nav_events();
    $("#nav").addClass("active");
    help("Drag the image around.  Tap to zoom, and double tap to zoom out.  On iPhone and Android 3+ you can pinch to zoom.");
}

function disable_zoom_mode() {
    unbind_zoom_events();
    $("#zoom").removeClass("active");
}

function switch_to_zoom_mode() {
    disable_edit_mode();
    disable_nav_mode();
    bind_zoom_events();
    $("#zoom").addClass("active");
}

function setActivePencilMode(elem) {
    switch_to_edit_mode();
    $(".select-size li.active").removeClass("active");
    $(elem).parent().addClass("active");
}

function init_colors() {
    $(".select-color a").click(function () {
        color = $(this).css("background-color");
        $(".icon-colorwheel").css("background-color", color);
        switch_to_edit_mode();
    });
    $(".select-color a").each(function () {
       $(this).trigger("click");
       return false;
    });
}

function init_canvas() {
    context = canvas[0].getContext("2d");
    paint = false;

    init_colors();
    Hammer($(".draw-mode")[0]).on("tap", function (e) {
        switch_to_edit_mode();
    });
    Hammer($("#nav")[0]).on("tap", function (e) {
        if ($(this).hasClass("active")) {
            unbind_nav_events();
            $(this).removeClass("active");
            $(this).blur();
        } else {
            switch_to_nav_mode();
        }
    });
    $(".undo").click(undo);
    $(".redo").click(redo);
    $(".upload").click(function () {
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
}



function bind_zoom_events() {
    Hammer(canvas[0]).on("tap", zoomIn);
}

function unbind_zoom_events() {
    Hammer(canvas[0]).off("tap", zoomIn);
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
            redoHistory = new Array();
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
    var coords = pageToCanvasCoords$(e.gesture.center.pageX, e.gesture.center.pageY);
    //console.debug("Draw at " + coords.x + ", " + coords.y);
    addClick(coords.x, coords.y, isDragging);
}

var containerOffsetLeft;
var containerOffsetTop;
function start(e) {
    containerOffsetLeft = container.offset().left;
    containerOffsetTop = container.offset().top;
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
    lastRedraw = 0;
    redraw();
}

function addClick(x, y, isDragging) {
    pushHistory(x,y,isDragging,color,size);
}

/*
Array of objects like so:

{
    clickX: <int>,
    clickY: <int>,
    clickDrag: <bool>,
    currentColor: <string>,
    currentSize: <int>
}

 */
var redoHistory = new Array();

function undo() {
    if (clickHistory.length == 0) {
        return;
    }
    for (var i = clickHistory.length - 1; i >= 0; i--) {
        redoHistory.push(clickHistory.pop());
        if (!redoHistory.peek().clickDrag) {
             //then we're not dragging and this is the first.
            break;
        }
    }
    redraw();
}

function redo() {
    if (redoHistory.length > 0) {
        clickHistory.push(redoHistory.pop()); //last will be clickDrag
        while (redoHistory.length > 0 && redoHistory.peek().clickDrag) {
            clickHistory.push(redoHistory.pop());
        }
    }
    redraw();
}
var date = new Date();
var lastRedraw = 0;
function redraw() {
    var now = new Date().getTime();
    if (now - lastRedraw < 50) {
        return;
    }
    lastRedraw = now;
    context.clearRect ( 0, 0, imageWidth, imageHeight );

    for (var i = 0; i < clickHistory.length; i++) {
        var recall = clickHistory[i];
        //This block handles begins
        if (i == 0) { //if first path
            context.beginPath();
            context.moveTo(recall.clickX-1, recall.clickY-1);
            context.lineTo(recall.clickX, recall.clickY);
        } else if (!recall.clickDrag) { //if new path
            context.beginPath();
            context.moveTo(recall.clickX, recall.clickY);
        } else { //we are continuing
            context.lineTo(recall.clickX, recall.clickY);
        }

        if (i == (clickHistory.length-1) || !clickHistory[i+1].clickDrag) { //if this is the last segment of the path
            context.lineJoin = "round";
            context.strokeStyle = recall.currentColor;
            context.lineWidth = recall.currentSize;
            context.stroke();
        }
    }
}

function upload() {

    var params = {
        "image[x]" : 0,
        "image[y]" : 0,
        "w" : imageWidth,
        "h" : imageHeight,
        "draw_list" : encodeDrawList()
    };

    if (params["draw_list"] == "") {
        info("Nothing has been drawn!");
        return;
    }

    lock("Please wait.  Uploading drawing...");

    $.ajax({
        url: $("#wall_images_path").html() + ".json",
        type: "POST",
        dataType: "json",
        data: params,
        success: function (data, status) {
            $("#background").attr("src", data.background_url); //append("<img style='z-index: -1; position: absolute; top: " + data.image.y + "px; left: " + data.image.x + "px;' src='"+data.image_url+"'/>");
            clickHistory = new Array();
            redraw();
        },
        complete : function () {
            unlock();
        },
        processData: true  // tell jQuery not to process the data
        //contentType: false   // tell jQuery not to set contentType
    });
}

function encodeDrawList() {
    var cmd, draw;
    var drawList = []
    var sep = "&";
    for (var i = 0; i < clickHistory.length; i++) {
        draw = clickHistory[i];
        cmd = Math.round(draw.clickX) + sep +
              Math.round(draw.clickY) + sep +
              draw.clickDrag + sep +
              draw.currentColor + sep +
              draw.currentSize;
        drawList.push(cmd);
    }
    return drawList;
}
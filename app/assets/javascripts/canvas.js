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
var size = SMALL_SIZE;

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
        console.debug("draw hit");
        switch_to_edit_mode();
    });
    Hammer($("#nav")[0]).on("tap", function (e) {
        console.debug("nav hit");
        if ($(this).hasClass("active")) {
            console.debug("disabling nav");
            unbind_nav_events();
            $(this).removeClass("active");
            $(this).blur();
        } else {
            switch_to_nav_mode();
        }
    });
    $(".undo").click(undo);
    $(".redo").click(redo);
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

function redraw() {
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
            clickHistory = new Array();
            redraw();
        },
        processData: false,  // tell jQuery not to process the data
        contentType: false   // tell jQuery not to set contentType
    });
}

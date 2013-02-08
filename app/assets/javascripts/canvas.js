var context;
var paint;

var color = "#df4b26";
var size = 4;

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var currentColor = new Array();
var currentSize = new Array();

function init_canvas() {
    context = canvas[0].getContext("2d");
    paint = false;
    $("#edit").click(function (e) {
        bind_draw_events();
    });
    $("#nav").click(function (e) {
        unbind_draw_events();
    });
}

function unbind_draw_events() {
    Hammer(canvas[0]).off("touch drag release", canvas_event_handler);

}

function bind_draw_events() {
    Hammer(canvas[0]).on( "touch drag release", canvas_event_handler);
    canvas.bind("touchstart", function (e) {
        e.preventDefault();
    });
}

function canvas_event_handler(e) {
    switch (e.type) {
        case "touch":
            start(e);
            e.stopPropagation();
            break;
        case "drag":
            move(e);
            e.stopPropagation();
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
    $.ajax({
        url: document.URL + "/images.json",
        type: "POST",
        dataType: "json",
        data: fd,
        success: function (data, status) {
            $("#background").attr("src", data.background_url); //append("<img style='z-index: -1; position: absolute; top: " + data.image.y + "px; left: " + data.image.x + "px;' src='"+data.image_url+"'/>");
        },
        complete : function () {
            switch_to_browse_mode();
        },
        processData: false,  // tell jQuery not to process the data
        contentType: false   // tell jQuery not to set contentType
    });
}

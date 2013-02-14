//File which contains the interface for navigation

var ctms = [];
var touchX, touchY;
var firstTransformTouchX, firstTransformTouchY = 0;
var lastTransformTouchX, lastTransformTouchY = 0;

var imageWidth, imageHeight;
var containerWidth, containerHeight;
var scaleStep = 1.9;
var lastGestureScale = 1;
var container;
var image;
var canvas;

function updateDy(e) {
    var dy = e.gesture.center.pageY - touchY;
    touchY = e.gesture.center.pageY;
    return dy;
}

function updateDx(e) {
    var dx = e.gesture.center.pageX - touchX;
    touchX = e.gesture.center.pageX;
    return dx;
}

function zoomIn(e) {
    zoomPage(e.gesture.center.pageX, e.gesture.center.pageY, scaleStep);
}

function zoomPage(pageX, pageY, scaleVal) {
    var centerX = pageX - getContainerOffsetLeft();
    var centerY = pageY - getContainerOffsetTop();
    zoom(centerX, centerY, scaleVal);
}

function zoom(centerX, centerY, scaleVal) {
    translate(-centerX,-centerY);
    scale(scaleVal);
    translate(centerX,centerY);
    updateTransform();
}

function getContainerOffset() {
    return container.offset();
}

function getContainerOffsetLeft() {
    return container.offset().left;
}

function getContainerOffsetTop() {
    return container.offset().top;
}

function init_container() {
    $("#background").css("max-width", "none !important");
    image = $("#background");
    container = $("#canvas_container");
    canvas = $("#canvas");

    setTransformOrigin(canvas[0]);
    setTransformOrigin(image[0]);

    image.bind("load", function () {
        clearTransform();
        imageWidth = this.width;
        imageHeight = this.height;
        canvas[0].width = this.width;
        canvas[0].height = this.height;
        resizeImageToWindow();
        container.css("width", "100%");
        container.css("height", this.height+"px");
    });
    var wrapOffset = container.offset();
    containerWidth = container.width();
    containerHeight = container.height();

    ctms.push( Matrix.I(3) );
}

function resizeImageToWindow() {
    clearTransform();
    if ($(document).width() < imageWidth) {
        scale( $(document).width() / imageWidth );
        updateTransform();
    }
}

function unbind_nav_events() {
    Hammer( container[0] ).off("drag touch release transform", handle_nav_event);
    container.unbind(".nav");
}

function bind_nav_events() {
    Hammer( container[0], {
        transform_always_block: true,
        drag_block_horizontal: true,
        drag_block_vertical: true,
        drag_min_distance: 0}).on("drag touch release transform", handle_nav_event);
    container.bind("touchstart.nav", function (e) {
        e.preventDefault();
    });
    container.bind("touchmove.nav", function (e) {
        e.preventDefault();
    });
}

function handle_nav_event(e) {
    switch(e.type) {
        case "touch":
            touchX = e.gesture.center.pageX;
            touchY = e.gesture.center.pageY;
            lastGestureScale = 1;
            break;
        case "drag":
            //translate
            var dx = updateDx(e);
            var dy = updateDy(e);
            translate(dx, dy);
            updateTransform();
            break;
        case "transform":
            pushContext();
            if (firstTransformTouchY != 0) {
                translate(lastTransformTouchX - firstTransformTouchX, lastTransformTouchY - firstTransformTouchY);
            } else {
                firstTransformTouchX = e.gesture.center.pageX;
                firstTransformTouchY = e.gesture.center.pageY;
            }
            zoomPage(e.gesture.center.pageX, e.gesture.center.pageY, e.gesture.scale);
            lastGestureScale = e.gesture.scale;
            lastTransformTouchX = e.gesture.center.pageX;
            lastTransformTouchY = e.gesture.center.pageY;
            popContext();
            break;
        case "release":
            if (firstTransformTouchX != 0) {
                translate(lastTransformTouchX - firstTransformTouchX, lastTransformTouchY - firstTransformTouchY);
            }
            if (lastGestureScale != 1) {
                zoomPage(lastTransformTouchX, lastTransformTouchY, lastGestureScale);
            }
            updateTransform();
            firstTransformTouchX = 0;
            firstTransformTouchY = 0;
            break;
        default:
            break;
    }

    return true;
}

function clearTransform() {
    ctms = new Array();
    ctms.push( Matrix.I(3) );
    updateTransform();
}

function updateTransform() {
    var mat = peekContext();
    //console.debug("updateTransform: " + formatTransform(mat));
    setTransform(image[0], mat);
    setTransform(canvas[0], mat);
}

function setTransformOrigin(elem) {
    var origin = "0px 0px";
    elem.style['transformOrigin'] = origin;
    elem.style['WebkitTransformOrigin'] = origin;
    elem.style['msTransformOrigin'] = origin;
    elem.style['MozTransformOrigin'] = origin;
    elem.style['OTransformOrigin'] = origin;
}

function setTransform(elem, ctm) {
    var px = formatTransform(ctm);
    var noPx = formatTransformNoPx(ctm);
    elem.style['transform'] = px;
    elem.style['WebkitTransform'] = noPx;
    elem.style['msTransform'] = px;
    elem.style['MozTransform'] = px;
    elem.style['OTransform'] = px;
}

function translate(dx, dy) {
    var tm = Matrix.create([
        [1, 0, dx],
        [0, 1, dy],
        [0, 0, 1 ]
    ]);
    //  console.debug("translate: " + tm.inspect());
    pushContext( tm.multiply(popContext()));
}

function scale(s) {
    //   console.debug("scaling with " + s);
    var sm = Matrix.create([
        [s, 0, 0],
        [0, s, 0],
        [0, 0, 1]
    ]);
    pushContext( sm.multiply(popContext()));
}

function pushContext(context) {
    if (!context) {
        context = peekContext().dup();
    }
    ctms.push(context);
}

function popContext() {
    return ctms.pop();
}

function peekContext() {
    var elem = ctms.pop();
    ctms.push( elem );
    return elem;
}

function formatTransformNoPx(ctm) {
    var dx = ctm.row(1).elements[2];
    var dy = ctm.row(2).elements[2];
    var scale = ctm.row(1).elements[0];
    return "matrix("+  scale + ", 0, 0, " + scale + ", " + dx + ", " + dy + ")";
}

function formatTransform(ctm) {
    var dx = ctm.row(1).elements[2];
    var dy = ctm.row(2).elements[2];
    var scale = ctm.row(1).elements[0];
    return "matrix("+  scale + ", 0, 0, " + scale + ", " + dx + "px, " + dy + "px)";
}

function pageToCanvasCoords(pageX, pageY) {
    var x = pageX - getContainerOffsetLeft();
    var y = pageY - getContainerOffsetTop();
    var vec = peekContext().inv().multiply( Vector.create([x,y,1]) );
    return { x: vec.elements[0], y: vec.elements[1] };
}
//File which contains the interface for navigation

var ctms = [];
var touchX, touchY;

var containerWidth, containerHeight;
var scaleStep = 1.5;
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

function zoomIn() {
    zoom(containerWidth / 2, containerHeight / 2, scaleStep);
}

function zoomOut() {
    zoom(containerWidth / 2, containerHeight / 2, 1 / scaleStep);
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
    image = $("#background");
    container = $("#canvas_container");
    canvas = $("#canvas");

    image.load(function () {
        canvas[0].width = this.width;
        canvas[0].height = this.height;
    });
    var wrapOffset = container.offset();
    containerWidth = container.width();
    containerHeight = container.height();

    ctms.push( Matrix.I(3) );

    container.bind("mousedown", function (e) {
        //click drag
        e.preventDefault();
    });

    $("#zoom-plus").bind("click", function (e) {
        zoomIn();
    });

    $("#zoom-minus").bind("click", function (e) {
        zoomOut();
    });

    Hammer( container[0], {
        transform_always_block: true,
        drag_block_horizontal: true,
        drag_block_vertical: true,
        drag_min_distance: 0}).on("drag touch release transform", function (e) {

            switch(e.type) {

                case "touch":
                    touchX = e.gesture.center.pageX;
                    touchY = e.gesture.center.pageY;
                    lastGestureScale = 1;
                    e.preventDefault();

                    break;
                case "drag":
                    e.preventDefault();

                    //translate
                    var dx = updateDx(e);
                    var dy = updateDy(e);
                    translate(dx, dy);
                    updateTransform();
                    break;
                case "transform":
                    pushContext();
                    zoomPage(e.gesture.center.pageX, e.gesture.center.pageY, e.gesture.scale);
                    lastGestureScale = e.gesture.scale;
                    touchX = e.gesture.center.pageX;
                    touchY = e.gesture.center.pageY;
                    popContext();
                    break;
                case "release":
                    if (lastGestureScale != 1) {
                        zoomPage(touchX, touchY, lastGestureScale);
                        updateTransform();
                    }
                    break;
                default:
                    break;
            }

            return true;
        });
}

function updateTransform() {
    setTransform(image[0], getTransform());
    setTransform(canvas[0], getTransform());
}

function setTransform(elem, transform) {
    $(elem).css("-webkit-transform-origin", "0% 0%");
    elem.style.transform = transform;
    elem.style.oTransform = transform;
    elem.style.msTransform = transform;
    elem.style.mozTransform = transform;
    elem.style.webkitTransform = transform;
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

function getTransform() {
    var ctm = peekContext();
    var dx = ctm.row(1).elements[2];
    var dy = ctm.row(2).elements[2];
    var scale = ctm.row(1).elements[0];
    return "matrix("+  scale + ", 0, 0, " + scale + ", " + dx + ", " + dy + ")";
}

function pageToCanvasCoords(pageX, pageY) {
    var x = pageX - getContainerOffsetLeft();
    var y = pageY - getContainerOffsetTop();
    var vec = peekContext().inv().multiply( Vector.create([x,y,1]) );
    return { x: vec.elements[0], y: vec.elements[1] };
}
var fieldCanvas = document.getElementById('fieldTask'), ctx = fieldCanvas.getContext('2d'), rect = fieldCanvas.getBoundingClientRect();
var attributeName = "data-check";
var coords = [];
var isClearing = false;
fieldCanvas.width = window.innerWidth / 2;
fieldCanvas.height = window.innerHeight / 2;
ctx.strokeStyle = 'black';
ctx.lineWidth = 1;
var isIncludes = function (start, end, number) {
    var min = Math.min.apply(Math, [start, end]), max = Math.max.apply(Math, [start, end]);
    return number > min && number < max;
};
var drawRedDot = function (x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2, true);
    ctx.lineWidth = 1;
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
};
var markIntersection = function (allCoords, cordsToCheck) {
    if (cordsToCheck === void 0) { cordsToCheck = allCoords; }
    for (var j = 0; j < cordsToCheck.length - 1; j += 2) {
        var _a = [cordsToCheck[j], cordsToCheck[j + 1]], _b = _a[0], x1 = _b[0], y1 = _b[1], _c = _a[1], x2 = _c[0], y2 = _c[1];
        for (var i = cordsToCheck === allCoords ? j + 2 : 0; i < allCoords.length - 1; i += 2) {
            var _d = [allCoords[i], allCoords[i + 1]], _e = _d[0], x3 = _e[0], y3 = _e[1], _f = _d[1], x4 = _f[0], y4 = _f[1];
            var c2x = x3 - x4, c3x = x1 - x2, c2y = y3 - y4, c3y = y1 - y2;
            var d = c3x * c2y - c3y * c2x;
            if (d === 0) {
                continue;
            }
            var u1 = x1 * y2 - y1 * x2, u4 = x3 * y4 - y3 * x4;
            var px = (u1 * c2x - c3x * u4) / d, py = (u1 * c2y - c3y * u4) / d;
            var isInlcudesX = isIncludes(x1, x2, px) && isIncludes(x3, x4, px), isInlcudesY = isIncludes(y1, y2, py) && isIncludes(y3, y4, py);
            if (isInlcudesX && isInlcudesY) {
                drawRedDot(px, py);
            }
        }
    }
};
var redraw = function (coords) {
    for (var i = 0; i < coords.length - 1; i += 2) {
        var _a = [coords[i], coords[i + 1]], _b = _a[0], x1 = _b[0], y1 = _b[1], _c = _a[1], x2 = _c[0], y2 = _c[1];
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }
    markIntersection(coords);
};
var handleFollowing = function (event, coords, coordinateX, coordinateY) {
    if (fieldCanvas.hasAttribute(attributeName)) {
        ctx.clearRect(0, 0, fieldCanvas.width, fieldCanvas.height);
        ctx.beginPath();
        ctx.moveTo(coordinateX, coordinateY);
        ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
        ctx.stroke();
        ctx.closePath();
        redraw(coords);
        markIntersection(coords, [coords[coords.length - 1], [event.clientX - rect.left, event.clientY - rect.top]]);
    }
};
var handleDraw = function (event) {
    if (isClearing) {
        return;
    }
    var coordinateX = event.clientX - rect.left, coordinateY = event.clientY - rect.top;
    coords.push([coordinateX, coordinateY]);
    if (!fieldCanvas.hasAttribute(attributeName)) {
        fieldCanvas.setAttribute(attributeName, 'true');
        fieldCanvas.addEventListener('mousemove', function (e) { return handleFollowing(e, coords, coordinateX, coordinateY); });
    }
    else {
        fieldCanvas.removeAttribute(attributeName);
    }
};
var handleCancel = function (event) {
    event.preventDefault();
    if (fieldCanvas.hasAttribute(attributeName)) {
        ctx.clearRect(0, 0, fieldCanvas.width, fieldCanvas.height);
        coords.pop();
        redraw(coords);
        fieldCanvas.removeAttribute(attributeName);
    }
};
var handleClearField = function (event) {
    var xTop = 0, yTop = 0;
    var xDown = fieldCanvas.width, yDown = fieldCanvas.height;
    isClearing = true;
    handleCancel(event);
    var int = setInterval(function () {
        if (xTop > fieldCanvas.width / 4 && yTop > fieldCanvas.height / 4) {
            isClearing = false;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, fieldCanvas.width, fieldCanvas.height);
            coords = [];
            clearInterval(int);
            return;
        }
        ctx.clearRect(0, 0, xTop + 20, innerHeight);
        ctx.clearRect(0, 0, fieldCanvas.width, yTop + 20);
        ctx.clearRect(0, yDown - 20, fieldCanvas.width, fieldCanvas.height);
        ctx.clearRect(xDown - 20, 0, fieldCanvas.width, fieldCanvas.height);
        xTop += 5;
        yTop += 5;
        yDown -= 5;
        xDown -= 5;
    }, 30);
};
fieldCanvas.addEventListener('contextmenu', function (e) { return handleCancel(e); });
document.querySelector('button').addEventListener('click', function (event) { return handleClearField(event); });
fieldCanvas.addEventListener('click', function (event) { return handleDraw(event); });

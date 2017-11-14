if (typeof wiagram === 'undefined') wiagram = {};

wiagram.polygon = function (svg, points, styles) {
    var elmPolygon = d3.select(svg).append('polygon');
    var strPoints = '';
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        strPoints += point[0] + ',' + point[1] + ' ';
    }
    elmPolygon.attr('points', strPoints);
    for (var key in styles) {
        elmPolygon.attr(key, styles[key]);
    }
};

wiagram.line = function (svg, startX, startY, endX, endY, styles) {
    var elmLine = d3.select(svg).append('path');
    elmLine.attr('d', 'M' + startX + ',' + startY + 'L' + endX + ',' + endY);
    for (var key in styles) {
        elmLine.attr(key, styles[key]);
    }
};

wiagram.text = function (svg, x, y, text, styles) {
    var elmText = d3.select(svg).append('text');
    elmText.attr('x', x);
    elmText.attr('y', y);
    for (var key in styles) {
        elmText.attr(key, styles[key]);
    }
    elmText.text(text);
    if (typeof styles.onclick !== 'undeinfed') {
        elmText.on('click', function () {
            styles.onclick(d3.select(this));
            d3.event.stopPropagation();
        })
    }
};

wiagram.icon = function (svg, x, y, icon, styles) {
    wiagram.text(svg, x, y, icon, styles);
};

/**
 * @constructor
 *
 * 构造一个以svg为基础的图形显示。依赖d3库操作svg对象。
 *
 * @param {object} option - 配置项
 */
function Svg(option) {
    this.svgurl = option.svgurl;
    this.onLoaded = option.onLoaded || function (svg) {};
}

Svg.prototype.render = function(containerId) {
    this.containerId = containerId;
    var self = this;
    d3.xml(this.svgurl).mimeType('image/svg+xml').get(function (error, xml) {
        var container = document.getElementById(self.containerId);
        var svg = d3.select(xml.documentElement);
        self.dom = xml.documentElement;
        self.svg = svg;

        container.innerHTML = '';
        container.appendChild(self.dom);
        
        var viewBox = svg.attr('viewBox');
        var vals = viewBox.split(' ');
        var width = parseFloat(vals[2]);
        var height = parseFloat(vals[3]);
        svg.on('mousedown', function () {
            // 能够获取到具体的element
        });

        var zoom = d3.zoom().on('zoom', function () {
            var k = d3.event.transform.k;
            var x = d3.event.transform.x;
            var y = d3.event.transform.y;
            // svg.attr('viewBox', (-x / k) + ' ' + (-y / k) + ' ' + (width / k) + ' ' + (height / k));
            // 例子中的transform，可以到处跑
            svg.attr('transform', d3.event.transform);
        });

        self.onLoaded(svg, self.dom);
        d3.select(container).call(zoom);
    });
};

/**
 * @private
 */
Svg.prototype.findClosest = function (x, y) {
    // TODO
};

/**
 * @constructor
 *
 * 构造一个以svg为基础的图形显示。依赖d3库操作svg对象。
 *
 * @param {object} option - 配置项
 */
function Svg(option) {
    this.svgurl = option.svgurl;
    this.onLoad = option.onLoad;
    this.onDecorate = option.onDecorate;
}

Svg.prototype.render = function(containerId) {
    this.containerId = containerId;
    var self = this;
    d3.xml(this.svgurl).mimeType('image/svg+xml').get(function (error, xml) {
        self.container = document.getElementById(self.containerId);
        var svg = d3.select(xml.documentElement);
        self.dom = xml.documentElement;
        self.svg = svg;

        self.container.innerHTML = '';

        // keep the original viewBox
        self.viewBox = svg.attr('viewBox');
        var vals = self.viewBox.split(' ');
        var width = parseFloat(vals[2]);
        var height = parseFloat(vals[3]);

        var zoom = d3.zoom().on('zoom', function () {
            var svg = d3.select(this).select('svg');

            var containerHeight = self.container.offsetHeight;
            var containerWidth = self.container.offsetWidth;

            var scaleX = width / containerWidth;
            var scaleY = height / containerHeight;

            var k = d3.event.transform.k;
            var x = d3.event.transform.x;
            var y = d3.event.transform.y;

            svg.attr('viewBox', (-x / k * scaleX) + ' ' + (-y / k * scaleY) + ' ' + (width / k) + ' ' + (height / k));
            // 例子中的transform，可以到处跑
            // svg.attr('transform', d3.event.transform);
        });

        if (self.onDecorate)
            self.onDecorate(self.svg, self.dom);
        else
            self.container.appendChild(self.dom);
        
        if (self.onLoad)
            self.onLoad(self.svg);
        // binding events
        d3.select(self.container).call(zoom);
    });
};

Svg.prototype.restore = function () {
    var svg = d3.select(this.container).select('svg');
    svg.attr('viewBox', this.viewBox);
};

/**
 * @private
 */
Svg.prototype.findClosest = function (x, y) {
    // TODO
};
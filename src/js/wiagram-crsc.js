if (typeof wiagram === 'undefined') wiagram = {};

/**
 * 单纯显示监测测点。
 *
 * @param {object} option - 配置项
 *
 * @constructor
 */
wiagram.Crsc = function (option) {
    this.svgurl = option.svgurl;
    this.points = option.points || [];
    this.clickPoint = option.clickPoint || function (point) { };
};

wiagram.Crsc.prototype.render = function (containerId) {
    var self = this;
    this.containerId = containerId;
    var svg = new Svg({
        svgurl: this.svgurl,
        onDecorate: function (svg, dom) {
            // 设置SVG根文档，绑定在对象实例
            self.svg = svg;
            self.dom = dom;
            self.decorate(self.dom.cloneNode(true));
        }
    });
    svg.render(containerId);
};

wiagram.Crsc.prototype.setValues = function (values) {

};

wiagram.Crsc.prototype.decorate = function (svg) {
    var styles = { 'font-size': '0.04em', 'font-family': 'FontAwesome', 'style': 'cursor: pointer'};
    styles.onclick = this.clickPoint;

    var container = document.getElementById(this.containerId);
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        wiagram.icon(svg, point.x, point.y, point.icon, styles);
    }
    container.innerHTML = '';
    container.appendChild(svg);
};
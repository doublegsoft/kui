
/**
 * @constructor
 * 
 * 构造一个以svg为基础的图形显示。依赖d3库操作svg对象。
 * 
 * @param {object}
 *          option - 配置项
 */
function Svg(option) {
  this.svgurl = option.svgurl;
  this.zoomable = option.zoomable || false;
  this.onLoad = option.onLoad;
  this.onDecorate = option.onDecorate;
  this.enableDrawing = option.enableDrawing || false;
  this.isDrawingLine = false;
  this.isDrawingPolygon = false;
  this.lastClickedPoint = null;
  this.clickedPoints = [];
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
    self.container.appendChild(self.dom);
    
    // keep the original viewBox
    self.viewBox = svg.attr('viewBox');
    var vals = self.viewBox.split(' ');
    var width = parseFloat(vals[2]);
    var height = parseFloat(vals[3]);

    if (self.zoomable) {
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
    }

    if (self.onDecorate)
      self.onDecorate(self.svg, self.dom);

    if (self.onLoad)
      self.onLoad(self.svg, self.dom);
    if (self.enableDrawing) {
      svg.on('mousedown', function () {
        var point = d3.mouse(this);
        var newClickedPoint = {x: point[0], y: point[1]};
        self.lastClickedPoint = newClickedPoint;
        self.clickedPoints.push(newClickedPoint);

        self.lastLine = self.svg.select('#_tmp_line');
        if (self.lastLine.empty()) {
          self.lastLine = self.svg.append('line');
          self.lastLine.attr('id', '_tmp_line').style('stroke', 'blue')
          .attr('x1', newClickedPoint.x).attr('y1', newClickedPoint.y)
          .attr('x2', newClickedPoint.x).attr('y2', newClickedPoint.y);
        } else {
          self.lastLine.attr('id', '');
          self.lastLine = self.svg.append('line');
          self.lastLine.attr('id', '_tmp_line').style('stroke', 'blue')
          .attr('x1', newClickedPoint.x).attr('y1', newClickedPoint.y)
          .attr('x2', newClickedPoint.x).attr('y2', newClickedPoint.y);
        }
      });

      svg.on('contextmenu', function () {
        d3.event.preventDefault();
        self.lastClickedPoint = null;
      });

      svg.on('mousemove', function() {
        if (!self.lastClickedPoint) {
          return;
        }
        var point = d3.mouse(this);

        self.lastLine.attr('x2', point[0]).attr('y2', point[1]);
      });
    }
    // binding events
    if (self.zoomable) 
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


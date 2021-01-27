/**
 * It is the base type for elements which are drew in html canvas.
 *
 * @constructor
 */
function CanvasElement() {
  this.id = '';
  //
  // the top point
  //
  this.position = {x: 0, y: 0};
  //
  // the element size
  //
  this.size = {width: 0, height: 0};
  //
  // the offset between clicked point and top point
  //
  this.offset = {x: 0, y: 0};
  //
  //
  //
  this.selected = false;
  //
  // the connections from which {@code this} element to
  // other elements.
  //
  this.connections= [];
  this.moving = false;
}

/**
 * Checks the given point is in {@code this} element.
 *
 * @param {x,y} point
 *        the checking point
 */
CanvasElement.prototype.contains = function(point) {
  let x = point.x;
  let y = point.y;

  return x >= this.position.x &&
         x <= this.position.x + this.size.width &&
         y >= this.position.y &&
         y <= this.position.y + this.size.height;
};

CanvasElement.prototype.select = function(point) {
  if (!this.contains(point)) return;
  this.offset.x = point.x - this.position.x;
  this.offset.y = point.y - this.position.y;
};

CanvasElement.prototype.move = function(point) {
  if (!this.contains(point)) return;
  this.position.x = point.x - this.offset.x;
  this.position.y = point.y - this.offset.y;
};

/**
 *
 *
 * @param {CanvasElement} element
 */
CanvasElement.prototype.nearby = function(element) {

};

CanvasElement.prototype.isSelected = function() {
  return this.selected;
};

/**
 * It is a abstract function to be implemented by subclass to render
 * {@code this} element in html canvas.
 *
 * @param context
 *
 * @abstract
 */
CanvasElement.prototype.render = function(context) {

};

/**
 * It is the connection element between source element and target element.
 *
 * @constructor
 */
function ConnectionElement(options) {
  this.source = options.source;
  this.target = options.target;
}

ConnectionElement.prototype = new CanvasElement();

ConnectionElement.prototype.connect = function(source, target) {
  source.connections.push(target);
};

ConnectionElement.prototype.render = function(context) {
  
};


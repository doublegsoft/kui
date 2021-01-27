
const JOINT_WIDTH = 6;
const JOINT_BORDER_WIDTH = 1.5;
const JOINT_COLOR = '#21ba45';

const NODE_START = {
  type: 'start',
  color: '#63c2de',
  radius: 45
};

/**
 *
 */
let WorkflowDesigner = function(opts) {
  this.raphael = Raphael(opts.svgContainerId);
  this.nodes = opts.nodes;
  this.mode = 'move';
  this.roles = [];
  this.nodes = [];
  this.connections = [];
  this.from = null;
  this.to = null;

  this.initialize();

  let self = this;
  let svg = document.querySelector('#' + opts.svgContainerId + ' svg');
  svg.addEventListener('click', function() {
    for (let i = 0; i < self.nodes.length; i++)
      self.nodes[i].deselect();
  });

  //
  let attrPath = {
    'stroke-width': '3px'
  };
  let path = this.raphael.path('M0,50 L' + svg.clientWidth + ',50');
  path.attr(attrPath);

  path = this.raphael.path('M240,0 L240,' + svg.clientHeight);
  path.attr(attrPath);

  path = this.raphael.path('M480,0 L480,' + svg.clientHeight);
  path.attr(attrPath);
};

WorkflowDesigner.prototype.initialize = function () {
  Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
      line = obj1;
      obj1 = line.from;
      obj2 = line.to;
    }
    let bb1 = obj1.getBBox();
    let bb2 = obj2.getBBox();
    let p = [
      {x: bb1.x + bb1.width / 2, y: bb1.y - 1},
      {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
      {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
      {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
      {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
      {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
      {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
      {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}
    ];
    let  d = {}, dis = [], res;
    for (let i = 0; i < 4; i++) {
      for (let j = 4; j < 8; j++) {
        let dx = Math.abs(p[i].x - p[j].x),
          dy = Math.abs(p[i].y - p[j].y);
        if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
          dis.push(dx + dy);
          d[dis[dis.length - 1]] = [i, j];
        }
      }
    }
    if (dis.length == 0) {
      res = [0, 4];
    } else {
      res = d[Math.min.apply(Math, dis)];
    }
    let x1 = p[res[0]].x,
      y1 = p[res[0]].y,
      x4 = p[res[1]].x,
      y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    let x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
      y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
      x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
      y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    let path = ['M', x1.toFixed(3), y1.toFixed(3), 'C', x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(',');
    if (line && line.line) {
      line.bg && line.bg.attr({path: path});
      line.line.attr({path: path});
    } else {
      let color = typeof line == 'string' ? line : '#000';
      return {
        bg: bg && bg.split && this.path(path).attr({stroke: bg.split('|')[0], fill: 'none', 'stroke-width': bg.split('|')[1] || 3}),
        line: this.path(path).attr({stroke: color, 'stroke-width': '2px', fill: 'none', 'arrow-end': 'classic-wide-long'}),
        from: obj1,
        to: obj2
      };
    }
  };
};

WorkflowDesigner.prototype.setMode = function (mode) {
  this.mode = mode;
};

/**
 *
 */
WorkflowDesigner.prototype.addNode = function (x, y, dataTransfer) {
  let node = null;
  if (dataTransfer.type == 'role') {

  } else if (dataTransfer.type == 'process') {
    node = new WorkflowDesigner.NodeProcess(this, x, y);
  } else if (dataTransfer.type == 'condition') {
    node = new WorkflowDesigner.NodeCondition(this, x, y);
  } else if (dataTransfer.type == 'finish') {
    node = new WorkflowDesigner.NodeFinish(this, x, y);
  }
  this.nodes.push(node);
};

/**
 * Removes the selected node in model and its shape in svg container.
 */
WorkflowDesigner.prototype.removeNode = function() {
  let id = this.selectedNode.id;
  for (let i = 0; i < this.nodes.length; i++) {
    let node = this.nodes[i];
    if (node.id == id) {
      node.remove();
      break;
    }
  }
};

/**
 * Selects a node and renders the UI effect.
 *
 * @param node
 *        the selected node
 */
WorkflowDesigner.prototype.selectNode = function(node) {
  for (let i = 0; i < this.nodes.length; i++) {
    this.nodes[i].deselect();
  }
  node.select();
};

/**
 * Locates a node in svg container according to the coordinate x and y.
 *
 * @param x
 *        the x coordinate
 *
 * @param y
 *        the y coordinate
 *
 * @returns {null|*}
 */
WorkflowDesigner.prototype.locateNode = function (x, y) {
  for (let i = 0; i < this.nodes.length; i++) {
    let obj = this.nodes[i];
    if (obj.type == 'process') {
      let sx = parseInt(obj.shape.attr('x'));
      let sy = parseInt(obj.shape.attr('y'));
      if (x >= sx && x <= (sx + NODE_PROCESS.width) &&
          y >= sy && y <= (sy + NODE_PROCESS.height)) {
        return obj;
      }
    } else if (obj.type == 'finish') {
      let sx = parseInt(obj.shape.attr('cx'));
      let sy = parseInt(obj.shape.attr('cy'));
      if (x >= (sx - NODE_FINISH.radius) && x <= (sx + this.radius) &&
        y >= (sy - NODE_FINISH.radius) && y <= (sy + this.radius)) {
        return obj;
      }
    } else if (obj.type == 'audit') {
      let sx = parseInt(obj.shape.attr('x'));
      let sy = parseInt(obj.shape.attr('y'));
      if (x >= sx && x <= (sx + this.width) &&
        y >= sy && y <= (sy + this.height)) {
        return obj;
      }
    }
  }
  return null;
};

/**
 * Finds a node in model according node id.
 *
 * @param id
 *        the node id
 *
 * @returns {null|*} found node or null.
 */
WorkflowDesigner.prototype.findNode = function(id) {
  for (let i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].id == id) {
      return this.nodes[i];
    }
  }
  return null;
};

WorkflowDesigner.prototype.showContextMenu = function(x, y) {
  let contextMenu = document.querySelector('.context-menu');
  if (contextMenu == null) return;
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.style.display = '';
};

WorkflowDesigner.prototype.makeJointPoint = function(shape, pos, x, y) {
  let self = this;
  let ret = this.raphael.rect(x, y, JOINT_WIDTH, JOINT_WIDTH, 0);
  ret.attr({
    'stroke': '#fff',
    'fill': '#fff',
    'cursor': 'crosshair'
  });
  ret.mouseover(function(event) {
    this.attr({
      'stroke': JOINT_COLOR,
      'fill': JOINT_COLOR,
    });
  });
  ret.mousedown(function(event) {
    self.from = this;
  });
  ret.mouseup(function(event) {
    self.to = this;
    if (self.from == null || self.from == self.to) return;

    let fromId = self.from.data('data-model-id');
    let toId = self.to.data('data-model-id');

    if (fromId != toId) {
      self.connections.push(self.raphael.connection(self.from, self.to, JOINT_COLOR));
      return;
    }

    for (let i = 0; i < self.connections.length; i++) {
      let conn = self.connections[i];
      if (toId == conn.from.data('data-model-id')) {
        self.connections.push(self.raphael.connection(self.to, conn.to, JOINT_COLOR));
        conn.line.remove();
        self.connections.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < self.connections.length; i++) {
      let conn = self.connections[i];
      if (toId == conn.to.data('data-model-id')) {
        self.connections.push(self.raphael.connection(conn.from, self.to, JOINT_COLOR));
        conn.line.remove();
        self.connections.splice(i, 1);
        break;
      }
    }

    self.from = null;
    self.to = null;
  });
  ret.data('data-model-id', shape.data('data-model-id'));
  ret.data('data-model-pos', pos);
  return ret;
};

WorkflowDesigner.Node = function(designer, x, y) {
  this.points = [];
};

/**
 * Selects {@code this} node.
 */
WorkflowDesigner.Node.prototype.select = function() {
  for (let i = 0; i < this.points.length; i++) {
    this.points[i].attr({
      stroke: JOINT_COLOR,
      fill: JOINT_COLOR
    });
  }
};

/**
 * Deselects {@code this} node.
 */
WorkflowDesigner.Node.prototype.deselect = function() {
  for (let i = 0; i < this.points.length; i++) {
    this.points[i].attr({
      stroke: '#fff',
      fill: '#fff'
    });
  }
};

/**
 * Binds all events for {@code this} node.
 */
WorkflowDesigner.Node.prototype.bind = function() {
  let self = this;
  this.shape.mouseup(function(event) {
    if (event.which == 3) {
      event.preventDefault();
      event.stopPropagation();
      self.designer.selectedNode = self;
      self.designer.showContextMenu(event.clientX, event.clientY);
    }
  });

  let mousedown = function (x, y, event) {
    if (event.which == 3) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.ox = this.type == 'rect' ? this.attr('x') : this.attr('cx');
    this.oy = this.type == 'rect' ? this.attr('y') : this.attr('cy');
    this.animate({'fill-opacity': .2}, 500);

    self.select();
  };

  let mousemove = function (dx, dy, x, y, event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.which == 3 || dom.find('.context-menu').style.display == '') {
      return;
    }

    let id = this.data('data-model-id');
    let node = self.designer.findNode(id);
    node.move(this.ox, this.oy, dx, dy);
  };

  let mouseup = function (event) {
    event.preventDefault();
    event.stopPropagation();
    this.animate({'fill-opacity': 0.75}, 500);
  };

  this.shape.drag(mousemove, mousedown, mouseup);
};

/**
 * Removes {@code this} node from SVG container.
 */
WorkflowDesigner.Node.prototype.remove = function() {
  // remove in model
  for (let i = 0; i < this.designer.nodes.length; i++) {
    let node = this.designer.nodes[i];
    if (node.id == this.id) {
      this.designer.nodes.splice(i, 1);
      break;
    }
  }
  // remove connections
  for (let i = 0; i < this.designer.connections.length; i++) {
    let conn = this.designer.connections[i];
    if (conn.from.data('data-model-id') == this.id || conn.to.data('data-model-id') == this.id) {
      this.designer.connections.splice(i, 1);
      i--;
      conn.line.remove();
    }
  }
  // remove shape
  this.shape.remove();
};

////////////////////////////////////////////////////////////////////////////////
//
// PROCESS NODE
//
////////////////////////////////////////////////////////////////////////////////

WorkflowDesigner.NodeProcess = function (designer, x, y) {
  this.designer = designer;
  this.type = 'process';
  this.color =  '#2185d0';
  this.width =  120;
  this.height =  90;

  this.title = '工单';
  this.id = 'process-' + new Date().getTime();

  // text
  let cx = x - this.width / 2;
  let cy = y - this.height / 2;

  this.shape = this.designer.raphael.rect(cx, cy, this.width, this.height, 10);
  this.shape.data('data-model-id', this.id);
  this.shape.attr({
    fill: this.color,
    stroke: this.color,
    'fill-opacity': 0.75,
    'stroke-width': 2,
    cursor: 'move'
  });


  this.text = this.designer.raphael.text(x, y, this.title).attr({
    fill: '#ffffff',
    'font-size': '18px'
  });

  this.points = [];

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'top',
    x - JOINT_WIDTH / 2,
    cy - JOINT_WIDTH - JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'right',
    cx + this.width + JOINT_BORDER_WIDTH, y - JOINT_WIDTH / 2));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'bottom',
    x - JOINT_WIDTH / 2,
    cy + this.height + JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'left',
    cx - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.bind();
};

// extend WorkflowDesigner.Node
WorkflowDesigner.NodeProcess.prototype = new WorkflowDesigner.Node();

WorkflowDesigner.NodeProcess.prototype.move = function (ox, oy, dx, dy) {
  let x = ox + dx;
  let y = oy + dy;
  // shape position
  this.shape.attr({
    x: x,
    y: y
  });
  let cx = x + this.width / 2;
  let cy = y + this.height / 2;
  // text position
  this.text.attr({
    x: cx,
    y: cy
  });
  // point positions
  this.points[0].attr({
    x: cx - JOINT_WIDTH / 2,
    y: y - JOINT_WIDTH - JOINT_BORDER_WIDTH
  });
  this.points[1].attr({
    x: x + this.width + JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });
  this.points[2].attr({
    x: cx - JOINT_WIDTH / 2,
    y: y + this.height + JOINT_BORDER_WIDTH
  });
  this.points[3].attr({
    x: x - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });

  // connections
  for (let i = this.designer.connections.length; i--;) {
    this.designer.raphael.connection(this.designer.connections[i]);
  }
};

////////////////////////////////////////////////////////////////////////////////
//
// CONDITION NODE
//
////////////////////////////////////////////////////////////////////////////////

WorkflowDesigner.NodeCondition = function (designer, x, y) {
  this.designer = designer;
  this.type = 'condition';
  this.color =  '#EF711C';
  this.width =  90;
  this.height =  90;

  this.title = '审核';
  this.id = 'condition-' + new Date().getTime();

  let cx = x - this.width / 2;
  let cy = y - this.height / 2;

  this.shape = this.designer.raphael.rect(cx, cy, this.width, this.height, 0);
  this.shape.data('data-model-id', this.id);
  this.shape.attr({
    fill: this.color,
    stroke: this.color,
    'fill-opacity': 0.75,
    'stroke-width': 2,
    transform: 'r-45',
    cursor: 'move'
  });

  // text
  this.text = this.designer.raphael.text(x, y, this.title).attr({
    fill: '#fff',
    'font-size': '18px'
  });

  this.points = [];

  let offset =  this.height / Math.sqrt(2);

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'top',
    x - JOINT_WIDTH / 2,
    y - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'right',
    x + offset + JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'bottom',
    x - JOINT_WIDTH / 2 ,
    y + offset + JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'left',
    x - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.bind();
};

WorkflowDesigner.NodeCondition.prototype = new WorkflowDesigner.Node();

WorkflowDesigner.NodeCondition.prototype.move = function (ox, oy, dx, dy) {
  let x = ox + dx;
  let y = oy + dy;
  // shape position
  this.shape.attr({
    x: x,
    y: y,
    transform: 'r-45'
  });
  let cx = x + this.width / 2;
  let cy = y + this.height / 2;
  // text position
  this.text.attr({
    x: cx,
    y: cy
  });
  // point positions
  let offset = this.height / Math.sqrt(2);
  this.points[0].attr({
    x: cx - JOINT_WIDTH / 2,
    y: cy - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH
  });
  this.points[1].attr({
    x: cx + offset + JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });
  this.points[2].attr({
    x: cx - JOINT_WIDTH / 2,
    y: cy + offset + JOINT_BORDER_WIDTH
  });
  this.points[3].attr({
    x: cx - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });

  // connections
  for (let i = this.designer.connections.length; i--;) {
    this.designer.raphael.connection(this.designer.connections[i]);
  }
};

////////////////////////////////////////////////////////////////////////////////
//
// FINISH NODE
//
////////////////////////////////////////////////////////////////////////////////

WorkflowDesigner.NodeFinish = function (designer, x, y) {
  this.designer = designer;
  this.type = 'finish';
  this.color =  '#f86c6b';
  this.width =  90;
  this.height =  90;
  this.radius = 45;

  this.title = '结束';
  this.id = 'finish-' + new Date().getTime();

  this.shape = this.designer.raphael.circle(x, y, this.radius);
  this.shape.data('data-model-id', this.id);
  this.shape.attr({
    fill: this.color,
    stroke: this.color,
    'fill-opacity': 0.75,
    'stroke-width': 2,
    cursor: 'move'
  });

  // text
  this.text = this.designer.raphael.text(x, y, this.title).attr({
    fill: '#fff',
    'font-size': '18px'
  });

  this.points = [];

  let offset =  this.radius;


  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'top',
    x - JOINT_WIDTH / 2,
    y - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'right',
    x + offset + JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'bottom',
    x - JOINT_WIDTH / 2 ,
    y + offset + JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'left',
    x - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.bind();
};

WorkflowDesigner.NodeFinish.prototype = new WorkflowDesigner.Node();

WorkflowDesigner.NodeFinish.prototype.move = function (ox, oy, dx, dy) {
  let x = ox + dx;
  let y = oy + dy;
  // shape position
  this.shape.attr({
    cx: x,
    cy: y,
  });
  let cx = x;
  let cy = y;
  // text position
  this.text.attr({
    x: cx,
    y: cy
  });
  // point positions
  let offset = this.radius;

  this.points[0].attr({
    x: cx - JOINT_WIDTH / 2,
    y: cy - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH
  });
  this.points[1].attr({
    x: cx + offset + JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });
  this.points[2].attr({
    x: cx - JOINT_WIDTH / 2,
    y: cy + offset + JOINT_BORDER_WIDTH
  });
  this.points[3].attr({
    x: cx - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });

  // connections
  for (let i = this.designer.connections.length; i--;) {
    this.designer.raphael.connection(this.designer.connections[i]);
  }
};


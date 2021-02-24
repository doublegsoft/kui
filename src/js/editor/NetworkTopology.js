
function NetworkTopology(opts) {
  this.onCellDoubleClicked = opts.onCellDoubleClicked;
}

NetworkTopology.prototype.addItem2Graph = function (graph, toolbar, prototype, image)
{
  // Function that is executed when the image is dropped on
  // the this.graph. The cell argument points to the cell under
  // the mousepointer if there is one.
  let dropOnGraph = function(graph, evt, cell, x, y) {
    graph.stopEditing(false);

    let vertex = graph.getModel().cloneCell(prototype);
    vertex.geometry.x = x;
    vertex.geometry.y = y;
    // vertex.style[mxConstants.STYLE_IMAGE] = image;

    graph.addCell(vertex);
    graph.setSelectionCell(vertex);
  };

  // Creates the image which is used as the drag icon (preview)
  let img = toolbar.addMode(null, image, function(evt, cell) {
    let pt = this.this.graph.getPointForEvent(evt);
    dropOnGraph(graph, evt, cell, pt.x, pt.y);
  });
  img.width = 32;

  // Disables dragging if element is disabled. This is a workaround
  // for wrong event order in IE. Following is a dummy listener that
  // is invoked as the last listener in IE.
  mxEvent.addListener(img, 'mousedown', function(evt)
  {
    // do nothing
  });

  // This listener is always called first before any other listener
  // in all browsers.
  mxEvent.addListener(img, 'mousedown', function(evt)
  {
    if (img.enabled == false)
    {
      mxEvent.consume(evt);
    }
  });

  mxUtils.makeDraggable(img, graph, dropOnGraph);

  return img;
}

NetworkTopology.prototype.setup = function() {
  let self = this;
  // Defines an icon for creating new connections in the connection handler.
  // This will automatically disable the highlighting of the source vertex.
  mxConnectionHandler.prototype.connectImage = new mxImage('img/network/connector.gif', 16, 16);
  mxEdgeHandler.prototype.removeEnabled = true;

  // Creates the div for the toolbar
  let tbContainer = document.createElement('div');
  tbContainer.style.position = 'absolute';
  tbContainer.style.overflow = 'hidden';
  tbContainer.style.padding = '2px';
  tbContainer.style.left = '0px';
  tbContainer.style.top = '0px';
  tbContainer.style.width = '42px';
  tbContainer.style.bottom = '0px';

  this.container.appendChild(tbContainer);

  // Creates new toolbar without event processing
  let toolbar = new mxToolbar(tbContainer);
  toolbar.enabled = false;

  // Creates the div for the graph
  let container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.overflow = 'hidden';
  container.style.left = '0px';
  container.style.top = '0px';
  container.style.right = '0px';
  container.style.bottom = '0px';
  container.style.background = 'url("img/editors/images/grid.gif")';

  this.container.appendChild(container);

  // Workaround for Internet Explorer ignoring certain styles
  if (mxClient.IS_QUIRKS)
  {
    document.body.style.overflow = 'hidden';
    new mxDivResizer(tbContainer);
    new mxDivResizer(container);
  }

  let model = new mxGraphModel();
  this.graph = new mxGraph(container, model);

  let style = this.graph.getStylesheet().getDefaultEdgeStyle();
  style[mxConstants.STYLE_ROUNDED] = true;
  style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
  style[mxConstants.STYLE_STARTARROW] = 'oval';
  style[mxConstants.STYLE_ENDARROW] = 'oval';
  // this.graph.alternateEdgeStyle = 'elbow=vertical';

  // Stops editing on enter or escape keypress
  let keyHandler = new mxKeyHandler(this.graph);
  let rubberband = new mxRubberband(this.graph);
  keyHandler.bindKey(46, function(evt)
  {
    if (self.graph.isEnabled()) {
      let selected = self.graph.getSelectionCell();
      self.graph.removeCells();
    }
  });

  // Enables new connections in the graph
  this.graph.setConnectable(true);
  this.graph.setMultigraph(false);
  this.graph.setCellsLocked(false);
  this.graph.setCellsEditable(false);
  this.graph.convertValueToString = function(cell)
  {
    if (cell.value && cell.value.label) {
      return cell.value.label;
    }
    return '';
  };
  let cellLabelChanged = this.graph.cellLabelChanged;
  this.graph.cellLabelChanged = function(cell, newValue, autoSize) {
    if (mxUtils.isNode(cell.value)) {
      // Clones the value for correct undo/redo
      let elt = cell.value.cloneNode(true);
      elt.setAttribute('label', newValue);
      newValue = cell.oldValue;
      newValue.label = cell.value;
    }
    cell.value.label = newValue;
    newValue = cell.value;
    cellLabelChanged.apply(this, arguments);
  };

  let addItem2Toolbar = function(type, w, h) {
    let style = 'verticalLabelPosition=bottom;verticalAlign=top;shape=image;image=' + self.getImage(type);
    let vertex = new mxCell({type: type}, new mxGeometry(0, 0, w, h), style);
    vertex.setVertex(true);

    let img = self.addItem2Graph(self.graph, toolbar, vertex, self.getImage(type));
    img.enabled = true;
  };

  addItem2Toolbar('pc', 33, 33,);
  addItem2Toolbar('server',28, 40);
  addItem2Toolbar('database', 42, 33);
  addItem2Toolbar('router', 49, 33);
  addItem2Toolbar('switch-l2', 65, 32);
  addItem2Toolbar('switch-l3', 63, 63);
  addItem2Toolbar('ups',51, 33);
  addItem2Toolbar('cloud',109, 63);

  this.bindEvents();
};

NetworkTopology.prototype.bindEvents = function() {
  let self = this;
  this.graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt) {

  });

  this.graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt) {
    self.onCellDoubleClicked(evt.properties['cell']);
  });

  this.graph.addListener(mxEvent.CELLS_MOVED, function(sender, evt) {
    console.log(self.getData());
  });

  this.graph.addListener(mxEvent.CELLS_ADDED, function(sender, evt) {
    console.log(self.getData());
  });

  this.graph.addListener(mxEvent.CELLS_REMOVED, function(sender, evt) {
    console.log(self.getData());
  });

  // this.graph.addListener(mxEvent.LABEL_CHANGED, function(sender, evt) {
  //   console.log(evt.properties['cell']);
  //   let cell = evt.properties['cell'];
  //   let label = evt.properties['value'];
  //   self.graph.getModel().setValue(cell, {
  //     value: label,
  //     type: cell.value.type
  //   });
  // });
};

NetworkTopology.prototype.getImage = function(type) {
  if (type == 'pc') {
    return 'img/network/symbol/pc.svg';
  } else if (type == 'server') {
    return 'img/network/symbol/server.svg';
  } else if (type == 'database') {
    return 'img/network/symbol/database.svg';
  } else if (type == 'router') {
    return 'img/network/symbol/router.svg';
  } else if (type == 'switch-l2') {
    return 'img/network/symbol/switch-l2.svg';
  } else if (type == 'switch-l3') {
    return 'img/network/symbol/switch-l3.svg';
  } else if (type == 'ups') {
    return 'img/network/symbol/ups.svg';
  } else if (type == 'cloud') {
    return 'img/network/symbol/cloud.svg'
  }
};

NetworkTopology.prototype.getData = function() {
  let ret = [];
  for (let index in this.graph.getModel().cells) {
    let cell = this.graph.getModel().cells[index];
    if (cell.vertex) {
      ret.push({
        id: cell.id,
        vertex: true,
        x: cell.geometry.x,
        y: cell.geometry.y,
        width: cell.geometry.width,
        height: cell.geometry.height,
        style: cell.style,
        type: cell.value.type
      });
    } else if (cell.edge) {
      ret.push({
        id: cell.id,
        edge: true,
        source: cell.source.id,
        target: cell.target.id
      });
    }
  }
  return ret;
};

NetworkTopology.prototype.render = function(container, data) {
  data = data || [];
  this.container = dom.find(container);
  this.setup();

  this.container.querySelectorAll('div').forEach( function(div) {
    div.style.position = 'relative';
    div.style.height = '100%';
  });

  let vertice = [];
  function getVertex(id) {
    for (let i = 0; i < vertice.length; i++) {
      if (id === vertice[i].id) return vertice[i];
    }
  }

  // vertex
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.edge) continue;
    let style = 'verticalLabelPosition=bottom;verticalAlign=top;shape=image;image=' + this.getImage(row.type);
    vertice.push(this.graph.insertVertex(null, row.id, {type: row.type},
      row.x, row.y, row.width, row.height, style));
  }

  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.vertex) continue;
    this.graph.insertEdge(null, row.id, {}, getVertex(row.source), getVertex(row.target));
  }
};


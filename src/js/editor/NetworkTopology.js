
function NetworkTopology(opts) {

}

NetworkTopology.prototype.setup = function() {
  // Defines an icon for creating new connections in the connection handler.
  // This will automatically disable the highlighting of the source vertex.
  mxConnectionHandler.prototype.connectImage = new mxImage('images/connector.gif', 16, 16);

  // Creates the div for the toolbar
  let tbContainer = document.createElement('div');
  tbContainer.style.position = 'absolute';
  tbContainer.style.overflow = 'hidden';
  tbContainer.style.padding = '2px';
  tbContainer.style.left = '0px';
  tbContainer.style.top = '0px';
  tbContainer.style.width = '24px';
  tbContainer.style.bottom = '0px';

  document.body.appendChild(tbContainer);

  // Creates new toolbar without event processing
  let toolbar = new mxToolbar(tbContainer);
  toolbar.enabled = false

  // Creates the div for the graph
  let container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.overflow = 'hidden';
  container.style.left = '24px';
  container.style.top = '0px';
  container.style.right = '0px';
  container.style.bottom = '0px';
  container.style.background = 'url("editors/images/grid.gif")';

  document.body.appendChild(container);

  // Workaround for Internet Explorer ignoring certain styles
  if (mxClient.IS_QUIRKS)
  {
    document.body.style.overflow = 'hidden';
    new mxDivResizer(tbContainer);
    new mxDivResizer(container);
  }

  // Creates the model and the graph inside the container
  // using the fastest rendering available on the browser
  let model = new mxGraphModel();
  let graph = new mxGraph(container, model);

  // Enables new connections in the graph
  graph.setConnectable(true);
  graph.setMultigraph(false);

  // Stops editing on enter or escape keypress
  let keyHandler = new mxKeyHandler(graph);
  let rubberband = new mxRubberband(graph);

  let addVertex = function(icon, w, h, style)
  {
    let vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);
    vertex.setVertex(true);

    let img = addToolbarItem(graph, toolbar, vertex, icon);
    img.enabled = true;

    graph.getSelectionModel().addListener(mxEvent.CHANGE, function()
    {
      let tmp = graph.isSelectionEmpty();
      mxUtils.setOpacity(img, (tmp) ? 100 : 20);
      img.enabled = tmp;
    });
  };

  addVertex('editors/images/rectangle.gif', 100, 40, '');
  addVertex('editors/images/rounded.gif', 100, 40, 'shape=rounded');
  addVertex('editors/images/ellipse.gif', 40, 40, 'shape=ellipse');
  addVertex('editors/images/rhombus.gif', 40, 40, 'shape=rhombus');
  addVertex('editors/images/triangle.gif', 40, 40, 'shape=triangle');
  addVertex('editors/images/cylinder.gif', 40, 40, 'shape=cylinder');
  addVertex('editors/images/actor.gif', 30, 40, 'shape=actor');
};

NetworkTopology.prototype.render = function(container) {

};
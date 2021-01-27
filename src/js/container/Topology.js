
function Topology(opt) {
  this.images = opt.images;
  this.graph = {
    nodes: [],
    edges: []
  }
  this.nodeClicked = opt.nodeClicked || function(node) {};
  this.nodeMoved = opt.nodeMoved || function(node) {};
}

Topology.prototype.initialize = function() {
  sigma.utils.pkg('sigma.canvas.nodes');
  sigma.utils.pkg('sigma.canvas.edges');
  sigma.canvas.nodes.image = (function() {
    let _cache = {}, _loading = {}, _callbacks = {};

    // Return the renderer itself:
    let renderer = function(node, context, settings) {
      let args = arguments,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'],
        color = node.color || settings('defaultNodeColor'),
        url = node.url;

      if (_cache[url]) {
        context.save();

        // Draw the clipping disc:
        context.beginPath();
        context.arc(
          node[prefix + 'x'],
          node[prefix + 'y'],
          node[prefix + 'size'],
          0,
          Math.PI * 2,
          true
        );
        context.closePath();
        context.clip();

        // Draw the image
        context.drawImage(
          _cache[url],
          node[prefix + 'x'] - size,
          node[prefix + 'y'] - size,
          2 * size,
          2 * size
        );

        // Quit the "clipping mode":
        context.restore();

        // Draw the border:
        context.beginPath();
        context.arc(
          node[prefix + 'x'],
          node[prefix + 'y'],
          node[prefix + 'size'],
          0,
          Math.PI * 2,
          true
        );
        context.lineWidth = size / 5;
        context.strokeStyle = node.color || settings('defaultNodeColor');
        context.stroke();
      } else {
        sigma.canvas.nodes.image.cache(url);
        sigma.canvas.nodes.def.apply(
          sigma.canvas.nodes,
          args
        );
      }
    };

    // Let's add a public method to cache images, to make it possible to
    // preload images before the initial rendering:
    renderer.cache = function(url, callback) {
      if (callback)
        _callbacks[url] = callback;

      if (_loading[url])
        return;

      let img = new Image();

      img.onload = function() {
        _loading[url] = false;
        _cache[url] = img;

        if (_callbacks[url]) {
          _callbacks[url].call(this, img);
          delete _callbacks[url];
        }
      };

      _loading[url] = true;
      img.src = url;
    };

    return renderer;
  })();

  // sigma.canvas.edges.t = function(edge, source, target, context, settings) {
  //   let color = edge.color,
  //     prefix = settings('prefix') || '',
  //     edgeColor = settings('edgeColor'),
  //     defaultNodeColor = settings('defaultNodeColor'),
  //     defaultEdgeColor = settings('defaultEdgeColor');
  //
  //   if (!color)
  //     switch (edgeColor) {
  //       case 'source':
  //         color = source.color || defaultNodeColor;
  //         break;
  //       case 'target':
  //         color = target.color || defaultNodeColor;
  //         break;
  //       default:
  //         color = defaultEdgeColor;
  //         break;
  //     }
  //
  //   context.strokeStyle = color;
  //   context.lineWidth = edge[prefix + 'size'] || 1;
  //   context.beginPath();
  //   context.moveTo(
  //     source[prefix + 'x'],
  //     source[prefix + 'y']
  //   );
  //   context.lineTo(
  //     source[prefix + 'x'],
  //     target[prefix + 'y']
  //   );
  //   context.lineTo(
  //     target[prefix + 'x'],
  //     target[prefix + 'y']
  //   );
  //   context.stroke();
  // };
};

Topology.prototype.addVertex = function(vertex) {
  vertex.size = 16;
  vertex.type = 'image';
  this.graph.nodes.push(vertex);
};

Topology.prototype.connect = function(source, target, color) {
  let vertexSource = null;
  let vertexTarget = null;
  for (let i = 0; i < this.graph.nodes.length; i++) {
    let vertex = this.graph.nodes[i];
    if (source == vertex.id) {
      vertexSource = vertex;
    }
    if (target == vertex.id) {
      vertexTarget = vertex;
    }
  }
  this.graph.edges.push({
    id: vertexSource.id + '<->' + vertexTarget.id,
    source: vertexSource.id,
    target: vertexTarget.id,
    color: '#3a9d5d',
    size: 1
  });
};

Topology.prototype.render = function(selector, params) {
  this.renderTo(selector);
};

Topology.prototype.renderTo = function(selector) {
  let self = this;
  self.initialize();
  if (typeof selector == 'string') {
    this.container = dom.find(selector);
  } else {
    this.container = selector;
  }
  this.container.innerHTML = '';
  let loaded = 0;
  this.images.forEach(function(url) {
    sigma.canvas.nodes.image.cache(url, function() {
      if (++loaded != self.images.length) return;
      self.sigma = new sigma({
        graph: self.graph,
        renderer: {
          // IMPORTANT:
          // This works only with the canvas renderer, so the
          // renderer type set as "canvas" is necessary here.
          container: self.container,
          type: 'canvas'
        },
        settings: {
          defaultLabelColor: '#fff',
          zoomingRatio: 1,
          autoRescale: false,
          doubleClickEnabled: false,
          minNodeSize: 8,
          maxNodeSize: 16,
        }
      });
      self.sigma.bind('doubleClickNode', function(event) {
        self.nodeClicked(event.data.node);
      });
      // Initialize the dragNodes plugin:
      let dragListener = sigma.plugins.dragNodes(self.sigma, self.sigma.renderers[0]);

      dragListener.bind('startdrag', function(event) {

      });
      dragListener.bind('drag', function(event) {

      });
      dragListener.bind('drop', function(event) {

      });
      dragListener.bind('dragend', function(event) {
        self.nodeMoved(event.data.node);
      });
      // s.startForceAtlas2();
    });
  });
};
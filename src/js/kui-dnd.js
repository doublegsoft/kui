if (typeof dnd === 'undefined')
  dnd = {};

dnd.setDraggable = function (selector, payload, callback) {
  let element;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  element.setAttribute("draggable", "true");
  element.ondragstart = function(ev) {
    let li = element;// dom.ancestor(ev.target, 'li');
    let dragImage = li.getAttribute('widget-drag-image');
    let x = event.layerX;
    let y = event.layerY;
    for (let key in payload)
      ev.dataTransfer.setData(key, payload[key]);
    if (dragImage && dragImage != '') {
      let image = new Image();
      image.src = dragImage;
      ev.dataTransfer.setDragImage(image, x, y);
    }
    let target = event.target;
    if (callback) {
      callback(x, y, target);
    }
  };
};

dnd.clearDraggable = function(selector) {
  let element;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  element.setAttribute("draggable", "false");
  element.removeEventListener("dragstart", function() {});
};

dnd.setDroppable = function (selector, callback) {
  let element;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  element.ondragover = function (event) {
    event.preventDefault();
  };
  element.ondrop = function (event) {
    event.preventDefault();
    let rect = element.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    if (callback) {
      let data = {};
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        let name = event.dataTransfer.items[i].type;
        data[name] = event.dataTransfer.getData(name);
      }
      callback(parseInt(x), y, data);
    }
  };
};

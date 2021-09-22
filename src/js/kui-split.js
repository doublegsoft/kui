if (typeof split === 'undefined') split = {};

split.vertical = function(containerId, leftId, rightId, leftDefaultSize) {
  const splitterId = "__split_splitterId";
  leftDefaultSize = (leftDefaultSize || 300)
  let container = dom.find(containerId);
  let splitter = document.createElement('a');
  splitter.setAttribute('id', splitterId);
  container.appendChild(splitter);
  splitter.style.backgroundColor = '#cdcdcd';
  splitter.style.position = 'absolute';
  splitter.style.width = '5px';
  splitter.style.cursor = 'ew-resize';
  splitter.style.padding = '2px';
  splitter.style.zIndex = '3';

  // disable scroll-y for container
  container.style.overflowY = 'hidden';

  let heightContainer = container.clientHeight;

  let left = dom.find(leftId);
  let right = dom.find(rightId);

  left.style.width = leftDefaultSize + 'px';
  left.style.flex = leftDefaultSize + 'px';
  right.style.width = container.clientWidth - leftDefaultSize + 'px';
  right.style.flex = container.clientWidth - leftDefaultSize + 'px';

  splitter.style.height = heightContainer + 'px';
  splitter.style.top = 0 + 'px';
  splitter.style.left = leftDefaultSize + 'px';
  splitter.style.height = heightContainer + 'px';

  left.style.height = heightContainer + 'px';
  left.style.overflowY = 'auto';
  right.style.height = heightContainer + 'px';
  right.style.overflowY = 'auto';

  let dragging = false;
  splitter.addEventListener('mousedown', function(event) {
    event.preventDefault();
    dragging = true;
    document.body.style.cursor = 'ew-resize';
  });

  document.addEventListener('mouseup', function(event) {
    dragging = false;
    document.body.style.cursor = 'default';
  });

  function isUnderContainer(element, container) {
    if (element == null) {
      return false;
    }
    if (element == container) return true;
    return isUnderContainer(element.parentElement, container);
  }

  let offsetLeftPrevious = -1;
  container.addEventListener('mousemove', function(event) {
    if (dragging) {
      if (event.offsetX <= 0) return;
      if (event.offsetX >= this.clientWidth) return;
      let target = event.target;

      if (target.getAttribute('id') == splitterId) {
        console.log('hello');
        let offsetLeft = parseInt(splitter.style.left);
        splitter.style.left = (offsetLeft/* + event.layerX*/) + 'px';
        left.style.width = (offsetLeft/* + event.layerX*/) + 'px';
        left.style.flex = (offsetLeft/* + event.layerX*/) + 'px';
        right.style.width = (container.clientWidth - (offsetLeft/* + event.layerX*/)) + 'px';
        right.style.flex = (container.clientWidth - (offsetLeft/* + event.layerX*/)) + 'px';
        return;
      }
      let offset = 0;
      if (isUnderContainer(target, left)) {
        offset = parseInt(splitter.style.left) - 5;
        splitter.style.left = offset + 'px';
        left.style.width = offset + 'px';
        right.style.width = (container.clientWidth - offset) + 'px';
        left.style.flex = offset + 'px';
        right.style.flex = (container.clientWidth - offset) + 'px';
        return;
      }
      if (isUnderContainer(target, right)) {
        offset = parseInt(splitter.style.left) + 5;
        splitter.style.left = offset + 'px';
        left.style.width = offset + 'px';
        right.style.width = (container.clientWidth - offset) + 'px';
        left.style.flex = offset + 'px';
        right.style.flex = (container.clientWidth - offset) + 'px';
        return
      }
      // if (target.getAttribute('id') == containerId) {
      //   splitter.style.left = event.layerX + 'px';
      //   left.style.width = event.layerX + 'px';
      //   right.style.width = (container.clientWidth - event.layerX) + 'px';
      // } else if (target.getAttribute('id') == splitterId ||
      //     target.getAttribute('id') == rightId ||
      //     target.getAttribute('id') == leftId) {
      //   let offsetLeft = parseInt(splitter.style.left);
      //   splitter.style.left = (offsetLeft + event.layerX) + 'px';
      //   left.style.width = (offsetLeft + event.layerX) + 'px';
      //   right.style.width = (container.clientWidth - (offsetLeft + event.layerX) - 10) + 'px';
      // } else {
      //   offsetLeftPrevious = event.layerX;
      //   splitter.style.left = event.layerX + 'px';
      //   left.style.width = event.layerX + 'px';
      //   right.style.width = (container.clientWidth - event.layerX) + 'px';
      // }
      // splitter.style.left = event.layerX + 'px';
      // left.style.width = event.layerX + 'px';
      // right.style.width = (container.clientWidth - event.layerX) + 'px';
    }
  });

};
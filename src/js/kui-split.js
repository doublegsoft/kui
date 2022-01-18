if (typeof split === 'undefined') split = {};

split.vertical = function(containerId, leftId, rightId, leftDefaultSize) {
  const SPLITTER_WIDTH = 10;
  const splitterId = "__split_splitterId";
  leftDefaultSize = (leftDefaultSize || 300)
  let container = dom.find(containerId);
  let splitter = document.createElement('a');
  splitter.setAttribute('id', splitterId);
  container.appendChild(splitter);
  // splitter.style.backgroundColor = '#cdcdcd';
  splitter.style.backgroundColor = 'var(--color-background)';
  splitter.style.position = 'absolute';
  splitter.style.width = SPLITTER_WIDTH + 'px';
  splitter.style.cursor = 'ew-resize';
  splitter.style.padding = '2px';
  splitter.style.zIndex = '3';
  splitter.style.color = 'white';
  splitter.style.display = 'flex';
  splitter.style.zIndex = '999';
  splitter.innerHTML = '<i class="fas fa-grip-lines-vertical m-auto"></i>';

  // disable scroll-y for container
  container.style.overflowY = 'hidden';

  let heightContainer = container.clientHeight;

  let left = dom.find(leftId);
  let right = dom.find(rightId);

  left.style.width = leftDefaultSize + 'px';
  left.style.flex = leftDefaultSize + 'px';
  right.style.width = container.clientWidth - leftDefaultSize - SPLITTER_WIDTH + 'px';
  right.style.flex = container.clientWidth - leftDefaultSize - SPLITTER_WIDTH + 'px';

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
        let offsetLeft = parseInt(splitter.style.left);
        splitter.style.left = (offsetLeft/* + event.layerX*/) + 'px';
        left.style.width = (offsetLeft/* + event.layerX*/) + 'px';
        left.style.flex = (offsetLeft/* + event.layerX*/) + 'px';
        right.style.width = (container.clientWidth - SPLITTER_WIDTH - (offsetLeft/* + event.layerX*/)) + 'px';
        right.style.flex = (container.clientWidth - SPLITTER_WIDTH - (offsetLeft/* + event.layerX*/)) + 'px';
        return;
      }
      let offset = 0;
      if (isUnderContainer(target, left)) {
        offset = parseInt(splitter.style.left) - 5;
        splitter.style.left = offset + 'px';
        left.style.width = offset + 'px';
        right.style.width = (container.clientWidth - offset - SPLITTER_WIDTH) + 'px';
        left.style.flex = offset + 'px';
        right.style.flex = (container.clientWidth - offset - SPLITTER_WIDTH) + 'px';
        return;
      }
      if (isUnderContainer(target, right)) {
        offset = parseInt(splitter.style.left) + 5;
        splitter.style.left = offset + 'px';
        left.style.width = offset + 'px';
        right.style.width = (container.clientWidth - offset - SPLITTER_WIDTH) + 'px';
        left.style.flex = offset + 'px';
        right.style.flex = (container.clientWidth - offset - SPLITTER_WIDTH) + 'px';
        return;
      }
    }
  });
  return splitter;
};

split.horizontal = function(containerId, topId, bottomId, topDefaultSize) {
  const splitterId = "__split_splitterId_" + topId.getAttribute('widget-id');
  topDefaultSize = (topDefaultSize || 300);
  let container = dom.find(containerId);
  let splitter = document.createElement('a');
  splitter.setAttribute('id', splitterId);
  container.appendChild(splitter);
  // splitter.style.backgroundColor = '#cdcdcd';
  splitter.style.backgroundColor = 'var(--color-background)';
  splitter.style.position = 'absolute';
  splitter.style.width = '100%';
  splitter.style.height = '10px';
  splitter.style.top = topDefaultSize + 'px';
  splitter.style.cursor = 'ns-resize';
  splitter.style.padding = '2px';
  splitter.style.zIndex = '3';
  splitter.style.color = 'white';
  splitter.style.display = 'flex';
  splitter.innerHTML = '<i class="fas fa-grip-lines position-relative m-auto" style="top: -4px;"></i>';

  // disable scroll-y for container
  container.style.overflowY = 'hidden';

  let heightContainer = container.clientHeight;

  let top = dom.find(topId);
  let bot = dom.find(bottomId);

  top.style.height = topDefaultSize + 'px';
  // top.style.flex = topDefaultSize + 'px';
  top.style.overflowY = 'auto';

  bot.style.height = (container.clientHeight - topDefaultSize - 10) + 'px';
  // bot.style.flex = (container.clientHeight - topDefaultSize - 10) + 'px';
  bot.style.overflowY = 'auto';

  let dragging = false;
  splitter.addEventListener('mousedown', function(event) {
    event.preventDefault();
    dragging = true;
    document.body.style.cursor = 'ns-resize';
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
      if (event.offsetY <= 0) return;
      if (event.offsetY >= this.clientHeight) return;
      let target = event.target;

      if (target.getAttribute('id') == splitterId) {
        let offsetTop = parseInt(splitter.style.top);
        splitter.style.top = (offsetTop/* + event.layerX*/) + 'px';
        top.style.height = (offsetTop/* + event.layerX*/) + 'px';
        top.style.flex = (offsetTop/* + event.layerX*/) + 'px';
        bot.style.height = (container.clientHeight - (offsetTop/* + event.layerX*/)) + 'px';
        bot.style.flex = (container.clientHeight - (offsetTop/* + event.layerX*/)) + 'px';
        return;
      }
      let offset = 0;
      if (isUnderContainer(target, top)) {
        offset = parseInt(splitter.style.top) - 10;
        splitter.style.top = offset + 'px';
        top.style.height = offset + 'px';
        bot.style.height = (container.clientHeight - offset) + 'px';
        top.style.flex = offset + 'px';
        bot.style.flex = (container.clientHeight - offset) + 'px';
        return;
      }
      if (isUnderContainer(target, bot)) {
        offset = parseInt(splitter.style.top) + 10;
        splitter.style.top = offset + 'px';
        top.style.height = offset + 'px';
        bot.style.height = (container.clientHeight - offset) + 'px';
        top.style.flex = offset + 'px';
        bot.style.flex = (container.clientHeight - offset) + 'px';
        return;
      }
    }
  });
  return splitter;
};
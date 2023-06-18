
function Storyboard(opt) {
  this.pages = opt.pages || [];
  this.scaling = opt.scaling !== false;
  this.home = null;
  this.drawedPages = [];

  const WIDTH = 100;
  const HEIGHT = 180;

  this.pages.forEach(page => {
    page.width = WIDTH;
    page.height = HEIGHT;
  });

  this.selectedPage = null;
  this.selectedPageoffsetV = -1;
  this.selectedPageoffsetH = -1;
}

Storyboard.prototype.buildGraph = function () {
  let layeredPages = [];

  let existings = {};
  let refs = {};
  for (let i = 0; i < this.pages.length; i++) {
    let page = this.pages[i];
    for (let j = 0; j < page.links.length; j++) {
      refs[page.links[j]] = {};
    }
  }
  // 未被任何其他页面引用的
  let pages = [];
  for (let i = 0; i < this.pages.length; i++) {
    let page = this.pages[i];
    if (!refs[page.id]) {
      existings[page.id]= page;
      pages.push(page);
    }
  }
  pages.sort((a, b) => {
    if (a.links.length > b.links.length) {
      return -1;
    }
    return 1;
  });
  layeredPages.push(pages);

  this.buildGraphLayer(1, layeredPages, existings);
  this.buildGraphLayer(2, layeredPages, existings);
  this.buildGraphLayer(3, layeredPages, existings);
  this.buildGraphLayer(4, layeredPages, existings);
  this.buildGraphLayer(5, layeredPages, existings);

  return layeredPages;
};

Storyboard.prototype.buildGraphLayer = function (layerNumber, layeredPages, existings) {
  if (layeredPages.length < layerNumber) return;
  let pages = [];
  for (let i = 0; i < layeredPages[layerNumber - 1].length; i++) {
    let page = layeredPages[layerNumber - 1][i]
    for (let j = 0; j < page.links.length; j++) {
      let found = this.getPage(page.links[j]);
      if (found != null && !existings[found.id]) {
        existings[found.id] = found;
        pages.push(found);
      }
    }
  }

  if (pages.length == 0) return;

  pages.sort((a, b) => {
    if (a.links.length > b.links.length) {
      return -1;
    }
    return 1;
  });
  layeredPages.push(pages);
};

Storyboard.prototype.render = function (containerId) {
  let container = dom.find(containerId);
  let rect = container.getBoundingClientRect();

  let canvas = document.createElement("canvas");

  this.width = rect.width;
  this.height = rect.height;
  this.context = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = this.width * dpr;
  canvas.height = this.height * dpr;
  container.appendChild(canvas);

  let ratio = Math.min(
    canvas.clientWidth / this.width,
    canvas.clientHeight / this.height
  );
  if (this.scaling === true) {
    this.context.scale(dpr, dpr);
  }

  let x = 20;
  let y = 30;
  const GUTTER = 60;
  const WIDTH = 100;
  const HEIGHT = 180;

  let layeredPages = this.buildGraph();
  for (let i = 0; i < layeredPages.length; i++) {
    for (let j = 0; j < layeredPages[i].length; j++) {
      let page = layeredPages[i][j];
      page.x = x + i * (WIDTH + GUTTER);
      page.y = y + j * (HEIGHT + GUTTER);
    }
  }

  this.redraw();
  this.bindEvents(canvas);
};

Storyboard.prototype.drawGrids = function() {
  let cellW = 10, cellH = 10;

  // vertical lines
  for (let x = 0; x <= this.width; x += cellW) {
    this.context.moveTo(x, 0); // x, y
    this.context.lineTo(x, this.height);
  }

  // horizontal lines
  for (let y = 0; y <= this.height; y += cellH) {
    this.context.moveTo(0, y); // x, y
    this.context.lineTo(this.width, y);
  }

  this.context.strokeStyle = "#dedede";
  this.context.stroke();
};

Storyboard.prototype.drawPage = function(page) {
  this.context.strokeStyle = '#eee';
  this.context.fillStyle = 'white';
  this.context.beginPath();
  this.context.rect(page.x, page.y, page.width, page.height);
  this.context.stroke();
  this.context.fill();

  if (page.screenshot) {
    if (!page.image) {
      page.image = new Image();
      page.image.src = page.screenshot;
      page.image.onload = () => {
        this.context.drawImage(page.image, page.x, page.y, page.width, (page.width / page.image.width) * page.image.height);
      };
    } else {
      this.context.drawImage(page.image, page.x, page.y, page.width, (page.width / page.image.width) * page.image.height);
    }
  }

  this.context.fillStyle = 'black';
  this.context.font = 'bold 10px 黑体';
  let metrics = this.context.measureText(page.title);
  this.context.fillText(page.title, page.x + (page.width - metrics.width) / 2, page.y - 8);
  this.context.stroke();

  this.drawedPages.push(page);
};

Storyboard.prototype.connect = function(startPage, finishPage) {
  if (!finishPage) return;

  let distTopBottom = startPage.y - (finishPage.y + finishPage.height);
  let distBottomTop = finishPage.y - (startPage.y + startPage.height);
  let distRightLeft = finishPage.x - (startPage.x + startPage.width);
  let distLeftRight = startPage.x - (finishPage.x + finishPage.width);

  let firstMidX = 0;
  let firstMidY = 0;
  let secondMidX = 0;
  let secondMidY = 0;
  let cp1;
  let cp2;

  let offsetH = 2.5;
  let offsetV = 7;

  if (distTopBottom > 0) {
    firstMidX = startPage.x + startPage.width / 2;
    firstMidY = startPage.y;
    secondMidX = finishPage.x + finishPage.width / 2;
    secondMidY = finishPage.y + finishPage.height;
    let distance = Math.abs(secondMidY - firstMidY);
    let ctrlDistance = distance / 2;
    cp1 = {
      x: firstMidX,
      y: firstMidY - ctrlDistance,
    };
    cp2 = {
      x: secondMidX,
      y: secondMidY + ctrlDistance,
    };
    this.connectionType = 'connectionTopBottom';
  }
  if (distBottomTop > 0) {
    firstMidX = startPage.x + startPage.width / 2;
    firstMidY = startPage.y + startPage.height;
    secondMidX = finishPage.x + finishPage.width / 2;
    secondMidY = finishPage.y;
    let distance = Math.abs(secondMidY - firstMidY);
    let ctrlDistance = distance / 2;
    cp1 = {
      x: firstMidX,
      y: firstMidY + ctrlDistance,
    };
    cp2 = {
      x: secondMidX,
      y: secondMidY - ctrlDistance,
    };
    this.connectionType = 'connectionBottomTop';
  }
  if (distRightLeft > 0) {
    firstMidX = startPage.x + startPage.width;
    firstMidY = startPage.y + startPage.height / 2;
    secondMidX = finishPage.x;
    secondMidY = finishPage.y + finishPage.height / 2;
    let distance = Math.abs(secondMidX - firstMidX);
    let ctrlDistance = distance / 2;
    cp1 = {
      x: firstMidX + ctrlDistance,
      y: firstMidY,
    };
    cp2 = {
      x: secondMidX - ctrlDistance,
      y: secondMidY,
    };
    this.connectionType = 'connectionRightLeft';
  }
  if (distLeftRight > 0) {
    firstMidX = startPage.x;
    firstMidY = startPage.y + startPage.height / 2;
    secondMidX = finishPage.x + finishPage.width;
    secondMidY = finishPage.y + finishPage.height / 2;
    let distance = Math.abs(secondMidX - firstMidX);
    let ctrlDistance = distance / 2;
    cp1 = {
      x: firstMidX - ctrlDistance,
      y: firstMidY,
    };
    cp2 = {
      x: secondMidX + ctrlDistance,
      y: secondMidY,
    };
    this.connectionType = 'connectionLeftRight';
  }

  if (!cp1) return;

  this.context.strokeStyle = '#aaa';
  this.context.fillStyle = '#aaa';
  this.context.beginPath();
  this.context.arc(firstMidX, firstMidY, 2, 0, 2 * Math.PI, false);
  this.context.fill();
  this.context.moveTo(firstMidX, firstMidY);
  if (this.connectionType === 'connectionTopBottom') {
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, secondMidX, secondMidY + offsetV);
  } else if (this.connectionType === 'connectionBottomTop') {
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, secondMidX, secondMidY - offsetV);
  } else if (this.connectionType === 'connectionRightLeft') {
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, secondMidX - offsetV, secondMidY);
  } else if (this.connectionType === 'connectionLeftRight') {
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, secondMidX + offsetV, secondMidY);
  }
  this.context.stroke();

  this.context.beginPath();

  if (this.connectionType === 'connectionTopBottom') {
    this.context.moveTo(secondMidX, secondMidY);
    this.context.lineTo(secondMidX + offsetH, secondMidY + offsetV);
    this.context.lineTo(secondMidX - offsetH, secondMidY + offsetV);
    this.context.moveTo(secondMidX, secondMidY);
  } else if (this.connectionType === 'connectionBottomTop') {
    this.context.moveTo(secondMidX, secondMidY);
    this.context.lineTo(secondMidX + offsetH, secondMidY - offsetV);
    this.context.lineTo(secondMidX - offsetH, secondMidY - offsetV);
    this.context.moveTo(secondMidX, secondMidY);
  } else if (this.connectionType === 'connectionRightLeft') {
    this.context.moveTo(secondMidX, secondMidY);
    this.context.lineTo(secondMidX - offsetV, secondMidY - offsetH);
    this.context.lineTo(secondMidX - offsetV, secondMidY + offsetH);
    this.context.moveTo(secondMidX, secondMidY);
  } else if (this.connectionType === 'connectionLeftRight') {
    this.context.moveTo(secondMidX, secondMidY);
    this.context.lineTo(secondMidX + offsetV, secondMidY - offsetH);
    this.context.lineTo(secondMidX + offsetV, secondMidY + offsetH);
    this.context.moveTo(secondMidX, secondMidY);
  }

  this.context.closePath();
  this.context.fill();
  this.context.stroke();
};

Storyboard.prototype.redraw = function () {
  this.context.clearRect(0, 0, this.width, this.height);

  this.drawGrids();

  for (let i = 0; i < this.pages.length; i++) {
    this.drawPage(this.pages[i]);
  }

  for (let i = 0; i < this.pages.length; i++) {
    let page = this.pages[i];
    for (let j = 0; j < page.links.length; j++) {
      let another = this.getPage(page.links[j]);
      this.connect(page, another);
    }
  }

};

Storyboard.prototype.getPage = function (id) {
  for (let i = 0; i < this.pages.length; i++) {
    if (this.pages[i].id === id) {
      return this.pages[i];
    }
  }
  return null;
};

Storyboard.prototype.findPageByCoords = function (x, y) {
  for (let i = 0; i < this.pages.length; i++) {
    let page = this.pages[i];
    if (x > page.x &&
        x < (page.x + page.width) &&
        y > page.y &&
        y < (page.y + page.height)) {
      return page;
    }
  }
  return null;
};

Storyboard.prototype.bindEvents = function (canvas) {
  canvas.onclick = ev => {
    let clickedX = ev.layerX;
    let clickedY = ev.layerY;
  };
  canvas.onmousedown = ev => {
    if (event.which == 1) {
      this.selectedPage = this.findPageByCoords(ev.layerX, ev.layerY);
      if (this.selectedPage != null) {
        this.selectedPageoffsetV = ev.layerX - this.selectedPage.x;
        this.selectedPageoffsetH = ev.layerY - this.selectedPage.y;
        canvas.style.cursor = 'move';
      }
    }
  };
  canvas.onmouseup = ev => {
    canvas.style.cursor = 'default';
    this.selectedPage = null;
  };
  canvas.onmousemove = ev => {
    if (this.selectedPage == null) return;
    if (ev.which != 1) return;
    let movedX = ev.layerX;
    let movedY = ev.layerY;
    this.selectedPage.x = movedX - this.selectedPageoffsetV;
    this.selectedPage.y = movedY - this.selectedPageoffsetH;
    this.redraw();
  };

  canvas.onwheel = ev => {
    for (let i = 0; i < this.pages.length; i++) {
      let page = this.pages[i];
      page.x += ev.wheelDeltaX / 5;
      page.y += ev.wheelDeltaY / 5;
    }
    this.redraw();
  }
};
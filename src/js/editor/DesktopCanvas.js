function DesktopCanvas(opts) {
  /*!
  ** 常量设置，和手机背景图片密切相关。
  */
  const DESKTOP_IMAGE_WIDTH = 2788;
  const DESKTOP_IMAGE_HEIGHT = 2300;
  const DESKTOP_SAFE_AREA_TOP_LEFT_X = 15;
  const DESKTOP_SAFE_AREA_TOP_LEFT_Y = 60;
  const DESKTOP_SAFE_AREA_TOP_RIGHT_X = 446;
  const DESKTOP_SAFE_AREA_TOP_RIGHT_Y = 60;
  const DESKTOP_SAFE_AREA_BOT_LEFT_X = 15;
  const DESKTOP_SAFE_AREA_BOT_LEFT_Y = 836;
  const DESKTOP_SAFE_AREA_BOT_RIGHT_X = 446;
  const DESKTOP_SAFE_AREA_BOT_RIGHT_Y = 836;
  const DESKTOP_TOP_BAR_LEFT_X = 60;
  const DESKTOP_TOP_BAR_LEFT_Y = 13;
  const DESKTOP_TOP_BAR_RIGHT_X = 398;
  const DESKTOP_TOP_BAR_RIGHT_Y = 13;

  const DESKTOP_BOT_BAR_LEFT_X = 60;
  const DESKTOP_BOT_BAR_LEFT_Y = 890;
  const DESKTOP_BOT_BAR_RIGHT_X = 398;
  const DESKTOP_BOT_BAR_RIGHT_Y = 890;

  const DESKTOP_IMAGE_ASPECT_RATIO = DESKTOP_IMAGE_WIDTH / DESKTOP_IMAGE_HEIGHT;

  /*!
  ** 背景色，明亮模式和暗黑模式。
  */
  this.background = opts.background || 'white';
  this.skeletonBackground = 'rgba(0,0,0,0.17)';
  this.skeletonStroke = 'rgba(235,235,235)';
  this.propertiesEditor = opts.propertiesEditor;
  this.onSelectedElement = opts.onSelectedElement;
  /*!
  ** 用户设置的宽度。
  */
  this.width = opts.width || 960;
  this.height = this.width / DESKTOP_IMAGE_ASPECT_RATIO;
  this.wheelDeltaY = 0;

  /*!
  ** 背景图片和绘图区域的实际比例。
  */
  this.scaleRatio = this.width / DESKTOP_IMAGE_WIDTH;

  /*!
  ** 已经画上的元素。
  */
  this.drawnElements = [];
  this.images = {};
  this.mode = opts.mode || 'design';

  this.safeAreaTopLeftX = DESKTOP_SAFE_AREA_TOP_LEFT_X * this.scaleRatio;
  this.safeAreaTopLeftY = DESKTOP_SAFE_AREA_TOP_LEFT_Y * this.scaleRatio;
  this.safeAreaTopRightX = DESKTOP_SAFE_AREA_TOP_RIGHT_X * this.scaleRatio;
  this.safeAreaTopRightY = DESKTOP_SAFE_AREA_TOP_RIGHT_Y * this.scaleRatio;
  this.safeAreaBotLeftX = DESKTOP_SAFE_AREA_BOT_LEFT_X * this.scaleRatio;
  this.safeAreaBotLeftY = DESKTOP_SAFE_AREA_BOT_LEFT_Y * this.scaleRatio;
  this.safeAreaBotRightX = DESKTOP_SAFE_AREA_BOT_RIGHT_X * this.scaleRatio;
  this.safeAreaBotRightY = DESKTOP_SAFE_AREA_BOT_RIGHT_Y * this.scaleRatio;
  this.safeAreaWidth = this.safeAreaTopRightX - this.safeAreaTopLeftX;
  this.safeAreaHeight = this.safeAreaBotLeftY - this.safeAreaTopLeftY;

  this.topBarLeftX = DESKTOP_TOP_BAR_LEFT_X * this.scaleRatio;
  this.topBarLeftY = DESKTOP_TOP_BAR_LEFT_Y * this.scaleRatio;
  this.topBarRightX = DESKTOP_TOP_BAR_RIGHT_X * this.scaleRatio;
  this.topBarRightY = DESKTOP_TOP_BAR_RIGHT_Y * this.scaleRatio;

  this.botBarLeftX = DESKTOP_BOT_BAR_LEFT_X * this.scaleRatio;
  this.botBarLeftY = DESKTOP_BOT_BAR_LEFT_Y * this.scaleRatio;
  this.botBarRightX = DESKTOP_BOT_BAR_RIGHT_X * this.scaleRatio;
  this.botBarRightY = DESKTOP_BOT_BAR_RIGHT_Y * this.scaleRatio;

  this.safeAreaWidth = this.safeAreaTopRightX - this.safeAreaTopLeftX;
  this.safeAreaHeight = this.safeAreaBotRightY - this.safeAreaTopRightY;

  this.paddingLeft = 12 * this.scaleRatio;
  this.paddingRight = 12 * this.scaleRatio;
}

DesktopCanvas.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
  this.canvas = document.createElement('canvas');
  this.canvas.style.width = this.width + 'px';
  this.canvas.style.height = this.height + 'px';

  let dpr = window.devicePixelRatio || 1;
  this.canvas.width = this.width * dpr;
  this.canvas.height = this.height * dpr;
  this.context = this.canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  this.context.scale(dpr, dpr);
  this.backgroundImage = new Image(); // Create new img element
  this.backgroundImage.addEventListener("load", () => {
    this.redraw();
  }, false);
  this.backgroundImage.src = "/img/emulator/iMac.png";

  this.container.appendChild(this.canvas);

  this.initialize();
};

DesktopCanvas.prototype.restore = function () {
  let oldWheelDeltaY = this.wheelDeltaY;
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    el.y -= oldWheelDeltaY;
  }
  this.wheelDeltaY = 0;

  this.redraw();
};

DesktopCanvas.prototype.redraw = function () {
  this.context.clearRect(0, 0, this.width, this.height);

  this.buildSafeArea();

  // zero-y line
  this.context.beginPath();
  this.context.strokeStyle = 'rgba(0,0,0,0.17)';
  this.context.setLineDash([10, 10]);
  this.context.lineWidth = 3;
  this.context.moveTo(
    this.safeAreaBotLeftX,
    this.topBarLeftY + this.wheelDeltaY,
  );
  this.context.lineTo(
    this.safeAreaBotRightX,
    this.topBarLeftY + this.wheelDeltaY,
  );
  this.context.stroke();
  this.context.closePath();

  for (let i = 0; i < this.drawnElements.length; i++) {
    this.drawElement(this.drawnElements[i]);
  }

  this.buildOuter();

  // background image
  this.context.drawImage(this.backgroundImage,
    0, 0,
    this.backgroundImage.naturalWidth, this.backgroundImage.naturalHeight,
    0, 0,
    this.width, this.height);
};

/*!
** 初始渲染安全区域。
*/
DesktopCanvas.prototype.buildSafeArea = function () {
  this.context.fillStyle = this.background;
  this.context.fillRect(this.safeAreaTopLeftX, this.safeAreaTopLeftY, this.safeAreaWidth, this.safeAreaHeight);
};

/*!
** 初始渲染安全区域上方。
*/
DesktopCanvas.prototype.buildTopBar = function () {
  this.context.beginPath();
  this.context.fillStyle = this.background;
  this.context.strokeStyle = this.background;
  this.context.moveTo(this.safeAreaTopLeftX, this.safeAreaTopLeftY);
  // this.context.arcTo(0, 0, this.topBarLeftX, this.topBarLeftY, 30);
  this.context.fillStyle = 'black';
  this.context.arc(this.safeAreaTopLeftX + 35, this.safeAreaTopLeftY, 35, Math.PI, Math.PI * 1.5);
  // this.context.lineTo(this.topBarRightX, this.topBarRightY);
  // this.context.arcTo(this.width, 0, this.safeAreaBotRightX, this.safeAreaTopRightY, 30);
  // this.context.lineTo(this.safeAreaTopRightX, this.safeAreaTopRightY + 1 /* there is a bug what i have no idea*/);
  // this.context.lineTo(this.safeAreaTopLeftX, this.safeAreaTopLeftY + 1 /* there is a bug what i have no idea*/);
  this.context.fill();
  this.context.closePath();
};

DesktopCanvas.prototype.buildOuter = function () {

  this.context.beginPath();
  this.context.strokeStyle = 'white';
  this.context.lineWidth = 8;
  this.context.moveTo(0, 0);
  this.context.lineTo(0, this.height);
  this.context.stroke();

  this.context.moveTo(this.width, 0);
  this.context.lineTo(this.width, this.height);
  this.context.stroke();
  this.context.closePath();

  // top-left
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(75, 75, 75, Math.PI, Math.PI * 1.5);
  this.context.lineTo(0, 0);
  this.context.fill();
  this.context.closePath();

  // top-right
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(this.width - 75, 75, 75, Math.PI * 1.5, Math.PI * 2);
  this.context.lineTo(this.width, 0);
  this.context.fill();
  this.context.closePath();

  // bottom-left
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(75, this.height - 75, 75, Math.PI / 2, Math.PI);
  this.context.lineTo(0, this.height);
  this.context.fill();
  this.context.closePath();

  // bottom-right
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(this.width - 75, this.height - 75, 75, 0, Math.PI / 2);
  this.context.lineTo(this.width, this.height);
  this.context.fill();
  this.context.closePath();

  // bottom-right

};

/*!
** 初始渲染安全区域下方。
*/
DesktopCanvas.prototype.buildBotBar = function () {
  this.context.beginPath();
  this.context.fillStyle = this.background;
  this.context.strokeStyle = this.background;
  this.context.moveTo(this.safeAreaBotLeftX, this.safeAreaBotLeftY);
  this.context.arcTo(0, this.height, this.botBarLeftX, this.botBarLeftY, 30);
  this.context.lineTo(this.botBarRightX, this.botBarRightY);
  this.context.arcTo(this.width - 10, this.height - 10, this.safeAreaBotRightX, this.safeAreaTopRightY, 30);
  this.context.lineTo(this.safeAreaBotRightX, this.safeAreaBotRightY - 1);
  this.context.lineTo(this.safeAreaBotLeftX, this.safeAreaBotLeftY - 1);
  this.context.fill();
  this.context.closePath();
};

/*!
** 初始化设置。
*/
DesktopCanvas.prototype.initialize = function () {
  dnd.setDroppable(this.canvas, (x, y, data) => {
    if (this.mode == 'simulate') return;
    this.drawNewElement(x, y, data);
  });

  dom.bind(this.canvas, 'mousedown', ev => {
    if (this.mode == 'simulate') return;
    let found = this.findElementByXY(ev.layerX - this.canvas.offsetLeft, ev.layerY - this.canvas.offsetTop);
    this.clearSelected();
    if (found != null) {
      this.canvas.style.cursor = 'move';
      let ox = ev.layerX - this.canvas.offsetLeft;
      let oy = ev.layerY - this.canvas.offsetTop;
      found.selected = true;
      this.movingElement = found;
      this.movingOffsetX = ox - found.x;
      this.movingOffsetY = oy - found.y;
      this.redraw();
      if (this.propertiesEditor) {
        this.propertiesEditor.render(this.getElementProperties(this.movingElement));
      }
      if (this.onSelectedElement) {
        this.onSelectedElement(this.movingElement);
      }
    } else {
      this.propertiesEditor.render({groups: []});
      for (let i = 0; i < this.drawnElements.length; i++) {
        this.drawnElements[i].selected = false;
      }
      this.redraw();
    }
  });
  dom.bind(this.canvas, 'mouseup', ev => {
    if (this.mode == 'simulate') return;
    this.canvas.style.cursor = 'default';
    this.movingElement = null;
  });
  dom.bind(this.canvas, 'mousemove', ev => {
    if (this.mode == 'simulate') return;
    if (this.movingElement != null) {
      let ox = ev.layerX - this.canvas.offsetLeft;
      let oy = ev.layerY - this.canvas.offsetTop;
      this.movingElement.x = ox - this.movingOffsetX;
      this.movingElement.y = oy - this.movingOffsetY;
      this.movingElement.rx = (this.movingElement.x - this.safeAreaTopLeftX) / this.scaleRatio;
      this.movingElement.ry = (this.movingElement.y - this.wheelDeltaY - this.topBarLeftY) / this.scaleRatio;
      if (this.propertiesEditor) {
        this.propertiesEditor.render(this.getElementProperties(this.movingElement));
      }
      this.redraw();
    }
  });
  dom.bind(this.canvas, 'wheel', ev => {
    // 所有元素都在顶部
    let areAllOverTop = true;
    for (let i = 0; i < this.drawnElements.length; i++) {
      let el = this.drawnElements[i];
      if ((el.y + el.h) > 0) {
        areAllOverTop = false;
        break;
      }
    }
    if (areAllOverTop === true && ev.wheelDeltaY < 0) return;

    let areAllUnderBottom = true;
    for (let i = 0; i < this.drawnElements.length; i++) {
      let el = this.drawnElements[i];
      if (el.y < this.height) {
        areAllUnderBottom = false;
        break;
      }
    }
    if (areAllUnderBottom === true && ev.wheelDeltaY > 0) return;

    for (let i = 0; i < this.drawnElements.length; i++) {
      let el = this.drawnElements[i];
      // el.x += ev.wheelDeltaX / 5;
      el.y += ev.wheelDeltaY / 5;
    }
    this.wheelDeltaY += ev.wheelDeltaY / 5;
    this.redraw();
  });
};

DesktopCanvas.prototype.drawParagraph = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.beginPath();
  let startX = el.x;
  let startY = el.y;
  for (let i = 0; i < 4; i++) {
    this.context.fillRect(startX, startY, el.w, 20);
    startY += 28;
  }
  this.context.fillRect(startX, startY, el.w * 0.68, 20);
  this.context.closePath();
};

DesktopCanvas.prototype.drawImage = function (el) {
  if (el.url) {
    let img = this.images[el.url];
    if (img == null) {
      img = new Image();
      img.addEventListener("load", () => {
        this.context.drawImage(img, el.x, el.y, el.w, el.h);
      }, false);
      img.src = el.url;
      this.images[el.url] = img;
    } else {
      this.context.drawImage(img, el.x, el.y, el.w, el.h);
    }
  } else {
    this.drawImageSkeleton(el);
  }
};

DesktopCanvas.prototype.drawImageSkeleton = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
  let iw = 0;
  if (el.w > el.h)
    iw = el.h * 0.80;
  else
    iw = el.w * 0.80;

  let ih = iw * 0.68;

  let x = el.x + (el.w - iw) / 2;
  let y = el.y + (el.h - ih) / 2;

  const lw = 8;
  this.context.beginPath();
  this.context.lineWidth = 8;
  this.context.setLineDash([]);
  this.context.strokeStyle = this.skeletonStroke;
  this.context.moveTo(x, y);
  this.context.lineTo(x + iw, y);
  this.context.lineTo(x + iw, y + ih);
  this.context.lineTo(x, y + ih);
  this.context.lineTo(x, y - lw / 2);
  this.context.stroke();
  this.context.closePath();

  this.context.fillStyle = this.skeletonStroke;
  // SUN
  this.context.beginPath();
  let cx = x + iw / 4;
  let cy = y + ih / 3;
  this.context.arc(cx, cy, ih / 6, 0, 2 * Math.PI);
  this.context.fill();
  this.context.closePath();

  // HILLS
  this.context.beginPath();
  let hx = x + iw / 4 - ih / 6;
  let hy = y + ih - lw * 1.5;
  let hw = iw / 4;
  let hh = ih / 3;
  this.context.moveTo(hx, hy);
  this.context.lineTo(hx + hw, hy - hh);
  this.context.lineTo(hx + hw * 2, hy);
  this.context.lineTo(hx, hy);
  this.context.fill();

  hx = x + iw / 4;
  hy = y + ih - lw * 1.5;
  hw = iw / 3;
  hh = ih / 2;
  this.context.moveTo(hx, hy);
  this.context.lineTo(hx + hw, hy - hh);
  this.context.lineTo(hx + hw * 2, hy);
  this.context.lineTo(hx, hy);
  this.context.fill();
  this.context.closePath();
};

DesktopCanvas.prototype.drawAvatar = function (el) {
  this.context.fillStyle = this.skeletonBackground;

  let cx = el.x + el.w / 2;
  let cy = el.y + el.w / 2;

  this.context.beginPath();
  this.context.arc(cx, cy, el.w / 2, 0, 2 * Math.PI);
  this.context.fill();
  this.context.closePath();
};

DesktopCanvas.prototype.drawText = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
};

DesktopCanvas.prototype.drawBlock = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
};

DesktopCanvas.prototype.drawElement = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  if (el.type == 'title') {
    if (!el.w) {
      el.rw = 120;
      el.rh = 32;
      el.w = el.rw * this.scaleRatio;
      el.h = el.rh * this.scaleRatio;
    }
    this.drawText(el);
  } else if (el.type == 'paragraph') {
    el.w = el.w || this.safeAreaWidth;
    el.h = 132;
    el.rw = el.w / this.scaleRatio;
    el.rh = el.h / this.scaleRatio;
    this.drawParagraph(el);
  } else if (el.type == 'block') {
    if (!el.w) {
      el.w = el.h = 60;
      el.rw = el.w / this.scaleRatio;
      el.rh = el.h / this.scaleRatio;
    }
    this.drawBlock(el);
  } else if (el.type == 'image') {
    el.w = el.w || this.safeAreaWidth;
    el.h = 120;
    el.rw = el.w / this.scaleRatio;
    el.rh = el.h / this.scaleRatio;
    this.drawImage(el);
  } else if (el.type == 'avatar') {
    if (!el.w) {
      el.w = el.h = 60;
      el.rw = el.w / this.scaleRatio;
      el.rh = el.h / this.scaleRatio;
    }
    this.drawAvatar(el);
  }
  if (el.selected === true) {
    let lw = 2;
    this.context.beginPath();
    this.context.strokeStyle = '#39f';
    this.context.setLineDash([]);
    this.context.lineWidth = lw;
    let x = el.x + lw, y = el.y + lw / 2, w = el.w - lw * 2, h = el.h - lw;
    this.context.moveTo(x, y);
    this.context.lineTo(x + w, y);
    this.context.lineTo(x + w, y + h);
    this.context.lineTo(x, y + h);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.context.closePath();
  }
};

DesktopCanvas.prototype.drawNewElement = function (x, y, data, translated/*坐标是否已经转换*/) {
  translated = translated === true;
  let el;
  if (!translated) {
    // 通过拖拽实际Canvas的坐标
    let ox = x;
    let oy = y;
    if (DesktopCanvas.offsetX) {
      ox -= DesktopCanvas.offsetX;
    }
    if (DesktopCanvas.offsetY) {
      oy -= DesktopCanvas.offsetY;
    }

    el = {
      x: ox, y: oy, ...data,
      rx: (ox - this.safeAreaTopLeftX) / this.scaleRatio,
      ry: (oy - this.wheelDeltaY - this.topBarLeftY) / this.scaleRatio,
    };
  } else {
    // 用户通过参数传入的用户可读的坐标
    let rx = x;
    let ry = y;

    x = rx * this.scaleRatio + this.safeAreaTopLeftX;
    y = ry * this.scaleRatio + this.topBarLeftY;
    el = {
      x: x, y: y, ...data,
      rx: rx,
      ry: ry,
    };
  }

  this.drawnElements.push(el);

  // 保证图层的顺序，必须重绘
  this.redraw();
};

DesktopCanvas.prototype.findElementByXY = function (x, y) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (x > el.x && x < el.x + el.w && y > el.y && y < el.y + el.h) {
      return el;
    }
  }
  return null;
};

DesktopCanvas.prototype.findElementById = function (id) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.id === id) {
      return el;
    }
  }
  return null;
};

DesktopCanvas.prototype.findTopmostElement = function () {
  let minY = 100000;
  let ret = null;
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.y < minY) {
      ret = el;
      minY = el.y;
    }
  }
  return ret;
};

DesktopCanvas.prototype.clearSelected = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    this.drawnElements[i].selected = false;
  }
};

DesktopCanvas.prototype.removeElement = function () {
  let found = -1;
  for (let i = 0; i < this.drawnElements.length; i++) {
    if (this.drawnElements[i].selected === true) {
      found = i;
      break;
    }
  }
  if (found == -1) return;
  this.drawnElements.splice(found, 1);
  this.redraw();
};

DesktopCanvas.prototype.switchMode = function () {
  if (this.mode == 'design') {
    this.mode = 'simulate';
    this.clearSelected();
    this.redraw();
  } else {
    this.mode = 'design';
  }
};

DesktopCanvas.prototype.changeElement = function (prop) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected === true) {
      for (let key in prop) {
        if (key === 'rx') {
          el.x = (parseInt(prop[key]) * this.scaleRatio + this.safeAreaTopLeftX) ;
        } else if (key === 'ry') {
          el.y = (parseInt(prop[key]) * this.scaleRatio + this.topBarLeftY + this.wheelDeltaY);
        } else if (key === 'rw') {
          el.w = parseInt(prop[key]) * this.scaleRatio;
        } else if (key === 'rh') {
          el.h = parseInt(prop[key]) * this.scaleRatio;
        }
        el[key] = prop[key];
      }
      this.redraw();
      break;
    }
  }
};

DesktopCanvas.prototype.clear = function () {
  this.drawnElements = [];
  this.redraw();
};

DesktopCanvas.prototype.getElementProperties = function (el) {
  let ret = {
    groups: [{
      title: '位置',
      properties: [{
        title: 'X',
        name: 'rx',
        input: 'number',
        value: el.rx,
      },{
        title: 'Y',
        name: 'ry',
        input: 'number',
        value: el.ry,
      },{
        title: '宽度',
        name: 'rw',
        input: 'number',
        value: el.rw,
      },{
        title: '高度',
        name: 'rh',
        input: 'number',
        value: el.rh,
      }]
    },{
      title: '其他',
      properties: [{
        title: '备注',
        name: 'note',
        input: 'longtext',
      }],
    }]
  };
  return ret;
};
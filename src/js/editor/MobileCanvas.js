function MobileCanvas(opts) {
  /*!
  ** 常量设置，和手机背景图片密切相关。
  */
  const MOBILE_AREA_ASPECT_RATIO = 1284 / 2778;
  const MOBILE_IMAGE_WIDTH = 462;
  const MOBILE_IMAGE_HEIGHT = 900;
  const MOBILE_SAFE_AREA_TOP_LEFT_X = 15;
  const MOBILE_SAFE_AREA_TOP_LEFT_Y = 60;
  const MOBILE_SAFE_AREA_TOP_RIGHT_X = 446;
  const MOBILE_SAFE_AREA_TOP_RIGHT_Y = 60;
  const MOBILE_SAFE_AREA_BOT_LEFT_X = 15;
  const MOBILE_SAFE_AREA_BOT_LEFT_Y = 836;
  const MOBILE_SAFE_AREA_BOT_RIGHT_X = 446;
  const MOBILE_SAFE_AREA_BOT_RIGHT_Y = 836;
  const MOBILE_TOP_BAR_LEFT_X = 60;
  const MOBILE_TOP_BAR_LEFT_Y = 13;
  const MOBILE_TOP_BAR_RIGHT_X = 398;
  const MOBILE_TOP_BAR_RIGHT_Y = 13;

  const MOBILE_BOT_BAR_LEFT_X = 60;
  const MOBILE_BOT_BAR_LEFT_Y = 890;
  const MOBILE_BOT_BAR_RIGHT_X = 398;
  const MOBILE_BOT_BAR_RIGHT_Y = 890;

  const MOBILE_IMAGE_ASPECT_RATIO = MOBILE_IMAGE_WIDTH / MOBILE_IMAGE_HEIGHT;

  /*!
  ** 背景色，明亮模式和暗黑模式。
  */
  this.background = opts.background || 'white';
  this.skeletonBackground = 'rgba(0,0,0,0.17)';
  this.skeletonStroke = 'rgba(235,235,235)';
  this.propertiesEditor = opts.propertiesEditor;
  this.onSelectedElement = opts.onSelectedElement;

  this.contextMenu = dom.element(`
    <div class="context-menu" style="display: none;">
      <div class="context-menu-options">
        <div class="context-menu-option" widget-id="buttonCopy">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">content_copy</i>
          <span>复制</span>
        </div>
        <div class="context-menu-option" widget-id="buttonPaste">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">content_paste</i>
          <span>粘贴</span>
        </div>
      </div>
      <div style="border-bottom: 2px solid rgba(196,196,196,1);"></div>
      <div class="context-menu-options">
        <div class="context-menu-option" widget-id="buttonAlignLeft">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">format_align_left</i>
          <span>居左对齐</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignCenter">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">format_align_center</i>
          <span>居中对齐</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignRight">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">format_align_right</i>
          <span>居右对齐</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignJustify">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">format_align_justify</i>
          <span>两端对齐</span>
        </div>
      </div>
      <div style="border-bottom: 2px solid rgba(196,196,196,1);"></div>
      <div class="context-menu-options">
<!--        <div class="context-menu-option" widget-id="buttonAlignVerticalSpace">-->
<!--          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">align_space_even</i>-->
<!--          <span>上下间距</span>-->
<!--        </div>-->
        <div class="context-menu-option" widget-id="buttonAlignHorizontalSpace">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">align_justify_space_even</i>
          <span>左右间距</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignTop">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">align_start</i>
          <span>顶端对齐</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignBottom">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">align_end</i>
          <span>底端对齐</span>
        </div>
      </div>
      <div style="border-bottom: 2px solid rgba(196,196,196,1);"></div>
      <div class="context-menu-options">
        <div class="context-menu-option text-danger font-bold" widget-id="buttonRemove">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">delete</i>
          <span>删除</span>
        </div>
      </div>
    </div>
  `);
  dom.init(this, this.contextMenu);
  dom.bind(this.buttonCopy,  'click', async ev => {
    this.copyElements();
  });
  dom.bind(this.buttonPaste,  'click', ev => {
    this.pasteElements();
  });

  dom.bind(this.buttonAlignLeft,  'click', ev => {
    this.alignLeft();
  });
  dom.bind(this.buttonAlignCenter,  'click', ev => {
    this.alignCenter();
  });
  dom.bind(this.buttonAlignRight,  'click', ev => {
    this.alignRight();
  });
  dom.bind(this.buttonAlignJustify,  'click', ev => {
    this.alignJustify();
  });
  dom.bind(this.buttonAlignVerticalSpace,  'click', ev => {
    this.alignVerticalSpace();
  });
  dom.bind(this.buttonAlignHorizontalSpace,  'click', ev => {
    this.alignHorizontalSpace();
  });
  dom.bind(this.buttonAlignTop,  'click', ev => {
    this.alignTop();
  });
  dom.bind(this.buttonAlignBottom,  'click', ev => {
    this.alignBottom();
  });
  dom.bind(this.buttonRemove, 'click', ev => {
    this.removeElements();
  });

  /*!
  ** 用户设置的宽度。
  */
  this.width = opts.width || 360;
  this.height = this.width / MOBILE_IMAGE_ASPECT_RATIO;
  this.wheelDeltaY = 0;

  /*!
  ** 背景图片和绘图区域的实际比例。
  */
  this.scaleRatio = this.width / MOBILE_IMAGE_WIDTH;

  /*!
  ** 已经画上的元素。
  */
  this.drawnElements = [];
  this.images = {};
  this.mode = opts.mode || 'design';

  this.safeAreaTopLeftX = MOBILE_SAFE_AREA_TOP_LEFT_X * this.scaleRatio;
  this.safeAreaTopLeftY = MOBILE_SAFE_AREA_TOP_LEFT_Y * this.scaleRatio;
  this.safeAreaTopRightX = MOBILE_SAFE_AREA_TOP_RIGHT_X * this.scaleRatio;
  this.safeAreaTopRightY = MOBILE_SAFE_AREA_TOP_RIGHT_Y * this.scaleRatio;
  this.safeAreaBotLeftX = MOBILE_SAFE_AREA_BOT_LEFT_X * this.scaleRatio;
  this.safeAreaBotLeftY = MOBILE_SAFE_AREA_BOT_LEFT_Y * this.scaleRatio;
  this.safeAreaBotRightX = MOBILE_SAFE_AREA_BOT_RIGHT_X * this.scaleRatio;
  this.safeAreaBotRightY = MOBILE_SAFE_AREA_BOT_RIGHT_Y * this.scaleRatio;
  this.safeAreaWidth = this.safeAreaTopRightX - this.safeAreaTopLeftX;
  this.safeAreaHeight = this.safeAreaBotLeftY - this.safeAreaTopLeftY;

  this.topBarLeftX = MOBILE_TOP_BAR_LEFT_X * this.scaleRatio;
  this.topBarLeftY = MOBILE_TOP_BAR_LEFT_Y * this.scaleRatio;
  this.topBarRightX = MOBILE_TOP_BAR_RIGHT_X * this.scaleRatio;
  this.topBarRightY = MOBILE_TOP_BAR_RIGHT_Y * this.scaleRatio;

  this.botBarLeftX = MOBILE_BOT_BAR_LEFT_X * this.scaleRatio;
  this.botBarLeftY = MOBILE_BOT_BAR_LEFT_Y * this.scaleRatio;
  this.botBarRightX = MOBILE_BOT_BAR_RIGHT_X * this.scaleRatio;
  this.botBarRightY = MOBILE_BOT_BAR_RIGHT_Y * this.scaleRatio;

  this.paddingLeft = 12 * this.scaleRatio;
  this.paddingRight = 12 * this.scaleRatio;
}

MobileCanvas.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
  this.container.appendChild(this.contextMenu);
  /*!
  ** 容器的鼠标点击，同样释放画布的事件，通常用于拖拽等鼠标操作。
  */
  dom.bind(this.container, 'mouseup', ev => {
    ev.stopPropagation();
    const mouseup = new Event("mouseup");
    this.canvas.dispatchEvent(mouseup);
  });
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
  this.backgroundImage.src = "/img/emulator/iphone-bg.png";

  this.container.appendChild(this.canvas);

  this.initialize();
};

MobileCanvas.prototype.restore = function () {
  let oldWheelDeltaY = this.wheelDeltaY;
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    el.y -= oldWheelDeltaY;
  }
  this.wheelDeltaY = 0;

  this.redraw();
};

MobileCanvas.prototype.redraw = function () {
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
    let el = this.drawnElements[i];
    this.drawElement(el);
    /*!
    ** 在此属性值调整
    */
    if (el.selected === true) {
      this.propertiesEditor.render(this.getElementProperties(el));
    }
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
MobileCanvas.prototype.buildSafeArea = function () {
  this.context.fillStyle = this.background;
  this.context.fillRect(this.safeAreaTopLeftX, this.safeAreaTopLeftY, this.safeAreaWidth, this.safeAreaHeight);
};

MobileCanvas.prototype.buildOuter = function () {

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
};

/*!
** 初始化设置。
*/
MobileCanvas.prototype.initialize = function () {
  dnd.setDroppable(this.canvas, (x, y, data) => {
    if (this.mode == 'simulate') return;
    this.drawNewElement(x, y, data);
  });

  this.canvas.addEventListener('contextmenu', ev => {
    ev.preventDefault();
    if (this.mode == 'simulate') return;
    let ox = ev.layerX - this.canvas.offsetLeft;
    let oy = ev.layerY - this.canvas.offsetTop;
    this.contextX = ox;
    this.contextY = oy;
    let found = this.findElementByXY(ox, oy);
    if (found != null) {
      // this.clearSelected();
      found.selected = true;
      this.redraw();
    }
    this.contextMenu.style.display = '';
    this.contextMenu.style.left = (ev.layerX + 5) + 'px';
    this.contextMenu.style.top = (ev.layerY + 5) + 'px';
  });

  dom.bind(this.canvas, 'mousedown', ev => {
    if (ev.which == 3 && ev.button == 2) return;
    /*!
    ** 模拟模式忽略。
    */
    if (this.mode == 'simulate') return;
    let isShift = !!ev.shiftKey;
    let found = this.findElementByXY(ev.layerX - this.canvas.offsetLeft, ev.layerY - this.canvas.offsetTop);
    /*!
    ** 没按住Shift键，就是单选。
    */
    if (!isShift) {
      this.clearSelected();
    }
    if (found != null) {
      found.selected = true;
      let ox = ev.layerX - this.canvas.offsetLeft;
      let oy = ev.layerY - this.canvas.offsetTop;
      if (this.canvas.style.cursor == 'w-resize' ||
          this.canvas.style.cursor == 'e-resize' ||
          this.canvas.style.cursor == 'n-resize' ||
          this.canvas.style.cursor == 's-resize') {
        this.resizingElement = found;
        this.resizingOffsetX = ox - found.x;
        this.resizingOffsetY = oy - found.y;
        this.resizingLeft = this.resizingElement.x;
        this.resizingRight = this.resizingElement.x + this.resizingElement.w;
        this.resizingTop = this.resizingElement.y;
        this.resizingBottom = this.resizingElement.y + this.resizingElement.h;
      } else {
        this.canvas.style.cursor = 'move';
        this.movingElement = found;
        this.movingOffsetX = ox - found.x;
        this.movingOffsetY = oy - found.y;

        // if (this.propertiesEditor) {
        //   this.propertiesEditor.render(this.getElementProperties(this.movingElement));
        // }
        if (this.onSelectedElement) {
          this.onSelectedElement(this.movingElement);
        }
      }
      this.redraw();
    } else {
      this.propertiesEditor.render({groups: []});
      for (let i = 0; i < this.drawnElements.length; i++) {
        this.drawnElements[i].selected = false;
      }
      this.redraw();
    }
  });

  dom.bind(this.canvas, 'mouseup', ev => {
    ev.stopPropagation();
    if (this.mode == 'simulate') return;
    this.canvas.style.cursor = 'default';
    this.movingElement = null;
    this.resizingElement = null;
    if (ev.which == 3 && ev.button == 2) return;
    this.contextMenu.style.display = 'none';
  });
  dom.bind(this.canvas, 'mousemove', ev => {
    if (this.mode == 'simulate') return;
    /*!
    ** 移动所选的对象。
    */
    let ox = ev.layerX - this.canvas.offsetLeft;
    let oy = ev.layerY - this.canvas.offsetTop;
    if (this.movingElement) {
      this.resizingElement = null;
      this.moveElement(this.movingElement, ox, oy);
    } else if (this.resizingElement) {
      this.movingElement = null;
      /*!
      ** 改变对象的大小。
      */
      if (this.canvas.style.cursor == 'w-resize') {
        this.resizeElementToWest(this.resizingElement, ox, oy);
      } else if (this.canvas.style.cursor == 'e-resize') {
        this.resizeElementToEast(this.resizingElement, ox, oy);
      } else if (this.canvas.style.cursor == 'n-resize') {
        this.resizeElementToNorth(this.resizingElement, ox, oy);
      } else if (this.canvas.style.cursor == 's-resize') {
        this.resizeElementToSouth(this.resizingElement, ox, oy);
      }

    } else {
      this.switchElementCursor(ev.layerX - this.canvas.offsetLeft, ev.layerY - this.canvas.offsetTop);
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

MobileCanvas.prototype.switchElementCursor = function (x, y) {
  const THRESHOLD = 5;
  this.canvas.style.cursor = 'default';
  let found = this.findElementByXY(x, y);
  if (found == null) {
    return;
  }
  for (let i = 0; i < this.drawnElements.length; i++) {

    let el = this.drawnElements[i];
    if ((y - el.y) <= THRESHOLD && (y - el.y) > 0) {
      this.canvas.style.cursor = 'n-resize';
    }
    if ((el.y + el.h - y) <= THRESHOLD && (el.y + el.h - y) > 0) {
      this.canvas.style.cursor = 's-resize';
    }
    if ((x - el.x) <= THRESHOLD && (x - el.x) > 0) {
      this.canvas.style.cursor = 'w-resize';
    }
    if ((el.x + el.w - x) <= THRESHOLD && (el.x + el.w - x) > 0) {
      this.canvas.style.cursor = 'e-resize';
    }
  }
};

MobileCanvas.prototype.moveElement = function (el, ox, oy) {
  el.x = ox - this.movingOffsetX;
  el.y = oy - this.movingOffsetY;
  el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
  el.ry = (el.y - this.wheelDeltaY - this.topBarLeftY) / this.scaleRatio;
  this.propertiesEditor.render(this.getElementProperties(el));
  this.redraw();
}

MobileCanvas.prototype.resizeElementToWest = function (el, ox, oy) {
  el.x = ox - this.resizingOffsetX;
  el.rx = el.x / this.scaleRatio;
  el.w = this.resizingRight - el.x;
  el.rw = el.w / this.scaleRatio;
  if (el.type === 'avatar') {
    el.h = el.w;
    el.rh = el.h / this.scaleRatio;
  }
  this.redraw();
};

MobileCanvas.prototype.resizeElementToEast = function (el, ox, oy) {
  el.w = ox - this.resizingLeft;
  el.rw = el.w / this.scaleRatio;
  if (el.type === 'avatar') {
    el.h = el.w;
    el.rh = el.h / this.scaleRatio;
  }
  this.redraw();
};

MobileCanvas.prototype.resizeElementToNorth = function (el, ox, oy) {
  el.y = oy - this.resizingOffsetY;
  el.ry = el.y / this.scaleRatio;
  el.h = this.resizingBottom - el.y;
  el.rh = el.h / this.scaleRatio;
  if (el.type === 'avatar') {
    el.w = el.h;
    el.rw = el.w / this.scaleRatio;
  }
  this.redraw();
};

MobileCanvas.prototype.resizeElementToSouth = function (el, ox, oy) {
  el.h = oy - this.resizingTop;
  el.rh = el.h / this.scaleRatio;
  if (el.type === 'avatar') {
    el.w = el.h;
    el.rw = el.w / this.scaleRatio;
  }
  this.redraw();
};

MobileCanvas.prototype.drawParagraph = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.beginPath();
  let startX = el.x;
  let startY = el.y;
  let count = el.h / 28 - 1;
  for (let i = 0; i < count; i++) {
    this.context.fillRect(startX, startY, el.w, 20);
    startY += 28;
  }
  this.context.fillRect(startX, startY, el.w * 0.68, 20);
  this.context.closePath();
};

MobileCanvas.prototype.drawImage = function (el) {
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

MobileCanvas.prototype.drawImageSkeleton = function (el) {
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

MobileCanvas.prototype.drawAvatar = function (el) {
  this.context.fillStyle = this.skeletonBackground;

  let cx = el.x + el.w / 2;
  let cy = el.y + el.w / 2;

  this.context.beginPath();
  this.context.arc(cx, cy, el.w / 2, 0, 2 * Math.PI);
  this.context.fill();
  this.context.closePath();
};

MobileCanvas.prototype.drawText = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
};

MobileCanvas.prototype.drawBlock = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
};

MobileCanvas.prototype.drawElement = function (el) {
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
    el.h = el.h || 132;
    el.rw = el.w / this.scaleRatio;
    el.rh = el.h / this.scaleRatio;
    this.drawParagraph(el);
  } else if (el.type == 'block') {
    if (!el.w) {
      el.w = el.h = 60;
    }
    el.rw = el.w / this.scaleRatio;
    el.rh = el.h / this.scaleRatio;
    this.drawBlock(el);
  } else if (el.type == 'image') {
    el.w = el.w || this.safeAreaWidth;
    el.h = el.h || 120;
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

 MobileCanvas.prototype.drawNewElement = function (x, y, data, translated/*坐标是否已经转换*/) {
  translated = translated === true;
  let el;
  if (!translated) {
    // 通过拖拽实际Canvas的坐标
    let ox = x;
    let oy = y;
    if (MobileCanvas.offsetX) {
      ox -= MobileCanvas.offsetX;
    }
    if (MobileCanvas.offsetY) {
      oy -= MobileCanvas.offsetY;
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

MobileCanvas.prototype.findElementByXY = function (x, y) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (x > el.x && x < el.x + el.w && y > el.y && y < el.y + el.h) {
      return el;
    }
  }
  return null;
};

MobileCanvas.prototype.findElementById = function (id) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.id === id) {
      return el;
    }
  }
  return null;
};

MobileCanvas.prototype.findTopmostElement = function () {
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

MobileCanvas.prototype.clearSelected = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    this.drawnElements[i].selected = false;
  }
};

MobileCanvas.prototype.removeElements = function () {
  let newElements = [];
  for (let i = 0; i < this.drawnElements.length; i++) {
    if (this.drawnElements[i].selected !== true) {
      newElements.push(this.drawnElements[i]);
    }
  }
  this.drawnElements = newElements;
  this.redraw();
};

MobileCanvas.prototype.switchMode = function () {
  if (this.mode == 'design') {
    this.mode = 'simulate';
    this.clearSelected();
    this.redraw();
  } else {
    this.mode = 'design';
  }
};

MobileCanvas.prototype.changeElement = function (prop) {
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

MobileCanvas.prototype.clear = function () {
  this.drawnElements = [];
  this.redraw();
};

MobileCanvas.prototype.getElementProperties = function (el) {
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

MobileCanvas.prototype.copyElements = function () {
  let els = this.getSelectedElements();
  if (els.length == 0) return;
  this.copiedElements = els;
};

MobileCanvas.prototype.pasteElements = function () {
  for (let i = 0; i < this.copiedElements.length; i++) {
    let el = this.copiedElements[i];
    let cloned = {...el};
    cloned.x = this.contextX;
    cloned.y = this.contextY;
    this.drawNewElement(this.contextX, this.contextY, cloned, false);
  }
};

MobileCanvas.prototype.alignLeft = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected) {
      el.x = this.safeAreaBotLeftX;
      el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
      this.redraw();
      break;
    }
  }
};

MobileCanvas.prototype.alignCenter = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected) {
      el.x = (this.safeAreaTopRightX - el.w) / 2;
      el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
      this.redraw();
      break;
    }
  }
};

MobileCanvas.prototype.alignRight = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected) {
      el.x = this.safeAreaTopRightX - el.w;
      el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
      this.redraw();
      break;
    }
  }
};

MobileCanvas.prototype.alignJustify = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected) {
      el.x = this.safeAreaBotLeftX;
      el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
      el.w = this.safeAreaWidth;
      el.rw = el.w / this.scaleRatio;
      this.redraw();
      break;
    }
  }
};

MobileCanvas.prototype.alignVerticalSpace = function () {
  let selectedElements = this.getSelectedElements();
  let len = selectedElements.length;
  if (len <= 2) return;
};

MobileCanvas.prototype.alignHorizontalSpace = function () {
  let selectedElements = this.getSelectedElements();
  let len = selectedElements.length;
  if (len <= 1) return;
  let occupiedSpace = 0;
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    occupiedSpace += el.w;
  }
  let space = (this.safeAreaWidth - occupiedSpace) / (len + 1);
  if (space < 0) return;
  selectedElements.sort((a, b) => {
    if (a.x < b.x) {
      return;
    }
    return -1;
  });
  let offsetX = this.safeAreaTopLeftX;
  for (let i = 0; i < selectedElements.length; i++) {
    offsetX += space;
    let el = selectedElements[i];
    el.x = offsetX;
    el.rx = el.x / this.scaleRatio;
    offsetX += el.w;
  }
  this.redraw();
};

MobileCanvas.prototype.alignTop = function () {
  let selectedElements = this.getSelectedElements();
  let len = selectedElements.length;
  if (len <= 1) return;
  let minY = 999999, minEl = null;
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    if (el.y < minY) {
      minY = el.y;
      minEl = el;
    }
  }
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    el.y = minEl.y;
    el.ry = minEl.ry;
  }
  this.redraw();
};

MobileCanvas.prototype.alignBottom = function () {
  let selectedElements = this.getSelectedElements();
  let len = selectedElements.length;
  if (len <= 1) return;
  let maxY = 0, maxEl = null;
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    if ((el.y + el.h) > maxY) {
      maxY = el.y + el.h;
      maxEl = el;
    }
  }
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    el.y = (maxEl.y + maxEl.h) - el.h;
    el.ry = el.y / this.scaleRatio;
  }
  this.redraw();
};



MobileCanvas.prototype.getSelectedElements = function () {
  let ret = [];
  for (let i = 0; i < this.drawnElements.length; i++) {
    if (this.drawnElements[i].selected === true) {
      ret.push(this.drawnElements[i]);
    }
  }
  return ret;
};
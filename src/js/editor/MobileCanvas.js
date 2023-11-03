
function MobileCanvas(opts) {
  this.background = 'white';
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
  const MOBILE_TOP_BAR_LEFT_Y = 10;
  const MOBILE_TOP_BAR_RIGHT_X = 398;
  const MOBILE_TOP_BAR_RIGHT_Y = 10;

  const MOBILE_BOT_BAR_LEFT_X = 60;
  const MOBILE_BOT_BAR_LEFT_Y = 890;
  const MOBILE_BOT_BAR_RIGHT_X = 398;
  const MOBILE_BOT_BAR_RIGHT_Y = 890;

  const MOBILE_IMAGE_ASPECT_RATIO = MOBILE_IMAGE_WIDTH / MOBILE_IMAGE_HEIGHT;

  this.width = opts.width || 360;
  this.height = this.width / MOBILE_IMAGE_ASPECT_RATIO;

  this.scaleRatio = this.width / MOBILE_IMAGE_WIDTH;
  
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

  this.safeAreaWidth = this.safeAreaTopRightX - this.safeAreaTopLeftX;
  this.safeAreaHeight = this.safeAreaBotRightY - this.safeAreaTopRightY;

}

MobileCanvas.prototype.render = function (containerId) {
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
  const img = new Image(); // Create new img element
  img.addEventListener("load", () => {
    this.context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, this.width, this.height);
  }, false);
  img.src = "/img/emulator/iphone-bg.png";

  this.container.appendChild(this.canvas);

  this.buildSafeArea();
  this.buildTopBar();
  this.buildBotBar();
};

MobileCanvas.prototype.buildSafeArea = function () {
  this.context.fillStyle = this.background;
  this.context.fillRect(this.safeAreaTopLeftX, this.safeAreaTopLeftY, this.safeAreaWidth, this.safeAreaHeight);
};

MobileCanvas.prototype.buildTopBar = function () {
  this.context.beginPath();
  this.context.fillStyle = this.background;
  this.context.moveTo(this.safeAreaTopLeftX, this.safeAreaTopLeftY);
  this.context.arcTo(0, 0, this.topBarLeftX, this.topBarLeftY, 30);
  this.context.lineTo(this.topBarRightX, this.topBarRightY);
  this.context.arcTo(this.width, 0, this.safeAreaBotRightX, this.safeAreaTopRightY, 30);
  this.context.lineTo(this.safeAreaTopRightX, this.safeAreaTopRightY + 1 /* there is a bug what i have no idea*/);
  this.context.lineTo(this.safeAreaTopLeftX, this.safeAreaTopLeftY + 1 /* there is a bug what i have no idea*/);
  this.context.fill();
  this.context.closePath();
};

MobileCanvas.prototype.buildBotBar = function () {
  this.context.beginPath();
  this.context.fillStyle = this.background;
  this.context.moveTo(this.safeAreaBotLeftX, this.safeAreaBotLeftY);
  this.context.arcTo(0, this.height, this.botBarLeftX, this.botBarLeftY, 30);
  this.context.lineTo(this.botBarRightX, this.botBarRightY);
  this.context.arcTo(this.width - 10, this.height - 10, this.safeAreaBotRightX, this.safeAreaTopRightY, 30);
  this.context.lineTo(this.safeAreaBotRightX, this.safeAreaBotRightY - 1);
  this.context.lineTo(this.safeAreaBotLeftX, this.safeAreaBotLeftY - 1);
  this.context.fill();
  this.context.closePath();
};

MobileCanvas.prototype.drawImage = function (url, y) {
  const img = new Image();
  img.addEventListener("load", () => {
    let width = this.safeAreaTopRightX - this.safeAreaTopLeftX;
    let height = 120;
    this.context.drawImage(img, this.safeAreaTopLeftX, this.safeAreaTopLeftY, width, height);
  }, false);
  img.src = url;
};

MobileCanvas.prototype.drawParagraph = function (y) {
  this.fillStyle = 'rgba(0, 0, 0, 0.17)';
  let startY = y;
  let startX = this.safeAreaTopLeftX;
  for (let i = 0; i < 4; i++) {
    this.context.fillRect(startX, startY, this.safeAreaWidth, 15);
    startY += 20;
  }

  this.context.fillRect(startX, startY, this.safeAreaWidth * 0.68, 15);
};
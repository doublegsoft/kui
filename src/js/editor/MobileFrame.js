function MobileFrame(opts) {
  /*!
  ** 背景色，明亮模式和暗黑模式。
  */
  this.url = opts.url;
  this.width = opts.width;
}

MobileFrame.prototype.render = function (containerId) {
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

  this.container = dom.find(containerId);

  let rect = this.container.getBoundingClientRect();
  let ratio = rect.height / MOBILE_IMAGE_HEIGHT;

  let width = this.width;
  let height = 0;
  if (!width) {
    height = ratio * MOBILE_IMAGE_HEIGHT;
    width = height * MOBILE_IMAGE_ASPECT_RATIO;
  } else {
    height = width / MOBILE_IMAGE_ASPECT_RATIO;
  }
  this.width = width;

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

  this.paddingLeft = 12 * this.scaleRatio;
  this.paddingRight = 12 * this.scaleRatio;

  let img = dom.create('img', 'm-auto');
  img.src = '/img/emulator/iphone-bg.png';
  img.style.width = width + 'px';
  img.style.height = height + 'px';

  this.container.appendChild(img);

  const top = img.offsetTop;
  const left = img.offsetLeft;
  this.iframe = dom.create('iframe', 'position-absolute', 'border-less');
  this.iframe.frameborder = 'none';
  this.iframe.src = this.url;
  this.iframe.style.left = (left + this.safeAreaTopLeftX + 1) + 'px';
  this.iframe.style.top = (top + this.safeAreaTopLeftY + 1) + 'px';
  this.iframe.style.width = (this.safeAreaWidth - 2)  + 'px';
  this.iframe.style.height = (this.safeAreaHeight - 2) + 'px';
  this.container.appendChild(this.iframe);
};

MobileFrame.prototype.preview = function (html, callback) {
  let body = this.iframe.contentWindow.document.body;
  body.innerHTML = html;
  body.querySelectorAll('img').forEach(img => {
    img.style.width = "100%";
  });
  if (callback) {
    callback(body);
  }
};


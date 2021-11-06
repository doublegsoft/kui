
function MobileDesigner(opt) {

}

MobileDesigner.GridButtons = function(opt) {
  // 栅格列数
  this.columnCount = opt.columnCount;
  // 瓦片风格
  this.tileStyle = opt.tileStyle;
  //
  this.elRoot = dom.element(`
    <div class="square-menu"></div>
  `);
  this.elTile = dom.element(`
    <a class="entry btn">
      <div class="d-flex flex-column">
        <i class="fas fa-monument text-gray font-4xl"></i>
        <span class="font-14 text-gray mt-2">功能入口</span>
      </div>
    </a>
  `);
  this.elPlaceHolder = dom.element(`
    <div class="entry btn"></div>
  `);
};

MobileDesigner.GridButtons.prototype.placeholder = function() {
  let ret = this.elRoot.cloneNode();
  for (let i = 0; i < 8; i++) {
    let tile = this.elTile.cloneNode(true);
    ret.appendChild(tile);
  }
  let pl = this.elPlaceHolder.cloneNode();
  ret.appendChild(pl);
  return ret;
};


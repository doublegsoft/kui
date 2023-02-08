
/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function PopupRuler(opt) {
  this.unit = opt.unit || '';
  this.regex = opt.regex || /.*/;
  this.success = opt.success || function (val) {};
  this.type = opt.type || 'decimal';
  this.value = opt.value;
  this.range = opt.range;
}

PopupRuler.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom in">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="confirm">确认</button>
        </div>
        <div class="popup-content" style="height: 200px; width: 100%;"></div>
      </div>
    </div>
  `, this);

  this.bottom = dom.find('.popup-bottom', ret);
  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let value = dom.find('.value', ret);

  dom.bind(mask, 'click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(confirm, 'click', ev => {
    this.success(value.innerText);
    this.close();
  });

  return ret;
};

PopupRuler.prototype.show = function(container) {
  let root = this.root();
  container.appendChild(root);

  let content = dom.find('.popup-content', root);
  let value = dom.find('.value', root);
  value.innerText = this.value;
  ruler.initPlugin({
    el: content, //容器id
    startValue: this.value,
    maxScale: this.range[1], //最大刻度
    region: [this.range[0], this.range[1]], //选择刻度的区间范围
    background: "#fff",
    color: "#E0E0E0", //刻度线和字体的颜色
    markColor: "#73B17B", //中心刻度标记颜色
    isConstant: true, //是否不断地获取值
    success: res => {
      value.innerText = res;
    }
  });
};

PopupRuler.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};

/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function Numpad(opt) {
  this.unit = opt.unit || '';
  this.regex = opt.regex || /.*/;
  this.success = opt.success || function (val) {};
  this.type = opt.type || 'decimal';
}

Numpad.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom numpad">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="confirm">确认</button>
        </div>
        <div class="d-flex flex-wrap full-width">
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">1</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">2</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">3</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">4</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">5</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">6</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">7</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">8</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">9</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button widget-id="buttonSpecial" class="number">.</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">0</button>
          </div>
          <div class="col-24-08" style="line-height: 48px; font-size: 24px;">
            <button class="number">
              <i class="fas fa-backspace" style="font-size: 20px;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `, this);
  this.bottom = dom.find('.popup-bottom', ret);
  // this.audio = new Audio('img/keypressed.wav');
  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let value = dom.find('.value', ret);
  let special = dom.find('[widget-id=buttonSpecial]', ret);

  if (this.type == 'id') {
    special.innerText = 'X';
    this.regex = /^.{0,18}$/;
  } else if (this.type == 'mobile') {
    special.remove();
    this.regex = /^.{0,11}$/;
  }

  let numbers = ret.querySelectorAll('.number');
  for (let i = 0; i < numbers.length; i++) {
    let num = numbers[i];
    dom.bind(num, 'click', ev => {
      let str = value.innerText;
      let text = ev.currentTarget.innerText;
      if (text == '') {
        if (str === '') return;
        str = str.substr(0, str.length - 1);
      } else {
        if (this.regex.test(str + text)) {
          str += text;
        }
      }
      value.innerText = str;
    });
    // dom.bind(num, 'touchstart', ev => {
    //   this.audio.src= 'img/keypressed.wav';
    //   this.audio.play();
    // });
    // dom.bind(num, 'touchend', ev => {
    //   // this.audio.pause();
    // });
  }

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(confirm, 'click', ev => {
    this.success(value.innerText);
    this.close();
  });

  setTimeout(() => {
    this.bottom.classList.add('in');
  }, 50);
  return ret;
};

Numpad.prototype.show = function(container) {
  container.appendChild(this.root());
};

Numpad.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};
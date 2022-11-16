
function Weekdays(opt) {
  opt = opt || {};
  this.today = moment(new Date());
  this.days = opt.days || 14;
}

Weekdays.prototype.root = function() {
  let ret = dom.templatize(`
    <div class="swiper weekly">
      <div class="swiper-wrapper">
      </div>
    </div>
  `, {});
  let wrapper = dom.find('.swiper-wrapper', ret);
  let dates = [];
  for (let i = 0; i < this.days; i++) {
    let date = moment(this.today).add(i, 'days');
    let day = date.day();
    if (day == 1) {
      day = '一';
    } else if (day == 2) {
      day = '二';
    } else if (day == 3) {
      day = '三';
    } else if (day == 4) {
      day = '四';
    } else if (day == 5) {
      day = '五';
    } else if (day == 6) {
      day = '六';
    } else {
      day = '日';
    }
    let slide = dom.element('<div class="swiper-slide d-flex" style="width: calc(100% / 7)"></div>');
    let el = dom.templatize(`
      <div class="weekday pb-2" data-date="{{fulldate}}">
        <span class="day">{{day}}</span>
        <span class="date">{{date}}</span>
      </div>
    `, {
      day: day,
      date: date.format('DD'),
      fulldate: date.format('YYYY-MM-DD'),
    });
    if (i == 0) {
      el.classList.add('active');
    }
    slide.appendChild(el);
    wrapper.appendChild(slide);

    dom.bind(el, 'click', ev => {
      let wds = ret.querySelectorAll('.weekday');
      wds.forEach(wd => {
        wd.classList.remove('active');
      })
      el.classList.add('active');
    });
  }

  let swiper = new Swiper(ret, {
    speed: 400,
    slidesPerView: 7,
    loop: false,
  });
  return ret;
};

Weekdays.prototype.render = function(containerId) {
  let container = dom.find(containerId);
  container.appendChild(this.root());
};
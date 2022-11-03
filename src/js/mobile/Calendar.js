
/*!
** 构造函数，配置项包括：
**
**
**
*/
function Calendar(opt) {
  this.today = moment(new Date());
  this.currentMonth = moment(this.today).startOf('month');
  this.currentIndex = 1;
}

Calendar.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="calendar">
      <div class="title"></div>
      <div class="weekdays">
        <div class="weekday">日</div>
        <div class="weekday">一</div>
        <div class="weekday">二</div>
        <div class="weekday">三</div>
        <div class="weekday">四</div>
        <div class="weekday">五</div>
        <div class="weekday">六</div>
      </div>
      <div class="swiper">
        <div class="swiper-wrapper">
          <div class="dates prev swiper-slide"></div>
          <div class="dates curr swiper-slide"></div>
          <div class="dates next swiper-slide"></div>
        </div>
      </div>
    </div>
  `, {});

  this.widgetSwiper = dom.find('.swiper', ret);
  this.title = dom.find('.title', ret);
  let prev = dom.find('.dates.prev', ret);
  let curr = dom.find('.dates.curr', ret);
  let next = dom.find('.dates.next', ret);

  this.renderMonth(prev, moment(this.currentMonth).subtract(1,'months').startOf('month'));
  this.renderMonth(curr, this.currentMonth);
  this.renderMonth(next, moment(this.currentMonth).add(1,'months').startOf('month'));

  let swiper = new Swiper(this.widgetSwiper, {
    speed: 400,
    initialSlide: this.currentIndex,
    loop: true,
  });

  swiper.on('slideChange', ev => {
    if (ev.realIndex == 0) {
      if (this.currentIndex == 1) {
        this.currentMonth = moment(this.currentMonth).subtract(1, 'months');
      } else if (this.currentIndex == 2) {
        this.currentMonth = moment(this.currentMonth).add(1, 'months');
      }
    } else if (ev.realIndex == 1) {
      if (this.currentIndex == 0) {
        this.currentMonth = moment(this.currentMonth).add(1, 'months');
      } else if (this.currentIndex == 2) {
        this.currentMonth = moment(this.currentMonth).subtract(1, 'months');
      }
    } else if (ev.realIndex == 2) {
      if (this.currentIndex == 0) {
        this.currentMonth = moment(this.currentMonth).subtract(1, 'months');
      } else if (this.currentIndex == 1) {
        this.currentMonth = moment(this.currentMonth).add(1, 'months');
      }
    }
    this.currentIndex = ev.realIndex;
    let prevMonth = moment(this.currentMonth).subtract(1, 'months');
    let nextMonth = moment(this.currentMonth).add(1, 'months');

    let elPrev = null;
    let elNext = null;
    if (this.currentIndex == 0) {
      elPrev = ret.querySelectorAll('.dates.next');
      elNext = ret.querySelectorAll('.dates.curr');
    } else if (this.currentIndex == 1) {
      elPrev = ret.querySelectorAll('.dates.prev');
      elNext = ret.querySelectorAll('.dates.next');
    } else if (this.currentIndex == 2) {
      elPrev = ret.querySelectorAll('.dates.curr');
      elNext = ret.querySelectorAll('.dates.prev');
    }

    for (let i = 0; i < elPrev.length; i++) {
      this.renderMonth(elPrev[i], prevMonth);
    }
    for (let i = 0; i < elNext.length; i++) {
      this.renderMonth(elNext[i], nextMonth);
    }
  });

  return ret;
};

Calendar.prototype.renderMonth = function(container, month) {
  let weekday = month.startOf('month').day();
  let days = month.daysInMonth();
  container.innerHTML = '';
  for (let i = 0; i < days + weekday; i++) {
    let date = dom.element(`<div class="date"></div>`);
    if (i >= weekday) {
      date.innerHTML = (i - weekday + 1);
    }
    container.appendChild(date);
  }
  // 补足下月的空白
  let residue = 7 - (days + weekday) % 7;
  for (let i = 0; i < residue; i++) {
    let date = dom.element(`<div class="date"></div>`);
    container.appendChild(date);
  }

  // 显示月份
  this.title.innerText = this.currentMonth.format('YYYY年MM月');
};

Calendar.prototype.render = function(containerId, params) {
  let container = dom.find(containerId);
  container.appendChild(this.root());
};
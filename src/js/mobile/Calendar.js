
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
      <div class="weekdays" style="position: sticky; top: 0;z-index: 10;">
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
          <div class="prev swiper-slide"></div>
          <div class="curr swiper-slide"></div>
          <div class="next swiper-slide"></div>
        </div>
      </div>
    </div>
  `, {});

  this.widgetSwiper = dom.find('.swiper', ret);
  this.title = dom.find('.title', ret);
  let prev = dom.find('.prev', ret);
  let curr = dom.find('.curr', ret);
  let next = dom.find('.next', ret);

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
      elPrev = ret.querySelectorAll('.next');
      elNext = ret.querySelectorAll('.curr');
    } else if (this.currentIndex == 1) {
      elPrev = ret.querySelectorAll('.prev');
      elNext = ret.querySelectorAll('.next');
    } else if (this.currentIndex == 2) {
      elPrev = ret.querySelectorAll('.curr');
      elNext = ret.querySelectorAll('.prev');
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
  let row = null;
  for (let i = 0; i < days + weekday; i++) {
    if (i % 7 == 0) {
      row = dom.create('div', 'dates');
    }
    let date = dom.element(`<div class="date"></div>`);
    let day = (i - weekday + 1);
    if (i >= weekday) {
      date.innerHTML = day;
    }
    let dateVal = month.format('YYYY-MM-') + (day < 10 ? ('0' + day) : day);
    if (dateVal == this.today.format('YYYY-MM-DD')) {
      date.classList.add('today');
    }
    date.setAttribute('data-calendar-date', dateVal);
    row.appendChild(date);
    if (i % 7 == 6) {
      container.appendChild(row);
      row = null;
    }
  }
  if (row != null) {
    container.appendChild(row);
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

Calendar.prototype.stylizeDates = function (style, startDate, endDate) {
  let dates = dom.find('.dates.curr', this.root);
  if (Array.isArray(startDate)) {
    for (let i = 0; i < startDate.length; i++) {
      for (let j = 0; j < dates.children.length; j++) {
        if (moment(startDate[i]).format('YYYY-MM-DD') == dates.children[j].getAttribute('data-calendar-date')) {
          dates.children[j].style = style;
          break;
        }
      }
    }
    return;
  }
  startDate = moment(startDate).format('YYYY-MM-DD');
  endDate = moment(endDate).format('YYYY-MM-DD');
  for (let j = 0; j < dates.children.length; j++) {
    let date = dates.children[j].getAttribute('data-calendar-date');
    if (date >= startDate && date <= endDate ) {
      dates.children[j].style = style;
    }
  }
};

Calendar.prototype.render = function(containerId, params) {
  this.root = this.root();
  let container = dom.find(containerId);
  container.innerHTML = '';
  container.appendChild(this.root);
};
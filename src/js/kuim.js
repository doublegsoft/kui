Handlebars.registerHelper('ifeq', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

if (typeof kuim === 'undefined') kuim = {};

kuim = {
  routedPages: [],
  presentPageObj: null,
};

kuim.navigateTo = async function (url, opt, clear) {
  clearTimeout(kuim.delayToLoad);
  // kuim.delayToLoad = setTimeout(() => {
  //   if (typeof clear === "undefined") clear = false;
  //   let main = document.querySelector('main');
  //
  //   if (kuim.presentPageObj) {
  //     kuim.presentPageObj.page.classList.remove('in');
  //     kuim.presentPageObj.page.classList.add('out');
  //   }
  //   setTimeout(async () => {
  //     if (kuim.presentPageObj) {
  //       kuim.presentPageObj.page.parentElement.style.display = 'none';
  //     }
  //     if (kuim.presentPageObj && clear !== false) {
  //       kuim.presentPageObj.page.parentElement.remove();
  //       if (kuim.presentPageObj.destroy) {
  //         kuim.presentPageObj.destroy();
  //       }
  //       delete kuim.presentPageObj;
  //     }
  //     let html = await xhr.asyncGet({
  //       url: url + '?' + new Date().getTime(),
  //     }, 'GET');
  //     kuim.reload(main, url, html, opt);
  //   }, 400);
  // }, 200);
  if (typeof clear === "undefined") clear = false;
  let main = document.querySelector('main');

  if (kuim.presentPageObj) {
    kuim.presentPageObj.page.classList.remove('in');
    kuim.presentPageObj.page.classList.add('out');
  }
  kuim.delayToLoad = setTimeout(async () => {
    if (kuim.presentPageObj) {
      kuim.presentPageObj.page.parentElement.style.display = 'none';
    }
    if (kuim.presentPageObj && clear !== false) {
      kuim.presentPageObj.page.parentElement.remove();
      if (kuim.presentPageObj.destroy) {
        kuim.presentPageObj.destroy();
      }
      delete kuim.presentPageObj;
    }
    let html = await xhr.asyncGet({
      url: url + (url.indexOf('?') == -1 ? '?' : '&') + new Date().getTime(),
    }, 'GET');
    kuim.reload(main, url, html, opt);
  }, 400);
};

kuim.navigateWidget = function (url, container, opt) {
  clearTimeout(kuim.delayToLoad);
  kuim.delayToLoad = setTimeout(() => {
    if (container.children[0]) {
      container.children[0].classList.remove('in');
      container.children[0].classList.add('out');
    }
    setTimeout(async () => {
      container.innerHTML = '';
      let html = await xhr.asyncGet({
        url: url,
      }, 'GET');
      kuim.replace(container, url, html, opt);
    }, 400);
  }, 200);
};

kuim.navigateBack = function (opt) {
  clearTimeout(kuim.delayToLoad);
  kuim.delayToLoad = setTimeout(() => {
    let main = document.querySelector('main');
    let latest = main.children[main.children.length - 2];

    kuim.presentPageObj.page.classList.remove('in');
    kuim.presentPageObj.page.classList.add('out');

    setTimeout(() => {
      kuim.presentPageObj.page.parentElement.remove();
      if (kuim.presentPageObj.destroy) {
        kuim.presentPageObj.destroy();
      }
      delete kuim.presentPageObj;

      latest.style.display = '';
      kuim.presentPageObj = window[latest.getAttribute('kuim-page-id')];
      kuim.presentPageObj.page.classList.remove('out');
      kuim.presentPageObj.page.classList.add('in');

      kuim.setTitleAndIcon(latest.getAttribute('kuim-page-title'),
        latest.getAttribute('kuim-page-icon'));
    }, 400 /*同CSS中的动画效果配置时间一致*/);
  }, 200);
};

kuim.reload = function (main, url, html, opt) {
  opt = opt || {};
  let fragmentContainer = dom.element(`<div style="height: 100%; width: 100%;"></div>`);
  let range = document.createRange();
  let fragment = range.createContextualFragment(html);
  fragmentContainer.appendChild(fragment);
  let page = dom.find('[id^=page]', fragmentContainer);
  let pageId = page.getAttribute('id');

  main.appendChild(fragmentContainer);

  fragmentContainer.setAttribute('kuim-page-id', pageId);
  fragmentContainer.setAttribute('kuim-page-url', url);

  if (opt.title) {
    fragmentContainer.setAttribute('kuim-page-title', opt.title);
    fragmentContainer.setAttribute('kuim-page-icon', opt.icon || '');
  }

  kuim.presentPageObj = window[pageId];
  kuim.presentPageObj.page.classList.add('in');

  let params = utils.getParameters(url);
  kuim.presentPageObj.show(params);

  kuim.setTitleAndIcon(opt.title, opt.icon);
  if (opt.success) {
    opt.success();
  }
};

kuim.replace = function (container, url, html, opt) {
  opt = opt || {};
  let fragmentContainer = dom.element(`<div style="height: 100%; width: 100%;"></div>`);
  let range = document.createRange();
  let fragment = range.createContextualFragment(html);
  container.appendChild(fragment);

  let page = dom.find('[id^=page]', container);
  let pageId = page.getAttribute('id');

  if (opt.title) {
    fragmentContainer.setAttribute('kuim-page-title', opt.title);
    fragmentContainer.setAttribute('kuim-page-icon', opt.icon || '');
  }page.classList.add('in');

  let params = utils.getParameters(url);
  window[pageId].show(params);

  // pass options to page object
  for (let key in opt) {
    window[pageId][key] = opt[key];
  }

  if (opt.success) {
    opt.success();
  }
};

kuim.setTitleAndIcon = function(title, icon) {
  let bottomDiv = dom.find('.bottom-navigator');
  let titleDiv = dom.find('header h1.title');
  titleDiv.innerText = title;
  let iconDiv = dom.find('header div.left');
  if (icon) {
    iconDiv.innerHTML = icon;
    if (bottomDiv != null)
      bottomDiv.style.display = '';
    iconDiv.onclick = (ev) => {}
  } else {
    iconDiv.innerHTML = '<i class="fas fa-arrow-left text-white button icon"></i>';
    if (bottomDiv != null)
      bottomDiv.style.display = 'none';
    iconDiv.onclick = (ev) => {
      kuim.navigateBack()
    }
  }
};

kuim.select = async function(opt) {
  let rows = await xhr.promise({
    url: opt.url,
    params: opt.params || {},
  });
  let data = [];
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    data.push({
      id: row[opt.fieldId || 'id'],
      value: row[opt.fieldName || 'value'],
    });
  }
  new MobileSelect({
    trigger: opt.trigger,
    title: opt.title,
    wheels: [{
      data: data,
    }],
    callback: (indexArr, data) => {
      if (opt.onSelected) {
        opt.onSelected(data[0]);
      }
    },
  });
};

kuim.tabs = function(opt) {
  let container = dom.find(opt.container);
  let tabNavigators = dom.element(`
    <div class="nav nav-tabs mt-0"></div>
  `);
  let tabContents = dom.element(`
    <div class="swiper">
      <div class="swiper-wrapper">
      </div>
    </div>
  `);
  let tabs = opt.tabs;
  for (let i = 0; i < tabs.length; i++) {
    let tab = tabs[i];
    let tabNavigator = dom.templatize(`
      <div class="nav-item font-weight-bold mr-0" 
           style="padding: 0 16px; line-height: 36px; text-align: center; flex: 1;">{{title}}</div>
    `, tab);
    tabNavigators.appendChild(tabNavigator);
    if (i == 0) {
      tabNavigator.classList.add('active-bg-info');
    }
    dom.bind(tabNavigator, 'click', (ev) => {
      swiper.slideTo(i, 400, true);
    });

    let tabContent = dom.templatize(`
      <div class="swiper-slide full-width"></div>
    `, tab);
    if (tab.render) {
      tab.render(tabContent, tab.params || {});
    } else {
      tabContent.innerHTML = '<img src="https://via.placeholder.com/240x150">';
    }
    tabContents.children[0].appendChild(tabContent);
  }
  container.appendChild(tabNavigators);
  container.appendChild(tabContents);

  let swiper = new Swiper(tabContents, {
    direction: 'horizontal',
    loop: false,
  });
  swiper.on('slideChange', function (ev) {
    let index = ev.activeIndex;
    for (let i = 0; i < tabNavigators.children.length; i++) {
      tabNavigators.children[i].classList.remove('active-bg-info');
    }
    tabNavigators.children[index].classList.add('active-bg-info');
  });
};

kuim.wizard = function(opt) {
  let container = dom.find(opt.container);
  let stepNavigators = dom.element(`
    <div class="wizard"></div>
  `);
  let stepContents = dom.element(`
    <div class="swiper">
      <div class="swiper-wrapper">
      </div>
    </div>
  `);
  let steps = opt.steps;
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i];
    step.index = i + 1;
    let stepNavigator = dom.templatize(`
      <div class="wizard-step">
        <div class="wizard-dot">
          <div class="wizard-connector-left"></div>
          <div class="wizard-number">{{index}}</div>
          <div class="wizard-connector-right"></div>
        </div>
      </div>
    `, step);
    stepNavigators.appendChild(stepNavigator);

    dom.bind(stepNavigator, 'click', (ev) => {
      if (!stepNavigator.classList.contains('wizard-step-completed')) return;
      swiper.slideTo(i, 400, true);
    });

    let stepContent = dom.templatize(`
      <div class="swiper-slide full-width"></div>
    `, step);
    if (step.render) {
      step.render(stepContent, step.params || {});
    } else {
      stepContent.innerHTML = '<img src="https://via.placeholder.com/240x150">';
    }
    stepContents.children[0].appendChild(stepContent);
  }
  container.appendChild(stepNavigators);
  container.appendChild(stepContents);

  let swiper = new Swiper(stepContents, {
    direction: 'horizontal',
    loop: false,
  });
  swiper.on('slideChange', ev => {
    let index = ev.activeIndex;
    for (let i = 0; i < stepNavigators.children.length; i++) {
      stepNavigators.children[i].classList.remove('wizard-step-completed');
    }
    for (let i = 0; i < index; i++) {
      stepNavigators.children[i].classList.add('wizard-step-completed');
    }
  });
  swiper.on('sliderMove', (swiper, ev) => {

  });
  return swiper;
};

kuim.overlay = function() {

};

kuim.success = function(message, callback) {
  let el = dom.templatize(`
    <div class="toast">
      <i class="far fa-check-circle font-36"></i>
      <div class="font-18 mt-2">${message}</div>
    </div>
  `);
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('show');
  }, 50);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => {
      el.remove();
      if (callback)
        callback();
    }, 500);
  }, 1000);
};

kuim.error = function(message, callback) {
  let el = dom.templatize(`
    <div class="toast">
      <i class="far fa-times-circle font-36"></i>
      <div class="font-18 mt-2">${message}</div>
    </div>
  `);
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('show');
  }, 50);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => {
      el.remove();
      if (callback)
        callback();
    }, 500);
  }, 1000);
};

kuim.loading = function(callback) {
  if (document.getElementById('__widgetLoading') != null) return;
  let el = dom.templatize(`
    <div id="__widgetLoading" style="background: rgba(0,0,0,0.3); position: absolute; top: 0; left: 0; 
                z-index: 9999; height: 100%; width: 100%; display: flex; color: white">
      <div class="m-auto" style="text-align: center;">
        <i class="fas fa-spinner fa-spin font-36"></i>
        <div class="font-18 mt-2">数据加载中</div>
      </div>          
    </div>
  `);
  document.body.appendChild(el);
  setTimeout(() => {
    if (callback)
      callback(el);
  }, 300);
};

kuim.dialog = function (opt) {
  let confirm = opt.confirm;
  let cancel = opt.cancel;
  let content = opt.content;
  let mask = dom.element(`
    <div style="background: rgba(0,0,0,0.3); position: absolute; top: 0; left: 0; 
                z-index: 9999; height: 100%; width: 100%; display: flex;">
      <div class="dialog m-auto" 
           style="width: 88%; min-height: 400px; position: relative;
                  background: var(--color-white);">
        <div class="dialog-body">${content}</div>
        <div class="dialog-footer" 
             style="font-size: 24px; font-weight: bold; position: absolute;
                    width: 100%; height: 56px; bottom: 0; display: table;">
          <button style="background: var(--color-error); width: 50%; display: inline-table;
                         color: var(--color-text-primary-dark); border: none; 
                         line-height: 56px;">取  消</button>
          <button style="background: var(--color-primary); width: 50%; display: inline-table;
                         color: var(--color-text-primary-dark); border: none; 
                         line-height: 56px;">确  定</button>
        </div>
      </div>
    </div>
  `);
  let buttons = mask.querySelectorAll('button');
  dom.bind(buttons[0], 'click', ev => {
    mask.remove();
    if (cancel) cancel();
  });
  dom.bind(buttons[1], 'click', ev => {
    mask.remove();
    if (confirm) confirm();
  });
  document.body.appendChild(mask);
};

pStart = { x: 0, y: 0 };
pStop = { x: 0, y: 0 };

kuim.swipeStart = function(e) {
  if (typeof e["targetTouches"] !== "undefined") {
    let touch = e.targetTouches[0];
    pStart.x = touch.screenX;
    pStart.y = touch.screenY;
  } else {
    pStart.x = e.screenX;
    pStart.y = e.screenY;
  }
};

kuim.swipeEnd = function(e) {
  if (typeof e["changedTouches"] !== "undefined") {
    let touch = e.changedTouches[0];
    pStop.x = touch.screenX;
    pStop.y = touch.screenY;
  } else {
    pStop.x = e.screenX;
    pStop.y = e.screenY;
  }
};

kuim.swipeCheck = function() {
  let changeY = pStart.y - pStop.y;
  let changeX = pStart.x - pStop.x;
  return kuim.isPullDown(changeY, changeX);
};

kuim.isPullDown = function (dY, dX) {
  // methods of checking slope, length, direction of line created by swipe action
  return (
    dY < 0 &&
    ((Math.abs(dX) <= 100 && Math.abs(dY) >= 300) ||
      (Math.abs(dX) / Math.abs(dY) <= 0.3 && dY >= 60))
  );
};

document.addEventListener("touchstart", kuim.swipeStart, false);
document.addEventListener("touchend", ev => {
  kuim.swipeEnd(ev);
  if (kuim.swipeCheck()) {
    let rect = kuim.presentPageObj.page.getBoundingClientRect();
    if (kuim.presentPageObj && kuim.presentPageObj.pullToRefresh) {
      let rect = kuim.presentPageObj.page.getBoundingClientRect();
      if (rect.top >= 0) {
        kuim.loading(el => {
          kuim.presentPageObj.pullToRefresh(el);
        });
      }
    }
  }
}, false);
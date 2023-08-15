
function Tabs(opts) {
  this.navigator = dom.find(opts.navigatorId);
  this.navigator.classList.add('d-flex', 'align-items-center');
  this.content = dom.find(opts.contentId);
  this.tabActiveClass = opts.tabActiveClass;
  this.tabs = opts.tabs;
  this.lazy = opts.lazy !== false;
  this.autoClear = opts.autoClear === true;
}

Tabs.prototype.loadPage = function(id, url, hidden, success) {
  let contentPage = dom.find(`div[data-tab-content-id="${id}"]`);
  if (contentPage == null) {
    contentPage = dom.templatize('<div data-tab-content-id="{{id}}"></div>', {id: id});
    this.content.appendChild(contentPage);
  } else {
    contentPage.innerHTML = '';
  }
  if (typeof url !== 'undefined') {
    ajax.view({
      url: url,
      containerId: contentPage,
      success: success || function () {

      }
    });
  }
  if (hidden === true) {
    contentPage.style.display = 'none';
  }
};

Tabs.prototype.reload = function (params) {
  let index = 0;
  let nav = this.navigator.children[index];
  for (let i = 1; i < this.navigator.children.length; i++) {
    let child = this.navigator.children[i];
    if (child.classList.contains(this.tabActiveClass)) {
      index = i - 1;
      nav = child;
      break;
    }
  }
  this.loadPage(nav.getAttribute('data-tab-id'), nav.getAttribute('data-tab-url'),
    false, params => {
      this.tabs[index].success(params);
    });
};

Tabs.prototype.render = function() {
  let self = this;

  if (this.content) {
    this.content.innerHTML = '';
  }
  this.navigator.innerHTML = '';

  this.slider = dom.element('<div class="slider position-absolute"></div>');
  this.navigator.appendChild(this.slider);

  this.tabs.forEach((tab, idx) => {
    tab.style = tab.style || 'padding: 0 16px;';
    if (tab.style) {
      tab.style = tab.style;
    } else {
      tab.style += 'min-width: ' + (tab.text.length * 16 + 32) + 'px;text-align: center;';
    }
    let nav = dom.templatize(`
      <div class="nav-item font-weight-bold mr-0 pointer" style="{{style}}"
           data-tab-url="{{{url}}}"
           data-tab-id="{{{id}}}" >{{{text}}}</div>
    `, tab);
    self.navigator.appendChild(nav);

    // 绑定Tab点击事件
    dom.bind(nav, 'click', (ev) => {
      if (nav.classList.contains(self.tabActiveClass)) {
        return;
      }

      // 处理以前激活的页签及内容
      for (let i = 0; i < self.navigator.children.length; i++) {
        let _nav = self.navigator.children[i];
        _nav.classList.remove(self.tabActiveClass);
      }

      if (self.content) {
        for (let i = 0; i < self.content.children.length; i++) {
          self.content.children[i].style.display = 'none';
        }
      }

      // 激活现在点击的页签及内容
      self.activate(nav);

      if (this.autoClear === true) {
        // 只有在懒加载情况下，设置自动清除内容才有效
        this.content.innerHTML = '';
      }
      let contentPage = dom.find('div[data-tab-content-id="' + nav.getAttribute('data-tab-id') + '"]', self.content);
      if (contentPage != null) {
        contentPage.style.display = '';
      } else {
        if (tab.onClicked) {
          tab.onClicked(ev);
        } else {
          let id = nav.getAttribute('data-tab-id');
          let url = nav.getAttribute('data-tab-url');
          self.loadPage(id, url, false, tab.success);
        }
      }
    });

    // 激活默认页签及内容
    if (self.lazy === true) {
      if (idx == 0) {
        self.activate(nav);
        if (tab.onClicked) {
          tab.onClicked();
        } else {
          self.loadPage(tab.id, tab.url, false, tab.success);
        }
      }
    } else {
      if (idx == 0) {
        self.activate(nav);
        if (tab.onClicked) {
          tab.onClicked();
        } else {
          self.loadPage(tab.id, tab.url, false, tab.success);
        }
      } else {
        if (tab.onClicked) {
          tab.onClicked();
        } else {
          self.loadPage(tab.id, tab.url, true, tab.success);
        }
      }
    }
  });
};

Tabs.prototype.activate = function (nav) {
  nav.classList.add(this.tabActiveClass);
  this.slider.style.width = nav.clientWidth + 'px';
  this.slider.style.left = nav.offsetLeft + 'px';
};
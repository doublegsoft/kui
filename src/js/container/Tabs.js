
function Tabs(opts) {
  this.navigator = dom.find(opts.navigatorId);
  this.content = dom.find(opts.contentId);
  this.tabActiveClass = opts.tabActiveClass;
  this.tabs = opts.tabs;
  this.lazy = opts.lazy !== false;
  this.autoClear = opts.autoClear === true;
}

Tabs.prototype.loadPage = function(id, url, hidden, success) {
  let contentPage = dom.templatize('<div data-tab-content-id="{{id}}"></div>', {id: id});
  ajax.view({
    url: url,
    containerId: contentPage,
    success: success || function() {}
  });
  if (hidden === true) {
    contentPage.style.display = 'none';
  }
  this.content.appendChild(contentPage);
};

Tabs.prototype.render = function() {
  let self = this;

  this.content.innerHTML = '';
  this.navigator.innerHTML = '';

  this.tabs.forEach((tab, idx) => {
    tab.style = tab.style || 'padding: 0 16px;';
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

      for (let i = 0; i < self.content.children.length; i++) {
        self.content.children[i].style.display = 'none';
      }

      // 激活现在点击的页签及内容
      nav.classList.add(self.tabActiveClass);
      if (this.autoClear === true) {
        // 只有在懒加载情况下，设置自动清除内容才有效
        this.content.innerHTML = '';
      }
      let contentPage = dom.find('div[data-tab-content-id=' + nav.getAttribute('data-tab-id') + ']', self.content);
      if (contentPage != null) {
        contentPage.style.display = '';
      } else {
        let id = nav.getAttribute('data-tab-id');
        let url = nav.getAttribute('data-tab-url');
        if (tab.onClicked) {
          tab.onClicked(ev);
        } else {
          self.loadPage(id, url, false, tab.success);
        }
      }
    });

    // 激活默认页签及内容
    if (self.lazy === true) {
      if (idx == 0) {
        nav.classList.add(this.tabActiveClass);
        if (tab.onClicked) {
          tab.onClicked(ev);
        } else {
          self.loadPage(tab.id, tab.url, false, tab.success);
        }
      }
    } else {
      if (idx == 0) {
        nav.classList.add(this.tabActiveClass);
        if (tab.onClicked) {
          tab.onClicked(ev);
        } else {
          self.loadPage(tab.id, tab.url, false, tab.success);
        }
      } else {
        if (tab.onClicked) {
          tab.onClicked(ev);
        } else {
          self.loadPage(tab.id, tab.url, true, tab.success);
        }
      }

    }
  });
};

function Tabs(opts) {
  this.navigator = dom.find(opts.navigatorId);
  this.content = dom.find(opts.contentId);
  this.tabActiveClass = opts.tabActiveClass;
  this.tabs = opts.tabs;
  this.lazy = opts.lazy !== false || true;
}

Tabs.prototype.loadPage = function(id, url) {
  let contentPage = dom.templatize('<div data-tab-content-id="{{id}}"></div>', {id: id});
  ajax.view({
    url: url,
    containerId: contentPage,
  });
  this.content.appendChild(contentPage);
};

Tabs.prototype.render = function() {
  let self = this;

  this.content.innerHTML = '';
  this.navigator.innerHTML = '';

  this.tabs.forEach((tab, idx) => {
    tab.style = tab.style || 'padding: 0 16px;';
    let nav = dom.templatize(`
      <div class="nav-item font-weight-bold mr-0" style="{{style}}"
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
      self.content.children.forEach((el, idx) => {
        el.style.display = 'none';
      });

      // 激活现在点击的页签及内容
      nav.classList.add(self.tabActiveClass);
      let contentPage = dom.find('div[data-tab-content-id=' + nav.getAttribute('data-tab-id') + ']', self.content);
      if (contentPage != null) {
        contentPage.style.display = '';
      } else {
        let id = nav.getAttribute('data-tab-id');
        let url = nav.getAttribute('data-tab-url');
        self.loadPage(id, url);
      }
    });

    // 激活默认页签及内容
    if (self.lazy) {
      if (idx == 0) {
        nav.classList.add(this.tabActiveClass);
        self.loadPage(tab.id, tab.url);
      }
    } else {
      if (idx == 0) {
        nav.classList.add(this.tabActiveClass);
      }
      self.loadPage(tab.id, tab.url);
    }
  });
};
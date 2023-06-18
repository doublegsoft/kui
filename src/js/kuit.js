if (typeof Handlebars !== 'undefined') {
  Handlebars.registerHelper('ifeq', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
}

kuit = {

};

kuit.main = opt => {
  let url = opt.url;
  let params = utils.getParameters(opt.url);
  params = {...params, ...opt.params};

  let title = opt.title || '';
  let callback = opt.success;

  xhr.get({
    url: url,
    success: function (resp) {
      let range = document.createRange();
      let fragment = range.createContextualFragment(resp);
      document.body.innerHTML = '';
      document.body.appendChild(fragment);
      if (callback)
        callback(title, fragment, params);
    }
  });
};

kuit.view = (opt) => {
  let container = dom.find('#container');

  // 销毁已加载的页面
  for (let i = 0; i < container.children.length; i++) {
    let pageId = container.children[i].getAttribute('page-id');
    if (window[pageId].destroy) {
      window[pageId].destroy();
    }
  }
  container.innerHTML = '';

  let url = opt.url;
  let params = utils.getParameters(opt.url);
  params = {...params, ...opt.params};

  let title = opt.title || '';
  let callback = opt.success;

  xhr.get({
    url: url,
    success: function (resp) {
      let fragment = null;
      if (container) {
        fragment = utils.append(container, resp, false);
      }
      if (callback)
        callback(title, fragment, params);

      // 顶部导航
      let fresh = dom.element(`
        <li class="active">${title}</li>
      `);
      pageMain.navPage.innerHTML = '';
      pageMain.navPage.appendChild(fresh);
      window[fragment.id].show(params);
      setTimeout(() => {
        fresh.classList.add('in');
        window[fragment.id].page.classList.add('in');
      }, 100);
    }
  });
};

kuit.stack = function(opt) {
  let container = dom.find('#container');

  let url = opt.url;
  let params = utils.getParameters(opt.url);
  params = {...params, ...opt.params};

  let title = opt.title || '';
  let callback = opt.success;


  // 隐藏已有的页面
  for (let i = 0; i < container.children.length; i++) {
    let page = container.children[i];
    if (page.tagName != 'DIV' || page.getAttribute('data-stack-back') == 'true') continue;
    page.style.display = 'none';
  }

  // 加载新页面
  xhr.get({
    url: url,
    success: function (resp) {
      let fragment = null;
      if (container) {
        fragment = utils.append(container, resp, false);
      }
      if (callback)
        callback(title, fragment, params);

      // 顶部导航
      for (let i = 0; i < pageMain.navPage.children.length; i++) {
        let child = pageMain.navPage.children[i];
        let title = child.innerText;
        child.innerText = '';
        let link = dom.element('<a href="#">' + title + '</a>');
        child.appendChild(link);
        child.removeAttribute('class');
        // child.classList.remove('active');
        dom.bind(link, 'click', kuit.switch);
        child.style.transform = 'unset';
      }
      let fresh = dom.element(`
        <li class="active">${title}</li>
      `);
      pageMain.navPage.appendChild(fresh);

      setTimeout(() => {
        fresh.classList.add('in');
        container.children[container.children.length - 1].classList.add('out');
        window[fragment.id].page.classList.add('in');
      }, 100);

      window[fragment.id].show(params);
    }
  });
};

kuit.switch = ev => {
  let container = dom.find('#container');
  let li = dom.ancestor(ev.target, 'li');
  let lis = Array.prototype.slice.call(pageMain.navPage.children);
  let index = lis.indexOf(li);
  for (let i = container.children.length - 1; i > index; i--) {
    let child = container.children[i];
    let pageId = child.getAttribute('page-id');
    if (window[pageId].destroy) {
      window[pageId].destroy();
    }
    lis[i].remove();
    child.remove();
  }
  let title = li.innerText;
  li.classList.add('active');
  li.innerHTML = title;
  container.children[index].style.display = '';
};

kuit.rightbar = opt => {
  
  let rightbar = dom.find('.rightbar');
  let overlay = dom.find('#overlay');
  rightbar.classList.remove('out');
  rightbar.classList.add('in');
  overlay.style.display = '';

  overlay.onclick = ev => {
    rightbar.classList.remove('in');
    rightbar.classList.add('out');
    overlay.style.display = 'none';
  };

  let url = opt.url;
  ajax.view({
    url: url,
    containerId: rightbar,
    success: () => {
      if (opt.success) {
        opt.success();
      }
    }
  });
};
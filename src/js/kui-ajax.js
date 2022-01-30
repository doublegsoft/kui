var ajax = {};

/**
 * 保存数据。
 * 
 * @param {string} url - 请求保存路径
 * 
 * @param {object} form - JQuery表单对象
 * 
 * @param {function} callback - 回调函数
 */
// ajax.save = function(url, form, callback) {
//   var errors = form.validate();
//   var errmsg = '';
//   for (var i = 0; i < errors.length; i++) {
//     errmsg += errors[i].message + '<br>';
//   }
//   if (errmsg != '') {
//     dialog.error(errmsg);
//     return;
//   }
//   var data = form.formdata();
//   $.ajax({
//     url : url,
//     data : data,
//     method : 'POST',
//     dataType : 'json',
//     success : function(resp) {
//       if (typeof resp.error !== 'undefined') {
//         dialog.error('保存出错！');
//         return;
//       }
//       dialog.success('保存成功！');
//       if (typeof callback !== 'undefined') {
//         callback(resp);
//       }
//     }
//   });
// };

ajax.save = function(opts) {

  var url = opts.url || '';
  var form = opts.form;
  var button = opts.button;
  var success = opts.success;

  var errors = form.validate();
  var errmsg = '';
  for (var i = 0; i < errors.length; i++) {
    errmsg += errors[i].message + '<br>';
  }
  if (errmsg != '') {
    dialog.error(errmsg);
    return;
  }

  if (button){
    button.prop('disabled', true);
  }

  var data = form.formdata();
  $.ajax({
    url : url,
    data : data,
    method : 'POST',
    dataType : 'json',
    success : function(resp) {
      if (typeof resp.error !== 'undefined') {
        dialog.error('保存信息出错！');
        if (button)
          button.prop('disabled', false);
        return;
      }
      dialog.success('保存信息成功！');
      if (typeof success !== 'undefined') {
        success(resp);
      }
      if (button)
        button.prop('disabled', false);
    },
    error: function () {
      dialog.error('系统异常！');
      if (button)
        button.prop('disabled', false);
    }
  });
};

/**
 * 保存数据的另一种形式。
 * 
 * @param {string} url - 请求保存路径
 * 
 * @param {object} form - JQuery表单对象
 * 
 * @param {function} callback - 回调函数
 */
ajax.post = function(opts) {
  let params = utils.getParameters(opts.url);
  let data = {...params, ...opts.data};
  $.ajax({
    url : opts.url,
    data : data,
    method : 'POST',
    dataType : 'json',
    success : function(resp) {
      // if (typeof resp.error !== 'undefined') {
      //   dialog.error('请求出错！');
      //   return;
      // }
      if (typeof opts.success !== 'undefined') {
        opts.success(resp);
      }
    }
  });
};

ajax.get = function(opts) {
  $.ajax({
    url : opts.url,
    data : opts.data,
    dataType : 'json',
    success : function(resp) {
      if (typeof opts.success !== 'undefined') {
        opts.success(resp);
      }
    }
  });
};

/**
 * 
 */
ajax.text = function(url, data, callback) {
  $.ajax({
    url : url,
    data : data,
    success : function(resp) {
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
    }
  });
};

/**
 * 加载服务器端的页面，替换现有容器中的元素。支持独立页面和数据库配置页面的加载。
 *
 * @param opt
 *        配置选项
 */
ajax.view = function(opt) {
  if (typeof schedule !== 'undefined' && opt.clear)
    schedule.stop();
  let url = opt.url;
  let empty = false;
  if (typeof opt.empty === 'undefined')
    empty = true;
  else
    empty = opt.empty;
  let page = opt.page;
  if (url && url.indexOf(":") == 0) {
    page = url.substring(1);
    url = null;
  }

  let params = utils.getParameters(opt.url);
  let data = {...params, ...opt.params};

  let title = opt.title || '';
  let containerId = opt.containerId;
  let callback = opt.success;

  let container = null;
  if (typeof containerId === 'string') {
    container = document.getElementById(containerId.trim());
    if (container == null) {
      container = document.querySelector(containerId.trim());
    }
  } else {
    container = containerId;
  }

  if (typeof data === 'undefined')
    data = {};
  if (window.parameters) {
    for (let k in data) {
      window.parameters[k] = data[k];
    }
  }

  if (url) {
    xhr.get({
      url: url,
      success: function (resp) {
        let fragment = null;
        if (container) {
          fragment = utils.append(container, resp, empty);
        }
        if (callback)
          callback(title, fragment, params);

        if (opt.initiative === true || !utils.isEmpty(params))
          window[fragment.id].show(params);
      }
    });
  } else if (page) {
    xhr.post({
      url: '/api/v3/common/script/stdbiz/uxd/custom_window/read',
      data: {
        customWindowId: page
      },
      success: function (resp) {
        let script = resp.data.script;
        if (!script) {
          script = '<div class="full-width full-height d-flex"><img src="img/under-construction.jpeg" class="m-auto full-width"></div>'
        }
        let fragment = null;
        if (container) {
          fragment = utils.append(container, script, empty);
        }
        if (callback)
          callback(title, fragment, params);
      }
    });
  }
};

/**
 * 添加服务器端页面到指定容器中，同样支持独立页面和数据库配置页面的加载。
 * <p>
 * 该模式只有在存在顶部可关闭菜单的情况下才有效。
 *
 * @param opts
 *        配置项
 */
ajax.append = function(opts) {
  if (typeof schedule !== 'undefined' && opts.clear)
    schedule.stop();

  let tabsMain = dom.find('#tabsMain');
  let tabsOthers = dom.find('#tabsOthers');

  if (tabsMain == null) {
    ajax.view(opts);
    return;
  }

  let currentCount = tabsMain.children.length;

  let url = opts.url;
  let title = opts.title || '';
  let containerId = opts.containerId;
  let data = opts.params;
  let callback = opts.success;

  let container = null;
  if (typeof containerId === 'string') {
    container = document.getElementById(containerId.trim());
    if (container == null) {
      container = document.querySelector(containerId.trim());
    }
  } else {
    container = containerId;
  }

  if (typeof data === 'undefined')
    data = {};
  if (window.parameters) {
    for (let k in data) {
      window.parameters[k] = data[k];
    }
  }

  clearActive();

  let existing = container.querySelector('div[data-url="' + url + '"]');
  if (existing != null) {
    // display page
    existing.classList.remove('hide');
    setTimeout(function() {
      existing.classList.add('show')
    }, 150);
    // highlight tab
    let link = dom.find('a[data-url="' + url + '"]', tabsMain);
    if (link != null) {
      link.classList.add('active');
      return;
    }
    dom.find('a[data-url="' + url + '"]', tabsOthers).classList.add('active');
    return;
  }

  function clearActive() {
    container.querySelectorAll('div[data-url]').forEach(elm => {
      elm.classList.remove('show');
      elm.classList.add('hide', 'fade', 'fadeIn');
    });
    // remove existing active
    tabsMain.querySelectorAll('a.active').forEach(a => {
      a.classList.remove('active');
    });
    tabsOthers.querySelectorAll('a.active').forEach(a => {
      a.classList.remove('active');
    });
  }

  function shiftToOthers(tab) {
    dom.find('a', tab).classList.add('pointer');
    dom.find('a', tab).classList.remove('nav-link');
    dom.find('a', tab).classList.add('dropdown-item');
    dom.find('i', tab).classList.remove('ml-1');
    dom.find('i', tab).classList.add('float-right');
    if (tabsOthers.children.length == 0)
      tabsOthers.appendChild(tab);
    else
      tabsOthers.insertBefore(tab, tabsOthers.children[0]);
  }

  function shiftToMain(tab) {
    dom.find('a', tab).classList.add('nav-link');
    dom.find('a', tab).classList.remove('dropdown-item');
    dom.find('i', tab).classList.add('ml-1');
    dom.find('i', tab).classList.remove('float-right');
    tabsMain.appendChild(tab);
  }

  function appendHeadLink(title, url) {
    if (title == '' || tabsMain == null) return;
    let tab = dom.element(`
      <li class="nav-item">
        <a class="nav-link head-link">
          <span></span>
          <i class="fas fa-times-circle ml-1"></i>
        </a>
      </li>
    `);

    dom.find('a', tab).setAttribute('data-url', url);

    // close page and tab
    dom.bind(dom.find('i', tab), 'click', event => {
      event.preventDefault();
      event.stopPropagation();
      let link = event.target.parentElement;
      let existing = container.querySelector('div[data-url="' + link.getAttribute('data-url') + '"]');
      if (existing) existing.remove();
      event.target.parentElement.parentElement.remove();

      let opens = container.querySelectorAll('div[data-url]');
      if (opens.length > 0) {
        tabsMain.children[0].click();
      }

      // shift to main
      if (tabsOthers.children.length > 0) {
        let tabShift = tabsOthers.children[0];
        tabShift.remove();
        shiftToMain(tabShift);
      }
    });

    // activate listener
    dom.bind(dom.find('a', tab), 'click', event => {
      let link = dom.ancestor(event.target, 'a')
      if (link.classList.contains('active')) return;
      clearActive();
      link.classList.add('active');
      displayPage(a.getAttribute('data-url'));
    });

    // check tab existing
    let existing = false;
    tabsMain.querySelectorAll('li').forEach(li => {
      if (dom.find('span', li).innerText == title) {
        existing = true;
        dom.find('a', li).classList.add('active');
      }
    });
    if (existing) return;

    // insert first
    if (currentCount == 0)
      tabsMain.appendChild(tab);
    else if (currentCount + 1 > MAX_HEAD_LINK_COUNT) {
      // shift last head link from main to others
      let tabShift = dom.find('li:last-child', tabsMain);
      tabShift.remove();
      shiftToOthers(tabShift);
    }
    tabsMain.insertBefore(tab, tabsMain.children[0]);

    // render text and style
    let span = dom.find('span', tab);
    let a = dom.find('a', tab);
    a.classList.add('active');
    span.innerText = title;
  }

  function displayPage(url) {
    container.querySelectorAll('div[data-url]').forEach(elm => {
      elm.classList.remove('show');
      elm.classList.add('hide');
    });
    let existing = container.querySelector('div[data-url="' + url + '"]');
    if (existing != null) {
      // display page
      existing.classList.remove('hide');
      setTimeout(function() {
        existing.classList.add('show')
      }, 150);
      // highlight tab
      let link = dom.find('a[data-url="' + url + '"]', tabsMain);
      if (link != null) {
        link.classList.add('active');
        return;
      }
      dom.find('a[data-url="' + url + '"]', tabsOthers).classList.add('active');
      return;
    }

    xhr.get({
      url: url,
      success: function (resp) {
        utils.append(container, resp, false)

        for (let i = container.children.length - 1; i >= 0; i--) {
          let div = container.children[i];
          if (div.tagName == 'DIV') {
            div.setAttribute('data-url', url);
            setTimeout(function () {
              div.classList.add('show')
            }, 150);
            break;
          }
        }
        appendHeadLink(title, url);
        if (callback)
          callback(title, resp);
      }
    });
  }

  if (url.indexOf(':') == 0) {
    let customWindowId = url.substring(1);
    xhr.post({
      url: '/api/v3/common/script/stdbiz/uxd/custom_window/read',
      data: {
        customWindowId: customWindowId
      },
      success: function (resp) {
        let script = resp.data.script;
        let fragment = null;
        utils.append(container, script, false);
        // if (container) {
        //   let range = document.createRange();
        //   fragment = range.createContextualFragment(script);
        //   container.appendChild(fragment);
        // }
        for (let i = container.children.length - 1; i >= 0; i--) {
          let div = container.children[i];
          if (div.tagName == 'DIV') {
            div.setAttribute('data-url', url);
            setTimeout(function () {
              div.classList.add('show')
            }, 150);
            break;
          }
        }
        appendHeadLink(title, url);
        stdbiz.render(customWindowId, container.querySelector('[data-url="' + url + '"]'), {});
      }
    });
  } else {
    displayPage(url);
  }
};

/**
 * 弹出式显示全屏页面，屏蔽现有页面但不替换。
 *
 * @param opts
 *        配置项
 */
ajax.shade = function(opts) {
  if (typeof schedule !== 'undefined')
    schedule.stop();
  let url = opts.url;
  let callback = opts.success;

  let shade = document.querySelector('.page.full');
  if (shade != null) shade.parentElement.remove();
  if (url.indexOf(':') === -1) {
    xhr.get({
      url: url,
      success: function (resp) {
        let fragment = utils.append(document.body, resp);
        if (callback)
          callback(opts.title || '', fragment);
      }
    });
  } else {
    xhr.post({
      url: '/api/v3/common/script/stdbiz/uxd/custom_window/read',
      data: {
        customWindowId: url.substring(1)
      },
      success: function (resp) {
        let script = resp.data.script;
        let fragment = utils.append(document.body, script);
        if (callback)
          callback(opts.title || '', fragment);
      }
    });
  }
};

/**
 * 叠加远程页面到现有容器中，不替换现有页面，只隐藏现有页面。
 *
 * @param opt
 *        配置项
 */
ajax.stack = function(opt) {
  if (typeof schedule !== 'undefined' && opt.clear)
    schedule.stop();

  let pageId = opt.pageId;
  let params = opt.params;
  let container = dom.find(opt.containerId);

  if (typeof params === 'undefined')
    params = {};

  let existing = false;
  for (let i = 0; i < container.children.length; i++) {
    let page = container.children[i];
    if (page.tagName != 'DIV' || page.getAttribute('data-stack-back') == 'true') continue;
    page.classList.remove('show');
    page.classList.add('hide');
    if (page.id == pageId) {
      page.classList.remove('hide');
      page.classList.add('show');
      existing = true;
    }
  }
  if (!existing) {
    opt.empty = false;
    ajax.view(opt);
  }
  // floating back button
  let back = dom.find('div[data-stack-back]', container);
  if (back != null) return;
  back = dom.element(`
    <div data-stack-back="true" class="pointer">
      <i class="fas fa-angle-left font-32" style="margin-top: 12px;"></i>
    </div>
  `);
  back.style.position = 'fixed';
  back.style.width = '60px';
  back.style.height = '60px';
  back.style.bottom = '40px';
  back.style.right = '40px';
  back.style.backgroundColor = '#0C9';
  back.style.color = '#fff';
  back.style.borderRadius = '50px';
  back.style.textAlign = 'center';
  back.style.boxShadow = '2px 2px 3px #999';
  back.style.zIndex = '99';
  dom.bind(back, 'click', ev => {
    back.remove();
    ajax.unstack({
      containerId: container,
    });
  });
  container.appendChild(back);
};

ajax.unstack = function(opt) {
  let container = dom.find(opt.containerId);
  let stackedPage = container.children[container.children.length - 1];
  stackedPage.remove();
  let hiddenPage = container.children[container.children.length - 1];
  hiddenPage.classList.remove('hide');
  hiddenPage.classList.add('show');
}

/**
 * Uses handlebars template engine to render a template block after 
 * getting data from backend.
 * 
 * @param {string} url 
 *        the http url to get data
 * 
 * @param {string} containerId
 *        the id of container to append rendered source
 * 
 * @param {string} templateId
 *        the id of template html block
 * 
 * @param {object} data 
 *        the http request data
 * 
 * @param {function} callback
 *        the callback function after rendering
 */
ajax.template = function(opts) {
  let url = opts.url;
  let usecase = opts.usecase;
  let containerId = opts.containerId;
  let templateId = opts.templateId;
  let data = opts.data;
  let callback = opts.success;

  xhr.post({
    url: url,
    usecase: usecase,
    data: data,
    success: function(resp) {
      if (containerId) {
        var source = document.getElementById(templateId).innerHTML;
        var template = Handlebars.compile(source);
        var html = template(resp);

        var container = document.getElementById(containerId);
        container.innerHTML = html;
      }
      if (callback)
        callback(resp);
    }
  });
};

/**
 * 直接打开页面窗口。
 * 
 * @param {string} title - 标题
 * 
 * @param {string} url - 资源链接
 * 
 * @param {object} data - 请求参数数据
 * 
 * @param {integer} width - 宽度
 * 
 * @param {integer} height - 高度
 */
// ajax.dialog = function(title, url, data, width, height, success, end) {
//   for (var key in data) {
//     window.parameters[key] = data[key];
//   }
//   $.ajax({
//     url : url,
//     data : data,
//     async : true,
//     success : function(html) {
//       layer.open({
//         type : 1,
//         title : title,
//         shadeClose : false,
//         skin : 'layui-layer-rim', //加上边框
//         area : [ width + 'px', height + 'px' ], //宽高
//         content : html,
//         success: function (layero, index) {
//           var layerContent = document.querySelector('.layui-layer-content');
//           layerContent.style += '; overflow: hidden;';
//           if (success) success();
//         },
//         end: end || function () {}
//       });
//     }
//   });
// };

/**
 * 直接打开页面窗口。
 * 
 * @param {object} opts - 配置项，包括title, url, params, success, end
 */
// ajax.dialog = function(opts) {
//   let title = opts.title || '';
//   let url = opts.url || '';
//   let data = opts.params || {};
//   let callback = opts.success;
//   let end = opts.end;
//   let shadeClose = opts.shadeClose !== false;
//
//   if (window.parameters) {
//     for (var key in data) {
//       window.parameters[key] = data[key];
//     }
//   }
//   $.ajax({
//     url : url,
//     data : data,
//     async : true,
//     success : function(html) {
//       layer.open({
//         type : 1,
//         offset: '120px',
//         title : title,
//         closeBtn: 0,
//         shadeClose : shadeClose,
//         area : ['50%', '50%'],
//         content : html,
//         success: function (layero, index) {
//           var layerContent = document.querySelector('.layui-layer-content');
//           layerContent.style += '; overflow: hidden;';
//           if (callback) callback();
//         },
//         end: end || function () {}
//       });
//     }
//   });
// };

/**
 * 支持shade close。
 */
ajax.dialog = function(opts) {
  let title = opts.title || '';
  let url = opts.url || '';
  let data = opts.params || {};
  let callback = opts.success;
  let end = opts.end;
  let shadeClose = opts.shadeClose !== false;
  let allowClose = opts.allowClose === true;
  let width=opts.width || '80%';
  let height = opts.height || '';
  let offset=opts.offset || 'auto'

  if (window.parameters) {
    for (var key in data) {
      window.parameters[key] = data[key];
    }
  }
  $.ajax({
    url : url,
    data : data,
    async : true,
    success : function(html) {
      layer.open({
        type : 1,
        offset: offset,
        title : title,
        closeBtn: (allowClose === true) ? 1: 0,
        shade: 0.3,
        shadeClose : shadeClose,
        area : [width, height],
        content : html,
        success: function (layero, index) {
          let layerContent = document.querySelector('.layui-layer-content');
          layerContent.style += '; overflow: hidden;';
          if (callback) callback();
        },
        end: end || function () {}
      });
    }
  });
};

/**
 * 直接打开视频窗口。
 * 
 * @param {string} url - 资源链接
 * 
 * @param {object} data - 请求参数数据
 * 
 * @param {integer} width - 宽度
 * 
 * @param {integer} height - 高度
 */
ajax.video = function(url, data, width, height) {
  layer.open({
    type : 2,
    title : false,
    closeBtn : 1, //不显示关闭按钮
    shade : [ 0 ],
    area : [ width + 'px', height + 'px' ],
    offset : 'rb', //右下角弹出
    anim : 2,
    content : [ url, 'no' ]
  //iframe的url，no代表不显示滚动条
  });
};

/**
 * 加载SVG图片利用ajax方法。
 */
ajax.svg = function(url, cntr, data, callback) {
  if (typeof data === 'undefined')
    data = {};
  $.ajax({
    url : url,
    data : data,
    success : function(xml) {
      cntr.empty();
      var html = new XMLSerializer().serializeToString(xml.documentElement);
      cntr.html(html);
      if (callback)
        callback(xml);
    }
  });
};

/**
 * 利用ajax上传文件。
 */
ajax.upload = function(opts) {
  let data = opts.data;
  if (typeof data === 'undefined')
    data = {};
  let formdata = new FormData();
  for (let k in data) {
    formdata.append(k, data[k]);
  }
  $.ajax({
    url : opts.url,
    data : formdata,
    method : 'POST',
    cache: false,
    contentType : false,
    processData : false,
    xhr: function() {
      var ret = $.ajaxSettings.xhr();
      if(ret.upload && opts.progress){
        ret.upload.addEventListener('progress', function(e) {
          if(e.lengthComputable){
            if (opts.progress)
              opts.progress(e.total, e.loaded);
          }  
        }, false);
      }
      return ret;
    },
    success: function(resp) {
      if (opts.success)
        opts.success(resp);
    },
    error: function(resp) {
      if (opts.error)
        opts.error(resp);
    }
  });
};

ajax.sidebar = function(opt) {
  let container = dom.find(opt.containerId);
  let success = opt.success || function(title, fragment) {};
  // only one instance
  let sidebar = dom.find('[widget-id=right-bar]'/*, container */);
  let allowClose = opt.allowClose || false;
  if (sidebar != null) sidebar.remove();
  sidebar = dom.element(`
    <div widget-id="right-bar" style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background: transparent; z-index: 999999;">
      <div class="right-bar fade show">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="card-header pl-3">
              <h5 class="modal-title"></h5>
              <button type="button" class="close text-danger">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body" style="overflow-y: auto;"></div>
            <div style="position: absolute; bottom: 24px; left: 0; width: 100%; height: 48px; border-top: 1px solid lightgrey; background: white; display:none;">
              <div widget-id="right-bar-bottom" class="mh-10 mt-2" style="float: right;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
  if (opt.showBottom === true) {
    dom.find('.modal-body', sidebar).style.marginBottom = '36px';
    dom.find('[widget-id=right-bar-bottom]', sidebar).parentElement.style.display = '';
  }
  // dom.height(sidebar, 0, document.body);
  sidebar.addEventListener('click', (evt) => {
    let widgetId = evt.target.getAttribute('widget-id');
    if (widgetId !== 'right-bar') return;
    sidebar.children[0].classList.remove('in');
    sidebar.children[0].classList.add('out');
    setTimeout(function () {
      sidebar.remove();
    }, 300);
  });
  container.appendChild(sidebar);
  // get page id and reset url to null
  if (opt.url.indexOf(':') == 0) {
    opt.page = opt.url.substring(1);
    opt.url = null;
  }
  if (opt.url) {
    xhr.get({
      url: opt.url,
      success: function (resp) {
        dom.find('.modal-title', sidebar).innerHTML = opt.title || '';
        dom.find('.modal-body', sidebar).innerHTML = '';
        if (!allowClose && !opt.close) {
          dom.find('button.close', sidebar).classList.add('hidden');
        }
        dom.find('button.close', sidebar).addEventListener('click', function () {
          //关闭弹窗
          sidebar.children[0].classList.add('out');
          sidebar.remove();
          if (opt.close)
            opt.close();
        });
        let fragment = utils.append(dom.find('.modal-body', sidebar), resp);
        if (success) success(opt.title || '', fragment);
        setTimeout(function () {
          sidebar.children[0].classList.remove('out');
          sidebar.children[0].classList.add('in');
        }, 300);
      }
    });
  } else {
    xhr.post({
      url: '/api/v3/common/script/stdbiz/uxd/custom_window/read',
      params: {
        customWindowId: opt.page
      },
      success: function (resp) {
        let script = resp.data.script;
        dom.find('.modal-body', sidebar).innerHTML = '';
        let fragment = utils.append(dom.find('.modal-body', sidebar), script);
        dom.find('.modal-title', sidebar).innerHTML = opt.title || '&nbsp;';
        if (!allowClose && !opt.close) {
          dom.find('button.close', sidebar).classList.add('hidden');
        }
        dom.find('button.close', sidebar).addEventListener('click', function () {
          dom.find('.right-bar').classList.add('out');
          setTimeout(function () {
            sidebar.remove();
          }, 300);
          // 关闭回调
          if (opt.close)
            opt.close();
        });
        if (success) success(opt.title || '', fragment);
        setTimeout(function () {
          sidebar.children[0].classList.remove('out');
          sidebar.children[0].classList.add('in');
        }, 300);
      }
    });
  }
};

ajax.bottombar = function(opt) {
  let container = dom.find(opt.containerId);
  let success = opt.success || function() {};
  let sidebar = dom.find('.bottom-bar', container);
  let allowClose = opt.allowClose || false;
  if (sidebar != null) sidebar.remove();
  sidebar = dom.element(`
    <div class="bottom-bar fade show">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="card-header pt-2 pb-2">
            <button type="button" class="close text-danger">
              <i class="fas fa-times"></i>
            </button>
            <h5 class="modal-title"></h5>
          </div>
          <div class="modal-body" style="overflow-y: auto"></div>
        </div>
      </div>
    </div>
  `);
  container.appendChild(sidebar);
  // adjust the width of bottom bar
  let width = sidebar.parentElement.clientWidth;
  let paddingLeft = parseInt(window.getComputedStyle(sidebar.parentElement, null).getPropertyValue('padding-left'));
  let paddingRight = parseInt(window.getComputedStyle(sidebar.parentElement, null).getPropertyValue('padding-right'));
  sidebar.style.width = (width - paddingRight - paddingLeft) + 'px';
  if (opt.url) {
    xhr.get({
      url: opt.url,
      success: function (resp) {
        dom.find('.modal-title', sidebar).innerHTML = opt.title || '';
        if (!allowClose && !opt.close) {
          dom.find('button.close', sidebar).classList.add('hidden');
        }
        dom.find('button.close', sidebar).addEventListener('click', function () {
          dom.find('.bottom-bar').classList.add('out');
          // 关闭回调
          if (opt.close)
            opt.close();
        });
        utils.append(dom.find('.modal-body', sidebar), resp);
        if (success) success(resp);
        setTimeout(function () {
          sidebar.classList.remove('out');
          sidebar.classList.add('in');
        }, 200);
      }
    });
  } else {
    xhr.post({
      url: '/api/v3/common/script/stdbiz/uxd/custom_window/read',
      data: {
        customWindowId: opt.page
      },
      success: function (resp) {
        let script = resp.data.script;
        utils.append(dom.find('.modal-body', sidebar), script);
        dom.find('.modal-title', sidebar).innerHTML = opt.title;
        if (!allowClose && !opt.close) {
          dom.find('button.close', sidebar).classList.add('hidden');
        }
        dom.find('button.close', sidebar).addEventListener('click', function () {
          dom.find('.bottom-bar').classList.add('out');
          // 关闭回调
          if (opt.close)
            opt.close();
        });
        if (success) success(resp);
        setTimeout(function () {
          sidebar.classList.remove('out');
          sidebar.classList.add('in');
        }, 200);
      }
    });
  }
};

ajax.tabs = function(opts) {
  let container = document.querySelector(opts.containerId);
  let tabs = opts.tabs;
  let closeable = opts.closeable || false;
  let ul = dom.create('ul', 'nav', 'nav-tabs');
  let div = dom.create('div', 'tab-content');

  let buttons = dom.create('div', 'float-right');
  let refresh = dom.create('button', 'btn', 'btn-link');
  buttons.appendChild(refresh);

  function reload(container, url, page, data) {
    ajax.view({
      url: url,
      containerId: container,
      success: function() {
        if (window[page])
          window[page].show(data);
      }
    });
  }

  dom.bind(refresh, 'click', function() {
    let link = dom.find('li.active link', this.parentElement.parentElement);
    let url = link.getAttribute('data-model-url');
    let page = link.getAttribute('data-model-page');
    let data = JSON.parse('data-model-data');
    let pane = dom.find('div.tab-content div[data-model-url=\'' + url + '\']', this.parentElement.parentElement);
    reload(pane, url, page, data);
  });

  for (let i = 0; i < tabs.length; i++) {
    let tab = tabs[i];
    let li = dom.create('li', 'nav-item');
    let link = dom.create('a', 'nav-link');
    if (i == 0) {
      link.classList.add('active');
    }
    link.setAttribute('data-model-url', tab.url);
    link.setAttribute('data-model-data', JSON.stringify(tab.data || {}));
    link.setAttribute('data-model-page', tab.page);
    link.innerHTML = tab.title;
    dom.bind(link, 'click', function() {
      if (this.classList.contains('active')) return;
      dom.find('a.active', this.parentElement.parentElement.parentElement).classList.remove('active');
      dom.find('div.active', this.parentElement.parentElement.parentElement).classList.remove('active');
      let url = link.getAttribute('data-model-url');
      let data = JSON.parse(link.getAttribute('data-model-data'));
      let page = link.getAttribute('data-model-page');
      let pane = dom.find('div.tab-content div[data-model-url=\'' + url + '\']', this.parentElement.parentElement.parentElement);

      this.classList.add('active');
      pane.classList.add('active');
      if (pane.innerHTML.trim() === '') reload(pane, url, page, data);
    });
    li.appendChild(link);
    ul.appendChild(li);
    let pane = dom.create('div', 'tab-pane');
    if (i == 0) {
      pane.classList.add('active');
      reload(pane, tab.url, tab.page, tab.data);
    }
    pane.setAttribute('data-model-url', tab.url);
    div.append(pane);
  }
  container.appendChild(buttons);
  container.appendChild(ul);
  container.appendChild(div);
};
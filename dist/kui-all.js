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

  if (window._current_view) {
    if (window._current_view.destroy) {
      window._current_view.destroy();
    }
    delete window._current_view;
  }
  if (url) {
    xhr.get({
      url: url,
      success: function (resp) {
        let fragment = null;
        if (container) {
          fragment = utils.append(container, resp, empty);
        }
        if (fragment && fragment.id && window[fragment.id] && window[fragment.id].show && !callback) {
          window[fragment.id].show(params);
          window._current_view = window[fragment.id];
        }
        if (callback)
          callback(title, fragment, params);
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
        let params = utils.getParameters(url);
        let fragment = utils.append(container, resp, false)
        if (fragment.id && window[fragment.id] && window[fragment.id].show) {
          window[fragment.id].show(params);
        }
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

ajax.shade2 = function(opts) {
  if (typeof schedule !== 'undefined')
    schedule.stop();
  let url = opts.url;
  let callback = opts.success;

  xhr.get({
    url: url,
    success: function (resp) {
      let fragment = utils.append(document.body, resp);
      if (callback)
        callback(opts.title || '', fragment);
    }
  });
};

ajax.overlay = function(opts) {
  if (typeof schedule !== 'undefined')
    schedule.stop();
  let url = opts.url;
  let html = opts.html;
  let callback = opts.success;

  let shade = document.querySelector('.page.overlay');
  if (shade != null) shade.parentElement.remove();
  if (url) {
    xhr.get({
      url: url,
      success: function (resp) {
        let fragment = utils.append(document.body, resp);
        if (callback)
          callback(opts.title || '', fragment);
      }
    });
  } else {
    let fragment = utils.append(document.body, html);
    if (callback)
      callback(opts.title || '', fragment);
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
ajax.dialog = async function(opts) {
  let title = opts.title || '';
  let url = opts.url;
  let html = opts.html;
  let data = opts.params || {};
  let callback = opts.success;
  let end = opts.end;
  let shadeClose = opts.shadeClose === false ?  false : true;
  let allowClose = opts.allowClose === true;
  let width = opts.width || '80%';
  let height = opts.height || '';
  let offset=opts.offset || 'auto'

  if (window.parameters) {
    for (var key in data) {
      window.parameters[key] = data[key];
    }
  }
  if (url) {
    html = await xhr.asyncGet({
      url: url,
    });
  }

  layer.open({
    type : 1,
    offset: offset,
    title : title,
    closeBtn: (allowClose === true) ? 1: 0,
    shade: 0.5,
    shadeClose : shadeClose,
    area : [width, height],
    content : html,
    success: function (layero, index) {
      let layerContent = document.querySelector('.layui-layer-content');
      layerContent.style.overflow = 'hidden';
      if (title != '') {
        layerContent.style.height = 'calc(100% - 42px);';
      }
      if (callback) callback();
    },
    end: end || function () {}
  });

  // $.ajax({
  //   url : url,
  //   data : data,
  //   async : true,
  //   success : function(html) {
  //     layer.open({
  //       type : 1,
  //       offset: offset,
  //       title : title,
  //       closeBtn: (allowClose === true) ? 1: 0,
  //       shade: 0.5,
  //       shadeClose : shadeClose,
  //       area : [width, height],
  //       content : html,
  //       success: function (layero, index) {
  //         let layerContent = document.querySelector('.layui-layer-content');
  //         layerContent.style += '; overflow: hidden;';
  //         if (callback) callback();
  //       },
  //       end: end || function () {}
  //     });
  //   }
  // });
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

ajax.sidebar = async function(opt) {
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
              <button type="button" class="close text-danger position-relative">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body" style="overflow-y: auto;"></div>
            <div style="position: absolute; bottom: 24px; left: 0; width: 100%; height: 48px; border-top: 1px solid lightgrey; background: white; display:none; z-index: 99999999;">
              <div widget-id="right-bar-bottom" class="mh-10 mt-2" style="float: right;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
  if (opt.showBottom === true) {
    dom.find('.modal-body', sidebar).style.marginBottom = '48px';
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
  if (opt.url && opt.url.indexOf(':') == 0) {
    opt.page = opt.url.substring(1);
    opt.url = null;
  }
  let html = '';
  if (opt.url) {
    html = await xhr.asyncGet({
      url: opt.url,
    });
  } else if (opt.html) {
    html = opt.html;
  }
  dom.find('.modal-title', sidebar).innerHTML = opt.title || '';
  dom.find('.modal-body', sidebar).innerHTML = '';
  if (!allowClose && !opt.close) {
    dom.find('button.close', sidebar).classList.add('hidden');
  }
  if (allowClose === true) {
    // 自动调整关闭按钮为居中显示
    let button = dom.find('button.close', sidebar);
    let header = dom.find('.card-header', sidebar);
    let rectButton = button.getBoundingClientRect();
    let rectHeader = header.getBoundingClientRect();
    let gap = (rectHeader.height - rectButton.height) / 2;
    button.style.top = gap + 'px';
    button.style.right = gap + 'px';
  }
  dom.find('button.close', sidebar).addEventListener('click', function () {
    //关闭弹窗
    sidebar.children[0].classList.add('out');
    sidebar.remove();
    if (opt.close)
      opt.close();
  });
  let fragment = utils.append(dom.find('.modal-body', sidebar), html);
  if (success) success(opt.title || '', fragment);
  setTimeout(function () {
    sidebar.children[0].classList.remove('out');
    sidebar.children[0].classList.add('in');
  }, 300);
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
        if (window[page]) {
          window[page].show(data);
        }
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

ajax.download = (url, name) => {
  fetch(url).then(res => res.blob()).then(blob => {
    let a = document.createElement('a');
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name + '.docx';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  });
};

ajax.upload = params => {
  let fileinput = dom.create('input');
  fileinput.setAttribute('type', 'file');
  fileinput.setAttribute('accept', params.accept || '*');
  fileinput.style.display = 'none';
  fileinput.onchange = async ev => {
    let file = fileinput.files[0];
    let res = await xhr.asyncUpload({
      url: '/api/v3/common/upload',
      params: {
        directoryKey: params.directoryKey,
      },
      file: file,
    });
    if (params.success) {
      params.success(res);
    }
  };
  fileinput.click();
  // let result = await xhr.promise({
  //   url: '/api/v3/common/upload',
  // });
};
function Couch(host, database) {
  this.host = host;
  this.database = database;
}

Couch.prototype.read = function (docId) {
  let url = this.host + '/' + this.database + '/' + docId;
  let method = 'POST';
  let result = this.request({
    url: url
  }, method);
  return result;
};

Couch.prototype.save = function(doc) {
  let url = this.host + '/' + this.database;
  let method = 'POST';
  if (doc.id) {
    url += '/' + doc.id + '?rev=' + doc.rev;
    doc.id = undefined;
    method = 'PUT';
  }
  let result = this.request({
    url: url,
    data: doc
  }, method);
  if (result.id) {
    doc.id = result.id;
    doc.rev = result.rev;
  } else {
    doc.error = result;
  }
  return doc;
};

Couch.prototype.upload = function(doc, file) {

};

Couch.prototype.request = function (opts, method) {
  let url = opts.url;
  let data = opts.data;
  let type = opts.type || 'json';
  let success = opts.success;
  let error = opts.error;

  let req  = new XMLHttpRequest();
  req.open(method, url, false);
  req.setRequestHeader("Content-Type", "application/json");
  req.onload = function () {
    let resp = req.responseText;
    if (type == 'json')
      try {
        resp = JSON.parse(resp);
      } catch (err) {
        if (error) error(resp);
        return;
      }
    if (req.readyState == 4 && req.status == "200") {
      if (success) success(resp);
    } else {
      if (error) error(resp);
    }
  }
  if (data)
    req.send(JSON.stringify(data));
  else
    req.send(null);
  return JSON.parse(req.responseText);
};

if (typeof module !== 'undefined')
  module.exports = Couch;
if (typeof dialog === 'undefined') dialog = {};

dialog.alert = function (message) {
  layer.open({
    type: 0,
    icon: 0,
    offset: '150px',
    shade: 0,
    shadeClose: true,
    title: '警告',
    content: message,
  });
};


dialog.info = function (message) {
  layer.open({
    type: 0,
    offset: '150px',
    shade: 0,
    shadeClose: true,
    title: '信息',
    content: message,
  });
};

/**
 * 支持shadeClose
 */
dialog.info2 = function (message) {
  layer.open({
    type: 0,
    offset: '100px',
    shade: 0.3,
    shadeClose: true,
    title: '信息',
    content: message,
  });
};

dialog.error = function (message) {
  message = message.replaceAll('\n', '<br>');
  layer.open({
    type: 0,
    icon: 2,
    offset: '150px',
    shade: 0,
    shadeClose: true,
    title: '错误',
    content: message,
  });
};

dialog.success = function (message, callback) {
  if (callback) {
    layer.open({
      type: 0,
      icon: 1,
      offset: '150px',
      shade: 0,
      shadeClose: true,
      title: '成功',
      content: message,
      btn: ['确定', '确定并返回'],
      yes: function (index, layero) {
        layer.close(index);
      },
      btn2: function (index, layero) {
        layer.close(index);
        callback();
      }
    });
  } else {
    layer.open({
      type: 0,
      icon: 1,
      offset: '150px',
      shade: 0,
      shadeClose: true,
      title: '成功',
      content: message
    });
  }
};

dialog.confirm = function (message, callback) {
  layer.confirm(message, {
    title: '确认',
    btn: ['确定', '取消'] //按钮
  }, function (index, content) {
    let data = dom.formdata(content[0]);
    layer.close(index);
    callback(data);
  }, function () {

  });
};

dialog.view = function (opts) {
  let dialogTemplate = '' +
    '<div class="modal fade fadeIn show" id="dialogApplication">' +
    '  <div class="modal-dialog modal-dialog-centered">' +
    '    <div class="modal-content">' +
    '      <div class="modal-header">' +
    '        <h4 class="modal-title">{{title}}</h4>' +
    '        <button type="button" class="close" data-dismiss="modal">&times;</button>' +
    '      </div>' +
    '      <div id="dialogApplicationBody" class="modal-body">{{{body}}}</div>' +
    '      <div class="modal-footer">' +
    '        {{#each buttons}}' +
    '        <button type="button" class="btn {{class}}" data-dismiss="modal">{{text}}</button>' +
    '        {{/each}}' +
    '        <button type="button" class="btn btn-close" data-dismiss="modal">关闭</button>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '</div>';
  let title = opts.title;
  let url = opts.url;
  let body = $(document.body);

  if ($('#dialogApplication').length)
    $('#dialogApplication').remove();

  let buttons = [];
  if (opts.save) {
    buttons.push({
      text: '保存',
      class: 'btn-save',
      onClicked: opts.save
    })
  }
  $.ajax({
    url: url,
    success: function (resp) {
      let template = Handlebars.compile(dialogTemplate);
      let html = template({
        title: title,
        body: resp,
        buttons: buttons
      });
      $(document.body).append(html);
      if (opts.success) {
        opts.success({
          onClosed: opts.onClosed,
        });
      }
      $('#dialogApplication').modal('show');
    }
  });
};

dialog.select = function(opts) {
  ajax.view({
    url: opts.url,
    success: function(resp) {
      layer.open({
        type: 0,
        icon: 1,
        offset: '150px',
        shade: 0.5,
        shadeClose: true,
        title: opts.title,
        content: resp
      });
    }
  });
};

dialog.simplelist = async function(opt) {
  let data = await xhr.promise({
    url: opt.url,
    params: opt.params || {},
  });
  let holder = dom.element(`
    <div>
      <ul class="list-group"></ul>
    </div>
  `);
  let ul = dom.find('ul', holder);
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    let li = dom.create('li', 'list-group-item', 'list-group-item-action');
    dom.model(li, item);
    li.innerText = item[opt.fields.text];
    ul.appendChild(li);

  }
  layer.open({
    type: 0,
    closeBtn: 1,
    btn: [],
    shade: 0.5,
    shadeClose: true,
    title: '',
    content: holder.innerHTML,
    success: function(layro, index) {
      layro.get(0).querySelectorAll('li').forEach((el, idx) => {
        dom.bind(el, 'click', (ev) => {
          layer.close(layer.index);
          let model = dom.model(ev.target);
          opt.onAccept(model);
        });
      })
    }
  });
};

dialog.html = function(opt) {
  layer.open({
    type: 0,
    closeBtn: 1,
    offset: '150px',
    shade: 0.5,
    area : [opt.width || '50%', ''],
    shadeClose: true,
    title: opt.title || '&nbsp;',
    content: opt.html,
    btn: ['确定', '关闭'],
    success: function(layero, index) {
      if (opt.load) opt.load(layero, index);
    },
    yes: function (index, layers) {
      let layerContent = dom.find('div.layui-layer-content', layers[0]);
      if (layerContent.children.length == 1) {
        opt.success(layerContent.children[0]);
      } else {
        opt.success(layerContent.children);
      }
      layer.close(index);
    },
    btn1: function () {

    }
  });
};

dialog.iframe = function(opt) {
  layer.open({
    title: opt.title,
    type: 2,
    area: [opt.width, opt.height],
    // fixed: false, //不固定
    // maxmin: true,
    content: opt.url,
    resize: false,
    maxmin: true,
    shade: false,
    success: opt.success || function(layro, index) {},
  });
};
if (typeof dnd === 'undefined')
  dnd = {};

dnd.setDraggable = function (selector, payload, callback) {
  let element;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  element.setAttribute("draggable", "true");
  element.ondragstart = function(ev) {
    let li = element;// dom.ancestor(ev.target, 'li');
    let dragImage = li.getAttribute('widget-drag-image');
    let x = event.clientX;
    let y = event.clientY;
    for (let key in payload)
      ev.dataTransfer.setData(key, payload[key]);
    if (dragImage && dragImage != '') {
      let image = new Image();
      image.src = dragImage;
      ev.dataTransfer.setDragImage(image, x, y);
    }
    let target = event.target;
    if (callback) {
      callback(x, y, target);
    }
  };
};

dnd.clearDraggable = function(selector) {
  let element;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  element.setAttribute("draggable", "false");
  element.removeEventListener("dragstart", function() {});
};

dnd.setDroppable = function (selector, callback) {
  let element;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  element.ondragover = function (event) {
    event.preventDefault();
  };
  element.ondrop = function (event) {
    event.preventDefault();
    event.stopPropagation();
    let rect = element.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    if (callback) {
      let data = {};
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        let name = event.dataTransfer.items[i].type;
        data[name] = event.dataTransfer.getData(name);
      }
      callback(parseInt(x), y, data);
    }
  };
};
var dom = {};

dom.closeRightBar = () => {
  let rightbar = dom.find('div[widget-id=right-bar]')
  if (rightbar != null) {
    rightbar.children[0].classList.add('out');
    setTimeout(function () {
      rightbar.remove();
    }, 300);
  }
};
/*
**************************************************
** Animations.
**************************************************
*/
dom.slideInFromRight = (element, mask) => {
  element.classList.remove('out');
  element.classList.add('in');
  setTimeout(() => {
    element.style.right = '0';
  }, 300 /* 与CSS中动画定义一致 */);
  if (mask) {
    mask.style.display = '';
  }
};

dom.slideOutToRight = (element, right, mask) => {
  if (!element.classList.contains('in')) return;
  if (element.classList.contains('out')) return;
  element.classList.remove('in');
  element.classList.add('out');
  setTimeout(() => {
    element.style.right = right;
  }, 300 /* 与CSS中动画定义一致 */);
  if (mask) {
    mask.style.display = 'none';
  }
};

dom.slideInFromLeft = (element, mask) => {
  element.classList.remove('out');
  element.classList.add('in');
  setTimeout(() => {
    element.style.left = '0';
  }, 300 /* 与CSS中动画定义一致 */);
  if (mask) {
    mask.style.display = '';
  }
};

dom.slideOutToLeft = (element, left, mask) => {
  if (!element.classList.contains('in')) return;
  if (element.classList.contains('out')) return;
  element.classList.remove('in');
  element.classList.add('out');
  setTimeout(() => {
    element.style.left = left;
  }, 300 /* 与CSS中动画定义一致 */);
  if (mask) {
    mask.style.display = 'none';
  }
};

/*
**************************************************
** Operations.
**************************************************
*/
dom.toggle = (clazz, element) => {
  if (Array.isArray(element)) {
    for (let i = 0; i < element.length; i++)
      dom.toggle(clazz, element[i]);
  } else {
    if (element.classList.contains(clazz)) {
      element.classList.remove(clazz);
    } else {
      element.classList.add(clazz);
    }
  }
};

dom.exclusive = (clazz, element, container) => {
  let els = container.querySelectorAll(element.tagName + '.' + clazz);
  for (let el of els) {
    el.classList.remove(clazz);
  }
  element.classList.add(clazz);
};

/*
**************************************************
** Performance
**************************************************
*/
dom.delayTo = what => {
  clearTimeout(dom.timeoutDelayTo);
  dom.timeoutDelayTo = setTimeout(() => {

  }, 600);
};

dom.value = function(selector, val) {
  const elm = document.querySelector(selector);
  if (val) {
    elm.value = val;
    return;
  }
  return elm.value.trim();
};

dom.empty = function(selector) {
  const elm = document.querySelector(selector);
  if (elm.value) {
    elm.value = '';
  } else {
    elm.innerHTML = '';
  }
};

dom.valid = function (selector) {
  const elm = document.querySelector(selector);
  if (typeof elm.value === 'undefined' || elm.value == null || elm.value.trim() == '')
    return false;
  return true;
};

/**
 * Creates an html element.
 *
 * @param tag
 *        the tag name, and css classes
 *
 * @returns {any}
 *        the html element
 */
dom.create = function (tag) {
  let classes = Array.prototype.slice.call(arguments, 1);
  let ret = document.createElement(tag);
  for (let i = 0; i < classes.length; i++) {
    ret.classList.add(classes[i]);
  }
  return ret;
};

/**
 * Makes element matching with selector fixed positioning under its parent element.
 *
 * @param selector
 *        the css selector
 *
 * @returns {{top: number, left: number, width: number, height: number}}
 */
dom.fix = function (selector) {
  let element = null;
  if (typeof selector === 'string')
    element = document.querySelector(selector);
  else
    element = selector;
  let rect = element.getBoundingClientRect();

  let left = rect.left;
  let top = rect.top;
  let width = rect.width;
  let height = rect.height;

  let paddingLeft = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-left'));
  let paddingRight = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-right'));
  let paddingTop = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-top'));
  let paddingBottom = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-bottom'));

  let marginLeft = parseInt(window.getComputedStyle(element, null).getPropertyValue('margin-left'));
  let marginRight = parseInt(window.getComputedStyle(element, null).getPropertyValue('margin-right'));
  let marginTop = parseInt(window.getComputedStyle(element, null).getPropertyValue('margin-top'));
  let marginBottom = parseInt(window.getComputedStyle(element, null).getPropertyValue('margin-bottom'));

  let parentElement = element.parentElement.parentElement;

  let rectParent = parentElement.getBoundingClientRect();

  let paddingLeftParent = parseInt(window.getComputedStyle(parentElement, null).getPropertyValue('padding-left'));
  let paddingRightParent = parseInt(window.getComputedStyle(parentElement, null).getPropertyValue('padding-right'));
  let paddingTopParent = parseInt(window.getComputedStyle(parentElement, null).getPropertyValue('padding-top'));
  let paddingBottomParent = parseInt(window.getComputedStyle(parentElement, null).getPropertyValue('padding-bottom'));

  element.style.position = 'absolute';
  element.style.top = (top - rectParent.top) + 'px';
  element.style.left = (left - rectParent.left) + 'px';
  element.style.width = 'calc(100% - ' + (paddingLeftParent * 2) + 'px )';
  // (rectParent.width - (paddingLeftParent) * 2) + 'px';

  return {
    top: top - rectParent.top,
    left: left - rectParent.left,
    width: rectParent.width - (paddingLeftParent) * 2,
    height: height + paddingTop + paddingBottom
  }
};

/**
 * Finds all elements which are matching selector under parent or html document.
 *
 * @param selector
 *        the css selector
 *
 * @param parent
 *        the parent element or nothing
 *
 * @returns {any}
 *        the found single element or many elements as an array
 */
dom.find = function(selector, parent) {
  parent = parent || document;
  if (typeof selector !== 'string') return selector;
  let found = parent.querySelectorAll(selector);
  if (found.length == 0) return null;
  if (found.length == 1)  return found[0];
  return found;
};

/**
 * Finds the ancestor matching tag name for the given element.
 *
 * @param selector
 *        the element selector
 *
 * @param tag
 *        the element tag name
 */
dom.ancestor = function(selector, tag, clazz) {
  let element = null;
  clazz = clazz || '';
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  if (element == null) return null;
  tag = tag.toUpperCase();
  let found = element;
  if (clazz == '') {
    while (found != null && found.tagName != tag) {
      found = found.parentElement;
    }
  } else {
    while (found != null && !(found.tagName == tag && found.classList.contains(clazz))) {
      found = found.parentElement;
    }
  }

  return found;
};

/**
 *
 * @param html
 * @returns {null|Element}
 */
dom.element = function (html) {
  let div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
};

// dom.clickIn = function (selector, x, y) {
//   let element = null;
//   if (typeof selector === 'string') {
//     element = document.querySelector(selector);
//   } else {
//     element = selector;
//   }
//   let clicked = document.elementFromPoint(x, y);
// };

dom.bind = function (selector, event, handler) {
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  if (element == null)  return;
  if (element)
    // element['on' + event] = handler;
    element.addEventListener(event, handler);
};

/**
 * Gets or sets element data attribute values which element is matching to the selector.
 *
 * @param {Element} selector
 *        the element selector
 *
 * @param {object} data
 *        the data to set to html element, and if is undefined would get data from html element
 */
dom.model = function(selector, data) {
  let elm = null;
  if (typeof selector === 'string')
    elm = document.querySelector(selector);
  else
    elm = selector;
  if (typeof data !== 'undefined') {
    // set
    let attrs = Array.prototype.slice.call(arguments, 2);
    if (attrs.length == 0) {
      for (const key in data) {
        if (key.indexOf('||') == 0 || key.indexOf('//') == 0 || key.indexOf('>>') == 0) continue;
        if (typeof data[key] === 'object') {
          elm.setAttribute(utils.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(utils.nameAttr(key), data[key]);
        }
      }
    } else {
      for (let i = 0; i < attrs.length; i++) {
        let key = attrs[i];
        if (key.indexOf('||') == 0 || key.indexOf('//') == 0 || key.indexOf('>>') == 0) continue;
        if (typeof data[key] === 'object') {
          elm.setAttribute(utils.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(utils.nameAttr(key), data[key]);
        }
      }
    }
  } else {
    let ret = {};
    Array.prototype.slice.call(elm.attributes).forEach(function(attr) {
      if (attr.name.indexOf('data-model-') == 0) {
        if (attr.value.indexOf('{') == 0) {
          try {
            ret[utils.nameVar(attr.name.slice('data-model-'.length))] = JSON.parse(attr.value);
          } catch (err) {
            ret[utils.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
          }
        } else {
          ret[utils.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
        }
      }
    });
    return ret;
  }
};

/**
 * Collects html attribute values which elements are matching to the given selector.
 *
 * @param {string} selector
 *        the element selector
 *
 * @param {string} {array} name
 *        the attribute name or names
 *
 * @returns {array}
 *        the attribute values
 */
dom.collect = function (selector, name) {
  let ret = [];
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    let item = {};
    if (Array.isArray(name)) {
      for (let j = 0; j < name.length; j++) {
        item[name[j]] = elements[i].getAttribute(utils.nameAttr(name[j]));
      }
    } else {
      item[name] = elements.getAttribute(utils.nameAttr(name[j]));
    }
    ret.push(item);
  }
  return ret;
};

/**
 * Creates a child element and appends to container element.
 *
 * @param {element} container
 *        the container element
 *
 * @param {object} data
 *        the data for child element
 *
 * @param {string} {array} name
 *        the data names to set to element
 *
 * @param {function} creator
 *        the creator function to create element
 */
dom.propagate = function (container, data, name, creator) {
  let element = creator(data);
  if (Array.isArray(name)) {
    for (let i = 0; i < name.length; i++) {
      element.setAttribute(utils.nameAttr(name[i]), data[name[i]]);
    }
  } else {
    element.setAttribute(utils.nameAttr(name), data[name]);
  }
  container.appendChild(element);
};

dom.toggle2 = function (selector, resolve) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    element.addEventListener('click',  function() {
      let toggle = this.getAttribute('data-toggle');
      let strs = toggle.split('>>');
      let sources = strs[0].split('+');
      let targets = strs[1].split('+');

      let sourceMatched = false;
      let targetMatched = false;
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i].trim();
        if (source.indexOf('.') == 0) {
          sourceMatched = this.classList.contains(source.substring(1));
        } else {
          let child = this.querySelector(source);
          sourceMatched = child != null;
        }
      }
      if (sourceMatched) {
        for (let i = 0; i < targets.length; i++) {
          let target = targets[i].trim();
          if (target.indexOf('.') === 0) {
            this.classList.add(target.substring(1));
          } else {
            let child = this.querySelector(target.substring(0, target.indexOf('.')));
            child.classList.add(target.substring(target.indexOf('.') + 1));
          }
        }
        for (let i = 0; i < sources.length; i++) {
          let source = sources[i].trim();
          if (source.indexOf('.') == 0) {
            this.classList.remove(source.substring(1));
          } else {
            let child = this.querySelector(source);
            child.classList.remove(source.substring(source.indexOf('.') + 1));
          }
        }
        return;
      }
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i].trim();
        if (source.indexOf('.') == 0) {
          this.classList.add(source.substring(1));
        } else {
          let child = this.querySelector(source.substring(0, source.indexOf('.')));
          child.classList.add(source.substring(source.indexOf('.') + 1));
        }
      }
      for (let i = 0; i < targets.length; i++) {
        let target = targets[i].trim();
        if (target.indexOf('.') == 0) {
          this.classList.remove(target.substring(1));
        } else {
          let child = this.querySelector(target);
          child.classList.remove(target.substring(target.indexOf('.') + 1));
        }
      }
      if (resolve) resovle(this);
    });
  }
};

/**
 *
 * @param selector
 * @param resolve
 */
dom.switch = function (selector, resolve) {
  let container = dom.find(selector);
  let accordion = container.getAttribute('data-switch');
  let sources = accordion.split('+');
  let elements = container.querySelectorAll(sources[0]);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    element.onclick = ev => {
      // clear all
      let siblings = container.querySelectorAll(sources[0]);
      for (let i = 0; i < siblings.length; i++) {
        siblings[i].classList.remove(sources[1].substring(1));
      }
      element.classList.add(sources[1].substring(1));
      if (resolve) resolve(element);
    };
  }
};

dom.tabs = function(tabsSelector) {
  let tabs = dom.find(tabsSelector);
  if (tabs == null) return;
  let activeClass = tabs.getAttribute('data-tab-active-class');
  for (let i = 0; i < tabs.children.length; i++) {
    let el = tabs.children[i];
    el.addEventListener('click', (ev) => {
      for (let i = 0; i < tabs.children.length; i++) {
        let el = tabs.children[i];
        el.classList.remove(activeClass);
      }
      el.classList.add(activeClass);
    })
  }
};

/**
 * Gets the top location Y of the given element in client area.
 *
 * @param selector
 *        the css selector
 *
 * @returns {number} the element Y value.
 */
dom.top = function (selector) {
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  // let ret = 0;
  // do {
  //   if ( !isNaN( element.offsetTop ) )
  //   {
  //     ret += element.offsetTop;
  //   }
  // } while (element = element.offsetParent);
  // return ret;
  if (element == null) return 0;
  let ret = element.offsetTop;
  if (typeof element.offsetParent !== 'undefined') {
    ret += dom.top(element.offsetParent);
  }
  return ret;
};

/**
 * Gets data from container element matching selector or
 * Sets data to it.
 *
 * @param selector
 *        the container selector
 *
 * @param data
 *        the data or undefined
 */
dom.formdata = function(selector, data) {
  let container = null;
  if (typeof selector === 'string') {
    container = document.querySelector(selector);
  } else {
    container = selector;
  }
  if (typeof data === 'undefined') {
    // get form data
    let values = {};

    // INPUT
    let checkboxCount = {};
    let inputs = container.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      let name = input.name;
      let type = input.type;
      let value = input.value;
      if (type == 'text' || type == 'number' || type == 'password' || type == 'hidden') {
        values[name] = null;
        if (value != '') {
          if (name.indexOf('[]') != -1) {
            values[name] = [value];
          } else {
            values[name] = value;
          }
        } else {
          values[name] = '';
        }
      } else if (type == 'radio') {
        // values[name] = null;
        if (input.checked) {
          values[name] = value;
        }
      } else if (type == 'checkbox') {
        // values[name] = [];
        if (typeof checkboxCount[name] === 'undefined') {
          checkboxCount[name] = 0;
        }
        if (input.checked) {
          if (typeof values[name] === 'undefined') {
            checkboxCount[name] = 0;
            values[name] = [];
          }
          values[name].push(value);
        }
        checkboxCount[name] += 1;
      }
    }
    // SELECT
    let selects = container.querySelectorAll('select');
    for (let i = 0; i < selects.length; i++) {
      let select = selects[i];
      let name = select.name;
      values[name] = null;
      if (select.selectedIndex != -1) {
        if (name.indexOf('[]') != -1) {
          values[name] = [select.value];
        } else {
          values[name] = select.value;
        }
      } else {
        values[name] = '';
      }
    }
    // TEXTAREA
    let textareas = container.querySelectorAll('textarea');
    for (let i = 0; i < textareas.length; i++) {
      let textarea = textareas[i];
      let name = textarea.name;
      values[name] = null;
      // if (textarea.innerHTML.trim() != '') {
      //   values[name] = textarea.innerHTML.replaceAll('<br>', '\n');
      // } else {
      //   values[name] = textarea.value;
      // }
      values[name] = textarea.value;
    }
    // 名称下只存在一个checkbox，就不用变成数组了
    for (let name in checkboxCount) {
      if (name.indexOf('[]') != -1) continue;
      if (checkboxCount[name] == 1 && values[name]) {
        values[name] = values[name][0];
      }
    }
    // 处理模板赋值
    for (let name in values) {
      if (typeof values[name] === 'string' && values[name].indexOf('${') == 0) {
        values[name] = values[values[name].substring(2, values[name].length - 1)];
      }
    }
    return values;
  } else {

    function getValue(obj, name) {
      if (name.indexOf('.') == 0) {
        let parentName = name.substring(0, name.indexOf('.'));
        let childName = name.substring(name.indexOf('.') + 1);
        return getValue(obj[parentName], childName);
      }
      if (typeof obj[name] === 'undefined') return '';
      return obj[name];
    }

    function setValue(container, name, val) {
      let el = dom.find('[name=\'' + name + '\']', container);
      if (el == null) return;
      if (el.length > 1) {
        if (el[0].type == 'radio') {
          let radios = el;
          radios.forEach((el, idx) => {
            if (el.value === val) {
              el.checked = true;
            } else {
              el.checked = false;
            }
          });
        }
      }
      if (el.tagName == 'INPUT') {
        if (el.type == 'check') {
          // TODO
        } else {
          el.value = val || '';
        }
      } else if (el.tagName == 'SELECT') {
        $('select[name=\'' + name + '\']').val(val).trigger('change');
      } else if (el.tagName == 'TEXTAREA') {
        el.innerHTML = val;
      }
    }

    for (let key in data) {
      if (typeof data[key] === 'object') {
        for (let innerKey in data[key]) {
          setValue(container, key + '.' + innerKey, data[key][innerKey]);
        }
      } else {
        setValue(container, key, data[key]);
      }
    }
  }
};

dom.setAttribute = function(selector, property, value) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    elements[i][property] = value;
  }
};

dom.removeAttribute = function(selector, property) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    elements[i].removeAttribute(property);
  }
};

dom.enable = function(selector) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = false;
  }
};

dom.disable = function(selector) {
  let elements;
  if (typeof selector === 'string') {
    elements = document.querySelectorAll(selector);
  } else {
    elements = selector;
  }
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = true;
  }
};

/**
 * Gets the index of selector element under its parent element.
 *
 * @param selector
 *        the selector string or dom element
 *
 * @param fieldId
 *        the model id field name
 *
 * @param id (optional)
 *        the model id value
 */
dom.index = function(selector, fieldId, id) {
  let element;
  if (typeof selector === 'string')
    element = dom.find(selector);
  else
    element = selector;
  if (id) {

  } else {
    let elementModelId = element.getAttribute(fieldId);
    let children = element.parentElement.querySelectorAll(element.tagName);
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      let childModelId = child.getAttribute(fieldId);
      if (elementModelId == childModelId) {
        return i;
      }
    }
  }
  return -1;
};

dom.elementAt = function (selector, fieldId, id) {
  let children = document.querySelectorAll(selector);
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childModelId = child.getAttribute(fieldId);
    if (id == childModelId) {
      return {index: i, element: child};
    }
  }
  return null;
};

dom.elementAtTree = function (selector, fieldId, fieldParentId, id, parentId) {
  let children = document.querySelectorAll(selector);
  let index = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childModelId = child.getAttribute(fieldId);
    let childModelParentId = child.getAttribute(fieldParentId);
    if (parentId == childModelParentId) {
      index++;
      if (id == childModelId) {
        return {index: index, element: child};
      }
    }
  }
};


dom.stack = function (paginationTable, td, rowIndex, render) {
  let link = dom.create('a', 'btn', 'btn-link');
  let icon = dom.create('i', 'fas', 'fa-caret-right', 'mr-1');
  link.appendChild(icon);

  dom.bind(link, 'click', function() {
    let icon = dom.find('i', link);
    if (icon.classList.contains('fa-caret-right')) {
      paginationTable.container.querySelectorAll('i.fa-caret-down').forEach(icon => {
        icon.classList.remove('fa-caret-down');
        icon.classList.add('fa-caret-right');
      });
      icon.classList.remove('fa-caret-right');
      icon.classList.add('fa-caret-down');

      // 显示
      paginationTable.stack(rowIndex, function(td) {
        td.parentElement.classList.add('fade', 'fadeIn');
        td.style.paddingLeft = '50px';
        td.style.paddingRight = '50px';
        setTimeout(function() {
          td.parentElement.classList.add('show');
        }, 200);
        render(td)
      });
    } else {
      icon.classList.remove('fa-caret-down');
      icon.classList.add('fa-caret-right');
      td.parentElement.nextSibling.remove();
    }
  });
};

/**
 * 计算元素的内部空间。
 *
 * @param element
 */
dom.inner = function(element) {
  let height = element.clientHeight;
  let width = element.clientWidth;
  let style = getComputedStyle(element);
  return {
    height: height
      - parseInt(style.paddingTop)
      - parseInt(style.paddingBottom),
    width: width
      - parseInt(style.paddingLeft)
      - parseInt(style.paddingLeft)
  }
};

/**
 * 计算元素的内部空间。
 *
 * @param element
 */
dom.outer = function(element) {
  let height = element.clientHeight;
  let width = element.clientWidth;
  let style = getComputedStyle(element);
  return {
    height: height
      + parseInt(style.marginTop) + parseInt(style.borderTop)
      + parseInt(style.marginBottom) + parseInt(style.borderBottom),
    width: width
      + parseInt(style.marginLeft) + parseInt(style.borderLeft)
      + parseInt(style.marginRight) + parseInt(style.borderRight)
  }
};

/*
* 根据父元素和偏移量重新制定元素的高度
*  @param element
* */

dom.height = function(selector, offset, parent) {
  offset = offset || 0;
  if (typeof parent === 'undefined') {
    parent = dom.find('#container');
  }
  parent = parent || document.body;
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  let offsetTop = dom.top(element);
  let computedStyle = getComputedStyle(parent,null);

  let paddingTop = parseInt(computedStyle.getPropertyValue('padding-top'));
  let paddingBottom = parseInt(computedStyle.getPropertyValue('padding-bottom'));
  computedStyle = getComputedStyle(element,null);
  let borderTopWidth = parseInt(computedStyle.getPropertyValue('border-top-width'));
  let borderBottomWidth = parseInt(computedStyle.getPropertyValue('border-bottom-width'));

  element.style.marginBottom = '0px';
  // let ancestor = dom.ancestor(element, 'div', 'full');
  // if (ancestor == null) {
  //   paddingBottom = 0;
  // }
  element.style.height = (parent.clientHeight - offsetTop - offset - paddingBottom) + 'px';
  element.style.overflowY = 'auto';
};

dom.height2 = function(selector, offset, parent) {
  offset = offset || 0;
  if (typeof parent === 'undefined') {
    parent = dom.find('#container');
  }
  parent = parent || document.body;
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  let offsetTop = dom.top(element);
  let computedStyle = getComputedStyle(parent,null);

  let paddingTop = parseInt(computedStyle.getPropertyValue('padding-top'));
  let paddingBottom = parseInt(computedStyle.getPropertyValue('padding-bottom'));

  computedStyle = getComputedStyle(element,null);
  let borderTopWidth = parseInt(computedStyle.getPropertyValue('border-top-width'));
  let borderBottomWidth = parseInt(computedStyle.getPropertyValue('border-bottom-width'));
  let marginTop = parseInt(computedStyle.getPropertyValue('border-top-width'));
  let marginBottom = parseInt(computedStyle.getPropertyValue('border-bottom-width'));
  element.style.marginBottom = '0px';
  let rect = parent.getBoundingClientRect();
  element.style.height = (rect.height
    - paddingTop - paddingBottom
    - borderTopWidth - borderBottomWidth
    - marginTop - marginBottom
    - offset
  ) + 'px';
  element.style.overflowY = 'auto';
};

dom.autoheight = function (selector, ancestor, customOffset) {
  customOffset = customOffset || 0;
  let el = dom.find(selector);
  if (el == null) return;
  ancestor = ancestor || document.body;
  let rectAncestor = ancestor.getBoundingClientRect();

  let height = rectAncestor.height;
  if (ancestor === document.body) {
    height = window.innerHeight;
  }

  let parent = el.parentElement;
  let rectParent = parent.getBoundingClientRect();
  let rect = el.getBoundingClientRect();
  let parentOffsetTop = parseInt(parent.offsetTop);

  let top = rect.top - rectAncestor.top;
  // 计算底部的高度
  let bottom = 0;
  while (parent !== ancestor) {
    let style = getComputedStyle(parent);
    bottom += parseInt(style.paddingBottom);
    bottom += parseInt(style.marginBottom);
    bottom += parseInt(style.borderBottomWidth);
    parent = parent.parentElement;
  }
  let style = getComputedStyle(el);
  bottom += parseInt(style.borderBottomWidth);

  el.style.height = (height - bottom - customOffset - top) + 'px';
  el.style.overflowY = 'auto';
};

dom.templatize = function(template, model) {
  let tpl = Handlebars.compile(template);
  let html = tpl(model);
  return dom.element(html);
};

/*
* 根据后台返回的对象渲染值进入dom
* selector:父元素节点
* data:需要渲染的数据
* isRadioToMulti:是否将单选框渲染为多选框
* */
dom.render=function (selector,data,isRadioToMulti) {
  let container = null;
  if (typeof selector === 'string') {
    container = document.querySelector(selector);
  } else {
    container = selector;
  }
  /*
   *将单选框的值设置为多选框
   *parentSelector：多选框组的父元素，通过data中的key得到
   *keyValue：需要渲染的值与多选框中的let-id相对应
  */
  function setRadioToCheckBox(parentSelector,keyValue){
    let checkedCheckBox=dom.find('[value=\'' + keyValue + '\']', parentSelector)
    if(checkedCheckBox!=null){
      checkedCheckBox.checked=true
    }
  }
  /*
  *
  * 根据当前元素的类型进行赋值
  *
  * */
  function setElementValue(container, name, val) {
    let el = dom.find('[name=\'' + name + '\']', container);
    if (el == null) return;
    let nodeName= el.nodeName

    //div下的checkbox
    if (nodeName === 'DIV' && isRadioToMulti) {
      if(val){
        setRadioToCheckBox(el,val)
      }
    }
    else if (el.tagName == 'INPUT') {
      if (el.type == 'radio') {
        // TODO
      } else {
        el.value = val;
      }
    }
    else if (el.tagName == 'SPAN') {
      if(val){
        el.innerHTML = val;
      }
    }
    else if (el.tagName == 'SELECT') {
      $('select[name=\'' + name + '\']').val(val).trigger('change');
    }
  }
  for (let key in data) {
    if (typeof data[key] === 'object') {
      for (let innerKey in data[key]) {
        setElementValue(container, key + '.' + innerKey, data[key][innerKey]);
      }
    } else {
      setElementValue(container, key, data[key]);
    }
  }
};

dom.popup = function(container, element) {
  let mask = dom.create('div', 'full-width', 'full-height', 'position-absolute');
  mask.style.background = 'transparent';
  dom.bind(mask, 'click', ev => {
    mask.remove();
    element.remove();
  });
  document.body.appendChild(mask);
  container.appendChild(element);
  return mask;
};

dom.html = function(element) {
  let div = dom.element('<div></div>');
  div.appendChild(element);
  return div.innerHTML;
};

dom.init = function (owner, element) {
  if (!element) return;
  let name = element.getAttribute('name');
  if (!name || name == '') {
    name = element.getAttribute('widget-id');
  }
  if (name && name != '') {
    owner[name] = element;
  }
  // 提示
  let tooltip = element.getAttribute('widget-model-tooltip');
  if (tooltip && tooltip != '') {
    tippy(element, {
      content: tooltip,
    });
  }
  for (let i = 0; i < element.children.length; i++) {
    let child = element.children[i];
    dom.init(owner, child);
  }
};

dom.makeUpload = function (el, fi, params, cb) {
  fi.onchange = ev => {
    if (!fi.files || fi.files.length == 0) return;
    // let img = fi.files[0];
    // let reader = new FileReader();
    // reader.onload = () => {
    //   cb(reader.result);
    // };
    // reader.readAsDataURL(img);
    xhr.upload({
      url: '/api/v3/common/upload',
      params: {
        ...params,
        file: fi.files[0],
      },
      success: res => {
        if (res.data) {
          res = res.data;
        }
        cb(res.webpath);
      },
    })
  };
  el.onclick = ev => {
    fi.click();
  };
};

/**
 * 判断模型数据是否已经存在于载有模型的DOM元素中。
 *
 * @param elements
 *        元素数组
 *
 * @param model
 *        数据模型
 *
 * @param id
 *        标识字段名称
 *
 * @returns {boolean}
 */
dom.exists = (elements, model, id) => {
  for (let i = 0; i < elements.length; i++) {
    let el = elements[i];
    let m = dom.model(el);
    if (m[id] === model[id]) return true;
  }
  return false;
};

dom.getDataFromChildren = (parent, childrenSelector, attrs) => {
  let ret = [];
  let children = parent.querySelectorAll(childrenSelector);
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    if (typeof attrs === 'undefined') {
      ret.push(dom.model(child));
    } else if (Array.isArray(attrs)) {
      let row = {};
      for (let j = 0; j < attrs.length; j++) {
        row[attrs[j]] = child.getAttribute(attrs[j]);
      }
      ret.push(row);
    } else if (typeof attrs === 'string') {
      let row = {};
      row[attrs] = child.getAttribute(attrs);
      ret.push(row);
    }
  }
  return ret;
};

format = {};

format.date = function(val) {
  if (typeof val === 'undefined') {
    return '';
  }
  if (typeof val === 'string') {
    return val;
  }
  let dt = moment(val);
  return dt.format('YYYY年MM月DD日');
};

format.time = function(val) {
  if (typeof val === 'undefined') {
    return '';
  }
  if (typeof val === 'string') {
    return val;
  }
  let dt = moment(val);
  return dt.format('HH:mm');
};

format.money = function(val, scale) {
  scale = scale || 0;
  return accounting.formatMoney(parseFloat(val), "￥", scale, ",", ".")
};
/**
 * Gets the form data under a container element.
 * 
 * @param {object} initial - the initial object, it could be json string.
 * 
 * @return json string or javascript object
 */
$.fn.formdata = function(initial) {
  if (typeof initial !== "undefined") {
    let obj;
    if (typeof initial === "string") {
      obj = $.parseJSON(initial);
    } else {
      obj = initial;
    }
    $(this).find('input').each(function(idx, elm) {
      $(this).val('');
    });
    $(this).find('input[type=checkbox]').each(function(idx, elm) {
      $(this).prop('checked', false);
    });
    $(this).find('textarea').each(function(idx, elm) {
      $(this).val('');
    });
    let params = obj;
    for (let key in params) {
      let elementNodeName;
      this.find('[name=' + key + ']').each(function(idx, elm) {
        elementNodeName = $(this)[0].nodeName;
        if (elementNodeName == "INPUT" && ($(this).attr("type") == "radio" || $(this).attr("type") == "checkbox")) {
          if (params[key].constructor == Array) {
            let arr = params[key];
            for (let i = 0; i < arr.length; i++) {
              if ($(this).val() == arr[i]) {
                $(this).prop("checked", true);
              }
            }
          } else {
            if ($(this).val() == params[key]) {
              $(this).prop("checked", true);
            }
          }
        } else if (elementNodeName == "INPUT" && ($(this).attr("type") == "file" || $(this).attr("type") == "button")) {
          // 无需回显
        } else if (elementNodeName == "SELECT") {
          let found = false;
          $(this).find('option').each(function() {
            let option = $(this);
            if (option.attr('value') == params[key]) {
              option.prop('selected', true);
              found = true;
            }
          });
          if (!found) {
            $(this).val($($(this).find("option:first")).val());
          }
          // select2
          // FIXME: NOT WORKING
          $(this).val(null).trigger('change');
        } else {
          if ($(this).attr('data-domain-type') == 'date') {
            $(this).val(moment(params[key]).format('YYYY-MM-DD'));
            // $(elm).data('DateTimePicker').date(new Date(params[key]));
          } else {
            $(this).val(params[key]);
          }
        }
      });
    }
    return {};
  }
  let ret = {};
  this.find('input[type!=checkbox][type!=radio][type!=button]').each(function(idx, el) {
    let name = $(el).attr('name');
    if (!name) return;
    let objname = name;
    let attrname = '';
    let isArray = name.indexOf('[]') != -1;
    let dotIndex = name.indexOf('.');
    let value = $(el).val();
    if (dotIndex != -1) {
      objname = name.substr(0, dotIndex);
      attrname = name.substr(dotIndex + 1,
          isArray ? name.indexOf('[]') - objname.length - 1 : name.length - objname.length - 1);
    }

    if (isArray) {
      ret[objname] = ret[objname] || [];
      if (attrname != '') {
        let item = {};
        item[attrname] = value;
        ret[objname].push(item);
      } else {
        ret[name].push(value);
      }
    } else {
      if (attrname != '') {
        let item = {};
        item[attrname] = value;
        ret[objname] = name;
      } else {
        ret[name] = value;
      }
    }
  });

  this.find('input[type=checkbox]').each(function(idx, el) {
    if ($(el).prop('checked')) {
      let name = $(el).attr('name');
      if (name.indexOf('[]') != -1) {
        let objname = name;
        let attrname = '';
        let dotIndex = objname.indexOf('.');
        if (dotIndex == -1) {
          ret[objname] = ret[objname] || [];
          ret[objname].push($(el).val());
        } else {
          objname = name.substr(0, dotIndex);
          attrname = name.substr(dotIndex + 1, name.indexOf('[]') - objname.length - 1);
          ret[objname] = ret[objname] || [];
          let item = {};
          item[attrname] = $(el).val();
          ret[objname].push(item);
        }
      } else {
        ret[name] = $(el).val();
      }
    }
  });
  this.find('input[type=checkbox]').each(function(idx, el) {
    let name = $(el).attr('name');
    if (typeof ret[name] === "undefined" && name.indexOf('[]') == -1) {
      ret[name] = '';
    }
  });
  this.find('input[type=radio]').each(function(idx, el) {
    if ($(el).prop('checked')) {
      ret[$(el).attr('name')] = $(el).val();
    }
  });
  this.find('input[type=radio]').each(function(idx, el) {
    var name = $(el).attr('name');
    if (typeof ret[name] === "undefined") {
      ret[name] = '';
    }
  });
  this.find('select').each(function(idx, el) {
    if ($(el).val() != '' && $(el).val() != '-1' && $(el).val() != null) {//&& $(el).val() != '0'
      let name = $(el).attr('name');
      let value = $(el).val();
      let objname = name;
      let attrname = '';
      if (typeof name === 'undefined') return;
      let dotIndex = name.indexOf('.');
      if (dotIndex != -1) {
        objname = name.substr(0, dotIndex);
        attrname = name.substr(dotIndex + 1,
            name.length - objname.length - 1);
      }
      if (typeof $(el).val() === 'object') {
        ret[$(el).attr('name')] = $(el).val().join(',');
      } else {
        if (attrname != '') {
          let item = {};
          item[attrname] = value;
          ret[objname] = item;
        } else
          ret[name] = value;
      }
    } else if ($(el).val() == '-1') {
      // NOT ALLOW EMPTY STRING
      ret[$(el).attr('name')] = '';
    } else {
      // NOT ALLOW EMPTY STRING
      ret[$(el).attr('name')] = '';
    }
  });
  this.find('textarea').each(function(idx, el) {
    if ($(el).val() != '') {
      ret[$(el).attr('name')] = $(el).val();
    } else {
      ret[$(el).attr('name')] = '';
    }
  });
  return ret;
};

/**
 *
 * @param name
 * @param obj
 * @param handlers
 * @returns {*}
 * @constructor
 */
function BindingProxy(name, obj, observable) {
  let self = this;
  this.name = name;
  let handlers = {
    set: function(target, key, value) {
      let oldVal = target[key];
      target[key] = value;
      if (self.name != '' && !Array.isArray(target)) {
        key = self.name + '.' + key;
      } else if (Array.isArray(target)) {
        observable.notifyPropertyChanged(target, self.name, oldVal, value, key);
        return true;
      }
      observable.notifyPropertyChanged(target, key, oldVal, value);
      return true;
    }
  };
  return new Proxy(obj, handlers);
}

/**
 *
 * @param obj
 * @constructor
 */
function ObservableObject(obj) {
  this.observers = {};
  for (let key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = new BindingProxy(key, obj[key], this);
    } else if (typeof obj[key] === 'object') {
      obj[key] = new BindingProxy(key, obj[key], this);
    }
  }
  for (let key in obj) {
    this.observers[key] = [];
  }
  this.proxy = new BindingProxy('', obj, this);
}

ObservableObject.prototype.notifyPropertyChanged = function (obj, prop, oldVal, newVal, index) {
  if (!this.observers[prop]) return;
  for (let i = 0; i < this.observers[prop].length; i++) {
    let callback = this.observers[prop][i];
    if (typeof callback === 'string') {
      // eval(callback + '({property: prop, oldValue: oldVal, newValue: newVal})');
      let strs = callback.split('.');
      let fn = window;
      for (let j = 0; j < strs.length; j++) {
        fn = fn[strs[j]];
      }
      if (typeof fn === 'function') {
        // fn({
        //   property: prop,
        //   oldValue: oldVal,
        //   newValue: newVal
        // });
        fn(newVal, oldVal);
      }
    } else if (typeof callback === 'function') {
      callback(newVal, oldVal);
      // callback({
      //   property: prop,
      //   oldValue: oldVal,
      //   newValue: newVal
      // });
    }
  }
};

ObservableObject.prototype.addObserver = function(property, callback) {
  if (!this.observers[property]) {
    this.observers[property] = [];
  }
  this.observers[property].push(callback);
};

ObservableObject.prototype.setValue = function(property, value) {
  this.proxy[property] = value;
};

ObservableObject.prototype.install = function(containerId) {
  let self = this;
  let container = document.getElementById(containerId);
  let elements = container.querySelectorAll('[data-rx-model]');
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    let exprRxModel = element.getAttribute('data-rx-model');
    let rxModel = Rx.parse(exprRxModel);
    if (rxModel.procedure) {
      this.addObserver(rxModel.variable, rxModel.procedure);
    } else if (rxModel.event) {
      element.setAttribute('data-rx-variable', rxModel.variable);
      element.addEventListener(rxModel.event, function() {
        eval('self.proxy.' + this.getAttribute('data-rx-variable') + ' = this.value');
      });
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = ObservableObject;
}
if (typeof schedule === 'undefined') schedule = {};

schedule.names = {};

schedule.stop = function (name) {
  if (typeof name === 'undefined') {
    for (let key in schedule.names) {
      clearInterval(schedule.names[key]);
    }
    schedule.names = {};
    return;
  }
  clearInterval(schedule.names[name]);
  delete schedule.names[name];
};

schedule.start = function (name, handle, interval) {
  if (schedule.names[name]) {
    clearInterval(schedule.names[name]);
  }
  schedule.names[name] = setInterval(function() {
    handle();
  }, interval);
  handle();
};
/*
 * Copyright 2019 doublegsoft.net
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
 * sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * 浏览器默认的简单下拉单选框。
 */
$.fn.simpleselect = function (opts) {
  let value = opts.fields.value;
  let text = opts.fields.text;
  let selection = opts.selection || '-1';
  let self = $(this);
  let dotIndex = value.indexOf('.');
  let objname = value.substr(0, dotIndex);
  let attrname = value.substr(dotIndex + 1);
  xhr.post({
    url: opts.url,
    data: opts.data || {},
    success: function (resp) {
      if (!resp.data) {
        return;
      }
      for (let i = 0; i < resp.data.length; i++) {
        let item = resp.data[i];
        let option = $('<option></option>');
        if (dotIndex == -1) {
          option.prop('selected', selection == item[value]);
          option.attr('value', item[value]);
        } else {
          option.prop('selected', selection == item[objname][attrname]);
          option.attr('value', item[objname][attrname]);
        }
        option.text(item[text]);
        self.append(option);
      }
    }
  });
};

/**
 * 可搜索的下拉单选框。
 */
$.fn.searchselect = function (opts) {
  let selection = opts.selection || null;
  let searchable = true;
  let complete = opts.complete || function (data) {};
  if (typeof opts.searchable !== 'undefined')
    searchable = opts.searchable;
  let select = opts.select;
  let onchange = opts.onchange;
  let validate = opts.validate || function(val) {};
  let variables = opts.variables;

  let value;
  let text;
  if (opts.values) {
    value = opts.fields && opts.fields.value ? opts.fields.value : 'value';
    text = opts.fields && opts.fields.text ? opts.fields.text : 'text';
  } else {
    value = opts.fields.value;
    text = opts.fields.text;
  }

  let self = $(this);
  if (opts.url) {
    if (variables && utils.isEmpty(variables)) {
      self.select2({
        placeholder: opts.placeholder,
        minimumResultsForSearch: searchable ? 0 : Infinity,
        liveSearch: true,
        allowClear: true,
      });
      return;
    };

    let dotIndex = value.indexOf('.');
    let objname = value.substr(0, dotIndex);
    let attrname = value.substr(dotIndex + 1);
    variables = variables || {};
    let params = opts.data || opts.params || {};
    for (let key in variables) {
      params[key] = variables[key];
    }
    xhr.post({
      url: opts.url,
      usecase: opts.usecase,
      data: params,
      success: function (resp) {
        if (!resp.data) {
          resp.data = [];
        }
        let hasSelected = false;
        self.empty();
        for (let i = 0; i < resp.data.length; i++) {
          let item = resp.data[i];
          let option = $('<option></option>');

          if (dotIndex == -1) {
            option.prop('selected', selection == item[value]);
            option.attr('value', item[value]);
            hasSelected = hasSelected ? hasSelected : selection == item[value];
          } else {
            option.prop('selected', selection == item[objname][attrname]);
            option.attr('value', item[objname][attrname]);
            hasSelected = hasSelected ? hasSelected : selection == item[objname][attrname];
          }
          if (typeof text === 'function') {
            option.text(text.apply(null, [item]));
          } else {
            option.text(item[text]);
          }

          self.append(option);
        }
        self.select2({
          placeholder: opts.placeholder,
          minimumResultsForSearch: searchable ? 0 : Infinity,
          liveSearch: true,
          allowClear: true,
        });
        self.on('change', function(evt) {
          validate(self.get(0));
          if (onchange) onchange(self.get(0).value);
        });
        if (select) {
          if (!hasSelected) {
            self.val(resp.data[0][value]);
          }
          select(self.val());
        } else {
          self.val(selection).trigger('change');
        }
        complete(resp.data);
      }
    });
  } else if (opts.local || opts.values) {
    let values = opts.local || opts.values;
    for (let i = 0; i < values.length; i++) {
      $(this).append('<option value="' + values[i][value] + '">' + values[i][text] + '</option>');
    }
    $(this).val(selection);
    $(this).select2({
      liveSearch: false,
      allowClear: true,
      minimumResultsForSearch: searchable ? 0 : Infinity,
      placeholder: opts.placeholder,
    });
    if (selection && select) {
      select(selection);
    }
    $(this).on('change', function(evt) {
      validate($(this).get(0));
      if (onchange) onchange(evt);
    });
    validate($(this).get(0));
    complete(values);
  } else {
    $(this).val(selection);
    $(this).select2({
      liveSearch: false,
      allowClear: true,
      minimumResultsForSearch: searchable ? 0 : Infinity,
      placeholder: opts.placeholder,
    });
    if (selection && select) {
      select(selection);
    }
    $(this).on('change', function(evt) {
      validate($(this).get(0));
      if (onchange) onchange($(this).get(0).vallue);
    });
    validate($(this).get(0));
    complete([]);
  }
  return this;
};

$.fn.multiselect = function (opts) {
  var value = opts.value;
  var text = opts.text;
  var self = $(this);
  xhr.post({
    url: opts.url,
    data: opts.params || {},
    success: function (resp) {
      if (!resp.data) return;
      for (var i = 0; i < resp.data.length; i++) {
        var item = resp.data[i];
        var option = $('<option></option>');
        option.attr('value', item[value]);
        option.text(item[text]);
        self.append(option);
      }
      self.selectpicker();
    }
  });
};

$.fn.dialogselect = function (opts) {
  let templateId = opts.templateId;
  let fieldId = opts.fields.id;
  let fieldParentId = opts.fields.parentId;
  let url = opts.url;
  let data = opts.data;
  let title = opts.title;
  let confirm = opts.confirm;
  let self = $(this);
  let htmlNormal = self.html();
  let htmlLoading = '<i class="fa fa-spin fa-spinner"></i>';
  let htmlChecked = '<i class="fas fa-check float-right"></i>';
  data.fieldId = fieldId;
  data.fieldParentId = fieldParentId;
  $(this).on('click', function() {
    $('button[type=setting]').prop('disabled', true);
    self.html(htmlLoading);
    xhr.post({
      url: url,
      data: data,
      success: function (resp) {
        let buttons =
          '<div class="form-buttons float-right" style="padding-top: 12px; padding-right: 15px;">' +
          '  <button class="btn btn-sm btn-confirm">确定</button>' +
          '  <button class="btn btn-sm btn-close" onclick="layer.close(layer.index);">关闭</button>' +
          '</div>';
        if (!resp.data) return;
        let source = document.getElementById(templateId).innerHTML;
        let template = Handlebars.compile(source);
        let html = template(resp) + buttons;
        layer.open({
          type : 1,
          offset: '120px',
          title : title,
          closeBtn: 0,
          shadeClose : false,
          area : [opts.width, ''],
          content : html,
          success: function (layero, index) {
            let layerContent = document.querySelector('.layui-layer-content');
            layerContent.style += '; overflow: hidden;';
            $('.kui-dialog').css('padding', '15px 25px 25px 25px');
            self.html(htmlNormal);
            $('button[type=setting]').prop('disabled', false);

            // bind event listener
            let listItems = layerContent.querySelectorAll('li');
            for (let i = 0; i < listItems.length; i++) {
              let li = listItems[i];
              li.attributes['data-checked'] = false;
              li.addEventListener('click', function() {
                let divs = li.querySelectorAll('.col-md-2');
                let div = divs[divs.length - 1];
                let checked = li.attributes['data-checked'];
                li.attributes['data-checked'] = !checked;
                if (!checked) {
                  div.innerHTML = htmlChecked;
                } else {
                  div.innerHTML = '';
                }
              });
            }
            let buttonConfirm = layerContent.querySelector('.btn-confirm');
            buttonConfirm.addEventListener('click', function() {
              let selections = [];
              for (let i = 0; i < listItems.length; i++) {
                let li = listItems[i];
                if (li.attributes['data-checked']) {
                  selections.push({
                    id: li.attributes['data-id']
                  });
                }
              }
              confirm(selections);
              layer.close(layer.index);
            });
          }
        });
      }
    });
  });
};

$.fn.autocomplete = function (opts) {
  var value = opts.value;
  var text = opts.text;
  var self = $(this);
  xhr.post({
    url: opts.url,
    data: opts.params || {},
    success: function (resp) {
      if (!resp.data) return;
      for (var i = 0; i < resp.data.length; i++) {
        var item = resp.data[i];
        var option = $('<option></option>');
        option.attr('value', item[value]);
        option.text(item[text]);
        self.append(option);
      }
      self.select2({});
    }
  });
};

/**
 * 瓦片式布局多项选择器。
 */
$.fn.tiledmultiselect = function(opts) {
  let container = document.getElementById($(this).attr('id'));
  let data = opts.data || [];
  let fields = opts.fields;
  let usecase = opts.usecase;
  let url = opts.url;
  let check = opts.check || function (value, text) {};
  let uncheck = opts.uncheck || function (vlaue, text) {};

  function renderItem(data) {
    for (let i = 0; i < data.length; i++) {
      let div = document.createElement('div');
      div.classList.add('tag-checkable', 'mh-10');
      let icon = document.createElement('i');
      icon.classList.add('fa', 'fa-check', 'pr-2');
      if (!data[i].checked) {
        div.setAttribute('data-checked', "false");
        icon.classList.add('text-white');
      } else {
        div.setAttribute('data-checked', "true");
      }
      div.setAttribute('data-id', data[i][fields.value]);
      div.append(icon);
      div.append(data[i][fields.text]);
      div.addEventListener('click', function(event) {
        let icon = this.querySelector('i');
        if (this.getAttribute('data-checked') == 'false') {
          this.setAttribute('data-checked', 'true');
          icon.classList.remove('text-white');
          check(this.getAttribute('data-id'), this.innerText);
        } else {
          this.setAttribute('data-checked', 'false');
          icon.classList.add('text-white');
          uncheck(this.getAttribute('data-id'), this.innerText);
        }
        event.preventDefault();
        event.stopPropagation();
      });
      container.append(div);
    }
  }

  if (opts.local) {
    renderItem(opts.local);
    return;
  }

  xhr.post({
    url: url,
    usecase: usecase,
    data: data,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      renderItem(resp.data);
    }
  });
};

/**
 * 层叠式的选择器。
 */
$.fn.cascadeselect = function(opts) {
  let levels = opts.levels;
  let values = opts.values;
  let readonly = opts.readonly;
  let container = $(this).get(0);
  let rectContainer = container.getBoundingClientRect();
  let widthContainer = rectContainer.width;
  let levelCount = opts.levels.length;
  let validate = opts.validate;

  async function displayPopup(link, params, values) {
    // 【选中下划线】渲染
    document.querySelectorAll('.cascadeselect-link').forEach(function(elm, idx) {
      elm.style.borderBottom = 'none';
    });
    link.style.borderBottom = '2px solid #1976D2';
    dom.model(link, params);
    let url = link.getAttribute('data-url');
    params = params || {};
    params.cascadeIndex = link.getAttribute('data-cascade-index');
    let container = link.parentElement.parentElement;
    let popup = dom.find('.cascadeselect-popup');
    if (popup == null) {
      popup = dom.create('div', 'row', 'b-a-1', 'mt-0', 'cascadeselect-popup');
      popup.style.overflowY = 'auto';
      popup.style.width = widthContainer + 'px';
      popup.style.maxHeight = '200px';
      popup.style.position = 'relative';
      popup.style.zIndex = 99999;
      popup.style.backgroundColor = 'white';
    }
    popup.style.display = '';
    popup.innerHTML = '';
    let requestParams = {};
    if (params['_and_condition']) {
      requestParams['_and_condition'] = params['_and_condition'];
      requestParams['_other_select'] = params['_other_select'];
    } else {
      requestParams = params;
    }
    requestParams[link.getAttribute('data-cascade-field-value')] = '';

    let data = [];
    if (url && url !== 'undefined') {
      data = await xhr.promise({
        url: url,
        params: requestParams,
      });
    } else {
      let cascadeIndex = parseInt(link.getAttribute('data-cascade-index'));
      if (cascadeIndex === 0) {
        data = values;
      } else {
        let selectOptions = link.getAttribute('data-cascade-options');
        if (selectOptions) {
          data = JSON.parse(selectOptions);
        } else {
          data = values;
          link.setAttribute('data-cascade-options', JSON.stringify(values));
        }
      }

    }
    for (let i = 0; i < data.length; i++) {
      let dataItem = data[i];
      let linkPopup = dom.create('a', 'btn', 'btn-link');
      if (dataItem[link.getAttribute('data-cascade-field-text')]) {
        linkPopup.innerText = dataItem[link.getAttribute('data-cascade-field-text')];
      }
      // set data-model-*
      dom.model(linkPopup, dataItem);
      // 选中点击事件
      linkPopup.addEventListener('click', function(event) {
        let cascadeIndex = parseInt(link.getAttribute('data-cascade-index'));
        let cascadeName = link.getAttribute('data-cascade-name');
        // let cascadeFieldValue = link.getAttribute('data-cascade-field-value');
        let cascadeFieldValue = link.getAttribute('data-cascade-field-value');
        let cascadeFieldText = link.getAttribute('data-cascade-field-text');
        let model = dom.model(this);
        link.setAttribute('data-cascade-value', model[cascadeFieldValue]);
        if (model[cascadeFieldText]) {
          link.innerText = model[cascadeFieldText];
        }
        dom.find('input', link.parentElement).value = model[cascadeFieldValue];
        dom.model(link, model);
        if (cascadeIndex < levelCount - 1) {
          let next = dom.find('a[data-cascade-index="' + (cascadeIndex + 1) + '"]', container);
          //清空下一级的数据
          next.setAttribute('data-cascade-value', '');
          next.innerText='请选择';
          dom.find('input', next.parentElement).value = '';

          let data = {};
          data[cascadeName] = model[cascadeFieldValue];
          let params = {};
          for (let key in levels[cascadeIndex + 1].params) {
            let tpl = Handlebars.compile(levels[cascadeIndex + 1].params[key]);
            params[key] = tpl(data);
          }
          next.removeAttribute('data-cascade-options');
          if (model.children) {
            displayPopup(next, params, JSON.parse(model.children), cascadeIndex);
          } else {
            displayPopup(next, params, cascadeIndex);
          }
          // 阻止繁殖的click事件
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
        }
        if (validate)
          validate(link.parentElement.parentElement);
      });
      popup.appendChild(linkPopup);
    }

    container.appendChild(popup);
  }

  for (let i = 0; i < levels.length; i++) {
    let level = levels[i];
    let div = dom.create('div');
    div.style.width = level.width;
    div.style.display = 'inline-block';
    div.style.textAlign = 'center';
    div.style.textOverflow = 'ellipsis';
    div.style.overflow = 'hidden';
    div.style.whiteSpace = 'nowrap';

    let link = dom.create('a', 'btn', 'pb-1', 'cascadeselect-link');
    link.style.paddingTop = '1px';
    if (level.url) {
      link.setAttribute('data-url', level.url);
    }
    // link.setAttribute('data-usecase', level.usecase);
    link.setAttribute('data-cascade-index', i);
    link.setAttribute('data-cascade-name', level.name);
    link.setAttribute('data-cascade-field-value', level.fields.value);
    link.setAttribute('data-cascade-field-text', level.fields.text);
    link.style.borderRadius = 'unset';
    dom.model(link, level.params || {});

    if (level.value && level.value[level.fields.text]) {
      link.innerText = level.value[level.fields.text];
      link.setAttribute('data-cascade-value', level.value[level.fields.value] || level.value[level.name]);
    } else {
      link.innerText = level.text;
    }

    link.addEventListener('click', function() {
      if (opts.readonly) return;
      let params = dom.model(this);
      if (i - 1 >= 0) {
        let prev = dom.find('a', link.parentElement.previousElementSibling.previousElementSibling);
        let selected = prev.getAttribute('data-cascade-value');
        if (selected == null || selected == '') return;
        params[prev.getAttribute('data-cascade-name')] = selected;
        // for (let key in levels[i].params) {
        //   let tpl = Handlebars.compile(levels[i].params[key]);
        //   // params[key] = tpl(data);
        // }
      }
      // 去掉多余的参数
      for (let key in params) {
        if (key.indexOf('_') == 0) continue;
        if (key != levels[i].fields.value) {
          delete params[key];
        }
      }
      displayPopup(this, params, values);
    });

    if (i != levels.length - 1) {
      div.style.marginRight = '5px';
    }
    if (i > 0) {
      div.style.marginLeft = '3px';
    }

    let hidden = dom.create('input');
    hidden.setAttribute('type', 'hidden');
    if (opts.required)
      hidden.setAttribute('data-required', level.text);
    hidden.setAttribute('name', level.name);
    if (level.value && level.value[level.fields.value]) {
      hidden.value = level.value[level.fields.value];
    }
    div.appendChild(link);
    div.appendChild(hidden);
    container.appendChild(div);
    if (i != levels.length - 1) {
      let separator = dom.create('span');
      separator.textContent = '/';
      separator.style.position = 'absolute';
      separator.style.top = '8px';
      container.append(separator);
    }

    // validate them if having default value
    if (validate)
      validate(link.parentElement.parentElement);
  }

  function hidePopup(event) {
    let clickedElement = document.elementFromPoint(event.clientX, event.clientY);
    if (clickedElement.className.indexOf('cascadeselect') == -1) {
      let popup = dom.find('.cascadeselect-popup');
      if (popup != null) {
        document.querySelectorAll('.cascadeselect-link').forEach(function(elm, idx) {
          elm.style.borderBottom = 'none';
        });
        popup.remove();
      }
    }
  }

  document.removeEventListener('click', hidePopup);
  document.addEventListener('click', hidePopup);
};
if (typeof split === 'undefined') split = {};

split.vertical = function(containerId, leftId, rightId, leftDefaultSize, callback) {
  const SPLITTER_WIDTH = 10;
  const splitterId = "__split_splitterId";
  leftDefaultSize = (leftDefaultSize || 300)
  let container = dom.find(containerId);
  let splitter = document.createElement('a');
  splitter.setAttribute('id', splitterId);
  container.appendChild(splitter);
  // splitter.style.backgroundColor = '#cdcdcd';
  splitter.style.backgroundColor = 'var(--color-background)';
  splitter.style.position = 'absolute';
  splitter.style.width = SPLITTER_WIDTH + 'px';
  splitter.style.cursor = 'ew-resize';
  splitter.style.padding = '2px';
  splitter.style.zIndex = '3';
  splitter.style.color = 'white';
  splitter.style.display = 'flex';
  splitter.style.zIndex = '999';
  splitter.innerHTML = '<i class="fas fa-grip-lines-vertical m-auto"></i>';

  // disable scroll-y for container
  container.style.overflowY = 'hidden';

  let heightContainer = container.clientHeight;

  let left = dom.find(leftId);
  let right = dom.find(rightId);

  left.style.width = leftDefaultSize + 'px';
  left.style.flex = leftDefaultSize + 'px';
  right.style.width = container.clientWidth - leftDefaultSize - SPLITTER_WIDTH + 'px';
  right.style.flex = container.clientWidth - leftDefaultSize - SPLITTER_WIDTH + 'px';
  right.style.marginLeft = SPLITTER_WIDTH + 'px';

  splitter.style.height = heightContainer + 'px';
  splitter.style.top = 0 + 'px';
  splitter.style.left = leftDefaultSize + 'px';
  splitter.style.height = heightContainer + 'px';

  left.style.height = heightContainer + 'px';
  left.style.overflowY = 'auto';
  right.style.height = heightContainer + 'px';
  right.style.overflowY = 'auto';

  let dragging = false;
  splitter.addEventListener('mousedown', function(event) {
    event.preventDefault();
    dragging = true;
    document.body.style.cursor = 'ew-resize';
  });

  document.addEventListener('mouseup', function(event) {
    dragging = false;
    document.body.style.cursor = 'default';
    if (callback) {
      callback();
    }
  });

  function isInContainer(element, container) {
    if (element == null) {
      return false;
    }
    if (element == container) return true;
    return isInContainer(element.parentElement, container);
  }

  let offsetLeftPrevious = -1;
  container.addEventListener('mousemove', function(event) {
    if (dragging) {
      if (event.offsetX <= 0) return;
      if (event.offsetX >= this.clientWidth) return;
      let target = event.target;

      if (target.getAttribute('id') == splitterId) {
        let offsetLeft = parseInt(splitter.style.left);
        splitter.style.left = (offsetLeft/* + event.layerX*/) + 'px';
        left.style.width = (offsetLeft/* + event.layerX*/) + 'px';
        left.style.flex = (offsetLeft/* + event.layerX*/) + 'px';
        right.style.width = (container.clientWidth - SPLITTER_WIDTH - (offsetLeft/* + event.layerX*/)) + 'px';
        right.style.flex = (container.clientWidth - SPLITTER_WIDTH - (offsetLeft/* + event.layerX*/)) + 'px';
        return;
      }
      let offset = 0;
      if (isInContainer(target, left)) {
        offset = parseInt(splitter.style.left) - 5;
        splitter.style.left = offset + 'px';
        left.style.width = offset + 'px';
        right.style.width = (container.clientWidth - offset - SPLITTER_WIDTH) + 'px';
        left.style.flex = offset + 'px';
        right.style.flex = (container.clientWidth - offset - SPLITTER_WIDTH) + 'px';
        return;
      }
      if (isInContainer(target, right)) {
        offset = parseInt(splitter.style.left) + 5;
        splitter.style.left = offset + 'px';
        left.style.width = offset + 'px';
        right.style.width = (container.clientWidth - offset - SPLITTER_WIDTH) + 'px';
        left.style.flex = offset + 'px';
        right.style.flex = (container.clientWidth - offset - SPLITTER_WIDTH) + 'px';
        return;
      }
    }
  });
  return splitter;
};

split.horizontal = function(containerId, topId, bottomId, topDefaultSize) {
  const SPLITTER_WIDTH = 10;
  const splitterId = "__split_splitterId_" + topId.getAttribute('widget-id');
  topDefaultSize = (topDefaultSize || 300);
  let container = dom.find(containerId);
  let splitter = document.createElement('a');
  let top = dom.find(topId);
  let bot = dom.find(bottomId);

  splitter.setAttribute('id', splitterId);
  container.appendChild(splitter);
  // splitter.style.backgroundColor = '#cdcdcd';
  splitter.style.backgroundColor = 'var(--color-background)';
  splitter.style.position = 'absolute';
  splitter.style.width = '100%';
  splitter.style.height = '10px';
  splitter.style.top = (topDefaultSize) + 'px';
  splitter.style.cursor = 'ns-resize';
  splitter.style.padding = '2px';
  splitter.style.zIndex = '3';
  splitter.style.color = 'white';
  splitter.style.display = 'flex';
  splitter.innerHTML = '<i class="fas fa-grip-lines position-relative m-auto" style="top: -4px;"></i>';

  // disable scroll-y for container
  container.style.overflowY = 'hidden';

  let heightContainer = container.clientHeight;

  top.style.height = topDefaultSize + 'px';
  // top.style.flex = topDefaultSize + 'px';
  top.style.overflowY = 'auto';

  bot.style.height = (container.clientHeight - topDefaultSize - SPLITTER_WIDTH) + 'px';
  bot.style.marginTop = SPLITTER_WIDTH + 'px';
  // bot.style.flex = (container.clientHeight - topDefaultSize - 10) + 'px';
  bot.style.overflowY = 'auto';

  let dragging = false;
  splitter.addEventListener('mousedown', function(event) {
    event.preventDefault();
    dragging = true;
    document.body.style.cursor = 'ns-resize';
  });

  document.addEventListener('mouseup', function(event) {
    dragging = false;
    document.body.style.cursor = 'default';
  });

  function isInContainer(element, container) {
    if (element == null) {
      return false;
    }
    if (element == container) return true;
    return isInContainer(element.parentElement, container);
  }

  let offsetLeftPrevious = -1;
  container.addEventListener('mousemove', function(event) {
    if (dragging) {
      if (event.offsetY <= 0) return;
      if (event.offsetY >= this.clientHeight) return;
      let target = event.target;

      if (target.getAttribute('id') == splitterId) {
        let offsetTop = parseInt(splitter.style.top);
        splitter.style.top = (offsetTop/* + event.layerX*/) + 'px';
        top.style.height = (offsetTop/* + event.layerX*/) + 'px';
        top.style.flex = (offsetTop/* + event.layerX*/) + 'px';
        bot.style.height = (container.clientHeight - (offsetTop/* + event.layerX*/)) + 'px';
        bot.style.flex = (container.clientHeight - (offsetTop/* + event.layerX*/)) + 'px';
        return;
      }
      let offset = 0;
      if (isInContainer(target, top)) {
        offset = parseInt(splitter.style.top) - 10;
        splitter.style.top = offset + 'px';
        top.style.height = offset + 'px';
        bot.style.height = (container.clientHeight - offset) + 'px';
        return;
      }
      if (isInContainer(target, bot)) {
        offset = parseInt(splitter.style.top) + 10;
        splitter.style.top = offset + 'px';
        top.style.height = offset + 'px';
        bot.style.height = (container.clientHeight - offset) + 'px';
        return;
      }
    }
  });
  return splitter;
};

/**
 * @constructor
 * 
 * 构造一个以svg为基础的图形显示。依赖d3库操作svg对象。
 * 
 * @param {object}
 *          option - 配置项
 */
function Svg(option) {
  this.svgurl = option.svgurl;
  this.zoomable = option.zoomable || false;
  this.onLoad = option.onLoad;
  this.onDecorate = option.onDecorate;
  this.enableDrawing = option.enableDrawing || false;
  this.isDrawingLine = false;
  this.isDrawingPolygon = false;
  this.lastClickedPoint = null;
  this.clickedPoints = [];
}

Svg.prototype.render = function(containerId) {
  this.containerId = containerId;
  var self = this;
  d3.xml(this.svgurl).mimeType('image/svg+xml').get(function (error, xml) {
    self.container = document.getElementById(self.containerId);
    var svg = d3.select(xml.documentElement);
    self.dom = xml.documentElement;
    self.svg = svg;
    
    self.container.innerHTML = '';
    self.container.appendChild(self.dom);
    
    // keep the original viewBox
    self.viewBox = svg.attr('viewBox');
    var vals = self.viewBox.split(' ');
    var width = parseFloat(vals[2]);
    var height = parseFloat(vals[3]);

    if (self.zoomable) {
      var zoom = d3.zoom().on('zoom', function () {
        var svg = d3.select(this).select('svg');

        var containerHeight = self.container.offsetHeight;
        var containerWidth = self.container.offsetWidth;

        var scaleX = width / containerWidth;
        var scaleY = height / containerHeight;

        var k = d3.event.transform.k;
        var x = d3.event.transform.x;
        var y = d3.event.transform.y;

        svg.attr('viewBox', (-x / k * scaleX) + ' ' + (-y / k * scaleY) + ' ' + (width / k) + ' ' + (height / k));
        // 例子中的transform，可以到处跑
        // svg.attr('transform', d3.event.transform);
      });
    }

    if (self.onDecorate)
      self.onDecorate(self.svg, self.dom);

    if (self.onLoad)
      self.onLoad(self.svg, self.dom);
    if (self.enableDrawing) {
      svg.on('mousedown', function () {
        var point = d3.mouse(this);
        var newClickedPoint = {x: point[0], y: point[1]};
        self.lastClickedPoint = newClickedPoint;
        self.clickedPoints.push(newClickedPoint);

        self.lastLine = self.svg.select('#_tmp_line');
        if (self.lastLine.empty()) {
          self.lastLine = self.svg.append('line');
          self.lastLine.attr('id', '_tmp_line').style('stroke', 'blue')
          .attr('x1', newClickedPoint.x).attr('y1', newClickedPoint.y)
          .attr('x2', newClickedPoint.x).attr('y2', newClickedPoint.y);
        } else {
          self.lastLine.attr('id', '');
          self.lastLine = self.svg.append('line');
          self.lastLine.attr('id', '_tmp_line').style('stroke', 'blue')
          .attr('x1', newClickedPoint.x).attr('y1', newClickedPoint.y)
          .attr('x2', newClickedPoint.x).attr('y2', newClickedPoint.y);
        }
      });

      svg.on('contextmenu', function () {
        d3.event.preventDefault();
        self.lastClickedPoint = null;
      });

      svg.on('mousemove', function() {
        if (!self.lastClickedPoint) {
          return;
        }
        var point = d3.mouse(this);

        self.lastLine.attr('x2', point[0]).attr('y2', point[1]);
      });
    }
    // binding events
    if (self.zoomable) 
      d3.select(self.container).call(zoom);
  });
};

Svg.prototype.restore = function () {
  var svg = d3.select(this.container).select('svg');
  svg.attr('viewBox', this.viewBox);
};

/**
 * @private
 */
Svg.prototype.findClosest = function (x, y) {
  // TODO
};


if (typeof toast === 'undefined') toast = {};

TOAST_HTML = `
  <div class="toast fade b-a-1 text-white" data-autohide="false" 
       style="position: absolute; left: 20%; top: 10px; width: 60%; z-index: -1;">
    <div class="toast-header pt-1">
      <strong class="mr-auto p-2"></strong>
      <button type="button" class="ml-2 mb-1 mr-2 close text-white" data-dismiss="toast">&times;</button>
    </div>
    <div class="toast-body p-2"></div>
  </div>
`;

toast.success = function(selector, message, duration) {
  let container = null;
  if (typeof selector === 'string') {
    container = dom.find(selector);
  } else {
    container = selector;
  }
  // let toast = dom.find('.toast', container);
  // if (toast == null) {
    let toast = dom.element(TOAST_HTML);
    container.appendChild(toast);
  // }

  toast.style.zIndex = 11000;
  dom.find('.toast-body', toast).innerHTML = message;
  dom.find('strong', toast).innerText = '成功';
  toast.classList.add('show', 'in');
  toast.style.backgroundColor = 'var(--color-success)';

  setTimeout(function() {
    toast.remove();
  }, duration || 500);
};

toast.info = function(selector, message) {
  let container = null;
  if (typeof selector === 'string') {
    container = dom.find(selector);
  } else {
    container = selector;
  }
  let toast = dom.find('.toast', container);
  if (toast == null) {
    toast = dom.element(TOAST_HTML);
    container.appendChild(toast);
  }

  toast.style.zIndex = 11000;
  dom.find('.toast-body', toast).innerHTML = message;
  dom.find('strong', toast).innerText = '提示';
  toast.classList.add('bg-info', 'show', 'in');

  setTimeout(function() {
    toast.remove();
  }, 2000);
};

toast.error = function(selector, message) {
  let container = null;
  if (typeof selector === 'string') {
    container = dom.find(selector);
  } else {
    container = selector;
  }
  let toast = dom.find('.toast', container);
  if (toast == null) {
    toast = dom.element(TOAST_HTML);
    container.appendChild(toast);
  }
  dom.bind(dom.find('button', toast), 'click', event => {
    toast.remove();
  });
  toast.style.zIndex = 11000;
  dom.find('.toast-body', toast).innerHTML = message;
  dom.find('strong', toast).innerText = '错误';
  toast.classList.add('bg-danger', 'show', 'in');
};
utils = {};

/**
 * 
 */
utils.append = function (container, html, empty) {
  let fragmentContainer = dom.create('div');
  fragmentContainer.style.height = '100%';
  fragmentContainer.style.width = '100%';
  empty = empty || false;
  let range = document.createRange();
  let fragment = range.createContextualFragment(html);
  if (empty !== false)
    container.innerHTML = '';
  container.appendChild(fragmentContainer);
  fragmentContainer.appendChild(fragment);
  let page = dom.find('[id^=page]', fragmentContainer);
  if (page) fragmentContainer.setAttribute('page-id', page.id);
  else fragmentContainer.setAttribute('page-id', 'page.not.in.database');
  return {
    id: page ?  page.id : '',
    container: fragmentContainer,
  };
};

utils.message = function (errors) {
  if (!errors && errors.length == 0) {
    return;
  }
  let ret = '';
  for (let i = 0; i < errors.length; i++) {
    ret += errors[i].message + '<br>';
  }
  return ret;
};

utils.prompt = function (errors) {
  if (!errors && errors.length == 0) {
    return;
  }
  for (let i = 0; i < errors.length; i++) {
    $(errors[i].element).addClass('is-invalid');
  }
};

utils.render = function (containerId, templateId, data) {
  let source = document.getElementById(templateId).innerHTML;
  let template = Handlebars.compile(source);
  let html = template(data);

  let container = document.getElementById(containerId);
  container.innerHTML = html;
};

utils.assemble = function (obj, objname) {
  if (typeof obj !== 'object')
    return;
  for (let key in obj) {
    let val = obj[key];
    if (typeof val === 'object') {
      obj[key + 'Id'] = val['id'];
    }
    if (key == 'id') {
      obj[objname + 'Id'] = val;
    } else if (key == 'name') {
      obj[objname + 'Name'] = val;
    }
  }
};

utils.in = function (elementSelector) {
  let selectors = elementSelector.split(' ');
  let element = null;
  let elements = [];
  if (selectors.length == 1) {
    element = document.getElementById(elementSelector);
    elements.push(element);
  } else {
    element = document.getElementById(selectors[0]);
    elements = element.querySelectorAll(selectors[1]);
  }
  for (let i = 0; i < elements.length; i++) {
    element = elements[i];
    element.addEventListener('animationend', function() {
      this.classList.remove('animated', 'fadeIn');
      this.style.display = '';
      this.removeEventListener('animationend', function() {});
      this.removeEventListener('animationstart', function() {});
    });
    element.classList.remove('fadeOut', 'hide');
    element.classList.add('animated', 'fadeIn', 'show');
  }
};

utils.out = function (elementSelector) {
  let selectors = elementSelector.split(' ');
  let element = null;
  let elements = [];
  if (selectors.length == 1) {
    element = document.getElementById(elementSelector);
    elements.push(element);
  } else {
    element = document.getElementById(selectors[0]);
    elements = element.querySelectorAll(selectors[1]);
  }
  for (let i = 0; i < elements.length; i++) {
    element = elements[i];
    element.addEventListener('animationend', function () {
      this.classList.remove('animated', 'fadeOut');
      this.removeEventListener('animationend', function () {
      });
    });
    element.classList.remove('fadeIn', 'show');
    element.classList.add('animated', 'fadeOut', 'hide');
  }
};

/**
 * Converts the javascript variable name to html data attribute name.
 *
 * @param {string} javascript variable name
 *
 * @return {string} html data attribute name
 */
utils.nameAttr = function(name) {
  const names = [];
  let item = '';
  for (let i = 0; i < name.length; i++) {
    let ch = name.charAt(i);
    if (ch == ch.toUpperCase()) {
      names.push(item);
      item = '';
      item += ch.toLowerCase();
    } else {
      item += ch;
    }
  }
  if (item != '') {
    names.push(item);
  }
  return 'data-model-' + names.join('-');
};

/**
 * Converts html data attribute name to javascript variable name.
 *
 * @param {string} html data attribute name
 *
 * @return {string} javascript variable name
 */
utils.nameVar = function(name, sep) {
  sep = sep || '-';
  if (name.indexOf(sep) == -1) return name;
  const names = name.split(sep);
  let ret = '';
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (i == 0) {
      ret += name;
    } else {
      ret += name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return ret;
};

utils.camelcase = function(name, sep) {
  if (name.indexOf(sep) == -1) return name;
  const names = name.split(sep);
  let ret = '';
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (i == 0) {
      ret += name;
    } else {
      ret += name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return ret;
};

utils.pascalcase = function(name, sep) {
  if (name.indexOf(sep) == -1) return name.charAt(0).toUpperCase() + name.slice(1);
  const names = name.split(sep);
  let ret = '';
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    ret += name.charAt(0).toUpperCase() + name.slice(1);
  }
  return ret;
};

utils.clone = function(source, target) {
  source = source || {};
  for (let k in source) {
    target[k] = source[k];
  }
};

utils.get = function(model) {
  let attrs = Array.prototype.slice.call(arguments, 1);
  let ret = {};
  for (let i = 0; i < attrs.length; i++) {
    ret[attrs[i]] = model[attrs[i]];
  }
  return ret;
};

utils.isEmpty = function(obj) {
  let ret = 0;
  for (let key in obj) {
    ret++;
  }
  return ret == 0;
};

utils.isBlank = function(obj) {
  let ret = 0;
  for (let key in obj) {
    if (obj[key] != null && obj[key] !== '') {
      ret++;
    }
  }
  return ret == 0;
};

utils.getParameter = function(url, name) {
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

utils.getParameters = function(url) {
  if (url.indexOf('?') == -1) return {};
  let ret = {};
  url = url.substring(url.indexOf('?') + 1);
  let strs = url.split('&');
  for (let i = 0; i < strs.length; i++) {
    let pair = strs[i].split('=');
    if (pair.length == 1) return {};
    ret[pair[0].trim()] = decodeURIComponent(pair[1].trim());
  }
  return ret;
};

utils.isExisting = (array, obj, idField) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i][idField] === obj[idField])
      return true;
  }
  return false;
};

utils.textSize = (text, font) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  canvas.remove();
  return {width: metrics.width, height: metrics.height};
};

utils.base64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

utils.randomId = () => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  const length = 6;
  let counter = 0;
  for (let i = 0; i < 2; i++) {
    counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    result += '_';
  }
  return result.substring(0, result.length - 1);
};

utils.camelcaseAttribute = (objname, attrname) => {
  objname = objname.toLowerCase();
  attrname = attrname.toLowerCase();
  if (attrname == 'id' || attrname == 'name' || attrname == 'type') {
    attrname = objname + '_' + attrname;
  }
  return utils.camelcase(attrname, '_');
};

utils.nameAttribute = (objname, attrname, domainType) => {
  domainType = domainType || '';
  let domainObjectType = '';
  let domainObjectId = '';
  if (domainType.startsWith('&')) {
    domainObjectType = domainType.substring(1, domainType.indexOf('('));
    domainObjectId = domainType.substring(domainType.indexOf('(') + 1, domainType.indexOf(')'))
  }
  objname = objname.toLowerCase();
  attrname = attrname.toLowerCase();
  if (domainObjectType !== '') {
    if (attrname === domainObjectType) {
      attrname = domainObjectType + '_' + domainObjectId;
    } else {
      attrname = attrname + '_' + domainObjectType + '_' + domainObjectId;
    }
  }
  if (attrname == 'id' || attrname == 'name' || attrname == 'type') {
    attrname = objname + '_' + attrname;
  }
  return attrname;
};

utils.safeValue = (obj, name) => {
  if (!obj) return '';
  let names = name.split('.');
  let ret = obj;
  for (let i = 0; i < names.length; i++) {
    ret = ret[names[i]];
    if (!ret) {
      return '';
    }
  }
  return ret || '';
};

utils.safeSet = (obj, name, value) => {
  if (!value) return;
  let names = name.split('.');
  let ret = obj;
  for (let i = 0; i < names.length; i++) {
    if (i == names.length - 1) {
      ret[names[i]] = value;
    } else {
      if (typeof obj[names[i]] === 'undefined') {
        obj[names[i]] = {};
      }
      ret = obj[names[i]];
    }
  }
  return obj;
};

utils.merge = (older, newer) => {
  let ret = {...older};
  for (let key in newer) {
    let val = newer[key];
    let type = typeof val;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      ret[key] = val;
    } else if (type === 'object') {
      ret[key] = utils.merge(ret[key], val);
    }
  }
  return ret;
};

var NO_ERRORS = 0;
var REQUIRED_ERROR = 1;
var FORMAT_ERROR = 2;
var INVALID_ERROR = 3;

// add string trim method if not existing
if (!String.prototype.trim) {
  (function () {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function () {
      return this.replace(rtrim, '');
    };
  })();
}

/**
 * The jquery plugin to validate user-input elements under a element.
 * 
 * @param {function}
 *            callback - the callback function
 * 
 * @return errors including message and element
 */
$.fn.validate = function (callback) {
  return Validation.validate(this, callback);
};

Validation = {
  /**
   * 
   */
  validate: function (container, callback) {
    var ret = [];
    if (typeof container === 'undefined') {
      container = $(document);
    }
    if (typeof container === 'string') {
      container = $(container);
    } else {
      container = $(container);
    }
    // 输入框
    container.find('input[type!=checkbox][type!=radio][type!=button]').each(function (idx, el) {
      var val = $(el).val().trim();
      var label = Validation.getLabel(el);
      // 必填项校验
      var msg = $(el).attr('data-required-message') ? $(el).attr('data-required-message') : label + '必须填写！';
      if (Validation.isRequired(el) && val === '') {
        ret.push({
          element: el,
          message: msg
        });
      }
      // 专用类型校验
      var expr = $(el).attr('data-domain-type');
      if (!expr) {
        return;
      }
      var msg = label + '填写不合要求。';
      var dt = Validation.getDomainValidator(new ValidationModel(expr));
      if (dt != null && val !== '') {
        var res = dt.test(val);
        switch (res) {
          case REQUIRED_ERROR:
            break;
          case FORMAT_ERROR:
            msg = $(el).attr('data-format-message') ? $(el).attr('data-format-message') : msg;
            break;
          case INVALID_ERROR:
            msg = $(el).attr('data-invalid-message') ? $(el).attr('data-invalid-message') : msg;
            break;
          default:
            break;
        }
        if (res != NO_ERRORS) {
          ret.push({
            element: $(el),
            message: msg
          });
        }
      }
    });
    container.find('textarea').each(function (idx, el) {
      var val = $(el).val().trim();
      var label = Validation.getLabel(el);
      // 必填项校验
      var msg = $(el).attr('data-required-message') ? $(el).attr('data-required-message') : label + '必须填写！';
      if (Validation.isRequired(el) && val === '') {
        ret.push({
          element: el,
          message: msg
        });
      }
      // 专用类型校验
      var expr = $(el).attr('data-domain-type');
      if (!expr) {
        return;
      }
      var msg = label + '填写不合要求。';
      var dt = Validation.getDomainValidator(new ValidationModel(expr));
      if (dt != null && val !== '') {
        var res = dt.test(val);
        switch (res) {
          case REQUIRED_ERROR:
            break;
          case FORMAT_ERROR:
            msg = $(el).attr('data-format-message') ? $(el).attr('data-format-message') : msg;
            break;
          case INVALID_ERROR:
            msg = $(el).attr('data-invalid-message') ? $(el).attr('data-invalid-message') : msg;
            break;
          default:
            break;
        }
        if (res != NO_ERRORS) {
          ret.push({
            element: $(el),
            message: msg
          });
        }
      }
    });
    // 下拉框
    container.find('select').each(function (idx, el) {
      if (Validation.isRequired(el) && ($(el).val() == '-1' || $(el).val() == '' || $(el).val() == null)) {
        var label = Validation.getLabel(el);
        var msg = label + '必须选择！';
        msg = $(el).attr('data-required-message') ? $(el).attr('data-required-message') : msg;
        ret.push({
          element: $(el),
          message: msg
        });
      }
    });
    // 复选框
    var names = {};
    container.find('input[type=checkbox]').each(function (idx, el) {
      // 名称必须要有
      var name = $(el).attr('name');
      names[name] = name;
    });
    for (var name in names) {
      var checked = false;
      var label = null;
      var elm = null;
      container.find('input[name="' + name + '"]').each(function (idx, el) {
        if (idx == 0) {
          label = Validation.getLabel(el);
          elm = el;
        }
        if (!checked && $(el).prop('checked')) {
          checked = true;
        }
      });
      if (!checked && Validation.isRequired(elm)) {
        var msg = label + '必须选择！';
        msg = $(elm).attr('data-required-message') ? $(elm).attr('data-required-message') : msg;
        ret.push({
          element: $(elm),
          message: msg
        });
      }
    }
    // 单选框
    var names = {};
    container.find('input[type=radio]').each(function (idx, el) {
      // 名称必须要有
      var name = $(el).attr('name');
      names[name] = name;
    });
    for (var name in names) {
      var checked = false;
      var label = null;
      var elm = null;
      container.find('input[name="' + name + '"]').each(function (idx, el) {
        if (idx == 0) {
          label = Validation.getLabel(el);
          elm = el;
        }
        if (!checked && $(el).prop('checked')) {
          checked = true;
        }
      });
      if (checked === false && $(elm).prop('required')) {
        var msg = label + '必须选择！';
        // console.log(msg);
        msg = $(elm).attr('data-required-message') ? $(elm).attr('data-required-message') : msg;
        ret.push({
          element: $(elm),
          message: msg
        });
      }
    }
    // ajax验证
    container.find('input[remote]').each(function (idx, el) {
      var uri = $(el).attr('remote');
      var val = $(el).val().trim();
      if (uri && uri != '' && val != '') {
        $.ajax({
          url: uri,
          method: 'POST',
          data: "check=" + val,
          success: function (resp) {
            var obj = $.parseJSON(resp);
            if (obj.err) {
              ret.push({
                element: $(el),
                message: obj.msg
              });
            }
          }
        });
      }
    });
    if (callback) {
      callback(ret);
    }

    return ret;
  },

  getLabel: function (_el) {
    var el = $(_el);
    return el.attr('label') || $(el).attr("data-required") || (el.attr("name") || el.attr("id"));
  },

  isRequired: function(_el) {
    let el = $(_el);
    if (el.prop('required')) return true;
    if (el.attr('required') == 'required') return true;
    if (typeof el.attr('data-required') === 'undefined') return false;
    return el.attr('data-required') != '';
  },

  getDomainValidator: function (model) {
    var domain = model.keyword.toLowerCase();
    var vm = model;
    var ret = null;
    if (domain === 'mail' || domain === 'email') {
      ret = new Validation.Mail();
    } else if (domain === 'number') {
      ret = new Validation.Number(vm.symbol, vm.args);
    } else if (domain === 'string') {
      ret = new Validation.String(vm.args);
    } else if (domain === 'mobile') {
      ret = new Validation.Mobile();
    } else if (domain === 'range') {
      ret = new Validation.Range(vm.opts, vm.args);
    } else if (domain === 'phone') {
      ret = new Validation.Phone();
    } else if (domain === 'cmpexp') {
      ret = new Validation.CmpExp(vm.args[0], vm.args[1]);
    } else if (domain === 'regexp') {
      ret = new Validation.RegExp(vm.args[0]);
    } else if (domain === 'remote') {
      ret = new Validation.Remote(vm.args[0]);
    } else if (domain === 'date') {
      ret = new Validation.Date();
    } else if (domain === 'time') {
      ret = new Validation.Time();
    } else if (domain === 'datetime') {
      ret = new Validation.DateTime();
    } else {
      throw new Error('not support for the domain("' + domain + '")');
    }
    return ret;
  },

  String: function (args) {
    this.min = 0;
    this.max = parseInt(args[0]);
    if (args.length > 1) {
      this.min = parseInt(args[0]);
      this.max = parseInt(args[1]);
    }
    this.test = function (str) {
      if (str.length < this.min) {
        return FORMAT_ERROR;
      }
      if (this.max && str.length > this.max) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Number: function (sym, args) {
    var start = 7;
    this.plus = -1;
    this.minus = -1;
    if (sym === '-') {
      this.minus = 0;
    } else if (sym === '+') {
      this.plus = 0;
    }

    if (this.minus == 0 || this.plus == 0) {
      start += 1;
    }
    this.precision = parseInt(args[0]);
    if (args.length > 1) {
      this.scale = parseInt(args[1]);
    }

    this.test = function (str) {
      if (this.plus == 0) {
        var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
        if (!re.test(str)) {
          return FORMAT_ERROR;
        }
      } else if (this.minus == 0) {
        var re = /^\s*(-)((\d+(\.\d+)?)|(\.\d+))\s*$/;
        if (!re.test(str)) {
          return FORMAT_ERROR;
        }
      } else {
        var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
        if (!re.test(str)) {
          return FORMAT_ERROR;
        }
      }

      var idx = str.indexOf('.');
      var maxlen = idx == -1 ? this.precision : this.precision + 1;
      maxlen = this.plus == 0 || this.minus == 0 ? maxlen + 1 : maxlen;
      if (str.length > maxlen) {
        return FORMAT_ERROR;
      }

      if (idx != -1 && this.scale) {
        var s = str.substring(idx + 1);
        if (s.length > this.scale) {
          return FORMAT_ERROR;
        }
      }
      return NO_ERRORS;
    }
  },

  Mail: function () {
    this.test = function (str) {
      var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Phone: function () {
    this.test = function (str) {
      var re = /^\d{11}$/i;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Mobile: function () {
    this.test = function (str) {
      var re = /^\d{11}$/i;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Date: function () {
    this.test = function (str) {
      var re = /^\d{4}-\d{1,2}-\d{1,2}$/;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      if (isNaN(Date.parse(str))) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Time: function () {
    this.test = function (str) {
      var re = /^\d{1,2}:\d{1,2}(:\d{1,2})?$/;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      str = "1970-01-01 " + str;
      if (isNaN(Date.parse(str))) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  },

  DateTime: function () {
    this.test = function (str) {
      var re = /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}(:\d{1,2})?$/;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      if (isNaN(Date.parse(str))) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  },

  RegExp: function (expr) {
    this.re = new RegExp(expr);
    this.test = function (str) {
      if (!this.re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  CmpExp: function (type, expr) {
    this.model = new ValidationModel(type);
    this.expr = expr;
    this.ignore = false;
    var self = this;
    this.test = function (str) {
      var expr = this.expr;
      var dt = Validation.getDomainValidator(this.model);
      if (dt.test(str) != NO_ERRORS) {
        return FORMAT_ERROR;
      }
      $('input[type!=checkbox][type!=radio][type!=button]').each(function (idx, el) {
        var name = $(el).attr('name');
        var val = $(el).val();
        if (expr.indexOf(name) != -1) {
          if (val == '') {
            self.ignore = true;
          }
          expr = expr.replace(new RegExp(name, 'g'), val);
        }
      });
      if (!this.ignore) {
        try {
          if (!eval(expr)) {
            return INVALID_ERROR;
          }
        } catch (e) {
          return INVALID_ERROR;
        }
      }
      return NO_ERRORS;
    }
  },

  Remote: function (uri) {
    this.test = function (str) {
      $.ajax({
        url: uri + str,
        dataType: "json",
        success: function (resp) {
          if (resp.error != 0) {

          }
        }
      });
    }
  },

  Range: function (opts, args) {
    this.min = parseFloat(args[0]);
    this.max = parseFloat(args[1]);
    this.test = function (str) {
      var check = parseFloat(str.trim());
      if (isNaN(check)) {
        return INVALID_ERROR;
      }
      var ret = false;
      if (opts[0] == ">") {
        ret = (check > this.min);
      } else if (opts[0] === ">=") {
        ret = (check >= this.min);
      }
      if (!ret) {
        return INVALID_ERROR;
      }
      if (opts[1] == "<") {
        ret = (check < this.max);
      } else if (opts[1] === "<=") {
        ret = (check <= this.max);
      }
      if (!ret) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  }
};

ValidationModel = function (expr) {
  this.symbol = '';
  this.keyword = '';
  this.opts = [];
  this.args = [];

  this.unary_ops = {
    '+': true,
    '-': true
  };

  this.keywords = {
    'string': true,
    'number': true,
    'range': true,
    'regexp': true,
    'mobile': true,
    'email': true,
    'phone': true,
    'cmpexp': true
  };
  var index = 0;
  var length = expr.length;
  var word = '';
  while (index < length) {
    var ch = expr.charAt(index);
    if (this.isUnaryOp(ch) && index == 0) {
      this.symbol = ch;
    } else if (ch == '[') {
      if (this.keyword != '') {
        word += ch;
      } else {
        if (!this.stringEqual('range', word)) {
          throw new Error('"[" is just available for range.');
        }
        this.keyword = word;
        this.opts.push('>=');
        word = '';
      }
    } else if (ch == '(') {
      if (this.keyword != '') {
        this.opts.push('(');
        word += ch;
      } else {
        this.keyword = word;
        this.opts.push(">");
        word = '';
      }
    } else if (ch == ']') {
      this.opts.push("<=")
      this.args.push(word);
      word = '';
    } else if (ch == ')' && index == length - 1) {
      this.args.push(word);
      this.opts.push('<');
      word = '';
    } else if (ch == ')') {
      this.opts.pop('<');
      if (this.opts.length == 1) {
        word += ch;
      }
    } else if (ch == ',') {
      if (this.opts.length == 1) {
        this.args.push(word);
        word = '';
      } else {
        word += ch;
      }
    } else {
      word += ch;
    }
    index++;
  }
  if (this.keyword == '') {
    this.keyword = word;
  }
};

ValidationModel.prototype = {

  isKeyword: function (str) {
    return this.keywords[str.toLowerCase()];
  },

  isUnaryOp: function (ch) {
    return this.unary_ops[ch];
  },

  isDecimalDigit: function (ch) {
    return (ch >= 48 && ch <= 57); // 0...9
  },

  isIdentifierStart: function (ch) {
    return (ch === 36) || (ch === 95) || // `$` and `_`
      (ch >= 65 && ch <= 90) || // A...Z
      (ch >= 97 && ch <= 122); // a...z
  },

  isIdentifierPart: function (ch) {
    return (ch === 36) || (ch === 95) || // `$` and `_`
      (ch >= 65 && ch <= 90) || // A...Z
      (ch >= 97 && ch <= 122) || // a...z
      (ch >= 48 && ch <= 57); // 0...9
  },

  stringEqual: function (str0, str1) {
    return str0.toLowerCase() === str1.toLowerCase();
  }
};

/**
 * xhr will replace ajax which encapsulates jquery ajax in kui framework.
 * 
 * @since 2.0
 * 
 * @version 1.0.0 - Created on Jan 26, 2019.
 */
xhr = {};

/**
 * @private
 */
xhr.request = function (opts, method) {
  let url = opts.url;
  let data = opts.data || opts.params || {};
  let type = opts.type || 'json';
  let success = opts.success;
  let error = opts.error;

  let params = utils.getParameters(opts.url);
  data = {...params, ...data};
  if (window && window.user) {
    data['_current_user'] = window.user.userId;
  }
  let usecase = opts.usecase || ''; 

  let req  = new XMLHttpRequest();
  // req.timeout = 10 * 1000;
  req.onload = function () {
    let resp = req.responseText;
    if (type == 'json')
      try {
        resp = JSON.parse(resp);
      } catch (err) {
        if (error) error(resp);
        return;
      }
    if (req.readyState == 4 && req.status == "200") {
      if (success) success(resp);
    } else {
      if (error) error(resp);
    }
  };

  req.onerror = function () {
    if (error) error({error: {code: -500, message: '网络访问错误！'}});
  };
  req.ontimeout = function () {
    if (error) error({error: {code: -501, message: '网络请求超时！'}});
  };
  req.open(method, url, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.setRequestHeader("usecase", usecase);
  if (typeof APPTOKEN !== 'undefined') {
    req.setRequestHeader("apptoken", APPTOKEN);
  }
  if (window.user) {
    req.setRequestHeader("_current_user", window.user.userId);
  } else {
    req.setRequestHeader("_current_user", "unauthorized user");
  }
  if (data)
    req.send(JSON.stringify(data));
  else
    req.send(null);
};

/**
 * @see xhr.request
 */
xhr.get = function (opts) {
  let url = opts.url;
  let data = opts.data;
  let success = opts.success;
  let error = opts.error;
  let req  = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onload = function () {
    let resp = req.responseText;
    if (req.readyState == 4 && req.status == "200") {
      if (success) success(resp);
    } else {
      if (error) error(resp);
    }
  };
  req.send(null);
};

xhr.post = function (opts) {
  let url = opts.url;
  if (typeof HOST !== 'undefined' && url.indexOf('http') == -1) {
    url = HOST + url;
    opts.url = url;
  }
  xhr.request(opts, 'POST');
};

xhr.put = function (opts) {
  xhr.request(opts, 'PUT');
};

xhr.delete = function (opts) {
  xhr.request(opts, 'DELETE');
};

xhr.connect = function (opts) {
  xhr.request(opts, 'CONNECT');
};

xhr.upload = function(opts) {
  let url = opts.url;
  let params = opts.data || opts.params;
  let type = opts.type || 'json';
  let success = opts.success;
  let error = opts.error;

  let formdata = new FormData();
  for (let k in params) {
    formdata.append(k, params[k]);
  }
  formdata.append('file', opts.file);

  let req  = new XMLHttpRequest();
  // req.timeout = 10 * 1000;
  req.onload = function () {
    let resp = req.responseText;
    if (type == 'json')
      try {
        resp = JSON.parse(resp);
      } catch (err) {
        if (error) error(resp);
        return;
      }
    if (req.readyState == 4 && req.status == "200") {
      if (success) success(resp);
    } else {
      if (error) error(resp);
    }
  };
  if (opts.progress) {
    req.onprogress = function(ev) {
      opts.progress(ev.loaded, ev.total);
    };
  }
  req.onerror = function () {
    if (error) error({error: {code: -500, message: '网络访问错误！'}});
  };
  req.ontimeout = function () {
    if (error) error({error: {code: -501, message: '网络请求超时！'}});
  };
  req.open('POST', url, true);
  if (typeof APPTOKEN !== 'undefined') {
    req.setRequestHeader("apptoken", APPTOKEN);
  }
  req.send(formdata);
};

xhr.asyncUpload = async function (opts) {
  return new Promise(function (resolve, reject) {
    let url = opts.url;
    let params = opts.data || opts.params;
    let type = opts.type || 'json';
    let success = opts.success;
    let error = opts.error;

    let formdata = new FormData();
    for (let k in params) {
      formdata.append(k, params[k]);
    }
    formdata.append('file', opts.file);

    let req  = new XMLHttpRequest();
    // req.timeout = 10 * 1000;
    req.onload = function () {
      let resp = req.responseText;
      if (type == 'json')
        try {
          resp = JSON.parse(resp);
        } catch (err) {
          if (error) error(resp);
          return;
        }
      if (req.readyState == 4 && req.status == "200") {
        resolve(resp);
      } else {
        if (error) resolve(resp);
      }
    };
    if (opts.progress) {
      req.onprogress = function(ev) {
        opts.progress(ev.loaded, ev.total);
      };
    }
    req.onerror = function () {
      if (error) error({error: {code: -500, message: '网络访问错误！'}});
    };
    req.ontimeout = function () {
      if (error) error({error: {code: -501, message: '网络请求超时！'}});
    };
    req.open('POST', url, true);
    if (typeof APPTOKEN !== 'undefined') {
      req.setRequestHeader("apptoken", APPTOKEN);
    }
    req.send(formdata);
  });
};

xhr.chain = function(opts) {
  if (opts.length == 0) return;
  let xhrOpts = opts[0];
  let successProxy = xhrOpts.success;
  let then = function(resp) {
    successProxy(resp);
    xhr.chain(opts.slice(1));
  };
  xhr.promise(xhrOpts, then);
};

xhr.asyncGet = function(xhrOpt, error) {
  return new Promise(function(resolve, reject) {
    xhrOpt.success = function (resp) {
      resolve(resp);
    };
    xhrOpt.error = error;
    xhr.get(xhrOpt);
  });
};

xhr.promise = function(xhrOpt, error) {
  return new Promise(function(resolve, reject) {
    xhrOpt.success = function (resp) {
      if (resp.error) {
        if (error) error(resp.error);
        else dialog.error(resp.error.message);
        return;
      }
      resolve(resp.data);
    };
    if (error) {
      xhrOpt.error = error;
    } else {
      xhrOpt.error = () => {
        resolve({
          error: {
            code: '500',
            message: '网络异常'
          }
        });
      };
    }
    xhr.post(xhrOpt);
  });
};

xhr.longpromise = function(xhrOpt, error) {
  let container = xhrOpt.container || dom.find('#container');
  let tooltip = xhrOpt.tooltip || '操作处理中...';
  let pageLoading = dom.element(`
    <div class="page-loading hide">
      <div class="ring">${tooltip}
        <span></span>
      </div>
    </div>
  `);
  container.appendChild(pageLoading);
  pageLoading.classList.remove('hide');
  return new Promise(function(resolve, reject) {
    xhrOpt.success = function (resp) {
      if (resp.error) {
        setTimeout(() => {
          pageLoading.classList.add('hide');
          pageLoading.remove();
        }, 600);
        dialog.error(resp.error.message);
        if (error) error(resp.error);
        return;
      }
      setTimeout(() => {
        pageLoading.classList.add('hide');
        pageLoading.remove();
      }, 1200);
      resolve(resp.data);
    };
    xhrOpt.error = error;
    xhr.post(xhrOpt);
  });
};

xhr.download = function(xhrOpt) {
  let req  = new XMLHttpRequest();
  req.open('POST', xhrOpt.url, true);
  req.responseType = 'arraybuffer';
  req.onload = function () {
    if (this.status === 200) {
      let filename = "";
      let disposition = req.getResponseHeader('Content-Disposition');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        let matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
      }
      let type = req.getResponseHeader('Content-Type');

      let blob = new Blob([this.response], { type: type });
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
      } else {
        var URL = window.URL || window.webkitURL;
        var downloadUrl = URL.createObjectURL(blob);

        // use HTML5 a[download] attribute to specify filename
        var a = document.createElement("a");
        // safari doesn't support this yet
        if (typeof a.download === 'undefined') {
          window.location = downloadUrl;
        } else {
          a.href = downloadUrl;
          a.download = xhrOpt.filename || '下载的文件';
          document.body.appendChild(a);
          a.click();
        }
        // if (filename) {
        //
        // } else {
        //   window.location = downloadUrl;
        // }

        setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
      }
    }
  };
  req.setRequestHeader('Content-type', 'application/json');
  if (typeof APPTOKEN !== 'undefined') {
    req.setRequestHeader("apptoken", APPTOKEN);
  }
  req.send(JSON.stringify(xhrOpt.params || {}));
};

/**
 * 同步请求
 * 
 * @deprecated
 */
xhr.asyncRequest = function (opts, method) {
  let url = opts.url;
  let data = opts.data || opts.params;
  let type = opts.type || 'json';
  let useCase = opts.usecase || '';
  return new Promise((resolve,reject) =>{
    if(url){
      let request  = new XMLHttpRequest();
      request.timeout = 10 * 1000;
      request.onload = function () {
        let resp = request.responseText;
        if (type == 'json')
          try {
            resp = JSON.parse(resp);
          } catch (err) {
            console.log(err)
            reject(err)
            return;
          }
        if (request.readyState == 4 && request.status == "200") {
          resolve(resp)
        } else {
          reject(resp)
        }
      };
      request.onerror = function () {
        reject({error: {code: -500, message: '网络访问错误！'}})
      };
      request.ontimeout = function () {
        reject({error: {code: -501, message: '网络请求超时！'}})
      };
      request.open(method, url, true);
      request.setRequestHeader("Content-Type", "application/json");
      request.setRequestHeader("usecase", useCase);
      if (typeof APPTOKEN !== 'undefined') {
        request.setRequestHeader("apptoken", APPTOKEN);
      }
      if (data)
        request.send(JSON.stringify(data));
      else
        request.send(null);
    }
  });
};

/**
 * 同步请求
 * 
 * @deprecated
 */
xhr.asyncPost = function (opts) {
  let url = opts.url;
  if (typeof HOST !== 'undefined' && url.indexOf('http') == -1) {
    url = HOST + url;
    opts.url = url;
  }
  return xhr.asyncRequest(opts, 'POST');
};

if (typeof module !== 'undefined') {
  module.exports = { xhr };
}
if (typeof Handlebars !== "undefined") {
  Handlebars.registerHelper('ifeq', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
}

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
    iconDiv.innerHTML = '<i class="fas fa-arrow-left button icon"></i>';
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
/**
 * 聊天客户端SDK集成。
 *
 * @param opt
 *        配置项
 *
 * @constructor
 */
function Chat(opt) {
  // 聊天服务器访问地址
  this.host = opt.host || '';

  // 消息发送者资料
  this.userId = opt.userId;
  this.userType = opt.userType;

  // 固定参数，扩展用户列表专用
  this.getConversations = opt.getConversations;

  this.onInit = opt.onInit || async function() {};
  this.onSendTextMessage = opt.onSendTextMessage;
  this.onSendImageMessage = opt.onSendImageMessage;
  this.onSendAudioMessage = opt.onSendAudioMessage;
  this.onSendVideoMessage = opt.onSendVideoMessage;
  this.onSendCustomMessage = opt.onSendCustomMessage;
  this.onRevokeMessage = opt.onRevokeMessage || function(messageId) {};
  this.onMessageReceived = opt.onMessageReceived;

  // 获取未读的消息列表
  this.onUnreadMessages = opt.onUnreadMessages || function(messages) {};
  // 已读某人发的消息
  this.onReadMessages = opt.onReadMessages || function(senderId) {};
}

Chat.MESSAGE_TYPE_TEXT = 'TEXT';
Chat.MESSAGE_TYPE_IMAGE = 'IMAGE';
Chat.MESSAGE_TYPE_AUDIO = 'AUDIO';
Chat.MESSAGE_TYPE_VIDEO = 'VIDEO';
Chat.MESSAGE_TYPE_PATIENT = 'PATIENT';
Chat.MESSAGE_TYPE_CUSTOM = 'CUSTOM';

Chat.MESSAGE_STATUS_UNREAD = '01';
Chat.MESSAGE_STATUS_READ = '02';
Chat.MESSAGE_STATUS_REVOKE = '90';

Chat.prototype.init = async function(name) {
  await this.onInit();
  let self = this;
  this.scheduleName = name;
  // schedule.start(name, () => {
  //   self.fetchUnreadMessages();
  // }, 5000);

  let timUserId = this.userId + '@' + this.userType;
  let data = await xhr.promise({
    url: this.host + '/api/v3/common/script/tim/user_signature',
    params: {
      userId: timUserId,
    }
  });

  let options = {
    SDKAppID: data.appId
  };

  this.tim = TIM.create(options);
  this.tim.setLogLevel(1);
  this.tim.registerPlugin({'tim-upload-plugin': TIMUploadPlugin});
  this.tim.login({userID: timUserId, userSig: data.signature});

  // 监听事件，如：
  this.tim.on(TIM.EVENT.SDK_READY, function(event) {

  });
  this.tim.on(TIM.EVENT.MESSAGE_RECEIVED, ev => {
    for (let i = 0; i < ev.data.length; i++) {
      let timMessage = ev.data[i];
      let messageType = Chat.MESSAGE_TYPE_TEXT;
      let messageContent = null;
      if (timMessage.type === 'TIMCustomElem') {
        messageContent = JSON.parse(timMessage.payload.data).messageContent;
        // 在此处扩展自定义消息类型
        if (messageContent.imagepath) {
          messageType = Chat.MESSAGE_TYPE_IMAGE;
        } else if (messageContent.audiopath) {
          messageType = Chat.MESSAGE_TYPE_AUDIO;
        } else if (messageContent.archiveId) {
          messageType = Chat.MESSAGE_TYPE_PATIENT;
        }
      } else {
        messageContent = timMessage.payload.text;
      }
      this.onMessageReceived({
        senderId: timMessage.conversationID.substring(3),
        messageTime: moment(ev.data[i].time * 1000).format('YYYY-MM-DD HH:mm'),
        messageType: messageType,
        messageContent: messageContent,
      });
    }
  });
};

Chat.prototype.getConversations = async function() {
  let messages = await xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/find',
    params: {
      status: Chat.MESSAGE_STATUS_UNREAD,
      receiverId: this.userId,
    }
  });
  let senders = {};
  for (let i = 0; i < messages.length; i++) {
    let msg = messages[i];
    let key = msg.senderId + '#' + msg.senderType;
    if (senders[key]) {
      let sender = senders[key];
      sender.createTime = msg.createTime;
      sender.messages.push(msg);
    } else {
      let sender = {messages: []};
      senders[key] = sender;
      sender.id = key;
      sender.createTime = msg.createTime;
      sender.name = msg.senderType;
      sender.senderId = msg.senderId;
      sender.senderType = msg.senderType;
      sender.messages.push(msg);
    }
  }
  let ret = [];
  for (let key in senders) ret.push(senders[key]);
  return ret;
};

Chat.prototype.fetchMessages = async function(senderId, senderType, status) {
  let self = this;
  let conversationId = '';
  if (senderId > this.userId) {
    conversationId = senderId + '&' + this.userId;
  } else {
    conversationId = this.userId + '&' + senderId;
  }
  let messages = await xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/find',
    params: {
      // _and_condition: ' and (' +
      //   '  (convomsg.rcvrid = \'' + senderId  + '\' and convomsg.rcvrtyp = \'' + senderType + '\' and ' +
      //   '   convomsg.sndrid = \'' + this.userId  + '\' and convomsg.sndrtyp = \'' + this.userType + '\') or ' +
      //   '  (convomsg.rcvrid = \'' + this.userId  + '\' and convomsg.rcvrtyp = \'' + this.userType + '\' and ' +
      //   '   convomsg.sndrid = \'' + senderId  + '\' and convomsg.sndrtyp = \'' + senderType + '\') ' +
      //   ') ',
      conversationId: conversationId,
      _order_by: 'messageTime asc',
    },
  });
  let timestampedMessages = [];
  let startTime = null;

  for (let i = 0; i < messages.length; i++) {
    let msg = messages[i];
    let createTime = moment(msg.createTime).format('YYYY-MM-DD HH:mm');
    if (createTime != startTime) {
      startTime = createTime;
      timestampedMessages.push({
        createTime: createTime,
        groupingMessages: [{
          direction: (msg.senderId == this.userId) ? 'outgoing' : 'incoming',
          messages: [],
        }],
      });
    }
    let latest = timestampedMessages[timestampedMessages.length - 1];
    let lastDirected = latest.groupingMessages[latest.groupingMessages.length - 1];
    let direction = '';
    if (msg.senderId == this.userId) {
      direction = 'outgoing';
    } else {
      direction = 'incoming';
    }
    if (lastDirected.direction === direction) {
      lastDirected.messages.push(msg);
    } else {
      latest.groupingMessages.push({
        direction: direction,
        messages: [msg],
      })
    }
  }
  return timestampedMessages;
};

Chat.prototype.fetchUnreadMessages = function() {
  let self = this;
  xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/find',
    params: {
      status: Chat.MESSAGE_STATUS_UNREAD,
      receiverId: this.userId,
      receiverType: this.userType,
    },
  }).then((data) => {
    self.onUnreadMessages(data);
  });
};

Chat.prototype.sendMessage = async function (receiverId, receiverType, messageType, messageContent, conversationId) {
  conversationId = conversationId || (this.userId + '&' + receiverId);
  if (typeof messageContent === 'string') {
    messageContent = messageContent.replace("\\", "\\\\");
  }
  return xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/save',
    params: {
      conversationId: conversationId,
      senderId: this.userId,
      senderType: this.userType,
      receiverId: receiverId,
      receiverType: receiverType,
      messageType: messageType,
      messageTime: 'now',
      messageContent: messageContent,
      createTime: 'now',
      status: Chat.MESSAGE_STATUS_UNREAD,
      '||stdbiz/pim/conversation/merge': {
        conversationId: conversationId,
        conversationName: conversationId,
        unreadCount: 1,
        lastConversationTime: 'now',
      }
    }
  });
};

Chat.prototype.sendTextMessage = async function(receiverId, receiverType, text, conversationId) {
  let timUserId = receiverId + '@' + receiverType;
  let self = this;
  let data = await this.sendMessage(receiverId, receiverType, Chat.MESSAGE_TYPE_TEXT, text, conversationId);
  let message = this.tim.createTextMessage({
    to: timUserId,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      id: data.conversationMessageId,
      text: text
    },
  });
  return this.tim.sendMessage(message);
};

Chat.prototype.sendImageMessage = async function(receiverId, receiverType, content, conversationId) {
  let timUserId = receiverId + '@' + receiverType;
  let self = this;
  let img = await xhr.promise({
    url: this.host + '/api/v3/common/image',
    params: {
      directoryKey: 'chat',
      filedata: content.data.substring(content.data.indexOf(',') + 1),
      fileext: content.ext,
    }
  });
  let data = await this.sendMessage(receiverId, receiverType, Chat.MESSAGE_TYPE_IMAGE, JSON.stringify({
    imagepath: img.filepath,
    thumbnail: img.thumbnail,
  }), conversationId);
  let message = this.tim.createCustomMessage({
    to: timUserId,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      data: JSON.stringify({
        messageType: Chat.MESSAGE_TYPE_IMAGE,
        messageContent: {
          id: data.conversationMessageId,
          imagepath: img.filepath,
          thumbnail: img.thumbnail,
        },
      }),
    },
  });
  return this.tim.sendMessage(message);
};

Chat.prototype.sendAudioMessage = async function(receiverId, receiverType, content, conversationId) {
  let timUserId = receiverId + '@' + receiverType;
  let self = this;
  let audio = await xhr.promise({
    url: this.host + '/api/v3/common/audio',
    params: {
      directoryKey: 'chat',
      filedata: content.data.substring(content.data.indexOf(',') + 1),
      fileext: 'ogg',
    }
  });
  let data = await this.sendMessage(receiverId, receiverType, Chat.MESSAGE_TYPE_AUDIO, JSON.stringify({
    audiopath: audio.filepath,
    duration: audio.duration,
  }), conversationId);
  let message = this.tim.createCustomMessage({
    to: timUserId,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      data: JSON.stringify({
        messageType: Chat.MESSAGE_TYPE_AUDIO,
        messageContent: {
          id: data.conversationMessageId,
          audiopath: audio.filepath,
          duration: audio.duration,
        },
      }),
    },
  });
  return this.tim.sendMessage(message);
};

Chat.prototype.sendPatientMessage = async function(receiverId, receiverType, content, conversationId) {
  let timUserId = receiverId + '@' + receiverType;
  let data = await this.sendMessage(receiverId, receiverType, Chat.MESSAGE_TYPE_PATIENT, JSON.stringify(content), conversationId);
  content.id = data.conversationMessageId;
  let message = this.tim.createCustomMessage({
    to: timUserId,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      data: JSON.stringify({
        messageType: Chat.MESSAGE_TYPE_PATIENT,
        messageContent: content,
      }),
    },
  });
  return this.tim.sendMessage(message);
};

Chat.prototype.readMessages = function(senderId) {
  let self = this;
  xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/update',
    params: {
      senderId: senderId,
      readTime: 'now',
      status: Chat.MESSAGE_STATUS_READ,
    },
  }).then(resp => {
    self.onReadMessages(resp);
  });
};

Chat.prototype.revokeMessage = function(messageId) {
  return xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/update',
    params: {
      messageId: messageId,
      status: Chat.MESSAGE_STATUS_REVOKE,
    }
  }).then(data => {
    this.onRevokeMessage(messageId);
  });
};

Chat.prototype.stop = function() {
  schedule.stop(this.scheduleName);
};

if (typeof module !== 'undefined') {
  module.exports = { Chat };
}
/*
**              o8o
**              `"'
**   .oooooooo oooo  ooo. .oo.  .oo.
**  888' `88b  `888  `888P"Y88bP"Y88b
**  888   888   888   888   888   888
**  `88bod8P'   888   888   888   888
**  `8oooooo.  o888o o888o o888o o888o
**  d"     YD
**  "Y88888P'
*/
if (typeof gim === 'undefined') {
  gim = {};
}

gim.init = (username, userId, userType, handlers) => {
  gim.sender = {
    username: username,
    userId: userId,
    userType: userType,
  };
  gim.handlers = handlers;
};

/*!
** login on im server.
*/
gim.login = async () => {
  return new Promise(function (resolve, reject) {
    gim.websocket = new WebSocket('wss://gim.cq-fyy.com'); //  // ws://192.168.0.200:9999
    gim.websocket.onopen = () => {
      let requestText = {
        operation: 'login',
        userId: gim.sender.userId,
        userType: gim.sender.userType,
        payload: {},
      };
      gim.websocket.send(JSON.stringify(requestText));
    };
    gim.websocket.onclose = () => {
      // alert('closed');
      gim.login();
    };
    gim.websocket.onmessage = resp => {
      if (resp.data) {
        let res = JSON.parse(resp.data);
        let op = res.op;
        if (gim.handlers[op]) {
          gim.handlers[op](res);
        }
      }
    };
    gim.websocket.onerror = function(err) {
      reject(err);
    };
    resolve();
  });
};

/*!
** 进入某个房间。conversationId可以为null，直接填写后续的参数。
*/
gim.enter = (conversationId, receiverId, receiverType, receiverAlias) => {
  gim.conversation = {
    conversationId: conversationId,
    receiverId: receiverId,
    receiverType: receiverType,
    receiverAlias: receiverAlias,
  };
};

gim.logout = () => {
  let requestText = {
    operation: 'logout',
    userId: gim.sender.userId,
    userType: gim.sender.userType,
    payload: {},
  };
  gim.websocket.send(JSON.stringify(requestText));

  setTimeout(() => {
    gim.websocket.close();
  });
  delete gim.conversation;
  delete gim.sender;
  delete gim.handlers;
};

gim.sendText = message => {
  if (!gim.conversation) {
    throw '您还没有进入任何会话，无法发送文本，请先调用enter函数！';
  }
  let conversation = {};
  if (gim.conversation.conversationId) {
    conversation.conversationId = gim.conversation.conversationId;
  } else {
    conversation.receiverId = gim.conversation.receiverId;
    conversation.receiverType = gim.conversation.receiverType;
    conversation.receiverAlias = gim.conversation.receiverAlias;
  }
  let requestText = {
    operation: 'sendMessage',
    userId: gim.sender.userId,
    userType: gim.sender.userType,
    payload: {
      ...conversation,
      messageType: 'TEXT',
      messageContent: message.messageContent,
      senderAlias: gim.sender.username,
    },
  };
  gim.websocket.send(JSON.stringify(requestText));
};

gim.getConversations = () => {
  let requestText = {
    operation: 'getConversations',
    userId: gim.sender.userId,
    userType: gim.sender.userType,
    payload: {},
  };
  gim.websocket.send(JSON.stringify(requestText));
};

gim.getMessages = () => {
  if (!gim.conversation) {
    throw '您还没有进入任何会话，无法获取历史会话消息，请先调用enter函数！';
  }
  let conversation = {};
  if (gim.conversation.conversationId) {
    conversation.conversationId = gim.conversation.conversationId;
  } else {
    conversation.receiverId = gim.conversation.receiverId;
    conversation.receiverType = gim.conversation.receiverType;
    conversation.receiverAlias = gim.conversation.receiverAlias;
  }
  let requestText = {
    operation: 'getMessages',
    userId: gim.sender.userId,
    userType: gim.sender.userType,
    payload: {
      ...conversation,
    },
  };
  gim.websocket.send(JSON.stringify(requestText));
};

function Accordion(opts) {
	// 表单容器
	this.container = dom.find(opts.containerId);
	// 远程数据访问地址及参数
	this.url = opts.url;
	this.params = opts.params || {};
	// 本地数据
	this.local = opts.local;
	// 显示字段
	this.Data = opts.data;
	this.convert = opts.convert;
	this.rowClick = opts.rowClick;
	this.defaultIndex=opts.defaultIndex || 0;
	this.mode=opts.mode || 'radio';
	this.modeId=opts.modeId || 'check';
	if (opts.url) {
		this.reload(opts.params)
	} else {
		this.render();
	}
}

/**
 * Fetches data from remote url.
 *
 * @param params
 *        the request parameters, local data or undefined
 */
Accordion.prototype.fetch = function (params) {
	let self = this;
	if (this.url) {
		let requestParams = {};
		utils.clone(this.params, requestParams);
		utils.clone(params || {}, requestParams);
		xhr.promise({
			url: this.url,
			params: requestParams,
		}).then((data) => {
			let _data = data;
			if (self.convert) {
				_data = self.convert(data)
			}
			self.root(_data);
		});
	} else {
		this.root(params);
	}
};

Accordion.prototype.root = function (data) {
	this.container.innerHTML = '';
	let self = this;
	let root = dom.element('<div class="tabs-card"></div>');
	for (let i = 0; i < data.length; i++) {
		let item = data[i];
		let _id = self.modeId + (i + 1);
		let input='<input type='+self.mode+' id=' + _id +' '+(self.mode=='radio'?'name=radio_name':'')+'>';
		if(this.defaultIndex == i ){
			input=`<input type=${self.mode} id=${_id} ${self.mode=='radio'?'name=radio_name':''}  checked="true">`;
		}
		let Item = dom.element('<div class="tab">\n' +
				input+
				'            <label class="tab-label" for=' + _id + '>' + item.title + '</label>\n' +
				'          </div>');
		let Child = dom.element('<div class="tab-content"></div>');
		item.children.forEach(function (child, index) {
			let _childId=_id+'_child'+(index+1),_childName='child_radio_name';
			let childdom = dom.element('<div class="tab-child"><input type="radio" id='+_childId+' name='+_childName+'><label class="tab-label-min" for=' + _childId + '>' + child.title + '</label></div>');
			Child.appendChild(childdom);
			dom.bind(childdom, 'click', function (event) {
				self.rowClick(event, child, index);
			});
		})
		Item.appendChild(Child);
		root.appendChild(Item);
	}
	this.container.appendChild(root);
};

Accordion.prototype.reload = function (params) {
	this.fetch(params);
};

Accordion.prototype.render = function () {
	this.fetch({});
};


function ColumnLayout(opt) {

}

ColumnLayout.prototype.refresh = function () {

};

ColumnLayout.prototype.render = function (container, params) {

};
let ICON_REQUIRED = '<i class="fas fa-asterisk icon-required"></i>'//*
let ICON_GENERAL = '<i class="fas fa-question icon-general"></i>';//?
let ICON_CORRECT = '<i class="fas fa-check text-success" style="width: 10px;"></i>';//√
let ICON_ERROR = '<i class="fas fa-exclamation text-warning" style="width: 10px;"></i>';//!

function FormLayout(opts) {
  let self = this;
  this.fields = opts.fields;
  this.readonly = opts.readonly || false;
  // 判断是否保存前提示，此处是提示语
  this.confirmText = opts.confirmText || '';
  this.confirm = opts.confirm;
  this.actions = opts.actions || [];
  this.actionable = (typeof opts.actionable === 'undefined') ? true : false;
  this.columnCount = opts.columnCount || 2;
  this.saveText = opts.saveText || '保存';
  this.savePromptText = opts.savePromptText;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
	this.mode = opts.mode || 'rightbar';
	this.onInit = opts.onInit || function() {};
  this.toast = dom.element(`
    <div class="toast fade b-a-1 text-white" data-autohide="false" 
         style="position: absolute; left: 20%; top: 10px; width: 60%; z-index: -1;">
      <div class="toast-header pt-1">
        <strong class="mr-auto p-2"></strong>
        <button type="button" class="ml-2 mb-1 mr-2 close text-white" data-dismiss="toast">&times;</button>
      </div>
      <div class="toast-body p-2"></div>
    </div>
  `);
  this.controls = {};

  dom.find('button', this.toast).addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    self.toast.classList.remove('show', 'in');
    self.toast.style.zIndex = -1;
  });

  this.variableListeners = {};
}

/**
 * Renders the form in page.
 *
 * @param containerId
 *        the container selector or itself
 *
 * @param params
 *        the request parameters
 */
FormLayout.prototype.render = async function (containerId, params) {
  this.containerId = containerId;
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';

  await this.fetch(params);
};

/**
 * Builds the form.
 *
 * @param persisted
 *        the persisted data which is fetching from remote data
 *
 * @private
 */
FormLayout.prototype.build = async function(persisted) {
  let self = this;
  persisted = persisted || {};
  let form = dom.create('div', 'col-md-12', 'form-horizontal');
  let columnCount = this.columnCount;
  let hiddenFields = [];
  let shownFields = [];
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    let defaultValue = field.value;
    // make default value working
    if (field.name) {
      if (field.name.indexOf("[]") != -1) {
        let name = field.name.substring(0, field.name.indexOf('[]'));
        field.value = (typeof persisted[name] === 'undefined' || persisted[name] == 'null') ? null : persisted[name];
      } else if (field.name.indexOf('.') != -1) {
        let parentName = field.name.substring(0, field.name.indexOf('.'));
        let childName = field.name.substring(field.name.indexOf('.') + 1);
        field.value = (typeof persisted[parentName] === 'undefined' || persisted[parentName] == 'null') ? null :
            (typeof persisted[parentName][childName] === 'undefined' || persisted[childName] == 'null') ? null : persisted[parentName][childName];
      } else {
        field.value = (typeof persisted[field.name] === 'undefined' || persisted[field.name] == 'null') ? null : persisted[field.name];
      }
    }
    // 默认值设置
    if (!field.value && defaultValue) {
      field.value = defaultValue;
    }
    if (field.input == 'hidden') {
      hiddenFields.push(field);
    } else {
      shownFields.push(field);
    }
  }

  let rows = [];
  let len = shownFields.length;

  let groups = [];
  let group = {
    title: '',
    fields: []
  };
  for (let i = 0; i < shownFields.length; i++) {
    let field = shownFields[i];

    // 重新分组
    if (field.input === 'title') {
      groups.push(group);
      group = {
        title: field.title,
        fields: []
      };
    } else {
      group.fields.push(field);
    }
  }

  if (group.fields.length !== 0) groups.push(group);

  // hidden fields
  for (let i = 0; i < hiddenFields.length; i++) {
    let field = hiddenFields[i];
    let hidden = dom.create('input');
    hidden.type = 'hidden';
    hidden.name = field.name;
    hidden.value = field.value;
    hidden.setAttribute('data-identifiable', field.identifiable || false);
    form.appendChild(hidden);
  }

  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    if (group.title) {
      let el = dom.element('<div class="title-bordered" style="margin: 10px -10px;"><strong>' + group.title + '</strong></div>')
      form.appendChild(el);
    }
    let cols = 24 / columnCount;
    let row = dom.create('div', 'row', 'mx-0');
    for (let j = 0; j < group.fields.length; j++) {
      let field = group.fields[j];
      let pair = this.createInput(field, columnCount);

      let labelAndInput = dom.create('div', 'd-flex', 'col-24-' + cols, 'mx-0', 'mb-2');
      if (pair.label != null) {
        pair.label.classList.add('pl-3');
        pair.input.classList.add('pr-3');
        labelAndInput.appendChild(pair.label);
      }
      labelAndInput.appendChild(pair.input);
      // 指定字段的容器，以备不时只需。
      field.container = labelAndInput;
      row.appendChild(labelAndInput);
      if (field.note) {
        let el = pair.input.children[1];
        el.innerHTML = field.note;
      }
    }
    form.appendChild(row);
  }
  // 必须放在这里，否者后续容器会找不到
  this.container.appendChild(form);
  this.container.appendChild(this.toast);

  // ###################### //
  // 引用的第三方插件，重新渲染 //
  // ###################### //
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    if (field.input == 'date') {
      $(this.container).find('input[name=\'' + field.name + '\']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '\']', this.container).value = moment(field.value).format('YYYY-MM-DD');
      }
    } else if (field.input == 'datetime') {
      $(this.container).find('input[name=\'' + field.name + '_date\']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '_date\']', this.container).value = moment(field.value).format('YYYY-MM-DD');
      }

      $(this.container).find('input[name=\'' + field.name + '_time\']').datetimepicker({
        format: 'HH:mm:00',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '_time\']', this.container).value = moment(field.value).format('HH:mm:00');
      }
    } else if (field.input == 'time') {
      $(this.container).find('input[name=\'' + field.name + '\']').datetimepicker({
        format: 'hh:mm:00',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '\']', this.container).value = moment(field.value).format('hh:mm:00');
      }
    } else if (field.input == 'select') {
      let opts = field.options;
      opts.validate = FormLayout.validate;
      // 加载值或者默认值
      // 允许数组值
      if (Array.isArray(field.value)) {
        opts.selection = field.value[0][opts.fields.value];
      } else {
        opts.selection = field.value;
      }
      opts.onchange = val => {
        for (let f of self.fields) {
          self.hideOrShowField(f);
        }
        if (field.onInput) {
          field.onInput(val);
        }
      };

      if (field.variables) {
        opts.variables = field.variables;
        for (let key in opts.variables) {
          this.variableListeners[key] = (val) => {
            opts.variables[key] = val;
            this.controls[field.name] = $(this.container).find('select[name=\'' + field.name + '\']').searchselect(opts);
          }
        }
      }
      this.controls[field.name] = $(this.container).find('select[name=\'' + field.name + '\']').searchselect(opts);
    } else if (field.input == 'cascade') {
      let opts = field.options;
      opts.validate = FormLayout.validate;
      // 加载值或者默认值
      for (let j = 0; j < opts.levels.length; j++) {
        let level = opts.levels[j];
        if (typeof persisted[level.name] !== "undefined") {
          level.value = persisted[level.name];
        }
      }
      opts.required = field.required || false;
      if (this.readonly == true) {
        opts.readonly = true;
      }
      if (field.readonly == true) {
        opts.readonly = true;
      }
      $(this.container).find('div[data-cascade-name=\'' + field.name + '\']').cascadeselect(opts);
    } else if (field.input == 'checklist') {
      if (this.readonly == true) {
        field.options.readonly = true;
      }
      if (field.readonly == true) {
        field.options.readonly = true;
      }
      field.options.name = field.name;
      this.params = this.params || {};
      field.options.data = field.options.data || {};
      for (let key in this.params) {
        field.options.data[key] = this.params[key];
      }
      let container = dom.find('div[data-checklist-name=\'' + field.name + '\']', this.container);
      new Checklist(field.options).render(container, {
        selections: persisted[field.name] || []
      });
      field.container = container.parentElement.parentElement;
    } else if (field.input == 'checktree') {
      field.options.name = field.name;
      field.options.readonly = this.readonly;
      this.params = this.params || {};
      field.options.data = field.options.data || {};
      for (let key in this.params) {
        field.options.data[key] = this.params[key];
      }
      let container = dom.find('div[data-checktree-name=\'' + field.name + '\']', this.container);
      this[field.name] = new TreelikeList(field.options);
      this[field.name].render(container, field.value);
      field.container = container.parentElement.parentElement;
    } else if (field.input == 'fileupload' || field.input == 'files') {
      let container = dom.find('div[data-fileupload-name=\'' + field.name + '\']', this.container);
      await new FileUpload({
        ...field.options,
        local: persisted[field.name] || [],
        name: field.name,
      }).render(container);
      field.container = container.parentElement.parentElement;
    } else if (field.input == 'imageupload') {
      // DEPRECATED
      new ImageUpload(field.options).render(dom.find('div[data-imageupload-name=\'' + field.name + '\']', this.container));
    } else if (field.input == 'image') {
      new Medias({
        ...field.options,
        mediaType: 'image',
        multiple: false,
      }).render(dom.find('div[data-medias-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'images') {
      new Medias({
        ...field.options,
        mediaType: 'image',
      }).render(dom.find('div[data-medias-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'video') {
      new Medias({
        ...field.options,
        mediaType: 'video',
        multiple: false,
      }).render(dom.find('div[data-medias-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'videos') {
      new Medias({
        ...field.options,
        mediaType: 'video',
      }).render(dom.find('div[data-medias-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'longtext') {
      if (field.language === 'javascript') {
        let textarea = dom.find(containerId + ' textarea[name=\'' + field.name + '\']');
        let cm = CodeMirror.fromTextArea(textarea, {
          mode: 'javascript',
          lineNumbers: true,
          height: 420,
          background: '#565656'
        });
        cm.on('keyup', function(cm, what) {
          dom.find(' textarea[name=\'' + field.name + '\']', this.container).innerText = cm.getDoc().getValue();
        });
      }
    } else if (field.input == 'avatar') {
      new Avatar({
        readonly: this.readonly,
        name: field.name
      }).render(dom.find('div[data-avatar-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'logo') {
      new Logo({
        readonly: this.readonly,
        name: field.name
      }).render(dom.find('div[data-logo-name=\'' + field.name + '\']', this.container), field.value);
    }
  }

  let containerButtons = dom.create('div');
  containerButtons.classList.add('buttons');
  let buttons = dom.create('div');
	if(this.mode != 'page'){
		buttons.classList.add('float-right');
	}else{
		buttons.classList.add('row-button');
	}

  // custom buttons
  for (let i = 0; i < this.actions.length; i++) {
    buttons.appendChild(this.createButton(this.actions[i]));
    buttons.append(' ');
  }

  let buttonClose = dom.create('button', 'btn', 'btn-sm', 'btn-close');
  buttonClose.textContent = '关闭';
  dom.bind(buttonClose, 'click', function() {
    event.preventDefault();
    event.stopPropagation();
    let rightbar = dom.find('div[widget-id=right-bar]')
    // let rightbar = dom.ancestor(self.container, 'div', 'right-bar');
    if (rightbar != null) {
      rightbar.children[0].classList.add('out');
      setTimeout(function () {
        rightbar.remove();
      }, 300);
    }
  });
  if (this.actionable === false) return;
  if (this.actionable && this.mode!='page') {
    buttons.appendChild(buttonClose);
  }
  let buttonSave = dom.create('button', 'btn', 'btn-sm', 'btn-save');
  buttonSave.innerHTML = this.saveText;

  dom.bind(buttonSave, 'click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    if (self.confirm) {
      self.confirm();
    } else if (self.confirmText !== '') {
      let ct = self.confirmText;
      if (typeof self.confirmText === 'function') {
        ct = self.confirmText();
      }
      dialog.confirm(ct, () => {
        self.save();
      });
    } else {
      self.save();
    }
  });

  let rightBarBottom = dom.find('div[widget-id=right-bar-bottom]');
  if (rightBarBottom != null) {
    rightBarBottom.innerHTML = '';
    if (!this.readonly) {
      buttons.appendChild(buttonSave);
      buttons.append(' ');
    }
    // if (this.actions.length > 0) {
    let row = dom.create('div', 'full-width', 'b-a-0');
    let rightbar = dom.find('.right-bar');
    if (rightbar != null) {
      if (rightBarBottom.parentElement.style.display !== 'none') {
        rightBarBottom.appendChild(buttonSave);
        for (let action of self.actions) {
          rightBarBottom.appendChild(dom.element('<span style="display: inline-block;width: 12px;"></span>'));
          rightBarBottom.appendChild(self.createButton(action));
        }
        rightBarBottom.appendChild(dom.element('<span style="display: inline-block;width: 12px;"></span>'));
        rightBarBottom.appendChild(buttonClose);
      } else {
        containerButtons.appendChild(buttons);
        row.appendChild(containerButtons);
        this.container.appendChild(row);
      }
    } else {
      // FIXME: WHY DO THIS?
      // this.container.appendChild(buttons);
    }
  }

  this.originalPosition = this.container.getBoundingClientRect();
  this.originalPositionTop = this.originalPosition.top;

  // 根据字段不同值，显示或者隐藏其他字段
  for (let f of self.fields) {
    self.hideOrShowField(f);
  }
  // 初始化显示
  this.onInit();
};

/**
 * Fetches form data from remote data source and renders form
 * under container.
 *
 * @param read
 *        the remote options
 */
FormLayout.prototype.fetch = async function (params) {
  let self = this;
  params = params || {};
  if (!this.readOpt) {
    this.build(params);
    return;
  }
  if (this.readOpt.params) {
    for (let k in this.readOpt.params) {
      params[k] = this.readOpt.params[k];
    }
  }
  // if not need to fetch data
  if (!this.readOpt.url && this.readOpt.url == '') {
    this.build({});
    return;
  }
  let data = await xhr.promise({
    url: this.readOpt.url,
    data: params,
  });
  if (!data) data = {};
  if (self.readOpt.asyncConvert) {
    data = await self.readOpt.asyncConvert(data);
  }
  if (self.readOpt.convert) {
    data = self.readOpt.convert(data);
  }
  // 保存表单旧值的变量。
  self.oldValues = data;
  if (utils.isEmpty(data)) {
    self.build(params);
    if (self.readOpt.callback) {
      self.readOpt.callback(params);
    }
  } else {
    for (let keyParam in params) {
      if (typeof data[keyParam] === 'undefined') {
        data[keyParam] = params[keyParam];
      }
    }
    self.build(data);
    if (self.readOpt.callback) {
      self.readOpt.callback(data);
    }
  }
};

FormLayout.prototype.read = function (params) {
  let self = this;
  params = params || {};

  if (this.readOpt.params) {
    for (let k in this.readOpt.params) {
      params[k] = this.readOpt.params[k];
    }
  }
  xhr.post({
    url: this.readOpt.url,
    data: params,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      dom.formdata(self.container, resp.data);
    }
  });
};

/**
 * Saves form data to remote data source.
 */
FormLayout.prototype.save = async function (toasting) {
  let self = this;
  let awaitConvert = this.saveOpt.awaitConvert || false;
  let errors = Validation.validate($(this.containerId));
  if (errors.length > 0) {
    self.error(utils.message(errors));
    return;
  }
  // disable all buttons
  let buttonSave = dom.find('button.btn-save', this.container);
  if (buttonSave != null)
    buttonSave.innerHTML = "<i class='fa fa-spinner fa-spin'></i>数据保存中……";
  dom.disable(dom.find('button', this.container), 'disabled', true);
  let formdata = dom.formdata(this.containerId);
  let data = this.saveOpt.params || {};
  for (let key in formdata) {
    data[key] = formdata[key];
  }
  if (this.saveOpt.convert) {
    if (awaitConvert) {
      data = await this.saveOpt.convert(data)
    } else {
      data = this.saveOpt.convert(data);
    }
  } else if (this.saveOpt.asyncConvert) {
    data = await this.saveOpt.asyncConvert(data);
  }
  xhr.post({
    url: this.saveOpt.url,
    usecase: this.saveOpt.usecase,
    data: data,
    success: function (resp) {
      // enable all buttons
      if (buttonSave != null)
        buttonSave.innerHTML = self.saveText;
      dom.enable('button', self.container);
      if (resp.error) {
        self.error(resp.error.message);
        return;
      }
      let identifiables = document.querySelectorAll(' input[data-identifiable=true]', self.container);
      for (let i = 0; i < identifiables.length; i++) {
        identifiables[i].value = resp.data[identifiables[i].name];
      }
      if (self.saveOpt.callback) self.saveOpt.callback(resp.data);
      if (self.saveOpt.success) self.saveOpt.success(resp.data);
      if (toasting === false) return;
      self.success(self.savePromptText || '数据保存成功！', () => {
        // 默认自动关闭
        if (self.saveOpt.autoClose !== false) {
          let rightbar = dom.find('div[widget-id=right-bar]');
          if (rightbar != null) {
            rightbar.children[0].classList.add('out');
            setTimeout(function () {
              rightbar.remove();
            }, 300);
          }
        }
      });
    }
  });
};

/**
 * Creates input element in form.
 *
 * @param field
 *        field option
 *
 * @param FormLayout.js
 *        column count in a row
 *
 * @returns {object} label and input with add-ons dom elements
 *
 * @private
 */
FormLayout.prototype.createInput = function (field, columnCount) {
  let self = this;
  field.columnCount = field.columnCount || 1;
  columnCount = columnCount || 2;
  let _required = field.required || false;

  let averageSpace = 24 / columnCount;
  let labelGridCount = 0;
  let inputGridCount = 0;
  if (averageSpace === 24) {
    labelGridCount = 6;
    inputGridCount = 18;
  } else if (averageSpace === 12) {
    labelGridCount = 6;
    inputGridCount = 18;
  } else if (averageSpace === 8) {
    labelGridCount = 3;
    inputGridCount = 5;
  } else if (averageSpace === 6) {
    labelGridCount = 2;
    inputGridCount = 4;
  }
  let label = dom.create('div', 'col-24-' + this.formatGridCount(labelGridCount),'col-form-label', (_required?'required':'norequired'));
  label.innerText = field.title + '：';
  inputGridCount += (labelGridCount + inputGridCount) * (field.columnCount - 1);

  let groupContainer = dom.create('div', 'col-24-' + this.formatGridCount(inputGridCount));
  let group = dom.create('div', 'full-width', 'input-group');
  let feedback = dom.create('div', 'small', 'text-muted', 'pt-1');
  feedback.setAttribute('role', 'feedback');
  groupContainer.appendChild(group);
  groupContainer.appendChild(feedback);

  let input = null;
  if (field.input == 'code') {
    let fixed = field.fixed || [];
    for (let i = 0; i < fixed.length; i++) {
      let prepend = dom.element(`
        <div class="input-group-prepend">
          <span class="input-group-text">
          </span>
        </div>
      `);
      prepend.querySelector('span').innerText = fixed[i];
      group.appendChild(prepend);
    }
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('name', field.name);
    input.setAttribute('label', field.title);
  } else if (field.input == 'select') {
    input = dom.create('select', 'form-control');
    input.style = '-moz-appearance:none';
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请选择...');
    input.setAttribute('label', field.title);
  } else if (field.input == 'bool') {
    input = dom.element(`
      <div class="d-flex full-width">
        <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1" style="min-width: 48px;">
          <input class="c-switch-input" value="T" name="" type="checkbox">
          <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
        </label>
        <select class="form-control ml-4">
          <option value="-1">请选择</option>
        </select>
      </div>
    `);
    let elInput = dom.find('input', input);
    // default is checked
    // dom.find('input', input).setAttribute('checked', true);
    if (field.value === 'T' || field.value === true) {
      dom.find('input', input).setAttribute('checked', false);
    }
    if (field.disabled === true) {
      elInput.disabled = true;
    }
    elInput.setAttribute('label', field.title);
    let select = dom.find('select', input);

    if (!field.options) {
      select.remove();
    } else {
      select.name = field.name + '$';
      for (let j = 0; j < field.options.values.length; j++) {
        let value = field.options.values[j];
        select.appendChild(dom.element('<option value="' + value.value + '" ' + (field.value === value.value ? 'selected' : '') + '>' + value.text + '</option>'));
      }
      if (!field.value || field.value === 'F') {
        elInput.checked = false;
        select.disabled = true;
      } else {
        elInput.checked = true;
      }
      elInput.addEventListener('change', ev => {
        let select = dom.find('select', ev.target.parentElement.parentElement);
        if (ev.target.checked)
          select.disabled = false;
        else
          select.disabled = true;
      });
    }
    dom.find('input', input).setAttribute('name', field.name);
  } else if (field.input == 'radiotext' || field.input == 'booltext') {
    let radios = [];
    let defaultValue = '';
    field.values = field.values || [{value: '+', text: '正'},{value:'-', text: '负'}];
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      if (!val.input) {
        defaultValue = val.value;
        break;
      }
    }
    let checked = false;
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let radio = dom.element(`
        <div class="form-check form-check-inline">
          <input name="" value="" type="radio"
                 class="form-check-input radio color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      dom.find('input', radio).name = field.name;
      if (!field.value) {
        if (val.checked) {
          dom.find('input', radio).checked = true;
        }
      } else {
        if (field.value != val.value && val.value != defaultValue && !checked) {
          // 自定义的输入框的值
          dom.find('input', radio).checked = true;
        } else if (field.value == val.value) {
          // 初始的默认值
          dom.find('input', radio).checked = true;
          checked = true;
        }
      }
      if (field.required === true) {
        dom.find('input', radio).setAttribute('required', true);
        dom.find('input', radio).setAttribute('data-required', field.title);
      }
      dom.find('input', radio).value = val.value;
      dom.find('input', radio).disabled = this.readonly || field.readonly || false;
      // dom.find('label', radio).setAttribute('for', 'radio_' + val.value);
      dom.find('label', radio).textContent = val.text;
      group.append(radio);
      radios.push(radio);
    }
    for (let j = 0; j < field.values.length; j++) {
      let val = field.values[j];
      // 有输入框
      if (val.input) {
        dom.bind(radios[j], 'click', (ev) => {
          let textInput = dom.find('input[type=text]', group);
          textInput.style.display = '';
        });
        let input = dom.element('<input type="text" class="form-control">');
        input.name = val.input.name;
        input.placeholder = val.input.placeholder || '';
        input.style.display = field.value && field.value != defaultValue ? '' : 'none';
        if (val.value != field.value) {
          input.value = field.value;
          if (input.value == defaultValue) {
            input.value = '';
          }
        }
        group.appendChild(input);
      } else {
        dom.bind(radios[j], 'click', (ev) => {
          let textInput = dom.find('input[type=text]', group);
          textInput.style.display = 'none';
        });
      }
    }
  } else if (field.input == 'radio') {
    group.classList.add('col-form-label');
    field.values = field.values || [{value: '+', text: '正'},{value:'-', text: '负'}];
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let radio = dom.element(`
        <div class="form-check form-check-inline">
          <input name="" value="" type="radio"
                 class="form-check-input radio color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      // dom.find('input', radio).id = 'radio_' + val.value;
      dom.find('input', radio).name = field.name;
      if (field.value == val.value) {
        dom.find('input', radio).checked = true;
      } else if (val.checked && !field.value) {
        dom.find('input', radio).checked = true;
      }
      dom.find('input', radio).value = val.value;
      dom.find('input', radio).disabled = this.readonly || field.readonly || false;
      // dom.find('label', radio).setAttribute('for', 'radio_' + val.value);
      dom.find('label', radio).textContent = val.text;
      if (field.required === true) {
        dom.find('input', radio).setAttribute('required', true);
        dom.find('input', radio).setAttribute('data-required', field.title);
      }
      group.append(radio);
      radio.onchange = ev => {
        if (field.onInput) {
          field.onInput(field.values[i].value);
        }
        for (let f of self.fields) {
          self.hideOrShowField(f);
        }
      };
    }
  } else if (field.input == 'longtext') {
    input = dom.create('textarea', 'form-control');
    field.style = field.style || '';
    input.style = field.style;
    // if (this.readonly)
    //   input.style.backgroundColor = 'rgb(240, 243, 245)';
    if (field.style === '')
      input.rows = 4;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入');
    input.innerHTML = field.value || '';
    if (this.readonly === true || field.readonly === true) {
      input.setAttribute('disabled', true);
    }
  } else if (field.input == 'selecttext') {
    let div = dom.create('div', 'full-width', 'position-relative');
    div.style.height = '120px';
    div.style.overflow = 'hidden';
    input = dom.create('textarea', 'form-control', 'full-width');
    field.style = field.style || '';
    input.style = field.style;
    input.style.height = '120px';
    input.style.resize = 'none';

    let corner = dom.create('div');
    corner.style.position = 'absolute';
    corner.style.bottom = '0';
    corner.style.right = '0';
    corner.style.background = 'transparent';
    corner.style.borderWidth = '0px 0px 48px 48px';
    corner.style.borderStyle = 'solid';
    corner.style.borderColor = 'transparent transparent rgba(0, 0, 0, 0.3)';
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入');
    input.innerHTML = field.value || '';

    div.appendChild(input);
    div.appendChild(corner);

    let select = dom.create('a', 'btn-link', 'font-11', 'text-light');
    select.innerText = '选择';
    select.style.position = 'absolute';
    select.style.bottom = '-2px';
    select.style.right = '-2px';
    dom.bind(select, 'click', ev => {
      if (field.onSelect) {
        field.onSelect(input);
      }
    });
    if (this.readonly === true || field.readonly === true)
      input.setAttribute('disabled', true);
    else
      div.appendChild(select);

    group.appendChild(div);
    return {label: label, input: group};
  } else if (field.input == 'cascade') {
    input = dom.create('div', 'form-control');
    if (this.readonly)
      input.style.backgroundColor = 'rgb(240, 243, 245)';
    input.setAttribute('data-cascade-name', field.name);
  } else if (field.input == 'checktree') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-checktree-name', field.name);
    input.setAttribute('id', 'checktree_' + field.name);
  } else if (field.input == 'checklist') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-checklist-name', field.name);
  } else if (field.input == 'fileupload') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-fileupload-name', field.name);
  } else if (field.input == 'imageupload') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-imageupload-name', field.name);
  } else if (field.input == 'image') {
    input = dom.create('div', 'full-width', 'row', 'mx-0');
    input.setAttribute('data-medias-name', field.name);
  } else if (field.input == 'images') {
    input = dom.create('div', 'full-width', 'row', 'mx-0');
    input.setAttribute('data-medias-name', field.name);
  } else if (field.input == 'video') {
    input = dom.create('div', 'full-width', 'row', 'mx-0');
    input.setAttribute('data-medias-name', field.name);
  } else if (field.input == 'videos') {
    input = dom.create('div', 'full-width', 'row', 'mx-0');
    input.setAttribute('data-medias-name', field.name);
  } else if (field.input == 'avatar') {
    input = dom.create('div', 'full-width','avatar-img');
    input.setAttribute('data-avatar-name', field.name);
    // group.classList.remove('col-md-4', 'col-md-9');
    group.classList.add('col-24-24');
    group.appendChild(input);
    return {label: null, input: group};
  } else if (field.input == 'logo') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-logo-name', field.name);
    // sgroup.classList.remove('col-md-4', 'col-md-9');
    group.classList.add('col-24-24');
    group.appendChild(input);
    return {label: null, input: group};
  } else if (field.input == 'datetime') {
    let dateIcon = dom.element(`
      <div class="input-group-prepend">
        <span class="input-group-text">
          <i class="far fa-calendar-alt"></i>
        </span>
      </div>
    `);
    let dateInput = dom.create('input', 'form-control');
    dateInput.disabled = this.readonly || field.readonly || false;
    dateInput.setAttribute('name', field.name + '_date');
    dateInput.setAttribute('placeholder', '请选择...');
    dateInput.setAttribute('autocomplete', 'off');
    let timeIcon = dom.element(`
      <div class="input-group-prepend">
        <span class="input-group-text">
          <i class="far fa-clock"></i>
        </span>
      </div>
    `);
    let timeInput = dom.create('input', 'form-control');
    timeInput.disabled = this.readonly || field.readonly || false;
    timeInput.setAttribute('name', field.name + '_time');
    timeInput.setAttribute('autocomplete', 'off');
    group.appendChild(dateIcon);
    group.appendChild(dateInput);
    group.appendChild(timeIcon);
    group.appendChild(timeInput);
    return {label: label, input: group};
  } else if (field.input == 'tags') {
    input = dom.create('input', 'full-width');
    input.name = field.name;
    input.value = field.value;
    input.disabled = this.readonly || field.readonly || false;
  } else if (field.input == 'custom') {
    input = dom.create('input', 'form-control');
    input.name = field.name;
    input.disabled = true;
  } else {
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入');
    input.setAttribute('autocomplete', 'off');
    if (field.value) {
      input.value = field.value;
    }
  }
  if (input != null) {
    group.appendChild(input);
  }

  // 有了父节点以后的后续处理
  if (field.domain) {
    input.setAttribute('data-domain-type', field.domain);
  }
  if (field.input == 'tags') {
    input.setAttribute('placeholder', '请输入');
    new Tagify(input);
  } else if (field.input == 'date') {
    input.setAttribute('data-domain-type', 'date');
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input.indexOf('number') == 0) {
    input.setAttribute('data-domain-type', field.input);
    input.setAttribute('placeholder', '请输入');
  } else if (field.input == 'file') {
    input.setAttribute('readonly', true);
    let fileinput = dom.create('input');
    fileinput.setAttribute('type', 'file');
    fileinput.style.display = 'none';
    let upload = dom.element('<span class="input-group-text pointer"><i class="fas fa-upload text-primary"></i></span>');
    upload.addEventListener('click', function() {
      fileinput.click();
    });
    fileinput.addEventListener('change', function(event) {
      event.preventDefault();
      event.stopPropagation();
      input.value = fileinput.files[0].name;
      let idx = input.value.lastIndexOf('.');
      let ext = '';
      if (idx != -1) {
        ext = input.value.substring(input.value.lastIndexOf('.') + 1);
      }
      xhr.upload({
        url: '/api/v3/common/upload',
        params: field.params,
        file: fileinput.files[0],
        success: function(resp) {
          let item = resp.data;
          if (!item) return;
          input.setAttribute('data-file-type', fileinput.files[0].type);
          input.setAttribute('data-file-size', fileinput.files[0].size);
          input.setAttribute('data-file-path', item.filepath);
          input.setAttribute('data-file-ext', ext);
          input.setAttribute('data-file-name', item.filename);
          input.setAttribute('data-web-path', item.webpath);
        }
      });
      FormLayout.validate(input);
    });
    group.appendChild(fileinput);
    if (!this.readonly) {
      group.appendChild(upload);
    }
  }

  if (field.create) {
    let addnew = dom.element(`
      <div class="input-group-append">
        <span class="input-group-text">
          <i class="fas fa-plus-square pointer text-success"></i>
        </span>
      </div>
    `);

    if (field.input == 'custom' || field.input == 'select') {
      let name = field.name;
      field.widgetCustom = dom.element(`
        <div widget-id="widgetCustom_${name}" class="full-width"></div>
      `);
      field.create(addnew, field.widgetCustom, field);
      if (field.readonly !== true && this.readonly !== true) {
        group.appendChild(addnew);
      }
    } else {
      group.appendChild(addnew);
    }
  }

  let unit = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text"></span>
    </div>
  `);
  if (field.unit) {
    dom.find('span', unit).innerHTML = field.unit;
    group.appendChild(unit);
  }

  /*!
  ** 字段提示
  */
  let tooltip = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text width-36 icon-error"></span>
    </div>
  `);
  if (field.required && input != null /* radio, check cause input is null*/) {
    input.setAttribute('data-required', field.title);
    // dom.find('span', tooltip).innerHTML = ICON_REQUIRED;
  } else {
    // dom.find('span', tooltip).innerHTML = ICON_GENERAL;
  }
  if (field.tooltip) {
    tooltip.classList.add('pointer');
    let popup = dom.element(
      '<div class="popup hidden">' +
      '  <div class="popup-arrow"></div>' +
      '  <div class="popup-body">' + field.tooltip + '</div>' +
      '</div>');
    tooltip.appendChild(popup);
    dom.bind(tooltip, 'click', function() {
      let ox = this.offsetLeft;
      let oy = this.offsetTop;
      let height = parseInt(this.clientHeight);
      let popup = dom.find('div.popup', this);

      popup.style.right = '0';
      popup.style.top = oy - (height / 2) + 'px';

      popup.classList.remove('hidden');
      popup.classList.add('show');

      setTimeout(function(event) {
        popup.classList.remove('show');
        popup.classList.add('hidden');
      }, 2000);
    });
  }

  if (!this.readonly &&
    field.input !== 'bool' &&
    field.input !== 'radio' &&
    field.input !== 'checklist' &&
    field.input !== 'longtext' &&
    field.input !== 'checktree' &&
    field.input !== 'fileupload' &&
    field.input !== 'imageupload' &&
    field.input !== 'image' &&
    field.input !== 'images' &&
    field.input !== 'video' &&
    field.input !== 'videos' &&
    field.input !== 'files' &&
    field.input !== 'tags')
    group.append(tooltip);

  // user input
  if (input != null) {
    dom.bind(input, 'input', function (event) {
      if (field.onInput) {
        field.onInput(event);
      }
      FormLayout.validate(this);
    });
  }

  // set value programmatically
  if (field.input == 'date' || field.input == 'text' || field.input.indexOf('number') == 0 || field.input == 'file') {
    const {get, set} = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    Object.defineProperty(input, 'value', {
      get() {
        return get.call(this);
      },
      set(newVal) {
        set.call(this, newVal);
        FormLayout.validate(this);
        return newVal;
      }
    });
    input.value = field.value;
  }
  if (field.input == 'select') {
    const {get, set} = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
    Object.defineProperty(input, 'selectedIndex', {
      get() {
        return get.call(this);
      },
      set(newVal) {
        set.call(this, newVal);
        FormLayout.validate(this);
        return newVal;
      }
    });
    input.value = field.value;
  }

  if (field.input.indexOf('number') == 0) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
      input.addEventListener(event, function (event) {
        let domainType = this.getAttribute('data-domain-type');
        let validation = Validation.getDomainValidator(new ValidationModel(domainType));
        // /^-?\d*$/.test(this.value)
        if (validation.test(this.value) != REQUIRED_ERROR) {
          this.oldValue = this.value;
          this.oldSelectionStart = this.selectionStart;
          this.oldSelectionEnd = this.selectionEnd;
        } else if (this.hasOwnProperty("oldValue")) {
          this.value = this.oldValue;
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        } else {
          this.value = "";
        }
        FormLayout.validate(this);
      });
    });
  }

  if (field.widgetCustom) {
    group.appendChild(field.widgetCustom);
  }

  return {label: label, input: groupContainer};
};

/**
 * Creates button element.
 *
 * @param action
 *        action option
 *
 * @returns {button} the button dom element
 *
 * @private
 */
FormLayout.prototype.createButton = function(action) {
  let button = dom.create('button', 'btn', 'btn-sm');
  if (action.classes) {
    for (let i = 0; i < action.classes.length; i++) {
      button.classList.add(action.classes[i]);
    }
  }
  if (action.style) {
    button.style = action.style;
  }
  button.innerHTML = action.text;
  if (action.onClicked) {
    button.onclick = (ev) => {
      if (action.confirmText) {
        dialog.confirm(action.confirmText, () => {
          action.onClicked(dom.formdata(this.container));
        });
      } else {
        action.onClicked(dom.formdata(this.container));
      }
    };
  }
  return button;
};

FormLayout.prototype.error = function (message) {
  message = message || '出现系统错误！';
  message = message.replaceAll('\n', '<br>');
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-success', 'hidden');
  this.toast.classList.add('bg-danger');
  let posInScreen = this.container.getBoundingClientRect();
  let offsetTop = posInScreen.top - this.originalPositionTop;

  this.toast.style.top = (-offsetTop + 10) + 'px';
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '错误';
  this.toast.classList.add('show', 'in');
};

FormLayout.prototype.success = function (message, callback) {
  let self = this;
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-danger', 'hidden');
  // this.toast.classList.add('bg-success');
  this.toast.style.backgroundColor = 'var(--color-success)'

  let posInScreen = this.container.getBoundingClientRect();
  let offsetTop = posInScreen.top - this.originalPositionTop;

  this.toast.style.top = (-offsetTop + 10) + 'px';
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '成功';
  this.toast.classList.add('show', 'in');
  setTimeout(function() {
    dom.find('button', self.toast).click();
    if (callback) callback();
  }, 1000);
};

FormLayout.prototype.hideSidebar = function (message, callback) {
  let rightbar = dom.find('div[widget-id=right-bar]')
  // let rightbar = dom.ancestor(self.container, 'div', 'right-bar');
  if (rightbar != null) {
    rightbar.children[0].classList.add('out');
    setTimeout(function () {
      rightbar.remove();
    }, 300);
  }
};

/**
 * Validates an input in a form.
 *
 * @param input
 *        the dom element for user input
 */
FormLayout.validate = function(input) {
  if (input.tagName == 'OPTION')
    input = input.parentElement;
  if (input == null) return;

  let span = dom.find('div span.icon-error', input.parentElement);
  if (span == null) return; // readonly
  let dataRequired = input.getAttribute('data-required');
  let required =  dataRequired != null && dataRequired !== '';
  if (input.tagName == 'SELECT') {
    if (input.selectedIndex == -1) {
      if (required)
        span.innerHTML = ICON_REQUIRED;
      else
        span.innerHTML = ICON_GENERAL;
    } else {
      span.innerHTML = ICON_CORRECT;
    }
    return;
  } else if (input.tagName == 'DIV') {
    // cascade
    let links = input.querySelectorAll('a[data-cascade-name]');
    let values = [];
    for (let i = 0; i < links.length; i++) {
      let link = links[i];
      let value = link.getAttribute('data-cascade-value');
      if (value != null && value != '-1' && value != '') {
        values.push(value);
      }
    }
    if (values.length == links.length) {
      span.innerHTML = ICON_CORRECT;
    } else if (values.length == 0) {
      if (required)
        span.innerHTML = ICON_REQUIRED;
      else
        span.innerHTML = ICON_GENERAL;
    } else {
      span.innerHTML = ICON_ERROR;
    }
    return;
  }

  if (input.value.trim() == '') {
    if (required)
      span.innerHTML = ICON_REQUIRED;
    else
      span.innerHTML = ICON_GENERAL;
    return;
  }

  let domainType = input.getAttribute('data-domain-type');
  if (domainType != null && domainType != '') {
    let validation = Validation.getDomainValidator(new ValidationModel(domainType));
    let res = validation.test(input.value);
    if (res == NO_ERRORS) {
      span.innerHTML = ICON_CORRECT;
    } else if (res == FORMAT_ERROR) {
      span.innerHTML = ICON_ERROR;
    }
  } else {
    span.innerHTML = ICON_CORRECT;
  }
};

FormLayout.prototype.setInputValue = function (name, value) {
  let foundField = null;
  for (let field of this.fields) {
    if (field.name === name) {
      foundField = field;
      break;
    }
  }
  if (foundField == null) return;
  if (foundField.input === 'bool') {
    let elInput = dom.find(`input[name="${name}"]`, this.container);
    if (value === 'T' && !elInput.checked) {
      elInput.click();
      return;
    }
    if (value === 'F' && elInput.checked) {
      elInput.click();
      return;
    }
  }
};

FormLayout.prototype.getInputValue = function (name) {
  let foundField = null;
  for (let field of this.fields) {
    if (field.name === name) {
      foundField = field;
      break;
    }
  }
  if (foundField == null) return null;
  if (foundField.input === 'bool') {
    let elInput = dom.find(`input[name="${name}"]`, this.container);
    return elInput.checked ? 'T' : 'F';
  }
  return null;
};

FormLayout.prototype.input = function(nameAndValue) {
  let name = nameAndValue.name;
  let value = nameAndValue.value;
  let text = nameAndValue.text;
  let control = this.controls[name];
  if (!control) return;
  let newOption = new Option(text, value, false, true);
  control.append(newOption).trigger('change');
};

FormLayout.prototype.formatGridCount = function(count) {
  if (count < 10) {
    return '0' + count;
  }
  return '' + count;
};

FormLayout.prototype.setVariables = function(vars){
  for (let key in vars) {
    if (this.variableListeners[key]) {
      this.variableListeners[key](vars[key]);
    }
  }
};

FormLayout.prototype.getField = function(name) {
  for (let field of this.fields) {
    if (field.name === name)
      return field;
  }
  return {};
};

/**
 * 通过字段值判断其他字段显示与否。
 *
 * 添加：2023-04-19
 */
FormLayout.prototype.hideOrShowField = function(field) {
  let data = dom.formdata(this.container);
  if (typeof field.visible === 'function') {
    if (field.visible(data) === true) {
      if (field.required === true) {
        let el = this.container.querySelector('[name="' + field.name + '"]');
        el.setAttribute('data-required', field.title);
      }
      field.container.style.display = '';
    } else {
      if (field.required === true) {
        let el = this.container.querySelector('[name="' + field.name + '"]');
        el.setAttribute('data-required', '');
      }
      field.container.style.setProperty('display', 'none', 'important');
    }
  }
};

FormLayout.prototype.hideFields = function (names) {
  let hide = (name) => {
    let input = dom.find('[name="' + name + '"]', this.container);
    input.style.display = 'none';
    input.parentElement.parentElement.style.setProperty('display', 'none', 'important');
  };
  if (Array.isArray(names)) {
    for (let name of names) {
      hide(name);
    }
  } else {
    hide(names);
  }
};

FormLayout.prototype.showFields = function (names) {
  let show = (name) => {
    let input = dom.find('[name="' + name + '"]', this.container);
    input.style.display = '';
    input.parentElement.parentElement.style.display = '';
  };
  if (Array.isArray(names)) {
    for (let name of names) {
      show(name);
    }
  } else {
    show(names);
  }
};

/**
 * 新的输入值和旧的值比较形成结果。
 */
FormLayout.prototype.compare = function (data) {
  let oldValues = data || this.oldValues || {};
  let newValues = dom.formdata(this.containerId);
  // if (this.saveOpt.convert) {
  //   newValues = this.saveOpt.convert(newValues);
  // }
  let ret = [];
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    let oldValue = oldValues[field.name];
    let oldText = oldValues[field.name];
    let newValue = newValues[field.name];
    let newText = newValues[field.name];
    if (field.input == 'date') {
      oldText = moment(oldValue).format('YYYY-MM-DD');
    } else if (field.input == 'select') {
      if (field.options.values) {
        for (let val of field.options.values) {
          if (val.value === oldValue) {
            oldText = val.text;
          }
          if (val.value === newValue) {
            newText = val.text;
          }
        }
      }
    }
    newValue = newValue ? newValue.toString() : '';
    oldValue = oldValue ? oldValue.toString() : '';
    newText = newText ? newText.toString() : '';
    oldText = oldText ? oldText.toString() : '';
    if (newValue !== oldValue) {
      ret.push({
        name: field.name,
        oldValue: oldValue,
        oldText: oldText,
        newValue: newValue,
        newText: newText,
      });
    }
  }
  return ret;
};

FormLayout.prototype.getData = function () {
  let ret = dom.formdata(this.container);
  for (let key in ret) {
    this.assignValue2Name(ret, key, ret[key]);
  }
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    if (field.input === 'images') {
      let values = [];
      let container = dom.find('div[data-medias-name="' + field.name + '"]', this.container);
      let imgs = container.querySelectorAll('img');
      imgs.forEach(img => {
        let pel = img.parentElement;
        let model = dom.model(pel);
        values.push({
          ...model,
        });
      });
      this.assignValue2Name(ret, field.name, values);
    } else if (field.input === 'image') {
      let container = dom.find('div[data-medias-name="' + field.name + '"]', this.container);
      let img = container.querySelector('img');
      if (img == null) continue;
      let model = dom.model(img.parentElement);
      this.assignValue2Name(ret, field.name, model);
    } else if (field.input === 'video') {
      let container = dom.find('div[data-medias-name="' + field.name + '"]', this.container);
      let img = container.querySelector('img');
      if (img == null) continue;
      let model = dom.model(img.parentElement);
      this.assignValue2Name(ret, field.name, model);
    } else if (field.input === 'videos') {

    } else if (field.input === 'tags') {
      let container = dom.find('input[name="' + field.name + '"]', this.container).parentElement;
      let tags = container.querySelectorAll('tag');
      let value = '';
      for (let i = 0; i < tags.length; i++) {
        if (value != '') {
          value += ','
        }
        value += tags[i].innerText;
      }
      ret[field.name] = value;
    }
  }
  return ret;
};

FormLayout.prototype.setData = function (data) {

};

/**
 * @private
 */
FormLayout.prototype.assignValue2Name = function (owner, name, value) {
  let dotIndex = name.indexOf('.');
  if (dotIndex == -1) {
    owner[name] = value;
    return;
  }
  let hierarchy = name.substring(0, dotIndex);
  if (!owner[hierarchy]) {
    owner[hierarchy] = {};
  }
  this.assignValue2Name(owner[hierarchy], name.substring(dotIndex + 1), value);
  delete owner[name];
};
/**
 * 
 */
var FrozenColumnsTable = function(opts) {
	// 远程数据源
    this.url = opts.url;
    // 本地数据源，未封装的数据源
    this.local = opts.local;
    if (typeof opts.local !== "undefined") {
    	this.local = {};
    	this.local.total = opts.local.length;
    	this.local.data = opts.local;
    }
    this.limit = opts.limit || 25;
    this.cache = opts.cache || "server";
    this.style = opts.style || "full";
    
    // 高度和宽度，用来固定表头和列的参数
    this.width = opts.width;
    this.height = opts.height;
    this.tbodyHeight = opts.tbodyHeight;
    
    // 冻结的列数量，基于零开始冻结
    this.frozenColumnCount = opts.frozenColumnCount || 0;
    this.frozenHeader = opts.frozenHeader || false;
    this.columnHeight = opts.columnHeight || '32px';
    
    this.boundedQuery = opts.boundedQuery || null;
    //是否只显示获取的数据长度对应的表格行数
    this.showDataRowLength = opts.showDataRowLength || false;
    this.containerId = opts.containerId;

    if (typeof opts.useCookie === "undefined") {
        this.useCookie = false;
    } else {
        this.useCookie = opts.useCookie;
    }
    this.afterLoad = opts.afterLoad || function(obj) {
    };
    /**
     * [{ title: "", children: [], template: "<a href='${where}'>${displayName}</a>", params: {where: "", displayName:
     * "default"} rowspan: 1 }]
     */
    this.columns = opts.columns || []; //所有一级列数量
    this.allcolumns = 0; //所有的列数量（包含了嵌套列)）
    this.columnMatrix = [];
    var max = 0;
    for (var i = 0; i < this.columns.length; ++i) {
        var col = this.columns[i];
        max = Math.max(max, (col.rowspan || 1));
        if(typeof col.colspan != "undefined"){
            this.allcolumns += col.colspan;
        }else{
            this.allcolumns++;
        }
    }
    this.mappingColumns = [];
    this.filters = {};
    this.headRowCount = max;
    this.start = 0;
    this.rollbackStart = 0;
    this.total = 0;
    this.table = null;
    this.result = null;
    for (var i = 0; i < max; ++i) {
        this.columnMatrix.push([]);
    }
    this.buildMatrix(this.columns, 0);
    this.buildMappingColumns(this.columns);

    this.rotateconfig = {
        len: 25, //图像每次旋转的角度
        brushtm: 70, //旋转的间隙时间
        maxptnum: 10, //提示文字后面.的最长数量
        textcololor: "#629BA0"
    }
};

/**
 * Turns to the previous page.
 */
FrozenColumnsTable.prototype.prev = function() {
    if (this.start <= 0)
        return;
    this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
FrozenColumnsTable.prototype.next = function() {
    if (this.start + this.limit >= this.total)
        return;
    this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the given page.
 * 
 * @param {integer}
 *            page - the page number
 */
FrozenColumnsTable.prototype.go = function(page, criteria) {
    if (page <= 0 || page > this.lastPageNumber())
        return;
    this.rollbackStart = this.start;
    this.start = this.limit * (page - 1);
    // this.disablePaging();
    this.request(criteria);
};

/**
 * Renders the table in the web brower.
 * 
 * @param {string}
 *            containerId - the container id in the dom.
 */
FrozenColumnsTable.prototype.render = function(containerId, params) {
    if (typeof this.contaienrId === 'undefined') this.containerId = containerId;
    var cntr = $('#' + this.containerId);
    cntr.empty();
    cntr.append(this.root(params)).append(this.pagination());
    if (typeof params === "undefined" || params == '' || params == '{}') {
	    // this.beforeRequest();
	    this.go(1);
	    this.afterRequest();
    } else if (typeof params === 'object') {
        for (k in params) {
            this.addFilter(k, params[k]);
        }
        this.request({});
    } else {
    	var ps = $.parseJSON(params);
    	// this.beforeRequest(ps);
    	this.request(ps);
    	this.afterRequest();
    }
};

FrozenColumnsTable.prototype.beforeRequest = function (initParams) {
    var _this = this;

    //var loadding = $("<h6> 正在加载数据，请稍候....</h6>");
    var loaddingct = $("<div></div>");
    loaddingct.attr("class","loaddingct");
    var loadding = $("<img/>");
    var loaddingtext= $("<h6>数据正在加载，请稍候</h6>");
    loaddingtext.css("color",_this.rotateconfig.textcololor);
    loaddingct.append(loaddingtext);
    var len = 0,ptnum=0;
    
    window.setInterval(function(){
        len += _this.rotateconfig.len;
        $("#"+loadding.attr("id")).css({
            '-webkit-transform' : "rotate(" + len +"deg)",
            '-moz-transform'    : "rotate(" + len +"deg)",
            '-ms-transform'     : "rotate(" + len +"deg)",
            '-o-transform'      : "rotate(" + len +"deg)",
            'transform'         : "rotate(" + len +"deg)",
        });

        if(ptnum++ < _this.rotateconfig.maxptnum )
            loaddingtext.html(loaddingtext.html()+".");
        else{
            ptnum = 0;
            loaddingtext.html("数据正在加载，请稍候");
        }
    }, _this.rotateconfig.brushtm);
    
    $(this.table.find('tbody')).append($("<tr></tr>").append($("<td></td>").attr("colspan",this.allcolumns).append(loaddingct)));
};

FrozenColumnsTable.prototype.afterRequest = function () {
	
};

FrozenColumnsTable.prototype.requestError = function () {
    this.table.find("div.loaddingct").html('<h6 style="color:red">数据加载出错，请联系管理员解决...</h6>');
};
/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
FrozenColumnsTable.prototype.root = function(initParams) {
	if (typeof initParams === "undefined") {
		initParams = {};
	}
    var tableClass = 'table table-responsive-sm table-hover table-outline mb-0';
	var ret = $('<div class="fixed-table-container"></div>');
	// ret.css('overflow-y', 'hidden');
    this.table = $('<table class="' + tableClass + '"></table>');
    
    // 参考http://issues.wenzhixin.net.cn/bootstrap-table/#extensions/fixed-columns.html
    // 的实现，需要添加若干元素
    this.frozenHeaderColumnsContainer = $('<div class="fixed-table-header-columns" style="display: block; z-index: 9999"></div>');
    this.frozenHeaderColumnsTable = $('<table class="' + tableClass + '"></table>');
    this.frozenHeaderColumnsTable.append('<thead class="thead-light"><tr></tr></thead>').append('<tbody></tbody>');
    this.frozenHeaderColumnsContainer.append(this.frozenHeaderColumnsTable);
    ret.append(this.frozenHeaderColumnsContainer);
    
    this.headerContainer = $('<div class="fixed-table-header"></div>');
    this.headerTable = $('<table class="' + tableClass + '" style="position: relative"></table>');
    this.headerTable.append('<thead class="thead-light"><tr></tr></thead>').append('<tbody></tbody>');
    this.headerContainer.append(this.headerTable);
    ret.append(this.headerContainer);
    
    this.frozenBodyColumnsContainer = $('<div class="fixed-table-body-columns" style="display: block; top: 46px;"></div>');
    this.frozenBodyColumnsTable = $('<table class="' + tableClass + '"></table>');
    this.frozenBodyColumnsTable.append('<thead class="thead-light"><tr></tr></thead>').append('<tbody></tbody>');
    this.frozenBodyColumnsContainer.append(this.frozenBodyColumnsTable);
    ret.append(this.frozenBodyColumnsContainer);
    
    this.bodyContainer = $('<div class="fixed-table-body"></div>');
    this.bodyTable = $('<table class="' + tableClass + '" style="margin-top: -51px;"></table>');
    this.bodyTable.append('<thead class="thead-light"><tr></tr></thead>').append('<tbody></tbody>');
    this.bodyContainer.append(this.bodyTable);
    ret.append(this.bodyContainer);
    
    if (typeof this.width !== 'undefined') this.table.css('width', this.width);
    if (typeof this.height !== 'undefined') ret.css('height', this.height);
    // if (!this.frozenHeader) this.table.addClass('table');
    // this.table.addClass("table table-bordered table-striped");
    this.table.addClass(tableClass);
    
    var frozenColumnsWidth = 0;
    var self = this;
    var thead = $('<thead class="thead-light"></thead>');
    for (var i = 0; i < this.columnMatrix.length; ++i) {
        var tr = $("<tr></tr>");
        for (var j = 0; j < this.columnMatrix[i].length; ++j) {
        	var col = this.columnMatrix[i][j];
            var th = $('<th style="text-align: center"></th>');
            var span = $("<span class='pull-right fa fa-arrows-v'></span>");
            span.css("opacity", "0.3");
            span.css('margin-top', '2px');
            span.addClass('fa');
            span.on("click", function(evt) {
            	var sorting = "asc";
            	var span = $(evt.target);
            	if (span.hasClass("fa-arrows-v")) {
            		span.removeClass("fa-arrows-v");
            		span.addClass("fa-sort-amount-asc");
            		span.css("opacity", "0.6");
            		sorting = "asc";
            	} else if (span.hasClass("fa-sort-amount-asc")) {
            		span.removeClass("fa-sort-amount-asc");
            		span.addClass("fa-sort-amount-desc");
            		sorting = "desc";
            	} else if (span.hasClass("fa-sort-amount-desc")) {
            		span.removeClass("fa-sort-amount-desc");
            		span.addClass("fa-sort-amount-asc");
            		sorting = "asc";
            	}
            	// 其余的重置
            	if (!span.hasClass("fa-arrows-v")) {
            		self.table.find("th span").each(function (idx, elm) {
            			if (span.attr("data-order") == $(elm).attr("data-order")) return;
            			$(elm).removeClass("fa-sort-amount-asc");
            			$(elm).removeClass("fa-sort-amount-desc");
            			$(elm).addClass("fa-arrows-v");
            			$(elm).css("opacity", "0.3");
            		});
            	}
            	// 请求数据
            	self.filters["orderBy"] = span.attr("data-order");
            	self.filters["sorting"] = sorting;
            	self.request();
            });
            th.attr('rowspan', col.rowspan || 1);
            th.attr('colspan', col.colspan || 1);
            // style
            th.attr('style', col.style || "");
            // 如果设置了列宽
            if (typeof col.width !== 'undefined') {
                th.css('width', col.width);
                if (j < this.frozenColumnCount)
                    frozenColumnsWidth += parseInt(col.width);
            }
            // 当需要冻结表头
            if (this.frozenHeader == true) {
                thead.css('float', 'left');
                th.css('float', 'left');
            }
            // 默认居中
            th.css('text-align', 'center');
            if (typeof col.headerClick === "undefined") {
            	//th.text(col.title);
            	th.append(col.title);
            } else {
                var a = $('<a>');
                a.on('click', col.headerClick);
                th.append(a);
                a.css("cursor", "default");
                a.text(col.title);
            }
            // 如果定义了data-order属性，则添加
            if (typeof col.order !== "undefined") {
            	span.attr("data-order", col.order);
            	// 根据初始化的过滤条件中，显示图标
            	if (col.order === initParams["orderBy"]) {
            		span.removeClass("fa sort");
            		if (initParams["sorting"] === "asc") {
            			// span.addClass("glyphicon-sort-by-attributes");
                        span.addClass('fa fa-sort-amount-asc')
            		} else {
            			// span.addClass("glyphicon-sort-by-attributes-alt");
                        span.addClass('fa fa-sort-amount-desc')
            		}
            	}
            	th.append(span);
            }
            th.css('overflow', 'hidden');
            tr.append(th);
            // 冻结列的设置
            if (j < this.frozenColumnCount) {
                this.frozenHeaderColumnsTable.find('thead tr:eq(0)').append(th.clone());
            }
            this.headerTable.find('thead tr:eq(0)').append(th.clone());
            this.bodyTable.find('thead tr:eq(0)').append(th.clone());
        }
        thead.append(tr);
    }
    this.table.append(thead);
    // 添加个空的表体
    this.table.append('<tbody></tbody>');
    // ret.append(this.table);
    
    if (this.width) {
        this.headerTable.css('width', this.width);
        this.bodyTable.css('width', this.width);
    }
    if (this.height) {
        // ret.css('height', this.height);
        // this.headerTable.css('height', this.height);
        this.frozenBodyColumnsContainer.css('height', (parseInt(this.height) - 19) + 'px');
    }
    this.frozenHeaderColumnsContainer.css('width', frozenColumnsWidth + 5 + 'px');
    this.frozenBodyColumnsContainer.css('width', frozenColumnsWidth + 5 + 'px');
    
    var self = this;
    this.bodyContainer.on('scroll', function () {
        self.frozenBodyColumnsContainer.find('table').css('top', -$(this).scrollTop());
        self.headerContainer.find('table').css('left', -$(this).scrollLeft());
    });
    
    return ret;
};


/**
 * Builds pagination bar for table.
 * 
 * @return {object} a pagination bar, the jquery div.
 */
FrozenColumnsTable.prototype.pagination = function() {
	if (this.limit <= 0) {
		return;
	}
    var self = this;
    var div = $('<div></div>');
    div.css('float', 'right');
    if (this.frozenColumnCount > 0) {
        div.css('margin', '52px');
    } else {
        div.css('margin', '8px');
    }
    var ul = $('<ul></ul>');
    ul.addClass('pagination');
    this.firstPage = $('<li></li>');
    var a = $('<a class="page-link"></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('首页');
    a.on('click', function() {
        self.go(1);
    });
    this.firstPage.append(a);

    if (this.style === 'full') {
        ul.append(this.firstPage);
    }

    this.prevPage = $('<li></li>');
    a = $('<a class="page-link"></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('上一页');
    a.on('click', function() {
        self.prev();
    });
    this.prevPage.append(a);
    ul.append(this.prevPage);

    li = $('<li></li>');
    li.addClass('disabled');
    this.pagebar = $('<a class="page-link"></a>');
    this.pagebar.attr('href', 'javascript:void(0)');
    this.pagebar.attr('style', 'cursor: default');
    this.pagebar.text("0/0");
    li.append(this.pagebar);
    ul.append(li);

    this.nextPage = $('<li></li>');
    a = $('<a class="page-link"></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('下一页');
    a.on('click', function() {
        self.next();
    });
    this.nextPage.append(a);
    ul.append(this.nextPage);

    this.lastPage = $('<li></li>');
    a = $('<a class="page-link"></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('末页');
    a.on('click', function() {
        self.go(self.lastPageNumber());
    });
    this.lastPage.append(a);
    if (this.style === 'full') {
        ul.append(this.lastPage);
    }
    
    /*
    li = $('<li class=disabled></li>');
    a = $('<a class="page-link"></a>');
    a.attr('style', 'cursor: default');

    this.pagenum = $('<input/>');
    this.pagenum.attr('size', 1);
    this.pagenum.attr('style', 'font-size: 11px; text-align: right; width: 25px; height: 20px;');
    if (this.style === 'full') {
      a.append(this.pagenum);
      li.append(a);
      ul.append(li);
    }

    li = $('<li></li>');
    a = $('<a class="page-link"></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('跳转');
    a.on('click', function() {
        var str = self.pagenum.val();
        if (typeof str === 'undefined' || str === '')
            return;
        // remove whitespace
        str = str.replace(/^\s+|\s+$/g, '');
        if (str === '')
            return;
        if (isNaN(self.pagenum.val()))
            return;
        var pn = parseInt(self.pagenum.val());
        if (pn < 0 || pn > self.lastPageNumber())
            return;
        self.go(pn);
    });

    if (this.style === 'full') {
        li.append(a);
        ul.append(li);
    }
    */

    if (this.style === 'none') {
        return;
    }
    div.append(ul);
    return div;
};

/**
 * Shows the page number in the page bar and controls each link status.
 * 
 * @private
 */
FrozenColumnsTable.prototype.showPageNumber = function() {
    var pagenum = this.start / this.limit + 1;
    var lastpagenum = this.lastPageNumber() , total = this.total;
    lastpagenum = lastpagenum ? lastpagenum : 0,total = total ? total : 0;
    if (this.limit <= 0) {
		return;
	}
    this.pagebar.html(pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录");
    this.firstPage.removeClass();
    this.prevPage.removeClass();
    this.nextPage.removeClass();
    this.lastPage.removeClass();
    if (pagenum == 1) {
        this.firstPage.addClass('disabled');
        this.prevPage.addClass('disabled');
    }
    if (pagenum == this.lastPageNumber()) {
        this.nextPage.addClass('disabled');
        this.lastPage.addClass('disabled');
    }
};

FrozenColumnsTable.prototype.disablePaging = function() {
	if (this.limit <= 0) {
		return;
	}
    this.firstPage.removeClass();
    this.prevPage.removeClass();
    this.nextPage.removeClass();
    this.lastPage.removeClass();
    this.firstPage.addClass('disabled');
    this.prevPage.addClass('disabled');
    this.nextPage.addClass('disabled');
    this.lastPage.addClass('disabled');
};

/**
 * Gets the last page number.
 * 
 * @return the last page number
 */
FrozenColumnsTable.prototype.lastPageNumber = function() {
    if (this.total == 0 || this.limit == -1) {
        return 1;
    }
    var residue = this.total % this.limit;
    if (residue == 0) {
        return parseInt(this.total / this.limit);
    } else {
        return parseInt(this.total / this.limit + 1);
    }
};

/**
 * Gets the max col span for the given column.
 * 
 * @param {object}
 *            column - the column object
 * 
 * @private
 */
FrozenColumnsTable.prototype.maxColSpan = function(column) {
    var ret = 1;
    var max = 0;
    for (var i = 0; column.children && i < column.children.length; ++i) {
        max = Math.max(max, this.maxColSpan(column.children[i]));
    }
    ret += max;
    return ret;
};

/**
 * Clears all data rows.
 * 
 * @private
 */
FrozenColumnsTable.prototype.clear = function() {
    // this.table.find("thead").remove(); // 如果手动添加了表格头部
    $(this.table.find('tbody')).empty();
};

/**
 * Builds the direct columns which are used to map values with result.
 * 
 * @param {array}
 *            columns - the columns
 * 
 * @private
 */
FrozenColumnsTable.prototype.buildMappingColumns = function(columns) {
    for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
        if (!col.children || col.children.length == 0) {
            this.mappingColumns.push(col);
        } else {
            this.buildMappingColumns(col.children);
        }
    }
};

/**
 * Builds column matrix.
 * 
 * @param {object}
 *            parent - the parent column
 * 
 * @param {integer}
 *            index - the matrix row index
 * 
 * @private
 */
FrozenColumnsTable.prototype.buildMatrix = function(columns, index) {
    if (!columns)
        return;
    var currentIndex = index;

    // add column children
    for (var i = 0; i < columns.length; ++i) {
        var col = columns[i];
        if (col.children && col.children.length > 0) {
            col.colspan = col.colspan || 1;
            this.buildMatrix(col.children, index + 1);
        }
        this.columnMatrix[currentIndex].push(col);
    }
};

/**
 * 
 */
FrozenColumnsTable.prototype.request = function(others) {
    var self = this;
    var params = {};
    if (self.boundedQuery != null) {
    	var ft = self.boundedQuery.formdata();
    	for (var k in ft) {
            this.filters[k] = ft[k];
        }
    }
    if (typeof others !== "undefined") {
    	for (var k in others) {
    		if (k == "start") {
        		this.start = parseInt(others[k])
        	} else if (k == "limit") {
        		this.limit = parseInt(others[k]);
        	} else {
        		this.filters[k] = others[k];
        	}
    	}
    }
    for ( var k in this.filters) {
        params[k] = this.filters[k];
    }
    params['start'] = this.start;
    params['limit'] = this.limit;
    for (var k in this.filters) {
    	params[k] = this.filters[k];
    }
    // params['criteria'] = JSON.stringify(this.filters);
    // this.setCookie();
    if (typeof this.url !== "undefined") {
	    $.ajax({
	        url: this.url,
	        type: 'POST',
	        data: params,
	        success: function(resp) {
	        	var result;
	        	if (typeof resp === "string") {
	        		result = $.parseJSON(resp);
	        	} else {
	        		result = resp;
	        	}
	            self.total = result.total;
	            self.fill(result);
	            self.showPageNumber();
	            self.afterLoad(result);
	        },
	        error: function(resp) {
	            self.start = self.rollbackStart;
	            self.showPageNumber();
	            self.requestError();
	        }
	    });
    	return;
    }
    this.loadLocal();
};

/**
 * 加载本地数据分页显示。
 */
FrozenColumnsTable.prototype.loadLocal = function () {
	this.total = this.local.total;
	var result = {};
	result.total = this.local.total;
	result.data = [];
	for (var i = this.start; i < (this.start + this.limit); i++) {
		result.data.push(this.local.data[i] == null ? "&nbsp;" : this.local.data[i]);
	}
	this.fill(result);
	this.showPageNumber();
    this.afterLoad(result);
};

FrozenColumnsTable.prototype.addFilter = function(name, value) {
    this.filters[name] = value;
};

FrozenColumnsTable.prototype.clearFilters = function() {
    this.filters = {};
};

FrozenColumnsTable.prototype.replace = function(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 */
FrozenColumnsTable.prototype.fill = function(result) {
    var self = this;
    this.clear();
    var mappingColumns = this.mappingColumns;
    if(result.data && result.data[0]) {
    	var limit = this.limit;
    	limit = limit < 0 ? result.data.length : limit;
    	var tbody = $(this.table.find('tbody'));
    	if (typeof this.tbodyHeight !== 'undefined') {
    	    tbody.css('height', this.tbodyHeight);
    	    tbody.css('overflow-y', 'auto');
    	}
	    for (var i = 0; i < limit; ++i) {
	        var tr = $("<tr></tr>");
	        tr.css('height', this.columnHeight)
	        if (i < result.data.length) {
	            var row = result.data[i];
	            for (var j = 0; j < mappingColumns.length; ++j) {
	                var col = mappingColumns[j];
	                var td = $("<td></td>");
	                // 冻结列
	                // if (j < this.frozenColumnCount) td.addClass('fixed-table-column');
	                if (col.style) {
	                    td.attr("style", col.style);
	                }else{
                        td.attr("style", "text-align: center; vertical-align:middle");
                    }
	                if (typeof col.width !== 'undefined') td.css('width', col.width);
	                if (this.frozenHeader == true) {
	                    tbody.css('float', 'left');
	                    td.css('float', 'left');
	                }
	                if (col.template) {
	                    var html = col.template.toString();
	                    for (k in row) {
                            row[k] = row[k] == null ? "" : row[k];
	                        html = this.replace(html, "\\{" + k + "\\}", row[k]);
	                    }
	                    if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
	                        html = '';
	                    }
	                    td.html(html);
	                }
	                if (col.displayFunction) {
	                    col.displayFunction(row, td, j);
	                }
	                tr.append(td);
	            }
	        } else {
	            if (this.limit <= 0) {
	                break;
	            }
	            for (var j = 0; j < mappingColumns.length; ++j) {
	                var td = $("<td>&nbsp;</td>");
	                tr.append(td);
	            }
	        }
	        tbody.append(tr);
            var trFrozen = $('<tr>');
            this.frozenBodyColumnsTable.append(trFrozen);
            tr.find('td').each(function(idx, td) {
                if (idx < self.frozenColumnCount) {
                    trFrozen.append($(td).clone());
                }
            });
            this.bodyTable.find('tbody').append(tr.clone());
	    }
    }

};


function GridView(opt) {
  this.columnCount = opt.columnCount || 2;
  this.local = opt.local || [];
  this.url = opt.url;
  this.params = opt.params || {};
  // functions
  this.create = opt.create;
  this.error = opt.error || function (err) {};
}

GridView.prototype.fetch = async function (error) {
  if (!this.url) return this.local;
  let data = await xhr.promise({
    url: this.url,
    params: this.params,
  }, error);
  if (data) {
    this.local = data;
  }
  return this.local;
};

GridView.prototype.root = async function () {
  let ret = dom.element(`
    <div class="row mx-0">
    </div>
  `);
  let cols = 24 / this.columnCount;
  if (cols < 10) {
    cols = '0' + cols;
  }
  for (let i = 0; i < this.columnCount; i++) {
    let el = dom.element(`<div class="col-24-${cols}"></div>`);
    ret.appendChild(el);
  }
  let index = 0;
  this.local = await this.fetch();
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    let el = this.create(i, item);
    index = i % this.columnCount;
    ret.children[index].appendChild(el);
  }
  return ret;
};

GridView.prototype.render = async function (containerId) {
  this.container = dom.find(containerId);
  this.container.appendChild(await this.root());
};

GridView.prototype.appendElement = function (el) {
  for (let i = 0; i < this.columnCount; i++) {

  }
};

function GroupingBox(opt) {
  this.groups = opt.groups;
}

GroupingBox.AVATAR = `
  <div class="row mb-3" style="justify-content: center; background: #7aa6da; margin-right: -20px; margin-left: -20px;">
    <div class="avatar avatar-128">
      <img src="img/avatars/5.jpg">
    </div>
  </div>
`;

GroupingBox.TITLED_ITEM = `
  <div>
    <div class="title-bordered mb-2">
      <strong></strong>
    </div>
    <div class="mb-3">
    </div>
  </div>
`;

GroupingBox.prototype.render = function(containerId, params) {
  let container = dom.find(containerId);
  for (let i = 0; i < this.groups.length; i++) {
    let group = this.groups[i];
    if (group.type === 'avatar') {
      let elAvatar = dom.element(GroupingBox.AVATAR);
      container.appendChild(elAvatar);
    } else if (group.type == 'list') {

    } else if (group.type == 'list') {

    } else {
      let elTitledItem = dom.element(GroupingBox.TITLED_ITEM);
      let elStrong = dom.find('strong', elTitledItem);
      elStrong.innerHTML = group.title;
      let elDiv = dom.find('div.mb-3', elTitledItem);
      xhr.post({
        url: group.url,
        data: params,
        success: function(resp) {
          // TODO
          group.render(elDiv, resp.data);
        }
      });
      container.appendChild(elTitledItem);
    }
  }
};

GroupingBox.skeleton = function() {
  return dom.element(`
<div style="width: 100%;">
  <div style="margin: 0px auto; padding-bottom: 24px; width: 200px;">
    <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
  </div>
  <div style="border-bottom: 1px solid rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(0, 0, 0, 0.3);">
    <div
        style="align-items: center; cursor: pointer; display: flex; justify-content: space-between; padding: 16px 0px;">
      <div style="width: 40%;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
      </div>
      <div
          style="border-color: rgba(0, 0, 0, 0.3) transparent transparent; border-style: solid; border-width: 8px 8px 0px; height: 0px; width: 0px;"></div>
    </div>
    <div style="display: none; margin-bottom: 16px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
  <div style="border-bottom: 1px solid rgba(0, 0, 0, 0.3);">
    <div
        style="align-items: center; cursor: pointer; display: flex; justify-content: space-between; padding: 16px 0px;">
      <div style="width: 80%;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
      </div>
      <div
          style="border-color: transparent transparent rgba(0, 0, 0, 0.3); border-style: solid; border-width: 0px 8px 8px; height: 0px; width: 0px;"></div>
    </div>
    <div style="display: block; margin-bottom: 16px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
  <div style="border-bottom: 1px solid rgba(0, 0, 0, 0.3);">
    <div
        style="align-items: center; cursor: pointer; display: flex; justify-content: space-between; padding: 16px 0px;">
      <div style="width: 60%;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
      </div>
      <div
          style="border-color: rgba(0, 0, 0, 0.3) transparent transparent; border-style: solid; border-width: 8px 8px 0px; height: 0px; width: 0px;"></div>
    </div>
    <div style="display: none; margin-bottom: 16px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
</div>
  `);
};
/**
 * Encapsulates all functions of list view container.
 * <p>
 * And the functions are listed below:
 *
 * 1. RELOAD a list
 * 2. ADD an item to a list
 * 3. REMOVE an item from a list
 * 4. CHANGE an item in a list
 * 5. REORDER items in a list
 * 6. LOAD more items into a list
 * 7. CHECK an item in a list
 * 8. SELECT an item in a list
 */
function ListView(opt) {
  // the remote data source
  this.url = opt.url;
  this.usecase = opt.usecase;
  this.params = opt.params || {};
  // 懒加载标志，通常用于多级联动时的次级列表，不主动加载
  this.lazy = opt.lazy === true;
  this.hoverable = opt.hoverable !== false;
  this.activateable = opt.activateable === true;
  this.itemClass = opt.itemClass || [];
  this.slidingActions = opt.slidingActions || [];

  this.emptyHtml = opt.emptyHtml || `
    <div class="d-flex flex-wrap mt-2">
      <img class="m-auto" src="/img/nodata.png" width="60%">
      <div style="flex-basis: 100%; height: 0;"></div>
      <div class="text-muted m-auto mt-2" style="font-weight: bold;">没有任何数据</div>
    </div>
  `;
  this.idField = opt.idField;

  /*!
  ** 用于比较用的标识字段。
  */
  this.compare = opt.compare || function(selection, row) {return false;};
  this.selections = opt.selections || [];
  this.local = opt.local || [];
  this.create = opt.create || function(idx, row) {};
  this.complete = opt.complete;

  this.draggable = opt.draggable === true;

  this.start = opt.start || 0;
  this.limit = opt.limit || -1;

  this.borderless = opt.borderless || false;
  this.height = opt.height;
  this.tooltip = opt.tooltip;
  this.required = opt.required || false;
  // event callback
  this.onRemove = opt.onRemove;
  this.onReorder = opt.onReorder;
  this.onCheck = opt.onCheck;
  this.onSelect = opt.onSelect;
  this.onFilter = opt.onFilter;
  this.onAdd = opt.onAdd;
  this.onSearch = opt.onSearch;
  this.onClick = opt.onClick;

  this.observableItems = new rxjs.Observable();
};

/**
 * Fetch data from remote data source.
 */
ListView.prototype.fetch = async function (params) {
  let requestParams = {};
  params = params || {};
  utils.clone(this.params, requestParams);
  utils.clone(params, requestParams);
  let self = this;
  if (this.url) {
    this.data = this.data || {};
    this.data.start = this.start;
    this.data.limit = this.limit;

    let data = await xhr.promise({
      url: this.url,
      params: requestParams,
    });
    Array.prototype.push.apply(self.local, data);
  }
  if (self.local.length == 0) {
    if (this.emptyHtml) {
      this.contentContainer.innerHTML = this.emptyHtml;
    }
  } else {
    self.append(this.local);
  }
};

/**
 * Renders a list view under its container.
 */
ListView.prototype.render = function(containerId, loading) {
  if (typeof containerId === 'string')
    this.container = document.querySelector(containerId);
  else
    this.container = containerId;
  this.container.innerHTML = '';
  let ulHeight = this.height - 37;
  // style="height: 120px; overflow-y: auto; border: 1px solid rgba(0, 0, 0, 0.125); border-top: none;"
  if (this.onFilter) {
    let topbar = dom.element(`
      <div class="input-group position-sticky" style="top: 0; left: 0; z-index: 10;">
        <div class="input-group-prepend">
          <span class="input-group-text" style="border-bottom-left-radius: unset;">
            <i class="fas fa-search"></i>
          </span>
        </div>
        <input class="form-control" placeholder="搜索..."  style="border-bottom-right-radius: unset;">
        <div class="input-group-append">
          <span class="input-group-text pointer text-primary" style="border-bottom-right-radius: unset;">
            <i class="fas fa-plus"></i>
          </span>
          <span class="input-group-text" style="border-bottom-right-radius: unset;">
            <i class="fas fa-question icon-general"></i>
          </span>
          <span class="input-group-text" style="border-bottom-right-radius: unset;">
            <i class="fas fa-asterisk icon-required"></i>
          </span>
        </div>
      </div>
    `);
    let input = dom.find('input', topbar);
    dom.bind(input, 'input', ev => {
      clearTimeout(this.delayToSearch);
      this.delayToSearch = setTimeout(() => {
        this.onFilter(this, input.value);
      }, 500);
    });
    if (!this.required) {
      topbar.children[2].children[2].remove();
    }
    if (!this.tooltip) {
      topbar.children[2].children[1].remove();
    }
    if (!this.onAdd) {
      topbar.children[2].children[0].remove();
    }
    if (topbar.children[2].children.length == 0) {
      topbar.children[2].remove();
    }
    this.container.appendChild(topbar);
  }

  this.contentContainer = dom.create('div', 'full-width');
  let ul = dom.create('ul', 'list-group', 'full-width', 'overflow-hidden');
  if (this.borderless) {
    ul.classList.add('b-a-0');
  }
  if (this.onFilter) {
    let ulContainer = dom.create('div');
    ulContainer.style.height = ulHeight + 'px';
    ulContainer.style.overflowY = 'auto';
    ulContainer.style.border = '1px solid rgba(0, 0, 0, 0.125)';
    ulContainer.style.borderTop = '';
    ulContainer.appendChild(ul);
    this.contentContainer.appendChild(ulContainer);
  } else {
    this.contentContainer.appendChild(ul);
  }
  this.container.appendChild(this.contentContainer);

  if (loading !== false && this.lazy !== true)
    this.reload();
};

/**
 * Reloads list items into a list.
 */
ListView.prototype.reload = function(params) {
  params = params || {};
  let ul = dom.find('ul', this.container);
  ul.innerHTML = '';

  this.start = 0;
  // 如果指定了远程链接，则本地数据无效
  if (this.url)
    this.local = [];
  this.fetch(params);
};

/**
 * Loads more list items into a list.
 */
ListView.prototype.load = function() {
  this.start = this.local.length;
  this.fetch();
};

ListView.prototype.remove = function(model) {
  if (this.idField) {
    let ul = dom.find('ul', this.container);
    for (let i = 0; i < ul.children.length; i++) {
      let child = ul.children[i];
      let childModel = dom.model(child);
      if (childModel[this.idField] === model[this.idField]) {
        child.remove();
      }
    }
  }
};

/**
 * Appends list item dom element(s) with the given data to list view.
 *
 * @param {any} data
 *        an array or object
 *
 * @private
 */
ListView.prototype.append = function(data, index) {
  let self = this;
  let ul = this.container.querySelector('ul');
  if (ul == null) {
    this.container.innerHTML = '';
    ul = dom.create('ul', 'list-group', 'full-width');
    this.container.appendChild(ul);
  }
  let len = ul.querySelectorAll('li').length;

  if (Array.isArray(data)) {
    let rows = data;
    for (let i = 0; i < rows.length; i++) {
      this.append(rows[i]);
    }
    if (self.complete) {
      self.complete(data);
    }
  } else {
    let row = data;
    // check duplicated
    if (this.idField) {
      for (let i = 0; i < ul.children.length; i++) {
        let child = ul.children[i];
        let childModel = dom.model(child);
        if (childModel[this.idField] === row[this.idField]) {
          return;
        }
      }
    }

    let li = dom.create('li', 'list-group-item');
    if (this.hoverable !== false) {
      li.classList.add('list-group-item-action');
    }
    if (this.activateable === true) {
      dom.bind(li, 'click', ev => {
        for (let i = 0; i < li.parentElement.children.length; i++) {
          let el = li.parentElement.children[i];
          el.classList.remove('active');
        }
        li.classList.add('active');
      });
    }
    for (let i = 0; i < this.itemClass.length; i++) {
      li.classList.add(this.itemClass[i]);
    }
    if (this.borderless) {
      li.classList.add('b-a-0');
    }
    if (this.onClick) {
      dom.bind(li, 'click', this.onClick);
    }
    li.style.paddingLeft = '16px';
    li.style.paddingRight = '16px';
    li.style.paddingTop = '8px';
    li.style.paddingBottom = '8px';
    li.style.display = 'flex';
    li.style.alignItems = 'center';

    if (this.onFilter) {
      li.style.borderLeftWidth = '0';
      li.style.borderRightWidth = '0';
      li.style.borderBottomWidth = '0';
    }

    let div = this.create(len, row, li);
    div.style.width = '100%';

    if (this.onCheck) {
      let input = dom.element(`
        <input class="pointer checkbox color-info is-outline mr-2" type="checkbox">
      `);
      for (let i = 0; i < this.selections.length; i++) {
        if (this.compare(this.selections[i], row)) {
          input.setAttribute('checked', true);
          break;
        }
      }
      dom.bind(input, 'change', function() {
        self.onCheck(this.checked, dom.model(this), this);
      });
      dom.model(input, row);
      li.appendChild(input);
    }
    li.appendChild(div);

    if (this.slidingActions.length > 0) {
      this.actionElements = [];
      for (let i = 0; i < this.slidingActions.length; i++) {
        let slidingAction = this.slidingActions[i];
        slidingAction.width = parseInt(slidingAction.width || 64);
        li.appendChild(slidingAction.create());
      }
      dom.bind(li, 'touchstart', ev => {
        this.touchStartX = ev.touches[0].screenX;
        this.touchStartY = ev.touches[0].screenY;
      });
      dom.bind(li, 'touchmove', ev => {
        this.touchMoveX = ev.touches[0].screenX;
        this.touchMoveY = ev.touches[0].screenY;
        let distanceX = this.touchStartX - this.touchMoveX;
        let distanceY = this.touchStartY - this.touchMoveY;
        if (Math.abs(distanceX) < 30) return;
        if (Math.abs(distanceY) > 30) return;
        if (distanceX > 0) {
          let avg = distanceX / this.slidingActions.length;
          for (let j = 1; j < li.children.length; j++) {
            let rect = li.children[j].getBoundingClientRect();
            if (rect.width >= this.slidingActions[j - 1].width) {
              continue;
            }
            if (avg >= this.slidingActions[j - 1].width) avg = this.slidingActions[j - 1].width;
            li.children[j].style.minWidth = avg + 'px';
            li.children[j].style.display = '';
          }
        } else {
          distanceX = -distanceX / 10;
          let avg = distanceX / this.slidingActions.length;
          for (let j = 1; j < li.children.length; j++) {
            let rect = li.children[j].getBoundingClientRect();
            let width = rect.width - avg;
            width = width <= 5 ? 0 : width;
            if (width == 0) {
              li.children[j].style.width = '0';
              li.children[j].style.minWidth = 'unset';
            } else {
              li.children[j].style.minWidth = width + 'px';
            }
          }
        }
      });
      dom.bind(li, 'touchend', ev => {
        this.touchendX = ev.changedTouches[0].screenX;
        this.touchendY = ev.changedTouches[0].screenY;
        let distanceX = this.touchStartX - this.touchendX;
        let distanceY = this.touchStartY - this.touchendY;
        if (Math.abs(distanceX) < 30) return;
        if (Math.abs(distanceY) > 30) return;
        if (distanceX >= 30) {
          this.expandSlidingActions(li);
        } else if (distanceX <= -30) {
          this.collapseSlidingActions(li);
        } else {
          this.collapseSlidingActions(li);
        }
      });
    }

    if (this.idField) {
      li.setAttribute("data-list-item-id", row[this.idField])
    }
    dom.model(li, row);

    if (typeof index === 'number') {
      if (index < 0) {
        ul.insertBefore(li, ul.children[ul.children.length + index]);
      } else {
        ul.insertBefore(li, ul.children[index]);
      }
    } else {
      ul.appendChild(li);
    }

    if (this.onRemove) {
      let link = dom.element(`
        <a class="btn text-danger float-right font-18" style="padding: 0; margin-left: auto;">
          <i class="fas fa-times" style=""></i>
        </a>
      `);
      dom.bind(link, 'click', function(ev) {
        ev.stopPropagation();
        self.onRemove(this.parentElement, dom.model(this.parentElement));
      });
      dom.model(link, row);
      li.appendChild(link);
    }

    if (this.onReorder)
      this.setReorderable(li);
    else if (this.draggable) {
      li.setAttribute("draggable", "true");
      li.addEventListener('dragover', function (event) {
        event.preventDefault();
      });
      li.addEventListener("dragstart", function(event) {

      });
    }
  }
};

ListView.prototype.setLocal = function(data) {
  if (!data || data.length == 0) {
    this.contentContainer.innerHTML = '';
    if (this.emptyHtml) {
      this.contentContainer.innerHTML = this.emptyHtml;
    }
    return;
  } else {
    this.contentContainer.innerHTML = '';
  }
  let ul = dom.find('ul', this.contentContainer);
  if (ul == null) {
    let ul = dom.create('ul', 'list-group', 'full-width');
    if (this.borderless) {
      ul.classList.add('b-a-0');
    }
    let ulContainer = dom.create('div');
    let ulHeight = this.height - 37;
    ulContainer.style.height = ulHeight + 'px';
    ulContainer.style.overflowY = 'auto';
    ulContainer.style.border = '1px solid rgba(0, 0, 0, 0.125)';
    ulContainer.style.borderTop = '';
    ulContainer.appendChild(ul);
    this.contentContainer.appendChild(ulContainer);
  } else {
    ul.innerHTML = '';
  }
  for (let row of data) {
    this.append(row);
  }
};

ListView.prototype.replace = function(data) {
  let ul = this.container.querySelector('ul');
  for (let i = 0; i < ul.children.length; i++) {
    let li = ul.children[i];
    let model = dom.model(li);
    if (model[this.idField] === data[this.idField]) {
      dom.model(li, data);
      li.innerHTML = '';
      li.appendChild(this.create(i, data));
      break;
    }
  }
};

ListView.prototype.search = function(query) {
  let ul = this.container.querySelector('ul');
  for (let i = 0; i < ul.children.length; i++) {
    let li = ul.children[i];
    if (li.innerText.indexOf(query) != -1) {
      li.style.display = '';
    } else {
      li.style.display = 'none';
    }
  }
};

ListView.prototype.setReorderable = function(li) {
  let ul = dom.find('ul', this.container);

  ul.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
  ul.ondrop = event => {
    if (this.onReorder) {
      this.onReorder(dom.model(this.draggingElement), this.getItemIndex(this.draggingElement),
        this.draggingElementOriginalIndex);
    }
    this.draggingElement.style.opacity = '';
    this.draggingElement = null;
    this.clonedDraggingElement = null;
  };

  li.setAttribute("draggable", "true");
  li.ondragover = event => {
    let li = dom.ancestor(event.target, 'li');
    let ul = li.parentElement;
    if (li == this.draggingElement) {
      return;
    }

    let liIndex = this.getItemIndex(li);
    if (liIndex < this.draggingElementIndex) {
      ul.insertBefore(this.draggingElement, li);
    } else if (liIndex > this.draggingElementIndex) {
      if (li.nextElementSibling == null) {
        ul.appendChild(this.draggingElement);
      } else {
        ul.insertBefore(this.draggingElement, li.nextElementSibling);
      }
    }

    this.draggingElementIndex = liIndex;
    event.preventDefault();
  };
  li.ondragstart = event => {
    let li = dom.ancestor(event.target, 'li');
    let ul = li.parentElement;
    let x = event.layerX;
    let y = event.layerY;
    let target = event.target;
    y = target.offsetTop + y;

    this.clonedDraggingElement = li.cloneNode(true);

    this.draggingElement = li;
    this.draggingElement.style.opacity = "0.3";
    this.draggingElementIndex = this.getItemIndex(li);
    this.draggingElementOriginalIndex = this.draggingElementIndex;

    event.dataTransfer.setData("id", li.getAttribute('data-list-item-id'));
    event.dataTransfer.setData("y", y);
  };
};

ListView.prototype.getItemIndex = function(li) {
  let ul = li.parentElement;
  for (let i = 0; i < ul.children.length; i++) {
    if (li == ul.children[i]) {
      return i;
    }
  }
};

ListView.prototype.setHeight = function(height) {
  let ul = this.container.querySelector('ul');
  ul.style.height = height + 'px';
};

ListView.prototype.activate = function(li) {
  let ul = this.container.querySelector('ul');
  for (let i = 0; i < ul.children.length; i++) {
    ul.children[i].classList.remove('active');
  }
  li.classList.add('active');
};

ListView.prototype.getCheckedValues = function () {
  if (!this.onCheck) return [];
  let checkboxes = this.container.querySelectorAll('input.checkbox');
  let ret = [];
  for (let checkbox of checkboxes) {
    if (checkbox.checked === true) {
      let li = dom.ancestor(checkbox, 'li');
      ret.push(dom.model(li));
    }
  }
  return ret;
};

ListView.prototype.expandSlidingActions = function (li) {
  let width = li.children[1].getBoundingClientRect().width;
  if (width >= this.slidingActions[0].width.width) return;
  let fun = (li) => {
    for (let i = 1; i < li.children.length; i++) {
      let action = li.children[i];
      let rect = action.getBoundingClientRect();
      if ((rect.width + 5) >= this.slidingActions[i - 1].width) {
        action.style.minWidth = this.slidingActions[i - 1].width + 'px';
        clearInterval(this.interval4SlidingActions);
        continue;
      };
      action.style.minWidth = (rect.width + 5) + 'px';
    }
  };
  this.interval4SlidingActions = setInterval(() => {
    fun(li);
  }, 5);
};

ListView.prototype.collapseSlidingActions = function (li) {
  let width = li.children[1].getBoundingClientRect().width;
  if (width <= 0) return;
  this.interval4SlidingActions = setInterval(() => {
    for (let i = 1; i < li.children.length; i++) {
      let action = li.children[i];
      let rect = action.getBoundingClientRect();
      if ((rect.width - 5) <= 0) {
        action.style.width = '0';
        action.style.minWidth = 'unset';
        action.style.display = 'none';
        clearInterval(this.interval4SlidingActions);
        continue;
      };
      action.style.minWidth = (rect.width - 5) + 'px';
    }
  }, 10);

};

ListView.prototype.subscribe = function(name, callback) {

};

function MobileForm(opts) {
  let self = this;
  this.fields = opts.fields;
  this.readonly = opts.readonly || false;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
}

MobileForm.prototype.render = async function (container) {
  container.innerHTML = '';
  let root = await this.root();
  container.appendChild(root);
};

MobileForm.prototype.root = async function() {
  let ret = dom.element(`
    <div class="form form-horizontal"></div>
  `);
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    let el = null;
    if (field.input === 'date') {
      el = this.buildDate(field);
    } else if (field.input === 'time') {
      el = this.buildTime(field);
    } else if (field.input === 'bool') {
      el = this.buildSwitch(field);
    } else if (field.input === 'radio') {
      el = await this.buildRadio(field);
    } else if (field.input === 'check') {
      el = await this.buildCheck(field);
    } else if (field.input === 'select') {
      el = await this.buildSelect(field);
    } else if (field.input === 'hidden') {
      el = dom.templatize(`
        <input type="hidden" name="{{name}}">
      `, field);
    } else if (field.input === 'mobile') {
      el = this.buildMobile(field);
    } else if (field.input === 'id') {
      el = this.buildId(field);
    } else if (field.input === 'district') {
      el = this.buildDistrict(field);
    } else if (field.input === 'ruler') {
      el = this.buildRuler(field);
    } else if (field.input === 'images') {
      el = this.buildImages(field);
    } else if (field.input === 'longtext') {
      el = dom.templatize(`
        <div class="form-group row">
          <label class="col-form-label col-24-06">{{title}}</label>
          <div class="col-24-18">
            <textarea type="text" name="{{name}}" class="form-control" placeholder="请填写"></textarea>
          </div>
        </div>
      `, field);
      if (this.readonly === true) {
        dom.find('textarea', el).setAttribute('placeholder', '');
        dom.find('textarea', el).setAttribute('readonly', true);
      }
    } else {
      el = dom.templatize(`
        <div class="form-group row">
          <label class="col-form-label col-24-06">{{title}}</label>
          <div class="col-24-18 d-flex">
            <input type="text" name="{{name}}" class="form-control" placeholder="请填写">
            {{#if unit}}
            <span class="ml-auto text-muted small mr-2 mt-2">{{unit}}</span>
            {{/if}}
          </div>
        </div>
      `, field);
      if (this.readonly === true) {
        dom.find('input', el).setAttribute('placeholder', '');
        dom.find('input', el).setAttribute('readonly', true);
      }
    }
    ret.appendChild(el);
  }
  return ret;
};

MobileForm.prototype.buildDate = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" class="form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="ml-auto material-icons font-16 position-relative" style="top: 5px; left: -2px;">calendar_today</span>
      </div>
    </div>
  `, field);
  if (this.readonly === true) {
    ret.querySelectorAll('input')[0].setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      title: field.title,
      confirm: date => {
        let row = dom.ancestor(ev.target, 'div', 'col-24-18');
        dom.find('input[type=text]', row).value = moment(date).format('YYYY年MM月DD日');
        dom.find('input[type=hidden]', row).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
      },
    });
    rd.show();
  });
  return ret;
};

MobileForm.prototype.buildTime = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" class="form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="ml-auto material-icons font-16 position-relative" style="top: 5px; left: -2px;">schedule</span>
      </div>
    </div>
  `, field);
  if (this.readonly === true) {
    ret.querySelectorAll('input')[0].setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      title: field.title,
      confirm: date => {
        let row = dom.ancestor(ev.target, 'div', 'col-24-18');
        dom.find('input[type=text]', row).value = moment(date).format('YYYY年MM月DD日');
        dom.find('input[type=hidden]', row).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
      },
    });
    rd.show();
  });
  return ret;
};

MobileForm.prototype.buildSwitch = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex pr-3 pl-3">
        <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1" style="min-width: 48px;">
        <input class="c-switch-input" value="T" name="{{name}}" type="checkbox">
        <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
      </label>
      </div>
    </div>
  `, field);
  return ret;
};

MobileForm.prototype.buildRadio = async function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 input-group pr-3 pl-3"></div>
    </div>
  `, field);

  if (this.readonly === true) {
    ret.children[1].innerText = field.text || '';
    return ret;
  }

  for (let row of field.options.values) {
    row.checked = row.checked || false;
    let el = dom.templatize(`
      <div class="form-check form-check-inline">
        <input name="{{name}}" value="{{value}}" {{#if checked}}checked{{/if}} type="radio" class="form-check-input radio color-primary is-outline">
        <label class="form-check-label" for="">{{text}}</label>
      </div>
    `, {...row, name: field.name});
    ret.children[1].appendChild(el);
  }
  return ret;
};

MobileForm.prototype.buildCheck = async function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 input-group pr-3 pl-3"></div>
    </div>
  `, field);

  if (this.readonly === true) {
    ret.children[1].innerText = field.text || '';
    return ret;
  }

  for (let row of field.options.values) {
    row.checked = row.checked || false;
    let el = dom.templatize(`
      <div class="form-check form-check-inline">
        <input name="{{name}}" value="{{value}}" {{#if checked}}checked{{/if}} type="checkbox" class="form-check-input checkbox color-primary is-outline">
        <label class="form-check-label" for="">{{text}}</label>
      </div>
    `, {...row, name: field.name});
    ret.children[1].appendChild(el);
  }
  return ret;
};

MobileForm.prototype.buildSelect = async function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" class="form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="ml-auto material-icons font-20 position-relative" style="top: 3px;">expand_more</span>
      </div>
    </div>
  `, field);
  if (this.readonly === true) {
    ret.querySelectorAll('input')[0].setAttribute('placeholder', '');
    return ret;
  }
  let values = field.values;
  if (!values && field.url) {
    let data = [];
    data = await xhr.promise({
      url: field.url,
      params: {},
    });
    values = [];
    for (let i = 0; i < data.length; i++) {
      values.push({
        text: data[i][field.textField],
        value: data[i][field.valueField],
      });
    }
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      title: field.title,
      format: 'oo',
      values: values,
      confirm: data => {
        let row = dom.ancestor(ev.target, 'div', 'col-24-18');
        dom.find('input[type=text]', row).value = data.text;
        dom.find('input[type=hidden]', row).value = data.value;
      },
    });
    rd.show();
  });
  return ret;
};

MobileForm.prototype.buildMobile = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" name="{{name}}" class="form-control" readonly placeholder="请输入...">
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    new Numpad({
      type: 'mobile',
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

MobileForm.prototype.buildId = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" name="{{name}}" class="form-control" readonly placeholder="请输入...">
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    new Numpad({
      type: 'id',
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

MobileForm.prototype.buildDistrict = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" name="{{name}}" class="form-control" readonly placeholder="请选择...">
        <span class="ml-auto material-icons font-20 position-relative" style="top: 3px;">expand_more</span>
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    new DistrictPicker({
      type: 'id',
      success: (val) => {
        let str = '';
        if (val.province) {
          str += val.province.chineseDistrictName;
        }
        if (val.city) {
          str += ' ' + val.city.chineseDistrictName;
        }
        if (val.county) {
          str += ' ' + val.county.chineseDistrictName;
        }
        if (val.town) {
          str += ' ' + val.town.chineseDistrictName;
        }
        input.value = str;
        input.setAttribute('data-value', JSON.stringify(val));
      }
    }).show(document.body);
  });
  return ret;
};

MobileForm.prototype.buildRuler = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" name="{{name}}" class="form-control" readonly placeholder="请选择...">
        {{#if unit}}
        <span class="ml-auto text-muted small mr-2 mt-2">{{unit}}</span>
        {{/if}}
        <span class="ml-auto material-icons font-20 position-relative" style="top: 3px;">straighten</span>
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {

  });
  return ret;
};

MobileForm.prototype.buildImages = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row pb-2">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <div class="d-flex align-items-center justify-content-center" 
             style="height: 80px; width: 80px; border: 1px solid #eee;">
          <i class="fas fa-plus" style="color: #bbb;"></i>
        </div>
      </div>
    </div>
  `, field);
  return ret;
};

function MobileWizard(opt) {
  let self = this;
  this.topic = opt.topic;
  this.steps = opt.steps || [];
  this.root = dom.element(`
    <div style="width: 100%">
      <div class="wizard-progress">
      </div>
      <div class="wizard-content">
      </div>
    </div>
  `);
}

MobileWizard.prototype.render = function(containerId, params) {
  this.container = dom.find(containerId);
  this.content = dom.find('div.wizard-content', this.root);
  let elSteps = dom.find('div.wizard-progress', this.root);
  for (let i = 0; i < this.steps.length; i++) {
    let step = this.steps[i];
    let stepIndex = i + 1;
    let elStep = dom.element(`
      <div class="step-${stepIndex}" widget-on-render="" data-step="${i}" style="cursor: pointer;">
        <strong class="title"></strong>
      </div>
    `);
    step.index = i;
    elStep.style.width = (100 / this.steps.length) + '%';
    if (step.active === true) {
      this.current = step;
    }
    dom.find('strong.title', elStep).innerHTML = step.title;
    elSteps.appendChild(elStep);
  }
  this.container.appendChild(this.root);

  this.display(this.current);
};

MobileWizard.prototype.display = function(current) {
  let self = this;
  let elStep = dom.find('div[data-step="' + current.index + '"]', this.root);
  elStep.classList.remove('completed');
  elStep.classList.add('active');
  if (current.onClicked) {

  } else {
    kuim.navigateWidget(current.url, this.content, {
      wizard: this,
    });
  }
};

/**
 * Completes the current step.
 */
MobileWizard.prototype.commit = function (params) {
  let elStep = dom.find('div.active', this.root);
  let index = parseInt(elStep.getAttribute('data-step'));
  elStep.classList.remove('active');
  elStep.classList.add('completed');
  this.display(this.steps[index + 1]);
};

MobileWizard.prototype.rollback = function () {
  let elStep = dom.find('div.step.active', this.container);
  let index = parseInt(elStep.getAttribute('data-step'));
  elStep.classList.remove('active');
  this.display(this.steps[index - 1]);
};

function OfficialForm(opt) {

}

OfficialForm.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
};

OfficialForm.prototype.toPdf = function () {
  let html = this.container.innerHTML;
  xhr.promise({
    url: '/api/v3/common/script/misc/pdf/export',
    content: html,
  }).then(resp => {

  });
};

OfficialForm.prototype.toDocx = function () {
  let html = this.container.innerHTML;
  xhr.promise({
    url: '/api/v3/common/script/misc/docx/export',
    content: html,
  }).then(resp => {

  });
};

/**
 *
 * @param opt
 *
 * @constructor
 */
function PaginationBox(opt) {
  let self = this;
  // 数据来源链接
  if (typeof opt.url === 'object') {
    this.url = opt.url.root;
    this.urlChild = opt.url.child;
  } else {
    this.url = opt.url;
  }
  if (typeof opt.usecase === 'object') {
    this.usecase = opt.usecase.root;
    this.usecaseChild = opt.usecase.child;
  } else {
    this.usecase = opt.usecase;
  }

  // 渲染行数据为Box的函数
  this.onRender = opt.render;

  // 固定或者初始化查询参数
  this.filters = opt.params || opt.filters || {};

  // 显示喜好过滤按钮
  this.favourite = opt.favourite || false;

  this.start = opt.start || 0;

  // the default is no pagination
  this.limit = opt.limit || 5;
  this.colspan = opt.colspan;
  this.borderless = opt.borderless || false;

  if (opt.filter) {
    opt.filter.query = {callback: function(params) {
        self.go(1, params);
      }
    };
    this.widgetFilter = new QueryLayout(opt.filter);
  }

}

/**
 * Gets table element as root.
 *
 * @returns {HTMLTableElement}
 */
PaginationBox.prototype.root = function () {
  this.root = dom.element(`
    <div class="card" style="min-height: 200px;">
      <div class="card-body">
        <div class="row" style="margin-left: -5px; margin-right: -5px;"></div>
      </div>
    </div>
  `);
  this.rootBody = this.root.children[0].children[0];
  if (this.borderless == true) {
    this.root.classList.add('b-a-0', 'mb-0');
    this.root.children[0].classList.add('p-0');
  }

  return this.root;
};

/**
 * Requests and fetches remote data.
 *
 * @param params
 *        the http parameters
 */
PaginationBox.prototype.request = function (params) {
  let self = this;
  params = params || {};
  if (this.favourite) {
    let icon = dom.find('a[widget-id=toggleFavourite] i', this.container);
    if (icon.classList.contains('fas')) {
      params._favourite = 'true';
    } else {
      params._favourite = 'false';
    }
  }
  if (this.widgetFilter) {
    let queryParams = this.widgetFilter.getQuery();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }
  // static parameters
  for (let k in this.filters) {
    params[k] = this.filters[k];
  }

  params['start'] = this.start;
  params['limit'] = this.limit;

  xhr.post({
    url: this.url,
    usecase: this.usecase,
    data: params,
    success: function (resp) {
      self.total = resp.total;

      let rows = resp.data;
      if (!rows) return;
      self.rootBody.innerHTML = '';

      self.showPageNumber();
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        self.addRow(row, i);
      }
      self.addMore();
    }
  });
};

/**
 * Adds a row into table.
 *
 * @param trParent
 *        the parent <b>tr</b> dom element
 *
 * @param row
 *        the row object in data array from server side
 *
 * @param show
 *        show or hide
 *
 * @param level
 *        the tree node level
 *
 * @private
 */
PaginationBox.prototype.addRow = function (row, index) {
  let loading = '' +
      '<div class="sk-circle">\n' +
      '  <div class="sk-circle1 sk-child"></div>\n' +
      '  <div class="sk-circle2 sk-child"></div>\n' +
      '  <div class="sk-circle3 sk-child"></div>\n' +
      '  <div class="sk-circle4 sk-child"></div>\n' +
      '  <div class="sk-circle5 sk-child"></div>\n' +
      '  <div class="sk-circle6 sk-child"></div>\n' +
      '  <div class="sk-circle7 sk-child"></div>\n' +
      '  <div class="sk-circle8 sk-child"></div>\n' +
      '  <div class="sk-circle9 sk-child"></div>\n' +
      '  <div class="sk-circle10 sk-child"></div>\n' +
      '  <div class="sk-circle11 sk-child"></div>\n' +
      '  <div class="sk-circle12 sk-child"></div>\n' +
      '</div>';
  let div = dom.create('div', 'col-md-' + this.colspan);
  this.rootBody.appendChild(div);
  this.onRender(div, row, index);
};

PaginationBox.prototype.replaceRow = function (row, index) {
  if (this.rootBody.children[index]) {
    let curr = this.rootBody.children[index];
    curr.innerHTML = '';
    this.onRender(curr, row, index);
  }
};

PaginationBox.prototype.addMore = function () {
  let pagenum = this.start / this.limit + 1;
  if (pagenum == this.lastPageNumber()) return;
  let last = this.rootBody.children[this.rootBody.children.length - 1];
  if (!last) return;
  let card = dom.element(`
    <div>
      <div class="card b-a-0">
        <div class="card-body">
          <a class="btn text-secondary font-56 position-absolute" style="top: calc(50% - 45px); left: calc(50% - 41px);">
            <i class="fas fa-ellipsis-h"></i>
          </a>
        </div>
      </div>
    </div>
  `);
  dom.bind(dom.find('a', card), 'click', event => {
    this.next();
  });
  let height = last.getBoundingClientRect().height;
  card.classList.add(last.classList);
  card.children[0].children[0].style.height = (height - 15/*padding bottom*/) + 'px';
  this.rootBody.appendChild(card);
};

/**
 * 在指定页面元素下渲染树表。
 *
 * @param containerId
 *        页面元素标识
 *
 * @param params
 *        数据链接请求参数
 */
PaginationBox.prototype.render = function (containerId, params) {
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';
  this.container.appendChild(this.pagination());

  let table = this.root();
  this.container.appendChild(table);
  let top = dom.top(this.container);
  table.style.height = 'calc(100% - 20px - ' + top + 'px)';

  params = params || {};
  this.request(params);
};

/**
 * Displays pagination bar on the bottom of table.
 */
PaginationBox.prototype.pagination = function () {
  let self = this;
  let div = dom.create('div', 'full-width');
  div.style.position = 'sticky';
  div.style.top = '0';
  div.style.zIndex = 900;
  // div.style.backgroundColor = 'white';

  let ul = dom.create('ul', 'pagination', 'mb-0');
  this.firstPage = dom.create('li', 'page-item');
  let a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '首页';
  a.innerHTML = '<i class="material-icons">first_page</i>';
  dom.bind(a, 'click', function() {
    self.go(1);
  });

  this.firstPage.appendChild(a);
  ul.appendChild(this.firstPage);

  this.prevPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '上一页';
  a.innerHTML = '<i class="material-icons">chevron_left</i>';
  dom.bind(a, 'click', function() {
    self.prev();
  });
  this.prevPage.appendChild(a);
  ul.appendChild(this.prevPage);

  li = dom.create('li', 'page-item', 'disabled');
  li.style.paddingTop = '4px';
  this.pagebar = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  this.pagebar.setAttribute('href', 'javascript:void(0)');
  this.pagebar.style.cursor = 'default';

  this.pagebar.style.paddingBottom = '0px';
  this.pagebar.innerText = "0/0";
  li.appendChild(this.pagebar);
  ul.appendChild(li);

  this.nextPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '下一页';
  a.innerHTML = '<i class="material-icons">chevron_right</i>';
  dom.bind(a, 'click', function () {
    self.next();
  });
  this.nextPage.appendChild(a);
  ul.appendChild(this.nextPage);

  this.lastPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '末页';
  a.innerHTML = '<i class="material-icons">last_page</i>';
  dom.bind(a, 'click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.appendChild(a);
  ul.append(this.lastPage);

  let actions = dom.create('div', 'card-header-actions', 'pt-0', 'pr-2');

  if (this.favourite) {
    let action = dom.element('' +
        '<a widget-id="toggleFavourite" class="card-header-action text-yellow">\n' +
        '  <i class="far fa-star position-relative font-16" style="top: 4px;"></i>\n' +
        '</a>');
    actions.appendChild(action);
    dom.bind(action, 'click', function() {
      let icon = dom.find('i', action);
      if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        self.go(1, {_favourite: 'true'});
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        self.go(1, {_favourite: 'false'});
      }
    });
  }

  if (this.widgetFilter) {
    let containerQuery = dom.create('div', 'card', 'widget-query', 'fade', 'fadeIn');
    this.widgetFilter.render(containerQuery);
    this.container.appendChild(containerQuery);

    let action = dom.element('' +
      '<a widget-id="toggleFilter" class="card-header-action text-primary">\n' +
      '  <i class="fas fa-filter position-relative" style="top: 4px;"></i>\n' +
      '</a>');
    dom.bind(action, 'click', function() {
      let query = containerQuery;
      if (query.classList.contains('show')) {
        query.classList.remove('show');
      } else {
        query.classList.add('show');
      }
    });
    actions.appendChild(action);
  }

  if (this.group) {
    let action = dom.element('' +
      '<a widget-id="toggleGroup" class="card-header-action">\n' +
      '  <i class="fas fa-bars"></i>\n' +
      '</a>');
    actions.appendChild(action);
  }

  if (this.sort) {
    let action = dom.element('' +
      '<a widget-id="toggleSort" class="card-header-action">\n' +
      '  <i class="fas fa-sort-amount-down-alt position-relative" style="top: 4px; font-size: 17px;"></i>\n' +
      '</a>');
    actions.appendChild(action);
  }
  div.appendChild(actions);

  if (this.limit > 0) {
    div.appendChild(ul);
  }
  return div;
};

/**
 * Gets last page number of result.
 *
 * @returns {number} the last page number
 */
PaginationBox.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  let remain = this.total % this.limit;
  if (remain == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Turns to the previous page.
 */
PaginationBox.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
PaginationBox.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the specific number.
 *
 * @param {number} page
 *        the page number
 */
PaginationBox.prototype.go = function (page, params) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.start = this.limit * (page - 1);
  this.request(params);
};

/**
 * Shows the page number in the page bar and controls each link status.
 *
 * @private
 */
PaginationBox.prototype.showPageNumber = function () {
  let pagenum = this.start / this.limit + 1;
  let lastpagenum = this.lastPageNumber();
  let total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.innerHTML = pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录";
  this.firstPage.classList.remove('disabled');
  this.prevPage.classList.remove('disabled');
  this.nextPage.classList.remove('disabled');
  this.lastPage.classList.remove('disabled');
  if (pagenum == 1) {
    this.firstPage.classList.add('disabled');
    this.prevPage.classList.add('disabled');
  }
  if (pagenum == this.lastPageNumber()) {
    this.nextPage.classList.add('disabled');
    this.lastPage.classList.add('disabled');
  }
};

PaginationBox.skeleton = function() {
  return dom.element(`
    <div style="display: flex; flex-wrap: wrap; margin: 0px -8px; width: 100%;">
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
        </div>
      </div>
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
        </div>
      </div>
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
          </div>
      </div>
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
        </div>
      </div>
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
        </div>
      </div>
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
        </div>
      </div>
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
        </div>
      </div>
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
        </div>
      </div>
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
        </div>
      </div>
      <div style="flex-basis: 25%; margin-bottom: 24px; padding: 0px 8px;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 80px; width: 100%;">
        </div>
      </div>
    </div>
  `);
};

/**
 *
 * @param opt
 *
 * @constructor
 */
function PaginationGrid(opt) {
  let self = this;
  // 数据来源链接
  if (typeof opt.url === 'object') {
    this.url = opt.url.root;
    this.urlChild = opt.url.child;
  } else {
    this.url = opt.url;
  }
  if (typeof opt.usecase === 'object') {
    this.usecase = opt.usecase.root;
    this.usecaseChild = opt.usecase.child;
  } else {
    this.usecase = opt.usecase;
  }

  // 渲染行数据为Box的函数
  this.onRender = opt.render;

  // 固定或者初始化查询参数
  this.filters = opt.params || opt.filters || {};

  // 显示喜好过滤按钮
  this.favourite = opt.favourite || false;

  this.start = opt.start || 0;

  // the default is no pagination
  this.limit = opt.limit || 5;
  this.colspan = opt.colspan;
  this.borderless = opt.borderless || false;

  if (opt.filter) {
    opt.filter.query = {callback: function(params) {
        self.go(1, params);
      }
    };
    // this.widgetFilter = new QueryLayout(opt.filter);
    opt.filter.table = this;
    this.queryFilter = new QueryFilter(opt.filter);
  }
}

/**
 * Gets table element as root.
 *
 * @returns {HTMLTableElement}
 */
PaginationGrid.prototype.root = function () {
  let ret = dom.element(`
    <div class="card">
      <div class="card-body">
        <div class="row" style="margin-left: -5px; margin-right: -5px;"></div>
      </div>
    </div>
  `);
  this.rootBody = ret.children[0].children[0];
  if (this.borderless == true) {
    ret.classList.add('b-a-0', 'mb-0');
    ret.children[0].classList.add('p-0');
  }

  return ret;
};

/**
 * Requests and fetches remote data.
 *
 * @param params
 *        the http parameters
 */
PaginationGrid.prototype.request = function (params) {
  let self = this;
  params = params || {};
  if (this.favourite) {
    let icon = dom.find('a[widget-id=toggleFavourite] i', this.container);
    if (icon.classList.contains('fas')) {
      params._favourite = 'true';
    } else {
      params._favourite = 'false';
    }
  }
  if (this.widgetFilter) {
    let queryParams = this.widgetFilter.getQuery();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }
  if (this.queryFilter) {
    let queryParams = this.queryFilter.getValues();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }
  // static parameters
  for (let k in this.filters) {
    params[k] = this.filters[k];
  }

  params['start'] = this.start;
  params['limit'] = this.limit;

  xhr.post({
    url: this.url,
    usecase: this.usecase,
    data: params,
    success: function (resp) {
      self.total = resp.total;

      let rows = resp.data;
      if (!rows) return;
      self.rootBody.innerHTML = '';

      self.showPageNumber();
      if (rows.length == 0) {
        let tbody = self.rootBody;
        tbody.innerHTML = ('' +
          '<div class="text-center pt-4 full-width">' +
          '  <img width="48" height="48" src="/img/kui/nodata.png" class="mb-2" style="opacity: 25%;">' +
          '  <p style="opacity: 40%; color: black;">没有匹配的数据</p>' +
          '</div>');
        return;
      }
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        self.addRow(row, i);
      }
      self.addMore();
    }
  });
};

/**
 * Adds a row into table.
 *
 * @param trParent
 *        the parent <b>tr</b> dom element
 *
 * @param row
 *        the row object in data array from server side
 *
 * @param show
 *        show or hide
 *
 * @param level
 *        the tree node level
 *
 * @private
 */
PaginationGrid.prototype.addRow = function (row, index) {
  let loading = '' +
      '<div class="sk-circle">\n' +
      '  <div class="sk-circle1 sk-child"></div>\n' +
      '  <div class="sk-circle2 sk-child"></div>\n' +
      '  <div class="sk-circle3 sk-child"></div>\n' +
      '  <div class="sk-circle4 sk-child"></div>\n' +
      '  <div class="sk-circle5 sk-child"></div>\n' +
      '  <div class="sk-circle6 sk-child"></div>\n' +
      '  <div class="sk-circle7 sk-child"></div>\n' +
      '  <div class="sk-circle8 sk-child"></div>\n' +
      '  <div class="sk-circle9 sk-child"></div>\n' +
      '  <div class="sk-circle10 sk-child"></div>\n' +
      '  <div class="sk-circle11 sk-child"></div>\n' +
      '  <div class="sk-circle12 sk-child"></div>\n' +
      '</div>';
  let div = dom.create('div', 'col-md-' + this.colspan);
  this.rootBody.appendChild(div);
  this.onRender(div, row, index);
};

PaginationGrid.prototype.replaceRow = function (row, index) {
  if (this.rootBody.children[index]) {
    let curr = this.rootBody.children[index];
    curr.innerHTML = '';
    this.onRender(curr, row, index);
  }
};

PaginationGrid.prototype.addMore = function () {
  let pagenum = this.start / this.limit + 1;
  if (pagenum == this.lastPageNumber()) return;
  let last = this.rootBody.children[this.rootBody.children.length - 1];
  if (!last) return;
  let card = dom.element(`
    <div>
      <div class="card b-a-0">
        <div class="card-body">
          <a class="btn text-secondary font-56 position-absolute" style="top: calc(50% - 45px); left: calc(50% - 41px);">
            <i class="fas fa-ellipsis-h"></i>
          </a>
        </div>
      </div>
    </div>
  `);
  dom.bind(dom.find('a', card), 'click', event => {
    this.next();
  });
  let height = last.getBoundingClientRect().height;
  card.classList.add(last.classList);
  card.children[0].children[0].style.height = (height - 15/*padding bottom*/) + 'px';
  this.rootBody.appendChild(card);
};

/**
 * 在指定页面元素下渲染树表。
 *
 * @param containerId
 *        页面元素标识
 *
 * @param params
 *        数据链接请求参数
 */
PaginationGrid.prototype.render = function (containerId, params) {
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';

  let table = this.root();
  this.container.appendChild(this.actionbar());
  this.container.appendChild(table);
  this.container.appendChild(this.pagination());
  let top = dom.top(this.container);
  table.style.height = 'calc(100% - 20px - ' + top + 'px)';

  params = params || {};
  this.request(params);
};

PaginationGrid.prototype.actionbar = function() {
  let self = this;
  let top = $('<div class="full-width d-flex overflow-hidden" style="height: 26px;"></div>');

  if (this.queryFilter) {
    top.append(this.queryFilter.getRoot());
  } else {
    top.append(dom.element('<div class="full-width"></div>'));
    // div.removeClass('d-flex');
  }

  let actions = top.get(0); // dom.create('div', 'card-header-actions', 'pt-0', 'pr-2');

  if (this.favourite) {
    let action = dom.element('' +
      '<a widget-id="toggleFavourite" class="card-header-action text-yellow">\n' +
      '  <i class="far fa-star position-relative font-16" style="top: 4px;"></i>\n' +
      '</a>');
    actions.appendChild(action);
    dom.bind(action, 'click', function() {
      let icon = dom.find('i', action);
      if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        self.go(1, {_favourite: 'true'});
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        self.go(1, {_favourite: 'false'});
      }
    });
  }

  if (this.widgetFilter) {
    let containerQuery = dom.create('div', 'card', 'widget-query', 'fade', 'fadeIn');
    this.widgetFilter.render(containerQuery);
    this.container.appendChild(containerQuery);

    let action = dom.element('' +
      '<a widget-id="toggleFilter" class="card-header-action text-primary">\n' +
      '  <i class="fas fa-filter position-relative" style="top: 4px;"></i>\n' +
      '</a>');
    dom.bind(action, 'click', function() {
      let query = containerQuery;
      if (query.classList.contains('show')) {
        query.classList.remove('show');
      } else {
        query.classList.add('show');
      }
    });
    // WARNING: REPLACE BY QUERY FILTER
    // actions.appendChild(action);

  }

  if (this.group) {
    let action = dom.element('' +
      '<a widget-id="toggleGroup" class="card-header-action">\n' +
      '  <i class="fas fa-bars"></i>\n' +
      '</a>');
    actions.appendChild(action);
  }

  if (this.sort) {
    let action = dom.element('' +
      '<a widget-id="toggleSort" class="card-header-action">\n' +
      '  <i class="fas fa-sort-amount-down-alt position-relative" style="top: 4px; font-size: 17px;"></i>\n' +
      '</a>');
    actions.appendChild(action);
  }

  let action = dom.element('' +
    '<a widget-id="toggleFilter" class="card-header-action text-primary ml-2">\n' +
    '  <i class="fas fa-sync-alt position-relative" style="top: 3px;"></i>\n' +
    '</a>');
  dom.bind(action, 'click', function () {
    self.request();
  });
  actions.appendChild(action);

  return top.get(0);
};

/**
 * Displays pagination bar on the bottom of table.
 */
PaginationGrid.prototype.pagination = function () {
  let self = this;
  let bottom = dom.create('div', 'full-width', 'd-flex');
  // bottom.style.position = 'sticky';
  bottom.style.top = '0';
  bottom.style.overflow = 'hidden';
  bottom.style.zIndex = 900;
  // div.style.backgroundColor = 'white';

  let ul = dom.create('ul', 'pagination', 'mb-0');
  ul.style.marginLeft = 'auto';
  this.firstPage = dom.create('li', 'page-item');
  let a = dom.create('a', 'page-link', 'b-a-0', 'pt-0', 'font-14');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  a.style.lineHeight = '32px';
  a.style.height = '32px';
  // a.innerText = '首页';
  a.innerHTML = '<i class="material-icons">first_page</i>';
  dom.bind(a, 'click', function() {
    self.go(1);
  });

  this.firstPage.appendChild(a);
  ul.appendChild(this.firstPage);

  this.prevPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0', 'font-14');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  a.style.lineHeight = '32px';
  a.style.height = '32px';
  // a.innerText = '上一页';
  a.innerHTML = '<i class="material-icons">chevron_left</i>';
  dom.bind(a, 'click', function() {
    self.prev();
  });
  this.prevPage.appendChild(a);
  ul.appendChild(this.prevPage);

  li = dom.create('li', 'page-item', 'disabled');
  li.style.paddingTop = '4px';
  this.pagebar = dom.create('a', 'page-link', 'b-a-0', 'pt-0', 'font-14');
  this.pagebar.setAttribute('href', 'javascript:void(0)');
  this.pagebar.style.cursor = 'default';

  this.pagebar.style.paddingBottom = '0px';
  this.pagebar.innerText = "0/0";
  li.appendChild(this.pagebar);
  ul.appendChild(li);

  this.nextPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0', 'font-14');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  a.style.lineHeight = '32px';
  a.style.height = '32px';
  // a.innerText = '下一页';
  a.innerHTML = '<i class="material-icons">chevron_right</i>';
  dom.bind(a, 'click', function () {
    self.next();
  });
  this.nextPage.appendChild(a);
  ul.appendChild(this.nextPage);

  this.lastPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0', 'font-14');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  a.style.lineHeight = '32px';
  a.style.height = '32px';
  // a.innerText = '末页';
  a.innerHTML = '<i class="material-icons">last_page</i>';
  dom.bind(a, 'click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.appendChild(a);
  ul.append(this.lastPage);

  if (this.limit > 0) {
    bottom.appendChild(ul);
  }
  return bottom;
};

/**
 * Gets last page number of result.
 *
 * @returns {number} the last page number
 */
PaginationGrid.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  let remain = this.total % this.limit;
  if (remain == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Turns to the previous page.
 */
PaginationGrid.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
PaginationGrid.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the specific number.
 *
 * @param {number} page
 *        the page number
 */
PaginationGrid.prototype.go = function (page, params) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.start = this.limit * (page - 1);
  this.request(params);
};

/**
 * Shows the page number in the page bar and controls each link status.
 *
 * @private
 */
PaginationGrid.prototype.showPageNumber = function () {
  let pagenum = this.start / this.limit + 1;
  let lastpagenum = this.lastPageNumber();
  let total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.innerHTML = pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录";
  this.firstPage.classList.remove('disabled');
  this.prevPage.classList.remove('disabled');
  this.nextPage.classList.remove('disabled');
  this.lastPage.classList.remove('disabled');
  if (pagenum == 1) {
    this.firstPage.classList.add('disabled');
    this.prevPage.classList.add('disabled');
  }
  if (pagenum == this.lastPageNumber()) {
    this.nextPage.classList.add('disabled');
    this.lastPage.classList.add('disabled');
  }
};
/**
 * 分页表格显示组件。
 * <p>
 * 配置项包括:
 * <ul>
 *   <li>url: 数据源的提供链接</li>
 *   <li>local: 本地数据源，类型为对象数组</li>
 *   <li>limit: 单页显示数量，默认为15</li>
 *   <li>params: 固定的请求参数，类型为对象</li>
 *   <li>usecase: 用例名称，appbase框架的特殊参数</li>
 * </ul>
 *
 * @param {object} opts
 *        配置型
 */
function PaginationTable(opts) {
  let self = this;
  // 远程数据源
  this.url = opts.url;
  // 用例
  this.usecase = opts.usecase;
  this.refreshable = opts.refreshable !== false;
  if (typeof opts.resultFilters !== "undefined") {
    this.resultFilters=opts.resultFilters;
  }
  // 本地数据源，未封装的数据源
  this.local = opts.local;
  if (typeof opts.local !== "undefined") {
    this.local = {};
    this.local.total = opts.local.length;
    this.local.data = opts.local;
  }

  this.limit = opts.limit || 15;

  this.cache = opts.cache || "server";
  this.style = opts.style || "full";

  this.headless = opts.headless || false;
  if (typeof opts.hoverable !== 'undefined') {
    this.hoverable = opts.hoverable;
  } else {
    this.hoverable = true;
  }

  // 固定或者初始化查询条件
  this.filters = {};
  if (opts.filters) {
    for (let k in opts.filters) {
      this.filters[k] = opts.filters[k];
    }
  }
  if (opts.params) {
    for (let k in opts.params) {
      this.filters[k] = opts.params[k];
    }
  }

  this.showLoading = opts.showLoading || false;

  // 高度和宽度，用来固定表头和列的参数
  this.width = opts.width;
  this.height = opts.height;
  this.tbodyHeight = opts.tbodyHeight;

  this.queryId = opts.queryId || null;
  this.boundedQuery = opts.boundedQuery || null;
  
  /*!
  ** 报表需要小计、合计功能
  */
  this.groupField = opts.groupField;
  this.totalFields = opts.totalFields || [];

  //是否只显示获取的数据长度对应的表格行数
  this.showDataRowLength = opts.showDataRowLength || false;
  this.containerId = opts.containerId;

  if (typeof opts.useCookie === "undefined") {
    this.useCookie = false;
  } else {
    this.useCookie = opts.useCookie;
  }
  this.afterLoad = opts.afterLoad || function (obj) {};
  /**
   * [{ title: "", children: [], template: "<a href='${where}'>${displayName}</a>", params: {where: "", displayName:
   * "default"} rowspan: 1 }]
   */
  this.columns = opts.columns || []; //所有一级列数量
  this.allcolumns = 0; //所有的列数量（包含了嵌套列)）
  this.columnMatrix = [];
  let max = 0;
  for (let i = 0; i < this.columns.length; ++i) {
    let col = this.columns[i];
    max = Math.max(max, (col.rowspan || 1));
    if (typeof col.colspan != "undefined") {
      this.allcolumns += col.colspan;
    } else {
      this.allcolumns++;
    }
  }
  this.mappingColumns = [];
  this.headRowCount = max;
  this.start = 0;
  this.rollbackStart = 0;
  this.total = 0;
  this.table = null;
  this.result = null;
  // 是否显示顶端的查询
  this.showTop = opts.showTop !== false;
  for (let i = 0; i < max; ++i) {
    this.columnMatrix.push([]);
  }
  this.buildMatrix(this.columns, 0);
  this.buildMappingColumns(this.columns);

  /*
  ** 改版后的功能按钮（传统模式，FIXME: 暂时兼容）
  **
  ** 重新升级 20240201
  */
  if (opts.filter) {
    opts.filter.query = {
      callback: function(params) {
        self.go(1, params);
      }
    };
    this.widgetFilter = new QueryLayout(opts.filter);
    this.optsFilter = opts.filter;
  }
  //
  // 最新的查询条件输入
  //
  if (opts.filter2) {
    this.optsFilter2 = opts.filter2;
  }
  //新增额外的excess
  if(opts.excess){
    this.widgetExcess=opts.excess;
  }
  if (opts.sort) {
    opts.sort.local = opts.sort.fields;
    opts.sort.create = function(idx, row) {
      let ret = dom.element(`
        <div class="full-width" style="margin-top: -8px; margin-bottom: -8px">
          <span class="position-relative" style="top: 8px;">${row.title}</span>
          <a data-role="desc" class="btn text-gray float-right" data-model-name="${row.name}">
            <i class="fas fa-sort-amount-up"></i>
          </a>
          <a data-role="asc" class="btn text-gray float-right" data-model-name="${row.name}">
            <i class="fas fa-sort-amount-down-alt"></i>
          </a>
        </div>
      `);
      dom.bind(dom.find('a[data-role=asc]', ret), 'click', function() {
        let model = dom.model(this);
        self.request({
          _order_by: model.name + ' asc'
        });
      });
      dom.bind(dom.find('a[data-role=desc]', ret), 'click', function() {
        let model = dom.model(this);
        self.request({
          _order_by: model.name + ' desc'
        });
      });
      return ret;
    };
    this.widgetSort = new ListView(opts.sort);
  }
  this.group = opts.group;
};

/**
 * Turns to the previous page.
 */
PaginationTable.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
PaginationTable.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the given page.
 * 
 * @param {integer}
 *            page - the page number
 */
PaginationTable.prototype.go = function (page, criteria) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.rollbackStart = this.start;
  this.start = this.limit * (page - 1);
  // this.disablePaging();
  this.request(criteria);
};

/**
 * Renders the table in the web brower.
 * 
 * @param {string}
 *            containerId - the container id in the dom.
 */
PaginationTable.prototype.render = function (containerId, params) {
  if (typeof this.containerId === 'undefined') this.containerId = containerId;
  if (this.queryId != null) {
    this.boundedQuery = $('#' + this.queryId);
  }

  if (typeof this.containerId === 'string') {
    if (this.containerId.indexOf('#') == 0) {
      this.container = document.querySelector(this.containerId);
    } else {
      this.container = document.getElementById(this.containerId);
    }
  } else {
    this.container = containerId;
  }
  $(this.container).empty();  //tableTopActions
  if (this.refreshable !== false) {
    $(this.container).append(this.tableTopActions(params));
  }
  if(this.widgetExcess){
    $(this.container).append(this.widgetExcess.template);
  }
  $(this.container).append(this.root(params));
  if (this.limit != -1) {
    $(this.container).append(this.pagination());
  }
  if (typeof params === "undefined" || params == '' || params == '{}') {
    this.go(1);
    this.afterRequest();
  } else if (typeof params === 'object') {
    for (let k in params) {
      this.addFilter(k, params[k]);
    }
    this.request({});
  } else {
    let ps = $.parseJSON(params);
    this.request(ps);
    this.afterRequest();
  }
};

/**
 * 请求之前的加载动画显示。
 */
PaginationTable.prototype.beforeRequest = function () {
  let loading = '' +
      '<div class="sk-circle">\n' +
      '  <div class="sk-circle1 sk-child"></div>\n' +
      '  <div class="sk-circle2 sk-child"></div>\n' +
      '  <div class="sk-circle3 sk-child"></div>\n' +
      '  <div class="sk-circle4 sk-child"></div>\n' +
      '  <div class="sk-circle5 sk-child"></div>\n' +
      '  <div class="sk-circle6 sk-child"></div>\n' +
      '  <div class="sk-circle7 sk-child"></div>\n' +
      '  <div class="sk-circle8 sk-child"></div>\n' +
      '  <div class="sk-circle9 sk-child"></div>\n' +
      '  <div class="sk-circle10 sk-child"></div>\n' +
      '  <div class="sk-circle11 sk-child"></div>\n' +
      '  <div class="sk-circle12 sk-child"></div>\n' +
      '</div>'

  if (this.showLoading) {
    $(this.table.find('tbody')).empty();
    $(this.table.find('tbody')).append($("<tr></tr>").append($("<td style='text-align:center'></td>").attr("colspan", this.allcolumns).html(loading)));
  }
};

PaginationTable.prototype.afterRequest = function () {

};

PaginationTable.prototype.requestError = function () {
  this.table.find("div.loaddingct").html('<h6 style="color:#dc3545">数据加载出错，请联系管理员解决...</h6>');
};

/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
PaginationTable.prototype.root = function (initParams) {
  if (typeof initParams === "undefined") {
    initParams = {};
  }
  let ret = $('<div class="full-width">');
  ret.css('overflow-y', 'auto');
  this.table = $("<table></table>");
  if (typeof this.width !== 'undefined') this.table.css('width', this.width);
  if (typeof this.height !== 'undefined') ret.css('height', this.height);
  // if (!this.frozenHeader) this.table.addClass('table');
  // this.table.addClass("table table-bordered table-striped");
  this.table.addClass("table table-responsive-sm table-outline mb-0");
  if (this.hoverable) {
    this.table.addClass('table-hover');
  }
  this.table.css('overflow', 'hidden');

  let self = this;
  let thead = $('<thead class="thead-light" style="height: 43px;"></thead>');
  for (let i = 0; i < this.columnMatrix.length; ++i) {
    let tr = $("<tr></tr>");
    for (let j = 0; j < this.columnMatrix[i].length; ++j) {
      let col = this.columnMatrix[i][j];
      let th = $('<th style="vertical-align: middle;z-index:900;"></th>');
      // 冻结列
      if (j < this.frozenColumnCount) th.addClass('headcol');
      let span = $("<span class='pull-right fa fa-arrows-v'></span>");
      span.css("opacity", "0.3");
      span.css('margin-top', '2px');
      span.addClass('fa');
      span.on("click", function (evt) {
        let sorting = "asc";
        let span = $(evt.target);
        if (span.hasClass("fa-arrows-v")) {
          span.removeClass("fa-arrows-v");
          span.addClass("fa-sort-amount-asc");
          span.css("opacity", "0.6");
          sorting = "asc";
        } else if (span.hasClass("fa-sort-amount-asc")) {
          span.removeClass("fa-sort-amount-asc");
          span.addClass("fa-sort-amount-desc");
          sorting = "desc";
        } else if (span.hasClass("fa-sort-amount-desc")) {
          span.removeClass("fa-sort-amount-desc");
          span.addClass("fa-sort-amount-asc");
          sorting = "asc";
        }
        // 其余的重置
        if (!span.hasClass("fa-arrows-v")) {
          self.table.find("th span").each(function (idx, elm) {
            if (span.attr("data-order") == $(elm).attr("data-order")) return;
            $(elm).removeClass("fa-sort-amount-asc");
            $(elm).removeClass("fa-sort-amount-desc");
            $(elm).addClass("fa-arrows-v");
            $(elm).css("opacity", "0.3");
          });
        }
        // 请求数据
        self.filters["orderBy"] = span.attr("data-order");
        self.filters["sorting"] = sorting;
        self.request();
      });
      th.attr('rowspan', col.rowspan || 1);
      th.attr('colspan', col.colspan || 1);
      // style
      // th.attr('style', col.style || "");
      // 如果设置了列宽
      if (typeof col.width !== 'undefined') th.css('width', col.width);
      // 当需要冻结表头
      if (this.frozenHeader == true) {
        thead.css('float', 'left');
        th.css('float', 'left');
      }
      // 默认居中
      if (col.style) {
        th.style = th.style || '';
        th.attr('style', th.style + '; vertical-align:middle;' + col.style);
      } else {
        th.css('text-align', 'center');
        th.css('vertical-align', 'middle');
      }
      if (typeof col.headerClick === "undefined") {
        //th.text(col.title);
        th.append(col.title);
      } else {
        let a = $('<a>');
        a.on('click', col.headerClick);
        th.append(a);
        a.css("cursor", "default");
        a.text(col.title);
      }
      // 如果定义了data-order属性，则添加
      if (typeof col.order !== "undefined") {
        span.attr("data-order", col.order);
        // 根据初始化的过滤条件中，显示图标
        if (col.order === initParams["orderBy"]) {
          span.removeClass("fa sort");
          if (initParams["sorting"] === "asc") {
            // span.addClass("glyphicon-sort-by-attributes");
            span.addClass('fa fa-sort-amount-asc')
          } else {
            // span.addClass("glyphicon-sort-by-attributes-alt");
            span.addClass('fa fa-sort-amount-desc')
          }
        }
        th.append(span);
      }
      tr.append(th);
    }
    thead.append(tr);
  }
  if (!this.headless)
    this.table.append(thead);
  // 添加个空的表体
  this.table.append('<tbody></tbody>');
  ret.append(this.table);
  return ret;
};


/**
 * Builds pagination bar for table.
 * 
 * @return {object} a pagination bar, the jquery div.
 */
PaginationTable.prototype.pagination = function () {
  let self = this;
  let div = $('<div class="table-pagination d-flex"></div>');
  let ul = $('<ul class="pagination mb-0 mt-2 ml-auto"></ul>');
  // ul.addClass('pagination mb-0');
  this.firstPage = $('<li class="page-item"></li>');
  let a = $('<a class="page-link b-a-0 pt-0 font-14" style="top: 4px;"></a>');
  a.attr('href', 'javascript:void(0)');
  // a.text('首页');
  a.html('<i class="material-icons">first_page</i>');
  a.on('click', function () {
    self.go(1);
  });
  this.firstPage.append(a);

  if (this.style === 'full') {
    ul.append(this.firstPage);
  }

  this.prevPage = $('<li class="page-item"></li>');
  a = $('<a class="page-link b-a-0 pt-0 font-14" style="top: 4px;"></a>');
  a.attr('href', 'javascript:void(0)');
  // a.text('上一页');
  a.html('<i class="material-icons">chevron_left</i>');
  a.on('click', function () {
    self.prev();
  });
  this.prevPage.append(a);
  ul.append(this.prevPage);

  li = $('<li class="page-item disabled"></li>');
  li.addClass('disabled');
  this.pagebar = $('<a class="page-link b-a-0 pt-1 font-14" style="height: 30px; line-height: 30px"></a>');
  this.pagebar.attr('href', 'javascript:void(0)');
  this.pagebar.attr('style', 'cursor: default');
  this.pagebar.text("0/0");
  li.append(this.pagebar);
  ul.append(li);

  this.nextPage = $('<li class="page-item"></li>');
  a = $('<a class="page-link b-a-0 pt-0 font-14" style="top: 4px;"></a>');
  a.attr('href', 'javascript:void(0)');
  // a.text('下一页');
  a.html('<i class="material-icons">chevron_right</i>');
  a.on('click', function () {
    self.next();
  });
  this.nextPage.append(a);
  ul.append(this.nextPage);

  this.lastPage = $('<li class="page-item"></li>');
  a = $('<a class="page-link b-a-0 pt-0 font-14" style="top: 4px;"></a>');
  a.attr('href', 'javascript:void(0)');
  // a.text('末页');
  a.html('<i class="material-icons">last_page</i>');
  a.on('click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.append(a);
  if (this.style === 'full') {
    ul.append(this.lastPage);
  }

  li = $('<li class="page-item disabled"></li>');
  a = $('<a class="page-link b-a-0 pt-0"></a>');
  a.attr('style', 'cursor: default');
  if (this.limit < 0) {
    ul.empty();
  }else{
    ul.css('height', '34.75px');
  }
  div.get(0).appendChild(ul.get(0));
  return div;
};
//表格过滤搜索
PaginationTable.prototype.tableTopActions = function () {
  if (this.showTop === false) return;
  let self = this;
  let div = $('<div class="full-width d-flex overflow-hidden" style="height: 26px;"></div>');

  // 测试
  if (this.optsFilter2) {
    let optQueryFilter = {};
    utils.clone(this.optsFilter2, optQueryFilter);
    optQueryFilter.table = this;
    this.queryFilter = new QueryFilter(optQueryFilter);
    div.append(this.queryFilter.getRoot());
  } else {
    div.append(dom.element('<div class="full-width"></div>'));
    // div.removeClass('d-flex');
  }

  let actions = div.get(0); // dom.create('div', 'card-header-actions', 'pt-0', 'pr-2');

  if (this.group) {
    let action = dom.element('' +
        '<a widget-id="toggleGroup" class="card-header-action text-primary ml-2">\n' +
        '  <i class="fas fa-bars"></i>\n' +
        '</a>');
    actions.appendChild(action);
  }

  if (this.widgetSort) {
    let containerSort = dom.create('div', 'card', 'widget-sort', 'fade', 'fadeIn');
    containerSort.zIndex = 9999;
    this.widgetSort.render(containerSort);
    this.container.appendChild(containerSort);

    let action = dom.element('' +
        '<a widget-id="toggleSort" class="card-header-action text-primary ml-2">\n' +
        '  <i class="fas fa-sort-amount-down-alt position-relative" style="top: 4px; font-size: 17px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function() {
      if (containerSort.classList.contains('show')) {
        containerSort.classList.remove('show');
      } else {
        containerSort.classList.add('show');
      }
    });
    actions.appendChild(action);
  }

  if (this.widgetFilter) {
    // let containerQuery = dom.create('div', 'card', 'widget-query', 'fade', 'fadeIn');
    let containerQuery = dom.create('div', 'card', 'widget-query');
    this.widgetFilter.render(containerQuery);
    this.container.appendChild(containerQuery);

    let action = dom.element('' +
        '<a widget-id="toggleFilter" class="card-header-action text-primary">\n' +
        '  <i class="fas fa-filter position-relative" style="top: 4px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function() {
      let query = containerQuery;
      if (query.classList.contains('show')) {
        query.classList.remove('show');
      } else {
        query.classList.add('show');
      }
    });
    actions.appendChild(action);
  }
  if (this.refreshable) {
    let action = dom.element('' +
        '<a widget-id="toggleFilter" class="card-header-action text-primary ml-2">\n' +
        '  <i class="fas fa-sync-alt position-relative" style="top: 4px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function () {
      self.request();
    });
    actions.appendChild(action);
  }
  // div.get(0).appendChild(actions);

  // if (this.limit < 0) {
  //   ul.empty();
  //   if (this.widgetFilter)
  //     ul.css('height', '34.75px');
  // }
  // div.get(0).appendChild(ul.get(0));
  return div;
}
/**
 * Shows the page number in the page bar and controls each link status.
 * 
 * @private
 */
PaginationTable.prototype.showPageNumber = function () {
  let pagenum = this.start / this.limit + 1;
  let lastpagenum = this.lastPageNumber(),
    total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.html(pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录");
  if (total == 0 || this.lastPageNumber() == 1) {
    this.firstPage.addClass('disabled');
    this.prevPage.addClass('disabled');
    this.nextPage.addClass('disabled');
    this.lastPage.addClass('disabled');
    return;
  }
  if (pagenum == 1) {
    this.firstPage.addClass('disabled');
    this.prevPage.addClass('disabled');
    this.nextPage.removeClass('disabled');
    this.lastPage.removeClass('disabled');
  } else if (pagenum == this.lastPageNumber()) {
    this.nextPage.addClass('disabled');
    this.lastPage.addClass('disabled');
    this.firstPage.removeClass('disabled');
    this.prevPage.removeClass('disabled');
  } else {
    this.firstPage.removeClass('disabled');
    this.prevPage.removeClass('disabled');
    this.nextPage.removeClass('disabled');
    this.lastPage.removeClass('disabled');
  }
};

/**
 * 禁用逐个分页按钮。
 *
 * @private
 */
PaginationTable.prototype.disablePaging = function () {
  if (this.limit <= 0) {
    return;
  }
  this.firstPage.removeClass();
  this.prevPage.removeClass();
  this.nextPage.removeClass();
  this.lastPage.removeClass();
  this.firstPage.addClass('disabled');
  this.prevPage.addClass('disabled');
  this.nextPage.addClass('disabled');
  this.lastPage.addClass('disabled');
};

/**
 * Gets the last page number.
 * 
 * @return the last page number
 */
PaginationTable.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  let residue = this.total % this.limit;
  if (residue == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Gets the max col span for the given column.
 * 
 * @param {object}
 *            column - the column object
 * 
 * @private
 */
PaginationTable.prototype.maxColSpan = function (column) {
  let ret = 1;
  let max = 0;
  for (let i = 0; column.children && i < column.children.length; ++i) {
    max = Math.max(max, this.maxColSpan(column.children[i]));
  }
  ret += max;
  return ret;
};

/**
 * Clears all data rows.
 * 
 * @private
 */
PaginationTable.prototype.clear = function () {
  // this.table.find("thead").remove(); // 如果手动添加了表格头部
  $(this.table.find('tbody')).empty();
};

/**
 * Builds the direct columns which are used to map values with result.
 * 
 * @param {array}
 *            columns - the columns
 * 
 * @private
 */
PaginationTable.prototype.buildMappingColumns = function (columns) {
  for (let i = 0; i < columns.length; i++) {
    let col = columns[i];
    if (!col.children || col.children.length == 0) {
      this.mappingColumns.push(col);
    } else {
      this.buildMappingColumns(col.children);
    }
  }
};

/**
 * Builds column matrix.
 * 
 * @param {object}
 *            parent - the parent column
 * 
 * @param {integer}
 *            index - the matrix row index
 * 
 * @private
 */
PaginationTable.prototype.buildMatrix = function (columns, index) {
  if (!columns)
    return;
  let currentIndex = index;

  // add column children
  for (let i = 0; i < columns.length; ++i) {
    let col = columns[i];
    if (col.children && col.children.length > 0) {
      col.colspan = col.colspan || 1;
      this.buildMatrix(col.children, index + 1);
    }
    this.columnMatrix[currentIndex].push(col);
  }
};

/**
 * 向服务器发起请求获取数据。
 *
 * @public
 */
PaginationTable.prototype.request = function (others) {
  let self = this;
  let params = {};
  if (self.boundedQuery != null) {
    let ft = self.boundedQuery.formdata();
    for (let k in ft) {
      this.filters[k] = ft[k];
    }
  }
  params = params || {};

  // the parameters from query for this table
  if (this.widgetFilter) {
    let queryParams = this.widgetFilter.getQuery();
    for (let k in queryParams) {
      if (params[k] && params) {
        if (k.indexOf('_') == 0) {
          params[k] += ' ' + queryParams[k];
        } else {
          params[k] = queryParams[k];
        }
      } else {
        params[k] = queryParams[k];
      }
    }
  }
  if (this.queryFilter) {
    let queryParams = this.queryFilter.getValues();
    for (let k in queryParams) {
      if (params[k]) {
        if (k.indexOf('_') == 0) {
          params[k] += ' ' + queryParams[k];
        } else {
          params[k] = queryParams[k];
        }
      } else {
        params[k] = queryParams[k];
      }
    }
  }
  // the parameters defined in table options
  for (let k in this.filters) {
    if (params[k]) {
      if (k.indexOf('_') == 0) {
        params[k] += ' ' + this.filters[k];
      } else {
        params[k] = this.filters[k];
      }
    } else {
      params[k] = this.filters[k];
    }
  }

  // the parameters of method arguemnts
  if (typeof others !== "undefined") {
    for (let k in others) {
      if (k == "start") {
        this.start = parseInt(others[k])
      } else if (k == "limit") {
        this.limit = parseInt(others[k]);
      } else {
        if (params[k]) {
          // params[k] += ' ' + others[k];
          params[k] = others[k];
        } else {
          params[k] = others[k];
        }
      }
    }
  }
  params['start'] = this.start;
  params['limit'] = this.limit;

  // params['criteria'] = JSON.stringify(this.filters);
  // this.setCookie();
  if (typeof this.url !== "undefined") {
    this.beforeRequest();
    xhr.post({
      url: this.url,
      usecase: this.usecase,
      data: params,
      success: function (resp) {
        let result;
        if (typeof resp === "string") {
          result = $.parseJSON(resp);
        } else {
          result = resp;
        }
        if (!result.total) {
          result.total = 0;
          result.data = [];
        }
        if(self.resultFilters){
          result=self.resultFilters(result);
        }
        self.total = result.total;
        self.fill(result);
        self.showPageNumber();
        self.afterLoad(result);
      },
      error: function (resp) {
        self.start = self.rollbackStart;
        self.showPageNumber();
        self.requestError();
      }
    });
    return;
  }
  this.loadLocal();
};

/**
 * 加载本地数据分页显示。
 */
PaginationTable.prototype.loadLocal = function () {
  if (!this.local) {
    this.local = {
      total: 0,
      data: [],
    }
  }
  this.total = this.local.total;
  let result = {};
  result.total = this.local.total;
  result.data = [];
  if (this.limit != -1) {
    for (let i = this.start; i < (this.start + this.limit) && i < this.local.total; i++) {
      result.data.push(this.local.data[i] == null ? "&nbsp;" : this.local.data[i]);
    }
  } else {
    result = this.local;
  }
  this.fill(result);
  this.showPageNumber();
  this.afterLoad(result);
};

PaginationTable.prototype.addFilter = function (name, value) {
  this.filters[name] = value;
};

PaginationTable.prototype.clearFilters = function () {
  this.filters = {};
};

PaginationTable.prototype.replace = function (str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 * 
 * @version 3.0.0 - 增加表格的小计合计功能
 */
PaginationTable.prototype.fill = function (result) {
  this.clear();
  let self = this;

  function incrementTotalOrSubtotalColumns(totalRow, subtotalRow, rawRow) {
    for (let i = 0; i < self.totalFields.length; i++) {
      let rc = self.totalFields[i];
      let value = parseFloat(rawRow[rc]);
      if (isNaN(value)) {
        value = 0;
      }
      
      let totalValue = parseFloat(totalRow[rc]);
      if (isNaN(totalValue)) {
        totalValue = 0;
      }
      totalValue += value;
      totalRow[rc] = totalValue;
      
      if (subtotalRow) {
        let subtotalValue = parseFloat(subtotalRow[rc]);
        if (isNaN(subtotalValue)) {
          subtotalValue = 0;
        }
        subtotalValue += value;
        subtotalRow[rc] = subtotalValue;
      }
    }
  }
  
  //
  // 如果需要统计功能，则需要出现小计、合计列
  //
  let resultNew = {
    total: result.total,
    data: []
  };
  let previousGroupValue = null;
  let totalRow = {};
  let subtotalRow = {};
  for (let i = 0; i < result.data.length; i++) {
    if (this.totalFields.length == 0) {
      resultNew.data.push(result.data[i]);
      continue;
    }
    // 计算小计、合计
    let row = result.data[i];
    let groupValue = row[this.groupField];
    if (previousGroupValue == null) {
      previousGroupValue = groupValue;
    }
    if (groupValue != previousGroupValue) {
      previousGroupValue = groupValue;
      subtotalRow[this.mappingColumns[0].title] = '小计';
      
      resultNew.data.push(subtotalRow);
      resultNew.data.push(result.data[i]);
      
      subtotalRow = {};
      subtotalRow[this.mappingColumns[0].title] = '小计';
    } else {
      resultNew.data.push(result.data[i]);
    }
    incrementTotalOrSubtotalColumns(totalRow, subtotalRow, row);
  }
  // 判断小计行是否有值
  if (this.totalFields.length > 0) {
    subtotalRow[this.mappingColumns[0].title] = "小计";
    resultNew.data.push(subtotalRow);
  }
  if (this.totalFields.length > 0) {
    totalRow[this.mappingColumns[0].title] = "合计";
    resultNew.data.push(totalRow);
  }
  
  let mappingColumns = this.mappingColumns;
  if (resultNew.data && resultNew.data[0]) {
    let limit = this.limit;
    limit = limit < 0 ? resultNew.data.length : limit;
    let tbody = $(this.table.find('tbody'));
    if (typeof this.tbodyHeight !== 'undefined') {
      tbody.css('height', this.tbodyHeight);
      tbody.css('overflow-y', 'auto');
    }
    for (let i = 0; i < limit; ++i) {
      if (i < resultNew.data.length) {
        let row = resultNew.data[i];
        this.appendRow(row, i);
      } // if (i < result.data.length)  
    }
  } else {
    let tbody = $(this.table.find('tbody'));
    if (tbody) {
      tbody.append('' +
        '<tr class="no-hover">' +
        '  <td colspan="100" class="text-center pt-4">' +
        '    <img width="48" height="48" src="/img/kui/nodata.png" class="mb-2" style="opacity: 25%;">' +
        '    <p style="opacity: 40%; color: black;">没有匹配的数据</p>' +
        '  </td>' +
        '</tr>');
    } else {
      this.table.append('' +
        '<tr class="no-hover">' +
        '  <td colspan="100" class="text-center pt-4">' +
        '    <img width="48" height="48" src="/img/kui/nodata.png" class="mb-2" style="opacity: 25%;">' +
        '    <p style="opacity: 40%; color: black;">没有匹配的数据</p>' +
        '  </td>' +
        '</tr>');
    }
  }
};

PaginationTable.prototype.appendRow = function (row, rowIndex) {
  let tbody = $(this.table.find('tbody'));
  let nodata = dom.find('tr.no-hover', tbody.get(0));
  if (nodata != null) {
    nodata.remove();
  }
  let tr = $("<tr></tr>");
  dom.model(tr.get(0), row);
  tr.css('height', this.columnHeight);
  for (let j = 0; j < this.mappingColumns.length; ++j) {
    let col = this.mappingColumns[j];
    let td = $("<td></td>");
    // 冻结列
    if (j < this.frozenColumnCount) td.addClass('headcol');
    if (col.style) {
      td.attr("style", col.style);
    } else {
      td.attr("style", "text-align: center; vertical-align:middle;");
    }
    if (typeof col.width !== 'undefined') td.css('width', col.width);
    if (this.frozenHeader === true) {
      tbody.css('float', 'left');
      td.css('float', 'left');
    }
    if (col.template) {
      let html = col.template.toString();
      for (let k in row) {
        row[k] = row[k] == null ? "-" : row[k];
        html = this.replace(html, "\\{" + k + "\\}", row[k]);
      }
      if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
        html = '-';
      }
      td.html(html);
    }
    if (col.display) {
      col.display(row, td.get(0), j, (typeof(rowIndex) === 'undefined' ? -1 : rowIndex), this.start);
    }
    tr.append(td);
  }
  tbody.append(tr);
};

PaginationTable.prototype.appendOrReplaceRow = function (row, rowIndex) {
  let tbody = dom.find('tbody', this.container);
  let nodata = dom.find('tr.no-hover', tbody);
  if (nodata != null) {
    nodata.remove();
  }
  let tr = dom.create('tr');
  dom.model(tr, row);
  tr.style.height = this.columnHeight;
  for (let j = 0; j < this.mappingColumns.length; ++j) {
    let col = this.mappingColumns[j];
    let td = dom.create('td');
    // 冻结列
    if (j < this.frozenColumnCount) td.classList.add('headcol');
    if (col.style) {
      td.style = col.style;
    } else {
      td.style = "text-align: center; vertical-align:middle;";
    }
    if (typeof col.width !== 'undefined') td.css('width', col.width);
    if (col.template) {
      let html = col.template.toString();
      for (let k in row) {
        row[k] = row[k] == null ? "-" : row[k];
        html = this.replace(html, "\\{" + k + "\\}", row[k]);
      }
      if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
        html = '-';
      }
      td.html(html);
    }
    if (col.display) {
      col.display(row, td, j, (typeof(rowIndex) === 'undefined' ? -1 : rowIndex), this.start);
    }
    tr.appendChild(td);
  }
  if (typeof rowIndex !== 'undefined') {
    let oldTr = tbody.rows[rowIndex];
    tbody.replaceChild(tr, oldTr);
  } else {
    tbody.appendChild(tr);
  }

};

PaginationTable.prototype.getData = function () {
  let ret = [];
  let tbody = $(this.table.find('tbody')).get(0);
  let trs = tbody.querySelectorAll('tr');
  for (let i = 0; i < trs.length; i++) {
    let tr = trs[i];
    if (tr.classList.contains('no-hover')) {
      continue;
    }
    let model = dom.model(tr);
    ret.push(model);
  }
  return ret;
};

/**
 * 通过stack方式显示单行额外信息。
 *
 * @param {integer} rowIndex
 *        扩展的行的索引号
 *
 * @param {string} url
 *        在stack区域显示的内容
 *
 * @param {function} render
 *        用于渲染stack区域的回调函数
 */
PaginationTable.prototype.stack = function(rowIndex, url, params, render) {
  params = params || {};
  let tbody = dom.find('tbody', this.container);
  let rowStack = tbody.children[rowIndex + 1];
  if (rowStack != null && rowStack.getAttribute('role') == 'stack') {
    return;
  }
  rowStack = dom.find('tr[role=stack]', tbody);

  if (rowStack != null) {
    if (rowStack.rowIndex <= rowIndex) rowIndex--;
    rowStack.remove();
  }
  let row = tbody.children[rowIndex];
  rowStack = dom.create('tr', 'fade', 'fadeInDown');
  rowStack.setAttribute('role', 'stack');
  // rowStack.setAttribute('style', 'background-color: white;')

  let cellStack = dom.create('td');
  rowStack.style.backgoundColor = 'white';
  cellStack.setAttribute('colspan', this.columns.length);
  rowStack.appendChild(cellStack);

  if (row == null || row.nextSibling == null) {
    tbody.appendChild(rowStack);
  } else {
    tbody.insertBefore(rowStack, row.nextSibling);
  }

  xhr.get({
    url: url,
    success: function(resp) {
      utils.append(cellStack, resp);
      if (render)
        render(cellStack, params);
      setTimeout(function () {
        rowStack.classList.add('show');
      }, 300);
    }
  })
};

PaginationTable.prototype.unstack = function() {
  let tbody = dom.find('tbody', this.container);
  let rowStack = dom.find('tr[role=stack]', tbody);
  if (rowStack != null) rowStack.remove();
};

function QueryFilter(opts) {
  this.fields = opts.fields;
  this.table = opts.table;
  this.convert = opts.convert || function (data) {return data};
}

QueryFilter.prototype.getRoot = function() {
  let self = this;
  this.root = dom.element(`
    <div class="pl-2 mr-5"
         style="width: 100%; height: 26px; border-bottom: 1px solid rgba(0, 0, 0, 0.1); cursor: text; 
                line-height: 26px; z-index: 999;">
      <i class="fas fa-search pr-2" style="opacity: 0.3;"></i>
      <style>#__input_dummy{outline: none}</style>
      <input id="__input_dummy" style="height: 22px; width: 6px; border: none;">
    </div>
  `);
  this.root.appendChild(this.getConditions());

  this.dummy = dom.find('input', this.root);

  dom.bind(this.root, 'click', (ev) => {
    self.dummy.focus();
  });
  dom.bind(this.dummy, 'focus', (ev) => {
    let rectRoot = self.root.getBoundingClientRect();
    let rectInput = self.dummy.getBoundingClientRect();
    self.conditions.style.left = (rectInput.left - rectRoot.left) + 'px';
    self.conditions.style.top = '25px';
    self.conditions.style.display = '';

    document.querySelectorAll('.query-filter').forEach((el, idx) => {
      el.remove();
    });
  });
  dom.bind(this.dummy, 'blur', (ev) => {
    // self.conditions.style.display = 'none';
  });
  // not allow to input anything
  dom.bind(this.dummy, 'keyup', (ev) => {
    self.dummy.value = '';
    return false;
  });

  return this.root;
};

QueryFilter.prototype.getConditions = function() {
  let self = this;
  this.conditions = dom.element(`
    <div style="position: absolute; display: none;">
      <ul class="list-group"></ul>
    </div>
  `);
  let ul = dom.find('ul', this.conditions);
  for (let i = 0; i < this.fields.length; i++) {
    let li = dom.templatize(`
      <li class='list-group-item font-weight-bold pointer pt-1 pb-1 pl-2 pr-2'>{{title}}</li>
    `, this.fields[i]);
    dom.model(li, this.fields[i]);
    ul.appendChild(li);

    dom.bind(li, 'click', ev => {
      let li = dom.ancestor(ev.target, 'li');
      let filter = dom.model(li);
      self.addFilter(filter);
      self.conditions.style.display = 'none';
      self.dummy.blur();
      ev.stopImmediatePropagation();
    });
  }
  let li = dom.element(`
    <li class='list-group-item pointer text-success font-weight-bold pt-1 pb-1 pl-2 pr-2' style="text-align: center;">关闭</li>
  `);
  ul.appendChild(li);

  dom.bind(li, 'click', ev => {
    let li = dom.ancestor(ev.target, 'li');
    self.conditions.style.display = 'none';
    self.dummy.blur();
    ev.stopImmediatePropagation();
  });
  return this.conditions;
};

QueryFilter.prototype.addFilter = function(filter) {
  let self = this;
  let el = dom.templatize(`
    <span class="tag-removable gray font-12 m-0 mr-1" style="height: 22px; line-height: 22px;">
      <span>{{title}}: </span>
      <strong>&nbsp;</strong>
      <i class="fas fa-times"></i>
    </span>
  `, filter);
  let style = dom.find('style', this.root);
  this.root.insertBefore(el, style);

  let i = dom.find('i', el);
  dom.bind(i, 'click', ev => {
    ev.stopImmediatePropagation();
    let span = ev.target.parentElement;
    span.remove();
    // 回调表格重新请求

    self.request();
  });
  let strong = dom.find('strong', el);
  dom.bind(strong, 'click', ev => {
    // 清除已经弹出的条件框
    document.querySelectorAll('.query-filter').forEach((el, idx) => {
      el.remove();
    });
    // 隐藏条件选项
    self.conditions.style.display = 'none';
    
    ev.stopImmediatePropagation();
    if (filter.input === 'date') {
      self.displayDateInput(strong);
    } else if (filter.input === 'select' || filter.input === 'check') {
      self.displaySelectInput(strong, filter);
    }
  });
  dom.bind(strong, 'keydown', ev => {
    if (ev.keyCode === 13) {
      ev.preventDefault();
      // TODO: 发起查询，失去焦点
      strong.blur();
    }
  });
  dom.bind(strong, 'blur', ev => {
    // 回调表格重新发起请求
    self.request();
  });
  dom.bind(el, 'click', ev => {
    ev.stopImmediatePropagation();
  });
  strong.setAttribute('data-filter-name', filter.name);
  strong.setAttribute('data-filter-input', filter.input);
  if (filter.input === 'text') {
    strong.setAttribute('contenteditable', 'true');
    strong.focus();
  } else if (filter.input === 'date') {
    self.displayDateInput(strong);
  } else if (filter.input === 'select' || filter.input === 'check') {
    self.displaySelectInput(strong, filter)
  } else if (filter.input === 'bool') {
    strong.setAttribute('data-filter-values', filter.values);
    strong.innerText = '是';
    self.request();
  }
};

QueryFilter.prototype.displayDateInput = function(triggeredEl) {
  document.querySelectorAll('.query-filter').forEach((el, idx) => {
    el.remove();
  });
  let self = this;
  let el = dom.element(`
    <div class="query-filter" style="position: absolute;
         border: 1px solid rgba(0, 0, 0, 0.1); background: white;">
    </div>
  `);
  let rectRoot = this.root.getBoundingClientRect();
  let rectInput = triggeredEl.getBoundingClientRect();
  el.style.left = (rectInput.left - rectRoot.left) + 'px';
  el.style.top = '25px';
  dom.bind(el, 'click', ev => {
    // 阻止重新弹出条件选择框
    ev.stopImmediatePropagation();
  });
  $(el).datetimepicker({
    format: 'YYYY-MM-DD',
    locale: 'zh_CN',
    useCurrent: false,
    inline: true,
  }).on('dp.change', ev => {
    // 显示日期
    triggeredEl.innerText = moment(ev.date).format('YYYY-MM-DD');
    // 去掉日期选择框
    el.remove();
    // 回调表格重新请求
    self.request();
  });
  this.root.appendChild(el);
};

QueryFilter.prototype.displayDateRangeInput = function() {

};

QueryFilter.prototype.displaySelectInput = function(triggeredEl, filter) {
  document.querySelectorAll('.query-filter').forEach((el, idx) => {
    el.remove();
  });
  let self = this;
  let el = dom.element(`
    <div class="query-filter" style="position: absolute; min-width: 160px;">
      <ul class="list-group"></ul>
    </div>
  `);

  dom.bind(el, 'click', ev => {
    ev.stopImmediatePropagation();
  });

  let rectRoot = this.root.getBoundingClientRect();
  let rectInput = triggeredEl.getBoundingClientRect();
  el.style.left = (rectInput.left - rectRoot.left) + 'px';
  el.style.top = '25px';

  let ul = dom.find('ul', el);
  // string to json
  if (typeof filter.values === 'string') {
    filter.values = JSON.parse(filter.values);
  }
  for (let i = 0; i < filter.values.length; i++) {
    let val = filter.values[i];
    let li = dom.templatize(`
      <li class='list-group-item font-weight-bold pointer p-1 pl-4'>
        <input name="values" class="form-check-input checkbox is-outline mr-2" type="checkbox" value="{{value}}">
        <span style="position: relative; top: 2px;">{{text}}</span>
      </li>
    `, val);
    ul.appendChild(li);
  }
  let li = dom.element(`
    <li class='list-group-item font-weight-bold pointer p-1 pl-4' style="line-height: 33px;">
      <div class="d-flex">
        <a class="text-primary font-weight-bold" style="width: 50%; text-align: center;">确认</a>
        <a class="text-warning font-weight-bold" style="width: 50%; text-align: center;">取消</a>
      </div>
    </li>
  `);
  ul.appendChild(li);
  // 确认
  dom.bind(li.children[0].children[0], 'click', ev => {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    el.remove();
    let values = dom.formdata(ul).values;
    let texts = [];
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < filter.values.length; j++) {
        if (filter.values[j].value === values[i]) {
          texts.push(filter.values[j].text);
          break;
        }
      }
    }
    triggeredEl.setAttribute('data-filter-values', values);
    triggeredEl.innerText = texts.join('，');
    // 回调表格重新请求
    self.request();
  });
  // 取消
  dom.bind(li.children[0].children[1], 'click', ev => {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    el.remove();
  });
  this.root.appendChild(el);
};

QueryFilter.prototype.getValues = function() {
  let ret = {};
  this.root.querySelectorAll('strong').forEach((el, idx) => {
    let filterName = el.getAttribute('data-filter-name');
    let filterInput = el.getAttribute('data-filter-input');
    let filterValues = el.getAttribute('data-filter-values');
    if (filterInput === 'bool') {
      if (!ret['_and_condition']) ret['_and_condition'] = '';
      ret['_and_condition'] += ' ' + filterValues;
      return;
    }
    if (filterName && filterName !== '') {
      if (filterValues == null || filterValues === '') {
        ret[filterName] = el.innerText.trim();
      } else {
        ret[filterName] = filterValues.split(",")
      }
    }
  });
  return ret;
};

QueryFilter.prototype.request = function() {
  if (this.table) {
    this.table.go(1, this.convert(this.getValues()));
  }
};
let ICON_CLEAR = '<i class="fas fa-backspace text-danger position-relative" style="left: -4px;"></i>';

function QueryLayout(opts) {
  let self = this;
  this.fields = opts.fields;
  this.actions = opts.actions || [];
  this.queryOpt = opts.query || {};
  this.columnCount = opts.columnCount || 1;
  // 查询值转换函数，用于复杂查询
  this.convert = opts.convert;
}

QueryLayout.prototype.render = function (containerId, read, data) {
  function formatCols(cols) {
    if (cols < 10)
      return '0' + cols;
    return cols;
  }
  let self = this;
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }

  if (read) {
    this.fetch(read);
    return;
  }

  data = data || {};

  let form = dom.create('div', 'card-body', 'row', 'mx-0');
  let columnCount = this.columnCount;
  let hiddenFields = [];
  let shownFields = [];

  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    field.value = (typeof data[field.name] === 'undefined') ? null : data[field.name];
    if (field.input == 'hidden') {
      hiddenFields.push(field);
    } else {
      shownFields.push(field);
    }
  }

  for (let i = 0; i < shownFields.length; i++) {
    let field = shownFields[i];
    let formGroup = dom.create('div', (field && field.input == 'check'? 'form-group-check' : 'form-group'), 'col-24-' + formatCols(24 / this.columnCount), 'row', 'mx-0');
    let group = this.createInput(field, columnCount);

    formGroup.appendChild(group.label);
    formGroup.appendChild(group.input);

    form.appendChild(formGroup);
  }
  // 必须放在这里，否者后续容器会找不到
  this.container.appendChild(form);

  // ###################### //
  // 引用的第三方插件，重新渲染 //
  // ###################### //
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    if (field.input == 'date') {
      $(this.container).find('input[name=' + field.name + ']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN'
      });
      // 加载值或者默认值
      if (field.value != null) {
        $(this.container).find('input[name=' + field.name + ']').val(
          moment(field.value).format('YYYY-MM-DD'));
      }
    } else if (field.input == 'select') {
      let opts = field.options;
      // 加载值或者默认值
      opts.selection = field.value;
      $(this.container).find('select[name=' + field.name + ']').searchselect(opts);
      let select = dom.find('select[name=' + field.name + ']', this.container);
      // FIXME
      setTimeout(() => {
        select.nextSibling.style.width = '100%';
      }, 200);
    } else if (field.input == 'cascade') {
      let opts = field.options;
      // 加载值或者默认值
      for (let j = 0; j < opts.levels.length; j++) {
        let level = opts.levels[j];
        if (typeof data[level.name] !== "undefined") {
          level.value = data[level.name];
        }
      }
      opts.readonly = this.readonly || false;
      $(this.container).find('div[data-cascade-name=' + field.name + ']').cascadeselect(opts);
    } else if (field.input == 'checklist') {
      field.options.name = field.name;
      field.options.readonly = this.readonly;
      new Checklist(field.options).render(dom.find('div[data-checklist-name=' + field.name + ']', container), {
        selections: data[field.name] || []
      });
    } else if (field.input == 'checktree') {
      new Checktree(field.options).render('#checktree_' + field.name);
    } else if (field.input == 'fileupload') {
      new FileUpload(field.options).render(dom.find('div[data-fileupload-name=' + field.name + ']', container));
    }
  }

  let buttonRow = dom.element('<div class="row ml-0 mr-0 full-width"><div class="full-width"></div></div>');
  let buttons = dom.create('div', 'float-right');
  buttons.style.paddingRight = '15px';
  let buttonQuery = dom.create('button', 'btn', 'btn-query', 'btn-sm');
  buttonQuery.textContent = '搜索';
  dom.bind(buttonQuery, 'click', function() {
    if (self.queryOpt.callback) {
      // 查询条件转换函数
      if (self.queryOpt.convert) {
        self.queryOpt.callback(self.queryOpt.convert(dom.formdata(self.container)));
      } else {
        self.queryOpt.callback(dom.formdata(self.container));
      }
    }
  });
  buttons.appendChild(buttonQuery);
  buttons.append(' ');
  let buttonReset = dom.create('button', 'btn', 'btn-reset', 'btn-sm');
  buttonReset.textContent = '清除';
  dom.bind(buttonReset, 'click', function() {
    $(self.container).formdata({});
  });
  buttons.appendChild(buttonReset);
  buttons.append(' ');
  // let buttonClose = dom.create('button', 'btn', 'btn-sm', 'btn-close');
  // buttonClose.textContent = '关闭';
  // dom.bind(buttonClose, 'click', function() {
  //   self.container.classList.remove('show');
  // });
  // buttons.appendChild(buttonClose);
  buttonRow.firstElementChild.appendChild(buttons);
  form.appendChild(buttonRow);

  this.container.addEventListener('keypress', function(ev) {
    if (ev.keyCode === 13) {
      buttonQuery.click();
    }
  });
};

QueryLayout.prototype.getQuery = function() {
  if (this.convert) {
    return this.convert(dom.formdata(this.container));
  }
  return dom.formdata(this.container);
};

/**
 * Creates input element in form.
 *
 * @param field
 *        field option
 *
 * @param columnCount
 *        column count in a row
 *
 * @returns {object} label and input with add-ons dom elements
 *
 * @private
 */
QueryLayout.prototype.createInput = function (field, columnCount) {
  let self = this;
  columnCount = columnCount || 1;
  let minCols = 24 / (columnCount * 3);
  // let label = dom.create('div', columnCount == 2 ? 'col-md-2' : 'col-md-4', 'col-form-label');
  let label = dom.create('div', 'col-form-label', 'col-24-08', 'pl-3');
  label.innerText = field.title + '：';
  let group = dom.create('div', 'col-24-16', 'input-group');

  let input = null;
  if (field.input == 'select') {
    input = dom.create('select', 'form-control');
    input.style.width = '100%';
    input.disabled = this.readonly;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input == 'cascade') {
    input = dom.create('div', 'form-control','sm30');
    if (this.readonly)
      input.style.backgroundColor = 'rgb(240, 243, 245)';
    input.setAttribute('data-cascade-name', field.name);
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input == 'check') {
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let check = dom.element(`
        <div class="form-check form-check-inline">
          <input id="" name="" value="" type="checkbox"
                 class="form-check-input checkbox color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      dom.find('input', check).id = 'check_' + val.value;
      dom.find('input', check).name = field.name;
      if (field.value) {
        dom.find('input', check).checked = field.value == val.value;
      } else {
        dom.find('input', check).checked = val.checked == true;
      }
      dom.find('input', check).value = val.value;
      dom.find('label', check).setAttribute('for', 'check_' + val.value);
      dom.find('label', check).textContent = val.text;
      group.append(check);
    }
  } else {
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入...');
  }
  if (input != null)
    group.appendChild(input);

  if (field.input == 'date') {
    input.setAttribute('data-domain-type', 'date');
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input.indexOf('number') == 0) {
    input.setAttribute('data-domain-type', field.input);
  }

  // let clear = dom.element('<div class="input-group-append pointer"><span class="input-group-text width-36 icon-error"></span></div>');
  // dom.find('span', clear).innerHTML = ICON_CLEAR;
  // dom.bind(clear, 'click', function() {
  //   dom.find('input', clear.parentElement).value = '';
  // });

  // if (field.input !== 'checklist' &&
  //   field.input !== 'longtext' &&
  //   field.input !== 'select' &&
  //   field.input !== 'check' &&
  //   field.input !== 'radio' &&
  //   field.input !== 'checktree' &&
  //   field.input !== 'fileupload')
  //   group.append(clear);

  return {label: label, input: group};
};

/**
 * Creates button element.
 *
 * @param action
 *        action option
 *
 * @returns {button} the button dom element
 *
 * @private
 */
QueryLayout.prototype.createButton = function(action) {
  let self = this;
  let button = dom.create('button', 'btn', 'btn-sm', 'btn-' + action.role);
  button.innerText = action.text;
  button.addEventListener('click', action.click);
  return button;
};
function ReadonlyForm(opts) {
	// 表单容器
	this.container = dom.find(opts.containerId);
	// 远程数据访问地址及参数
	this.url = opts.url;
	this.params = opts.params || {};
	// 本地数据
	this.local = opts.local;
	// 显示列数
	this.columnCount = opts.columnCount || 1;
	// 显示字段
	this.fields = opts.fields;
	this.convert = opts.convert;

	if (this.container) {
		this.render(this.container, this.params);
	}
}

/**
 * Fetches data from remote url.
 *
 * @param params
 *        the request parameters, local data or undefined
 */
ReadonlyForm.prototype.fetch = function (params) {
	let self = this;
	if (this.url) {
		let requestParams = {};
		utils.clone(this.params, requestParams);
		utils.clone(params || {}, requestParams);
		xhr.promise({
			url: this.url,
			params: requestParams,
		}).then((data) => {
			let _data = data;
			if (self.convert) {
				_data = self.convert(data);
			}
			self.root(_data);
		});
	} else {
		this.root(params);
	}
};

ReadonlyForm.prototype.root = function (data) {
	this.container.innerHTML = '';
	data = data || {};
	let self = this;
	let root = dom.element('<div class="row ml-0 mr-0"></div>');
	for (let i = 0; i < this.fields.length; i++) {
		let field = this.fields[i];
		field.emptyText = field.emptyText || '-';
		field.columnCount = field.columnCount || 1;
		let colnum = parseInt(12 / Number(self.columnCount));

		let averageSpace = 24 / self.columnCount;
		let labelGridCount = 0;
		let inputGridCount = 0;
		if (averageSpace === 24) {
			labelGridCount = 6;
			inputGridCount = 18;
		} else if (averageSpace === 12) {
			labelGridCount = 4;
			inputGridCount = 8;
		} else if (averageSpace === 8) {
			labelGridCount = 3;
			inputGridCount = 5;
		} else if (averageSpace === 6) {
			labelGridCount = 2;
			inputGridCount = 4;
		}
		let caption = dom.element('<div class="col-24-' + this.formatGridCount(labelGridCount) + '" style="line-height: 32px;"></div>');
		let value = dom.element('<strong class="col-24-' + this.formatGridCount(inputGridCount) + '" style="line-height: 32px;"></strong>');

		if (field.title) {
			caption.innerText = field.title + '：';
			let _value = null;
			if (typeof field.getValue !== 'undefined') {
				_value = field.getValue.apply(null, data);
			} else {
				_value = data[field.name] == undefined ? field.emptyText : data[field.name];
			}
			if (field.display) {
				value = dom.element('<div class="col-24-' + this.formatGridCount(inputGridCount) + '" style="line-height: 32px;  height: 32px;"></div>');
				field.display(data, value);
			} else {
				// 值转换
				if (field.convert) {
					_value = field.convert(data[field.name]);
				}
				if (_value != '-') {
					if (field.convert) {
						_value = field.convert(data[field.name]);
					} else {
						if (field.values && field.values.length > 0) {
							field.values.forEach(function (item) {
								if (field.input && (field.input == 'radio' || field.input == 'select') && item.value == data[field.name]) {
									_value = item.text
								}
								if (field.input && field.input == 'checkbox' && data[field.name].indexOf(item.value) > -1) {
									_value.push(item.text)
								}
							});
							if (field.input && field.input == 'checkbox' && typeof (_value) == 'object') {
								_value = _value.join(",");
							}
						}
					}
					if (field.unit) {
						_value = _value + field.unit;
					}
				} else {
					_value = '-';
				}
				value.innerHTML = _value;
			}
		}
		root.appendChild(caption);
		root.appendChild(value);
	}
	this.container.appendChild(root);
};

ReadonlyForm.prototype.reload = function (params) {
	this.fetch(params);
};

ReadonlyForm.prototype.render = function (containerId, params) {
	if (typeof containerId !== 'undefined')
		this.container = dom.find(containerId);
	this.fetch(params);
};

ReadonlyForm.prototype.formatGridCount = function (count) {
	if (count < 10) {
		return '0' + count;
	}
	return '' + count;
};

function Report(opts) {
	// 表单容器
	this.container = dom.find(opts.containerId);
	// 远程数据访问地址及参数
	this.url = opts.url;
	this.params = opts.params || {};
	// 本地数据
	this.local = opts.local;
	// 显示字段
	this.Data = opts.data;
	// 简介显示列数
	this.columnCount = opts.profileColumnCount || 4;
	this.convert = opts.convert;
	this.rowClick = opts.rowClick;
	this.mode=opts.mode || 'radio'
	if (opts.url) {
		this.reload(opts.params)
	} else {
		this.render();
	}
}

/**
 * Fetches data from remote url.
 *
 * @param params
 *        the request parameters, local data or undefined
 */
Report.prototype.fetch = function (params) {
	let self = this;
	if (this.url) {
		let requestParams = {};
		utils.clone(this.params, requestParams);
		utils.clone(params || {}, requestParams);
		xhr.promise({
			url: this.url,
			params: requestParams,
		}).then((data) => {
			let _data = data;
			if (self.convert) {
				_data = self.convert(data)
			}
			self.root(_data);
		});
	} else {
		this.root(params);
	}
};

Report.prototype.root = function (data) {
	this.container.innerHTML = '';
	let self = this;
	let root = dom.element('<div class="report-card"></div>');
	let headDom=dom.element('<div class="report-card-head"></div>');
	let headTitleDom=dom.element('<div class="report-card-head-title"></div>');
	if(data.name&&data.name.length>0){
		let titleDom=dom.element('<p class="head-title"><span>'+data.name+'</span></p>');
		headTitleDom.appendChild(titleDom);
	}
	let minTitleDom=dom.element('<p class="head-doctor"></p>');
	if(data.attendingDoctor){
		let _span=dom.element('<span>主诊医生：'+data.attendingDoctor+'</span>');
		minTitleDom.appendChild(_span)
	}else if(data.head&&data.head.length>0){
		data.head.forEach(function (item) {
			let _span=dom.element('<span> '+item.label+' : '+item.value+' </span>');
			minTitleDom.appendChild(_span)
		})
	}else{
		let _span=dom.element('<span>主诊医生：- </span>');
		minTitleDom.appendChild(_span)
	}
	headTitleDom.appendChild(minTitleDom);
	headDom.appendChild(headTitleDom);

	let _profile=[];
	if(data.profile&&data.profile.length>0){
		_profile=data.profile;
	}else{
		_profile=[{label:'检验单号',value:data.patientLaboratoryReportId},
			{label:'送检',value:data.reportDoctor?data.reportDoctor:''},
			{label:'性别',value:data.gender},
			{label:'姓名',value:data.patientName},
			{label:'年龄',value:(data.age?data.age+'岁':'')},
			{label:'标本部位',value:data.position?data.position:''},
			{label:'报告日期',value:data.reportTime?data.reportTime:''},
			{label:'送检日期',value:data.publishTime?data.publishTime:''}];
	}
	let profileHtml='';
	let colnumCount=12/this.columnCount;
	_profile.forEach(function (item) {
		let profilediv='<div class="col-lg-'+colnumCount+' col-sm-12 row-flex"><span>'+item.label+'：</span><div>'+item.value+'</div></div>';
		profileHtml=profileHtml+profilediv;
	})
	let profileDom=dom.element('<div class="report-card-head-body"><div class="row ml-0 mr-0">'+profileHtml+'</div></div>');
	headDom.appendChild(profileDom);

	let tableHtml='';
	if(data.results&&data.results.length>0){
		data.results.forEach(function (item) {
			let trDom='<tr style="color:'+(item.color?item.color:'#333333')+';"><td>'+item.componentName+'</td><td>'+item.result+'</td><td>'+item.unit+'</td><td>'+item.referenceRange+'</td><td>'+item.state+'</td></tr>';
			tableHtml=tableHtml+trDom;
		})
	}
	let contentDom=dom.element('<div class="report-card-body"><div class="report-table"><table><tr><th>检验项目</th><th>结果</th><th>单位</th><th>参考值</th><th>状态</th></tr>'+tableHtml+'</table></div></div>');
	root.appendChild(headDom);
	root.appendChild(contentDom);
	this.container.appendChild(root);
};

Report.prototype.reload = function (params) {
	this.fetch(params);
};

Report.prototype.render = function () {
	this.fetch({});
};


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
/**
 * Tag template example:
 *
 * <pre>
 *   <span class="tag-removable success">
 *     <strong>瓣膜换术后</strong>
 *     <i class="fas fa-times"></i>
 *   </span>
 * </pre>
 *
 * @param opts
 * @constructor
 */
function Tags(opts) {
  this.container = dom.find(opts.containerId);
  this.onRemove = opts.onRemove;
  this.onClick = opts.onClick;
}

Tags.TEMPLATE_HTML = `
  <span class="{{severity}}" data-tag-id="{{id}}">
    <strong>{{text}}</strong>
    <i class="fas fa-times"></i>
  </span>
`;

Tags.prototype.replaceTag = function(tag) {
  // check duplicated
  for (let i = 0; i < this.container.children.length; i++) {
    let elTag = this.container.children[i];
    let tagId = elTag.getAttribute('data-tag-id');
    if (tagId == tag.id) {
      elTag.setAttribute('class', tag.severity);
      return;
    }
  }
  let self = this;
  let el = dom.templatize(Tags.TEMPLATE_HTML, tag);

  if (this.onClick) {
    el.classList.add('pointer');
    dom.bind(el, 'click', (ev) => {
      self.onClick({
        id: el.getAttribute('data-tag-id'),
      })
    });
  }

  let i = dom.find('i', el);
  if (this.onRemove) {
    el.classList.add('tag-removable');
    dom.bind(i, 'click', (ev) => {
      self.onRemove({
        id: el.getAttribute('data-tag-id'),
      });
      el.remove();
    });
  } else {
    el.classList.add('tag-readonly');
    i.remove();
  }
  this.container.appendChild(el);
};

Tags.prototype.getValues = function() {

};


function Tiles(opts) {

}



function Timeline(opt) {
  this.url = opt.url;
  this.params = opt.params || {};

  this.data = opt.data || [];

  this.fnTitle = opt.title || function(row, index) { return ''; };
  this.fnSubtitle = opt.subtitle || function(row, index) { return ''; };
  this.fnContent = opt.content || function(row, index) { return ''; };

  this.onComplete = opt.onComplete;
}

Timeline.prototype.createTile = function(row, index) {
  let ret = dom.element(`
    <li class="timeline-item">
      <div class="time"></div>
      <div class="small text-muted"></div>
      <p></p>
    </li>
  `);
  let title = ret.children[0];
  let subtitle = ret.children[1];
  let content = ret.children[2];
  if (this.fnTitle) {
    let el = this.fnTitle(row, index);
    if (typeof el === 'undefined')
      title.innerHTML = '';
    else if (typeof el === 'string' || typeof el === 'number')
      title.innerHTML = el;
    else
      title.appendChild(el);
  }
  if (this.fnSubtitle) {
    let el = this.fnSubtitle(row, index);
    if (typeof el === 'undefined')
      subtitle.innerHTML = '';
    else if (typeof el === 'string' || typeof el === 'number')
      subtitle.innerHTML = el;
    else
      subtitle.appendChild(el);
  }
  if (this.fnContent) {
    let el = this.fnContent(row, index);
    if (typeof el === 'undefined')
      content.innerHTML = '';
    else if (typeof el === 'string' || typeof el === 'number')
      content.innerHTML = el;
    else
      content.appendChild(el);
  }
  return ret;
};

Timeline.prototype.render = function(container, params) {
  let self = this;
  if (typeof container === 'string') {
    this.container = document.querySelector(container);
  } else {
    this.container = container;
  }
  this.container.innerHTML = '';

  params = params || {};
  let ul = dom.create('ul', 'timeline-simple');
  this.container.appendChild(ul);

  let requestParams = {};
  utils.clone(this.params, requestParams);
  utils.clone(params, requestParams);
  if (this.url) {
    xhr.post({
      url: this.url,
      params: requestParams,
      success: function (resp) {
        if (!resp.data) return;
        let data = resp.data;
        for (let i = 0; i < data.length; i++) {
          ul.appendChild(self.createTile(data[i], i));
        }
      }
    });
  } else {
    for (let i = 0; i < self.data.length; i++) {
      ul.appendChild(self.createTile(self.data[i], i));
    }
  }
  if (self.onComplete) {
    self.onComplete();
  }
};

function Topology(opt) {
  this.images = opt.images;
  this.graph = {
    nodes: [],
    edges: []
  }
  this.nodeClicked = opt.nodeClicked || function(node) {};
  this.nodeMoved = opt.nodeMoved || function(node) {};
}

Topology.prototype.initialize = function() {
  sigma.utils.pkg('sigma.canvas.nodes');
  sigma.utils.pkg('sigma.canvas.edges');
  sigma.canvas.nodes.image = (function() {
    let _cache = {}, _loading = {}, _callbacks = {};

    // Return the renderer itself:
    let renderer = function(node, context, settings) {
      let args = arguments,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'],
        color = node.color || settings('defaultNodeColor'),
        url = node.url;

      if (_cache[url]) {
        context.save();

        // Draw the clipping disc:
        context.beginPath();
        context.arc(
          node[prefix + 'x'],
          node[prefix + 'y'],
          node[prefix + 'size'],
          0,
          Math.PI * 2,
          true
        );
        context.closePath();
        context.clip();

        // Draw the image
        context.drawImage(
          _cache[url],
          node[prefix + 'x'] - size,
          node[prefix + 'y'] - size,
          2 * size,
          2 * size
        );

        // Quit the "clipping mode":
        context.restore();

        // Draw the border:
        context.beginPath();
        context.arc(
          node[prefix + 'x'],
          node[prefix + 'y'],
          node[prefix + 'size'],
          0,
          Math.PI * 2,
          true
        );
        context.lineWidth = size / 5;
        context.strokeStyle = node.color || settings('defaultNodeColor');
        context.stroke();
      } else {
        sigma.canvas.nodes.image.cache(url);
        sigma.canvas.nodes.def.apply(
          sigma.canvas.nodes,
          args
        );
      }
    };

    // Let's add a public method to cache images, to make it possible to
    // preload images before the initial rendering:
    renderer.cache = function(url, callback) {
      if (callback)
        _callbacks[url] = callback;

      if (_loading[url])
        return;

      let img = new Image();

      img.onload = function() {
        _loading[url] = false;
        _cache[url] = img;

        if (_callbacks[url]) {
          _callbacks[url].call(this, img);
          delete _callbacks[url];
        }
      };

      _loading[url] = true;
      img.src = url;
    };

    return renderer;
  })();

  // sigma.canvas.edges.t = function(edge, source, target, context, settings) {
  //   let color = edge.color,
  //     prefix = settings('prefix') || '',
  //     edgeColor = settings('edgeColor'),
  //     defaultNodeColor = settings('defaultNodeColor'),
  //     defaultEdgeColor = settings('defaultEdgeColor');
  //
  //   if (!color)
  //     switch (edgeColor) {
  //       case 'source':
  //         color = source.color || defaultNodeColor;
  //         break;
  //       case 'target':
  //         color = target.color || defaultNodeColor;
  //         break;
  //       default:
  //         color = defaultEdgeColor;
  //         break;
  //     }
  //
  //   context.strokeStyle = color;
  //   context.lineWidth = edge[prefix + 'size'] || 1;
  //   context.beginPath();
  //   context.moveTo(
  //     source[prefix + 'x'],
  //     source[prefix + 'y']
  //   );
  //   context.lineTo(
  //     source[prefix + 'x'],
  //     target[prefix + 'y']
  //   );
  //   context.lineTo(
  //     target[prefix + 'x'],
  //     target[prefix + 'y']
  //   );
  //   context.stroke();
  // };
};

Topology.prototype.addVertex = function(vertex) {
  vertex.size = 16;
  vertex.type = 'image';
  this.graph.nodes.push(vertex);
};

Topology.prototype.connect = function(source, target, color) {
  let vertexSource = null;
  let vertexTarget = null;
  for (let i = 0; i < this.graph.nodes.length; i++) {
    let vertex = this.graph.nodes[i];
    if (source == vertex.id) {
      vertexSource = vertex;
    }
    if (target == vertex.id) {
      vertexTarget = vertex;
    }
  }
  this.graph.edges.push({
    id: vertexSource.id + '<->' + vertexTarget.id,
    source: vertexSource.id,
    target: vertexTarget.id,
    color: '#3a9d5d',
    size: 1
  });
};

Topology.prototype.render = function(selector, params) {
  this.renderTo(selector);
};

Topology.prototype.renderTo = function(selector) {
  let self = this;
  self.initialize();
  if (typeof selector == 'string') {
    this.container = dom.find(selector);
  } else {
    this.container = selector;
  }
  this.container.innerHTML = '';
  let loaded = 0;
  this.images.forEach(function(url) {
    sigma.canvas.nodes.image.cache(url, function() {
      if (++loaded != self.images.length) return;
      self.sigma = new sigma({
        graph: self.graph,
        renderer: {
          // IMPORTANT:
          // This works only with the canvas renderer, so the
          // renderer type set as "canvas" is necessary here.
          container: self.container,
          type: 'canvas'
        },
        settings: {
          defaultLabelColor: '#fff',
          zoomingRatio: 1,
          autoRescale: false,
          doubleClickEnabled: false,
          minNodeSize: 8,
          maxNodeSize: 16,
        }
      });
      self.sigma.bind('doubleClickNode', function(event) {
        self.nodeClicked(event.data.node);
      });
      // Initialize the dragNodes plugin:
      let dragListener = sigma.plugins.dragNodes(self.sigma, self.sigma.renderers[0]);

      dragListener.bind('startdrag', function(event) {

      });
      dragListener.bind('drag', function(event) {

      });
      dragListener.bind('drop', function(event) {

      });
      dragListener.bind('dragend', function(event) {
        self.nodeMoved(event.data.node);
      });
      // s.startForceAtlas2();
    });
  });
};

function TreeView(opts) {
  if (opts.url) {
    this.rootUrl = opts.url;
    this.childUrl = opts.url;
  } else if (opts.urls) {
    this.rootUrl = opts.urls.root;
    this.childUrl = opts.urls.child;
  }
  this.local = opts.local;
  // the level number
  this.levels = opts.levels || 99;
  let params = opts.params || {};
  this.rootParams = params.root || {};
  this.childParams = params.child || {};

  this.contextable = opts.contextable !== false;
  this.dndable = opts.dndable === true;

  let self = this;
  this.doCreateNode = opts.doCreateNode || function (row) {
    return dom.templatize(`
      <strong>{{text}}</strong>
    `, {
      text: row[self.fieldText],
    });
  };

  this.styles = opts.styles || {};

  this.fieldText = opts.fields.text;
  this.fieldValue = opts.fields.value;
  this.fieldParent = opts.fields.parent;

  this.contextMenu = dom.element(`
    <div class="context-menu" style="display: none; width: 200px;">
      <ul class="menu">
        <li><a widget-id="buttonAdd" href="#"><i class="fas fa-plus-circle position-relative" style="top: -2px;"></i>添加</a></li>
        <li><a widget-id="buttonEdit" href="#"><i class="fas fa-edit position-relative" style="top: -2px;"></i>编辑</a></li>
        <li><a widget-id="buttonCopy" href="#"><i class="fas fa-copy position-relative" style="top: -2px;"></i>复制</a></li>
        <li class="trash"><a widget-id="buttonDelete" href="#"><i class="fas fa-trash position-relative" style="top: -2px;"></i>删除</a></li>
      </ul>
    </div>
  `);
  dom.init(this, this.contextMenu);

  this.onEditNode = opts.onEditNode;
  this.onRemoveNode = opts.onRemoveNode;
  this.onSelectNode = opts.onSelectNode;
  this.onAddNode = opts.onAddNode;
  this.onDropNode = opts.onDropNode;

  this.isNodeEditable = opts.isNodeEditable;
  this.isNodeRemovable = opts.isNodeRemovable;
  this.isNodeAppendable = opts.isNodeAppendable;

  if (this.onEditNode) {
    dom.bind(this.buttonEdit, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hideContextMenu();
      this.onEditNode(this.selectedLi, dom.model(this.selectedLi));
    });
  } else {
    this.buttonEdit.remove();
  }

  if (this.onRemoveNode) {
    dom.bind(this.buttonDelete, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hideContextMenu();
      this.onRemoveNode(this.selectedLi, dom.model(this.selectedLi));
    });
  } else {
    this.buttonDelete.remove();
  }
  if (this.onAddNode) {
    dom.bind(this.buttonAdd, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hideContextMenu();
      this.onAddNode(this.selectedLi, dom.model(this.selectedLi));
    });
  } else {
    this.buttonAdd.remove();
  }
}

TreeView.prototype.createNodeElement = function(data, level) {
  level = level || 0;
  let viewModel = {
    ...data,
    left: 16 * (level),
    level: level,
    text: data[this.fieldText],
  };
  let ret = dom.templatize(`
    <li widget-model-level="{{level}}" class="list-group-item p-0 b-a-0">
      <div class="full-width">
        <div class="d-flex full-width" style="line-height: 32px; margin-left: {{left}}px;">
          <a widget-id="buttonExpand" class="btn-link pointer ml-2 mr-1">
            <i widget-id="widgetIcon" class="far text-success font-14 fa-plus-square"></i>
          </a>
          <div widget-id="widgetText" class="full-width" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-height: 32px;">
          </div>
        </div>
        <ul class="list-group full-width border-less" style="display: none; /*margin-left: {{left}}px!important;*/"></ul>
      </div>
    </li>
  `, viewModel);
  // 自定义节点
  let nodeEl = this.doCreateNode(data);
  let widgetText = dom.find('[widget-id=widgetText]', ret);
  widgetText.appendChild(nodeEl);
  if (this.styles.node) {
    ret.style += ';' + this.styles.node;
    dom.find('[widget-id=widgetIcon]', ret).style += ';' + this.styles.node;
  }
  dom.model(ret, data);
  let buttonExpand = dom.find('[widget-id=buttonExpand]', ret);
  if ((level + 1) == this.levels) {
    buttonExpand.style.visibility = 'hidden';
  } else if (!data.children || data.children.length == 0) {
    buttonExpand.style.visibility = 'hidden';
  } else {
    let model = {};
    model[this.fieldParent] = data[this.fieldValue];
  }
  buttonExpand.onclick = this.collapseOrExpand;

  let model = {};
  model[this.fieldValue] = data[this.fieldValue];
  model[this.fieldText] = data[this.fieldText];
  if (data[this.fieldParent])
    model[this.fieldParent] = data[this.fieldParent];

  if (this.onSelectNode) {
    dom.bind(ret, 'click', ev => {
      // ev.stopPropagation();
      this.hideContextMenu();
      let li = this.activateListItem(ev);
      this.onSelectNode(li, dom.model(li));
    });
  }

  // 动态调整按钮宽度和文本宽度
  widgetText = dom.find('[widget-id=widgetText]', ret);
  widgetText.style.width = 'calc(100% - ' + widgetText + 'px)';

  if (this.dndable === true) {
    dnd.setDraggable(ret, model, (x, y, target) => {
      this.draggingNode = target;
    });
  }

  return ret;
};

/**
 * 根据数据定位树视图中的元素。
 *
 * @deprecated
 */
TreeView.prototype.locateElement = function(data, parentElement) {
  parentElement = parentElement || this.container;
  let ul = parentElement.querySelector('ul');
  let lis = ul.querySelectorAll('li');

  for (let i = 0; i < lis.length; i++) {
    let li = lis[i];
    let model = dom.model(li);
    if (data[this.fieldValue] === model[this.fieldValue]) {
      return li;
    }
    let ret = this.locateElement(data, li);
    if (ret != null) {
      return ret;
    }
  }
  return null;
};

TreeView.prototype.locateNode = function(data, parentElement) {
  parentElement = parentElement || this.container;
  let ul = parentElement.querySelector('ul');
  let lis = ul.querySelectorAll('li');

  for (let i = 0; i < lis.length; i++) {
    let li = lis[i];
    let model = dom.model(li);
    if (data[this.fieldValue] === model[this.fieldValue]) {
      return li;
    }
    let ret = this.locateNode(data, li);
    if (ret != null) {
      return ret;
    }
  }
  return null;
};

TreeView.prototype.fetchChildren = async function(parentElement, params, level) {
  if (!this.childUrl) return;
  let url = this.childUrl;
  let fixedParams = level > 0 ? this.childParams : this.rootParams;
  let data = await xhr.promise({
    url: url,
    params: {
      ...fixedParams,
      ...params,
    },
  });
  for (let i = 0; i < data.length; i++) {
    this.appendNode(data[i], level, parentElement);
  }
};

TreeView.prototype.collapseOrExpand = function (ev) {
  ev.preventDefault();
  ev.stopPropagation();

  let a = dom.ancestor(ev.currentTarget, 'a');
  let div = a.parentElement.parentElement;
  let ul = div.querySelector('ul');

  let icon = a.children[0];
  if (icon.classList.contains('fa-plus-square')) {
    icon.classList.remove('fa-plus-square');
    icon.classList.add('fa-minus-square');
    ul.style.display = '';
    // if (ul.children.length == 0)
    // ul.innerHTML = '';
    // this.fetchChildren(ret, dom.model(a), level + 1);
  } else {
    icon.classList.remove('fa-minus-square');
    icon.classList.add('fa-plus-square');
    ul.style.display = 'none';
  }
};

TreeView.prototype.updateParent = function(parentElement) {
  let ul = parentElement;
  let div = ul.parentElement;
  let buttonExpand = div.querySelector('[widget-id=buttonExpand]');
  if (div == this.container) return;
  if (ul.children.length == 0) {
    buttonExpand.style.visibility = 'hidden';
  } else {
    buttonExpand.style.visibility = '';
  }
  buttonExpand.onclick = this.collapseOrExpand;
};

/**
 * 递归添加、渲染数据到树节点或者新增节点。
 *
 * @public
 */
TreeView.prototype.appendNode = function(nodeData, level, parentElement) {
  parentElement = parentElement || this.container;
  let ul = parentElement.querySelector('ul');
  let lis = ul.querySelectorAll('li');
  let li = this.createNodeElement(nodeData, level);

  nodeData.children = nodeData.children || [];
  let pos = null;
  for (let li of lis) {
    if (li.innerText.localeCompare(nodeData[this.fieldText]) == 1) {
      pos = li;
      break;
    }
  }
  if (pos == null) {
    ul.appendChild(li);
    this.updateParent(li.parentElement);
  } else {
    ul.insertBefore(li, pos);
  }
  for (let i = 0; i < nodeData.children.length; i++) {
    let childData = nodeData.children[i];
    childData.level = nodeData.level + 1;
    let childParentElement = li.children[0];
    this.appendNode(childData, level + 1, childParentElement);
  }
};

TreeView.prototype.appendOrUpdateNode = function (nodeData) {
  let node = this.locateNode(nodeData);
  let ul = this.container.querySelector('ul');
  let li = ul.querySelector('[' + utils.nameAttr(this.fieldValue) + '="' + nodeData[this.fieldValue] + '"]');
  if (li != null) {
    // update
    li.querySelector('strong').innerText = nodeData[this.fieldText];
    dom.model(li, nodeData);
    return;
  }
  li = this.container.querySelector('li[' + utils.nameAttr(this.fieldValue) + '="' + nodeData[this.fieldParent] + '"]');
  if (li == null) {
    this.appendNode(nodeData, 0);
    return;
  }
  let level = parseInt(li.getAttribute('widget-model-level'));
  this.appendNode(nodeData, level + 1, li);
};

TreeView.prototype.removeNode = function (nodeData) {
  let li = this.locateNode(nodeData);
  if (li != null) {
    let ul = li.parentElement;
    li.remove();
    this.updateParent(ul);
  }
};

TreeView.prototype.insertNode = function (parentElement, nodeData) {
  parentElement = parentElement || this.container;
  let ul = dom.find('ul', parentElement);
  let lis = ul.querySelectorAll('li');

};

TreeView.prototype.render = async function(containerId, params) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  let data = [];
  if (this.rootUrl) {
    data = await xhr.promise({
      url: this.rootUrl,
      params: {
        ...this.rootParams,
        ...params,
      },
    });
  } else if (this.local) {
    data = this.local;
  }

  // the root ul
  let ul = dom.create('ul', 'list-group');
  if (this.dndable === true) {
    dnd.setDroppable(ul, (x, y, data) => {
      let rect = this.container.getBoundingClientRect();
      let closest = document.elementFromPoint(rect.left + x, rect.top + y);
      let droppingNode = dom.ancestor(closest, 'li');
      if (droppingNode == null) {
        return;
      }
      let draggingModel = dom.model(this.draggingNode);
      this.appendNode(draggingModel, parseInt(droppingNode.getAttribute('widget-model-level')) + 1, droppingNode);
      if (this.onDropNode) {
        this.onDropNode(draggingModel, dom.model(droppingNode));
      }
      this.draggingNode.remove();
      this.draggingNode = null;
    });
  }
  this.container.appendChild(ul);
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    this.appendNode(row, 0, this.container);
  }

  if (this.contextable !== false) {
    this.container.appendChild(this.contextMenu);
    this.container.oncontextmenu = ev => {
      ev.preventDefault();
      this.showContextMenu(ev);
    };
    this.container.onclick = ev => {
      this.hideContextMenu();
    };
  }
};

/**
 * 激活显示列表项目。
 */
TreeView.prototype.activateListItem = function (ev) {
  let li = dom.ancestor(ev.target, 'li');
  let actives = this.container.querySelectorAll('.list-group-item-action.active');
  actives.forEach((el, idx) => { el.classList.remove('active') });
  let div = li.querySelector('.list-group-item-action');
  if (div != null) {
    div.classList.add('active');
  }
  return li;
};

/**
 * 显示右键菜单。
 */
TreeView.prototype.showContextMenu = function (ev) {
  let rect = this.container.getBoundingClientRect();
  if (ev.pageX < rect.left || ev.pageX > (rect.left + rect.width)) {
    return;
  }
  if (ev.pageY < rect.top || ev.pageY > (rect.top + rect.height)) {
    return;
  }
  this.contextMenu.style.display = 'block';
  this.contextMenu.style.left = (ev.pageX - rect.left + 10) + "px";
  this.contextMenu.style.top = (ev.pageY - rect.top + 25) + "px";
  let closest = document.elementFromPoint(ev.clientX, ev.clientY);
  let li = dom.ancestor(closest, 'li');
  if (li == null) {
    return;
  }
  this.selectedLi = li;
  // 会触发TreeView的onSelectNode方法
  if (this.onSelectNode) {
    this.onSelectNode(this.selectedLi, dom.model(this.selectedLi));
  }
  // this.activateListItem(ev);
};

TreeView.prototype.hideContextMenu = function (ev) {
  this.contextMenu.style.display = 'none';
};



function TreelikeList(opts) {
  this.itemCount = opts.itemCount || 6;
  this.filterRoot = opts.filters.root;
  this.filterChild = opts.filters.child;

  this.name = opts.name;
  this.params = opts.params || {};

  this.checkable = opts.checkable || false;
  this.filterable = opts.filterable || false;

  this.fieldId = opts.fields.id;
  this.fieldName = opts.fields.name;
  this.fieldParentId = opts.fields.parentId;
  this.fieldChildId = opts.fields.childId;
  this.fieldChildName = opts.fields.childName;

  this.urlRoot = opts.url.root;
  this.urlChild = opts.url.child;
  if (opts.usecase) {
    this.usecaseRoot = opts.usecase.root || '';
    this.usecaseChild = opts.usecase.child;
  }

  this.observableChecked = new rxjs.Subject();
  this.observableSelected = new rxjs.Subject();
}

TreelikeList.prototype.top = function() {
  let self = this;
  let div = dom.element(`
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text font-16 text-primary" style="border-bottom-left-radius: unset; cursor: pointer;">
          <i class="far fa-minus-square"></i>
        </span>
        <span class="input-group-text font-16 text-primary" style="cursor: pointer;">
          <i class="far fa-square"></i>
        </span>
        <span class="input-group-text text-primary" style="border-bottom-left-radius: unset; cursor: pointer;">
          <i class="fas fa-undo-alt"></i>
        </span>
      </div>
      <input class="form-control" placeholder="搜索关键字">
      <div class="input-group-append">
        <span class="input-group-text" style="border-bottom-right-radius: unset;">
          <i class="fas fa-asterisk icon-required"></i>
        </span>
      </div>
    </div>
  `);
  // check or uncheck all
  let buttonCheck = div.firstElementChild.children[1];
  dom.bind(buttonCheck, 'click', event => {
    let icon = buttonCheck.querySelector('i');
    if (icon.classList.contains('fa-check-square')) {
      icon.classList.remove('fa-check-square');
      icon.classList.add('fa-square');
      self.container.querySelectorAll('input').forEach(checkbox => {
        checkbox.checked = false;
      });
    } else {
      icon.classList.remove('fa-square');
      icon.classList.add('fa-check-square');
      self.container.querySelectorAll('input').forEach(checkbox => {
        checkbox.checked = true;
      });
    }
  });
  // expand or collapse tree
  let buttonExpand = div.firstElementChild.children[0];
  dom.bind(buttonExpand, 'click', event => {
    let icon = buttonExpand.querySelector('i');
    if (icon.classList.contains('fa-minus-square')) {
      icon.classList.remove('fa-minus-square');
      icon.classList.add('fa-plus-square');
    } else {
      icon.classList.remove('fa-plus-square');
      icon.classList.add('fa-minus-square');
    }
  });
  // restore check to initial state
  let buttonRestore = div.firstElementChild.children[2];
  dom.bind(buttonExpand, 'click', event => {

  });
  return div;
};

TreelikeList.prototype.root = function(data) {
  let self = this;
  let ret = dom.create('div');
  if (this.filterable) {
    ret.appendChild(this.top());
  }

  if (typeof data === 'undefined') data = [];
  let ul = document.createElement('ul');
  ul.classList.add('list-group');
  let i = 0;
  for (i = 0; i < data.length; i++) {
    let item = data[i];
    this.appendItem(ul, item, 0);
  }

  let listContainer = dom.create('div');
  listContainer.style.overflowY = 'auto';
  listContainer.style.overflowX = 'hidden';
  listContainer.style.maxHeight = (35 * this.itemCount + 1) + 'px';
  listContainer.appendChild(ul);

  ret.appendChild(listContainer);
  return ret;
};

TreelikeList.prototype.appendItem = function(ul, item, level) {
  let self = this;
  let li = document.createElement('li');
  li.classList.add('list-group-item', 'list-group-item-action', 'form-check', 'form-check-inline', 'pointer');
  li.style.marginRight = '0';
  li.style.height = '36px';
  li.style.paddingLeft = 10.5 + 22 * level + 'px';
  li.style.paddingTop = '7px';
  li.style.paddingBottom = '7px';
  if (this.readonly)
    li.style.backgroundColor = 'rgb(240, 243, 245)';

  if (ul.children.length == 0) {
    li.style.borderTopLeftRadius = 'unset';
    li.style.borderTopRightRadius = 'unset';
    li.style.borderTop = 'none';
  }

  li.setAttribute('data-tree-item-level', level);
  if (item[this.fieldChildId]) {
    li.setAttribute('data-tree-item-parent-id', item[this.fieldParentId]);
    li.setAttribute('data-tree-item-id', item[this.fieldChildId]);
  } else {
    if (level != 0)
      li.setAttribute('data-tree-item-parent-id', item[this.fieldParentId]);
    li.setAttribute('data-tree-item-id', item[this.fieldId]);
  }

  let expand = dom.create('a', 'text-primary', 'font-16', 'mr-2');
  expand.innerHTML = '<i class="far fa-minus-square position-relative" style="top: 1px;"></i>';
  dom.bind(expand, 'click', function (event) {
    self.expandItem(li);
  });

  let check = dom.create('input', 'form-check-input', 'pointer', 'checkbox', 'color-info', 'is-outline');
  check.disabled = self.readonly;

  check.setAttribute('name', this.name);
  check.setAttribute('type', 'checkbox');
  if (item[this.fieldChildId]) {
    check.value = item[this.fieldChildId];
  } else {
    check.value = item[this.fieldId];
  }
  check.setAttribute('data-tree-item-state', 'none');
  dom.model(check, item);

  let label = document.createElement('label');
  label.classList.add('form-check-label', 'pointer');
  if (item[this.fieldChildId]) {
    label.textContent = item[this.fieldChildName];
  } else {
    label.textContent = item[this.fieldName];
  }

  if (!this.readonly) {
    li.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (ev.target.tagName == 'INPUT') {
        let check = ev.target;
        check.setAttribute('style', 'background: transparent!important;')
        let state = check.getAttribute('data-tree-item-state');
        if (state == 'none' || state == 'some') {
          // check all children
          self.checkItem(dom.ancestor(ev.target, 'li'), true);
          check.setAttribute('data-tree-item-state', 'all');
          check.checked = true;
        } else {
          // uncheck all children
          self.checkItem(dom.ancestor(ev.target, 'li'), false);
          check.setAttribute('data-tree-item-state', 'none');
          check.checked = false;
        }
        self.changeParentItem(li);
        // publish
        self.publishObservableChecked();
      } else if (ev.target.tagName == 'LI') {
        let li = ev.target;
        for (let i = 0; i < li.parentElement.children.length; i++)
          li.parentElement.children[i].classList.remove('active');
        li.classList.add('active');
      }
    });
  }

  li.append(expand);
  li.append(check);
  li.append(label);

  ul.append(li);

  if (!item.children || item.children.length == 0) {
    expand.classList.remove('text-primary');
    expand.classList.add('text-transparent');
  }

  item.children = item.children || [];
  for (let i = 0; i < item.children.length; i++) {
    this.appendItem(ul, item.children[i], level + 1);
  }
};

TreelikeList.prototype.changeParentItem = function (li) {
  let parentId = li.getAttribute('data-tree-item-parent-id');
  if (!parentId || parentId == '') return;
  let ul = li.parentElement;
  for (let i = 0; i < ul.children.length; i++) {
    let liChild = ul.children[i];
    let id = liChild.getAttribute('data-tree-item-id');
    if (id == parentId) {
      let state = this.getChildStates(liChild);
      let check = dom.find('input', liChild);
      if (state == 'none') {
        check.checked = false;
        check.setAttribute('style', 'background: transparent!important;')
      } else if (state == 'all') {
        check.checked = true;
        check.setAttribute('style', 'background: transparent!important;')
      } else {
        check.checked = true;
        check.setAttribute('style', 'background: #ababab!important;')
      }
      check.setAttribute('data-tree-item-state', state);
      this.changeParentItem(liChild);
      break;
    }
  }
};

TreelikeList.prototype.getChildStates = function (li) {
  let ul = dom.find('ul', this.container);
  let start = false;
  let level = li.getAttribute('data-tree-item-level');
  let checkedOne = false;
  let uncheckedOne = false;
  // check children
  for (let i = 0; i < ul.children.length; i++) {
    let liChild = ul.children[i];
    if (liChild.getAttribute('data-tree-item-id') == li.getAttribute('data-tree-item-id')) {
      start = true;
      continue;
    }
    if (start) {
      let levelChild = liChild.getAttribute('data-tree-item-level');
      if (levelChild > level) {
        if (dom.find('input', liChild).checked) checkedOne = true;
        else uncheckedOne = true;
      } else {
        break;
      }
    }
  }
  if (uncheckedOne && checkedOne) return 'some';
  if (checkedOne) return 'all';
  return 'none';
};

TreelikeList.prototype.expandItem = function(li) {
  let ul = li.parentElement;
  let level = parseInt(li.getAttribute('data-tree-item-level'));
  let expand = dom.find('i', li);
  if (expand.classList.contains('fa-minus-square')) {
    expand.classList.remove('fa-minus-square');
    expand.classList.add('fa-plus-square');

    let liNext = li.nextSibling;
    while (liNext) {
      let levelNext = parseInt(liNext.getAttribute('data-tree-item-level'));
      if (level >= levelNext) break;
      liNext.classList.remove('show');
      liNext.classList.add('hide');
      liNext = liNext.nextSibling;
    }
  } else {
    expand.classList.remove('fa-plus-square');
    expand.classList.add('fa-minus-square');

    let liNext = li.nextSibling;
    while (liNext) {
      let levelNext = parseInt(liNext.getAttribute('data-tree-item-level'));
      if (level == levelNext) break;
      if (level + 1 == levelNext) {
        liNext.classList.remove('hide');
        liNext.classList.add('show');
        dom.find('i', liNext).classList.remove('fa-minus-square');
        dom.find('i', liNext).classList.add('fa-plus-square');
      }
      liNext = liNext.nextSibling;
    }
  }
};

TreelikeList.prototype.checkItem = function(li, state) {
  let ul = dom.find('ul', this.container);
  let start = false;
  let level = li.getAttribute('data-tree-item-level');
  // check children
  for (let i = 0; i < ul.children.length; i++) {
    let liChild = ul.children[i];
    if (liChild.getAttribute('data-tree-item-id') == li.getAttribute('data-tree-item-id')) {
      start = true;
      continue;
    }
    if (start) {
      let levelChild = liChild.getAttribute('data-tree-item-level');
      if (levelChild > level) {
        let input = dom.find('input', liChild);
        input.checked = state;
      } else {
        break;
      }
    }
  }
};

TreelikeList.prototype.render = function(selector, values) {
  if (typeof selector === 'string') {
    this.container = document.querySelector(selector);
  } else {
    this.container = selector;
  }
  let self = this;
  let params = {};
  utils.clone(this.filterRoot, params);
  utils.clone(this.params, params);
  params._field_id = this.fieldId;
  params._field_parent_id = this.fieldParentId;
  xhr.post({
    url: this.urlRoot,
    usecase: this.usecaseRoot,
    data: params,
    success: function(resp) {
      self.container.appendChild(self.root(resp.data));
      self.setValues(values);
    }
  });
};

TreelikeList.prototype.publishObservableChecked = function() {
  let checked = [];
  this.container.querySelectorAll('input').forEach(checkbox => {
    if (checkbox.checked) {
      checked.push(dom.model(checkbox));
    }
  });
  this.observableChecked.next(checked);
};

TreelikeList.prototype.setValues = function(values) {
  if (!values) return;
  let lis = this.container.querySelectorAll('li');
  for (let i = 0; i < values.length; i++) {
    let val = values[i];
    for (let j = 0; j < lis.length; j++) {
      let li = lis[j];
      let input = dom.find('input', li);
      if (val[this.fieldId] === input.value) {
        input.checked = true;
        input.setAttribute('data-tree-item-state', 'all');
        break;
      }
    }
  }
};



/**
 *
 * @param opts
 *
 * @constructor
 */
function TreelikeTable(opts) {
  let self = this;
  // 数据来源链接
  if (typeof opts.url === 'object') {
    this.url = opts.url.root;
    this.urlChild = opts.url.child;
  } else {
    this.url = opts.url;
  }
  if (typeof opts.usecase === 'object') {
    this.usecase = opts.usecase.root;
    this.usecaseChild = opts.usecase.child;
  } else {
    this.usecase = opts.usecase;
  }

  this.filters = opts.params || opts.filters || {};
  this.filters.root = this.filters['root'] || {};
  this.filters.child = this.filters['child'] || {};
  // 表格显示列
  this.columns = opts.columns || [];
  // 固定的请求参数
  this.data = opts.data || opts.params || {};

  this.start = opts.start || 0;

  // the default is no pagination
  this.limit = opts.limit || -1;

  // unlimited tree node levels
  this.levels = opts.levels || -1;

  this.fieldName = opts.fields.name;
  this.fieldId = opts.fields.id;
  this.fieldParentId = opts.fields.parentId;
  this.fieldChildName = opts.fields.childName;

  this.iconCollapse = '<i class="far fa-plus-square"></i>';
  this.iconExpand = '<i class="far fa-minus-square"></i>';
  this.iconLeaf = '<i class="far" style="padding-right: 12px;"></i>';
  this.iconLoading = '<i class="fa fa-spinner fa-spin"></i>';

  this.padding = 20;

  // 绑定查询
  this.queryId = opts.queryId || null;
  if (opts.filter) {
    opts.filter.query = {
      callback: function(params) {
        self.go(1, params);
      }
    };
    // this.widgetFilter = new QueryLayout(opts.filter);
    opts.filter.table = this;
    this.queryFilter = new QueryFilter(opts.filter);
  }
}

/**
 * Gets table element as root.
 *
 * @returns {HTMLTableElement}
 */
TreelikeTable.prototype.root = function () {
  this.table = document.createElement('table');
  // 'table-outline',
  this.table.classList.add('table', 'table-hover', 'table-outline', 'mb-0');
  let thead = document.createElement('thead');
  thead.classList.add('thead-light');
  thead.style.height = '43px';
  let tr = document.createElement('tr');

  for (let i = 0; i < this.columns.length; i++) {
    let col = this.columns[i];
    let th = document.createElement('th');
    th.classList.add('text-center');
    if (col.style) {
      th.style = col.style;
    }
    th.style.verticalAlign = 'middle';
    // th.style.position = 'sticky';
    // th.style.zIndex = '900';
    th.style.top = '35px';
    th.textContent = col.title;
    tr.append(th);
  }
  thead.append(tr);

  let tbody = document.createElement('tbody');

  this.table.append(thead);
  this.table.append(tbody);
  return this.table;
};

/**
 * Requests and fetches remote data.
 *
 * @param params
 *        the http parameters
 */
TreelikeTable.prototype.request = function (params) {
  let self = this;
  params = params || {};
  if (this.widgetFilter) {
    let queryParams = this.widgetFilter.getQuery();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }
  if (this.queryFilter) {
    let queryParams = this.queryFilter.getValues();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }
  // static parameters
  for (let k in this.filters['root']) {
    params[k] = this.filters['root'][k];
  }
  // for (let k in this.filters['child']) {
  //   if (params[k]) {
  //     params[k] += ' ' + this.filters['child'][k];
  //   } else {
  //     params[k] = this.filters['child'][k];
  //   }
  // }
  // dynamic parameters from programmers
  for (let key in this.data) {
    params[key] = this.data[key];
  }
  params['start'] = this.start;
  params['limit'] = this.limit;

  params.fieldId = this.fieldId;
  params.fieldParentId = this.fieldParentId;

  // dynamic parameters from user input
  if (this.queryId != null) {
    let querydata = $('#' + this.queryId).formdata();
    for (var k in querydata) {
      params[k] = querydata[k];
    }
  }

  xhr.post({
    url: this.url,
    usecase: this.usecase,
    data: params,
    success: function (resp) {
      self.total = resp.total;

      let rows = resp.data;
      if (!rows) return;
      let tbody = self.container.querySelector('table tbody');
      tbody.innerHTML = '';
      if (rows.length == 0) {
        tbody.innerHTML = ('' +
            '<tr class="no-hover">' +
            '  <td colspan="100" class="text-center pt-4">' +
            '    <img width="48" height="48" src="img/kui/nodata.png" class="mb-2" style="opacity: 25%;">' +
            '    <p style="opacity: 40%; color: black;">没有匹配的数据</p>' +
            '  </td>' +
            '</tr>');
        return;
      }
      self.showPageNumber();
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        self.addRow(null, null, row, true);
      }
    }
  });
};

/**
 * Fetches child data.
 *
 * @param params
 */
TreelikeTable.prototype.requestChildren = function (clicked, params) {
  let self = this;
  params = params || {};
  for (let key in this.data) {
    params[key] = this.data[key];
  }
  for (let k in this.filters['child']) {
    params[k] = this.filters['child'][k];
  }
  let url = this.urlChild ? this.urlChild : this.url;
  let usecase = this.usecaseChild ? this.usecaseChild : this.usecase;
  params.start = 0;
  params.limit = -1;
  let tr = dom.ancestor(clicked, 'tr');
  clicked.innerHTML = this.iconLoading;
  xhr.post({
    url: url,
    usecase: usecase,
    data: params,
    success: function (resp) {
      let rows = resp.data;
      let sibling = tr.nextSibling;
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        // 测试用
        row[self.fieldParentId] = params[self.fieldParentId];
        if (self.fieldChildName) {
          row[self.fieldName] = row[self.fieldChildName];
        }
        self.addRow(tr, sibling, row, true);
      }
      clicked.innerHTML = self.iconExpand;
    }
  });
};

/**
 * Adds a row into table.
 *
 * @param trParent
 *        the parent <b>tr</b> dom element
 *
 * @param row
 *        the row object in data array from server side
 *
 * @param show
 *        show or hide
 *
 * @param level
 *        the tree node level
 *
 * @private
 */
TreelikeTable.prototype.addRow = function (trParent, trParentSibling, row, show) {
  let level = 0;
  if (trParent != null) {
    level = parseInt(trParent.getAttribute('data-tree-node-level')) + 1;
  }
  let self = this;

  let text = row[this.fieldName];
  let id = row[this.fieldId];
  let parentId = row[this.fieldParentId];

  let tbody = this.container.querySelector('table tbody');
  let tr = document.createElement('tr');
  tr.classList.add(show ? 'show' : 'hide');
  tr.setAttribute('data-tree-node-id', id);
  tr.setAttribute('data-tree-node-parent-id', parentId ? parentId : '');
  tr.setAttribute('data-tree-node-level', level);

  let td = document.createElement('td');
  td.style.paddingLeft = this.padding * level + 'px';

  let a = document.createElement('a');
  a.classList.add('btn', 'btn-link');

  a.addEventListener('click', function(ev) {
    if (this.innerHTML == self.iconLeaf) return;

    let trs = tbody.querySelectorAll('tr');
    for (let i = 0; i < trs.length; i++) {
      let tr = trs[i];
      let parentId = tr.getAttribute('data-tree-node-parent-id');
      if (id == parentId) {
        if (this.innerHTML == self.iconCollapse) {
          tr.classList.remove('hide');
          tr.classList.add('show');
        } else if (this.innerHTML == self.iconExpand) {
          self.hideRows(dom.ancestor(this, 'tr'));
        }
      }
    }
    if (self.limit > 0 && a.innerHTML == self.iconCollapse && true /*TODO: CHECK CHILDREN*/) {
      let tr = dom.ancestor(this, 'tr');
      let params = {};
      params[self.fieldParentId] = tr.getAttribute('data-tree-node-id');
      self.requestChildren(this, params);
      return;
    }
    if (this.innerHTML == self.iconCollapse) {
      this.innerHTML = self.iconExpand;
    } else {
      this.innerHTML = self.iconCollapse;
    }
  });

  // allow lazy loading leaves
  if (this.limit > 0 || ((typeof row.children !== 'undefined') && row.children.length > 0)) {
    a.innerHTML = this.iconCollapse;
  } else {
    a.innerHTML = self.iconLeaf;
  }
  if (this.levels > 0 && this.levels <= (level + 1))
    a.innerHTML = self.iconLeaf;

  td.append(a);
  if (this.columns[0].display) {
    this.columns[0].display(row, td);
  } else {
    let strong = dom.create('strong');
    strong.textContent = text;
    td.append(strong);
  }
  tr.append(td);

  for (let i = 1; i < this.columns.length; i++) {
    let col = this.columns[i];
    td = document.createElement('td');
    if (col.style)
      td.style = col.style;
    col.display(row, td);
    tr.append(td);
  }
  if (trParent != null) {
    tbody.insertBefore(tr, trParentSibling);
  } else {
    tbody.append(tr);
  }
  if (typeof row.children !== 'undefined') {
    let sibling = tr.nextSibling;
    for (let i = 0; i < row.children.length; i++) {
      this.addRow(tr, sibling, row.children[i], false);
    }
  }
};

TreelikeTable.prototype.hideRows = function (trParent) {
  let tbody = this.container.querySelector('table tbody');

  let levelParent = parseInt(trParent.getAttribute('data-tree-node-level'));
  let tr = trParent.nextSibling;

  while (tr != null) {
    let level = parseInt(tr.getAttribute('data-tree-node-level'));
    let curr = tr;
    tr = tr.nextSibling;
    if (level > levelParent) {
      if (this.limit > 0) {
        curr.remove();
      } else {
        curr.classList.remove('show');
        curr.classList.add('hide');
      }
    } else {
      break;
    }
  }
};

/**
 * 在指定页面元素下渲染树表。
 *
 * @param containerId
 *        页面元素标识
 *
 * @param params
 *        数据链接请求参数
 */
TreelikeTable.prototype.render = function (containerId, params) {
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';


  let table = this.root();
  this.container.appendChild(this.actionbar());
  this.container.appendChild(table);
  this.container.appendChild(this.pagination());
  let top = dom.top(this.container);
  // table.style.height = 'calc(100% - 20px - ' + top + 'px)';

  this.tbody = dom.find('tbody', this.container);
  this.tbodyPosition = this.tbody.getBoundingClientRect();

  params = params || {};
  this.request(params);
};

TreelikeTable.prototype.actionbar = function() {
  let self = this;
  let top = $('<div class="full-width d-flex overflow-hidden" style="height: 26px;"></div>');

  if (this.queryFilter) {
    top.append(this.queryFilter.getRoot());
  } else {
    top.append(dom.element('<div class="full-width"></div>'));
    // div.removeClass('d-flex');
  }

  let actions = top.get(0); // dom.create('div', 'card-header-actions', 'pt-0', 'pr-2');

  if (this.favourite) {
    let action = dom.element('' +
        '<a widget-id="toggleFavourite" class="card-header-action text-yellow">\n' +
        '  <i class="far fa-star position-relative font-16" style="top: 4px;"></i>\n' +
        '</a>');
    actions.appendChild(action);
    dom.bind(action, 'click', function() {
      let icon = dom.find('i', action);
      if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        self.go(1, {_favourite: 'true'});
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        self.go(1, {_favourite: 'false'});
      }
    });
  }

  if (this.widgetFilter) {
    let containerQuery = dom.create('div', 'card', 'widget-query', 'fade', 'fadeIn');
    this.widgetFilter.render(containerQuery);
    this.container.appendChild(containerQuery);

    let action = dom.element('' +
        '<a widget-id="toggleFilter" class="card-header-action text-primary">\n' +
        '  <i class="fas fa-filter position-relative" style="top: 4px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function() {
      let query = containerQuery;
      if (query.classList.contains('show')) {
        query.classList.remove('show');
      } else {
        query.classList.add('show');
      }
    });
    // WARNING: REPLACE BY QUERY FILTER
    // actions.appendChild(action);

  }

  if (this.group) {
    let action = dom.element('' +
        '<a widget-id="toggleGroup" class="card-header-action">\n' +
        '  <i class="fas fa-bars"></i>\n' +
        '</a>');
    actions.appendChild(action);
  }

  if (this.sort) {
    let action = dom.element('' +
        '<a widget-id="toggleSort" class="card-header-action">\n' +
        '  <i class="fas fa-sort-amount-down-alt position-relative" style="top: 4px; font-size: 17px;"></i>\n' +
        '</a>');
    actions.appendChild(action);
  }

  let action = dom.element('' +
      '<a widget-id="toggleFilter" class="card-header-action text-primary ml-2">\n' +
      '  <i class="fas fa-sync-alt position-relative" style="top: 3px;"></i>\n' +
      '</a>');
  dom.bind(action, 'click', function () {
    self.request();
  });
  actions.appendChild(action);

  return top.get(0);
};

/**
 * Displays pagination bar on the bottom of table.
 */
TreelikeTable.prototype.pagination = function () {
  let self = this;
  let div = dom.create('div', 'full-width', 'd-flex');
  // div.style.position = 'sticky';
  div.style.top = '0';
  // div.style.zIndex = 900;
  div.style.backgroundColor = 'white';

  let ul = dom.create('ul', 'pagination', 'mb-0', 'mt-2');
  ul.style.marginLeft = 'auto';
  this.firstPage = dom.create('li', 'page-item');
  let a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '首页';
  a.innerHTML = '<i class="material-icons">first_page</i>';
  dom.bind(a, 'click', function() {
    self.go(1);
  });

  this.firstPage.appendChild(a);
  ul.appendChild(this.firstPage);

  this.prevPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '上一页';
  a.innerHTML = '<i class="material-icons">chevron_left</i>';
  dom.bind(a, 'click', function() {
    self.prev();
  });
  this.prevPage.appendChild(a);
  ul.appendChild(this.prevPage);

  li = dom.create('li', 'page-item', 'disabled');
  this.pagebar = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  this.pagebar.setAttribute('href', 'javascript:void(0)');
  this.pagebar.style.cursor = 'default';
  this.pagebar.style.height = '30px';
  this.pagebar.style.lineHeight = '30px';
  this.pagebar.style.paddingBottom = '0px';
  this.pagebar.innerText = "0/0";
  li.appendChild(this.pagebar);
  ul.appendChild(li);

  this.nextPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '下一页';
  a.innerHTML = '<i class="material-icons">chevron_right</i>';
  dom.bind(a, 'click', function () {
    self.next();
  });
  this.nextPage.appendChild(a);
  ul.appendChild(this.nextPage);

  this.lastPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '末页';
  a.innerHTML = '<i class="material-icons">last_page</i>';
  dom.bind(a, 'click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.appendChild(a);
  ul.append(this.lastPage);

  if (this.limit > 0) {
    div.appendChild(ul);
  }
  return div;
};

/**
 * Gets last page number of result.
 *
 * @returns {number} the last page number
 */
TreelikeTable.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  let remain = this.total % this.limit;
  if (remain == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Turns to the previous page.
 */
TreelikeTable.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
TreelikeTable.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the specific number.
 *
 * @param {number} page
 *        the page number
 */
TreelikeTable.prototype.go = function (page, params) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.start = this.limit * (page - 1);
  this.request(params);
};

/**
 * Shows the page number in the page bar and controls each link status.
 *
 * @private
 */
TreelikeTable.prototype.showPageNumber = function () {
  let pagenum = this.start / this.limit + 1;
  let lastpagenum = this.lastPageNumber();
  let total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.innerHTML = pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录";
  this.firstPage.classList.remove('disabled');
  this.prevPage.classList.remove('disabled');
  this.nextPage.classList.remove('disabled');
  this.lastPage.classList.remove('disabled');
  if (pagenum == 1) {
    this.firstPage.classList.add('disabled');
    this.prevPage.classList.add('disabled');
  }
  if (pagenum == this.lastPageNumber()) {
    this.nextPage.classList.add('disabled');
    this.lastPage.classList.add('disabled');
  }
};

/**
 * Replaces a single row in table list.
 *
 * @param row
 *        the row data after saving
 *
 * @since 3.0
 */
TreelikeTable.prototype.replaceRow = function (row) {
  let rowId = row[this.fieldId];
  let tr = dom.find('tr[data-tree-node-id="' + rowId + '"]', this.container);
  if (tr == null) return false;
  for (let i = 0; i < this.columns.length; i++) {
    if (i == 0) {
      let td = dom.find('td:first-child', tr);
      let strong = dom.find('strong', td);
      strong.textContent = row[this.fieldName];
    } else {
      let td = dom.find('td:nth-child(' + (i + 1) + ')', tr);
      td.innerHTML = '';
      this.columns[i].display(row, td);
    }
  }
  return true;
};

TreelikeTable.prototype.getRowAt = function(x, y) {
  let position = this.tbody.getBoundingClientRect();
  let top = position.y - this.tbodyPosition.y;

  let ret = document.elementFromPoint(x, y + top + dom.top(this.container));
  return ret;
};

function WeeklyTable(opts) {
  this.datable = opts.datable !== false;

  this.now = moment();
  this.weekday = this.now.day();
}

WeeklyTable.prototype.render = function(containerId) {
  this.container = dom.find(containerId);
};



function Wizard(opt) {
  let self = this;
  this.topic = opt.topic;
  this.steps = opt.steps || [];
  this.root = dom.element(`
    <div>
      <div class="ui ordered steps m-b-0">
      </div>
      <div class="tab-content">
      </div>
    </div>
  `);
}

Wizard.prototype.render = function(containerId, params) {
  this.container = dom.find(containerId);
  this.body = dom.find('div.tab-content', this.root);
  let elSteps = dom.find('div.steps', this.root);
  for (let i = 0; i < this.steps.length; i++) {
    let step = this.steps[i];
    let elStep = dom.element(`
      <div class="step" widget-on-render="" data-step="${i}" style="cursor: pointer;">
        <div class="content">
          <div class="title"></div>
          <div class="description"></div>
        </div>
      </div>
    `);
    step.index = i;
    if (step.active) {
      this.current = step;
    }
    if (this.current == null) {
      elStep.classList.add('completed');
    }
    dom.find('div.title', elStep).innerHTML = step.title;
    dom.find('div.description', elStep).innerHTML = step.description;
    elSteps.appendChild(elStep);
  }
  this.container.appendChild(this.root);

  this.display(this.current);
};

Wizard.prototype.display = function(current) {
  let self = this;
  let elStep = dom.find('div.step[data-step="' + current.index + '"]', this.root);
  elStep.classList.remove('completed');
  elStep.classList.add('active');

  let existing = false;
  for (let i = 0; i < this.body.children.length; i++) {
    let child = this.body.children[i];
    if (child.getAttribute('data-page-url') == current.url) {
      existing = true;
      child.classList.add('active');
    } else {
      child.classList.remove('active');
    }
  }

  if (existing) return;

  let tab = dom.create('div', 'tab-pane', 'active');
  this.body.appendChild(tab)
  ajax.view({
    url: current.url,
    page: current.page,
    containerId: tab,
    success: function(resp) {
      self.body.children[self.body.children.length - 1].setAttribute('data-page-url', current.url);
    }
  });
};

/**
 * Completes the current step.
 */
Wizard.prototype.commit = function () {
  let elStep = dom.find('div.step.active', this.root);
  let index = parseInt(elStep.getAttribute('data-step'));
  elStep.classList.remove('active');
  elStep.classList.add('completed');
  this.display(this.steps[index + 1]);
};

Wizard.prototype.rollback = function () {
  let elStep = dom.find('div.step.active', this.container);
  let index = parseInt(elStep.getAttribute('data-step'));
  elStep.classList.remove('active');
  this.display(this.steps[index - 1]);
};

function Checklist(opts) {
  opts.fields = opts.fields || {};
  this.url = opts.url;
  this.title = opts.title;
  this.name = opts.name;
  this.fieldId = opts.fields.id;
  this.text = opts.fields['text'];
  this.value = opts.fields['value'];
  this.selections = opts.selections || [];
  this.data = opts.data || {};
  this.click = opts.click || function () {};
  this.usecase = opts.usecase || '';
  this.readonly = opts.readonly == true;
  this.searchable = (typeof opts.searchable === 'undefined') ? true : opts.searchable;
}

Checklist.prototype.request = function (containerId) {
  if (typeof containerId  === 'string') {
    this.container = dom.find(containerId);
  } else {
    this.container = containerId;
  }
  this.container.style.overflowY = 'auto';
  this.container.innerHTML = '';
  let self = this;
  if (this.url) {
    xhr.post({
      url: this.url,
      usecase: this.usecase,
      data: this.data,
      success: function (resp) {
        self.container.appendChild(self.root(resp.data));
      }
    });
  } else {
    self.container.appendChild(self.root(this.data));
  }
};

Checklist.prototype.getSelections = function() {
  let ret = [];
  let listItems = this.container.querySelectorAll('li');
  for (let i = 0; i < listItems.length; i++) {
    let li = listItems[i];
    let checkbox = li.querySelector('input');
    if (checkbox.checked) {
      let obj = {};
      obj[this.name] = checkbox.getAttribute('data-id');
      ret.push(obj);
    }
  }
  return ret;
};

Checklist.prototype.uncheckAll = function() {
  let ret = [];
  let listItems = this.container.querySelectorAll('li');
  for (let i = 0; i < listItems.length; i++) {
    let li = listItems[i];
    let checkbox = li.querySelector('input');
    checkbox.checked = false;
  }
  return ret;
};

Checklist.prototype.setSelections = function(selections) {
  let listItems = this.container.querySelectorAll('li');
  for (let i = 0; i < listItems.length; i++) {
    let li = listItems[i];
    let checkbox = li.querySelector('input');
    for (let j = 0; j < selections.length; j++) {
      let sel = selections[j];
      if (sel[this.value] == checkbox.getAttribute('data-id')) {
        checkbox.checked = true;
        break;
      }
    }
  }
};

Checklist.prototype.top = function() {
  let div = dom.element(`
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text font-16 text-primary" style="border-bottom-left-radius: unset; cursor: pointer;">
          <i class="far fa-square"></i>
        </span>
        <span class="input-group-text text-primary" style="border-bottom-left-radius: unset; cursor: pointer;">
          <i class="fas fa-undo-alt"></i>
        </span>
      </div>
      <input class="form-control" placeholder="搜索关键字">
      <div class="input-group-append">
        <span class="input-group-text" style="border-bottom-right-radius: unset;">
          <i class="fas fa-asterisk icon-required"></i>
        </span>
      </div>
    </div>
  `);
  let buttonCheck = div.firstElementChild.firstElementChild;
  dom.bind(buttonCheck, 'click', event => {
    let icon = buttonCheck.querySelector('i');
    if (icon.classList.contains('fa-check-square')) {
      icon.classList.remove('fa-check-square');
      icon.classList.add('fa-square');
    } else {
      icon.classList.remove('fa-square');
      icon.classList.add('fa-check-square');
    }
  });
  let input = dom.find('input', div);
  dom.bind(input, 'input', ev => {
    clearTimeout(this.delaySearch);
    this.delaySearch = setTimeout(() => {
      let ul = dom.find('ul', this.container);
      let lis = ul.querySelectorAll('li');
      for (let i = 0; i < lis.length; i++) {
        let li = lis[i];
        if (!li.innerText.includes(input.value)) {
          li.style.display = 'none';
        } else {
          li.style.display = '';
        }
      }
    }, 200);
  });
  return div;
}

Checklist.prototype.root = function (data) {
  let self = this;
  let ret = dom.create('div');
  if (this.searchable === true) {
    ret.appendChild(this.top());
  }

  if (typeof data === 'undefined') data = [];
  let ul = document.createElement('ul');
  ul.classList.add('list-group');
  let i = 0;
  for (i = 0; i < data.length; i++) {
    let item = data[i];
    let li = document.createElement('li');
    li.classList.add('list-group-item', 'list-group-item-action', 'form-check', 'form-check-inline', 'pointer');
    li.style.marginRight = '0';
    li.style.height = '36px';
    li.style.paddingLeft = '10.5px';
    li.style.paddingTop = '7px';
    li.style.paddingBottom = '7px';
    if (this.readonly)
      li.style.backgroundColor = 'rgb(240, 243, 245)';

    if (i == 0 && this.searchable === true) {
      li.style.borderTopLeftRadius = 'unset';
      li.style.borderTopRightRadius = 'unset';
      li.style.borderTop = 'none';
    }

    let check = document.createElement('input');
    check.disabled = self.readonly;
    check.value = item[this.value];
    check.classList.add('form-check-input', 'pointer', 'checkbox', 'color-info', 'is-outline');
    check.setAttribute('name', this.name);
    check.setAttribute('data-id', item[this.value]);
    check.setAttribute('type', 'checkbox');
    for (let j = 0; j < this.selections.length; j++) {
      let sel = this.selections[j];
      if (sel[this.value] == item[this.value]) {
        check.setAttribute("checked", true);
        break;
      }
    }
    let label = document.createElement('label');
    label.classList.add('form-check-label', 'pointer');
    label.textContent = item[this.text];

    if (!this.readonly) {
      li.addEventListener('click', function (ev) {
        check.checked = !check.checked;
        self.click(check.checked, check.getAttribute('data-id'));
      });
      check.addEventListener('input', function (ev) {
        this.checked = !this.checked;
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      });
    }

    li.append(check);
    li.append(label);

    ul.append(li);
  }

  let listContainer = dom.create('div');
  listContainer.style.overflowY = 'auto';
  listContainer.style.overflowX = 'hidden';
  listContainer.style.maxHeight = '211px';
  listContainer.appendChild(ul);

  ret.appendChild(listContainer);
  return ret;
};

Checklist.prototype.render = function (containerId, opts) {
  if (opts) {
    this.selections = opts.selections || [];
  } else {
    this.selections = [];
  }
  this.request(containerId);
};


$.fn.checktree = function(opts) {
  let setting = {
    check: {
      enable: true,
      chkboxType: {
        "Y": "ps",
        "N": "ps"
      }
    },
    data: {
      simpleData: {
        enable: true,
        idKey: opts.fields.id,
        pIdKey: opts.fields.parentId
      },
      key: {
        name: opts.fields.name
      }
    }
  };
  this.fieldId = opts.fields.id;
  this.selections = opts.selections || [];
  let self = this;

  function setChecked(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children && nodes[i].children.length == 0) nodes[i].children = null;
      for (let j = 0; j < self.selections.length; j++) {
        if (nodes[i][self.fieldId] == self.selections[j][self.fieldId]) {
          nodes[i].checked = true;
          break;
        }
      }
      setChecked(nodes[i].children || []);
    }
  }
  opts.data.fieldId = opts.fields.id;
  opts.data.fieldParentId = opts.fields.parentId;
  xhr.post({
    url: opts.url,
    usecase: opts.usecase || '',
    data: opts.data,
    success: function (resp) {
      let nodes = resp.data;
      setChecked(nodes);
      opts.tree = $.fn.zTree.init(self, setting, nodes);
    }
  })
};

function Checktree(opts) {
  this.setting = {
    check: {
      enable: true,
      chkboxType: {
        "Y": "ps",
        "N": "ps"
      }
    },
    data: {
      simpleData: {
        enable: true,
        idKey: opts.fields.id,
        pIdKey: opts.fields.parentId
      },
      key: {
        name: opts.fields.name
      }
    },
    callback: opts.callback || {}
  };
  this.fieldId = opts.fields.id;
  this.fieldParentId = opts.fields.parentId;
  this.url = opts.url;
  this.data = opts.data;
  this.usecase = opts.usecase || '';
}

Checktree.prototype.getSelections = function () {
  return this.tree.getCheckedNodes();
};

Checktree.prototype.setSelections = function (selections, match) {
  let self = this;
  function setChecked(node) {
    for (let i = 0; i < selections.length; i++) {
      let sel = selections[i];
      if (sel[self.fieldId] == node[self.fieldId]) {
        node.checked = true;
        if (!node.children || node.children.length == 0)
          self.tree.updateNode(node, true);
        break;
      }
    }
    if (!node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      let child = node.children[i];
      setChecked(child);
    }
  }

  this.tree.getNodes().forEach((node, index) => {
    setChecked(node);
    self.tree.updateNode(node, false);
  });
};

Checktree.prototype.uncheckAll = function () {
  let self = this;

  function setUnchecked(node) {
    if (!node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      let child = node.children[i];
      node.checked = false;
      self.tree.updateNode(node, true);
      setUnchecked(child);
    }
  }

  this.tree.getNodes().forEach((node, index) => {
    node.checked = false;
    self.tree.updateNode(node, false);
    setUnchecked(node);
  });
};

Checktree.prototype.render = function (containerId, opts) {
  let self = this;
  if (opts) {
    this.selections = opts.selections || [];
  } else {
    this.selections = [];
  }
  function resetChildren(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children && nodes[i].children.length == 0) nodes[i].children = null;
      resetChildren(nodes[i].children || []);
    }
  }
  this.data.fieldId = this.fieldId;
  this.data.fieldParentId = this.fieldParentId;
  xhr.post({
    url: this.url,
    usecase: this.usecase,
    data: this.data,
    success: function (resp) {
      let nodes = resp.data;
      let container = null;
      resetChildren(nodes);
      if (typeof containerId === 'string') {
        container = $(containerId);
      } else {
        container = $(containerId);
      }
      self.tree = $.fn.zTree.init(container, self.setting, nodes);
      self.setSelections(self.selections);
    }
  })
};

const FILE_TYPE_EXCEL = '<i class="far fa-file-excel"></i>';
const FILE_TYPE_WORD = '<i class="far fa-file-word"></i>';
const FILE_TYPE_POWERPOINT = '<i class="far fa-file-powerpoint"></i>';
const FILE_TYPE_PDF = '<i class="far fa-file-pdf"></i>';
const FILE_TYPE_VIDEO = '<i class="far fa-file-video"></i>';
const FILE_TYPE_AUDIO = '<i class="far fa-file-audio"></i>';
const FILE_TYPE_IMAGE = '<i class="far fa-file-image"></i>';
const FILE_TYPE_ARCHIVE = '<i class="far fa-file-archive"></i>';
const FILE_TYPE_FILE = '<i class="far fa-file-alt"></i>';

function FileUpload(opts) {
  // upload url
  this.name = opts.name;
  this.fetchUrl = opts.url.fetch;
  this.usecase = opts.usecase;
  this.uploadUrl = opts.url.upload || '/api/v3/common/upload';
  this.local = opts.local;
  this.params = opts.params;
  this.onRemove = opts.onRemove || function (model) {};
}

FileUpload.prototype.fetch = async function (containerId) {
  if (!this.fetchUrl) {
    this.local = [];
    this.render(containerId);
    return;
  }
  let self = this;
  self.local = await xhr.promise({
    url: this.fetchUrl,
    params: self.params,
  });
  self.render(containerId);
};

FileUpload.prototype.append = function (item) {
  if (!item) return;
  let url = '';
  if (item.filepath) {
    item.filepath = item.filepath.replace('/www/', '');
  }
  url = item.filepath;
  let ul = dom.find('ul', this.container);
  let li = dom.create('li', 'list-group-item', 'list-group-item-input');
  li.style.lineHeight = '32px';

  let div = dom.templatize(`
    <div class="full-width d-flex">
      <a class="btn-link">
        <i class="far fa-file-alt mr-2"></i>
      </a>
      <span class="text-info" style="padding-bottom: 8px;">{{filename}}</span>
      <a class="btn-link ml-auto pointer">
        <i class="fas fa-trash-alt text-danger"></i>
      </a>
    </div>
  `, item);
  let link = div.children[1];
  let remove = div.children[2];
  // let link = dom.create('span', 'text-info');
  // link.style.paddingBottom = '8px';
  // link.innerText = item.filename;
  // let icon = null;
  // if (item.extension === 'xls' || item.extension === 'xlsx') {
  //   icon = dom.element(FILE_TYPE_EXCEL);
  // } else if (item.extension === 'doc' || item.extension === 'docx') {
  //   icon = dom.element(FILE_TYPE_WORD);
  // } else if (item.extension === 'ppt' || item.extension === 'pptx') {
  //   icon = dom.element(FILE_TYPE_POWERPOINT);
  // } else if (item.extension === 'pdf') {
  //   icon = dom.element(FILE_TYPE_PDF);
  // } else if (item.extension === 'png' || item.extension === 'jpg') {
  //   icon = dom.element(FILE_TYPE_IMAGE);
  // } else {
  //   icon = dom.element(FILE_TYPE_FILE);
  // }
  // icon.classList.add('mr-2');

  // li.appendChild(icon);
  // li.appendChild(link);
  li.appendChild(div);
  link.setAttribute('data-img-url', item.filepath);
  link.setAttribute('data-file-path', item.filepath);
  link.setAttribute('data-file-name', item.filename);
  link.setAttribute('data-file-type', item.type);
  link.setAttribute('data-file-size', item.size);
  link.setAttribute('data-file-ext', item.extension);
  if (item.storedFileId) {
    link.setAttribute('data-file-id', item.storedFileId);
  }

  li.setAttribute('data-file-path', item.filepath);
  li.setAttribute('data-file-name', item.filename);
  li.setAttribute('data-file-type', item.type);
  li.setAttribute('data-file-size', item.size);
  li.setAttribute('data-file-ext', item.extension);
  if (item.storedFileId) {
    li.setAttribute('data-file-id', item.storedFileId);
  }
  ul.appendChild(li);

  dom.bind(remove, 'click', ev => {
    let li = dom.ancestor(ev.target, 'li');
    let fileId = li.getAttribute('data-file-id');
    dialog.confirm('确定删除此附件？', () => {
      li.remove();
      if (this.onRemove) {
        this.onRemove(fileId);
      }
    });
  });
};

FileUpload.prototype.render = async function(containerId) {
  let self = this;
  if (typeof this.local === 'undefined') {
    await this.fetch(containerId);
    return;
  }
  if (typeof containerId === 'string')
    this.container = document.querySelector(containerId);
  else
    this.container = containerId;
  this.container.innerHTML = '';

  let div = dom.create('div', 'input-group', 'full-width');

  let input = dom.create('input', 'form-control');
  input.setAttribute('name', this.name);
  input.setAttribute('readonly', true);
  
  let fileinput = dom.create('input');
  fileinput.setAttribute('type', 'file');
  fileinput.style.display = 'none';
  let upload = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text pointer">
        <i class="fas fa-upload text-primary"></i>
      </span>
    </div>`
  );
  upload.addEventListener('click', function() {
    fileinput.click();
  });
  fileinput.addEventListener('change', function(event) {
    event.preventDefault();
    event.stopPropagation();
    input.value = fileinput.files[0].name;
    xhr.upload({
      url: self.uploadUrl,
      params: self.params,
      file: this.files[0],
      success: resp => {
        let item = resp.data;
        item.filename = this.files[0].name;
        let idx = item.filename.lastIndexOf('.');
        let ext = '';
        if (idx != -1) {
          ext = input.value.substring(input.value.lastIndexOf('.') + 1);
        }
        item.filename = item.filename.replaceAll('/www', '');
        item.type = this.files[0].type;
        item.size = this.files[0].size;
        item.extension = ext;
        self.append(item);
      }
    });
  });
  div.appendChild(fileinput);
  div.appendChild(input);
  div.appendChild(upload);
  this.container.append(div);

  let ul = dom.create('ul', 'list-group', 'full-width', 'overflow-hidden');
  this.container.appendChild(ul);
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    this.append(item);
  }
};
function ImageUpload(opts) {
  // upload url
  this.fetchUrl = opts.url.fetch;
  this.usecase = opts.usecase;
  this.uploadUrl = opts.url.upload;
  this.local = opts.local;
  this.params = opts.params;
  // 第三方拍照预留接口
  this.capture = opts.capture;
}

ImageUpload.prototype.fetch = function (containerId) {
  let self = this;
  xhr.post({
    url: this.fetchUrl,
    data: this.params || {},
    success: function (resp) {
      if (resp.error) {
        self.local = [];
      } else {
        self.local = resp.data;
      }
      self.render(containerId);
    },
    error: function () {
      self.local = [];
      self.render(containerId);
    }
  });
};

ImageUpload.prototype.append = function (item) {
  let ul = dom.find('ul', this.container);
  let li = dom.create('li', 'list-group-item', 'p-0');
  li.style.height = '100px';
  li.style.width = 'calc(98%/ 3)';
  li.style.flexGrow = '0';
  let link = dom.create('a', 'btn', 'btn-link', 'text-info', 'p-0');

  li.appendChild(link);
  ul.appendChild(li);

  let rect = li.getBoundingClientRect();

  let img = null;
  if (item.filepath) {
    let url = item.filepath.replace('/www/', '');
    link.setAttribute('data-img-url', url);
    img = dom.element('<img widget-id="widget-' + url + '" src="' + url + '">');
  } else {
    img = dom.element('<img src="' + item.imgdata + '">');
  }
  img.setAttribute('width', rect.width + 'px');
  img.setAttribute('height', rect.height + 'px');
  link.appendChild(img);

  dom.bind(link, 'click', function() {
    let url = link.getAttribute('data-img-url');
    let viewerContainer = dom.find('.viewer-container');
    if (viewerContainer != null) {
      viewerContainer.remove();
    }

    let img = dom.find('img[widget-id="widget-' + url + '"]');
    let viewer = new Viewer(img);
    viewer.show();
  });
};

ImageUpload.prototype.render = function(containerId) {
  let self = this;
  if (typeof this.local === 'undefined') {
    this.fetch(containerId);
    return;
  }
  if (typeof containerId === 'string')
    this.container = document.querySelector(containerId);
  else
    this.container = containerId;
  this.container.innerHTML = '';

  let div = dom.create('div', 'input-group', 'full-width');

  let input = dom.create('input', 'form-control');
  input.setAttribute('name', this.name);
  input.setAttribute('readonly', true);

  let fileinput = dom.create('input');
  fileinput.setAttribute('type', 'file');
  fileinput.style.display = 'none';
  let upload = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text pointer">
        <i class="fas fa-upload text-primary"></i>
      </span>
      <span class="input-group-text pointer">
        <i class="fas fa-camera text-primary"></i>
      </span>
    </div>`
  );
  // 有拍照功能
  if (!this.capture) {
    upload.children[1].remove();
  } else {
    upload.children[1].addEventListener('click', function() {
      self.capture(function(path, imgdata) {
        let params = {};
        utils.clone(self.params, params);
        params.filedata = imgdata;
        params.fileext = path.substring(path.lastIndexOf('.') + 1);
        xhr.post({
          url: '/api/v3/common/image',
          params: params,
          success: function(resp) {
            let item = resp.data;
            item.filename = item.filepath.substring(item.filepath.lastIndexOf('/') + 1);
            self.append(item);
          }
        })
      });
    });
  }
  upload.children[0].addEventListener('click', function() {
    fileinput.click();
  });
  fileinput.addEventListener('change', function(event) {
    event.preventDefault();
    event.stopPropagation();
    input.value = fileinput.files[0].name;
    xhr.upload({
      url: self.uploadUrl,
      params: self.params,
      file: this.files[0],
      success: function(resp) {
        let item = resp.data;
        item.filename = item.filepath.substring(item.filepath.lastIndexOf('/') + 1);
        self.append(item);
      }
    });
  });
  div.appendChild(fileinput);
  div.appendChild(input);
  div.appendChild(upload);
  this.container.append(div);

  let ul = dom.create('ul', 'list-group', 'full-width', 'overflow-hidden');
  ul.style.display = 'flex';
  ul.style.flexWrap = 'wrap';
  ul.style.flexDirection = 'row';
  this.container.appendChild(ul);
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    this.append(item);
  }
};
function Medias(opts) {
  this.params = opts.params || {};
  // 只读
  this.readonly = opts.readonly === true;
  this.width = opts.width || '80';
  this.height = this.width;
  // 多个还是单个
  this.multiple = opts.multiple !== false;
  // 上传的链接路径
  this.url = opts.url || '/api/v3/common/upload';
  // 读取已上传的图片的配置项
  this.fetch = opts.fetch;
  // 单个删除已上传的图片的配置项
  this.onRemove = opts.onRemove;
  // 媒体类型
  this.mediaType = opts.mediaType || 'image';
}

Medias.prototype.render = function (containerId, value) {
  this.value = value;
  this.container = dom.find(containerId);
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      let row = value[i];
      // row is object
      this.appendMedia(row);
    }
  } else if (value) {
    this.appendMedia(value);
    if (this.multiple === false)
      return;
  }
  if (this.readonly === false) {
    let plus = this.createPlusElement();
    this.container.appendChild(plus);
  }
};

Medias.prototype.createPlusElement = function () {
  if (this.mediaType == 'image') {
    this.plus = dom.templatize(`
      <div class="d-flex align-items-center justify-content-center pointer" 
                  style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
        <i class="fas fa-plus" style="color: #bbb;"></i>
        <input type="file" accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
               style="display: none">
      </div>
    `, this);
  } else {
    this.plus = dom.templatize(`
      <div class="d-flex align-items-center justify-content-center pointer" 
                  style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
        <i class="fas fa-plus" style="color: #bbb;"></i>
        <input type="file" accept="video/mp4,video/x-m4v,video/*" style="display: none">
      </div>
    `, this);
  }
  let input = dom.find('input', this.plus);
  input.onchange = ev => {
    if (!input.files || input.files.length == 0) return;
    if (!this.url) {
      this.readImageAsLocal(input.files[0]);
    } else {
      this.readImageAsRemote(input.files[0]);
    }
  };
  dom.bind(this.plus, 'click', ev => {
    input.click();
  });
  return this.plus;
};

Medias.prototype.readImageAsLocal = function (file) {
  let img = file;
  let reader = new FileReader();
  reader.onload = () => {
    if (this.mediaType === 'image') {
      this.appendImage({
        url: reader.result,
      })
    } else {
      this.appendVideoImage(file, 2);
    }
  };
  reader.readAsDataURL(img);
};

Medias.prototype.readImageAsRemote = function (file) {
  xhr.upload({
    url: this.url,
    params: {
      ...this.params,
      file: file,
    },
    success: res => {
      if (res.data) {
        res = res.data;
      }
      if (this.mediaType === 'image') {
        this.appendImage({
          imagePath: res.webpath,
        });
      } else {
        this.appendVideoImage({
          videoPath: res.webpath,
        }, 2);
      }
    },
  })
};

Medias.prototype.appendMedia = function (media) {
  if (this.mediaType === 'image') {
    if (typeof media === 'string') {
      media = {
        imagePath: media,
      }
    }
    this.appendImage(media);
  } else {
    if (typeof media === 'string') {
      media = {
        videoPath: media,
      }
    }
    this.appendVideoImage(media, 2);
  }
};

Medias.prototype.appendImage = function (img) {
  let el = dom.templatize(`
    <div class="d-flex align-items-center justify-content-center pointer position-relative" 
         style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
      <img src="{{imagePath}}" style="width: 100%; height: 100%;">
      <a widget-media-id="{{id}}" class="btn-link position-absolute" style="bottom: 0; right: 4px;">
        <i class="fas fa-trash-alt text-danger"></i>
      </a>
    </div>
  `, {...img, width: this.width});
  dom.model(el, img);

  let image = dom.find('img', el);
  dom.bind(image, 'click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.mediaType == 'image') {
      let viewer = new Viewer(image, {
        toolbar: false,
        navbar: false,
        tooltip: false,
        title: false,
      });
      viewer.show();
    } else if (this.mediaType == 'video') {
      this.play(img.videoPath);
    }
  });
  let buttonDelete = dom.find('a', el);
  if (this.readonly === false) {
    this.container.insertBefore(el, this.plus);
    dom.bind(buttonDelete, 'click', ev => {
      let model = dom.model(buttonDelete.parentElement);
      ev.preventDefault();
      ev.stopPropagation();
      buttonDelete.parentElement.remove();
      if (this.multiple === false) {
        let plus = this.createPlusElement();
        this.container.appendChild(plus);
      }
      if (this.onRemove) {
        this.onRemove(model);
      }
    });
  } else {
    buttonDelete.remove();
    this.container.appendChild(el);
  }
  if (this.multiple === false && this.plus) {
    this.plus.remove();
  }
};

Medias.prototype.appendVideoImage = function (file, secs) {
  let canvas = document.createElement('canvas');
  canvas.style.width = this.width + 'px';
  canvas.style.height = this.width + 'px';
  canvas.width = this.width * window.devicePixelRatio;
  canvas.height = this.width * window.devicePixelRatio;
  canvas.getContext("2d").scale(window.devicePixelRatio, window.devicePixelRatio);
  let me = this, video = document.createElement('video');
  video.onloadedmetadata = () => {
    if ('function' === typeof secs) {
      secs = secs(video.duration);
    }
    video.currentTime = Math.min(Math.max(0, (secs < 0 ? video.duration : 0) + secs), video.duration);
  };
  video.onseeked = ev => {
    let height = video.videoHeight;
    let width = video.videoWidth;
    let ratio = height / width;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (ratio < 1) {
      ctx.drawImage(video, 0, (this.height - this.width * ratio) / 2, this.width, this.width * ratio);
    } else {
      ratio = width / height;
      ctx.drawImage(video, (this.height - this.width * ratio) / 2, 0, this.width * ratio, this.height);
    }
    this.appendImage({
      imagePath: canvas.toDataURL('image/png'),
      videoPath: file.videoPath,
    });
    canvas.remove();
    video.remove();
  };
  video.onerror = function(e) {

  };
  // let url = URL.createObjectURL(file);
  // video.src = url;
  video.src = file.videoPath;
};

Medias.prototype.play = function (path) {
  ajax.shade({
    url: 'html/misc/video/player.html?path=' + path,
    containerId: document.body,
    success: () => {
      pagePlayer.show({
        path: path,
      });
    }
  });
};


/**
 * 报表设计器构造函数。
 * <p>
 * 参数包括：
 * 1. containerId           容器的DOM标识
 * 2. propertiesEditor      属性编辑器实例
 * 
 * @param {object} options 
 */
function Canvas(options) {
  let self = this;

  this.elements = [];
  // 页面元素
  this.containerId = options.containerId;
  this.container = document.getElementById(this.containerId);
  this.containerWidth = this.container.clientWidth;

  // 属性编辑器
  this.propertiesEditor = options.propertiesEditor;
  this.propertiesEditor.addPropertyChangedListener(this);

  this.canvas = document.createElement('canvas');
  this.canvas.style = 'width: 100%; height: 100%';
  // this.canvas.setAttribute('width', this.containerWidth);
  // this.canvas.setAttribute('height', options.canvasHeight);

  //
  // 鼠标点击，只支持删除对象
  //
  document.addEventListener('keyup', function(ev) {
    if (ev.keyCode == 46 /*DEL*/) {
      if (!self.selectedElement) return;
      for (let i = 0; i < self.elements.length; i++) {
        if (self.elements[i].model.id == self.selectedElement.model.id) {
          self.elements.splice(i, 1);
          break;
        }
      }
      self.selectedElement = null;
      self.propertiesEditor.clear();
      self.render();
      // self.drawArrow(20, 20, 200, 100, [0, 1, -10, 1, -10, 5]);
    }
  });

  // 初始化设置
  this.container.innerHTML = '';
  this.container.appendChild(this.canvas);

  let dpr = window.devicePixelRatio || 1;
  let rect = this.canvas.getBoundingClientRect();
  this.canvas.width = rect.width * dpr;
  this.canvas.height = rect.height * dpr;
  this.canvas.getContext('2d').scale(dpr, dpr);

  this.bindDragOverEventListener();
  this.bindDropEventListener(this, this.drop);
  this.bindMouseDownEventListener(this, this.select);
  this.bindMouseMoveEventListener(this, this.move);
  this.bindMouseUpEventListener();

  // 数据结构定义
  this.dragging = null;

  // 画布的其他设置

  this.render();
}

Canvas.TEXT_FONT_SIZE = 18;
Canvas.TEXT_FONT_FAMILY = '宋体';
Canvas.STROKE_STYLE_SELECTED = '#20a8d8';
Canvas.STROKE_STYLE_ALIGNMENT = '#ffc107';
Canvas.STROKE_STYLE_DEFAULT = 'black';

Canvas.prototype.unselectAll = function (element) {
  for (let i = 0; i < this.elements.length; i++)
    this.elements[i].unselect();
  this.selectedElement = null;
};

Canvas.prototype.onPropertyChanged = function (prop) {
  if (this.selectedElement == null) return;
  this.selectedElement.notifyModelChangedListeners(prop);
  this.render();
};

/**
 * 添加设计器上的对象到设计器对象对对象的管理容器。
 *
 * @param {object} obj
 *        设计器新增加的对象
 */
Canvas.prototype.addAndRenderElement = function (element) {
  element.addModelChangedListener(this.propertiesEditor);
  this.elements.push(element);

  // 显示元素的属性编辑器
  this.propertiesEditor.render(element);
  // 取消所有原有的元素
  this.unselectAll();
  this.selectedElement = element;
  // 渲染
  this.render();
};

/**
 * 添加默认的文本到画布对象中。
 * 
 * @param {string} text
 *        the text
 * 
 * @param {number} x 
 *        the coordinate x in canvas
 * 
 * @param {number} y 
 *        the coordinate y in canvas
 */
Canvas.prototype.addText = function (text, x, y) {
  let elementText = new TextElement({
    x: x,
    y: y,
    text: text,
    selected: true
  });
  // 添加文本元素
  this.addAndRenderElement(elementText);
};

Canvas.prototype.addLongtext = function (text, x, y) {
  let elementText = new LongtextElement({
    x: x,
    y: y,
    text: text,
    selected: true
  });
  // 添加文本元素
  this.addAndRenderElement(elementText);
};

Canvas.prototype.addImage = function (x, y) {
  let elementImage = new ImageElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementImage);
};

Canvas.prototype.addTable = function (x, y) {
  let elementTable = new TableElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementTable);
};

Canvas.prototype.addChart = function (x, y) {
  let elementChart = new ChartElement({
    subtype: '柱状图',
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementChart);
};

Canvas.prototype.addVideo = function (x, y) {
  let element = new VideoElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(element);
};

Canvas.prototype.addQueue = function (x, y) {
  let element = new QueueElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(element);
};

Canvas.prototype.drawGrid = function (w, h, strokeStyle, step) {
  let ctx = this.canvas.getContext('2d');
  for (let x = 0.5; x < w; x += step){
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  
  for (let y = 0.5; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
};


Canvas.prototype.render = function () {
  let ctx = this.canvas.getContext('2d');

  // 清除画布
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // 网格线
  this.drawGrid(this.canvas.width, this.canvas.height, '#eee', 10);

  // 逐个画元素（根据元素的模型数据）
  for (let i = 0; i < this.elements.length; i++) {
    let element = this.elements[i];
    element.render(ctx);
  }

  if (this.alignmentLines && this.alignmentLines.length > 0) {
    for (let i = 0; i < this.alignmentLines.length; i++) {
      let alignmentLine = this.alignmentLines[i];
      ctx.beginPath();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = Canvas.STROKE_STYLE_ALIGNMENT;
      ctx.lineWidth = 1;
      let line = alignmentLine;
      if (line.x) {
        ctx.moveTo(line.x, 0);
        ctx.lineTo(line.x, this.canvas.height);
        ctx.stroke();
      } else {
        ctx.moveTo(0, line.y);
        ctx.lineTo(this.canvas.width, line.y);
        ctx.stroke();
      }
      ctx.closePath();
      ctx.setLineDash([]);
    }
  }
};

/**
 * 
 */
Canvas.prototype.drag = function (ev) {
  let target = ev.target;
  self.dragging = target;

  self.dragX = ev.layerX;
  self.dragY = ev.layerY;

  ev.dataTransfer.setData('drag-type', ev.target.getAttribute('data-type'));
};

Canvas.prototype.drop = function (self, ev) {
  let rect = self.canvas.getBoundingClientRect();
  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  let dragType = ev.dataTransfer.getData('drag-type');
  if (dragType == 'text') {
    self.addText('这里是标题', x, y);
  } else if (dragType == 'longtext') {
    self.addLongtext('这是长文本的示例，长文本允许折行显示，适合显示描述性的文本内容。', x, y);
  } else if (dragType == 'table') {
    self.addTable(x, y);
  } else if (dragType == 'image') {
    self.addImage(x, y);
  } else if (dragType == 'chart') {
    self.addChart(x, y);
  } else if (dragType == 'video') {
    self.addVideo(x, y);
  } else if (dragType == 'queue') {
    self.addQueue(x, y);
  }
};

/**
 * 鼠标按下事件的回调函数，业务化响应鼠标按下事件。
 */
Canvas.prototype.select = function (self, ev) {
  if (ev.button != 0) return;
  let rect = self.canvas.getBoundingClientRect();
  let clickX = ev.clientX - rect.left;
  let clickY = ev.clientY - rect.top;

  // reset selected object in designer
  self.unselectAll();

  for (let i = 0; i < self.elements.length; i++) {
    let elm = self.elements[i];
    // check the mouse position is or not in the object shape.
    if (elm.select(clickX, clickY)) {
      // allow to move
      self.isMoving = true;
      self.offsetMoveX = clickX - elm.model.x;
      self.offsetMoveY = clickY - elm.model.y;
      self.selectedElement = elm;
      break;
    }
  }

  // 光标改变
  if (self.selectedElement) {
    let resizeType = self.showResizeCursor(ev);
    if (resizeType == 'none' || self.selectedElement.model.type == 'text') {
      self.isMoving = true;
      self.canvas.style.cursor = 'move';
    } else {
      self.resizeType = resizeType;
      self.isResizing = true;
    }
    self.propertiesEditor.render(self.selectedElement);
  } else {
    self.propertiesEditor.clear();
  }

  // 重新渲染，如果选择了则显示选择的边框；如果没有，则消除选择的边框
  self.render();
};

/**
 * 鼠标移动事件的回调函数，业务化的鼠标移动控制。
 */
Canvas.prototype.move = function (self, ev) {
  // 没有选择
  if (self.selectedElement == null) return;
  if (!self.isMoving && !self.isResizing) return;

  let resizeType = self.resizeType;
  
  let rect = self.canvas.getBoundingClientRect();
  let moveX = ev.clientX - rect.left;
  let moveY = ev.clientY - rect.top;

  if (resizeType == 'east') {
    let offsetX = moveX - self.selectedElement.model.x - self.selectedElement.model.width;
    self.selectedElement.model.width = self.selectedElement.model.width + offsetX;
  } else if (resizeType == 'west') {
    let offsetX = self.selectedElement.model.x - moveX;
    self.selectedElement.model.x = moveX;
    self.selectedElement.model.width = self.selectedElement.model.width + offsetX;
  } else if (resizeType == 'north') {
    let offsetY = self.selectedElement.model.y - moveY;
    self.selectedElement.model.y = moveY;
    self.selectedElement.model.height = self.selectedElement.model.height + offsetY;
  } else if (resizeType == 'south') {
    let offsetY = moveY - self.selectedElement.model.y - self.selectedElement.model.height;
    self.selectedElement.model.height = self.selectedElement.model.height + offsetY;
  } else {
    self.canvas.style.cursor = 'move';
    self.selectedElement.model.x = moveX - self.offsetMoveX;
    self.selectedElement.model.y = moveY - self.offsetMoveY;
  }
  self.selectedElement.notifyModelChangedListeners({
    x: self.selectedElement.model.x,
    y: self.selectedElement.model.y,
    width: self.selectedElement.model.width,
    height: self.selectedElement.model.height
  });

  // 渲染
  self.render();
};

/**
 *
 */
Canvas.prototype.bindDragOverEventListener = function () {
  // 拖拽到canvas上面时的事件处理函数
  this.canvas.addEventListener('dragover', function(ev) {
    ev.preventDefault();
  });
};

/**
 *
 */
Canvas.prototype.bindDropEventListener = function (self, callback) {
  // 在canvas上面释放拖拽对象时的事件处理函数
  this.canvas.addEventListener('drop', function (ev) {
    ev.preventDefault();
    callback(self, ev);
  });
};

/**
 * 绑定鼠标点击事件。
 */
Canvas.prototype.bindMouseDownEventListener = function (self, callback) {
  // 在canvas上响应鼠标按钮按下的事件处理函数
  this.canvas.addEventListener('mousedown', function(ev) {
    // 重置已经选择的对象
    self.selectedElement = null;

    // 绘制对齐辅助线
    self.getAlignmentLines();

    // 利用坐标体系算法获取当前的选择对象
    callback(self, ev);
  });
};

/**
 * 绑定鼠标移动事件的监听处理器，适用于点选了可移动的Canvas对象。
 *
 * @param {object} self
 *        继承此基类的子类的对象，用于回调函数中。
 *
 * @param {object} callback
 *        鼠标移动的回调函数。
 *
 * @since 1.0
 *
 * @version 1.1 - 增加鼠标移动到四周或者角落，调整为可以拉升的图标
 */
Canvas.prototype.bindMouseMoveEventListener = function (self, callback) {
  this.canvas.addEventListener('mousemove', function(ev) {
    let resizeType = 'none';
    if (self.selectedElement == null) {
      return;
    }
    if (!self.isMoving && !self.isResizing)  return;

    self.getAlignmentLines();
    callback(self, ev);
    if (self.selectedElement != null) {
      self.isMoving = true;
    }
  });
};

/**
 * 绑定鼠标按钮弹起事件的监听处理器，无需回调处理。
 */
Canvas.prototype.bindMouseUpEventListener = function () {
  let self = this;
  this.canvas.addEventListener('mouseup', function(ev) {
    self.isMoving = false;
    self.isResizing = false;
    self.resizeType = 'none';
    self.alignmentLine = null;
    self.canvas.style.cursor = 'default';
  });
};

/**
 * 画箭头的函数，基本功能的封装。
 */
Canvas.prototype.drawArrow = function(startX, startY, endX, endY, controlPoints) {
  let ctx = this.canvas.getContext("2d");
  ctx.beginPath();

  let dx = endX - startX;
  let dy = endY - startY;
  let len = Math.sqrt(dx * dx + dy * dy);
  let sin = dy / len;
  let cos = dx / len;
  let a = [];
  a.push(0, 0);
  for (let i = 0; i < controlPoints.length; i += 2) {
    let x = controlPoints[i];
    let y = controlPoints[i + 1];
    a.push(x < 0 ? len + x : x, y);
  }
  a.push(len, 0);
  for (let i = controlPoints.length; i > 0; i -= 2) {
    let x = controlPoints[i - 2];
    let y = controlPoints[i - 1];
    a.push(x < 0 ? len + x : x, -y);
  }
  a.push(0, 0);
  for (let i = 0; i < a.length; i += 2) {
    let x = a[i] * cos - a[i + 1] * sin + startX;
    let y = a[i] * sin + a[i + 1] * cos + startY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.fill();
};

/**
 * 利用点到线的直线距离来选取哪根线条。
 */
Canvas.prototype.showResizeCursor = function (ev) {
  let self = this;

  if (!self.selectedElement) return;

  let rect = self.canvas.getBoundingClientRect();
  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  let threshold = 10;

  let sel = self.selectedElement.model;

  let topX = sel.x;
  let topY = sel.y;
  let botX = sel.x + sel.width;
  let botY = sel.y + sel.height;

  // 顶端线条
  let distance = this.calculateVerticalDistance(x, y, topX, topY, botX, topY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 'n-resize';
    return 'north';
  }
  // 底端线条
  distance = this.calculateVerticalDistance(x, y, topX, botY, botX, botY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 's-resize';
    return 'south';
  }
  // 左侧线条
  distance = this.calculateVerticalDistance(x, y, topX, topY, topX, botY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 'w-resize';
    return 'west';
  }
  // 右侧线条
  distance = this.calculateVerticalDistance(x, y, botX, topY, botX, topY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 'e-resize';
    return 'east';
  }
  self.canvas.style.cursor = 'default';
  return 'none';
};

/**
 * 画辅助对齐线。
 */
Canvas.prototype.getAlignmentLines = function() {
  let threshold = 10;
  this.alignmentLines = [];
  if (!this.selectedElement) {
    return;
  }

  let topX = this.selectedElement.model.x;
  let topY = this.selectedElement.model.y;
  let botX = this.selectedElement.model.x + this.selectedElement.model.width;
  let botY = this.selectedElement.model.y + this.selectedElement.model.height;

  let existings = {};
  for (let i = 0; i < this.elements.length; i++) {
    let obj = this.elements[i];
    if (obj.model.id == this.selectedElement.model.id) {
      continue;
    }
    let objTopX = obj.model.x;
    let objTopY = obj.model.y;
    let objBotX = obj.model.x + obj.model.width;
    let objBotY = obj.model.y + obj.model.height;
    // left to left
    if (Math.abs(topX - objTopX) <= threshold && !existings['x-' + objTopX]) {
      this.alignmentLines.push({x: objTopX});
    }
    if (Math.abs(topX - objBotX) <= threshold && !existings['x-' + objBotX]) {
      this.alignmentLines.push({x: objBotX});
    }
    if (Math.abs(botX - objTopX) <= threshold && !existings['x-' + objTopX]) {
      this.alignmentLines.push({x: objTopX});
    }
    if (Math.abs(botX - objBotX) <= threshold && !existings['x-' + objBotX]) {
      this.alignmentLines.push({x: objBotX});
    }
    if (Math.abs(topY - objTopY) <= threshold && !existings['y-' + objTopY]) {
      this.alignmentLines.push({y: objTopY});
    }
    if (Math.abs(topY - objBotY) <= threshold && !existings['y-' + objBotY]) {
      this.alignmentLines.push({y: objBotY});
    }
    if (Math.abs(botY - objTopY) <= threshold && !existings['y-' + objTopY]) {
      this.alignmentLines.push({y: objTopY});
    }
    if (Math.abs(botY - objBotY) <= threshold && !existings['y-' + objBotY]) {
      this.alignmentLines.push({y: objBotY});
    }
  }
};

/**
 * 计算点到线的垂直距离。
 *
 * @param {number} pointX
 *        需要计算的点的X坐标
 *
 * @param {number} pointY
 *        需要计算的店的Y坐标
 *
 * @param {number} linePointX1
 *        线其中一个端点的X坐标
 *
 * @param {number} linePointY1
 *        线其中一个端点的Y坐标
 *
 * @param {number} linePointX2
 *        线其中一个端点的X坐标
 *
 * @param {number} linePointY2
 *        线其中一个端点的Y坐标
 */
Canvas.prototype.calculateVerticalDistance = function (pointX, pointY, linePointX1, linePointY1, linePointX2, linePointY2) {
  if (linePointX1 == linePointX2) {
    return Math.abs(pointX - linePointX1);
  }
  if (linePointY1 == linePointY2) {
    return Math.abs(pointY - linePointY1);
  }
  // 计算直线方程，两点式：two-point form
  // (x - x1) / (x2 - x1) = (y - y1) / (y2 - y1)
  // y = kx + b
  let xd = (linePointX1 - linePointX2);
  let b = (linePointX1 * linePointY2 - linePointX2 * linePointY1 - linePointX2 * linePointY1 + linePointX2 * linePointY2);
  let k = (linePointY1 - linePointY2);
  // TODO
};

////////////////////////////////////////////////////////////////////////////////
//
// CANVAS
//
////////////////////////////////////////////////////////////////////////////////

/**
 * 【报表基本元素】
 * @constructor
 */
function CanvasElement() {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
}

CanvasElement.prototype.isSelected = function () {
  return this.model.selected;
};

CanvasElement.prototype.select = function (x, y) {
  let model = this.model;
  this.model.selected =  (x >= model.x && x <= (model.x + model.width) && y >= model.y && y <= (model.y + model.height));
  return this.model.selected;
};

CanvasElement.prototype.unselect = function () {
  this.model.selected = false;
};

CanvasElement.prototype.render = function (context) {
  this.renderer.render(context, this);
};

CanvasElement.prototype.addModelChangedListener = function(listener) {
  this.modelChangedListeners.push(listener);
};

CanvasElement.prototype.notifyModelChangedListeners = function(model) {
  for (let key in model) {
    this.model[key] = model[key];
  }
  for (let i = 0; i < this.modelChangedListeners.length; i++) {
    this.modelChangedListeners[i].onModelChanged(model);
  }
};

////////////////////////////////////////////////////////////////////////////////
//
// TEXT
//
////////////////////////////////////////////////////////////////////////////////

/**
 * The text element on canvas.
 *
 * @param opts
 *        the options for text element
 *
 * @constructor
 */
function TextElement(opts) {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.model.fontFamily = opts.fontFamily || '宋体';
  this.model.fontSize = opts.fontSize || 18;
  this.model.fontColor = 'black';
  this.model.height = this.model.fontSize;
  this.model.type = 'text';
  this.model.id = this.model.type + '-' + moment().valueOf();
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new TextElementRenderer();
}

TextElement.typename = 'text';

TextElement.prototype.render = function(context, element) {
  let model = element.model;
  context.fillStyle = model.fontColor;
  context.font = model.font();

  model.width = context.measureText(model.text).width;

  // 文本的高度设置特殊性
  model.height = parseInt(model.fontSize);

  if (element.model.selected) {
    // 只有选择了的才能触发此逻辑，主要显示字体的调整，宽度随之调整
    element.notifyModelChangedListeners({
      width: model.width,
      height: model.height
    });
  }

  context.fillText(model.text, model.x, model.y + model.height * 0.85);

  this.renderSelected(context, model);
};

TextElement.prototype.getProperties = function () {
  return [{
    title: '显示',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 0
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 0
    }]
  },{
    title: '文本',
    properties: [{
      id: 'text',
      label: '文本',
      input: 'textarea',
      value: this.model.text || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    }]
  }];
};

Object.assign(TextElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// LONG TEXT
//
////////////////////////////////////////////////////////////////////////////////

/**
 * long text element type.
 *
 * @param opts
 * @constructor
 */
function LongtextElement(opts) {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.model.fontFamily = opts.fontFamily || '宋体';
  this.model.fontSize = opts.fontSize || 18;
  this.model.fontColor = 'black';
  this.model.height = 100;
  this.model.width = 200;
  this.model.lineSpace = 5;
  this.model.type = 'longtext';
  this.model.alignment = 'left';
  this.model.id = this.model.type + '-' + moment().valueOf();
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new LongtextElementRenderer();
}

LongtextElement.typename = 'longtext';

LongtextElement.prototype.getProperties = function () {
  return [{
    title: '显示',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 0
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 0
    }]
  },{
    title: '文本',
    properties: [{
      id: 'text',
      label: '文本',
      input: 'textarea',
      value: this.model.text || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    },{
      id: 'lineSpace',
      label: '行间距',
      input: 'range',
      unit: 'px',
      value: this.model.lineSpace || 5,
      min: '0',
      max: '20'
    }]
  },{
    title: '对齐',
    properties: [{
      id: 'alignment',
      label: '水平',
      input: 'alignment',
      value: this.model.alignment || '',
      display: function (val) {
        function handleClick(button) {
          let buttons = button.parentElement.querySelectorAll('button');
          buttons.forEach((btn) => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
          })
          button.classList.remove('btn-secondary');
          button.classList.add('btn-primary');
        }
        let buttons = document.createElement('div');
        buttons.style.display = 'block';
        buttons.classList.add('btn-group');
        let left = document.createElement('button');
        left.classList.add('btn', 'btn-sm');
        if (val == 'left') {
          left.classList.add('btn-primary');
        } else {
          left.classList.add('btn-secondary')
        }
        left.innerHTML = '<i class="fas fa-align-left"></i>';
        left.addEventListener('click', function() {
          handleClick(left);
        });
        let center = document.createElement('button');
        center.classList.add('btn', 'btn-sm');
        if (val == 'center') {
          center.classList.add('btn-primary');
        } else {
          center.classList.add('btn-secondary')
        }
        center.innerHTML = '<i class="fas fa-align-center"></i>';
        center.addEventListener('click', function() {
          handleClick(center);
        });
        let right = document.createElement('button');
        right.classList.add('btn', 'btn-sm');
        if (val == 'right') {
          right.classList.add('btn-primary');
        } else {
          right.classList.add('btn-secondary')
        }
        right.innerHTML = '<i class="fas fa-align-right"></i>';
        right.addEventListener('click', function() {
          handleClick(right);
        });

        buttons.append(left);
        buttons.append(center);
        buttons.append(right);
        return buttons;
      }
    }]
  }];
};

Object.assign(LongtextElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// IMAGE
//
////////////////////////////////////////////////////////////////////////////////

/**
 * the image element type.
 */
function ImageElement(opts) {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.type = 'image';
  this.model.width = 350;
  this.model.height = 300;
  this.model.id = this.model.type + '-' + moment().valueOf();
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new ImageElementRenderer();
}

ImageElement.typename = 'image';

ImageElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 350
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 300
    }]
  }, {
    title: '图片',
    properties: [{
      id: 'image',
      label: '图片',
      input: 'file',
      value: this.model.file || ''
    }]
  }];
};

Object.assign(ImageElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// TABLE
//
////////////////////////////////////////////////////////////////////////////////

/**
 * the table element type.
 */
function TableElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'table';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 600;
  this.model.height = 240;
  this.model.fontColor = 'black';
  this.model.fontSize = 12;
  this.model.fontFamily = Canvas.TEXT_FONT_FAMILY;
  this.model.columns =  '商品;单价;数量;总价';
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new TableElementRenderer();
}

TableElement.typename = 'table';

TableElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }, {
    title: '表格',
    properties: [{
      id: 'columns',
      label: '列',
      input: 'textarea',
      value: this.model.columns || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    }]
  }];
};

Object.assign(TableElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// CHART
//
////////////////////////////////////////////////////////////////////////////////

/**
 * the chart element type.
 */
function ChartElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'chart';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 500;
  this.model.height = 360;
  this.model.fontSize = 12;
  this.model.fontFamily = Canvas.TEXT_FONT_FAMILY;
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new ChartElementRenderer();
}

ChartElement.typename = 'chart';

ChartElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }, {
    title: '图表',
    properties: [{
      id: 'subtype',
      label: '类型',
      input: 'select',
      value: this.model.subtype || '',
      values: ['饼图','柱状图','折线图','仪表图']
    }]
  }];
};

Object.assign(ChartElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// VIDEO
//
////////////////////////////////////////////////////////////////////////////////

function VideoElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'video';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 427;
  this.model.height = 240;
  this.model.fontSize = 12;
  this.model.fontFamily = Canvas.TEXT_FONT_FAMILY;
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.model.sample = 'img/av/ad_health.mp4';
  this.renderer = new VideoElementRenderer();
}

VideoElement.typename = 'video';

VideoElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }];
};

Object.assign(VideoElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// QUEUE
//
////////////////////////////////////////////////////////////////////////////////

/**
 * the table element type.
 */
function QueueElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'table';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 360;
  this.model.height = 240;
  this.model.fontColor = 'black';
  this.model.fontSize = 12;
  this.model.fontFamily = Canvas.TEXT_FONT_FAMILY;
  this.model.columns =  '序号;姓名';
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new QueueElementRenderer();
}

QueueElement.typename = 'queue';

QueueElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }, {
    title: '表格',
    properties: [{
      id: 'columns',
      label: '列',
      input: 'textarea',
      value: this.model.columns || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    }]
  }];
};

Object.assign(QueueElement.prototype, CanvasElement.prototype);
////////////////////////////////////////////////////////////////////////////////
//
// CANVAS
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the base renderer.
 *
 * @constructor
 */
function CanvasElementRenderer() {

}

CanvasElementRenderer.prototype.renderSelected = function(context, model) {
  if (model.selected) {
    context.setLineDash([]);

    context.beginPath();
    context.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
    // left-top
    context.moveTo(model.x, model.y);
    // left-bottom
    context.lineTo(model.x, model.y + model.height);
    // right-bottom
    context.lineTo(model.x + model.width, model.y + model.height);
    // right-top
    context.lineTo(model.x + model.width, model.y);
    // left-top
    context.lineTo(model.x, model.y);
    context.stroke();
    context.closePath();
  }
};

////////////////////////////////////////////////////////////////////////////////
//
// TEXT
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for text element.
 *
 * @constructor
 */
function TextElementRenderer() {

}

TextElementRenderer.prototype.render = function(context, element) {
  let model = element.model;
  context.fillStyle = model.fontColor;
  context.font = model.font();

  model.width = context.measureText(model.text).width;

  // 文本的高度设置特殊性
  model.height = parseInt(model.fontSize);

  if (element.model.selected) {
    // 只有选择了的才能触发此逻辑，主要显示字体的调整，宽度随之调整
    element.notifyModelChangedListeners({
      width: model.width,
      height: model.height
    });
  }

  context.fillText(model.text, model.x, model.y + model.height * 0.85);

  this.renderSelected(context, model);
};

Object.assign(TextElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// LONG TEXT
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for long text element.
 *
 * @constructor
 */
function LongtextElementRenderer() {

}

LongtextElementRenderer.prototype.render = function(context, element) {
  let model = element.model;
  context.fillStyle = model.fontColor;
  context.font = model.font();

  let lineHeight = model.fontSize + model.lineSpace;
  let line = '';
  let x = model.x;
  let y = model.y + lineHeight;
  let height = 0;
  let chars = model.text.split('');
  for(let i = 0; i < chars.length; i++) {
    line += chars[i];
    let metrics = context.measureText(line);
    let testWidth = metrics.width;
    if (testWidth > model.width && i > 0) {
      context.fillText(line.substr(0, line.length - 1), x, y);
      line = chars[i];
      y += lineHeight;
      height += lineHeight;
    }
  }
  if (line != '') {
    height += lineHeight + model.lineSpace;
    context.fillText(line, x, y);
  }

  model.height = height;

  this.renderSelected(context, model);
};

Object.assign(LongtextElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// IMAGE
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for image element.
 *
 * @constructor
 */
function ImageElementRenderer() {

}

ImageElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  if (model.image) {
    let containerImage = document.getElementById('image_container');
    let img = document.getElementById(model.id);
    if (img == null) {
      let img = document.createElement('img');
      img.setAttribute('id', model.id);
      img.setAttribute('src', model.image);
      img.onload = function () {
        let sWidth = img.naturalWidth;
        let sHeight = img.naturalHeight;
        context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      };
      containerImage.append(img);
    } else {
      let sWidth = img.naturalWidth;
      let sHeight = img.naturalHeight;
      img.setAttribute('src', model.image);
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
    }
  } else {
    let img = document.getElementById(model.id);
    if (img == null) {
      img = document.getElementById('image_sample')
    }
    let sWidth = img.naturalWidth;
    let sHeight = img.naturalHeight;
    context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
  }

  this.renderSelected(context, model);
};

Object.assign(ImageElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// TABLE
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for table element.
 *
 * @constructor
 */
function TableElementRenderer() {

}

TableElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  // context.font = model.font();
  context.fillStyle = model.fontColor;

  if (model.selected) {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
  } else {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;
  }
  context.setLineDash([]);
  context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;

  // 画边框
  context.beginPath();
  // left-top
  context.moveTo(model.x, model.y);
  // left-bottom
  context.lineTo(model.x, model.y + model.height);
  // right-bottom
  context.lineTo(model.x + model.width, model.y + model.height);
  // right-top
  context.lineTo(model.x + model.width, model.y);
  // left-top
  context.lineTo(model.x, model.y);
  context.stroke();
  context.closePath();

  let columnTitles = model.columns.split(';');
  let columnCount = columnTitles.length;
  let columnWidth = parseInt(model.width / (columnCount == 0 ? 1 : columnCount));
  let headerHeight = model.fontSize * 1.25;

  // 画【列】的竖线
  for (let i = 1; i < columnCount; i++) {
    context.beginPath();
    context.moveTo(model.x + columnWidth * i, model.y);
    context.lineTo(model.x + columnWidth * i, model.y + model.height);
    context.stroke();
    context.closePath();
  }
  // 画【表头】的横线
  context.beginPath();
  context.moveTo(model.x, model.y + headerHeight);
  context.lineTo(model.x + model.width, model.y + headerHeight);
  context.stroke();
  context.closePath();
  // 画【表头】的标题
  context.font = model.font();
  for (let i = 0; i < columnCount; i++) {
    let title = columnTitles[i];
    let titleWidth = context.measureText(title).width;
    let titleX = model.x + (columnWidth - titleWidth) / 2 + columnWidth * i;
    context.fillText(title, titleX, model.y + model.fontSize * 1.0);
  }

  this.renderSelected(context, model);
};

Object.assign(TableElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// CHART
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for chart element.
 */
function ChartElementRenderer() {

}

ChartElementRenderer.options = {
  gauge: {
    animation: false,
    series: [{
      radius: '100%',
      center: ['50%', '55%'],
      name: '业务指标',
      type: 'gauge',
      detail: {formatter: '{value}%'},
      data: [{value: 75, name: '完成率'}]
    }]
  },
  bar: {
    animation: false,
    grid: {
      left: 30,
      right: 10,
      top: 10,
      bottom: 20
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }]
  },
  pie: {
    animation: false,
    title: {
      text: '',
      left: 'center'
    },
    series: [{
      name: '访问来源',
      type: 'pie',
      radius: '90%',
      center: ['50%', '50%'],
      data: [
        {value: 335, name: '直接访问'},
        {value: 310, name: '邮件营销'},
        {value: 234, name: '联盟广告'},
        {value: 135, name: '视频广告'},
        {value: 1548, name: '搜索引擎'}
      ]
    }]
  },
  line: {
    animation: false,
    grid: {
      left: 40,
      right: 10,
      top: 10,
      bottom: 20
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line'
    }]
  }
};

ChartElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  let containerImage = document.getElementById('image_container');
  let div = document.getElementById('div-' + model.id);
  let img = document.getElementById('img-' + model.id);

  let sWidth = model.width;
  let sHeight = model.height;

  if (div == null) {
    div = document.createElement('div');
    img = document.createElement('img');

    img.onload = function () {
      sWidth = img.naturalWidth;
      sHeight = img.naturalHeight;
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      img.onload = null;
    };

    containerImage.append(div);
    containerImage.append(img);
  }
  img.setAttribute('id', 'img-' + model.id);
  img.setAttribute('width', model.width);
  img.setAttribute('height', model.height);
  div.setAttribute('id', 'div-' + model.id);
  div.style.height = model.height + 'px';
  div.style.width = model.width + 'px';
  div.removeAttribute('_echarts_instance_');

  let echart = echarts.init(div);
  if (model.subtype == '饼图') {
    echart.setOption(ChartElementRenderer.options.pie);
  } else if (model.subtype == '柱状图') {
    echart.setOption(ChartElementRenderer.options.bar);
  } else if (model.subtype == '折线图') {
    echart.setOption(ChartElementRenderer.options.line);
  } else if (model.subtype == '仪表图') {
    echart.setOption(ChartElementRenderer.options.gauge);
  }
  // 修复改变图表子类型而无法刷新页面的问题。
  if (this.latestSubtype != model.subtype) {
    img.onload = function () {
      sWidth = img.naturalWidth;
      sHeight = img.naturalHeight;
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      img.onload = null;
    };
  }
  this.latestSubtype = model.subtype;

  let image = echart.getDataURL();
  img.setAttribute('src', image);
  if (!img.onload) {
    sWidth = img.naturalWidth;
    sHeight = img.naturalHeight;
    context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
  }

  this.renderSelected(context, model);
};

Object.assign(ChartElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// VIDEO
//
////////////////////////////////////////////////////////////////////////////////

function VideoElementRenderer() {

}

VideoElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  let containerVideo = document.getElementById('video_container');
  // let video = dom.element('<video id="videoSample" autoplay loop></video>');
  // video.src = model.sample;
  // containerVideo.appendChild(video);

  function renderFrame() {
    // context.globalCompositeOperation = "source-over";
    // context.clearRect(0, 0, c.width, c.height);     // makes sure we have an alpha channel

    // context.beginPath();                            // draw diagonal half
    // context.moveTo(model.x, model.y);
    // context.lineTo(pos - 50, 0);
    // context.lineTo(pos + 50, c.height);
    // context.lineTo(0, c.height);
    // context.fill();

    // // video source 2
    // ctx.globalCompositeOperation = "source-in";        // comp in source 2
    // ctx.drawImage(video2, 0, 0, c.width, c.height);

    // video source 1
    // context.globalCompositeOperation = "destination-atop"; // comp in source 1
    context.drawImage(video, model.x, model.y, model.width, model.height);

    requestAnimationFrame(renderFrame);
  }

  // video.oncanplay = function() { renderFrame() };

  if (model.image) {
    let containerImage = document.getElementById('image_container');
    let img = document.getElementById(model.id);
    if (img == null) {
      let img = document.createElement('img');
      img.setAttribute('id', model.id);
      img.setAttribute('src', model.image);
      img.onload = function () {
        let sWidth = img.naturalWidth;
        let sHeight = img.naturalHeight;
        context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      };
      containerImage.append(img);
    } else {
      let sWidth = img.naturalWidth;
      let sHeight = img.naturalHeight;
      img.setAttribute('src', model.image);
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
    }
  } else {
    let img = document.getElementById(model.id);
    if (img == null) {
      img = document.getElementById('image_poster')
    }
    let sWidth = img.naturalWidth;
    let sHeight = img.naturalHeight;
    context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
  }

  this.renderSelected(context, model);
};

Object.assign(VideoElementRenderer.prototype, CanvasElementRenderer.prototype);


////////////////////////////////////////////////////////////////////////////////
//
// TABLE
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for table element.
 *
 * @constructor
 */
function QueueElementRenderer() {

}

QueueElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  // context.font = model.font();
  context.fillStyle = model.fontColor;

  if (model.selected) {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
  } else {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;
  }
  context.setLineDash([]);
  context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;

  // 画边框
  context.beginPath();
  // left-top
  context.moveTo(model.x, model.y);
  // left-bottom
  context.lineTo(model.x, model.y + model.height);
  // right-bottom
  context.lineTo(model.x + model.width, model.y + model.height);
  // right-top
  context.lineTo(model.x + model.width, model.y);
  // left-top
  context.lineTo(model.x, model.y);
  context.stroke();
  context.closePath();

  let columnTitles = model.columns.split(';');
  let columnCount = columnTitles.length;
  let columnWidth = parseInt(model.width / (columnCount == 0 ? 1 : columnCount));
  let headerHeight = model.fontSize * 1.25;

  // 画【列】的竖线
  // for (let i = 1; i < columnCount; i++) {
  //   context.beginPath();
  //   context.moveTo(model.x + columnWidth * i, model.y);
  //   context.lineTo(model.x + columnWidth * i, model.y + model.height);
  //   context.stroke();
  //   context.closePath();
  // }
  // 画【表头】的横线
  context.beginPath();
  context.moveTo(model.x, model.y + headerHeight);
  context.lineTo(model.x + model.width, model.y + headerHeight);
  context.stroke();
  context.closePath();
  // 画【表头】的标题
  context.font = model.font();
  for (let i = 0; i < columnCount; i++) {
    let title = columnTitles[i];
    let titleWidth = context.measureText(title).width;
    let titleX = model.x + (columnWidth - titleWidth) / 2 + columnWidth * i;
    context.fillText(title, titleX, model.y + model.fontSize * 1.0);
  }

  this.renderSelected(context, model);
};

Object.assign(QueueElementRenderer.prototype, CanvasElementRenderer.prototype);

function DataSheet(opt) {
  // 输入的数据列
  // 每一列包括列标题、数据类型、默认值、占位符
  this.columns = opt.columns;
  this.columnCount = this.getColumnCount(this.columns);
  // 第一列的行标题
  this.rowHeaderWidth = opt.rowHeaderWidth || 150;
  this.rowHeaders = opt.rowHeaders;
  this.rowCount = this.getRowCount(this.rowHeaders);
  // 是否只读模式
  this.readonly = opt.readonly === true ? true : false;

  this.totalColumns = [];
  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    if (column.totalable) {
      this.totalColumns.push(column);
    }
  }
  // 时间回调
  this.onCellClicked = opt.onCellClicked;
  this.onRowHeaderClicked = opt.onRowHeaderClicked;

  // 计算获得各项数据
  this.rowHeaderColumnCount = this.getRowHeaderColumnCount(this.rowHeaders);
  this.colHeaderColumnCount = this.getColumnHeaderColumnCount(this.columns);
  this.rowHeaderRowCount = this.getRowHeaderRowCount(this.rowHeaders);
  this.colHeaderRowCount = this.getColumnHeaderRowCount(this.columns);
  this.matrixColumn = [];
  this.matrixRowHeader = [];
  this.buildColumnMatrix(this.columns, this.matrixColumn, 0);
  this.buildRowHeaderMatrix(this.rowHeaders, this.matrixRowHeader, 0);
}

/**
 * 渲染基础的表格DOM。
 */
DataSheet.prototype.root = function(data) {
  data = data || {};
  let self = this;
  this.table = dom.create('table', 'table', 'table-bordered');
  let thead = dom.create('thead');
  this.tbody = dom.create('tbody');
  let tr = dom.create('tr');
  let th = dom.create('th');
  th.style.borderBottomWidth = '0';
  th.style.width = this.rowHeaderWidth + 'px';

  // tr.appendChild(th);
  thead.appendChild(tr);
  this.table.appendChild(thead);
  this.table.appendChild(this.tbody);

  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    th = dom.create('th', 'text-center');
    th.style.borderBottomWidth = '0';
    th.innerHTML = column.title;
    tr.appendChild(th);
  }

  for (let i = 0; i < this.rowCount; i++) {
    let rowHeader = this.rowHeaders[i];
    let tr = dom.create('tr');
    let td = dom.create('td');
    td.innerHTML = rowHeader.title;
    td.style.fontWeight = 'bold';
    tr.appendChild(td);
    for (let j = 0; j < this.columnCount; j++) {
      let column = this.columns[j];
      td = dom.create('td');
      td.style.textAlign = 'right';
      td.style.padding = '6px 12px';
      // td.setAttribute('contenteditable', 'true');
      td.setAttribute('data-ds-format', column.format || '');
      td.setAttribute('data-ds-row', i);
      td.setAttribute('data-ds-column', j);
      td.addEventListener('focus', function() {

      });
      if (data[rowHeader.title] && data[rowHeader.title][column.title]) {
        td.innerHTML = data[rowHeader.title][column.title];
      } else {
        td.innerHTML = '';
      }
      td.addEventListener('keyup', function(ev) {
        let td = this;
        let rowIndex = parseInt(td.getAttribute('data-ds-row'));
        let columnIndex = parseInt(td.getAttribute('data-ds-column'));
        let triggered = null;
        if (ev.keyCode == 13 /* ENTER */) {
          triggered = td;
        } else if (ev.keyCode == 37 /* ARROW LEFT */) {
          if (columnIndex == 0 /* 已经是第一列了，无法再向左移动 */) return;
          triggered = self.getCell(rowIndex, columnIndex - 1);
        } else if (ev.keyCode == 38 /* ARROW UP */) {
          if (rowIndex == 0 /* 已经是第一行了，无法再向上移动 */) return;
          triggered = self.getCell(rowIndex - 1, columnIndex);
        } else if (ev.keyCode == 39 /* ARROW RIGHT */) {
          if (columnIndex == self.columnCount - 1 /* 已经是最后一列，无法再向右移动 */) return;
          triggered = self.getCell(rowIndex, columnIndex + 1);
        } else if (ev.keyCode == 40 /* ARROW DOWN */) {
          if (rowIndex == self.rowCount - 1 /* 已经是最后一行，无法再向下移动 */) return;
          triggered = self.getCell(rowIndex + 1, columnIndex);
        }
        self.totalize();
        if (triggered != null) {
          td.blur();
          triggered.focus();
          document.execCommand('selectAll',false,null)
        }
      });
      tr.appendChild(td);
    }
    this.tbody.appendChild(tr);
  }
  if (this.totalColumns.length > 0) {
    let tr = dom.create('tr');
    let td = dom.create('td');
    td.innerHTML = '合计';
    td.style.fontWeight = 'bold';
    tr.appendChild(td);
    for (let j = 0; j < this.columnCount; j++) {
      td = dom.create('td');
      tr.appendChild(td);
    }
    this.tbody.appendChild(tr);
  }
  this.totalize();
  return this.table;
};

DataSheet.prototype.getCell = function(rowIndex, columnIndex) {
  let tbody = dom.find('tbody', this.table);
  let ret = null;
  for (let i = 0; i < tbody.children.length; i++) {
    let tr = tbody.children[i];
    if (i == rowIndex) {
      for (let j = 1 /*行头去掉*/; j < tr.children.length; j++) {
        if (j - 1 == columnIndex) {
          ret = tr.children[j];
          break;
        }
      }
      break;
    }
  }
  return ret;
};

DataSheet.prototype.render = function(containerId, data) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  // this.container.appendChild(this.root(data));
  let table = dom.element(`
    <table class="table table-bordered">
      <thead></thead>
      <tbody></tbody>
    </table>
  `);
  let thead = dom.find('thead', table);
  let tbody = dom.find('tbody', table);
  let totalRowCount = this.rowHeaderRowCount + this.colHeaderRowCount;
  let trs = [];
  for (let i = 0; i < this.colHeaderRowCount; i++) {
    let tr = dom.create('tr');
    trs.push(tr);
    thead.appendChild(tr);
  }
  // for (let i = 0; i < this.rowHeaderColumnCount; i++) {
  //   let th = dom.create('th', 'text-center');
  //   th.style = 'border-bottom-width: 1px;';
  //   th.setAttribute('rowspan', this.colHeaderRowCount);
  //   trs[0].appendChild(th);
  // }
  for (let i = 0; i < this.colHeaderRowCount; i++) {
    let tr = trs[i];
    for (let j = 0; j < this.colHeaderColumnCount; j++) {
      let column = this.matrixColumn[i][j];
      if (column == null) continue;
      let th = dom.create('th', 'text-center');
      th.style = 'border-bottom-width: 1px;';
      th.setAttribute('colspan', this.getSpanColumnCount(column));
      th.innerHTML = column.title;
      tr.appendChild(th);
    }
  }
  for (let i = 0; i < this.rowHeaderRowCount; i++) {
    let tr = dom.create('tr');
    for (let j = 0; j < this.rowHeaderColumnCount; j++) {
      let rowHeader = this.matrixRowHeader[j][i];
      if (rowHeader == null) continue;
      let td = dom.create('td');
      td.style = 'vertical-align: middle;';
      td.setAttribute('rowspan', this.getSpanRowCount(rowHeader));
      td.innerHTML = '<strong>' + rowHeader.title + '</strong>';
      if (this.onRowHeaderClicked) {
        td.onclick = ev => {
          let tds = Array.prototype.slice.call(td.parentElement.children);
          this.onRowHeaderClicked(td, tds.indexOf(td));
        };
      }
      tr.appendChild(td);
    }
    // 补齐其余的单元格
    for (let j = 0; j < this.colHeaderColumnCount - this.rowHeaderColumnCount; j++) {
      let td = dom.create('td');
      td.style.textAlign = 'right';
      td.style.padding = '6px 12px';
      // td.setAttribute('contenteditable', 'true');
      if (this.onCellClicked) {
        td.onclick = ev => {
          let tds = Array.prototype.slice.call(td.parentElement.children);
          this.onCellClicked(td, tds.indexOf(td));
        };
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  this.container.appendChild(table);
};

DataSheet.prototype.getValues = function() {
  let ret = {};
  for (let i = 0; i < this.rowHeaders.length; i++) {
    let rowHeader = this.rowHeaders[i];
    ret[rowHeader.title] = {};
    for (let j = 0; j < this.columns.length; j++) {
      let col = this.columns[j];
      ret[rowHeader.title][col.title]  = this.tbody.rows[i].cells[j + 1].innerText.trim();
    }
  }
  return ret;
};

DataSheet.prototype.totalize = function() {
  if (this.totalColumns.length == 0) return;
  let trTotal = this.tbody.children[this.tbody.children.length - 1];
  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    if (column.totalable !== true) continue;
    let total = 0;
    let calculated = false;
    for (let j = 0; j < this.rowHeaders.length; j++) {
      let val = parseFloat(this.tbody.rows[j].cells[i + 1].innerText.trim());
      if (!isNaN(val)) {
        total += val;
        calculated = true;
      }
    }
    if (!isNaN(total) && calculated === true) {
      trTotal.cells[i + 1].innerText = total.toFixed(2);
    }
  }
};

DataSheet.prototype.buildColumnMatrix = function (columns, matrix, rowIndex) {
  if (!columns) return;
  let row;
  if (matrix[rowIndex]) {
    row = matrix[rowIndex];
  } else {
    row = [];
    matrix.push(row);
  }
  for (let i = 0; i < columns.length; i++) {
    let column = columns[i];
    row.push(column);
    let span = this.getSpanColumnCount(column);
    for (let j = 1; j < span; j++) {
      row.push(null);
    }
    this.buildColumnMatrix(column.children, matrix, rowIndex + 1);
  }
};

DataSheet.prototype.buildRowHeaderMatrix = function (rowHeaders, matrix, colIndex) {
  if (!rowHeaders) return;
  let row;
  if (matrix[colIndex]) {
    row = matrix[colIndex];
  } else {
    row = [];
    matrix.push(row);
  }
  for (let i = 0; i < rowHeaders.length; i++) {
    let rowHeader = rowHeaders[i];
    row.push(rowHeader);
    let span = this.getSpanRowCount(rowHeader);
    for (let j = 1; j < span; j++) {
      row.push(null);
    }
    this.buildRowHeaderMatrix(rowHeader.children, matrix, colIndex + 1);
  }
};

DataSheet.prototype.getSpanColumnCount = function (column) {
  let ret = 0;
  if (!column.children || column.children.length == 0) {
    return 1;
  }
  for (let i = 0; i < column.children.length; i++) {
    ret += this.getSpanColumnCount(column.children[i]);
  }
  return ret;
};

DataSheet.prototype.getSpanRowCount = function (rowHeader) {
  if (!rowHeader.children || rowHeader.children.length == 0) {
    return 1;
  }
  return rowHeader.children.length;
};

DataSheet.prototype.getRowCount = function(rowHeaders) {
  let ret = 0;
  for (let i = 0; i < rowHeaders.length; i++) {
    let rowHeader = rowHeaders[i];
    ret += 1;
    if (rowHeader.children) {
      ret += this.getRowCount(rowHeader.children);
    }
  }
  return ret;
};

DataSheet.prototype.getColumnCount = function(columns) {
  let ret = 0;
  for (let i = 0; i < columns.length; i++) {
    let column = columns[i];
    ret += 1;
    if (column.children) {
      ret += this.getColumnCount(column.children);
    }
  }
  return ret;
};

DataSheet.prototype.getColumnHeaderRowCount = function(columns) {
  let ret = 1;
  for (let i = 0; i < columns.length; i++) {
    let level = 1;
    let column = columns[i];
    if (column.children) {
      level += this.getColumnHeaderRowCount(column.children);
    }
    if (level > ret)
      ret = level;
  }
  return ret;
};

DataSheet.prototype.getRowHeaderRowCount = function(rowHeaders) {
  let ret = 0;
  for (let i = 0; i < rowHeaders.length; i++) {
    let rowHeader = rowHeaders[i];
    if (rowHeader.children) {
      ret += this.getRowHeaderRowCount(rowHeader.children);
    } else {
      ret += 1;
    }
  }
  return ret;
};

DataSheet.prototype.getColumnHeaderColumnCount = function(columns) {
  let ret = 0;
  for (let i = 0; i < columns.length; i++) {
    let column = columns[i];
    if (column.children) {
      ret += this.getColumnHeaderColumnCount(column.children);
    } else {
      ret += 1;
    }
  }
  return ret;
};

DataSheet.prototype.getRowHeaderColumnCount = function(rowHeaders) {
  let ret = 1;
  for (let i = 0; i < rowHeaders.length; i++) {
    let level = 1;
    let rowHeader = rowHeaders[i];
    if (rowHeader.children) {
      level += this.getRowHeaderColumnCount(rowHeader.children);
    }
    if (level > ret)
      ret = level;
  }
  return ret;
};

/**
 * 设计画布类型定义，一切利用html canvas技术业务实现的基类。
 */
function DesignCanvas() {
// 在画布上选中的对象
  this.selectedElement = null;
  this.objects = [];
  this.alignmentLines = [];
  this.isMoving = false;
  this.isResizing = false;
  this.resizeType = 'none';

  // 页面实际的画布对象
  this.canvas = document.createElement('canvas');
}

/**
 *
 */
DesignCanvas.prototype.bindDragOverEventListener = function () {
  // 拖拽到canvas上面时的事件处理函数
  this.canvas.addEventListener('dragover', function(ev) {
    ev.preventDefault();
  });
};

/**
 *
 */
DesignCanvas.prototype.bindDropEventListener = function (self, callback) {
  // 在canvas上面释放拖拽对象时的事件处理函数
  this.canvas.addEventListener('drop', function (ev) {
    ev.preventDefault();
    callback(self, ev);
  });
};

/**
 * 绑定鼠标点击事件。
 */
DesignCanvas.prototype.bindMouseDownEventListener = function (self, callback) {
  // 在canvas上响应鼠标按钮按下的事件处理函数
  this.canvas.addEventListener('mousedown', function(ev) {
    // 重置已经选择的对象
    self.selectedElement = null;

    // 绘制对齐辅助线
    self.getAlignmentLines();

    // 利用坐标体系算法获取当前的选择对象
    callback(self, ev);
  });
};

/**
 * 绑定鼠标移动事件的监听处理器，适用于点选了可移动的Canvas对象。
 *
 * @param {object} self
 *        继承此基类的子类的对象，用于回调函数中。
 *
 * @param {object} callback
 *        鼠标移动的回调函数。
 *
 * @since 1.0
 *
 * @version 1.1 - 增加鼠标移动到四周或者角落，调整为可以拉升的图标
 */
DesignCanvas.prototype.bindMouseMoveEventListener = function (self, callback) {
  this.canvas.addEventListener('mousemove', function(ev) {
    let resizeType = 'none';
    if (self.selectedElement == null) {
      return;
    }
    if (!self.isMoving && !self.isResizing)  return;

    self.getAlignmentLines();
    callback(self, ev);
    if (self.selectedElement != null) {
      self.isMoving = true;
    }
  });
};

/**
 * 绑定鼠标按钮弹起事件的监听处理器，无需回调处理。
 */
DesignCanvas.prototype.bindMouseUpEventListener = function () {
  let self = this;
  this.canvas.addEventListener('mouseup', function(ev) {
    self.isMoving = false;
    self.isResizing = false;
    self.resizeType = 'none';
    self.alignmentLine = null;
    self.canvas.style.cursor = 'default';
  });
};

/**
 * 画箭头的函数，基本功能的封装。
 */
DesignCanvas.prototype.drawArrow = function(startX, startY, endX, endY, controlPoints) {
  let ctx = this.canvas.getContext("2d");
  ctx.beginPath();

  let dx = endX - startX;
  let dy = endY - startY;
  let len = Math.sqrt(dx * dx + dy * dy);
  let sin = dy / len;
  let cos = dx / len;
  let a = [];
  a.push(0, 0);
  for (let i = 0; i < controlPoints.length; i += 2) {
    let x = controlPoints[i];
    let y = controlPoints[i + 1];
    a.push(x < 0 ? len + x : x, y);
  }
  a.push(len, 0);
  for (let i = controlPoints.length; i > 0; i -= 2) {
    let x = controlPoints[i - 2];
    let y = controlPoints[i - 1];
    a.push(x < 0 ? len + x : x, -y);
  }
  a.push(0, 0);
  for (let i = 0; i < a.length; i += 2) {
    let x = a[i] * cos - a[i + 1] * sin + startX;
    let y = a[i] * sin + a[i + 1] * cos + startY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.fill();
};

/**
 * 利用点到线的直线距离来选取哪根线条。
 */
DesignCanvas.prototype.showResizeCursor = function (ev) {
  let self = this;

  if (!self.selectedElement) return;

  let rect = self.canvas.getBoundingClientRect();
  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  let threshold = 10;

  let sel = self.selectedElement.model;

  let topX = sel.x;
  let topY = sel.y;
  let botX = sel.x + sel.width;
  let botY = sel.y + sel.height;

  // 顶端线条
  let distance = this.calculateVerticalDistance(x, y, topX, topY, botX, topY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 'n-resize';
    return 'north';
  }
  // 底端线条
  distance = this.calculateVerticalDistance(x, y, topX, botY, botX, botY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 's-resize';
    return 'south';
  }
  // 左侧线条
  distance = this.calculateVerticalDistance(x, y, topX, topY, topX, botY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 'w-resize';
    return 'west';
  }
  // 右侧线条
  distance = this.calculateVerticalDistance(x, y, botX, topY, botX, topY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 'e-resize';
    return 'east';
  }
  self.canvas.style.cursor = 'default';
  return 'none';
};

/**
 * 画辅助对齐线。
 */
DesignCanvas.prototype.getAlignmentLines = function() {
  let threshold = 10;
  this.alignmentLines = [];
  if (!this.selectedElement) {
    return;
  }

  let topX = this.selectedElement.model.x;
  let topY = this.selectedElement.model.y;
  let botX = this.selectedElement.model.x + this.selectedElement.model.width;
  let botY = this.selectedElement.model.y + this.selectedElement.model.height;

  let existings = {};
  for (let i = 0; i < this.elements.length; i++) {
    let obj = this.elements[i];
    if (obj.model.id == this.selectedElement.model.id) {
      continue;
    }
    let objTopX = obj.model.x;
    let objTopY = obj.model.y;
    let objBotX = obj.model.x + obj.model.width;
    let objBotY = obj.model.y + obj.model.height;
    // left to left
    if (Math.abs(topX - objTopX) <= threshold && !existings['x-' + objTopX]) {
      this.alignmentLines.push({x: objTopX});
    }
    if (Math.abs(topX - objBotX) <= threshold && !existings['x-' + objBotX]) {
      this.alignmentLines.push({x: objBotX});
    }
    if (Math.abs(botX - objTopX) <= threshold && !existings['x-' + objTopX]) {
      this.alignmentLines.push({x: objTopX});
    }
    if (Math.abs(botX - objBotX) <= threshold && !existings['x-' + objBotX]) {
      this.alignmentLines.push({x: objBotX});
    }
    if (Math.abs(topY - objTopY) <= threshold && !existings['y-' + objTopY]) {
      this.alignmentLines.push({y: objTopY});
    }
    if (Math.abs(topY - objBotY) <= threshold && !existings['y-' + objBotY]) {
      this.alignmentLines.push({y: objBotY});
    }
    if (Math.abs(botY - objTopY) <= threshold && !existings['y-' + objTopY]) {
      this.alignmentLines.push({y: objTopY});
    }
    if (Math.abs(botY - objBotY) <= threshold && !existings['y-' + objBotY]) {
      this.alignmentLines.push({y: objBotY});
    }
  }
};

/**
 * 计算点到线的垂直距离。
 *
 * @param {number} pointX
 *        需要计算的点的X坐标
 *
 * @param {number} pointY
 *        需要计算的店的Y坐标
 *
 * @param {number} linePointX1
 *        线其中一个端点的X坐标
 *
 * @param {number} linePointY1
 *        线其中一个端点的Y坐标
 *
 * @param {number} linePointX2
 *        线其中一个端点的X坐标
 *
 * @param {number} linePointY2
 *        线其中一个端点的Y坐标
 */
DesignCanvas.prototype.calculateVerticalDistance = function (pointX, pointY, linePointX1, linePointY1, linePointX2, linePointY2) {
  if (linePointX1 == linePointX2) {
    return Math.abs(pointX - linePointX1);
  }
  if (linePointY1 == linePointY2) {
    return Math.abs(pointY - linePointY1);
  }
  // 计算直线方程，两点式：two-point form
  // (x - x1) / (x2 - x1) = (y - y1) / (y2 - y1)
  // y = kx + b
  let xd = (linePointX1 - linePointX2);
  let b = (linePointX1 * linePointY2 - linePointX2 * linePointY1 - linePointX2 * linePointY1 + linePointX2 * linePointY2);
  let k = (linePointY1 - linePointY2);
  // TODO
};
function DesktopCanvas(opts) {
  /*!
  ** 常量设置，和手机背景图片密切相关。
  */
  const DESKTOP_IMAGE_WIDTH = 2788;
  const DESKTOP_IMAGE_HEIGHT = 2300;
  const DESKTOP_SAFE_AREA_TOP_LEFT_X = 15;
  const DESKTOP_SAFE_AREA_TOP_LEFT_Y = 60;
  const DESKTOP_SAFE_AREA_TOP_RIGHT_X = 446;
  const DESKTOP_SAFE_AREA_TOP_RIGHT_Y = 60;
  const DESKTOP_SAFE_AREA_BOT_LEFT_X = 15;
  const DESKTOP_SAFE_AREA_BOT_LEFT_Y = 836;
  const DESKTOP_SAFE_AREA_BOT_RIGHT_X = 446;
  const DESKTOP_SAFE_AREA_BOT_RIGHT_Y = 836;
  const DESKTOP_TOP_BAR_LEFT_X = 60;
  const DESKTOP_TOP_BAR_LEFT_Y = 13;
  const DESKTOP_TOP_BAR_RIGHT_X = 398;
  const DESKTOP_TOP_BAR_RIGHT_Y = 13;

  const DESKTOP_BOT_BAR_LEFT_X = 60;
  const DESKTOP_BOT_BAR_LEFT_Y = 890;
  const DESKTOP_BOT_BAR_RIGHT_X = 398;
  const DESKTOP_BOT_BAR_RIGHT_Y = 890;

  const DESKTOP_IMAGE_ASPECT_RATIO = DESKTOP_IMAGE_WIDTH / DESKTOP_IMAGE_HEIGHT;

  /*!
  ** 背景色，明亮模式和暗黑模式。
  */
  this.background = opts.background || 'white';
  this.skeletonBackground = 'rgba(0,0,0,0.17)';
  this.skeletonStroke = 'rgba(235,235,235)';
  this.propertiesEditor = opts.propertiesEditor;
  this.onSelectedElement = opts.onSelectedElement;
  /*!
  ** 用户设置的宽度。
  */
  this.width = opts.width || 960;
  this.height = this.width / DESKTOP_IMAGE_ASPECT_RATIO;
  this.wheelDeltaY = 0;

  /*!
  ** 背景图片和绘图区域的实际比例。
  */
  this.scaleRatio = this.width / DESKTOP_IMAGE_WIDTH;

  /*!
  ** 已经画上的元素。
  */
  this.drawnElements = [];
  this.images = {};
  this.mode = opts.mode || 'design';

  this.safeAreaTopLeftX = DESKTOP_SAFE_AREA_TOP_LEFT_X * this.scaleRatio;
  this.safeAreaTopLeftY = DESKTOP_SAFE_AREA_TOP_LEFT_Y * this.scaleRatio;
  this.safeAreaTopRightX = DESKTOP_SAFE_AREA_TOP_RIGHT_X * this.scaleRatio;
  this.safeAreaTopRightY = DESKTOP_SAFE_AREA_TOP_RIGHT_Y * this.scaleRatio;
  this.safeAreaBotLeftX = DESKTOP_SAFE_AREA_BOT_LEFT_X * this.scaleRatio;
  this.safeAreaBotLeftY = DESKTOP_SAFE_AREA_BOT_LEFT_Y * this.scaleRatio;
  this.safeAreaBotRightX = DESKTOP_SAFE_AREA_BOT_RIGHT_X * this.scaleRatio;
  this.safeAreaBotRightY = DESKTOP_SAFE_AREA_BOT_RIGHT_Y * this.scaleRatio;
  this.safeAreaWidth = this.safeAreaTopRightX - this.safeAreaTopLeftX;
  this.safeAreaHeight = this.safeAreaBotLeftY - this.safeAreaTopLeftY;

  this.topBarLeftX = DESKTOP_TOP_BAR_LEFT_X * this.scaleRatio;
  this.topBarLeftY = DESKTOP_TOP_BAR_LEFT_Y * this.scaleRatio;
  this.topBarRightX = DESKTOP_TOP_BAR_RIGHT_X * this.scaleRatio;
  this.topBarRightY = DESKTOP_TOP_BAR_RIGHT_Y * this.scaleRatio;

  this.botBarLeftX = DESKTOP_BOT_BAR_LEFT_X * this.scaleRatio;
  this.botBarLeftY = DESKTOP_BOT_BAR_LEFT_Y * this.scaleRatio;
  this.botBarRightX = DESKTOP_BOT_BAR_RIGHT_X * this.scaleRatio;
  this.botBarRightY = DESKTOP_BOT_BAR_RIGHT_Y * this.scaleRatio;

  this.safeAreaWidth = this.safeAreaTopRightX - this.safeAreaTopLeftX;
  this.safeAreaHeight = this.safeAreaBotRightY - this.safeAreaTopRightY;

  this.paddingLeft = 12 * this.scaleRatio;
  this.paddingRight = 12 * this.scaleRatio;
}

DesktopCanvas.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
  this.canvas = document.createElement('canvas');
  this.canvas.style.width = this.width + 'px';
  this.canvas.style.height = this.height + 'px';

  let dpr = window.devicePixelRatio || 1;
  this.canvas.width = this.width * dpr;
  this.canvas.height = this.height * dpr;
  this.context = this.canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  this.context.scale(dpr, dpr);
  this.backgroundImage = new Image(); // Create new img element
  this.backgroundImage.addEventListener("load", () => {
    this.redraw();
  }, false);
  this.backgroundImage.src = "/img/emulator/iMac.png";

  this.container.appendChild(this.canvas);

  this.initialize();
};

DesktopCanvas.prototype.restore = function () {
  let oldWheelDeltaY = this.wheelDeltaY;
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    el.y -= oldWheelDeltaY;
  }
  this.wheelDeltaY = 0;

  this.redraw();
};

DesktopCanvas.prototype.redraw = function () {
  this.context.clearRect(0, 0, this.width, this.height);

  this.buildSafeArea();

  // zero-y line
  this.context.beginPath();
  this.context.strokeStyle = 'rgba(0,0,0,0.17)';
  this.context.setLineDash([10, 10]);
  this.context.lineWidth = 3;
  this.context.moveTo(
    this.safeAreaBotLeftX,
    this.topBarLeftY + this.wheelDeltaY,
  );
  this.context.lineTo(
    this.safeAreaBotRightX,
    this.topBarLeftY + this.wheelDeltaY,
  );
  this.context.stroke();
  this.context.closePath();

  for (let i = 0; i < this.drawnElements.length; i++) {
    this.drawElement(this.drawnElements[i]);
  }

  this.buildOuter();

  // background image
  this.context.drawImage(this.backgroundImage,
    0, 0,
    this.backgroundImage.naturalWidth, this.backgroundImage.naturalHeight,
    0, 0,
    this.width, this.height);
};

/*!
** 初始渲染安全区域。
*/
DesktopCanvas.prototype.buildSafeArea = function () {
  this.context.fillStyle = this.background;
  this.context.fillRect(this.safeAreaTopLeftX, this.safeAreaTopLeftY, this.safeAreaWidth, this.safeAreaHeight);
};

/*!
** 初始渲染安全区域上方。
*/
DesktopCanvas.prototype.buildTopBar = function () {
  this.context.beginPath();
  this.context.fillStyle = this.background;
  this.context.strokeStyle = this.background;
  this.context.moveTo(this.safeAreaTopLeftX, this.safeAreaTopLeftY);
  // this.context.arcTo(0, 0, this.topBarLeftX, this.topBarLeftY, 30);
  this.context.fillStyle = 'black';
  this.context.arc(this.safeAreaTopLeftX + 35, this.safeAreaTopLeftY, 35, Math.PI, Math.PI * 1.5);
  // this.context.lineTo(this.topBarRightX, this.topBarRightY);
  // this.context.arcTo(this.width, 0, this.safeAreaBotRightX, this.safeAreaTopRightY, 30);
  // this.context.lineTo(this.safeAreaTopRightX, this.safeAreaTopRightY + 1 /* there is a bug what i have no idea*/);
  // this.context.lineTo(this.safeAreaTopLeftX, this.safeAreaTopLeftY + 1 /* there is a bug what i have no idea*/);
  this.context.fill();
  this.context.closePath();
};

DesktopCanvas.prototype.buildOuter = function () {

  this.context.beginPath();
  this.context.strokeStyle = 'white';
  this.context.lineWidth = 8;
  this.context.moveTo(0, 0);
  this.context.lineTo(0, this.height);
  this.context.stroke();

  this.context.moveTo(this.width, 0);
  this.context.lineTo(this.width, this.height);
  this.context.stroke();
  this.context.closePath();

  // top-left
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(75, 75, 75, Math.PI, Math.PI * 1.5);
  this.context.lineTo(0, 0);
  this.context.fill();
  this.context.closePath();

  // top-right
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(this.width - 75, 75, 75, Math.PI * 1.5, Math.PI * 2);
  this.context.lineTo(this.width, 0);
  this.context.fill();
  this.context.closePath();

  // bottom-left
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(75, this.height - 75, 75, Math.PI / 2, Math.PI);
  this.context.lineTo(0, this.height);
  this.context.fill();
  this.context.closePath();

  // bottom-right
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(this.width - 75, this.height - 75, 75, 0, Math.PI / 2);
  this.context.lineTo(this.width, this.height);
  this.context.fill();
  this.context.closePath();

  // bottom-right

};

/*!
** 初始渲染安全区域下方。
*/
DesktopCanvas.prototype.buildBotBar = function () {
  this.context.beginPath();
  this.context.fillStyle = this.background;
  this.context.strokeStyle = this.background;
  this.context.moveTo(this.safeAreaBotLeftX, this.safeAreaBotLeftY);
  this.context.arcTo(0, this.height, this.botBarLeftX, this.botBarLeftY, 30);
  this.context.lineTo(this.botBarRightX, this.botBarRightY);
  this.context.arcTo(this.width - 10, this.height - 10, this.safeAreaBotRightX, this.safeAreaTopRightY, 30);
  this.context.lineTo(this.safeAreaBotRightX, this.safeAreaBotRightY - 1);
  this.context.lineTo(this.safeAreaBotLeftX, this.safeAreaBotLeftY - 1);
  this.context.fill();
  this.context.closePath();
};

/*!
** 初始化设置。
*/
DesktopCanvas.prototype.initialize = function () {
  dnd.setDroppable(this.canvas, (x, y, data) => {
    if (this.mode == 'simulate') return;
    this.drawNewElement(x, y, data);
  });

  dom.bind(this.canvas, 'mousedown', ev => {
    if (this.mode == 'simulate') return;
    let found = this.findElementByXY(ev.layerX - this.canvas.offsetLeft, ev.layerY - this.canvas.offsetTop);
    this.clearSelected();
    if (found != null) {
      this.canvas.style.cursor = 'move';
      let ox = ev.layerX - this.canvas.offsetLeft;
      let oy = ev.layerY - this.canvas.offsetTop;
      found.selected = true;
      this.movingElement = found;
      this.movingOffsetX = ox - found.x;
      this.movingOffsetY = oy - found.y;
      this.redraw();
      if (this.propertiesEditor) {
        this.propertiesEditor.render(this.getElementProperties(this.movingElement));
      }
      if (this.onSelectedElement) {
        this.onSelectedElement(this.movingElement);
      }
    } else {
      this.propertiesEditor.render({groups: []});
      for (let i = 0; i < this.drawnElements.length; i++) {
        this.drawnElements[i].selected = false;
      }
      this.redraw();
    }
  });
  dom.bind(this.canvas, 'mouseup', ev => {
    if (this.mode == 'simulate') return;
    this.canvas.style.cursor = 'default';
    this.movingElement = null;
  });
  dom.bind(this.canvas, 'mousemove', ev => {
    if (this.mode == 'simulate') return;
    if (this.movingElement != null) {
      let ox = ev.layerX - this.canvas.offsetLeft;
      let oy = ev.layerY - this.canvas.offsetTop;
      this.movingElement.x = ox - this.movingOffsetX;
      this.movingElement.y = oy - this.movingOffsetY;
      this.movingElement.rx = (this.movingElement.x - this.safeAreaTopLeftX) / this.scaleRatio;
      this.movingElement.ry = (this.movingElement.y - this.wheelDeltaY - this.topBarLeftY) / this.scaleRatio;
      if (this.propertiesEditor) {
        this.propertiesEditor.render(this.getElementProperties(this.movingElement));
      }
      this.redraw();
    }
  });
  dom.bind(this.canvas, 'wheel', ev => {
    // 所有元素都在顶部
    let areAllOverTop = true;
    for (let i = 0; i < this.drawnElements.length; i++) {
      let el = this.drawnElements[i];
      if ((el.y + el.h) > 0) {
        areAllOverTop = false;
        break;
      }
    }
    if (areAllOverTop === true && ev.wheelDeltaY < 0) return;

    let areAllUnderBottom = true;
    for (let i = 0; i < this.drawnElements.length; i++) {
      let el = this.drawnElements[i];
      if (el.y < this.height) {
        areAllUnderBottom = false;
        break;
      }
    }
    if (areAllUnderBottom === true && ev.wheelDeltaY > 0) return;

    for (let i = 0; i < this.drawnElements.length; i++) {
      let el = this.drawnElements[i];
      // el.x += ev.wheelDeltaX / 5;
      el.y += ev.wheelDeltaY / 5;
    }
    this.wheelDeltaY += ev.wheelDeltaY / 5;
    this.redraw();
  });
};

DesktopCanvas.prototype.drawParagraph = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.beginPath();
  let startX = el.x;
  let startY = el.y;
  for (let i = 0; i < 4; i++) {
    this.context.fillRect(startX, startY, el.w, 20);
    startY += 28;
  }
  this.context.fillRect(startX, startY, el.w * 0.68, 20);
  this.context.closePath();
};

DesktopCanvas.prototype.drawImage = function (el) {
  if (el.url) {
    let img = this.images[el.url];
    if (img == null) {
      img = new Image();
      img.addEventListener("load", () => {
        this.context.drawImage(img, el.x, el.y, el.w, el.h);
      }, false);
      img.src = el.url;
      this.images[el.url] = img;
    } else {
      this.context.drawImage(img, el.x, el.y, el.w, el.h);
    }
  } else {
    this.drawImageSkeleton(el);
  }
};

DesktopCanvas.prototype.drawImageSkeleton = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
  let iw = 0;
  if (el.w > el.h)
    iw = el.h * 0.80;
  else
    iw = el.w * 0.80;

  let ih = iw * 0.68;

  let x = el.x + (el.w - iw) / 2;
  let y = el.y + (el.h - ih) / 2;

  const lw = 8;
  this.context.beginPath();
  this.context.lineWidth = 8;
  this.context.setLineDash([]);
  this.context.strokeStyle = this.skeletonStroke;
  this.context.moveTo(x, y);
  this.context.lineTo(x + iw, y);
  this.context.lineTo(x + iw, y + ih);
  this.context.lineTo(x, y + ih);
  this.context.lineTo(x, y - lw / 2);
  this.context.stroke();
  this.context.closePath();

  this.context.fillStyle = this.skeletonStroke;
  // SUN
  this.context.beginPath();
  let cx = x + iw / 4;
  let cy = y + ih / 3;
  this.context.arc(cx, cy, ih / 6, 0, 2 * Math.PI);
  this.context.fill();
  this.context.closePath();

  // HILLS
  this.context.beginPath();
  let hx = x + iw / 4 - ih / 6;
  let hy = y + ih - lw * 1.5;
  let hw = iw / 4;
  let hh = ih / 3;
  this.context.moveTo(hx, hy);
  this.context.lineTo(hx + hw, hy - hh);
  this.context.lineTo(hx + hw * 2, hy);
  this.context.lineTo(hx, hy);
  this.context.fill();

  hx = x + iw / 4;
  hy = y + ih - lw * 1.5;
  hw = iw / 3;
  hh = ih / 2;
  this.context.moveTo(hx, hy);
  this.context.lineTo(hx + hw, hy - hh);
  this.context.lineTo(hx + hw * 2, hy);
  this.context.lineTo(hx, hy);
  this.context.fill();
  this.context.closePath();
};

DesktopCanvas.prototype.drawAvatar = function (el) {
  this.context.fillStyle = this.skeletonBackground;

  let cx = el.x + el.w / 2;
  let cy = el.y + el.w / 2;

  this.context.beginPath();
  this.context.arc(cx, cy, el.w / 2, 0, 2 * Math.PI);
  this.context.fill();
  this.context.closePath();
};

DesktopCanvas.prototype.drawText = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
};

DesktopCanvas.prototype.drawBlock = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
};

DesktopCanvas.prototype.drawElement = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  if (el.type == 'title') {
    if (!el.w) {
      el.rw = 120;
      el.rh = 32;
      el.w = el.rw * this.scaleRatio;
      el.h = el.rh * this.scaleRatio;
    }
    this.drawText(el);
  } else if (el.type == 'paragraph') {
    el.w = el.w || this.safeAreaWidth;
    el.h = 132;
    el.rw = el.w / this.scaleRatio;
    el.rh = el.h / this.scaleRatio;
    this.drawParagraph(el);
  } else if (el.type == 'block') {
    if (!el.w) {
      el.w = el.h = 60;
      el.rw = el.w / this.scaleRatio;
      el.rh = el.h / this.scaleRatio;
    }
    this.drawBlock(el);
  } else if (el.type == 'image') {
    el.w = el.w || this.safeAreaWidth;
    el.h = 120;
    el.rw = el.w / this.scaleRatio;
    el.rh = el.h / this.scaleRatio;
    this.drawImage(el);
  } else if (el.type == 'avatar') {
    if (!el.w) {
      el.w = el.h = 60;
      el.rw = el.w / this.scaleRatio;
      el.rh = el.h / this.scaleRatio;
    }
    this.drawAvatar(el);
  }
  if (el.selected === true) {
    let lw = 2;
    this.context.beginPath();
    this.context.strokeStyle = '#39f';
    this.context.setLineDash([]);
    this.context.lineWidth = lw;
    let x = el.x + lw, y = el.y + lw / 2, w = el.w - lw * 2, h = el.h - lw;
    this.context.moveTo(x, y);
    this.context.lineTo(x + w, y);
    this.context.lineTo(x + w, y + h);
    this.context.lineTo(x, y + h);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.context.closePath();
  }
};

DesktopCanvas.prototype.drawNewElement = function (x, y, data, translated/*坐标是否已经转换*/) {
  translated = translated === true;
  let el;
  if (!translated) {
    // 通过拖拽实际Canvas的坐标
    let ox = x;
    let oy = y;
    if (DesktopCanvas.offsetX) {
      ox -= DesktopCanvas.offsetX;
    }
    if (DesktopCanvas.offsetY) {
      oy -= DesktopCanvas.offsetY;
    }

    el = {
      x: ox, y: oy, ...data,
      rx: (ox - this.safeAreaTopLeftX) / this.scaleRatio,
      ry: (oy - this.wheelDeltaY - this.topBarLeftY) / this.scaleRatio,
    };
  } else {
    // 用户通过参数传入的用户可读的坐标
    let rx = x;
    let ry = y;

    x = rx * this.scaleRatio + this.safeAreaTopLeftX;
    y = ry * this.scaleRatio + this.topBarLeftY;
    el = {
      x: x, y: y, ...data,
      rx: rx,
      ry: ry,
    };
  }

  this.drawnElements.push(el);

  // 保证图层的顺序，必须重绘
  this.redraw();
};

DesktopCanvas.prototype.findElementByXY = function (x, y) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (x > el.x && x < el.x + el.w && y > el.y && y < el.y + el.h) {
      return el;
    }
  }
  return null;
};

DesktopCanvas.prototype.findElementById = function (id) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.id === id) {
      return el;
    }
  }
  return null;
};

DesktopCanvas.prototype.findTopmostElement = function () {
  let minY = 100000;
  let ret = null;
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.y < minY) {
      ret = el;
      minY = el.y;
    }
  }
  return ret;
};

DesktopCanvas.prototype.clearSelected = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    this.drawnElements[i].selected = false;
  }
};

DesktopCanvas.prototype.removeElement = function () {
  let found = -1;
  for (let i = 0; i < this.drawnElements.length; i++) {
    if (this.drawnElements[i].selected === true) {
      found = i;
      break;
    }
  }
  if (found == -1) return;
  this.drawnElements.splice(found, 1);
  this.redraw();
};

DesktopCanvas.prototype.switchMode = function () {
  if (this.mode == 'design') {
    this.mode = 'simulate';
    this.clearSelected();
    this.redraw();
  } else {
    this.mode = 'design';
  }
};

DesktopCanvas.prototype.changeElement = function (prop) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected === true) {
      for (let key in prop) {
        if (key === 'rx') {
          el.x = (parseInt(prop[key]) * this.scaleRatio + this.safeAreaTopLeftX) ;
        } else if (key === 'ry') {
          el.y = (parseInt(prop[key]) * this.scaleRatio + this.topBarLeftY + this.wheelDeltaY);
        } else if (key === 'rw') {
          el.w = parseInt(prop[key]) * this.scaleRatio;
        } else if (key === 'rh') {
          el.h = parseInt(prop[key]) * this.scaleRatio;
        }
        el[key] = prop[key];
      }
      this.redraw();
      break;
    }
  }
};

DesktopCanvas.prototype.clear = function () {
  this.drawnElements = [];
  this.redraw();
};

DesktopCanvas.prototype.getElementProperties = function (el) {
  let ret = {
    groups: [{
      title: '位置',
      properties: [{
        title: 'X',
        name: 'rx',
        input: 'number',
        value: el.rx,
      },{
        title: 'Y',
        name: 'ry',
        input: 'number',
        value: el.ry,
      },{
        title: '宽度',
        name: 'rw',
        input: 'number',
        value: el.rw,
      },{
        title: '高度',
        name: 'rh',
        input: 'number',
        value: el.rh,
      }]
    },{
      title: '其他',
      properties: [{
        title: '备注',
        name: 'note',
        input: 'longtext',
      }],
    }]
  };
  return ret;
};

function FormBuilder(opt) {

}

FormBuilder.prototype.decorate = function(formContainerId) {
  this.formContainer = dom.find(formContainerId);
  let inputGroups = this.formContainer.querySelectorAll('.input-group');
  for (let i = 0; i < inputGroups.length; i++) {
    let mask = dom.create('div');
    mask.style.background = 'transparent';
    mask.style.width = '100%';
    mask.style.height = '100%';
    mask.style.zIndex = '9999';
    mask.style.position = 'absolute';
    mask.style.top = '0px';
    mask.style.left = '0px';
    mask.style.cursor = 'pointer';
    let ig = inputGroups[i];
    ig.parentElement.style.position = 'relative';
    ig.parentElement.appendChild(mask);
    dom.bind(mask, 'click', ev => {

    });
  }
};
/**
 *
 * @constructor
 */
function Kesigner() {

}

////////////////////////////////////////////////////////////////////////////////
//
// FACTORY FUNCTIONS
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.getComponent = function(type) {
  if (type === 'row') {
    return new Kesigner.Row();
  } if (type === 'column') {
    return new Kesigner.Column();
  } else if (type === 'panel') {
    return new  Kesigner.Panel();
  } else if (type === 'form') {
    return new Kesigner.Form();
  } else if (type === 'table') {
    return new Kesigner.Table();
  } else if (type === 'chart') {
    return new Kesigner.Chart();
  }
  return null;
};

Kesigner.getElement = function(component) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(component.html(), 'text/html');
  let properties = component.properties();
  let values ={};
  for (let i = 0; i < properties.length; i++) {
    let propertyGroup = properties[i];
    values[propertyGroup.name] = {};
    if (propertyGroup.multiple) {
      values[propertyGroup.name] = propertyGroup.value || [];
    }
    for (let j = 0; propertyGroup.items && j < propertyGroup.items.length; j++) {
      let propertyItem = propertyGroup.items[j];
      values[propertyGroup.name][propertyItem.name] = propertyItem.value;
    }
  }
  let ret = doc.body.firstChild;
  ret.setAttribute('data-values', JSON.stringify(values));
  return doc.body.firstChild;
};

Kesigner.getFragment = function (component) {
  let range = document.createRange();
  let fragment = range.createContextualFragment(component.html());
  let element = fragment.firstElementChild;
  let properties = component.properties();
  let values ={};
  for (let i = 0; i < properties.length; i++) {
    let propertyGroup = properties[i];
    values[propertyGroup.name] = {};
    if (propertyGroup.multiple) {
      values[propertyGroup.name] = propertyGroup.value || [];
    }
    for (let j = 0; propertyGroup.items && j < propertyGroup.items.length; j++) {
      let propertyItem = propertyGroup.items[j];
      values[propertyGroup.name][propertyItem.name] = propertyItem.value;
    }
  }
  element.setAttribute('data-values', JSON.stringify(values));
  return fragment;
};

Kesigner.getProperties = function(type) {
  let component = Kesigner.getComponent(type);
  return component.properties();
};

Kesigner.getPropertyItem = function(propertyGroup, propertyItem, value) {
  if (propertyItem.type == 'boolean') {
    return Kesigner.createSwitch(propertyGroup, propertyItem, value);
  } else if (propertyItem.type.indexOf('range') == 0) {
    return Kesigner.createRange(propertyGroup, propertyItem, value);
  } else if (propertyItem.type == 'number') {
    return Kesigner.createNumber(propertyGroup, propertyItem, value);
  } else {
    return Kesigner.createText(propertyGroup, propertyItem, value);
  }
};

Kesigner.resizeComponent = function (data) {
  let selectable = document.querySelector('.kesigner-selected');
  if (data.name == 'colspan') {
    for (let i = 0; i < selectable.classList.length; i++) {
      let clazz = selectable.classList[i];
      if (clazz.indexOf('col-md-') == 0) {
        selectable.classList.remove(clazz);
        selectable.classList.add('col-md-' + data.value);
        Kesigner.value(selectable, data.group, data.name, data.value);
        break;
      }
    }
  } else if (data.name == 'height') {
    selectable.style.height = data.value + 'px';
  }
  // 如果有脚本，就要重新执行
  let script = selectable.nextElementSibling;
  if (script && script.nodeName == 'SCRIPT') {
    eval(script.innerText);
  }
};

Kesigner.createSwitch = function(propertyGroup, propertyItem, value) {
  let div = document.createElement('div');
  let label = document.createElement('label');
  label.classList.add('c-switch', 'c-switch-label', 'c-switch-success');
  let input = document.createElement('input');
  input.type = 'checkbox';
  input.classList.add('c-switch-input');
  if (value == true)
    input.checked = true;
  else
    input.checked = false;

  input.addEventListener('input', propertyItem.change);
  input.setAttribute('data-group', propertyGroup.name);
  input.setAttribute('data-name', propertyItem.name);
  let span = document.createElement('span');
  span.classList.add('c-switch-slider');
  span.setAttribute('data-checked', '是');
  span.setAttribute('data-unchecked', '否');

  label.appendChild(input);
  label.appendChild(span);
  div.appendChild(label);

  return div;
};

Kesigner.createText = function(propertyGroup, propertyItem, value) {
  let input = document.createElement('input');
  input.classList.add('group-item-input');
  input.setAttribute('data-group', propertyGroup.name);
  input.setAttribute('data-name', propertyItem.name);
  input.value = value || '';
  if (typeof propertyItem.change !== 'undefined') {
    input.addEventListener('input', propertyItem.change);
  }
  return input;
};

Kesigner.createRange = function(propertyGroup, propertyItem, value) {
  let input = document.createElement('input');
  input.classList.add('group-item-input');
  input.setAttribute('data-group', propertyGroup.name);
  input.setAttribute('data-name', propertyItem.name);
  input.value = value;
  input.type = 'range';

  if (typeof propertyItem.change !== 'undefined') {
    input.addEventListener('input', propertyItem.change);
  }

  let minAndMax = propertyItem.type.replace('range[', '').replace(']', '').split(',');
  input.setAttribute('min', parseInt(minAndMax[0]));
  input.setAttribute('max', parseInt(minAndMax[1]));
  input.setAttribute('step', 1);
  return input;
};

Kesigner.createNumber = function(propertyGroup, propertyItem, value) {
  let input = document.createElement('input');
  input.classList.add('group-item-input');
  input.setAttribute('data-group', propertyGroup.name);
  input.setAttribute('data-name', propertyItem.name);
  input.value = value;
  input.type = 'number';
  if (typeof propertyItem.change !== 'undefined') {
    input.addEventListener('input', propertyItem.change);
  }
  return input;
};

Kesigner.createMultiple = function(propertyGroup, value) {
  let rows = document.createElement('table');
  rows.classList.add('table', 'mb-0');

  let vals = value;
  for (let i = 0; (typeof vals !== 'undefined') && i < vals.length; i++) {
    let row = document.createElement('tr');

    let cell = document.createElement('td');
    cell.classList.add('p-0', 'b-t-0')

    let linkDetail = document.createElement('a');
    linkDetail.classList.add('btn', 'btn-link', 'float-right', 'pt-0');
    let iconDetail = document.createElement('i');
    iconDetail.classList.add('fas', 'fa-ellipsis-h');
    linkDetail.appendChild(iconDetail);

    let span = document.createElement('span');
    span.innerText = vals[i][propertyGroup.multiple[0].name];
    cell.appendChild(span);
    cell.appendChild(linkDetail);
    row.appendChild(cell);
    rows.appendChild(row);
  }
  return rows;
};

/**
 * 输入框值改变时回写值。
 */
Kesigner.value = function(selectable, group, item, value) {
  let values = JSON.parse(selectable.getAttribute('data-values'));
  for (let key in values) {
    if (key == group) {
      for (let keyInner in values[group]) {
        if (keyInner == item) {
          values[group][item] = value;
          break;
        }
      }
      break;
    }
  }
  selectable.setAttribute('data-values', JSON.stringify(values));
};

Kesigner.select = function(container, propertiesEditor, x, y) {
  Kesigner.unselect(container);
  let element = document.elementFromPoint(x, y);
  let selectable = Kesigner.findSelectableElement(element);
  if (selectable == null && propertiesEditor)  {
    propertiesEditor.clear();
    return;
  }
  selectable.classList.add('kesigner-selected');

  // 更新属性编辑
  let properties = Kesigner.getProperties(selectable.getAttribute('data-type'));
  let values = JSON.parse(selectable.getAttribute("data-values"));
  if (propertiesEditor)
    propertiesEditor.render(properties, values);
};

Kesigner.unselect = function(container) {
  let selected = container.querySelector('.kesigner-selected');
  if (selected != null) {
    selected.classList.remove('kesigner-selected');
  }
};

Kesigner.findSelectableElement = function(element) {
  if (element == null) return null;
  if (element.getAttribute('data-selectable') == 'true') return element;
  return Kesigner.findSelectableElement(element.parentElement);
};

////////////////////////////////////////////////////////////////////////////////
//
// PROPERTIES EDITOR
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.PropertiesEditor = function(containerId) {
  this.containerId = containerId;
};

Kesigner.PropertiesEditor.prototype.render = function(properties, values) {
  let container = document.getElementById(this.containerId);
  container.innerHTML = '';

  values = values || {};
  for (let i = 0; i < properties.length; i++) {
    this.createPropertyGroup(container, properties[i], values[properties[i].name]);
  }
};

Kesigner.PropertiesEditor.prototype.clear = function(properties, values) {
  let container = document.getElementById(this.containerId);
  container.innerHTML = '';
};

/**
 * @private
 */
Kesigner.PropertiesEditor.prototype.createPropertyGroup = function(container, propertyGroup, valueGroup) {
  let group = document.createElement('div');

  group.classList.add('group');
  group.setAttribute('data-name', propertyGroup.name);

  let h3 = document.createElement('div');
  h3.classList.add('group-title', 'mb-1', 'font-14');

  let link = document.createElement('a');
  let icon = document.createElement('i');
  link.addEventListener('click', function() {
    let group = this.parentElement.parentElement;
    let icon = this.querySelector('i');
    let groupBody = group.querySelector('.group-body');
    if (groupBody.style.display == 'none') {
      icon.classList.remove('icon-plus');
      icon.classList.add('icon-minus');
      groupBody.style.display = '';
    } else {
      icon.classList.remove('icon-minus');
      icon.classList.add('icon-plus');
      groupBody.style.display = 'none';
    }
  });
  if (propertyGroup.multiple) {
    let linkAdd = document.createElement('a');
    linkAdd.classList.add('btn', 'btn-link', 'float-right', 'pr-1');
    let iconAdd = document.createElement('i');
    iconAdd.classList.add('fas', 'fa-folder-plus');
    iconAdd.style.color = '#9093b1';
    linkAdd.appendChild(iconAdd);
    h3.appendChild(linkAdd);
  }

  link.classList.add('btn', 'btn-link');
  icon.classList.add('icon-minus');

  link.appendChild(icon);
  h3.appendChild(link);
  let span = document.createElement('span');
  span.innerText = propertyGroup.text;
  h3.appendChild(span);
  group.appendChild(h3);

  container.appendChild(group);

  let groupBody = document.createElement('div');
  groupBody.classList.add('group-body');
  groupBody.style.display = '';
  group.appendChild(groupBody);

  if (propertyGroup.multiple) {
    groupBody.appendChild(Kesigner.createMultiple(propertyGroup, valueGroup));
  }
  propertyGroup.items = propertyGroup.items || [];
  for (let i = 0; i < propertyGroup.items.length; i++) {
    let propertyItem = propertyGroup.items[i];
    this.createPropertyItem(groupBody, propertyGroup, propertyItem, valueGroup[propertyItem.name]);
  }
};

/**
 * @private
 */
Kesigner.PropertiesEditor.prototype.createPropertyItem = function (parent, propertyGroup, propertyItem, valueItem) {
  let div = document.createElement('div');
  div.classList.add('group-item');
  let label = document.createElement('label');
  label.classList.add('group-item-label');
  label.innerText = propertyItem.text + '：';

  div.appendChild(label);
  div.appendChild(Kesigner.getPropertyItem(propertyGroup, propertyItem, valueItem));

  parent.appendChild(div);
};

////////////////////////////////////////////////////////////////////////////////
//
// ROW LAYOUT
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Row = function () {

};

Kesigner.Row.prototype.html = function() {
  return `
  <div class="row kesigner-row" data-type="row"  style="height: 200px;" data-selectable="true"></div>
  `;
};

/**
 * Gets property model of row layout object.
 */
Kesigner.Row.prototype.properties = function () {
  return [{
    name: 'size',
    text: '大小',
    items: [{
      name: 'height',
      text: '高度',
      type: 'number',
      value: 200,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    }]
  }];
};

////////////////////////////////////////////////////////////////////////////////
//
// COLUMN LAYOUT
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Column = function () {

};

Kesigner.Column.prototype.html = function() {
  return `
  <div class="col-md-4 kesigner-column" style="height: 200px;" data-type="column" data-selectable="true"></div>
  `;
};

/**
 * Gets property model of row layout object.
 */
Kesigner.Column.prototype.properties = function () {
  return [{
    name: 'size',
    text: '大小',
    items: [{
      name: 'colspan',
      text: '列宽',
      type: 'range[1,12]',
      value: 4,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    },{
      name: 'height',
      text: '高度',
      type: 'number',
      value: 200,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    }]
  },{
    name: 'widget',
    text: '部件',
    items: [{
      name: 'name',
      text: '名称',
      type: 'select'
    },{
      name: 'options',
      text: '配置项',
      type: 'code'
    }]
  }];
};

////////////////////////////////////////////////////////////////////////////////
//
// PANEL
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Panel = function() {

};

Kesigner.Panel.prototype.html = function() {
  return `
  <div class="col-md-4" data-type="panel" data-selectable="true">
    <div class="card">
      <div class="card-header">标题</div>  
      <div class="card-body height200"></div>
    </div>
  </div>
  `;
};

Kesigner.Panel.prototype.properties = function() {
  return [{
    name: 'title',
    text: '标题栏',
    items: [{
      name: 'text', text: '标题', type: 'string', value: '标题',
      change: function() {
        let selectable = document.querySelector('.kesigner-selected');
        let cardHeader = selectable.querySelector('.card-header');
        cardHeader.innerText = this.value;
        Kesigner.value(selectable, this.getAttribute('data-group'), this.getAttribute('data-name'), this.value);
      }
    }, {
      name: 'parameterizable', text: '参数化', type: 'boolean', value: false
    }, {
      name: 'visible', text: '显示', type: 'boolean', value: true,
      change: function() {
        let selectable = document.querySelector('.kesigner-selected');
        let cardHeader = selectable.querySelector('.card-header');
        cardHeader.style.display = this.checked ? '' : 'none';
        Kesigner.value(selectable, this.getAttribute('data-group'), this.getAttribute('data-name'), this.checked);
      }
    }]
  }, {
    name: 'position',
    text: '位置及大小',
    items: [{
      name: 'colspan', text: '列宽', type: 'range[1,12]', value: 4,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    }]
  }, {
    name: 'preferences',
    text: '偏好',
    items: [{
      name: 'collapsible', text: '可折叠', type: 'boolean', value: false
    }]
  }, {
    name: 'actions',
    text: '菜单',
    multiple: true,
    items: [{
      name: 'name', text: '名称', type: 'string'
    }, {
      name: 'action', text: '操作', type: 'string', reference: 'action'
    }]
  }]
};

////////////////////////////////////////////////////////////////////////////////
//
// TABLE
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Table = function() {

};

Kesigner.Table.prototype.html = function () {
  return `
  <table class="table table-responsive-sm table-hover table-outline mb-0" data-type="table" data-selectable="true">
  <thead class="thead-light">
  <tr>
    <th class="text-center"></th>
    <th>用户</th>
    <th class="text-center">国籍</th>
    <th>用途</th>
    <th class="text-center">支付方式</th>
    <th>活动</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td class="text-center">
      <div class="c-avatar"><span class="c-avatar-status bg-success"></span></div>
    </td>
    <td>
      <div>Yiorgos Avraamu</div>
      <div class="small text-muted"><span>New</span> | Registered: Jan 1, 2015</div>
    </td>
    <td class="text-center">
      <i class="fa fa-flag"></i>
    </td>
    <td>
      <div class="clearfix">
        <div class="float-left"><strong>50%</strong></div>
        <div class="float-right"><small class="text-muted">Jun 11, 2015 - Jul 10, 2015</small></div>
      </div>
      <div class="progress progress-xs">
        <div class="progress-bar bg-gradient-success" role="progressbar" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </td>
    <td class="text-center">
      <i class="fa fa-cash-register"></i>
    </td>
    <td>
      <div class="small text-muted">Last login</div><strong>10 sec ago</strong>
    </td>
  </tr>
  </tbody>
</table>
  `
};

Kesigner.Table.prototype.properties = function() {
  return [{
    name: 'columns',
    text: '列',
    multiple: [{
      name: 'title',
      type: 'text'
    }, {
      name: 'name',
      type: 'text'
    }],
    value: [{
      title: '用户'
    },{
      title: '国籍'
    },{
      title: '用途'
    },{
      title: '支付方式'
    },{
      title: '活动'
    }]
  }, {
    name: 'operations',
    text: '操作',
    items: [{
      name: 'name', text: '名称', type: 'string'
    }, {
      name: 'action', text: '操作', type: 'string', reference: 'action'
    }]
  }]
};

////////////////////////////////////////////////////////////////////////////////
//
// FORM
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Form = function() {

};

Kesigner.Form.prototype.html = function() {
  return `
  <div class="col-md-12 pb-5" data-type="form" data-selectable="true">
    <div class="form form-horizontal">
      <div class="form-group row">
        <label class="col-md-2 col-form-label">姓名：</label>
        <div class="col-md-4">
          <input class="form-control">
        </div>
        <label class="col-md-2 col-form-label">手机：</label>
        <div class="col-md-4">
          <input class="form-control">
        </div>
      </div>
    </div>
    <div class="float-right">
      <button type="button" role="save" class="btn btn-sm btn-save">保存</button>
      <button type="button" role="back" class="btn btn-sm btn-back">返回</button>
    </div>
  </div>
  `;
};

Kesigner.Form.prototype.properties = function() {
  return [{
    name: 'fields',
    text: '表单项',
    multiple: [{
      name: 'label',
      text: '标题',
      type: 'string',
    }, {
      name: 'type',
      text: '类型',
      type: 'string'
    }, {
      name: 'required',
      text: '必填',
      type: 'boolean'
    }],
    value: [{
      label: '姓名',
      type: 'text',
    }, {
      label: '手机',
      type: 'text'
    }]
  }, {
    name: 'actions',
    text: '操作项',
    multiple: [{
      name: 'text',
      text: '标题',
      type: 'string',
    }, {
      name: 'role',
      text: '作用',
      type: 'string'
    }],
    value: [{
      text: '保存',
      role: 'save'
    }, {
      text: '返回',
      role: 'back'
    }]
  }]
};

////////////////////////////////////////////////////////////////////////////////
//
// Chart
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Chart = function() {

};

Kesigner.Chart.prototype.html = function () {
  return `
  <div class="col-md-4 height300" data-type="chart" data-selectable="true">
  </div>
  <script>
  data = [
    {date: '2020-01-01', group: '1', groupName: '药品', value0: 100, value1: 200},
    {date: '2020-01-02', group: '1', groupName: '药品', value0: 110, value1: 220},
    {date: '2020-01-03', group: '1', groupName: '药品', value0: 120, value1: 240},
    {date: '2020-01-04', group: '1', groupName: '药品', value0: 130, value1: 260},
    {date: '2020-01-05', group: '1', groupName: '药品', value0: 140, value1: 280},
    {date: '2020-01-06', group: '1', groupName: '药品', value0: 150, value1: 300},
    {date: '2020-01-07', group: '1', groupName: '药品', value0: 150, value1: 300},
    {date: '2020-01-01', group: '2', groupName: '耗材', value0: 100, value1: 200},
    {date: '2020-01-02', group: '2', groupName: '耗材', value0: 110, value1: 220},
    {date: '2020-01-03', group: '2', groupName: '耗材', value0: 120, value1: 240},
    {date: '2020-01-04', group: '2', groupName: '耗材', value0: 130, value1: 260},
    {date: '2020-01-05', group: '2', groupName: '耗材', value0: 140, value1: 280},
    {date: '2020-01-06', group: '2', groupName: '耗材', value0: 150, value1: 300},
    {date: '2020-01-07', group: '2', groupName: '耗材', value0: 150, value1: 300},
    {date: '2020-01-01', group: '3', groupName: '服务', value0: 100, value1: 200},
    {date: '2020-01-02', group: '3', groupName: '服务', value0: 110, value1: 220},
    {date: '2020-01-03', group: '3', groupName: '服务', value0: 120, value1: 240},
    {date: '2020-01-04', group: '3', groupName: '服务', value0: 130, value1: 260},
    {date: '2020-01-05', group: '3', groupName: '服务', value0: 140, value1: 280},
    {date: '2020-01-06', group: '3', groupName: '服务', value0: 150, value1: 300},
    {date: '2020-01-07', group: '3', groupName: '服务', value0: 150, value1: 300}
  ];
  chart.bar('.kesigner-selected', {
    values: [{
      name: 'value0',
      text: '毛利润',
      operator: 'sum',
      color: '#B71C1C'
    }, {
      name: 'value1',
      text: '销售额',
      operator: 'sum',
      color: '#0D47A1'
    }],
    category: {
      name: 'date'
    },
    data: data
  });
  </script>
  `;
};

Kesigner.Chart.prototype.properties = function () {
  return [{
    name: 'position',
    text: '位置及大小',
    items: [{
      name: 'colspan', text: '列宽', type: 'range[1,12]', value: 4,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    }]
  }, {
    name: 'dataset',
    text: '数据集',
    items: [{
      name: 'source', text: '来源', type: 'string', reference: 'dataset'
    }]
  }, {
    name: 'legend',
    text: '图例',
    multiple: true,
    items: [{
      name: 'source', text: '列名', type: 'string'
    }]
  }]
};
function MobileCanvas(opts) {
  /*!
  ** 常量设置，和手机背景图片密切相关。
  */
  const MOBILE_AREA_ASPECT_RATIO = 1284 / 2778;
  const MOBILE_IMAGE_WIDTH = 462;
  const MOBILE_IMAGE_HEIGHT = 900;
  const MOBILE_SAFE_AREA_TOP_LEFT_X = 15;
  const MOBILE_SAFE_AREA_TOP_LEFT_Y = 60;
  const MOBILE_SAFE_AREA_TOP_RIGHT_X = 446;
  const MOBILE_SAFE_AREA_TOP_RIGHT_Y = 60;
  const MOBILE_SAFE_AREA_BOT_LEFT_X = 15;
  const MOBILE_SAFE_AREA_BOT_LEFT_Y = 836;
  const MOBILE_SAFE_AREA_BOT_RIGHT_X = 446;
  const MOBILE_SAFE_AREA_BOT_RIGHT_Y = 836;
  const MOBILE_TOP_BAR_LEFT_X = 60;
  const MOBILE_TOP_BAR_LEFT_Y = 13;
  const MOBILE_TOP_BAR_RIGHT_X = 398;
  const MOBILE_TOP_BAR_RIGHT_Y = 13;

  const MOBILE_BOT_BAR_LEFT_X = 60;
  const MOBILE_BOT_BAR_LEFT_Y = 890;
  const MOBILE_BOT_BAR_RIGHT_X = 398;
  const MOBILE_BOT_BAR_RIGHT_Y = 890;

  const MOBILE_IMAGE_ASPECT_RATIO = MOBILE_IMAGE_WIDTH / MOBILE_IMAGE_HEIGHT;

  /*!
  ** 背景色，明亮模式和暗黑模式。
  */
  this.background = opts.background || 'white';
  this.skeletonBackground = 'rgba(0,0,0,0.17)';
  this.skeletonStroke = 'rgba(235,235,235)';
  this.propertiesEditor = opts.propertiesEditor;
  this.onSelectedElement = opts.onSelectedElement;

  this.contextMenu = dom.element(`
    <div class="context-menu" style="display: none;">
      <div class="context-menu-options">
        <div class="context-menu-option" widget-id="buttonCopy">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">content_copy</i>
          <span>复制</span>
        </div>
        <div class="context-menu-option" widget-id="buttonPaste">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">content_paste</i>
          <span>粘贴</span>
        </div>
      </div>
      <div style="border-bottom: 2px solid rgba(196,196,196,1);"></div>
      <div class="context-menu-options">
        <div class="context-menu-option" widget-id="buttonAlignLeft">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">format_align_left</i>
          <span>居左对齐</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignCenter">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">format_align_center</i>
          <span>居中对齐</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignRight">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">format_align_right</i>
          <span>居右对齐</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignJustify">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">format_align_justify</i>
          <span>两端对齐</span>
        </div>
      </div>
      <div style="border-bottom: 2px solid rgba(196,196,196,1);"></div>
      <div class="context-menu-options">
<!--        <div class="context-menu-option" widget-id="buttonAlignVerticalSpace">-->
<!--          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">align_space_even</i>-->
<!--          <span>上下间距</span>-->
<!--        </div>-->
        <div class="context-menu-option" widget-id="buttonAlignHorizontalSpace">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">align_justify_space_even</i>
          <span>左右间距</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignTop">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">align_start</i>
          <span>顶端对齐</span>
        </div>
        <div class="context-menu-option" widget-id="buttonAlignBottom">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">align_end</i>
          <span>底端对齐</span>
        </div>
      </div>
      <div style="border-bottom: 2px solid rgba(196,196,196,1);"></div>
      <div class="context-menu-options">
        <div class="context-menu-option text-danger font-bold" widget-id="buttonRemove">
          <i class="material-symbols-outlined font-16 position-relative" style="top: 3px;">delete</i>
          <span>删除</span>
        </div>
      </div>
    </div>
  `);
  dom.init(this, this.contextMenu);
  dom.bind(this.buttonCopy,  'click', async ev => {
    this.copyElements();
  });
  dom.bind(this.buttonPaste,  'click', ev => {
    this.pasteElements();
  });

  dom.bind(this.buttonAlignLeft,  'click', ev => {
    this.alignLeft();
  });
  dom.bind(this.buttonAlignCenter,  'click', ev => {
    this.alignCenter();
  });
  dom.bind(this.buttonAlignRight,  'click', ev => {
    this.alignRight();
  });
  dom.bind(this.buttonAlignJustify,  'click', ev => {
    this.alignJustify();
  });
  dom.bind(this.buttonAlignVerticalSpace,  'click', ev => {
    this.alignVerticalSpace();
  });
  dom.bind(this.buttonAlignHorizontalSpace,  'click', ev => {
    this.alignHorizontalSpace();
  });
  dom.bind(this.buttonAlignTop,  'click', ev => {
    this.alignTop();
  });
  dom.bind(this.buttonAlignBottom,  'click', ev => {
    this.alignBottom();
  });
  dom.bind(this.buttonRemove, 'click', ev => {
    this.removeElements();
  });

  /*!
  ** 用户设置的宽度。
  */
  this.width = opts.width || 360;
  this.height = this.width / MOBILE_IMAGE_ASPECT_RATIO;
  this.wheelDeltaY = 0;

  /*!
  ** 背景图片和绘图区域的实际比例。
  */
  this.scaleRatio = this.width / MOBILE_IMAGE_WIDTH;

  /*!
  ** 已经画上的元素。
  */
  this.drawnElements = [];
  this.images = {};
  this.mode = opts.mode || 'design';

  this.safeAreaTopLeftX = MOBILE_SAFE_AREA_TOP_LEFT_X * this.scaleRatio;
  this.safeAreaTopLeftY = MOBILE_SAFE_AREA_TOP_LEFT_Y * this.scaleRatio;
  this.safeAreaTopRightX = MOBILE_SAFE_AREA_TOP_RIGHT_X * this.scaleRatio;
  this.safeAreaTopRightY = MOBILE_SAFE_AREA_TOP_RIGHT_Y * this.scaleRatio;
  this.safeAreaBotLeftX = MOBILE_SAFE_AREA_BOT_LEFT_X * this.scaleRatio;
  this.safeAreaBotLeftY = MOBILE_SAFE_AREA_BOT_LEFT_Y * this.scaleRatio;
  this.safeAreaBotRightX = MOBILE_SAFE_AREA_BOT_RIGHT_X * this.scaleRatio;
  this.safeAreaBotRightY = MOBILE_SAFE_AREA_BOT_RIGHT_Y * this.scaleRatio;
  this.safeAreaWidth = this.safeAreaTopRightX - this.safeAreaTopLeftX;
  this.safeAreaHeight = this.safeAreaBotLeftY - this.safeAreaTopLeftY;

  this.topBarLeftX = MOBILE_TOP_BAR_LEFT_X * this.scaleRatio;
  this.topBarLeftY = MOBILE_TOP_BAR_LEFT_Y * this.scaleRatio;
  this.topBarRightX = MOBILE_TOP_BAR_RIGHT_X * this.scaleRatio;
  this.topBarRightY = MOBILE_TOP_BAR_RIGHT_Y * this.scaleRatio;

  this.botBarLeftX = MOBILE_BOT_BAR_LEFT_X * this.scaleRatio;
  this.botBarLeftY = MOBILE_BOT_BAR_LEFT_Y * this.scaleRatio;
  this.botBarRightX = MOBILE_BOT_BAR_RIGHT_X * this.scaleRatio;
  this.botBarRightY = MOBILE_BOT_BAR_RIGHT_Y * this.scaleRatio;

  this.paddingLeft = 12 * this.scaleRatio;
  this.paddingRight = 12 * this.scaleRatio;
}

MobileCanvas.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
  this.container.appendChild(this.contextMenu);
  /*!
  ** 容器的鼠标点击，同样释放画布的事件，通常用于拖拽等鼠标操作。
  */
  dom.bind(this.container, 'mouseup', ev => {
    ev.stopPropagation();
    const mouseup = new Event("mouseup");
    this.canvas.dispatchEvent(mouseup);
  });
  this.canvas = document.createElement('canvas');
  this.canvas.style.width = this.width + 'px';
  this.canvas.style.height = this.height + 'px';

  let dpr = window.devicePixelRatio || 1;
  this.canvas.width = this.width * dpr;
  this.canvas.height = this.height * dpr;
  this.context = this.canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  this.context.scale(dpr, dpr);
  this.backgroundImage = new Image(); // Create new img element
  this.backgroundImage.addEventListener("load", () => {
    this.redraw();
  }, false);
  this.backgroundImage.src = "/img/emulator/iphone-bg.png";

  this.container.appendChild(this.canvas);

  this.initialize();
};

MobileCanvas.prototype.restore = function () {
  let oldWheelDeltaY = this.wheelDeltaY;
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    el.y -= oldWheelDeltaY;
  }
  this.wheelDeltaY = 0;
  this.redraw();
};

function restoreWithAnimation() {
  let self = window['pageMobileDesign'].mobile;
  if (self.wheelDeltaY <= 0) {
    return;
  }
  const SPEED = 10;
  for (let i = 0; i < self.drawnElements.length; i++) {
    let el = self.drawnElements[i];
    el.y -= SPEED;
  }
  self.wheelDeltaY -= SPEED;
  if (self.wheelDeltaY < 0) {
    // 微调
    for (let i = 0; i < self.drawnElements.length; i++) {
      let el = self.drawnElements[i];
      el.y -= self.wheelDeltaY;
    }
    self.wheelDeltaY = 0;
  }
  self.redraw();
  window.requestAnimationFrame(restoreWithAnimation);
};

MobileCanvas.prototype.redraw = function () {
  this.context.clearRect(0, 0, this.width, this.height);

  this.buildSafeArea();

  // zero-y line
  // this.context.beginPath();
  // this.context.strokeStyle = 'rgba(0,0,0,0.17)';
  // this.context.setLineDash([10, 10]);
  // this.context.lineWidth = 3;
  // this.context.moveTo(
  //   this.safeAreaBotLeftX,
  //   this.topBarLeftY + this.wheelDeltaY,
  // );
  // this.context.lineTo(
  //   this.safeAreaBotRightX,
  //   this.topBarLeftY + this.wheelDeltaY,
  // );
  // this.context.stroke();
  // this.context.closePath();

  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    this.drawElement(el);
    /*!
    ** 在此属性值调整
    */
    if (el.selected === true) {
      this.propertiesEditor.render(this.getElementProperties(el));
    }
  }

  this.buildOuter();

  // background image
  this.context.drawImage(this.backgroundImage,
    0, 0,
    this.backgroundImage.naturalWidth, this.backgroundImage.naturalHeight,
    0, 0,
    this.width, this.height);
};

/*!
** 初始渲染安全区域。
*/
MobileCanvas.prototype.buildSafeArea = function () {
  this.context.fillStyle = this.background;
  this.context.fillRect(this.safeAreaTopLeftX, this.safeAreaTopLeftY, this.safeAreaWidth, this.safeAreaHeight);
};

MobileCanvas.prototype.buildOuter = function () {

  this.context.beginPath();
  this.context.strokeStyle = 'white';
  this.context.lineWidth = 8;
  this.context.moveTo(0, 0);
  this.context.lineTo(0, this.height);
  this.context.stroke();

  this.context.moveTo(this.width, 0);
  this.context.lineTo(this.width, this.height);
  this.context.stroke();
  this.context.closePath();

  // top-left
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(75, 75, 75, Math.PI, Math.PI * 1.5);
  this.context.lineTo(0, 0);
  this.context.fill();
  this.context.closePath();

  // top-right
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(this.width - 75, 75, 75, Math.PI * 1.5, Math.PI * 2);
  this.context.lineTo(this.width, 0);
  this.context.fill();
  this.context.closePath();

  // bottom-left
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(75, this.height - 75, 75, Math.PI / 2, Math.PI);
  this.context.lineTo(0, this.height);
  this.context.fill();
  this.context.closePath();

  // bottom-right
  this.context.beginPath();
  this.context.fillStyle = 'white';
  this.context.lineWidth = 2;
  this.context.arc(this.width - 75, this.height - 75, 75, 0, Math.PI / 2);
  this.context.lineTo(this.width, this.height);
  this.context.fill();
  this.context.closePath();
};

/*!
** 初始化设置。
*/
MobileCanvas.prototype.initialize = function () {
  dnd.setDroppable(this.canvas, (x, y, data) => {
    if (this.mode == 'simulate') return;
    this.drawNewElement(x, y, data);
  });

  this.canvas.addEventListener('contextmenu', ev => {
    ev.preventDefault();
    if (this.mode == 'simulate') return;
    let ox = ev.layerX - this.canvas.offsetLeft;
    let oy = ev.layerY - this.canvas.offsetTop;
    this.contextX = ox;
    this.contextY = oy;
    let found = this.findElementByXY(ox, oy);
    if (found != null) {
      // this.clearSelected();
      found.selected = true;
      this.redraw();
    }
    this.contextMenu.style.display = '';
    this.contextMenu.style.left = (ev.layerX + 5) + 'px';
    this.contextMenu.style.top = (ev.layerY + 5) + 'px';
  });

  dom.bind(this.canvas, 'mousedown', ev => {
    if (ev.which == 3 && ev.button == 2) return;
    /*!
    ** 模拟模式忽略。
    */
    if (this.mode == 'simulate') return;
    let isShift = !!ev.shiftKey;
    let found = this.findElementByXY(ev.layerX - this.canvas.offsetLeft, ev.layerY - this.canvas.offsetTop);
    /*!
    ** 没按住Shift键，就是单选。
    */
    if (!isShift) {
      this.clearSelected();
    }
    if (found != null) {
      found.selected = true;
      let ox = ev.layerX - this.canvas.offsetLeft;
      let oy = ev.layerY - this.canvas.offsetTop;
      if (this.canvas.style.cursor == 'w-resize' ||
          this.canvas.style.cursor == 'e-resize' ||
          this.canvas.style.cursor == 'n-resize' ||
          this.canvas.style.cursor == 's-resize') {
        this.resizingElement = found;
        this.resizingOffsetX = ox - found.x;
        this.resizingOffsetY = oy - found.y;
        this.resizingLeft = this.resizingElement.x;
        this.resizingRight = this.resizingElement.x + this.resizingElement.w;
        this.resizingTop = this.resizingElement.y;
        this.resizingBottom = this.resizingElement.y + this.resizingElement.h;
      } else {
        this.canvas.style.cursor = 'move';
        this.movingElement = found;
        this.movingOffsetX = ox - found.x;
        this.movingOffsetY = oy - found.y;

        // if (this.propertiesEditor) {
        //   this.propertiesEditor.render(this.getElementProperties(this.movingElement));
        // }
        if (this.onSelectedElement) {
          this.onSelectedElement(this.movingElement);
        }
      }
      this.redraw();
    } else {
      this.propertiesEditor.render({groups: []});
      for (let i = 0; i < this.drawnElements.length; i++) {
        this.drawnElements[i].selected = false;
      }
      this.redraw();
    }
  });

  dom.bind(this.canvas, 'mouseup', ev => {
    ev.stopPropagation();
    if (this.mode == 'simulate') return;
    this.canvas.style.cursor = 'default';
    this.movingElement = null;
    this.resizingElement = null;
    if (ev.which == 3 && ev.button == 2) return;
    this.contextMenu.style.display = 'none';
  });
  dom.bind(this.canvas, 'mousemove', ev => {
    if (this.mode == 'simulate') return;
    /*!
    ** 移动所选的对象。
    */
    let ox = ev.layerX - this.canvas.offsetLeft;
    let oy = ev.layerY - this.canvas.offsetTop;
    if (this.movingElement) {
      this.resizingElement = null;
      this.moveElement(this.movingElement, ox, oy);
    } else if (this.resizingElement) {
      this.movingElement = null;
      /*!
      ** 改变对象的大小。
      */
      if (this.canvas.style.cursor == 'w-resize') {
        this.resizeElementToWest(this.resizingElement, ox, oy);
      } else if (this.canvas.style.cursor == 'e-resize') {
        this.resizeElementToEast(this.resizingElement, ox, oy);
      } else if (this.canvas.style.cursor == 'n-resize') {
        this.resizeElementToNorth(this.resizingElement, ox, oy);
      } else if (this.canvas.style.cursor == 's-resize') {
        this.resizeElementToSouth(this.resizingElement, ox, oy);
      }

    } else {
      this.switchElementCursor(ev.layerX - this.canvas.offsetLeft, ev.layerY - this.canvas.offsetTop);
    }
  });
  dom.bind(this.canvas, 'wheel', ev => {
    if (this.wheelDeltaY > 0 && ev.wheelDeltaY >= 0) {
      clearTimeout(this.toPull2Refresh);
      this.toPull2Refresh = setTimeout(() => {
        restoreWithAnimation();
      }, 150);
    }
    this.renderAfterScrolling(ev.wheelDeltaY);
  });
};

MobileCanvas.prototype.renderAfterScrolling = function (deltaY) {
  // 所有元素都在顶部
  let areAllOverTop = true;
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if ((el.y + el.h) > 0) {
      areAllOverTop = false;
      break;
    }
  }
  if (areAllOverTop === true && deltaY < 0) return;

  let areAllUnderBottom = true;
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.y < this.height) {
      areAllUnderBottom = false;
      break;
    }
  }
  if (areAllUnderBottom === true && deltaY > 0) return;

  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    el.y += deltaY / 5;
  }
  this.wheelDeltaY += deltaY / 5;
  this.redraw();
};

MobileCanvas.prototype.switchElementCursor = function (x, y) {
  const THRESHOLD = 5;
  this.canvas.style.cursor = 'default';
  let found = this.findElementByXY(x, y);
  if (found == null) {
    return;
  }
  for (let i = 0; i < this.drawnElements.length; i++) {

    let el = this.drawnElements[i];
    if ((y - el.y) <= THRESHOLD && (y - el.y) > 0) {
      this.canvas.style.cursor = 'n-resize';
    }
    if ((el.y + el.h - y) <= THRESHOLD && (el.y + el.h - y) > 0) {
      this.canvas.style.cursor = 's-resize';
    }
    if ((x - el.x) <= THRESHOLD && (x - el.x) > 0) {
      this.canvas.style.cursor = 'w-resize';
    }
    if ((el.x + el.w - x) <= THRESHOLD && (el.x + el.w - x) > 0) {
      this.canvas.style.cursor = 'e-resize';
    }
  }
};

MobileCanvas.prototype.moveElement = function (el, ox, oy) {
  el.x = ox - this.movingOffsetX;
  el.y = oy - this.movingOffsetY;
  el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
  el.ry = (el.y - this.wheelDeltaY - this.topBarLeftY) / this.scaleRatio;
  this.propertiesEditor.render(this.getElementProperties(el));
  this.redraw();
}

MobileCanvas.prototype.resizeElementToWest = function (el, ox, oy) {
  el.x = ox - this.resizingOffsetX;
  el.rx = el.x / this.scaleRatio;
  el.w = this.resizingRight - el.x;
  el.rw = el.w / this.scaleRatio;
  if (el.type === 'avatar') {
    el.h = el.w;
    el.rh = el.h / this.scaleRatio;
  }
  this.redraw();
};

MobileCanvas.prototype.resizeElementToEast = function (el, ox, oy) {
  el.w = ox - this.resizingLeft;
  el.rw = el.w / this.scaleRatio;
  if (el.type === 'avatar') {
    el.h = el.w;
    el.rh = el.h / this.scaleRatio;
  }
  this.redraw();
};

MobileCanvas.prototype.resizeElementToNorth = function (el, ox, oy) {
  el.y = oy - this.resizingOffsetY;
  el.ry = el.y / this.scaleRatio;
  el.h = this.resizingBottom - el.y;
  el.rh = el.h / this.scaleRatio;
  if (el.type === 'avatar') {
    el.w = el.h;
    el.rw = el.w / this.scaleRatio;
  }
  this.redraw();
};

MobileCanvas.prototype.resizeElementToSouth = function (el, ox, oy) {
  el.h = oy - this.resizingTop;
  el.rh = el.h / this.scaleRatio;
  if (el.type === 'avatar') {
    el.w = el.h;
    el.rw = el.w / this.scaleRatio;
  }
  this.redraw();
};

MobileCanvas.prototype.drawParagraph = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.beginPath();
  let startX = el.x;
  let startY = el.y;
  let count = el.h / 28 - 1;
  for (let i = 0; i < count; i++) {
    this.context.fillRect(startX, startY, el.w, 20);
    startY += 28;
  }
  this.context.fillRect(startX, startY, el.w * 0.68, 20);
  this.context.closePath();
};

MobileCanvas.prototype.drawImage = function (el) {
  if (el.url) {
    let img = this.images[el.url];
    if (img == null) {
      img = new Image();
      img.addEventListener("load", () => {
        this.context.drawImage(img, el.x, el.y, el.w, el.h);
      }, false);
      img.src = el.url;
      this.images[el.url] = img;
    } else {
      this.context.drawImage(img, el.x, el.y, el.w, el.h);
    }
  } else {
    this.drawImageSkeleton(el);
  }
};

MobileCanvas.prototype.drawImageSkeleton = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
  let iw = 0;
  if (el.w > el.h)
    iw = el.h * 0.80;
  else
    iw = el.w * 0.80;

  let ih = iw * 0.68;

  let x = el.x + (el.w - iw) / 2;
  let y = el.y + (el.h - ih) / 2;

  const lw = 8;
  this.context.beginPath();
  this.context.lineWidth = 8;
  this.context.setLineDash([]);
  this.context.strokeStyle = this.skeletonStroke;
  this.context.moveTo(x, y);
  this.context.lineTo(x + iw, y);
  this.context.lineTo(x + iw, y + ih);
  this.context.lineTo(x, y + ih);
  this.context.lineTo(x, y - lw / 2);
  this.context.stroke();
  this.context.closePath();

  this.context.fillStyle = this.skeletonStroke;
  // SUN
  this.context.beginPath();
  let cx = x + iw / 4;
  let cy = y + ih / 3;
  this.context.arc(cx, cy, ih / 6, 0, 2 * Math.PI);
  this.context.fill();
  this.context.closePath();

  // HILLS
  this.context.beginPath();
  let hx = x + iw / 4 - ih / 6;
  let hy = y + ih - lw * 1.5;
  let hw = iw / 4;
  let hh = ih / 3;
  this.context.moveTo(hx, hy);
  this.context.lineTo(hx + hw, hy - hh);
  this.context.lineTo(hx + hw * 2, hy);
  this.context.lineTo(hx, hy);
  this.context.fill();

  hx = x + iw / 4;
  hy = y + ih - lw * 1.5;
  hw = iw / 3;
  hh = ih / 2;
  this.context.moveTo(hx, hy);
  this.context.lineTo(hx + hw, hy - hh);
  this.context.lineTo(hx + hw * 2, hy);
  this.context.lineTo(hx, hy);
  this.context.fill();
  this.context.closePath();
};

MobileCanvas.prototype.drawAvatar = function (el) {
  this.context.fillStyle = this.skeletonBackground;

  let cx = el.x + el.w / 2;
  let cy = el.y + el.w / 2;

  this.context.beginPath();
  this.context.arc(cx, cy, el.w / 2, 0, 2 * Math.PI);
  this.context.fill();
  this.context.closePath();
};

MobileCanvas.prototype.drawText = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
};

MobileCanvas.prototype.drawBlock = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  this.context.fillRect(el.x, el.y, el.w, el.h);
};

MobileCanvas.prototype.drawElement = function (el) {
  this.context.fillStyle = this.skeletonBackground;
  if (el.type == 'title') {
    if (!el.w) {
      el.rw = 120;
      el.rh = 32;
      el.w = el.rw * this.scaleRatio;
      el.h = el.rh * this.scaleRatio;
    }
    this.drawText(el);
  } else if (el.type == 'paragraph') {
    el.w = el.w || this.safeAreaWidth;
    el.h = el.h || 132;
    el.rw = el.w / this.scaleRatio;
    el.rh = el.h / this.scaleRatio;
    this.drawParagraph(el);
  } else if (el.type == 'block') {
    if (!el.w) {
      el.w = el.h = 60;
    }
    el.rw = el.w / this.scaleRatio;
    el.rh = el.h / this.scaleRatio;
    this.drawBlock(el);
  } else if (el.type == 'image') {
    el.w = el.w || this.safeAreaWidth;
    el.h = el.h || 120;
    el.rw = el.w / this.scaleRatio;
    el.rh = el.h / this.scaleRatio;
    this.drawImage(el);
  } else if (el.type == 'avatar') {
    if (!el.w) {
      el.w = el.h = 60;
      el.rw = el.w / this.scaleRatio;
      el.rh = el.h / this.scaleRatio;
    }
    this.drawAvatar(el);
  }
  if (el.selected === true) {
    let lw = 2;
    this.context.beginPath();
    this.context.strokeStyle = '#39f';
    this.context.setLineDash([]);
    this.context.lineWidth = lw;
    let x = el.x + lw, y = el.y + lw / 2, w = el.w - lw * 2, h = el.h - lw;
    this.context.moveTo(x, y);
    this.context.lineTo(x + w, y);
    this.context.lineTo(x + w, y + h);
    this.context.lineTo(x, y + h);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.context.closePath();
  }
};

 MobileCanvas.prototype.drawNewElement = function (x, y, data, translated/*坐标是否已经转换*/) {
  translated = translated === true;
  let el;
  if (!translated) {
    // 通过拖拽实际Canvas的坐标
    let ox = x;
    let oy = y;
    if (MobileCanvas.offsetX) {
      ox -= MobileCanvas.offsetX;
    }
    if (MobileCanvas.offsetY) {
      oy -= MobileCanvas.offsetY;
    }

    el = {
      x: ox, y: oy, ...data,
      rx: (ox - this.safeAreaTopLeftX) / this.scaleRatio,
      ry: (oy - this.wheelDeltaY - this.topBarLeftY) / this.scaleRatio,
    };
  } else {
    // 用户通过参数传入的用户可读的坐标
    let rx = x;
    let ry = y;

    x = rx * this.scaleRatio + this.safeAreaTopLeftX;
    y = ry * this.scaleRatio + this.topBarLeftY;
    el = {
      x: x, y: y, ...data,
      rx: rx,
      ry: ry,
    };
  }

  this.drawnElements.push(el);

  // 保证图层的顺序，必须重绘
  this.redraw();
};

MobileCanvas.prototype.findElementByXY = function (x, y) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (x > el.x && x < el.x + el.w && y > el.y && y < el.y + el.h) {
      return el;
    }
  }
  return null;
};

MobileCanvas.prototype.findElementById = function (id) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.id === id) {
      return el;
    }
  }
  return null;
};

MobileCanvas.prototype.findTopmostElement = function () {
  let minY = 100000;
  let ret = null;
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.y < minY) {
      ret = el;
      minY = el.y;
    }
  }
  return ret;
};

MobileCanvas.prototype.clearSelected = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    this.drawnElements[i].selected = false;
  }
};

MobileCanvas.prototype.removeElements = function () {
  let newElements = [];
  for (let i = 0; i < this.drawnElements.length; i++) {
    if (this.drawnElements[i].selected !== true) {
      newElements.push(this.drawnElements[i]);
    }
  }
  this.drawnElements = newElements;
  this.redraw();
};

MobileCanvas.prototype.switchMode = function () {
  if (this.mode == 'design') {
    this.mode = 'simulate';
    this.clearSelected();
    this.redraw();
  } else {
    this.mode = 'design';
  }
};

MobileCanvas.prototype.changeElement = function (prop) {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected === true) {
      for (let key in prop) {
        if (key === 'rx') {
          el.x = (parseInt(prop[key]) * this.scaleRatio + this.safeAreaTopLeftX) ;
        } else if (key === 'ry') {
          el.y = (parseInt(prop[key]) * this.scaleRatio + this.topBarLeftY + this.wheelDeltaY);
        } else if (key === 'rw') {
          el.w = parseInt(prop[key]) * this.scaleRatio;
        } else if (key === 'rh') {
          el.h = parseInt(prop[key]) * this.scaleRatio;
        }
        el[key] = prop[key];
      }
      this.redraw();
      break;
    }
  }
};

MobileCanvas.prototype.clear = function () {
  this.drawnElements = [];
  this.redraw();
};

MobileCanvas.prototype.getElementProperties = function (el) {
  let ret = {
    groups: [{
      title: '位置',
      properties: [{
        title: 'X',
        name: 'rx',
        input: 'number',
        value: el.rx,
      },{
        title: 'Y',
        name: 'ry',
        input: 'number',
        value: el.ry,
      },{
        title: '宽度',
        name: 'rw',
        input: 'number',
        value: el.rw,
      },{
        title: '高度',
        name: 'rh',
        input: 'number',
        value: el.rh,
      }]
    },{
      title: '其他',
      properties: [{
        title: '备注',
        name: 'note',
        input: 'longtext',
      }],
    }]
  };
  return ret;
};

MobileCanvas.prototype.copyElements = function () {
  let els = this.getSelectedElements();
  if (els.length == 0) return;
  this.copiedElements = els;
};

MobileCanvas.prototype.pasteElements = function () {
  for (let i = 0; i < this.copiedElements.length; i++) {
    let el = this.copiedElements[i];
    let cloned = {...el};
    cloned.x = this.contextX;
    cloned.y = this.contextY;
    this.drawNewElement(this.contextX, this.contextY, cloned, false);
  }
};

MobileCanvas.prototype.alignLeft = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected) {
      el.x = this.safeAreaBotLeftX;
      el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
      this.redraw();
      break;
    }
  }
};

MobileCanvas.prototype.alignCenter = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected) {
      el.x = (this.safeAreaTopRightX - el.w) / 2;
      el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
      this.redraw();
      break;
    }
  }
};

MobileCanvas.prototype.alignRight = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected) {
      el.x = this.safeAreaTopRightX - el.w;
      el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
      this.redraw();
      break;
    }
  }
};

MobileCanvas.prototype.alignJustify = function () {
  for (let i = 0; i < this.drawnElements.length; i++) {
    let el = this.drawnElements[i];
    if (el.selected) {
      el.x = this.safeAreaBotLeftX;
      el.rx = (el.x - this.safeAreaTopLeftX) / this.scaleRatio;
      el.w = this.safeAreaWidth;
      el.rw = el.w / this.scaleRatio;
      this.redraw();
      break;
    }
  }
};

MobileCanvas.prototype.alignVerticalSpace = function () {
  let selectedElements = this.getSelectedElements();
  let len = selectedElements.length;
  if (len <= 2) return;
};

MobileCanvas.prototype.alignHorizontalSpace = function () {
  let selectedElements = this.getSelectedElements();
  let len = selectedElements.length;
  if (len <= 1) return;
  let occupiedSpace = 0;
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    occupiedSpace += el.w;
  }
  let space = (this.safeAreaWidth - occupiedSpace) / (len + 1);
  if (space < 0) return;
  selectedElements.sort((a, b) => {
    if (a.x < b.x) {
      return;
    }
    return -1;
  });
  let offsetX = this.safeAreaTopLeftX;
  for (let i = 0; i < selectedElements.length; i++) {
    offsetX += space;
    let el = selectedElements[i];
    el.x = offsetX;
    el.rx = el.x / this.scaleRatio;
    offsetX += el.w;
  }
  this.redraw();
};

MobileCanvas.prototype.alignTop = function () {
  let selectedElements = this.getSelectedElements();
  let len = selectedElements.length;
  if (len <= 1) return;
  let minY = 999999, minEl = null;
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    if (el.y < minY) {
      minY = el.y;
      minEl = el;
    }
  }
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    el.y = minEl.y;
    el.ry = minEl.ry;
  }
  this.redraw();
};

MobileCanvas.prototype.alignBottom = function () {
  let selectedElements = this.getSelectedElements();
  let len = selectedElements.length;
  if (len <= 1) return;
  let maxY = 0, maxEl = null;
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    if ((el.y + el.h) > maxY) {
      maxY = el.y + el.h;
      maxEl = el;
    }
  }
  for (let i = 0; i < selectedElements.length; i++) {
    let el = selectedElements[i];
    el.y = (maxEl.y + maxEl.h) - el.h;
    el.ry = el.y / this.scaleRatio;
  }
  this.redraw();
};



MobileCanvas.prototype.getSelectedElements = function () {
  let ret = [];
  for (let i = 0; i < this.drawnElements.length; i++) {
    if (this.drawnElements[i].selected === true) {
      ret.push(this.drawnElements[i]);
    }
  }
  return ret;
};

function MobileDesigner(opt) {

}

MobileDesigner.GridButtons = function(opt) {
  // 栅格列数
  this.columnCount = opt.columnCount;
  // 瓦片风格
  this.tileStyle = opt.tileStyle;
  //
  this.elRoot = dom.element(`
    <div class="square-menu"></div>
  `);
  this.elTile = dom.element(`
    <a class="entry btn">
      <div class="d-flex flex-column">
        <i class="fas fa-monument text-gray font-4xl"></i>
        <span class="font-14 text-gray mt-2">功能入口</span>
      </div>
    </a>
  `);
  this.elPlaceHolder = dom.element(`
    <div class="entry btn"></div>
  `);
};

MobileDesigner.GridButtons.prototype.placeholder = function() {
  let ret = this.elRoot.cloneNode();
  for (let i = 0; i < 8; i++) {
    let tile = this.elTile.cloneNode(true);
    ret.appendChild(tile);
  }
  let pl = this.elPlaceHolder.cloneNode();
  ret.appendChild(pl);
  return ret;
};


function MobileFrame(opts) {
  /*!
  ** 背景色，明亮模式和暗黑模式。
  */
  this.url = opts.url;
  this.width = opts.width;
}

MobileFrame.prototype.render = function (containerId) {
  /*!
  ** 常量设置，和手机背景图片密切相关。
  */
  const MOBILE_AREA_ASPECT_RATIO = 1284 / 2778;
  const MOBILE_IMAGE_WIDTH = 462;
  const MOBILE_IMAGE_HEIGHT = 900;
  const MOBILE_SAFE_AREA_TOP_LEFT_X = 15;
  const MOBILE_SAFE_AREA_TOP_LEFT_Y = 60;
  const MOBILE_SAFE_AREA_TOP_RIGHT_X = 446;
  const MOBILE_SAFE_AREA_TOP_RIGHT_Y = 60;
  const MOBILE_SAFE_AREA_BOT_LEFT_X = 15;
  const MOBILE_SAFE_AREA_BOT_LEFT_Y = 836;
  const MOBILE_SAFE_AREA_BOT_RIGHT_X = 446;
  const MOBILE_SAFE_AREA_BOT_RIGHT_Y = 836;
  const MOBILE_TOP_BAR_LEFT_X = 60;
  const MOBILE_TOP_BAR_LEFT_Y = 13;
  const MOBILE_TOP_BAR_RIGHT_X = 398;
  const MOBILE_TOP_BAR_RIGHT_Y = 13;

  const MOBILE_BOT_BAR_LEFT_X = 60;
  const MOBILE_BOT_BAR_LEFT_Y = 890;
  const MOBILE_BOT_BAR_RIGHT_X = 398;
  const MOBILE_BOT_BAR_RIGHT_Y = 890;

  const MOBILE_IMAGE_ASPECT_RATIO = MOBILE_IMAGE_WIDTH / MOBILE_IMAGE_HEIGHT;

  this.container = dom.find(containerId);

  let rect = this.container.getBoundingClientRect();
  let ratio = rect.height / MOBILE_IMAGE_HEIGHT;

  let width = this.width;
  let height = 0;
  if (!width) {
    height = ratio * MOBILE_IMAGE_HEIGHT;
    width = height * MOBILE_IMAGE_ASPECT_RATIO;
  } else {
    height = width / MOBILE_IMAGE_ASPECT_RATIO;
  }
  this.width = width;

  this.scaleRatio = this.width / MOBILE_IMAGE_WIDTH;

  this.safeAreaTopLeftX = MOBILE_SAFE_AREA_TOP_LEFT_X * this.scaleRatio;
  this.safeAreaTopLeftY = MOBILE_SAFE_AREA_TOP_LEFT_Y * this.scaleRatio;
  this.safeAreaTopRightX = MOBILE_SAFE_AREA_TOP_RIGHT_X * this.scaleRatio;
  this.safeAreaTopRightY = MOBILE_SAFE_AREA_TOP_RIGHT_Y * this.scaleRatio;
  this.safeAreaBotLeftX = MOBILE_SAFE_AREA_BOT_LEFT_X * this.scaleRatio;
  this.safeAreaBotLeftY = MOBILE_SAFE_AREA_BOT_LEFT_Y * this.scaleRatio;
  this.safeAreaBotRightX = MOBILE_SAFE_AREA_BOT_RIGHT_X * this.scaleRatio;
  this.safeAreaBotRightY = MOBILE_SAFE_AREA_BOT_RIGHT_Y * this.scaleRatio;
  this.safeAreaWidth = this.safeAreaTopRightX - this.safeAreaTopLeftX;
  this.safeAreaHeight = this.safeAreaBotLeftY - this.safeAreaTopLeftY;

  this.topBarLeftX = MOBILE_TOP_BAR_LEFT_X * this.scaleRatio;
  this.topBarLeftY = MOBILE_TOP_BAR_LEFT_Y * this.scaleRatio;
  this.topBarRightX = MOBILE_TOP_BAR_RIGHT_X * this.scaleRatio;
  this.topBarRightY = MOBILE_TOP_BAR_RIGHT_Y * this.scaleRatio;

  this.botBarLeftX = MOBILE_BOT_BAR_LEFT_X * this.scaleRatio;
  this.botBarLeftY = MOBILE_BOT_BAR_LEFT_Y * this.scaleRatio;
  this.botBarRightX = MOBILE_BOT_BAR_RIGHT_X * this.scaleRatio;
  this.botBarRightY = MOBILE_BOT_BAR_RIGHT_Y * this.scaleRatio;

  this.safeAreaWidth = this.safeAreaTopRightX - this.safeAreaTopLeftX;
  this.safeAreaHeight = this.safeAreaBotRightY - this.safeAreaTopRightY;

  this.paddingLeft = 12 * this.scaleRatio;
  this.paddingRight = 12 * this.scaleRatio;

  let img = dom.create('img', 'm-auto');
  img.src = '/img/emulator/iphone-bg.png';
  img.style.width = width + 'px';
  img.style.height = height + 'px';

  this.container.appendChild(img);

  const top = img.offsetTop;
  const left = img.offsetLeft;
  this.iframe = dom.create('iframe', 'position-absolute', 'border-less');
  this.iframe.frameborder = 'none';
  this.iframe.src = this.url;
  this.iframe.style.left = (left + this.safeAreaTopLeftX + 1) + 'px';
  this.iframe.style.top = (top + this.safeAreaTopLeftY + 1) + 'px';
  this.iframe.style.width = (this.safeAreaWidth - 2)  + 'px';
  this.iframe.style.height = (this.safeAreaHeight - 2) + 'px';
  this.container.appendChild(this.iframe);
};

MobileFrame.prototype.preview = function (html, callback) {
  let body = this.iframe.contentWindow.document.body;
  body.innerHTML = html;
  body.querySelectorAll('img').forEach(img => {
    img.style.width = "100%";
  });
  if (callback) {
    callback(body);
  }
};



function NetworkTopology(opts) {
  this.onCellDoubleClicked = opts.onCellDoubleClicked;
  this.readonly = opts.readonly === true;
}

NetworkTopology.prototype.addItem2Graph = function (graph, toolbar, prototype, image)
{
  // Function that is executed when the image is dropped on
  // the this.graph. The cell argument points to the cell under
  // the mousepointer if there is one.
  let dropOnGraph = function(graph, evt, cell, x, y) {
    graph.stopEditing(false);

    let vertex = graph.getModel().cloneCell(prototype);
    vertex.geometry.x = x;
    vertex.geometry.y = y;
    // vertex.style[mxConstants.STYLE_IMAGE] = image;

    graph.addCell(vertex);
    graph.setSelectionCell(vertex);
  };

  // Creates the image which is used as the drag icon (preview)
  let img = toolbar.addMode(null, image, function(evt, cell) {
    let pt = this.this.graph.getPointForEvent(evt);
    dropOnGraph(graph, evt, cell, pt.x, pt.y);
  });
  img.width = 32;

  // Disables dragging if element is disabled. This is a workaround
  // for wrong event order in IE. Following is a dummy listener that
  // is invoked as the last listener in IE.
  mxEvent.addListener(img, 'mousedown', function(evt)
  {
    // do nothing
  });

  // This listener is always called first before any other listener
  // in all browsers.
  mxEvent.addListener(img, 'mousedown', function(evt)
  {
    if (img.enabled == false)
    {
      mxEvent.consume(evt);
    }
  });

  mxUtils.makeDraggable(img, graph, dropOnGraph);

  return img;
}

NetworkTopology.prototype.setup = function() {
  let self = this;
  // Defines an icon for creating new connections in the connection handler.
  // This will automatically disable the highlighting of the source vertex.
  mxConnectionHandler.prototype.connectImage = new mxImage('img/network/connector.gif', 16, 16);
  mxEdgeHandler.prototype.removeEnabled = true;

  // Creates the div for the toolbar
  let tbContainer = document.createElement('div');
  tbContainer.style.position = 'absolute';
  tbContainer.style.overflow = 'hidden';
  tbContainer.style.padding = '2px';
  tbContainer.style.left = '0px';
  tbContainer.style.top = '0px';
  tbContainer.style.width = '42px';
  tbContainer.style.bottom = '0px';

  this.container.appendChild(tbContainer);

  // Creates new toolbar without event processing
  let toolbar = new mxToolbar(tbContainer);
  toolbar.enabled = false;

  // Creates the div for the graph
  let container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.overflow = 'hidden';
  container.style.left = '0px';
  container.style.top = '0px';
  container.style.right = '0px';
  container.style.bottom = '0px';
  container.style.background = 'url("img/editors/images/grid.gif")';

  this.container.appendChild(container);

  // Workaround for Internet Explorer ignoring certain styles
  if (mxClient.IS_QUIRKS)
  {
    document.body.style.overflow = 'hidden';
    new mxDivResizer(tbContainer);
    new mxDivResizer(container);
  }

  let model = new mxGraphModel();
  this.graph = new mxGraph(container, model);

  if (this.readonly === true) {
    this.graph.setCellsLocked(true);
    this.graph.setConnectable(false);
  } else {
    this.graph.setConnectable(true);
    this.graph.setCellsLocked(false);
    this.graph.setCellsEditable(false);
  }
  this.graph.setMultigraph(false);

  let style = this.graph.getStylesheet().getDefaultEdgeStyle();
  style[mxConstants.STYLE_ROUNDED] = true;
  style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
  style[mxConstants.STYLE_STARTARROW] = 'oval';
  style[mxConstants.STYLE_ENDARROW] = 'oval';
  // this.graph.alternateEdgeStyle = 'elbow=vertical';

  // Stops editing on enter or escape keypress
  let keyHandler = new mxKeyHandler(this.graph);
  let rubberband = new mxRubberband(this.graph);
  keyHandler.bindKey(46, function(evt)
  {
    if (self.graph.isEnabled()) {
      let selected = self.graph.getSelectionCell();
      self.graph.removeCells();
    }
  });

  // Enables new connections in the graph

  this.graph.convertValueToString = function(cell)
  {
    if (cell.value && cell.value.label) {
      return cell.value.label;
    }
    return '';
  };
  let cellLabelChanged = this.graph.cellLabelChanged;
  this.graph.cellLabelChanged = function(cell, newValue, autoSize) {
    if (mxUtils.isNode(cell.value)) {
      // Clones the value for correct undo/redo
      let elt = cell.value.cloneNode(true);
      elt.setAttribute('label', newValue);
      newValue = cell.oldValue;
      newValue.label = cell.value;
    }
    cell.value.label = newValue;
    newValue = cell.value;
    cellLabelChanged.apply(this, arguments);
  };

  if (this.readonly !== true) {
    let addItem2Toolbar = function (type, w, h) {
      let style = 'verticalLabelPosition=bottom;verticalAlign=top;shape=image;image=' + self.getImage(type);
      let vertex = new mxCell({type: type}, new mxGeometry(0, 0, w, h), style);
      vertex.setVertex(true);

      let img = self.addItem2Graph(self.graph, toolbar, vertex, self.getImage(type));
      img.enabled = true;
    };

    addItem2Toolbar('pc', 33, 33,);
    addItem2Toolbar('server', 28, 40);
    addItem2Toolbar('database', 42, 33);
    addItem2Toolbar('router', 49, 33);
    addItem2Toolbar('switch-l2', 65, 32);
    addItem2Toolbar('switch-l3', 63, 63);
    addItem2Toolbar('ups', 51, 33);
    addItem2Toolbar('cloud', 109, 63);
  }

  this.bindEvents();
};

NetworkTopology.prototype.bindEvents = function() {
  let self = this;
  this.graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt) {

  });

  this.graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt) {
    self.onCellDoubleClicked(evt.properties['cell']);
  });

  this.graph.addListener(mxEvent.CELLS_MOVED, function(sender, evt) {
    // console.log(self.getData());
  });

  this.graph.addListener(mxEvent.CELLS_ADDED, function(sender, evt) {
    // console.log(self.getData());
  });

  this.graph.addListener(mxEvent.CELLS_REMOVED, function(sender, evt) {
    // console.log(self.getData());
  });

  // this.graph.addListener(mxEvent.LABEL_CHANGED, function(sender, evt) {
  //   console.log(evt.properties['cell']);
  //   let cell = evt.properties['cell'];
  //   let label = evt.properties['value'];
  //   self.graph.getModel().setValue(cell, {
  //     value: label,
  //     type: cell.value.type
  //   });
  // });
};

NetworkTopology.prototype.getImage = function(type) {
  if (type == 'pc') {
    return 'img/network/symbol/pc.svg';
  } else if (type == 'server') {
    return 'img/network/symbol/server.svg';
  } else if (type == 'database') {
    return 'img/network/symbol/database.svg';
  } else if (type == 'router') {
    return 'img/network/symbol/router.svg';
  } else if (type == 'switch-l2') {
    return 'img/network/symbol/switch-l2.svg';
  } else if (type == 'switch-l3') {
    return 'img/network/symbol/switch-l3.svg';
  } else if (type == 'ups') {
    return 'img/network/symbol/ups.svg';
  } else if (type == 'cloud') {
    return 'img/network/symbol/cloud.svg'
  }
};

NetworkTopology.prototype.getData = function() {
  let ret = [];
  for (let index in this.graph.getModel().cells) {
    let cell = this.graph.getModel().cells[index];
    if (cell.vertex) {
      ret.push({
        id: cell.id,
        vertex: true,
        x: cell.geometry.x,
        y: cell.geometry.y,
        width: cell.geometry.width,
        height: cell.geometry.height,
        style: cell.style,
        type: cell.value.type
      });
    } else if (cell.edge) {
      ret.push({
        id: cell.id,
        edge: true,
        source: cell.source.id,
        target: cell.target.id
      });
    }
  }
  return ret;
};

NetworkTopology.prototype.render = function(container, data) {
  data = data || [];
  this.container = dom.find(container);
  this.setup();

  this.container.querySelectorAll('div').forEach( function(div) {
    div.style.position = 'relative';
    div.style.height = '100%';
  });

  let vertice = [];
  function getVertex(id) {
    for (let i = 0; i < vertice.length; i++) {
      if (id === vertice[i].id) return vertice[i];
    }
  }

  // vertex
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.edge) continue;
    let style = 'verticalLabelPosition=bottom;verticalAlign=top;shape=image;image=' + this.getImage(row.type);
    vertice.push(this.graph.insertVertex(null, row.id, {type: row.type},
      row.x, row.y, row.width, row.height, style));
  }

  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    if (row.vertex) continue;
    this.graph.insertEdge(null, row.id, {}, getVertex(row.source), getVertex(row.target));
  }
};



/**
 * 属性编辑器构造函数。
 * <p>
 * 参数包括：
 * 1. containerId     容器的DOM标识
 * 2. properties      属性数组配置项
 *   2.1. id          属性的编辑标识
 *   2.2. label       属性的显示文本
 *   2.3. input       属性的输入类型，可以为text或者dialog
 *   2.4. readonly    属性编辑框不可编辑，为只读 
 *   2.5. display     属性在输入框中的显示内容
 * 3. confirm         对话框确认后的回调函数
 * 
 * @param {object} options
 *        属性编辑器的构造参数
 * 
 * @since 1.0
 */
function PropertiesEditor(options) {
  this.timeout = 500;
  this.containerId = options.containerId;
  this.confirm = options.confirm || function () {};
  this.propertyChangedListeners = [];
}

PropertiesEditor.getPropertiesValues = function(model) {
  let ret = {};
  for (let i = 0; i < model.groups.length; i++) {
    let group = model.groups[i];
    for (let j = 0; j < group.properties.length; j++) {
      let prop = group.properties[j];
      if (Array.isArray(prop.value)) {
        ret[prop.name] = [];
        let item = {};
        for (let m = 0; m < prop.value.length; m++) {
          let itemProp = prop.value[m];
          item[itemProp.name] = itemProp.value;
          ret[prop.name].push(item);
        }
      } else {
        ret[prop.name] = prop.value || '';
      }
    }
  }
  return ret;
};

PropertiesEditor.prototype.addPropertyChangedListener = function (listener) {
  this.propertyChangedListeners.push(listener);
};

PropertiesEditor.prototype.notifyPropertyChangedListeners = function (prop) {
  for (let i = 0; i < this.propertyChangedListeners.length; i++) {
    this.propertyChangedListeners[i].onPropertyChanged(prop);
  }
};

PropertiesEditor.prototype.onModelChanged = function (model) {
  this.setPropertiesValues(model);
};

PropertiesEditor.prototype.clear = function (prop) {
  let container = dom.find(this.containerId);
  container.innerHTML = '';
};

/**
 * 在父容器下渲染属性编辑器。
 * 
 * @since 1.0
 */
PropertiesEditor.prototype.render = function(element) {
  let self = this;
  let elementProperties = [];
  if (element.getProperties) elementProperties = element.getProperties();
  else elementProperties = element.groups;

  if (!elementProperties) {
    elementProperties = [];
  }

  let container = dom.find(this.containerId);
  container.innerHTML = '';
  for (let i = 0; i < elementProperties.length; i++) {
    let group = elementProperties[i];
    let divGroup = document.createElement('div');
    divGroup.classList.add('group');

    let h3Group = document.createElement('h3');
    h3Group.classList.add('group-title');

    let linkGroup = document.createElement('a');
    let iconGroup = document.createElement('i');

    linkGroup.classList.add('btn', 'btn-link');
    iconGroup.classList.add('icon-minus');

    linkGroup.append(iconGroup);
    h3Group.append(linkGroup);
    h3Group.append(group.title);
    divGroup.append(h3Group);

    container.append(divGroup);

    let props = group.properties || [];
    let divProps = document.createElement('div');
    divProps.classList.add('group-body');
    divProps.style.display = '';

    this.renderProperties(divProps, props);
    divGroup.append(divProps);

    linkGroup.addEventListener('click', function() {
      let icon = this.querySelector('i');
      if (icon.classList.contains('icon-plus')) {
        divProps.style.display = '';
        icon.classList.remove('icon-plus');
        icon.classList.add('icon-minus');
      } else {
        divProps.style.display = 'none';
        icon.classList.remove('icon-minus');
        icon.classList.add('icon-plus');
      }
    });
  }
};

PropertiesEditor.prototype.renderProperties = function(container, properties) {
  let self = this;
  for (let j = 0; j < properties.length; j++) {
    let prop = properties[j];
    let divProp = document.createElement('div');
    divProp.classList.add('group-item');
    let labelProp = document.createElement('label');
    labelProp.classList.add('group-item-label');
    labelProp.textContent = (prop.label || prop.title) + '：';
    divProp.append(labelProp);

    let divInput = document.createElement('div');
    if (prop.input == 'textarea' || prop.input == 'longtext') {
      //
      // 【文本】
      //
      let textarea = document.createElement('textarea');
      textarea.setAttribute('property-model-name', prop.name);
      textarea.classList.add('group-item-input');
      textarea.textContent = prop.value || '';

      textarea.addEventListener('keyup', function (evt) {
        let changed = {};
        changed[prop.name] = textarea.value;
        self.notifyPropertyChangedListeners(changed);
      });

      divProp.append(textarea);
    } else if (prop.input == 'range') {
      //
      // 【区域值】
      //
      let input = document.createElement('input');
      input.setAttribute('property-model-name', prop.name);
      input.setAttribute('type', 'range');
      input.setAttribute('step', '1');
      input.setAttribute('min', prop.min);
      input.setAttribute('max', prop.max);
      input.setAttribute('data-unit', prop.unit);
      input.valueAsNumber = prop.value;
      input.classList.add('group-item-input');
      labelProp.textContent = (prop.label || prop.title) + '：' + prop.value + prop.unit;
      divProp.append(input);

      // 事件绑定，随时变化显示值
      input.addEventListener('change', function(evt) {
        labelProp.textContent = (prop.label || prop.title) + '：' + input.valueAsNumber + prop.unit;
        let changed = {};
        changed[prop.name] = input.valueAsNumber;
        self.notifyPropertyChangedListeners(changed);
      });
      input.addEventListener('input', function(evt) {
        labelProp.textContent = (prop.label || prop.title) + '：' + input.valueAsNumber + prop.unit;
        let changed = {};
        changed[prop.name] = input.valueAsNumber;
        self.notifyPropertyChangedListeners(changed);
      });

    } else if (prop.input == 'select') {
      //
      // 【下拉框】
      //
      let select = document.createElement('select');
      select.setAttribute('property-model-name', prop.name);
      select.style.display = 'block';
      select.classList.add('group-item-input');
      for (let i = 0; i < prop.values.length; i++) {
        let option = document.createElement('option');
        option.value = prop.values[i].value;
        option.textContent = prop.values[i].text;
        if (prop.values[i].value == prop.value) {
          option.selected = true;
        }
        select.append(option);
      }
      divProp.append(select);

      select.addEventListener('change', function(evt) {
        self.notifyPropertyChangedInArrayOrNot(evt.target, prop);
      });
    } else if (prop.input == 'number') {
      //
      // 【数字】
      //
      let input = document.createElement('input');
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', "[0-9]*");
      input.setAttribute('property-model-name', prop.name);
      input.type = "text";
      if (prop.min) {
        input.setAttribute("min", prop.min);
      }
      if (prop.value || prop.value === 0)
        input.defaultValue = "" + parseInt(prop.value);
      input.classList.add('group-item-input');
      divProp.append(input);

      input.addEventListener('change', function(evt) {
        if (isNaN(parseInt(this.value))) return;
        let changed = {};
        changed[prop.name] = parseInt(this.value);
        self.notifyPropertyChangedListeners(changed);
      });
    } else if (prop.input == 'color') {
      //
      // 【颜色】
      //
      let input = document.createElement('input');
      input.setAttribute('type', 'color');
      input.setAttribute('property-model-name', prop.name);
      input.value = prop.value;
      input.classList.add('group-item-input');
      divProp.append(input);

      input.addEventListener('change', function(evt) {
        // let changed = {};
        // changed[prop.name] = input.value;
        // self.notifyPropertyChangedListeners(changed);
        let input = evt.target;
        let changed = {};
        if (input.parentElement.parentElement.tagName === 'LI') {
          let li = input.parentElement.parentElement;
          let ul = li.parentElement;
          let parentName = ul.getAttribute('property-model-name');
          let nodes = Array.prototype.slice.call(ul.children);
          changed._index = nodes.indexOf(li);
          changed._name = parentName;
          changed[parentName] = {};
          changed[parentName][prop.name] = input.value;
        } else {
          changed[prop.name] = input.value;
        };
        self.notifyPropertyChangedListeners(changed);
      });
    } else if (prop.input == 'file') {
      //
      // 【文件】
      //
      let input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.setAttribute('property-model-name', prop.name);
      input.classList.add('group-item-input');
      divProp.appendChild(input);
      input.value = prop.value || '';

      input.addEventListener('change', function(evt) {
        let reader = new FileReader();
        reader.onloadend = function () {
          let changed = {};
          changed[prop.name] = reader.result;
          self.notifyPropertyChangedListeners(changed);
        };
        reader.readAsDataURL(this.files[0]);
      });
    } else if (prop.input === 'bool') {
      let input = dom.element(`
        <div class="d-flex full-width">
          <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1" style="min-width: 48px;">
            <input class="c-switch-input" type="checkbox">
            <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
          </label>
        </div>
      `);
      if (prop.value === 'T' || prop.value === true) {
        input.children[0].children[0].checked = true;
      }
      dom.find('input', input).setAttribute('property-model-name', prop.name);
      divProp.append(input);
      input.addEventListener('click', function(evt) {
        let div = dom.ancestor(evt.target, 'div');
        let input = dom.find('input', div);
        input.checked = !input.checked;
        let changed = {};
        changed[prop.name] = input.checked;
        self.notifyPropertyChangedListeners(changed);
      });
    } else if (prop.input == 'tileselect') {
      let templateData = {
        tileStyle: 'position: relative; left: 40px; width: 360px; -moz-transform: scale(0.6); zoom: 0.6;'
      };
      let input = dom.templatize(`
        <div style="display: unset;">
          <a class="btn-link text-white pointer">选择瓦片</a>
        </div>
      `, templateData);
      let tile = dom.templatize(`
        <div style="position: relative; left: -100px; min-height: 48px; width: 400px; 
                    -moz-transform: scale(0.6);  zoom: 0.6;"
             property-model-name="{{name}}">
        </div>
      `, prop);
      if (prop[prop.name]) {
        tile.innerHTML = prop[prop.name].html || '<div></div>';
      }
      let link = dom.find('a', input);
      dom.bind(link, 'click', ev => {
        ajax.dialog({
          url: prop.url,
          title: prop.title,
          allowClose: true,
          shadeClose: false,
          width: '50%',
          height: '500px',
          success: () => {
            let value = tile.getAttribute('properties-model');
            if (value && value != '') {
              value = JSON.parse(value);
            } else {
              value = {};
            }
            window[prop.pageId].show({
              value: value,
              onSave: (values) => {
                // 重点注意
                let emit = {};
                emit[prop.name] = values;
                self.notifyPropertyChangedListeners(emit);
                link.setAttribute('properties-model', JSON.stringify(values));
                tile.innerHTML = values.html;
              }
            });
          },
        });
      });
      labelProp.append(input);
      divProp.appendChild(tile);
    } else if (prop.input === 'image') {
      let input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.setAttribute('property-model-name', prop.name);
      input.classList.add('group-item-input');
      divProp.appendChild(input);
      input.value = prop.value || '';

      input.addEventListener('change', function(evt) {
        let reader = new FileReader();
        reader.onloadend = function () {
          let changed = {};
          changed[prop.name] = reader.result;
          self.notifyPropertyChangedListeners(changed);
        };
        reader.readAsDataURL(this.files[0]);
      });
    } else if (prop.input === 'offset') {
      let table = dom.templatize(`
        <table property-model-name="{{name}}">
          <tr><td width="33.33%"></td><td width="33.33%"><input name="top" type="number" value="0" style="width: 45px;"></td><td width="33.33%"></td></tr>
          <tr><td width="33.33%"><input name="left" type="number" value="0" style="width: 45px;"></td><td width="33.33%"></td><td width="33.33%"><input name="right" type="number" value="0" style="width: 45px;"></td></tr>
          <tr><td width="33.33%"></td><td width="33.33%"><input name="bottom" type="number" value="0" style="width: 45px;"></td><td width="33.33%"></td></tr>
        </table>
      `, prop);
      divProp.appendChild(table);
      table.querySelectorAll('input').forEach(el => {
        // 设置初始值
        prop.value = prop.value || {};
        el.value = prop.value[el.getAttribute('name')] || 0;
        dom.bind(el, 'change', ev => {
          let inputs = table.querySelectorAll('input');
          let value = {};
          for (let i = 0; i < inputs.length; i++) {
            let name = inputs[i].getAttribute('name');
            value[name] = inputs[i].value;
          }
          let changed = {};
          changed[prop.name] = value;
          self.notifyPropertyChangedListeners(changed);
        })
      })
    } else if (prop.display) {
      //
      // 【自定义】
      //
      divProp.append(prop.display(prop.value));
    } else if (prop.input === 'readonly') {
      let input = document.createElement('input');
      input.setAttribute('readonly', true);
      input.setAttribute('property-model-name', prop.name || prop.name);
      input.value = prop.value || '';
      input.classList.add('group-item-input');
      divProp.append(input);
    } else if (prop.input === 'array') {
      let plus = dom.element(`
        <a class="material-icons pointer position-relative font-16 text-white" style="top: 1px;">playlist_add</a>
      `);
      // labelProp.appendChild(plus);
      let ul = dom.element(`
        <ul class="list-group properties-container">
        </ul>
      `);
      ul.setAttribute('property-model-name', prop.name);
      ul.setAttribute('properties-model', JSON.stringify(prop.properties));
      divProp.append(ul);
      divProp.append(plus);

      dom.bind(plus, 'click', ev => {
        let ul = dom.ancestor(ev.target, 'div', 'group-item').children[1];
        let propertiesModel = JSON.parse(ul.getAttribute('properties-model'));
        this.appendPropertyItem(ul, propertiesModel, {});

        // 增加数组属性的一项
        let appended = {
          _index: -1,
          _action: 'append',
          _name: ul.getAttribute('property-model-name'),
        };
        this.notifyPropertyChangedListeners(appended);
      });
    } else if (prop.input === 'dialog') {
      let btn = dom.templatize(`
          <a property-model-input="dialog" property-model-name="{{name}}"
             class="material-symbols-outlined pointer position-relative font-20 text-white" style="top: 4px; left: 8px;">open_in_new</a>
      `, prop);
      divProp.append(btn);
      dom.bind(btn, 'click', ev => {
        ajax.dialog({
          url: prop.url,
          title: prop.title,
          allowClose: true,
          shadeClose: false,
          width: '80%',
          height: '750px',
          success: () => {
            let value = btn.getAttribute('properties-model');
            if (value && value != '') {
              value = JSON.parse(value);
            } else {
              value = {};
            }
            window[prop.pageId].show({
              value: value,
              onSave: (values) => {
                // 重点注意
                let emit = {};
                emit[prop.name] = values;
                self.notifyPropertyChangedListeners(emit);
                btn.setAttribute('properties-model', JSON.stringify(values));
              }
            });
          },
        });
      });
    } else {
      // 文本框
      let input = document.createElement('input');
      input.setAttribute('property-model-name', prop.name || prop.name);
      input.value = prop.value || '';
      input.classList.add('group-item-input');
      divProp.append(input);
      input.addEventListener('change', function(evt) {
        self.notifyPropertyChangedInArrayOrNot(evt.target, prop);
      });
    }
    divProp.append(divInput);
    container.append(divProp);
  }
};

PropertiesEditor.prototype.notifyPropertyChangedInArrayOrNot = function (input, prop) {
  let changed = {};
  if (input.parentElement.parentElement.tagName === 'LI') {
    let li = input.parentElement.parentElement;
    let ul = li.parentElement;
    let parentName = ul.getAttribute('property-model-name');
    let nodes = Array.prototype.slice.call(ul.children);
    changed._index = nodes.indexOf(li);
    changed._name = parentName;
    changed[parentName] = {};
    changed[parentName][prop.name] = input.value;
  } else {
    changed[prop.name] = input.value;
  };
  this.notifyPropertyChangedListeners(changed);
}

PropertiesEditor.prototype.appendPropertyItem = function (ul, propertiesModel, values) {
  let li = dom.element(`
    <li class="list-group-item p-0" style="background-color: #383b61;"></li>
  `);
  for (let m = 0; m < propertiesModel.length; m++) {
    // 存在用户至才设置，不存在则用配置里的默认值
    if (values[propertiesModel[m].name]) {
      propertiesModel[m].value = values[propertiesModel[m].name]
    }
  }
  this.renderProperties(li, propertiesModel);
  let buttons = dom.element(`
    <div class="full-width d-flex mt-2">
      <a class="pointer text-danger ml-auto font-18">
        <span class="material-icons">highlight_off</span>
      </a>
    </div>
  `);
  // 删除数组属性的某一项
  dom.bind(buttons.children[0], 'click', ev => {
    let a = dom.ancestor(ev.target, 'a');
    if (a.parentElement.parentElement.tagName === 'LI') {
      let li = a.parentElement.parentElement;
      let ul = li.parentElement;
      let nodes = Array.prototype.slice.call(ul.children);
      let removed = {
        _index: nodes.indexOf(li),
        _action: 'remove',
        _name: ul.getAttribute('property-model-name'),
      };
      this.notifyPropertyChangedListeners(removed);
    }
    a.parentElement.parentElement.remove();
  });
  li.appendChild(buttons);
  ul.appendChild(li);
};

PropertiesEditor.prototype.getPropertiesValues = function () {
  let container = dom.find(this.containerId);
  let inputs = container.querySelectorAll('input');
  let selects = container.querySelectorAll('select');
  let textareas = container.querySelectorAll('textarea');
  let divs = container.querySelectorAll('div[property-model-name]')
  let ret = {};
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    let dataId = input.getAttribute('property-model-name');
    let dataValue = input.value;
    ret[dataId] = dataValue;
  }
  for (let i = 0; i < selects.length; i++) {
    let select = selects[i];
    let dataId = select.getAttribute('property-model-name');
    let dataValue = select.value;
    ret[dataId] = dataValue;
  }
  for (let i = 0; i < textareas.length; i++) {
    let textarea = textareas[i];
    let dataId = textarea.getAttribute('property-model-name');
    let dataValue = textarea.textContent;
    ret[dataId] = dataValue;
  }
  for (let i = 0; i < divs.length; i++) {
    let div = divs[i];
    let dataId = div.getAttribute('property-model-name');
    let dataValue = div.innerHTML;
    ret[dataId] = dataValue;
  }
  return ret;
};

PropertiesEditor.prototype.setPropertiesValues = function (data) {
  let container = dom.find(this.containerId);
  let inputs = container.querySelectorAll('input');
  let selects = container.querySelectorAll('select');
  let textareas = container.querySelectorAll('textarea');
  let dialogs = container.querySelectorAll('a[property-model-input=dialog]');
  let divs = container.querySelectorAll('div[property-model-name]');
  let tables = container.querySelectorAll('table[property-model-name]');
  let uls = container.querySelectorAll('ul[properties-model]');

  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    let dataId = input.getAttribute('property-model-name');
    if (input.type === 'checkbox') {
      input.checked = data[dataId] === true;
    } else if (data[dataId]) {
      // 特殊处理BUG
      if (dataId == 'x') data[dataId] = parseInt(data[dataId]);
      if (dataId.indexOf('image') == -1 && dataId.indexOf('Image') == -1)
        input.value = data[dataId];
    }
    if (input.type === 'range') {
      // FIXME
      let label = dom.find('label', input.parentElement);
      label.textContent = label.textContent.replace('undefined', data[dataId])
    }
    if (input.type === 'number') {
      input.value = parseInt(data[dataId]);
    }
  }
  for (let i = 0; i < selects.length; i++) {
    let select = selects[i];
    let dataId = select.getAttribute('property-model-name');
    if (data[dataId])
      select.value = data[dataId];
  }
  for (let i = 0; i < textareas.length; i++) {
    let textarea = textareas[i];
    let dataId = textarea.getAttribute('property-model-name');
    if (data[dataId])
      textarea.textContent = data[dataId];
  }
  for (let i = 0; i < divs.length; i++) {
    let div = divs[i];
    let dataId = div.getAttribute('property-model-name');
    if (data[dataId]) {
      if (data[dataId].html) {
        div.innerHTML = data[dataId].html;
      } else {
        div.innerHTML = data[dataId];
      }
      div.setAttribute('properties-model', JSON.stringify(data[dataId]))
    }
  }

  for (let i = 0; i < tables.length; i++) {
    let table = tables[i];
    let dataId = table.getAttribute('property-model-name');
    if (data[dataId]) {
      let inputs = table.querySelectorAll('input');
      for (let j = 0; j < inputs.length; j++) {
        inputs[j].value = data[dataId][inputs[j].getAttribute('name')];
      }
    }
  }

  // 特殊列表显示
  for (let i = 0; i < uls.length; i++) {
    let ul = uls[i];
    let propName = ul.getAttribute('property-model-name');
    let propertiesModel = JSON.parse(ul.getAttribute("properties-model"));
    let values = data[propName] || [];
    for (let j = 0; j < values.length; j++) {
      this.appendPropertyItem(ul, propertiesModel, values[j]);
    }
  }
  for (let i = 0; i < dialogs.length; i++) {
    let dialog = dialogs[i];
    let propName = dialog.getAttribute('property-model-name');
    let values = data[propName] || {};
    dialog.setAttribute('properties-model', JSON.stringify(values));
  }
};

function QuestionnaireDesigner(opt) {
  this.title = opt.title || '问卷调查';
  this.questions = opt.questions || [];
  this.draggingTarget = null;
  this.onSave = opt.onSave || function(model) {};
  this.onDelete = opt.onDelete || function(model) {};
  QuestionnaireDesigner.instance = this;
}

QuestionnaireDesigner.QUESTION_MULTIPLE_CHOICE = 'multiple';
QuestionnaireDesigner.QUESTION_SINGLE_CHOICE = 'single';
QuestionnaireDesigner.QUESTION_SHORT_ANSWER = 'answer';

QuestionnaireDesigner.ATTRIBUTE_TITLE = 'data-questionnaire-question-title';
QuestionnaireDesigner.ATTRIBUTE_TYPE = 'data-questionnaire-question-type';
QuestionnaireDesigner.ATTRIBUTE_ORDINAL_POSITION = 'data-questionnaire-question-ordinal-position';
QuestionnaireDesigner.ATTRIBUTE_VALUES = 'data-questionnaire-question-values';
QuestionnaireDesigner.ATTRIBUTE_MODEL = 'data-questionnaire-question-model';

QuestionnaireDesigner.COLOR_SELECTED = '#3880ff';

QuestionnaireDesigner.MODEL_MULTIPLE_CHOICE = `
{
"title":"多选题示例",
"type":"multiple",
"values": ["选线A","选项B","选项C","选项D"]
}
`;

QuestionnaireDesigner.MODEL_SINGLE_CHOICE = `
{
"title":"单选题示例",
"type":"single",
"values": ["选项A","选项B","选项C","选项D"]
}
`;

QuestionnaireDesigner.MODEL_SHORT_ANSWER = `
{
"title":"简答题示例",
"type":"answer"
}
`;

/**
 * the palette component on left side;
 */
QuestionnaireDesigner.prototype.palette = function() {
  let ret = dom.element(`<div class="col-md-4" style="padding: 0; border-radius: unset;"></div>`);
  let ul = dom.create('ul', 'list-group', 'mt-2', 'ml-4');
  let li = dom.create('li', 'list-group-item','grab');
  li.setAttribute('draggable', true);
  li.setAttribute(QuestionnaireDesigner.ATTRIBUTE_TYPE, QuestionnaireDesigner.QUESTION_SINGLE_CHOICE);
  li.innerText = '单选题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: QuestionnaireDesigner.MODEL_SINGLE_CHOICE
  }, function() {});

  li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(QuestionnaireDesigner.ATTRIBUTE_TYPE, QuestionnaireDesigner.QUESTION_MULTIPLE_CHOICE);
  li.innerText = '多选题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: QuestionnaireDesigner.MODEL_MULTIPLE_CHOICE
  }, function() {});

  li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(QuestionnaireDesigner.ATTRIBUTE_TYPE, QuestionnaireDesigner.QUESTION_SHORT_ANSWER);
  li.innerText = '问答题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: QuestionnaireDesigner.MODEL_SHORT_ANSWER
  }, function() {});

  ret.appendChild(ul);

  dom.height(ret, 0, this.container);
  return ret;
};

QuestionnaireDesigner.prototype.canvas = function() {
  let self = this;
  let ret = dom.element(`
    <div class="col-md-8 m-0">
      <div widget-id="widgetQuestionnaireCanvas" 
           style="padding: 10px; 
           margin-top: 8px;
           margin-bottom: 8px;
           background-color: white; 
           overflow-y: auto; 
           height: 100%; 
           border: 4px dashed rgba(0, 0, 0, 0.3);">
      </div>
    </div>
  `);
  this.widgetQuestionnaireCanvas = dom.find('[widget-id=widgetQuestionnaireCanvas]', ret);
  dom.height(this.widgetQuestionnaireCanvas, 16, this.container);
  this.questions.forEach((question, index) => {
    question.ordinalPosition = (index + 1);
    this.renderQuestion(this.widgetQuestionnaireCanvas, question);
  });
  this.widgetQuestionnaireCanvas.addEventListener('dragover', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    let x = ev.clientX;
    let y = ev.clientY;

    let existing = dom.find('[data-questionnaire-question-clone=true]', this.widgetQuestionnaireCanvas);
    if (existing != null) existing.remove();
    if (self.draggingTarget == null) return;

    let cloned = self.draggingTarget.cloneNode(true);
    cloned.style.opacity = '0.5';
    cloned.setAttribute('data-questionnaire-question-clone', 'true');
    self.draggingTarget.remove();

    let inserted = false;
    for (let i = 0; i < this.widgetQuestionnaireCanvas.children.length; i++) {
      let el = this.widgetQuestionnaireCanvas.children[i];
      let rect = el.getBoundingClientRect();
      if (rect.bottom > y) {
        this.widgetQuestionnaireCanvas.insertBefore(cloned, el);
        inserted = true;
        break;
      }
    }
    if (inserted === false) {
      this.widgetQuestionnaireCanvas.appendChild(cloned);
    }
    self.resort(this.widgetQuestionnaireCanvas);
  });
  dnd.setDroppable(this.widgetQuestionnaireCanvas, (x, y, data) => {
    if (self.draggingTarget != null) {
      self.draggingTarget.remove();
      self.draggingTarget = null;
      let dragged = dom.find('[data-questionnaire-question-clone=true]', this.widgetQuestionnaireCanvas);
      dragged.style.opacity = '';
      dragged.removeAttribute('data-questionnaire-question-clone');
      dom.bind(dragged, 'click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.clearAndSelect(dragged);
      });
      self.resort(dragged.parentElement);
      self.clearAndSelect(dragged, true);
    } else {
      for (let i = 0; i < this.widgetQuestionnaireCanvas.children.length; i++) {
        this.widgetQuestionnaireCanvas.children[i].style.borderColor = 'transparent';
        let operations = dom.find('[widget-id=operations]', this.widgetQuestionnaireCanvas.children[i]);
        if (operations != null) {
          operations.remove();
        }
      }
      this.renderQuestion(this.widgetQuestionnaireCanvas, JSON.parse(data.model));
    }
    /*!
    ** 事件通知其他组件。
    */
    this.dispatchEvent();
  });

  dom.bind(this.widgetQuestionnaireCanvas, 'click', ev => {
    for (let i = 0; i < this.widgetQuestionnaireCanvas.children.length; i++) {
      this.clearAndSelect(this.widgetQuestionnaireCanvas.children[i], true);
    }
  });

  return ret;
};

QuestionnaireDesigner.prototype.render = function(containerId, params) {
  params = params || {};
  if (params.questions) {
    this.questions = params.questions;
  }
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  this.container.appendChild(this.palette());
  this.container.appendChild(this.canvas());
};

/**
 * 设计时渲染多选题。
 */
QuestionnaireDesigner.prototype.renderMultipleChoice = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'multiple_' + Date.now();
    existing = false;
  }
  let model = {...question};
  delete model.id;
  delete model.ordinalPosition;
  question.model = JSON.stringify(model);
  let el = dom.templatize(`
    <div data-questionnaire-question-id="{{id}}" data-questionnaire-question-model="{{model}}" 
         class="questionnaire-question" style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
      <div style="margin-bottom: 6px">
        <strong>{{ordinalPosition}}. {{title}}：</strong>
      </div>
      {{#each values}}
      <div class="questionnaire-answer d-flex">
        <i class="far fa-check-square"></i>
        <label>{{this}}</label>
      </div>
      {{/each}}
    </div>
  `, question);
  dom.bind(el, 'click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.clearAndSelect(el);
  });
  if (existing === true) {
    let old = dom.find('[data-questionnaire-question-id="' + question.id + '"]');
    if (old)
      container.replaceChild(el, old);
    else
      container.appendChild(el);
  } else {
    container.appendChild(el);
  }
};

/**
 * 设计时渲染单选题。
 */
QuestionnaireDesigner.prototype.renderSingleChoice = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'single_' + Date.now();
    existing = false;
  }
  let model = {...question};
  delete model.id;
  delete model.ordinalPosition;
  question.model = JSON.stringify(model);
  if (existing === true && !question.ordinalPosition) {
    let old = dom.find('[data-questionnaire-question-id="' + question.id + '"]');
    let nodes = Array.prototype.slice.call(container.children);
    question.ordinalPosition = nodes.indexOf(old) + 1;
  }
  let el = dom.templatize(`
    <div data-questionnaire-question-id="{{id}}" 
         data-questionnaire-question-model="{{model}}" 
         data-switch=".questionnaire-answer+.checked"
         class="questionnaire-question" style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
      <div style="margin-bottom: 6px">
        <strong>{{ordinalPosition}}. {{title}}：</strong>
      </div>
      {{#each values}}
      <div class="questionnaire-answer d-flex" data-questionnaire-question-name="{{../id}}">
        <i class="far fa-check-circle"></i>
        <label>{{this}}</label>
      </div>
      {{/each}}
    </div>
  `, question);
  dom.bind(el, 'click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.clearAndSelect(el);
  });
  if (existing === true) {
    let old = dom.find('[data-questionnaire-question-id="' + question.id + '"]');
    if (old)
      container.replaceChild(el, old);
    else
      container.appendChild(el);
  } else {
    container.appendChild(el);
  }
};

/**
 * 设计时渲染问答题。
 */
QuestionnaireDesigner.prototype.renderShortAnswer = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'answer_' + new Date().getMilliseconds();
    existing = false;
  }
  let model = {...question};
  delete model.id;
  delete model.ordinalPosition;
  question.model = JSON.stringify(model);
  let el = dom.templatize(`
    <div data-questionnaire-question-id="{{id}}" data-questionnaire-question-model="{{model}}" class="questionnaire-question"  style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
      <div style="margin-bottom: 6px">
        <strong>{{ordinalPosition}}. {{title}}：</strong>
      </div>
      <div>
        <textarea name="{{id}}" style="width: 100%; height: 120px; resize: none; outline: none; box-shadow: none;  background-color: transparent;" readonly></textarea>
      </div>
    </div>
  `, question);
  dom.bind(el, 'click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.clearAndSelect(el);
  });
  if (existing === true) {
    let old = dom.find('[data-questionnaire-question-id="' + question.id + '"]');
    if (old) {
      container.replaceChild(el, old);
    } else {
      container.appendChild(el);
    }
  } else {
    container.appendChild(el);
  }
};

QuestionnaireDesigner.prototype.clearAndSelect = function(element, clear) {
  let self = this;
  if (element.parentElement == null) return;
  for (let i = 0; i < element.parentElement.children.length; i++) {
    element.parentElement.children[i].style.borderColor = 'transparent';
    let operations = dom.find('[widget-id=operations]', element.parentElement.children[i]);
    if (operations != null) {
      operations.remove();
    }
  }

  if (clear === true) return;
  element.style.borderColor = QuestionnaireDesigner.COLOR_SELECTED;

  let operations = dom.element(`
    <div widget-id="operations" style="position: relative; float: right; right: -6px; bottom: 25px;">
      <a widget-id="buttonMove" class="btn text-light" style="cursor: move;">
        <i class="fas fa-arrows-alt"></i>
      </a>
      <a widget-id="buttonEdit" class="btn text-light"">
        <i class="fas fa-edit"></i>
      </a>
      <a widget-id="buttonDelete" class="btn text-light">
        <i class="fas fa-trash-alt"></i>
      </a>
    </div>
  `);
  operations.style.backgroundColor = QuestionnaireDesigner.COLOR_SELECTED;

  let buttonMove = dom.find('a[widget-id=buttonMove', operations);
  dom.bind(buttonMove, 'mousedown', ev => {
    let root = dom.ancestor(ev.target, 'div', 'questionnaire-question');
    dnd.setDraggable(root, {
      model: root.getAttribute('data-questionnaire-question-model')
    }, function(x, y, target) {
      self.draggingTarget = target; // target.cloneNode(true);
      // self.draggingTarget.style.opacity = '0.50';
      // self.draggingTarget.setAttribute('data-questionnaire-clone', 'true');
      // target.style.display = 'none';
      dnd.clearDraggable(target);
    });
  });

  let buttonEdit = dom.find('a[widget-id=buttonEdit]', operations);
  dom.bind(buttonEdit, 'click', ev => {
    let model = element.getAttribute(QuestionnaireDesigner.ATTRIBUTE_MODEL);
    model = JSON.parse(model);
    let question = {
      ...model,
      id: element.getAttribute('data-questionnaire-question-id'),
    };
    this.edit(question);
  });

  let buttonDelete = dom.find('a[widget-id=buttonDelete]', operations);
  dom.bind(buttonDelete, 'click', ev => {
    let model = JSON.parse(element.getAttribute('data-questionnaire-question-model'));
    if (!model.questionnaireQuestionId) {
      model.questionnaireQuestionId = element.getAttribute('data-questionnaire-question-id');
    }
    this.onDelete(model, element)
  });
  element.appendChild(operations);
};

QuestionnaireDesigner.prototype.resort = function(container) {
  for (let i = 0; i < container.children.length; i++) {
    let child = container.children[i];
    let strong = dom.find('strong', child);
    let text = strong.innerText;
    strong.innerText = text.replace(/\d+\./i, i + 1 + '.');
    let model = JSON.parse(child.getAttribute('data-questionnaire-question-model'));
    model.ordinalPosition = i + 1;
    child.setAttribute('data-questionnaire-question-model', JSON.stringify(model));
  }
};

QuestionnaireDesigner.prototype.renderQuestion = function(container, question) {
  if (question.type === QuestionnaireDesigner.QUESTION_MULTIPLE_CHOICE) {
    this.renderMultipleChoice(container, question);
  } else if (question.type === QuestionnaireDesigner.QUESTION_SINGLE_CHOICE) {
    this.renderSingleChoice(container, question);
  } else if (question.type === QuestionnaireDesigner.QUESTION_SHORT_ANSWER) {
    this.renderShortAnswer(container, question);
  }
};

QuestionnaireDesigner.prototype.renderQuestions = function(questions) {
  for (let i = 0; i < questions.length; i++) {
    this.renderQuestion(this.widgetQuestionnaireCanvas, questions[i]);
  }
};

QuestionnaireDesigner.prototype.edit = function(question) {
  let self = this;
  Handlebars.registerHelper('ifne', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
  });
  let questionId = question.id;
  question.options = [];
  question.values = question.values || [];
  for (let i = 0; i < question.values.length; i++) {
    question.options.push({
      value: question.values[i],
      score: question.scores ? question.scores[i] : '0',
    })
  }
  let el = dom.templatize(`
    <div>
    <div widget-id="dialogQuestionEdit" class="card border-less">
      <div class="card-body">
        <div class="row">
          <div class="col-sm-12">
            <div class="form-group">
              <input class="form-control" name="id" type="hidden" value="{{id}}">
              <input class="form-control" name="ordinalPosition" type="hidden" value="{{ordinalPosition}}">
              <input class="form-control" name="type" type="hidden" value="{{type}}">
              <label for="name"><strong>标题</strong></label>
              <input class="form-control" name="title" type="text" value="{{title}}">
            </div>
          </div>
        </div>  
        {{#ifne type "answer"}}
        <div class="row">
          <div class="col-sm-12">
            <div class="form-group">
              <label for="name">
                <strong>选项</strong>
                <a widget-id="buttonAdd" class="btn btn-link">
                  <i class="fas fa-plus-circle"></i>
                </a>
              </label>
              <ul class="list-group">
                {{#each options}}
                <li class="list-group-item d-flex pt-0 pb-0">
                  <input onfocus="QuestionnaireDesigner.instance.onCellFocus(this);" 
                         onkeydown="QuestionnaireDesigner.instance.onCellKeyPress(event);"
                         name="values" style="border: none; height=100%; width: 100%" value="{{value}}">
                  <input onfocus="QuestionnaireDesigner.instance.onCellFocus(this);" 
                         onkeydown="QuestionnaireDesigner.instance.onCellKeyPress(event);"
                         name="scores" style="border: none; width: 50px" value="{{score}}">
                  <a class="btn text-danger line-height-32" onclick="this.parentElement.remove();">
                    <span class="material-icons">highlight_off</span>
                  </a>
                </li>
                {{/each}}
              </ul>
            </div>
          </div>
        </div>  
        {{/ifne}}
      </div>
      </div>
      <div>
        <span class="keyboard-key material-icons">arrow_upward</span>和
        <span class="keyboard-key material-icons">arrow_downward</span>
        可以用于切换输入框。
      </div>
    </div>
  `, question);
  dialog.html({
    html: el.innerHTML,
    load: function() {
      let dialog = dom.find('div[widget-id="dialogQuestionEdit"]');
      let buttonAdd = dom.find('a[widget-id=buttonAdd]', dialog);
      dom.bind(buttonAdd, 'click', ev => {
        let el = dom.element(`
          <li class="list-group-item d-flex pt-0 pb-0">
            <input onfocus="QuestionnaireDesigner.instance.onCellFocus(this);" 
                   onkeydown="QuestionnaireDesigner.instance.onCellKeyPress(event);"
                   name="values" style="border: none; height=100%; width: 100%" value="选项">
            <input onfocus="QuestionnaireDesigner.instance.onCellFocus(this);" 
                   onkeydown="QuestionnaireDesigner.instance.onCellKeyPress(event);"
                   name="scores" style="border: none; width: 50px" value="0">
            <a class="btn text-danger line-height-32" onclick="this.parentElement.remove();">
              <span class="material-icons">highlight_off</span>
            </a>
          </li>
        `);
        dom.find('ul', dialog).appendChild(el);
      });
    },
    success: function() {
      let dialog = dom.find('div[widget-id="dialogQuestionEdit"]');
      let inputs = dialog.querySelectorAll('input[name=values]');
      let question = dom.formdata(dialog);
      question.values = [];
      question.scores = [];
      inputs.forEach((el, idx) => {
        if (el.name === 'values') {
          question.values.push(el.value);
        }
      });
      inputs = dialog.querySelectorAll('input[name=scores]');
      inputs.forEach((el, idx) => {
        if (el.name === 'scores') {
          question.scores.push(el.value);
        }
      });
      self.renderQuestion(self.widgetQuestionnaireCanvas, {
        ...question,
        id: questionId,
      });
      self.dispatchEvent();
    }
  });
};

QuestionnaireDesigner.prototype.onCellFocus = function(input) {
  input.setSelectionRange(0, input.value.length);
};

QuestionnaireDesigner.prototype.onCellKeyPress = function(ev) {
  let ul = dom.ancestor(ev.target, 'ul');
  let inputs = ul.querySelectorAll('input');
  let index = -1;
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    if (input === ev.target) {
      index = i;
      break;
    }
  }
  if (ev.keyCode == 38) {
    // arrow-up
    if (index - 1 >= 0) {
      inputs[index - 1].focus();
      // inputs[index - 1].setSelectionRange(0, inputs[index - 1].value.length);
    }
  } else if (ev.keyCode == 40) {
    // arrow-down
    if (index + 1 < inputs.length) {
      inputs[index + 1].focus();
      // inputs[index + 1].setSelectionRange(0, inputs[index + 1].value.length);
    }
  }
};

QuestionnaireDesigner.prototype.getQuestions = function () {
  let questions = [];
  this.widgetQuestionnaireCanvas.querySelectorAll('.questionnaire-question').forEach((el, idx) => {
    let model = JSON.parse(el.getAttribute('data-questionnaire-question-model'));
    questions.push({
      questionId: el.getAttribute('data-questionnaire-question-id'),
      questionName: model.title,
      questionType: model.type,
      content: JSON.stringify(model),
      ordinalPosition: idx,
    });
  });
  return questions;
};

QuestionnaireDesigner.prototype.setQuestionIds = function (ids) {
  this.widgetQuestionnaireCanvas.querySelectorAll('.questionnaire-question').forEach((el, idx) => {
    el.setAttribute('data-questionnaire-question-id', ids[idx]);
  });
};

QuestionnaireDesigner.prototype.selectText = function (el){
  let sel, range;
  if (window.getSelection && document.createRange) { //Browser compatibility
    sel = window.getSelection();
    if(sel.toString() == ''){ //no text selection
      window.setTimeout(function(){
        range = document.createRange(); //range object
        range.selectNodeContents(el); //sets Range
        sel.removeAllRanges(); //remove all ranges from selection
        sel.addRange(range);//add Range to a Selection.
      },1);
    }
  } else if (document.selection) { //older ie
    sel = document.selection.createRange();
    if(sel.text == ''){ //no text selection
      range = document.body.createTextRange();//Creates TextRange object
      range.moveToElementText(el);//sets Range
      range.select(); //make selection.
    }
  }
};

QuestionnaireDesigner.prototype.dispatchEvent = function () {
  let event = new CustomEvent("html-changed", {
    bubbles: false,
    detail: {
      html: this.widgetQuestionnaireCanvas.innerHTML,
    }
  });
  this.widgetQuestionnaireCanvas.dispatchEvent(event);
};

QuestionnaireDesigner.prototype.on = function (name, handler) {
  this.widgetQuestionnaireCanvas.addEventListener(name, handler);
};

/**
 * 报表设计器构造函数。
 * <p>
 * 参数包括：
 * 1. containerId           容器的DOM标识
 * 2. propertiesEditor      属性编辑器实例
 * 
 * @param {object} options 
 */
function ReportDesigner(options) {
  let self = this;

  this.elements = [];
  // 页面元素
  this.containerId = options.containerId;
  this.container = dom.find(this.containerId);
  this.containerWidth = this.container.clientWidth;

  // 属性编辑器
  this.propertiesEditor = options.propertiesEditor;
  this.propertiesEditor.addPropertyChangedListener(this);

  this.bindDragOverEventListener();
  this.bindDropEventListener(this, this.drop);
  this.bindMouseDownEventListener(this, this.select);
  this.bindMouseMoveEventListener(this, this.move);
  this.bindMouseUpEventListener();

  // this.canvas.setAttribute('width', this.containerWidth);
  // this.canvas.setAttribute('height', options.canvasHeight);

  this.canvas.style = 'width: 100%; height: 100%;';

  //
  // 鼠标点击，只支持删除对象
  //
  document.addEventListener('keyup', function(ev) {
    if (ev.keyCode == 46 /*DEL*/) {
      if (!self.selectedElement) return;
      for (let i = 0; i < self.elements.length; i++) {
        if (self.elements[i].model.id == self.selectedElement.model.id) {
          self.elements.splice(i, 1);
          break;
        }
      }
      self.selectedElement = null;
      self.propertiesEditor.clear();
      self.render();
      // self.drawArrow(20, 20, 200, 100, [0, 1, -10, 1, -10, 5]);
    }
  });

  // 初始化设置
  this.container.innerHTML = '';
  this.container.appendChild(this.canvas);

  let dpr = window.devicePixelRatio || 1;
  let rect = this.canvas.getBoundingClientRect();
  this.canvas.width = rect.width * dpr;
  this.canvas.height = rect.height * dpr;
  this.canvas.getContext('2d').scale(dpr, dpr);

  // 数据结构定义
  this.dragging = null;

  // 画布的其他设置

  this.render();
}

ReportDesigner.prototype = new DesignCanvas();

ReportDesigner.TEXT_FONT_SIZE = 18;
ReportDesigner.TEXT_FONT_FAMILY = '宋体';
ReportDesigner.STROKE_STYLE_SELECTED = '#20a8d8';
ReportDesigner.STROKE_STYLE_ALIGNMENT = '#ffc107';
ReportDesigner.STROKE_STYLE_DEFAULT = 'black';

ReportDesigner.prototype.unselectAll = function (element) {
  for (let i = 0; i < this.elements.length; i++)
    this.elements[i].unselect();
  this.selectedElement = null;
};

ReportDesigner.prototype.onPropertyChanged = function (prop) {
  if (this.selectedElement == null) return;
  this.selectedElement.notifyModelChangedListeners(prop);
  this.render();
};

/**
 * 添加设计器上的对象到设计器对象对对象的管理容器。
 *
 * @param {object} obj
 *        设计器新增加的对象
 */
ReportDesigner.prototype.addAndRenderElement = function (element) {
  element.addModelChangedListener(this.propertiesEditor);
  this.elements.push(element);

  // 显示元素的属性编辑器
  this.propertiesEditor.render(element);
  // 取消所有原有的元素
  this.unselectAll();
  this.selectedElement = element;
  // 渲染
  this.render();
};

/**
 * 添加默认的文本到画布对象中。
 * 
 * @param {string} text
 *        the text
 * 
 * @param {number} x 
 *        the coordinate x in canvas
 * 
 * @param {number} y 
 *        the coordinate y in canvas
 */
ReportDesigner.prototype.addText = function (text, x, y) {
  let elementText = new TextElement({
    x: x,
    y: y,
    text: text,
    selected: true
  });
  // 添加文本元素
  this.addAndRenderElement(elementText);
};

ReportDesigner.prototype.addLongtext = function (text, x, y) {
  let elementText = new LongtextElement({
    x: x,
    y: y,
    text: text,
    selected: true
  });
  // 添加文本元素
  this.addAndRenderElement(elementText);
};

ReportDesigner.prototype.addImage = function (x, y) {
  let elementImage = new ImageElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementImage);
};

ReportDesigner.prototype.addTable = function (x, y) {
  let elementTable = new TableElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementTable);
};

ReportDesigner.prototype.addChart = function (x, y) {
  let elementChart = new ChartElement({
    subtype: '柱状图',
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementChart);
};

ReportDesigner.prototype.drawGrid = function (w, h, strokeStyle, step) {
  let ctx = this.canvas.getContext('2d');
  for (let x = 0.5; x < w; x += step){
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  
  for (let y = 0.5; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
};


ReportDesigner.prototype.render = function () {
  let ctx = this.canvas.getContext('2d');

  // 清除画布
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // 网格线
  this.drawGrid(this.canvas.width, this.canvas.height, '#eee', 10);

  // 逐个画元素（根据元素的模型数据）
  for (let i = 0; i < this.elements.length; i++) {
    let element = this.elements[i];
    element.render(ctx);
  }

  if (this.alignmentLines && this.alignmentLines.length > 0) {
    for (let i = 0; i < this.alignmentLines.length; i++) {
      let alignmentLine = this.alignmentLines[i];
      ctx.beginPath();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = ReportDesigner.STROKE_STYLE_ALIGNMENT;
      ctx.lineWidth = 1;
      let line = alignmentLine;
      if (line.x) {
        ctx.moveTo(line.x, 0);
        ctx.lineTo(line.x, this.canvas.height);
        ctx.stroke();
      } else {
        ctx.moveTo(0, line.y);
        ctx.lineTo(this.canvas.width, line.y);
        ctx.stroke();
      }
      ctx.closePath();
      ctx.setLineDash([]);
    }
  }
};

/**
 * 
 */
ReportDesigner.prototype.drag = function (ev) {
  let target = ev.target;
  self.dragging = target;

  self.dragX = ev.layerX;
  self.dragY = ev.layerY;

  ev.dataTransfer.setData('drag-type', ev.target.getAttribute('data-type'));
};

ReportDesigner.prototype.drop = function (self, ev) {
  let rect = self.canvas.getBoundingClientRect();
  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  let dragType = ev.dataTransfer.getData('drag-type');
  if (dragType == 'text') {
    self.addText('这里是标题', x, y);
  } else if (dragType == 'longtext') {
    self.addLongtext('这是长文本的示例，长文本允许折行显示，适合显示描述性的文本内容。', x, y);
  } else if (dragType == 'table') {
    self.addTable(x, y);
  } else if (dragType == 'image') {
    self.addImage(x, y);
  } else if (dragType == 'chart') {
    self.addChart(x, y);
  }
};

/**
 * 鼠标按下事件的回调函数，业务化响应鼠标按下事件。
 */
ReportDesigner.prototype.select = function (self, ev) {
  if (ev.button != 0) return;
  let rect = self.canvas.getBoundingClientRect();
  let clickX = ev.clientX - rect.left;
  let clickY = ev.clientY - rect.top;

  // reset selected object in designer
  self.unselectAll();

  for (let i = 0; i < self.elements.length; i++) {
    let elm = self.elements[i];
    // check the mouse position is or not in the object shape.
    if (elm.select(clickX, clickY)) {
      // allow to move
      self.isMoving = true;
      self.offsetMoveX = clickX - elm.model.x;
      self.offsetMoveY = clickY - elm.model.y;
      self.selectedElement = elm;
      break;
    }
  }

  // 光标改变
  if (self.selectedElement) {
    let resizeType = self.showResizeCursor(ev);
    if (resizeType == 'none' || self.selectedElement.model.type == 'text') {
      self.isMoving = true;
      self.canvas.style.cursor = 'move';
    } else {
      self.resizeType = resizeType;
      self.isResizing = true;
    }
    self.propertiesEditor.render(self.selectedElement);
  } else {
    self.propertiesEditor.clear();
  }

  // 重新渲染，如果选择了则显示选择的边框；如果没有，则消除选择的边框
  self.render();
};

/**
 * 鼠标移动事件的回调函数，业务化的鼠标移动控制。
 */
ReportDesigner.prototype.move = function (self, ev) {
  // 没有选择
  if (self.selectedElement == null) return;
  if (!self.isMoving && !self.isResizing) return;

  let resizeType = self.resizeType;
  
  let rect = self.canvas.getBoundingClientRect();
  let moveX = ev.clientX - rect.left;
  let moveY = ev.clientY - rect.top;

  if (resizeType == 'east') {
    let offsetX = moveX - self.selectedElement.model.x - self.selectedElement.model.width;
    self.selectedElement.model.width = self.selectedElement.model.width + offsetX;
  } else if (resizeType == 'west') {
    let offsetX = self.selectedElement.model.x - moveX;
    self.selectedElement.model.x = moveX;
    self.selectedElement.model.width = self.selectedElement.model.width + offsetX;
  } else if (resizeType == 'north') {
    let offsetY = self.selectedElement.model.y - moveY;
    self.selectedElement.model.y = moveY;
    self.selectedElement.model.height = self.selectedElement.model.height + offsetY;
  } else if (resizeType == 'south') {
    let offsetY = moveY - self.selectedElement.model.y - self.selectedElement.model.height;
    self.selectedElement.model.height = self.selectedElement.model.height + offsetY;
  } else {
    self.canvas.style.cursor = 'move';
    self.selectedElement.model.x = moveX - self.offsetMoveX;
    self.selectedElement.model.y = moveY - self.offsetMoveY;
  }
  self.selectedElement.notifyModelChangedListeners({
    x: self.selectedElement.model.x,
    y: self.selectedElement.model.y,
    width: self.selectedElement.model.width,
    height: self.selectedElement.model.height
  });

  // 渲染
  self.render();
};

function ReportElementRenderer() {

}

ReportElementRenderer.prototype.renderSelected = function(context, model) {
  if (model.selected) {
    context.setLineDash([]);

    context.beginPath();
    context.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
    // left-top
    context.moveTo(model.x, model.y);
    // left-bottom
    context.lineTo(model.x, model.y + model.height);
    // right-bottom
    context.lineTo(model.x + model.width, model.y + model.height);
    // right-top
    context.lineTo(model.x + model.width, model.y);
    // left-top
    context.lineTo(model.x, model.y);
    context.stroke();
    context.closePath();
  }
};

function TextElementRenderer() {

}

TextElementRenderer.prototype.render = function(context, element) {
  let model = element.model;
  context.fillStyle = model.fontColor;
  context.font = model.font();

  model.width = context.measureText(model.text).width;

  // 文本的高度设置特殊性
  model.height = parseInt(model.fontSize);

  if (element.model.selected) {
    // 只有选择了的才能触发此逻辑，主要显示字体的调整，宽度随之调整
    element.notifyModelChangedListeners({
      width: model.width,
      height: model.height
    });
  }

  context.fillText(model.text, model.x, model.y + model.height * 0.85);

  this.renderSelected(context, model);
};

Object.assign(TextElementRenderer.prototype, ReportElementRenderer.prototype);

function LongtextElementRenderer() {

}

LongtextElementRenderer.prototype.render = function(context, element) {
  let model = element.model;
  context.fillStyle = model.fontColor;
  context.font = model.font();

  let lineHeight = model.fontSize + model.lineSpace;
  let line = '';
  let x = model.x;
  let y = model.y + lineHeight;
  let height = 0;
  let chars = model.text.split('');
  for(let i = 0; i < chars.length; i++) {
    line += chars[i];
    let metrics = context.measureText(line);
    let testWidth = metrics.width;
    if (testWidth > model.width && i > 0) {
      context.fillText(line.substr(0, line.length - 1), x, y);
      line = chars[i];
      y += lineHeight;
      height += lineHeight;
    }
  }
  if (line != '') {
    height += lineHeight + model.lineSpace;
    context.fillText(line, x, y);
  }

  model.height = height;

  this.renderSelected(context, model);
};

Object.assign(LongtextElementRenderer.prototype, ReportElementRenderer.prototype);

function ImageElementRenderer() {

}

ImageElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  if (model.image) {
    let containerImage = document.getElementById('image_container');
    let img = document.getElementById(model.id);
    if (img == null) {
      let img = document.createElement('img');
      img.setAttribute('id', model.id);
      img.setAttribute('src', model.image);
      img.onload = function () {
        let sWidth = img.naturalWidth;
        let sHeight = img.naturalHeight;
        context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      };
      containerImage.append(img);
    } else {
      let sWidth = img.naturalWidth;
      let sHeight = img.naturalHeight;
      img.setAttribute('src', model.image);
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
    }
  } else {
    let img = document.getElementById(model.id);
    if (img == null) {
      img = document.getElementById('image_sample')
    }
    let sWidth = img.naturalWidth;
    let sHeight = img.naturalHeight;
    context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
  }

  this.renderSelected(context, model);
};

Object.assign(ImageElementRenderer.prototype, ReportElementRenderer.prototype);

/**
 * 【表格】渲染类型。
 *
 * @constructor
 */
function TableElementRenderer() {

}

TableElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  // context.font = model.font();
  context.fillStyle = model.fontColor;

  if (model.selected) {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
  } else {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;
  }
  context.setLineDash([]);
  context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;

  // 画边框
  context.beginPath();
  // left-top
  context.moveTo(model.x, model.y);
  // left-bottom
  context.lineTo(model.x, model.y + model.height);
  // right-bottom
  context.lineTo(model.x + model.width, model.y + model.height);
  // right-top
  context.lineTo(model.x + model.width, model.y);
  // left-top
  context.lineTo(model.x, model.y);
  context.stroke();
  context.closePath();

  let columnTitles = model.columns.split(';');
  let columnCount = columnTitles.length;
  let columnWidth = parseInt(model.width / (columnCount == 0 ? 1 : columnCount));
  let headerHeight = model.fontSize * 1.25;

  // 画【列】的竖线
  for (let i = 1; i < columnCount; i++) {
    context.beginPath();
    context.moveTo(model.x + columnWidth * i, model.y);
    context.lineTo(model.x + columnWidth * i, model.y + model.height);
    context.stroke();
    context.closePath();
  }
  // 画【表头】的横线
  context.beginPath();
  context.moveTo(model.x, model.y + headerHeight);
  context.lineTo(model.x + model.width, model.y + headerHeight);
  context.stroke();
  context.closePath();
  // 画【表头】的标题
  context.font = model.font();
  for (let i = 0; i < columnCount; i++) {
    let title = columnTitles[i];
    let titleWidth = context.measureText(title).width;
    let titleX = model.x + (columnWidth - titleWidth) / 2 + columnWidth * i;
    context.fillText(title, titleX, model.y + model.fontSize * 1.0);
  }

  this.renderSelected(context, model);
};

Object.assign(TableElementRenderer.prototype, ReportElementRenderer.prototype);

/**
 * 【图表】渲染类型。
 */
function ChartElementRenderer() {

}

ChartElementRenderer.options = {
  gauge: {
    animation: false,
    series: [{
      radius: '100%',
      center: ['50%', '55%'],
      name: '业务指标',
      type: 'gauge',
      detail: {formatter: '{value}%'},
      data: [{value: 75, name: '完成率'}]
    }]
  },
  bar: {
    animation: false,
    grid: {
      left: 30,
      right: 10,
      top: 10,
      bottom: 20
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }]
  },
  pie: {
    animation: false,
    title: {
      text: '',
      left: 'center'
    },
    series: [{
      name: '访问来源',
      type: 'pie',
      radius: '90%',
      center: ['50%', '50%'],
      data: [
        {value: 335, name: '直接访问'},
        {value: 310, name: '邮件营销'},
        {value: 234, name: '联盟广告'},
        {value: 135, name: '视频广告'},
        {value: 1548, name: '搜索引擎'}
      ]
    }]
  },
  line: {
    animation: false,
    grid: {
      left: 40,
      right: 10,
      top: 10,
      bottom: 20
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line'
    }]
  }
};

ChartElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  let containerImage = document.getElementById('image_container');
  let div = document.getElementById('div-' + model.id);
  let img = document.getElementById('img-' + model.id);

  let sWidth = model.width;
  let sHeight = model.height;

  if (div == null) {
    div = document.createElement('div');
    img = document.createElement('img');

    img.onload = function () {
      sWidth = img.naturalWidth;
      sHeight = img.naturalHeight;
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      img.onload = null;
    };

    containerImage.append(div);
    containerImage.append(img);
  }
  img.setAttribute('id', 'img-' + model.id);
  img.setAttribute('width', model.width);
  img.setAttribute('height', model.height);
  div.setAttribute('id', 'div-' + model.id);
  div.style.height = model.height + 'px';
  div.style.width = model.width + 'px';
  div.removeAttribute('_echarts_instance_');

  let echart = echarts.init(div);
  if (model.subtype == '饼图') {
    echart.setOption(ChartElementRenderer.options.pie);
  } else if (model.subtype == '柱状图') {
    echart.setOption(ChartElementRenderer.options.bar);
  } else if (model.subtype == '折线图') {
    echart.setOption(ChartElementRenderer.options.line);
  } else if (model.subtype == '仪表图') {
    echart.setOption(ChartElementRenderer.options.gauge);
  }
  // 修复改变图表子类型而无法刷新页面的问题。
  if (this.latestSubtype != model.subtype) {
    img.onload = function () {
      sWidth = img.naturalWidth;
      sHeight = img.naturalHeight;
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      img.onload = null;
    };
  }
  this.latestSubtype = model.subtype;

  let image = echart.getDataURL();
  img.setAttribute('src', image);
  if (!img.onload) {
    sWidth = img.naturalWidth;
    sHeight = img.naturalHeight;
    context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
  }

  this.renderSelected(context, model);
};

Object.assign(ChartElementRenderer.prototype, ReportElementRenderer.prototype);

/**
 * 【报表基本元素】
 * @constructor
 */
function ReportElement() {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
}

ReportElement.prototype.isSelected = function () {
  return this.model.selected;
};

ReportElement.prototype.select = function (x, y) {
  let model = this.model;
  this.model.selected =  (x >= model.x && x <= (model.x + model.width) && y >= model.y && y <= (model.y + model.height));
  return this.model.selected;
};

ReportElement.prototype.unselect = function () {
  this.model.selected = false;
};

ReportElement.prototype.render = function (context) {
  this.renderer.render(context, this);
};

ReportElement.prototype.addModelChangedListener = function(listener) {
  this.modelChangedListeners.push(listener);
};

ReportElement.prototype.notifyModelChangedListeners = function(model) {
  for (let key in model) {
    this.model[key] = model[key];
  }
  for (let i = 0; i < this.modelChangedListeners.length; i++) {
    this.modelChangedListeners[i].onModelChanged(model);
  }
};

/**
 * 【文本元素】
 *
 * @param opts
 * @constructor
 */
function TextElement(opts) {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.model.fontFamily = opts.fontFamily || '宋体';
  this.model.fontSize = opts.fontSize || 18;
  this.model.fontColor = 'black';
  this.model.height = this.model.fontSize;
  this.model.type = 'text';
  this.model.id = this.model.type + '-' + moment().valueOf();
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new TextElementRenderer();
}

TextElement.prototype.getProperties = function () {
  return [{
    title: '显示',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 0
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 0
    }]
  },{
    title: '文本',
    properties: [{
      id: 'text',
      label: '文本',
      input: 'textarea',
      value: this.model.text || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    }]
  }];
};

Object.assign(TextElement.prototype, ReportElement.prototype);

/**
 * 【文本元素】
 *
 * @param opts
 * @constructor
 */
function LongtextElement(opts) {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.model.fontFamily = opts.fontFamily || '宋体';
  this.model.fontSize = opts.fontSize || 18;
  this.model.fontColor = 'black';
  this.model.height = 100;
  this.model.width = 200;
  this.model.lineSpace = 5;
  this.model.type = 'longtext';
  this.model.alignment = 'left';
  this.model.id = this.model.type + '-' + moment().valueOf();
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new LongtextElementRenderer();
}

LongtextElement.prototype.getProperties = function () {
  return [{
    title: '显示',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 0
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 0
    }]
  },{
    title: '文本',
    properties: [{
      id: 'text',
      label: '文本',
      input: 'textarea',
      value: this.model.text || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    },{
      id: 'lineSpace',
      label: '行间距',
      input: 'range',
      unit: 'px',
      value: this.model.lineSpace || 5,
      min: '0',
      max: '20'
    }]
  },{
    title: '对齐',
    properties: [{
      id: 'alignment',
      label: '水平',
      input: 'alignment',
      value: this.model.alignment || '',
      display: function (val) {
        function handleClick(button) {
          let buttons = button.parentElement.querySelectorAll('button');
          buttons.forEach((btn) => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
          })
          button.classList.remove('btn-secondary');
          button.classList.add('btn-primary');
        }
        let buttons = document.createElement('div');
        buttons.style.display = 'block';
        buttons.classList.add('btn-group');
        let left = document.createElement('button');
        left.classList.add('btn', 'btn-sm');
        if (val == 'left') {
          left.classList.add('btn-primary');
        } else {
          left.classList.add('btn-secondary')
        }
        left.innerHTML = '<i class="fas fa-align-left"></i>';
        left.addEventListener('click', function() {
          handleClick(left);
        });
        let center = document.createElement('button');
        center.classList.add('btn', 'btn-sm');
        if (val == 'center') {
          center.classList.add('btn-primary');
        } else {
          center.classList.add('btn-secondary')
        }
        center.innerHTML = '<i class="fas fa-align-center"></i>';
        center.addEventListener('click', function() {
          handleClick(center);
        });
        let right = document.createElement('button');
        right.classList.add('btn', 'btn-sm');
        if (val == 'right') {
          right.classList.add('btn-primary');
        } else {
          right.classList.add('btn-secondary')
        }
        right.innerHTML = '<i class="fas fa-align-right"></i>';
        right.addEventListener('click', function() {
          handleClick(right);
        });

        buttons.append(left);
        buttons.append(center);
        buttons.append(right);
        return buttons;
      }
    }]
  }];
};

Object.assign(LongtextElement.prototype, ReportElement.prototype);

/**
 * 【图片元素】对象。
 */
function ImageElement(opts) {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.type = 'image';
  this.model.width = 350;
  this.model.height = 300;
  this.model.id = this.model.type + '-' + moment().valueOf();
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new ImageElementRenderer();
}

ImageElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 350
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 300
    }]
  }, {
    title: '图片',
    properties: [{
      id: 'image',
      label: '图片',
      input: 'file',
      value: this.model.file || ''
    }]
  }];
};

Object.assign(ImageElement.prototype, ReportElement.prototype);

/**
 * 【表格】元素。
 */
function TableElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'table';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 600;
  this.model.height = 240;
  this.model.fontColor = 'black';
  this.model.fontSize = 12;
  this.model.fontFamily = ReportDesigner.TEXT_FONT_FAMILY;
  this.model.columns =  '商品;单价;数量;总价';
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new TableElementRenderer();
}

TableElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }, {
    title: '表格',
    properties: [{
      id: 'columns',
      label: '列',
      input: 'textarea',
      value: this.model.columns || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    }]
  }];
};

Object.assign(TableElement.prototype, ReportElement.prototype);


/**
 * 【图表】元素。
 */
function ChartElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'chart';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 500;
  this.model.height = 360;
  this.model.fontSize = 12;
  this.model.fontFamily = ReportDesigner.TEXT_FONT_FAMILY;
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new ChartElementRenderer();
}

ChartElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }, {
    title: '图表',
    properties: [{
      id: 'subtype',
      label: '类型',
      input: 'select',
      value: this.model.subtype || '',
      values: ['饼图','柱状图','折线图','仪表图']
    }]
  }];
};

Object.assign(ChartElement.prototype, ReportElement.prototype);

function Storyboard(opt) {
  this.pages = opt.pages || [];
  this.scaling = opt.scaling !== false;
  this.home = null;
  this.drawedPages = [];

  const WIDTH = 100;
  const HEIGHT = 180;

  this.pages.forEach(page => {
    page.width = WIDTH;
    page.height = HEIGHT;
  });

  this.selectedPage = null;
  this.selectedPageoffsetV = -1;
  this.selectedPageoffsetH = -1;
}

Storyboard.prototype.buildGraph = function () {
  let layeredPages = [];

  let existings = {};
  let refs = {};
  for (let i = 0; i < this.pages.length; i++) {
    let page = this.pages[i];
    for (let j = 0; j < page.links.length; j++) {
      refs[page.links[j]] = {};
    }
  }
  // 未被任何其他页面引用的
  let pages = [];
  for (let i = 0; i < this.pages.length; i++) {
    let page = this.pages[i];
    if (!refs[page.id]) {
      existings[page.id]= page;
      pages.push(page);
    }
  }
  pages.sort((a, b) => {
    if (a.links.length > b.links.length) {
      return -1;
    }
    return 1;
  });
  layeredPages.push(pages);

  this.buildGraphLayer(1, layeredPages, existings);
  this.buildGraphLayer(2, layeredPages, existings);
  this.buildGraphLayer(3, layeredPages, existings);
  this.buildGraphLayer(4, layeredPages, existings);
  this.buildGraphLayer(5, layeredPages, existings);

  return layeredPages;
};

Storyboard.prototype.buildGraphLayer = function (layerNumber, layeredPages, existings) {
  if (layeredPages.length < layerNumber) return;
  let pages = [];
  for (let i = 0; i < layeredPages[layerNumber - 1].length; i++) {
    let page = layeredPages[layerNumber - 1][i]
    for (let j = 0; j < page.links.length; j++) {
      let found = this.getPage(page.links[j]);
      if (found != null && !existings[found.id]) {
        existings[found.id] = found;
        pages.push(found);
      }
    }
  }

  if (pages.length == 0) return;

  pages.sort((a, b) => {
    if (a.links.length > b.links.length) {
      return -1;
    }
    return 1;
  });
  layeredPages.push(pages);
};

Storyboard.prototype.render = function (containerId) {
  let container = dom.find(containerId);
  let rect = container.getBoundingClientRect();

  let canvas = document.createElement("canvas");

  this.width = rect.width;
  this.height = rect.height;
  this.context = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = this.width * dpr;
  canvas.height = this.height * dpr;
  container.appendChild(canvas);

  let ratio = Math.min(
    canvas.clientWidth / this.width,
    canvas.clientHeight / this.height
  );
  if (this.scaling === true) {
    this.context.scale(dpr, dpr);
  }

  let x = 20;
  let y = 30;
  const GUTTER = 60;
  const WIDTH = 100;
  const HEIGHT = 180;

  let layeredPages = this.buildGraph();
  for (let i = 0; i < layeredPages.length; i++) {
    for (let j = 0; j < layeredPages[i].length; j++) {
      let page = layeredPages[i][j];
      page.x = x + i * (WIDTH + GUTTER);
      page.y = y + j * (HEIGHT + GUTTER);
    }
  }

  this.redraw();
  this.bindEvents(canvas);
};

Storyboard.prototype.drawGrids = function() {
  let cellW = 10, cellH = 10;

  // vertical lines
  for (let x = 0; x <= this.width; x += cellW) {
    this.context.moveTo(x, 0); // x, y
    this.context.lineTo(x, this.height);
  }

  // horizontal lines
  for (let y = 0; y <= this.height; y += cellH) {
    this.context.moveTo(0, y); // x, y
    this.context.lineTo(this.width, y);
  }

  this.context.strokeStyle = "#dedede";
  this.context.stroke();
};

Storyboard.prototype.drawPage = function(page) {
  this.context.strokeStyle = '#eee';
  this.context.fillStyle = 'white';
  this.context.beginPath();
  this.context.rect(page.x, page.y, page.width, page.height);
  this.context.stroke();
  this.context.fill();

  if (page.screenshot) {
    if (!page.image) {
      page.image = new Image();
      page.image.src = page.screenshot;
      page.image.onload = () => {
        this.context.drawImage(page.image, page.x, page.y, page.width, (page.width / page.image.width) * page.image.height);
      };
    } else {
      this.context.drawImage(page.image, page.x, page.y, page.width, (page.width / page.image.width) * page.image.height);
    }
  }

  this.context.fillStyle = 'black';
  this.context.font = 'bold 10px 黑体';
  let metrics = this.context.measureText(page.title);
  this.context.fillText(page.title, page.x + (page.width - metrics.width) / 2, page.y - 8);
  this.context.stroke();

  this.drawedPages.push(page);
};

Storyboard.prototype.connect = function(startPage, finishPage) {
  if (!finishPage) return;

  let distTopBottom = startPage.y - (finishPage.y + finishPage.height);
  let distBottomTop = finishPage.y - (startPage.y + startPage.height);
  let distRightLeft = finishPage.x - (startPage.x + startPage.width);
  let distLeftRight = startPage.x - (finishPage.x + finishPage.width);

  let firstMidX = 0;
  let firstMidY = 0;
  let secondMidX = 0;
  let secondMidY = 0;
  let cp1;
  let cp2;

  let offsetH = 2.5;
  let offsetV = 7;

  if (distTopBottom > 0) {
    firstMidX = startPage.x + startPage.width / 2;
    firstMidY = startPage.y;
    secondMidX = finishPage.x + finishPage.width / 2;
    secondMidY = finishPage.y + finishPage.height;
    let distance = Math.abs(secondMidY - firstMidY);
    let ctrlDistance = distance / 2;
    cp1 = {
      x: firstMidX,
      y: firstMidY - ctrlDistance,
    };
    cp2 = {
      x: secondMidX,
      y: secondMidY + ctrlDistance,
    };
    this.connectionType = 'connectionTopBottom';
  }
  if (distBottomTop > 0) {
    firstMidX = startPage.x + startPage.width / 2;
    firstMidY = startPage.y + startPage.height;
    secondMidX = finishPage.x + finishPage.width / 2;
    secondMidY = finishPage.y;
    let distance = Math.abs(secondMidY - firstMidY);
    let ctrlDistance = distance / 2;
    cp1 = {
      x: firstMidX,
      y: firstMidY + ctrlDistance,
    };
    cp2 = {
      x: secondMidX,
      y: secondMidY - ctrlDistance,
    };
    this.connectionType = 'connectionBottomTop';
  }
  if (distRightLeft > 0) {
    firstMidX = startPage.x + startPage.width;
    firstMidY = startPage.y + startPage.height / 2;
    secondMidX = finishPage.x;
    secondMidY = finishPage.y + finishPage.height / 2;
    let distance = Math.abs(secondMidX - firstMidX);
    let ctrlDistance = distance / 2;
    cp1 = {
      x: firstMidX + ctrlDistance,
      y: firstMidY,
    };
    cp2 = {
      x: secondMidX - ctrlDistance,
      y: secondMidY,
    };
    this.connectionType = 'connectionRightLeft';
  }
  if (distLeftRight > 0) {
    firstMidX = startPage.x;
    firstMidY = startPage.y + startPage.height / 2;
    secondMidX = finishPage.x + finishPage.width;
    secondMidY = finishPage.y + finishPage.height / 2;
    let distance = Math.abs(secondMidX - firstMidX);
    let ctrlDistance = distance / 2;
    cp1 = {
      x: firstMidX - ctrlDistance,
      y: firstMidY,
    };
    cp2 = {
      x: secondMidX + ctrlDistance,
      y: secondMidY,
    };
    this.connectionType = 'connectionLeftRight';
  }

  if (!cp1) return;

  this.context.strokeStyle = '#aaa';
  this.context.fillStyle = '#aaa';
  this.context.beginPath();
  this.context.arc(firstMidX, firstMidY, 2, 0, 2 * Math.PI, false);
  this.context.fill();
  this.context.moveTo(firstMidX, firstMidY);
  if (this.connectionType === 'connectionTopBottom') {
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, secondMidX, secondMidY + offsetV);
  } else if (this.connectionType === 'connectionBottomTop') {
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, secondMidX, secondMidY - offsetV);
  } else if (this.connectionType === 'connectionRightLeft') {
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, secondMidX - offsetV, secondMidY);
  } else if (this.connectionType === 'connectionLeftRight') {
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, secondMidX + offsetV, secondMidY);
  }
  this.context.stroke();

  this.context.beginPath();

  if (this.connectionType === 'connectionTopBottom') {
    this.context.moveTo(secondMidX, secondMidY);
    this.context.lineTo(secondMidX + offsetH, secondMidY + offsetV);
    this.context.lineTo(secondMidX - offsetH, secondMidY + offsetV);
    this.context.moveTo(secondMidX, secondMidY);
  } else if (this.connectionType === 'connectionBottomTop') {
    this.context.moveTo(secondMidX, secondMidY);
    this.context.lineTo(secondMidX + offsetH, secondMidY - offsetV);
    this.context.lineTo(secondMidX - offsetH, secondMidY - offsetV);
    this.context.moveTo(secondMidX, secondMidY);
  } else if (this.connectionType === 'connectionRightLeft') {
    this.context.moveTo(secondMidX, secondMidY);
    this.context.lineTo(secondMidX - offsetV, secondMidY - offsetH);
    this.context.lineTo(secondMidX - offsetV, secondMidY + offsetH);
    this.context.moveTo(secondMidX, secondMidY);
  } else if (this.connectionType === 'connectionLeftRight') {
    this.context.moveTo(secondMidX, secondMidY);
    this.context.lineTo(secondMidX + offsetV, secondMidY - offsetH);
    this.context.lineTo(secondMidX + offsetV, secondMidY + offsetH);
    this.context.moveTo(secondMidX, secondMidY);
  }

  this.context.closePath();
  this.context.fill();
  this.context.stroke();
};

Storyboard.prototype.redraw = function () {
  this.context.clearRect(0, 0, this.width, this.height);

  this.drawGrids();

  for (let i = 0; i < this.pages.length; i++) {
    this.drawPage(this.pages[i]);
  }

  for (let i = 0; i < this.pages.length; i++) {
    let page = this.pages[i];
    for (let j = 0; j < page.links.length; j++) {
      let another = this.getPage(page.links[j]);
      this.connect(page, another);
    }
  }

};

Storyboard.prototype.getPage = function (id) {
  for (let i = 0; i < this.pages.length; i++) {
    if (this.pages[i].id === id) {
      return this.pages[i];
    }
  }
  return null;
};

Storyboard.prototype.findPageByCoords = function (x, y) {
  for (let i = 0; i < this.pages.length; i++) {
    let page = this.pages[i];
    if (x > page.x &&
        x < (page.x + page.width) &&
        y > page.y &&
        y < (page.y + page.height)) {
      return page;
    }
  }
  return null;
};

Storyboard.prototype.bindEvents = function (canvas) {
  canvas.onclick = ev => {
    let clickedX = ev.layerX;
    let clickedY = ev.layerY;
  };
  canvas.onmousedown = ev => {
    if (event.which == 1) {
      this.selectedPage = this.findPageByCoords(ev.layerX, ev.layerY);
      if (this.selectedPage != null) {
        this.selectedPageoffsetV = ev.layerX - this.selectedPage.x;
        this.selectedPageoffsetH = ev.layerY - this.selectedPage.y;
        canvas.style.cursor = 'move';
      }
    }
  };
  canvas.onmouseup = ev => {
    canvas.style.cursor = 'default';
    this.selectedPage = null;
  };
  canvas.onmousemove = ev => {
    if (this.selectedPage == null) return;
    if (ev.which != 1) return;
    let movedX = ev.layerX;
    let movedY = ev.layerY;
    this.selectedPage.x = movedX - this.selectedPageoffsetV;
    this.selectedPage.y = movedY - this.selectedPageoffsetH;
    this.redraw();
  };

  canvas.onwheel = ev => {
    for (let i = 0; i < this.pages.length; i++) {
      let page = this.pages[i];
      page.x += ev.wheelDeltaX / 5;
      page.y += ev.wheelDeltaY / 5;
    }
    this.redraw();
  }
};
function StructuredDataEntry(opts) {
  if (opts && opts.container) {
    this.container = dom.find(opts.container);
  }
  this.onInput = opts.onInput;
  this.customs = opts.customs || {};

  dom.bind(this.container, 'click', ev => {
    this.container.querySelectorAll('[sde-select]').forEach(el => {
      el.remove();
    })
  })
}

StructuredDataEntry.prototype.initialize = function(data) {
  data = data || {};
  let self = this;
  let children = this.container.querySelectorAll('[data-sde-name]');
  children.forEach((el, idx) => {
    dom.bind(el, 'keypress', function(ev) {
      let charCode = (ev.which) ? ev.which : ev.keyCode;
      if (charCode == 13) {
        ev.preventDefault();
      }
    });
    let input = el.getAttribute('data-sde-input');
    if (input === 'number') {
      el.setAttribute('contenteditable', true);
      self.bindNumberInput(el);
    } else if (input === 'select') {
      el.classList.add('pointer');
      self.bindSelectInput(el);
    } else if (input === 'date') {

    } else if (input === 'year') {
      el.classList.add('pointer');
      self.bindYearInput(el);
    } else if (input === 'month') {
      el.classList.add('pointer');
      self.bindMonthInput(el);
    } else if (input === 'day') {
      el.classList.add('pointer');
      self.bindDayInput(el);
    } else if (input === 'multiselect') {
      el.classList.add('pointer');
      self.bindMultiselectInput(el);
    } else if (this.customs[input]) {
      el.classList.add('pointer');
      self.bindCustomInput(el, this.customs[input]);
    } else {
      el.setAttribute('contenteditable', true);
      self.bindTextInput(el);
    }
    let name = el.getAttribute('data-sde-name');
    if (name !== '' && name != 'undefined' && data[name]) {
      let _value = data[el.getAttribute('data-sde-name')];
      let selectvalue=el.getAttribute('data-sde-values');
      let trigger = el;
      let par = trigger.parentElement.parentElement;
      el.classList.remove('sde-input-default');
      el.innerText = '【' + data[name] + '】';
      // 非显示的引用值
      if (el.getAttribute('data-sde-param') != '') {
        el.setAttribute('data-sde-value', data[el.getAttribute('data-sde-param')]);
      }
      // if(input=='number'&&data[el.getAttribute('data-sde-name')]!=0
      //   || input=='select'&&selectvalue.indexOf(_value)>-1
      //   || input=='multiselect' && _value.length>0
      //   || input=='text'&&data[el.getAttribute('data-sde-name')]!=el.getAttribute('data-sde-label') ){
      //   el.classList.remove('sde-input-default');
      //   el.innerText = data[el.getAttribute('data-sde-name')];
      //   par.dataset.nodata='false';
      // }
      if (par.children.forEach) {
        par.children.forEach(function (el, idx) {
          let visible = el.getAttribute('data-sde-visible');
          if (visible) {
            let strs = visible.split('==');
            if (trigger.getAttribute('data-sde-name') == strs[0] && trigger.innerText == strs[1]) {
              el.style.display = '';
            } else {
              el.style.display = 'none';
            }
          }
        });
      }
    }
  });
};

StructuredDataEntry.prototype.getValues = function() {
  let ret = {};
  let spans = this.container.querySelectorAll('span[data-sde-name]');
  for (let i = 0; i < spans.length; i++) {
    let span = spans[i];
    let name = span.getAttribute('data-sde-name');
    let label = span.getAttribute('data-sde-label');
    let type=span.getAttribute('data-sde-input');
    if (span.innerText !== label){
      ret[name] = span.innerText;
      if((type=='number'||type=='text')&&span.innerText!=0){
        var par = span.parentElement.parentElement;
        par.dataset.nodata='false';
      }
    }
  }
  return ret;
};

StructuredDataEntry.prototype.getHtml = function() {
  let html = this.container.innerHTML;
  let root = dom.element('<div>' + html + '</div>');
  let spans = root.querySelectorAll('span[data-sde-name]');
  for (let i = 0; i < spans.length; i++) {
    let span = spans[i];
    let name = span.getAttribute('data-sde-name');
    let label = span.getAttribute('data-sde-label');
    if (name.indexOf('上升指标') != -1 || name.indexOf('下降指标') != -1) {
      if (label === span.innerText.trim()) {
        span.parentElement.remove();
      }
    }
  }
  html = root.innerHTML;
  html = html.replaceAll('contenteditable', '');
  html = html.replaceAll('pointer', '');
  html = html.replaceAll('<p>', '<p style="margin-bottom: 0;">');
  return html;
};

StructuredDataEntry.prototype.getHasDataHtml = function() {
  let html = this.container.innerHTML;
  let root = dom.element('<div>' + html + '</div>');
  let pitem = root.querySelectorAll('p'),_html=null;
  for (let i = 0; i < pitem.length; i++) {
    let p = pitem[i];
    let nodata = p.getAttribute('data-nodata');
    if (nodata=='true') {
      p.remove();
    }else {
      let spans = p.querySelectorAll('span[data-sde-name]');
      for (let i = 0; i < spans.length; i++) {
        let span = spans[i];
        let name = span.getAttribute('data-sde-name');
        let label = span.getAttribute('data-sde-label');
        let type = span.getAttribute('data-sde-input');
        let values = span.getAttribute('data-sde-values');
        let val=span.innerText.trim();
        if (label ===val  || (type=='select'&&values.indexOf(val)==-1)) {
          span.parentElement.remove();
        }
      }
    }
  }
  _html = root.innerHTML;
  _html = _html.replaceAll('contenteditable', '');
  _html = _html.replaceAll('pointer', '');
  _html = _html.replaceAll('<p>', '<p style="margin-bottom: 0;">');
  _html = _html.replaceAll('<p data-nodata="false">', '<p style="margin-bottom: 0;">');
  return _html;
};

StructuredDataEntry.prototype.bindTextInput = function(el) {
  dom.bind(el, 'input', ev => {
    let el = ev.currentTarget;
    let name = el.getAttribute('data-sde-name');
    let value = el.innerText;
    this.onInput(name, value);
  });
};

StructuredDataEntry.prototype.bindNumberInput = function(el) {
  dom.bind(el, 'keypress', function(ev) {
    let charCode = (ev.which) ? ev.which : ev.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      ev.preventDefault();
    }
  });
  dom.bind(el, 'focus', function(ev) {
    document.execCommand('selectAll',false,null)
  });
  dom.bind(el, 'blur', function(ev) {
    let value=el.innerText;
    var par = el.parentElement.parentElement;
    if(el.getAttribute('data-sde-input')=='number' && value!=0 ){
      el.classList.remove('sde-input-default');
      par.dataset.nodata='false';
    }else if(el.getAttribute('data-sde-input')=='text' && value!=el.getAttribute('data-sde-label')){
      el.classList.remove('sde-input-default');
      par.dataset.nodata='false';
    }else{
      el.classList.remove('sde-input-default');
      el.classList.add('sde-input-default');
      par.dataset.nodata='true';
    }
  });
  dom.bind(el, 'input', ev => {
    let el = ev.currentTarget;
    let name = el.getAttribute('data-sde-name');
    let value = el.innerText;
    this.onInput(name, value);
  });
};

StructuredDataEntry.prototype.bindSelectInput = function(el) {
  let self = this;
  dom.bind(el, 'click', async function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    let values = this.getAttribute('data-sde-values');
    let url = this.getAttribute('data-sde-url');
    // 用于显示的字段
    let field = this.getAttribute('data-sde-field');

    let vals = [];
    if (values) {
      values = values.substring(1, values.length - 1);
      vals = values.split(',');
    } else if (url) {
      let data = await xhr.promise({
        url: url,
        params: {},
      });
      vals = data;
    }

    div = self.createPopupSelect(this, vals);
    self.container.appendChild(div);
    self.positionPopup(el, div);
    let rightbar = dom.find('.right-bar')
    if (rightbar != null) {
      let rect = rightbar.getBoundingClientRect();
      if (rect.right < rectDiv.right) {
        div.style.right = '0px';
        div.style.left = 'auto';
      }
    }
  });
};

StructuredDataEntry.prototype.bindYearInput = function(el) {
  let self = this;
  dom.bind(el, 'click', async function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    const currYear = new Date().getFullYear();

    let vals = [currYear - 2, currYear - 1, currYear, currYear + 1, currYear + 2, currYear + 3, currYear + 4];

    div = self.createPopupSelect(this, vals);
    this.parentElement.appendChild(div);
    self.positionPopup(el, div);
    let rightbar = dom.find('.right-bar')
    if (rightbar != null) {
      let rect = rightbar.getBoundingClientRect();
      if (rect.right < rectDiv.right) {
        div.style.right = '0px';
        div.style.left = 'auto';
      }
    }
  });
};

StructuredDataEntry.prototype.bindMonthInput = function(el) {
  let self = this;
  dom.bind(el, 'click', async function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    let vals = [1,2,3,4,5,6,7,8,9,10,11,12];

    let rectThis = this.getBoundingClientRect();
    let rectParent = this.parentElement.getBoundingClientRect();

    div = self.createPopupSelect(this, vals, '36px');
    this.parentElement.appendChild(div);
    self.positionPopup(el, div);
    let rightbar = dom.find('.right-bar')
    if (rightbar != null) {
      let rect = rightbar.getBoundingClientRect();
      if (rect.right < rectDiv.right) {
        div.style.right = '0px';
        div.style.left = 'auto';
      }
    }
  });
};

StructuredDataEntry.prototype.bindDayInput = function(el) {
  let self = this;
  dom.bind(el, 'click', async function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    let vals = [];
    for (let i = 1; i <= 31; i++)
      vals.push(i);

    div = self.createPopupSelect(this, vals, '36px');
    this.parentElement.appendChild(div);
    self.positionPopup(el, div);
    let rightbar = dom.find('.right-bar')
    if (rightbar != null) {
      let rect = rightbar.getBoundingClientRect();
      if (rect.right < rectDiv.right) {
        div.style.right = '0px';
        div.style.left = 'auto';
      }
    }
  });
};

StructuredDataEntry.prototype.bindCustomInput = function(el, custom) {
  dom.bind(el, 'click', ev => {
    custom(el);
  });
};

StructuredDataEntry.prototype.bindMultiselectInput = function(el) {
  let self = this;
  dom.bind(el, 'click', function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    let label = this.getAttribute('data-sde-label');
    let values = this.getAttribute('data-sde-values');
    values = values.substring(1, values.length - 1);
    let vals = values.split(',');

    let rect = this.getBoundingClientRect();

    div = dom.create('div');
    div.setAttribute('sde-select', true);
    div.style.zIndex = '99999999';
    div.style.position = 'absolute';
    div.style.top = '0px';
    div.style.left = (this.parentElement.offsetLeft + 60) + 'px';

    let ul = dom.create('ul');
    ul.style.backgroundColor = '#fefefe';
    ul.style.border = '1px solid #ccc';
    ul.style.listStyleType = 'none';
    ul.style.padding = '0px';
    ul.style.margin = '0px';

    let trigger = this;
    let strs = trigger.innerText.split('、');

    for (let i = 0; i < vals.length; i++) {
      let li = dom.create('li');
      li.setAttribute('data-sde-selected', 'false');
      li.style.padding = '0 10px';
      li.style.color = '#666';
      li.style.fontSize = '12px';
      li.style.lineHeight = '2rem';
      li.style.width = '100%';
      li.style.cursor = 'pointer';
      li.style.whiteSpace='nowrap';
      li.innerText = vals[i];
      for (let j = 0; j < strs.length; j++) {
        if (li.innerText === strs[j]) {
          li.style.background = '#efefef';
          li.setAttribute('data-sde-selected', 'true');
          break;
        }
      }
      dom.bind(li, 'click', function(ev) {
        ev.stopPropagation();

        if (trigger.innerText == label) {
          trigger.innerText = '';
        }

        let strs = trigger.innerText.split('、');
        trigger.style.color = 'black';
        let _par = trigger.parentElement.parentElement;
        _par.dataset.nodata='false';
        // 检查是否已经选了
        if (this.getAttribute('data-sde-selected') == 'false') {
          this.style.background = '#efefef';
          if (trigger.innerText.trim() !== '') {
            trigger.innerText += '、';
          }
          trigger.innerText += this.innerText;
          this.setAttribute('data-sde-selected', 'true');
        } else {
          this.style.background = '#fefefe';
          trigger.innerText = '';

          for (let i = 0; i < strs.length; i++) {
            if (this.innerText === strs[i]) continue;
            if (trigger.innerText.trim() !== '') {
              trigger.innerText += '、';
            }
            trigger.innerText += strs[i];
          }
          if (trigger.innerText == '') {
            trigger.innerText = label;
            trigger.style.color = '#FF8080';
          }
          this.setAttribute('data-sde-selected', 'false');
        }

        // 检查选择后的处罚条件
        let par = trigger.parentElement.parentElement;
        par.children.forEach(function(el, idx) {
          let visible = el.getAttribute('data-sde-visible');
          if (visible) {
            let strs = visible.split('==');
            if (trigger.getAttribute('data-sde-name') == strs[0] && trigger.innerText == strs[1]) {
              el.style.display = '';
            } else {
              el.style.display = 'none';
            }
          }
        });
      });
      ul.appendChild(li);
    }
    div.appendChild(ul);
    this.parentElement.appendChild(div);
    // 重新调整位置
    let rectDiv = div.getBoundingClientRect();
    let containerHeight = dom.find('.right-bar').getBoundingClientRect().height;
    let containerWidth = self.container.getBoundingClientRect().width;
    if (containerHeight < (rectDiv.top + this.scrollTop + rectDiv.height),rectDiv,rectDiv.width) {
      // div.style.top = (containerHeight - rectDiv.height) + 'px';
      // console.log(div.style.top);
    }
    let _container=dom.find('.right-bar').getBoundingClientRect()
    if(_container.right < rectDiv.right){
      div.style.right ='0px';
      div.style.left = 'auto';
    }
  });
};

StructuredDataEntry.prototype.getEntries = function () {
  let sdes = this.container.querySelectorAll('span[data-sde-name]');
  let ret = [];
  for (let sde of sdes) {
    ret.push({
      name: sde.getAttribute('data-sde-name'),
      value: sde.innerText,
    })
  }
  return ret;
};

StructuredDataEntry.prototype.getParams = function () {
  let sdes = this.container.querySelectorAll('span[data-sde-param]');
  let ret = {};
  for (let sde of sdes) {
    ret[sde.getAttribute('data-sde-param')] = sde.getAttribute('data-sde-value');
  }
  return ret;
};

StructuredDataEntry.prototype.autofill = function (selector, value) {
  let spans = this.container.querySelectorAll(selector);
  for (let span of spans) {
    span.innerText = '【' + (value || '') + '】';
  }
};

StructuredDataEntry.prototype.createPopupSelect = function (el, vals, width) {
  let label = el.getAttribute('data-sde-label');
  let field = el.getAttribute('data-sde-field');
  let self = this;
  let ret = dom.create('div');
  ret.style.zIndex = 999999999;
  ret.setAttribute('sde-select', true);
  ret.setAttribute('contenteditable', false);
  ret.style.position = 'absolute';
  ret.style.top = '0px';
  ret.style.overflowY = 'auto';
  ret.style.maxHeight = '300px';
  ret.style.left = (el.parentElement.offsetLeft + 60) + 'px';

  let ul = dom.create('ul');
  ul.style.backgroundColor = '#fefefe';
  ul.style.border = '1px solid #ccc';
  ul.style.listStyleType = 'none';
  ul.style.padding = '0px';
  ul.style.margin = '0px';

  if (width) {
    ul.style.display = 'flex';
    ul.style.flexDirection = 'row';
    ul.style.flexWrap = 'wrap';
    ul.style.width = '200px';
  }

  let trigger = el;
  for (let i = 0; i < vals.length; i++) {
    let li = dom.create('li');
    li.style.padding = '0 10px';
    li.style.color = '#666';
    li.style.fontSize = '12px';
    li.style.lineHeight = '2rem';
    if (width) {
      li.style.width = width;
    } else {
      li.style.width = '100%';
    }
    li.style.whiteSpace='nowrap';

    if (typeof vals[i] === 'string' || typeof vals[i] === 'number') {
      li.innerText = vals[i];
    } else {
      dom.model(li, vals[i]);
      li.innerText = vals[i][field];
    }
    li.style.cursor = 'pointer';
    dom.bind(li, 'click', function() {
      trigger.innerText = '【' + li.innerText + '】';
      // trigger.style.color = 'black';
      let par = trigger.parentElement.parentElement;
      par.dataset.nodata='false';
      if (par.children.forEach) {
        par.children.forEach(function (el, idx) {
          let visible = el.getAttribute('data-sde-visible');
          if (visible) {
            let strs = visible.split('==');
            if (trigger.getAttribute('data-sde-name') == strs[0] && trigger.innerText == strs[1]) {
              el.style.display = '';
            } else {
              el.style.display = 'none';
            }
          }
        });
      }
      if (self.onInput) {
        self.onInput(trigger.getAttribute('data-sde-name'), li.innerText, dom.model(li));
      }
      ret.remove();
    });
    ul.appendChild(li);
  }
  ret.appendChild(ul);
  return ret;
};

StructuredDataEntry.prototype.positionPopup = function (trigger, tooltip) {
  if (this.popperInstance) {
    this.popperInstance.destroy();
    this.popperInstance = null;
  }
  this.popperInstance = Popper.createPopper(trigger, tooltip, {
    placement: "auto",
    modifiers: [{
      name: "offset",
      options: {
        offset: [0, 8]
      }
    },{
      name: "flip", //flips popper with allowed placements
      options: {
        allowedAutoPlacements: ["right", "left", "top", "bottom"],
        rootBoundary: "viewport"
      }
    }]
  });
};





function TestSheet(opt) {
  // 输入的数据列
  // 每一列包括列标题、数据类型、默认值、占位符
  this.columns = opt.columns;
  this.columnCount = opt.columns.length;
  // 第一列的行标题
  this.rowHeaderWidth = opt.rowHeaderWidth || 150;
  this.rowHeaders = opt.rowHeaders;
  this.rowCount = opt.rowHeaders.length;
  // 是否只读模式
  this.readonly = opt.readonly === true ? true : false;

  this.totalColumns = [];
  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    if (column.totalable) {
      this.totalColumns.push(column);
    }
  }
}

/**
 * 渲染基础的表格DOM。
 */
TestSheet.prototype.root = function(data) {
  data = data || {};
  let self = this;
  this.table = dom.create('table', 'table', 'table-bordered');
  let thead = dom.create('thead');
  this.tbody = dom.create('tbody');
  let tr = dom.create('tr');
  let th = dom.create('th');
  th.style.borderBottomWidth = '0';
  th.style.width = this.rowHeaderWidth + 'px';

  tr.appendChild(th);
  thead.appendChild(tr);
  this.table.appendChild(thead);
  this.table.appendChild(this.tbody);

  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    th = dom.create('th', 'text-center');
    th.style.borderBottomWidth = '0';
    th.innerHTML = column.title;
    tr.appendChild(th);
  }

  for (let i = 0; i < this.rowCount; i++) {
    let rowHeader = this.rowHeaders[i];
    let tr = dom.create('tr');
    let td = dom.create('td');
    td.innerHTML = rowHeader.title;
    td.style.fontWeight = 'bold';
    tr.appendChild(td);
    for (let j = 0; j < this.columnCount; j++) {
      let column = this.columns[j];
      td = dom.create('td');
      td.style.textAlign = 'right';
      td.style.padding = '6px 12px';
      td.setAttribute('contenteditable', 'true');
      td.setAttribute('data-ts-format', column.format || '');
      td.setAttribute('data-ts-row', i);
      td.setAttribute('data-ts-column', j);
      td.addEventListener('focus', function() {

      });
      if (data[rowHeader.title] && data[rowHeader.title][column.title]) {
        td.innerHTML = data[rowHeader.title][column.title];
      } else {
        td.innerHTML = '';
      }
      td.addEventListener('keyup', function(ev) {
        let td = this;
        let rowIndex = parseInt(td.getAttribute('data-ts-row'));
        let columnIndex = parseInt(td.getAttribute('data-ts-column'));
        let triggered = null;
        if (ev.keyCode == 13 /* ENTER */) {
          triggered = td;
        } else if (ev.keyCode == 37 /* ARROW LEFT */) {
          if (columnIndex == 0 /* 已经是第一列了，无法再向左移动 */) return;
          triggered = self.getCell(rowIndex, columnIndex - 1);
        } else if (ev.keyCode == 38 /* ARROW UP */) {
          if (rowIndex == 0 /* 已经是第一行了，无法再向上移动 */) return;
          triggered = self.getCell(rowIndex - 1, columnIndex);
        } else if (ev.keyCode == 39 /* ARROW RIGHT */) {
          if (columnIndex == self.columnCount - 1 /* 已经是最后一列，无法再向右移动 */) return;
          triggered = self.getCell(rowIndex, columnIndex + 1);
        } else if (ev.keyCode == 40 /* ARROW DOWN */) {
          if (rowIndex == self.rowCount - 1 /* 已经是最后一行，无法再向下移动 */) return;
          triggered = self.getCell(rowIndex + 1, columnIndex);
        }
        self.totalize();
        if (triggered != null) {
          td.blur();
          triggered.focus();
          document.execCommand('selectAll',false,null)
        }
      });
      tr.appendChild(td);
    }
    this.tbody.appendChild(tr);
  }
  if (this.totalColumns.length > 0) {
    let tr = dom.create('tr');
    let td = dom.create('td');
    td.innerHTML = '合计';
    td.style.fontWeight = 'bold';
    tr.appendChild(td);
    for (let j = 0; j < this.columnCount; j++) {
      td = dom.create('td');
      tr.appendChild(td);
    }
    this.tbody.appendChild(tr);
  }
  this.totalize();
  return this.table;
};

TestSheet.prototype.getCell = function(rowIndex, columnIndex) {
  let tbody = dom.find('tbody', this.table);
  let ret = null;
  for (let i = 0; i < tbody.children.length; i++) {
    let tr = tbody.children[i];
    if (i == rowIndex) {
      for (let j = 1 /*行头去掉*/; j < tr.children.length; j++) {
        if (j - 1 == columnIndex) {
          ret = tr.children[j];
          break;
        }
      }
      break;
    }
  }
  return ret;
};

TestSheet.prototype.render = function(containerId, data) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  this.container.appendChild(this.root(data));
};

TestSheet.prototype.getValues = function() {
  let ret = {};
  for (let i = 0; i < this.rowHeaders.length; i++) {
    let rowHeader = this.rowHeaders[i];
    ret[rowHeader.title] = {};
    for (let j = 0; j < this.columns.length; j++) {
      let col = this.columns[j];
      ret[rowHeader.title][col.title]  = this.tbody.rows[i].cells[j + 1].innerText.trim();
    }
  }
  return ret;
};

TestSheet.prototype.totalize = function() {
  if (this.totalColumns.length == 0) return;
  let trTotal = this.tbody.children[this.tbody.children.length - 1];
  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    if (column.totalable !== true) continue;
    let total = 0;
    let calculated = false;
    for (let j = 0; j < this.rowHeaders.length; j++) {
      let val = parseFloat(this.tbody.rows[j].cells[i + 1].innerText.trim());
      if (!isNaN(val)) {
        total += val;
        calculated = true;
      }
    }
    if (!isNaN(total) && calculated === true) {
      trTotal.cells[i + 1].innerText = total.toFixed(2);
    }
  }
};


function WeeklyCalendar(opt) {
  this.initialDate = opt.initialDate;
  this.editable = opt.editable || false;
  this.droppable = opt.droppable || false;
  // 首列的标题
  this.columnTitle = opt.columnTitle || '';
  // 拖拽drop以后的回调函数，drop到的单元格和transferData
  this.onRenderDropped = opt.onRenderDropped || function (td, data) {};
  // 渲染单元格函数，
  this.onRenderCell = opt.onRenderCell || function (td, data, rowIndex, cellIndex) {};
  this.dateField = opt.dateField;
  this.datedData = opt.datedData || [];
  this.rowHeaders = opt.rowHeaders || [];
  // 定位行索引函数
  this.isMatchedCell = opt.isMatchedCell;
  this.onAddedToCell = opt.onAddedToCell || function (container, date, rowIndex, initial) {};
}

/**
 * 构造根元素。
 */
WeeklyCalendar.prototype.root = function () {
  let ret = dom.templatize(`
    <table class="table table-responsive-sm table-outline">
      <thead class="thead-light">
      <tr>
        <th style="width: 12.5%; text-align: center; vertical-align: middle;">{{columnTitle}}</th>
        <th style="width: 12.5%; text-align: center;">
          <div>周一</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周二</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周三</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周四</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周五</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周六</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周日</div>
          <div></div>
        </th>
      </tr>
      </thead>
      <tbody></tbody>
    </table>
  `, this);
  let thead = dom.find('thead', ret);
  let dayOfWeek = this.initialDate.day();
  if (dayOfWeek == 0) dayOfWeek = 7; // 星期日
  let milliArray = [];
  for (let i = 1; i < thead.children[0].children.length; i++) {
    let th = thead.children[0].children[i];
    let date = moment(this.initialDate).add(i - dayOfWeek, 'days');
    th.children[1].innerHTML = date.format('MM月DD日');
    th.setAttribute('data-date', date.format('YYYY-MM-DD'));
    milliArray.push(date.format('YYYY-MM-DD'));
  }
  let tbody = dom.find('tbody', ret);
  for (let i = 0; i < this.rowHeaders.length; i++) {
    let rowHeader = this.rowHeaders[i];
    let tr = dom.create('tr');
    for (let j = 0; j < 8; j++) {
      let td = dom.create('td');
      td.style.height = '100%';
      if (rowHeader.data) {
        dom.model(td, rowHeader.data);
      }
      let div = dom.element(`<div style="min-height: 72px;"></div>`);
      dom.model(div, rowHeader.data);
      if (j == 0) {
        td.style = 'text-align: center; vertical-align: center;';
        td.innerHTML = rowHeader.title;
      } else {
        td.setAttribute('data-date', milliArray[j - 1]);
        let buttonAdd = dom.element(`
          <div class="d-flex full-width height-32">
            <a class="btn-link m-auto plus" style="display: none;">
              <i class="fas fa-plus-circle"></i>
            </a>
          </div>
        `);
        if (this.editable) {
          div.appendChild(buttonAdd);
          dom.bind(buttonAdd, 'mouseover', ev => {
            let button = dom.ancestor(ev.target, 'div');
            dom.find('a.plus', button).style.display = '';
          });
          dom.bind(buttonAdd, 'mouseout', ev => {
            let button = dom.ancestor(ev.target, 'div');
            dom.find('a.plus', button).style.display = 'none';
          });
          dom.bind(buttonAdd.children[0], 'click', ev => {
            let button = dom.ancestor(ev.target, 'a');
            let tr = button.parentElement.parentElement.parentElement;
            let date = tr.getAttribute('data-date');
            let rowHeaderData = dom.model(td.parentElement.children[0]);
            this.onAddedToCell(td.children[0], date, rowHeaderData);
          });
        }
        let content = dom.element(`<div class="content"></div>`);
        if (this.editable) {
          div.insertBefore(content, buttonAdd);
        } else {
          div.appendChild(content);
        }
        td.appendChild(div);
        //
        for (let m = 0; m < this.datedData.length; m++) {
          let row = this.datedData[m];
          let rowHeaderData = dom.model(tr);
          if (this.isMatchedCell(milliArray[j - 1], rowHeader.data, row)) {
            this.onAddedToCell(content, milliArray[j - 1], rowHeader.data, row);
            break;
          }
        }
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  return ret;
};

WeeklyCalendar.prototype.reload = function (initialDate, datedData) {
  this.initialDate = initialDate;
  this.datedData = datedData;
  this.render(this.container);
};

WeeklyCalendar.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  let root = this.root();
  this.container.appendChild(root);
};

const JOINT_WIDTH = 6;
const JOINT_BORDER_WIDTH = 1.5;
const JOINT_COLOR = '#21ba45';

const NODE_START = {
  type: 'start',
  color: '#63c2de',
  radius: 45
};

/**
 *
 */
let WorkflowDesigner = function(opts) {
  this.raphael = Raphael(opts.svgContainerId);
  this.nodes = opts.nodes;
  this.mode = 'move';
  this.roles = [];
  this.nodes = [];
  this.connections = [];
  this.from = null;
  this.to = null;

  this.initialize();

  let self = this;
  let svg = document.querySelector('#' + opts.svgContainerId + ' svg');
  svg.addEventListener('click', function() {
    for (let i = 0; i < self.nodes.length; i++)
      self.nodes[i].deselect();
  });

  //
  let attrPath = {
    'stroke-width': '3px'
  };
  let path = this.raphael.path('M0,50 L' + svg.clientWidth + ',50');
  path.attr(attrPath);

  path = this.raphael.path('M240,0 L240,' + svg.clientHeight);
  path.attr(attrPath);

  path = this.raphael.path('M480,0 L480,' + svg.clientHeight);
  path.attr(attrPath);
};

WorkflowDesigner.prototype.initialize = function () {
  Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
      line = obj1;
      obj1 = line.from;
      obj2 = line.to;
    }
    let bb1 = obj1.getBBox();
    let bb2 = obj2.getBBox();
    let p = [
      {x: bb1.x + bb1.width / 2, y: bb1.y - 1},
      {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
      {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
      {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
      {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
      {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
      {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
      {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}
    ];
    let  d = {}, dis = [], res;
    for (let i = 0; i < 4; i++) {
      for (let j = 4; j < 8; j++) {
        let dx = Math.abs(p[i].x - p[j].x),
          dy = Math.abs(p[i].y - p[j].y);
        if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
          dis.push(dx + dy);
          d[dis[dis.length - 1]] = [i, j];
        }
      }
    }
    if (dis.length == 0) {
      res = [0, 4];
    } else {
      res = d[Math.min.apply(Math, dis)];
    }
    let x1 = p[res[0]].x,
      y1 = p[res[0]].y,
      x4 = p[res[1]].x,
      y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    let x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
      y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
      x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
      y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    let path = ['M', x1.toFixed(3), y1.toFixed(3), 'C', x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(',');
    if (line && line.line) {
      line.bg && line.bg.attr({path: path});
      line.line.attr({path: path});
    } else {
      let color = typeof line == 'string' ? line : '#000';
      return {
        bg: bg && bg.split && this.path(path).attr({stroke: bg.split('|')[0], fill: 'none', 'stroke-width': bg.split('|')[1] || 3}),
        line: this.path(path).attr({stroke: color, 'stroke-width': '2px', fill: 'none', 'arrow-end': 'classic-wide-long'}),
        from: obj1,
        to: obj2
      };
    }
  };
};

WorkflowDesigner.prototype.setMode = function (mode) {
  this.mode = mode;
};

/**
 *
 */
WorkflowDesigner.prototype.addNode = function (x, y, dataTransfer) {
  let node = null;
  if (dataTransfer.type == 'role') {

  } else if (dataTransfer.type == 'process') {
    node = new WorkflowDesigner.NodeProcess(this, x, y);
  } else if (dataTransfer.type == 'condition') {
    node = new WorkflowDesigner.NodeCondition(this, x, y);
  } else if (dataTransfer.type == 'finish') {
    node = new WorkflowDesigner.NodeFinish(this, x, y);
  }
  this.nodes.push(node);
};

/**
 * Removes the selected node in model and its shape in svg container.
 */
WorkflowDesigner.prototype.removeNode = function() {
  let id = this.selectedNode.id;
  for (let i = 0; i < this.nodes.length; i++) {
    let node = this.nodes[i];
    if (node.id == id) {
      node.remove();
      break;
    }
  }
};

/**
 * Selects a node and renders the UI effect.
 *
 * @param node
 *        the selected node
 */
WorkflowDesigner.prototype.selectNode = function(node) {
  for (let i = 0; i < this.nodes.length; i++) {
    this.nodes[i].deselect();
  }
  node.select();
};

/**
 * Locates a node in svg container according to the coordinate x and y.
 *
 * @param x
 *        the x coordinate
 *
 * @param y
 *        the y coordinate
 *
 * @returns {null|*}
 */
WorkflowDesigner.prototype.locateNode = function (x, y) {
  for (let i = 0; i < this.nodes.length; i++) {
    let obj = this.nodes[i];
    if (obj.type == 'process') {
      let sx = parseInt(obj.shape.attr('x'));
      let sy = parseInt(obj.shape.attr('y'));
      if (x >= sx && x <= (sx + NODE_PROCESS.width) &&
          y >= sy && y <= (sy + NODE_PROCESS.height)) {
        return obj;
      }
    } else if (obj.type == 'finish') {
      let sx = parseInt(obj.shape.attr('cx'));
      let sy = parseInt(obj.shape.attr('cy'));
      if (x >= (sx - NODE_FINISH.radius) && x <= (sx + this.radius) &&
        y >= (sy - NODE_FINISH.radius) && y <= (sy + this.radius)) {
        return obj;
      }
    } else if (obj.type == 'audit') {
      let sx = parseInt(obj.shape.attr('x'));
      let sy = parseInt(obj.shape.attr('y'));
      if (x >= sx && x <= (sx + this.width) &&
        y >= sy && y <= (sy + this.height)) {
        return obj;
      }
    }
  }
  return null;
};

/**
 * Finds a node in model according node id.
 *
 * @param id
 *        the node id
 *
 * @returns {null|*} found node or null.
 */
WorkflowDesigner.prototype.findNode = function(id) {
  for (let i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].id == id) {
      return this.nodes[i];
    }
  }
  return null;
};

WorkflowDesigner.prototype.showContextMenu = function(x, y) {
  let contextMenu = document.querySelector('.context-menu');
  if (contextMenu == null) return;
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.style.display = '';
};

WorkflowDesigner.prototype.makeJointPoint = function(shape, pos, x, y) {
  let self = this;
  let ret = this.raphael.rect(x, y, JOINT_WIDTH, JOINT_WIDTH, 0);
  ret.attr({
    'stroke': '#fff',
    'fill': '#fff',
    'cursor': 'crosshair'
  });
  ret.mouseover(function(event) {
    this.attr({
      'stroke': JOINT_COLOR,
      'fill': JOINT_COLOR,
    });
  });
  ret.mousedown(function(event) {
    self.from = this;
  });
  ret.mouseup(function(event) {
    self.to = this;
    if (self.from == null || self.from == self.to) return;

    let fromId = self.from.data('data-model-id');
    let toId = self.to.data('data-model-id');

    if (fromId != toId) {
      self.connections.push(self.raphael.connection(self.from, self.to, JOINT_COLOR));
      return;
    }

    for (let i = 0; i < self.connections.length; i++) {
      let conn = self.connections[i];
      if (toId == conn.from.data('data-model-id')) {
        self.connections.push(self.raphael.connection(self.to, conn.to, JOINT_COLOR));
        conn.line.remove();
        self.connections.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < self.connections.length; i++) {
      let conn = self.connections[i];
      if (toId == conn.to.data('data-model-id')) {
        self.connections.push(self.raphael.connection(conn.from, self.to, JOINT_COLOR));
        conn.line.remove();
        self.connections.splice(i, 1);
        break;
      }
    }

    self.from = null;
    self.to = null;
  });
  ret.data('data-model-id', shape.data('data-model-id'));
  ret.data('data-model-pos', pos);
  return ret;
};

WorkflowDesigner.Node = function(designer, x, y) {
  this.points = [];
};

/**
 * Selects {@code this} node.
 */
WorkflowDesigner.Node.prototype.select = function() {
  for (let i = 0; i < this.points.length; i++) {
    this.points[i].attr({
      stroke: JOINT_COLOR,
      fill: JOINT_COLOR
    });
  }
};

/**
 * Deselects {@code this} node.
 */
WorkflowDesigner.Node.prototype.deselect = function() {
  for (let i = 0; i < this.points.length; i++) {
    this.points[i].attr({
      stroke: '#fff',
      fill: '#fff'
    });
  }
};

/**
 * Binds all events for {@code this} node.
 */
WorkflowDesigner.Node.prototype.bind = function() {
  let self = this;
  this.shape.mouseup(function(event) {
    if (event.which == 3) {
      event.preventDefault();
      event.stopPropagation();
      self.designer.selectedNode = self;
      self.designer.showContextMenu(event.clientX, event.clientY);
    }
  });

  let mousedown = function (x, y, event) {
    if (event.which == 3) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.ox = this.type == 'rect' ? this.attr('x') : this.attr('cx');
    this.oy = this.type == 'rect' ? this.attr('y') : this.attr('cy');
    this.animate({'fill-opacity': .2}, 500);

    self.select();
  };

  let mousemove = function (dx, dy, x, y, event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.which == 3 || dom.find('.context-menu').style.display == '') {
      return;
    }

    let id = this.data('data-model-id');
    let node = self.designer.findNode(id);
    node.move(this.ox, this.oy, dx, dy);
  };

  let mouseup = function (event) {
    event.preventDefault();
    event.stopPropagation();
    this.animate({'fill-opacity': 0.75}, 500);
  };

  this.shape.drag(mousemove, mousedown, mouseup);
};

/**
 * Removes {@code this} node from SVG container.
 */
WorkflowDesigner.Node.prototype.remove = function() {
  // remove in model
  for (let i = 0; i < this.designer.nodes.length; i++) {
    let node = this.designer.nodes[i];
    if (node.id == this.id) {
      this.designer.nodes.splice(i, 1);
      break;
    }
  }
  // remove connections
  for (let i = 0; i < this.designer.connections.length; i++) {
    let conn = this.designer.connections[i];
    if (conn.from.data('data-model-id') == this.id || conn.to.data('data-model-id') == this.id) {
      this.designer.connections.splice(i, 1);
      i--;
      conn.line.remove();
    }
  }
  // remove shape
  this.shape.remove();
};

////////////////////////////////////////////////////////////////////////////////
//
// PROCESS NODE
//
////////////////////////////////////////////////////////////////////////////////

WorkflowDesigner.NodeProcess = function (designer, x, y) {
  this.designer = designer;
  this.type = 'process';
  this.color =  '#2185d0';
  this.width =  120;
  this.height =  90;

  this.title = '工单';
  this.id = 'process-' + new Date().getTime();

  // text
  let cx = x - this.width / 2;
  let cy = y - this.height / 2;

  this.shape = this.designer.raphael.rect(cx, cy, this.width, this.height, 10);
  this.shape.data('data-model-id', this.id);
  this.shape.attr({
    fill: this.color,
    stroke: this.color,
    'fill-opacity': 0.75,
    'stroke-width': 2,
    cursor: 'move'
  });


  this.text = this.designer.raphael.text(x, y, this.title).attr({
    fill: '#ffffff',
    'font-size': '18px'
  });

  this.points = [];

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'top',
    x - JOINT_WIDTH / 2,
    cy - JOINT_WIDTH - JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'right',
    cx + this.width + JOINT_BORDER_WIDTH, y - JOINT_WIDTH / 2));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'bottom',
    x - JOINT_WIDTH / 2,
    cy + this.height + JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'left',
    cx - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.bind();
};

// extend WorkflowDesigner.Node
WorkflowDesigner.NodeProcess.prototype = new WorkflowDesigner.Node();

WorkflowDesigner.NodeProcess.prototype.move = function (ox, oy, dx, dy) {
  let x = ox + dx;
  let y = oy + dy;
  // shape position
  this.shape.attr({
    x: x,
    y: y
  });
  let cx = x + this.width / 2;
  let cy = y + this.height / 2;
  // text position
  this.text.attr({
    x: cx,
    y: cy
  });
  // point positions
  this.points[0].attr({
    x: cx - JOINT_WIDTH / 2,
    y: y - JOINT_WIDTH - JOINT_BORDER_WIDTH
  });
  this.points[1].attr({
    x: x + this.width + JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });
  this.points[2].attr({
    x: cx - JOINT_WIDTH / 2,
    y: y + this.height + JOINT_BORDER_WIDTH
  });
  this.points[3].attr({
    x: x - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });

  // connections
  for (let i = this.designer.connections.length; i--;) {
    this.designer.raphael.connection(this.designer.connections[i]);
  }
};

////////////////////////////////////////////////////////////////////////////////
//
// CONDITION NODE
//
////////////////////////////////////////////////////////////////////////////////

WorkflowDesigner.NodeCondition = function (designer, x, y) {
  this.designer = designer;
  this.type = 'condition';
  this.color =  '#EF711C';
  this.width =  90;
  this.height =  90;

  this.title = '审核';
  this.id = 'condition-' + new Date().getTime();

  let cx = x - this.width / 2;
  let cy = y - this.height / 2;

  this.shape = this.designer.raphael.rect(cx, cy, this.width, this.height, 0);
  this.shape.data('data-model-id', this.id);
  this.shape.attr({
    fill: this.color,
    stroke: this.color,
    'fill-opacity': 0.75,
    'stroke-width': 2,
    transform: 'r-45',
    cursor: 'move'
  });

  // text
  this.text = this.designer.raphael.text(x, y, this.title).attr({
    fill: '#fff',
    'font-size': '18px'
  });

  this.points = [];

  let offset =  this.height / Math.sqrt(2);

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'top',
    x - JOINT_WIDTH / 2,
    y - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'right',
    x + offset + JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'bottom',
    x - JOINT_WIDTH / 2 ,
    y + offset + JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'left',
    x - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.bind();
};

WorkflowDesigner.NodeCondition.prototype = new WorkflowDesigner.Node();

WorkflowDesigner.NodeCondition.prototype.move = function (ox, oy, dx, dy) {
  let x = ox + dx;
  let y = oy + dy;
  // shape position
  this.shape.attr({
    x: x,
    y: y,
    transform: 'r-45'
  });
  let cx = x + this.width / 2;
  let cy = y + this.height / 2;
  // text position
  this.text.attr({
    x: cx,
    y: cy
  });
  // point positions
  let offset = this.height / Math.sqrt(2);
  this.points[0].attr({
    x: cx - JOINT_WIDTH / 2,
    y: cy - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH
  });
  this.points[1].attr({
    x: cx + offset + JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });
  this.points[2].attr({
    x: cx - JOINT_WIDTH / 2,
    y: cy + offset + JOINT_BORDER_WIDTH
  });
  this.points[3].attr({
    x: cx - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });

  // connections
  for (let i = this.designer.connections.length; i--;) {
    this.designer.raphael.connection(this.designer.connections[i]);
  }
};

////////////////////////////////////////////////////////////////////////////////
//
// FINISH NODE
//
////////////////////////////////////////////////////////////////////////////////

WorkflowDesigner.NodeFinish = function (designer, x, y) {
  this.designer = designer;
  this.type = 'finish';
  this.color =  '#f86c6b';
  this.width =  90;
  this.height =  90;
  this.radius = 45;

  this.title = '结束';
  this.id = 'finish-' + new Date().getTime();

  this.shape = this.designer.raphael.circle(x, y, this.radius);
  this.shape.data('data-model-id', this.id);
  this.shape.attr({
    fill: this.color,
    stroke: this.color,
    'fill-opacity': 0.75,
    'stroke-width': 2,
    cursor: 'move'
  });

  // text
  this.text = this.designer.raphael.text(x, y, this.title).attr({
    fill: '#fff',
    'font-size': '18px'
  });

  this.points = [];

  let offset =  this.radius;


  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'top',
    x - JOINT_WIDTH / 2,
    y - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'right',
    x + offset + JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'bottom',
    x - JOINT_WIDTH / 2 ,
    y + offset + JOINT_BORDER_WIDTH));

  this.points.push(this.designer.makeJointPoint(
    this.shape,
    'left',
    x - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y - JOINT_WIDTH / 2));

  this.bind();
};

WorkflowDesigner.NodeFinish.prototype = new WorkflowDesigner.Node();

WorkflowDesigner.NodeFinish.prototype.move = function (ox, oy, dx, dy) {
  let x = ox + dx;
  let y = oy + dy;
  // shape position
  this.shape.attr({
    cx: x,
    cy: y,
  });
  let cx = x;
  let cy = y;
  // text position
  this.text.attr({
    x: cx,
    y: cy
  });
  // point positions
  let offset = this.radius;

  this.points[0].attr({
    x: cx - JOINT_WIDTH / 2,
    y: cy - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH
  });
  this.points[1].attr({
    x: cx + offset + JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });
  this.points[2].attr({
    x: cx - JOINT_WIDTH / 2,
    y: cy + offset + JOINT_BORDER_WIDTH
  });
  this.points[3].attr({
    x: cx - offset - JOINT_WIDTH - JOINT_BORDER_WIDTH,
    y: cy - JOINT_WIDTH / 2
  });

  // connections
  for (let i = this.designer.connections.length; i--;) {
    this.designer.raphael.connection(this.designer.connections[i]);
  }
};



function Alarm(option) {
    this.iconId = option.iconId;
    this.mp3url = option.mp3url;
}

Alarm.prototype.start = function () {
    this.audio = document.createElement('audio');
    this.audio.setAttribute('autoplay', 'autoplay');
    this.audio.setAttribute('loop', 'loop');
    var source = document.createElement('source');
    source.setAttribute('src', this.mp3url);
    source.setAttribute('type', 'audio/mpeg');
    this.audio.appendChild(source);
    document.body.appendChild(this.audio);

    var icon = document.getElementById(this.iconId);
    icon.classList.add('icon-bell', 'bell');
};

Alarm.prototype.stop = function () {
    this.audio.pause();
    var icon = document.getElementById(this.iconId);
    icon.classList.remove('bell');
    document.body.removeChild(this.audio);
};

function Avatar(opt) {
  let self = this;
  this.shape = opt.shape || 'circle';
  this.size = opt.size || 128;
  this.readonly = opt.readonly || false;
  this.name = opt.name;

  this.root = dom.element(`
    <div class="row mb-3" style="justify-content: center; background: #7aa6da; margin-right: -20px; margin-left: -20px;">
      <div class="avatar avatar-128">
        <img src="">
        <input name="${opt.name}" type="hidden">
        <input name="_${opt.name}_avatar" type="file" style="display: none"
               accept="image/*">
      </div>
    </div>
  `);

  this.image = dom.find('img', this.root);
  this.input = dom.find('input[type=hidden]', this.root);
  this.fileinput = dom.find('input[type=file]', this.root);
  if (!this.readonly) {
    this.image.style.cursor = 'pointer';
    dom.bind(this.image, 'mouseover', function () {
      this.src = Avatar.AVATAR_ADD;
    });
    dom.bind(this.image, 'mouseout', function () {
      this.src = self.input.value;
    });
    dom.bind(this.image, 'click', function() {
      self.fileinput.click();
    })
    dom.bind(this.fileinput, 'change', function(ev) {
      if (!('files' in this)) return;
      if (this.files.length == 0) return;
      let reader = new FileReader();

      reader.addEventListener("loadend", function () {
        // convert image file to base64 string
        self.image.src = reader.result;
        self.input.value = reader.result;
      }, false);

      if (this.files[0]) {
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
}

Avatar.AVATAR_DEFAULT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAD0QAAA9EBmIqJtAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAA8eSURBVHic7Z1bbBzXecd/M3vjLneXI62llWk6ou1GtGTdfJGbILRTqw0MBHkwggSNC9h9aAvE7UOaokjduIFtuE7coGiah9YPbQq0BloXMQI/GAaMNHJTMYgaybZs0ZKl1BYv4mXFHXLFvXB39jJ9mFmKokjubWbOWWl/gCBQ4s73zXz//c6Zc/mOYpomNxoZPRUH9gAj9p+7AA2IA7F1fwMsA9l1f2eAj4Hz9p8LWiK57N1deIPS7QLI6Kl+YBQ4CjyIFfBbXTI3hyWGXwHHgDEtkcy7ZMsTuk4AGT0V5GrAHwGOAAFB7pSBk1hieBtLEIYgX9qiawSQ0VOfAZ4AvgZsF+zOZiwCrwKvaInkCdHONIPUAsjoqd1YQX8Cq03vJi4Ar2CJYVK0M5shpQAyeuoB4NvAY4Ai2J1OMYHXge9qieQp0c6sRyoBZPTUQ8AzwKOifXGJt4AXtUTyuGhH6kghgIye+m3gWeAh0b54xHHgeS2R/JloR4QKIKOnhoAfAF8R5oRYXgO+qSWSl0Q5IEQAGT3lB74BPAdEPXdALnJYz+GHWiJZ8dq45wLI6KlR4GVgv6eG5WcceEpLJMe8NOqZADJ6yge8ADxN9/fs3cIEXgK+oyWSVS8MeiIAu63/D6wRvB6NGQMe96JvoLptIKOnvgicphf8VhgFTtvPzlVcywAZPaUA3wO+RS/lt4sJfB/4Sy2RdCVQrgjAnrD5V6xx+x6d8yrw+25MNDkugIyeigI/Ab7g6IV7/BT4spZI5py8qKMCyOipHcCbwAOOXbTHWk4BX9QSyQWnLuiYADJ66lNYKu22Wbtu4wLwBS2RnHLiYo4IwP7mj9Flwa9WrVdtn88n2JOWuQCMOpEJOhaA3ea/jcRpv1AokMtlMQyDSqVCpVKmUqlQv3dFUfD7/fj9Afx+P8FgkGg0RiQSEez5lpwCHum0T9CRAOze/htI1uEzzRq5XJ5cbplsNrv6TW8Vn89HLBYjGo0TjfajKK4Pm7TKT4EvdfJ20LYA7Pf8f0eiVz3TNMlklkinF6hUnJ1X8fv93HLLDjRtG4oi1bDGq8DvtTtO4O/A8PeQKPjLy1dYWLiMYbizJrNSqTA/P8fios6OHTuJxwdcsdMGXwMmseZYWqatDGAPUb6BBCN85bLBzMwlVlZWPLUbDoe57bYhAoGgp3Y3wcRqCt5s9YMtC8Ce2DkNJFo15jSFQoFLl6babuM7xefzMTT0KVk6izpwuNUJpJYEYE/p/jcSTOxkMkvMz88hekmboijs2nUrmrZNqB82Y8BvtTKV3Gq39gUkCP7lyynm5maFBx+sjufc3CyXL6dEuwJWbF5o5QNNZwB7Jc//ILjdX1zUSaXmRbqwKcnkLrZvF94ymsDDza4saioD2Gv4XkZw8HO5nLTBB0il5snlHJ2raQcFeNmOWUOabQK+geA1fKVSiZmZaZEuNMXMzDSlUkm0G/uxYtaQhk2A3es/h8DVu7VajU8++ZhyuTv2XQYCQe688y5UVejIYQ7Y2+itoBkPf4DgpduLi3rXBB+ssYnFRV20G1Gs2G3JlgKwd+wI3bRRqVTQ9bRIF9pC19OOD0e3wVfsGG5KowzwrIPOtEU6vUCtVhPtRsvUajXSacfWbXTCljHcVAD2Rk2he/UMwyCTWRLpQkdkMkuuzU20wEN2LDdkqwzwjAvOtMTS0qIUgz3tYpomS0uLot2ALWK5oQDs/fnCt2jnclnRLnSMJPfwqB3T69gsA3zbRWeaolQqyZA+O8YwDBnGBWCTmF4nALssy2Ouu9MASb45jiDJvTxmx/YaNsoATyDBPH82e+OU5JPkXhSs2F7DZgIQTrFYFO2CY0h0L1sLwC7FJnxp99oVuzcCpmnKMCgEsMeO8SrrM4AU335JHpajSHRPT679YVUA9hJvKRZ5SvSwHEOie/pdO9bAtRlgFEkqcFYqZdEuOI5E97SdNau61grgqPe+bEw3jv03QrJ7Wo31WgE8IsCRDQkERNV+dg/J7mk11iqsllw/IsyddUiy1t5RJLunI3bMVzPAKOJKrl+HZN8WR5DsngLY/YC6AKRp/8HacCF4OZWjqKoq4xb0o3BVAA8KdGRDgkGpUmZHSHovD8JVAYwIdGRDJEuZHSHpvYwAqPYBS26dsdM2kciNU0JY0nu5NaOn4ioSjP1vxMDAgGz78NtCURQGBqTZSr6ePSoSpn+wOoIS7cFvm3h8QMYOYJ0RaQUAoGmaaBc6RvJ7GFGxDlWUkkikX9YedFMEg0EikX7RbmzFXSrWiZrSIsm++7boAt81lavHp0rJtm3buzILBINBtm2TYnJ1K+Iq1hm60qKqKoODQ131RqAoCoODQ90wmhmTPgOAVZBpx46dot1omh07dhIOh0W70QzyZ4A6icQtsneoAKvjmkjcItqNZumODFBncPA2md+p8fl8DA7eJtqNVohL30itJRAIMDR0O6oqnwhU1cfQ0O2yjvtvigpIsWuhWSKRfoaH75DqQQcCAYaH7+iKJmodyyogxb6lVgiFQgwP3ylFRyscDjM8fCehUEi0K+2Q7boMUMfv97N79zCxmLguTCwWZ/fuYfz+TkouC6U7M0AdRVHQtG1COoY+n0/GyuGtkvXThRmgVCpx5UqGK1cywjZcVKtVpqcn8fv9DAxoDAxo3dgMLPuBjGgvmqFWq60G3evK4FtRL2Kl62nC4fCqGLpgFBAg4wc+Fu3FVrh5CITTrKyssLKyQjq9IOvhEuv52A+cF+3FZrh9CIRbSHy4xHrOSymAfD7P5cvzMu2rbwvDsA6z0PU0O3fuor9funGC88pSej4OXBHtCViHPaVSKVkqaznOtm3bSSaTMh0+NaCYpklGT80ieGVwsVhkdvaSLAWVXCMUCjE4OERfX59oV+a0RHKwLkWhzcDios7ExCc3fPDBeoWdmPhEhlrC5+HqxpBfifCgWq0yNTVBKjV/Q5WEaYRpmqRS80xNTQg77wg75nUBHPPaerlcZnLyIvl83mvT0pDP55mcvEi5LKR4xDG4KoAxwDMvDKPE5OTFmyLlN6JUsp6FYXj6LMpYMbcEoCWSeeCkF5aLxRUmJoSpXkrK5TITExcpFj0b4Txpx/yaCiFvu23VSnlC2z1pqVarTE5OeNUkrsZ6rQBc7QcUiytMT0/JVitHKmq1GtPTU15kgtVYrxXAGODKCEylUmZ6egrT7AW/EaZpicDFqmKL2O0/rBGAfQT5q05bq6ta9okcmahUKm5my/9ce9z8+jHJV5y2Njs70/Vj+iKwRkZn3Lj0v6394RoBaInkCeCCU5YWFi7LUim7K8lml1lYuOzkJS/YMV5lo1kJR7JAPp+X5dCkriadXnDyzeC62G4mgI7GZU2zxvz8bCeX6LGG+flZJzrQJs0IQEskJ4HXO7G0sLDQdYs4ZMYwDBYWOs6mr9uxvYbNJqa/266VYrGIrguf6brh0HW90870hjHdUABaInkKeKtVC6ZpMjc3Q4ctSI8NsZ5tm7Omb9kxvY6tlqa82KqVpaXF3iufixSLxXZXS20ay00FoCWSx4HjzVowTbMrz/jtNnQ93WoWOG7HckMaLU57vlkrmcxSb7TPAyqVSqvH6W4Zwy0FoCWSPwNea2zD7HX8PMR61k1lgdfsGG5KM8tTvwnktvqF5eVlyuXea59XlMsGy8sNR1hzWLHbkoYC0BLJS8BzW/1OOt1r+72miWf+nB27LWl2gfoPgfGN/iOfz1Eq9Xr+XlMqFcnnN03M41gxa0hTAtASyQrwFBs0PE2koh4uscmzN4Gn7Jg1pOktKloiOQa8tP7fJTkY+aZkk2f/kh2rpmh1j9J3WLOapFAo9F79BFKpVCgUCmv/aQwrRk3TkgC0RLIKPA7oIM2p2Dc1a2KgA4/bMWqalncp2j3LJwEzm+2lf9HYMTCBJ5vp9a+nrW2qWiL5Zj6f/1Hv3V885bJBPp/7Fy2RfLOdz7e9TzmTWfx6JBKZbvfzPZwhHA7PpNPpr7f7eaWTTZkffXg6XigUJkulotRnDtyohEKh5b6+8O59B+5ru85TR5UK7r7n8HJfX9+hQCDYGwnymEAgWAyFQoc7CT50KACAfQfum4rFYkcCgUBvs59HBAKBciwWO3LPwQcudnotR2qVjOw7NB6PDzzs9/dE4DZ+f6Acjw88PLLv0IZD863iWLGaPXsPnohGo0d6zYF7BALBYjQaPbJn78ETjX+7OTrqBG7E2TPv7F5ZKX5gGKWuOYegGwgGQ8vhcN/BfQfuv25lbyc4LgCAs2fe1cpl44NCoXC74xe/CYlEItOBQPBgpx2+jXBFAAC//uiMWiqVfpHNLn/GFQM3CbFY/EQoFPrcp+8+4MpOUdcEUOfDD975fi6X/fNarSZ1zVTZUFXVjEZjf3vPwfu/5aYd1wUAcG783c8XCitvGEZJymO0ZSMYDOUikfCX9u6/7+du2/JEAADj758Km6b5di6X/U1PDHYp0WjsfxVFeWT/oQc8KRjkmQDqnD97+k+y2ezflcvl7jsO1EUCgYARi8X+bGTf4X/w0q7nAgA4c/pkDPhJPp/7nZupQORGKIpCf3/0v4AvHzh8xPP5dSECqHNu/L3RUqn445WVlV3CnBBIOByeD4X6vrp3/71NL+FyGqECqPPRh+/9RaFQeKZUKnXFKaadEgqFspFI5MW777n3b0T7IoUA6pw9887TxWLx6VKpJO0JC50QCoWu9PX1vbTvwP3XLa4VhVQCqHNu/L0/MozS84VCQWgJe6eIRCJzwWDo2b377/0n0b6sR0oB1Dl/9v3Rctn460Jh5XPVaqWrDufz+fyVSCT8i0Ag+Fcj+w4Ja+MbIbUA6vxy7JgvHh/402q18ofFYnGkWq1KOaro8/nMvr6+8z6f/5+Xl6/8/WdHj0pfE7crBLCWi//3UaRUKv5xuWx81TCM/YZhRET6EwwGC8FgcDwQCP44FOr7xzt+4+5C40/JQ9cJYD3j758cVlXfH9Rq1UfL5fKnDcMYcGveQVVVMxgMXgkEAr9WVd9btVr1R/sPHZlww5ZXdL0A1vPLsWNKf390v8/n+zxwX61W21ur1QZrtWp/rVbrq1ZrQdM0faZpKqZpCUVRVFNRFFNRlKrPpxqqqhZV1ZdXVXVWVdVzwLvVavXn+Xxu/LOjR2+oB/b/eq8o0Kr0ir4AAAAASUVORK5CYII=';
Avatar.AVATAR_ADD = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAYyAAAGMgEp+q37AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAUFQTFRF////PbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOePbOeErRUVwAAAGp0Uk5TAAEDBAUGCgsMDQ4UFRYXGBkaGxwdHh8hIicpKy8zNDg8PUBCQ0dKUFNYW15mc3R2fIKDhIWGiImRlZacnp+jpKWmp6utrrCxtbi6vr/Cw8XL0NHT1tfZ3uTm6err7O3w8fP19vj5+vv8/uvAq4AAAAShSURBVHjaxVvZWloxEB6wVFHqRgXbCuKKoCzWldJFsVaxCKIiImq1rpz3f4BeaP1mcgLmrDN34Usyw0ky888GYIZ6o8nFjd1ytX5+d3der5Z3NxaT0V5whbpn1koNTUqN0tpMt6PMfVNLlXutI91XPk/5HGI/nrvUlOgyN24/91D2RDNAJ9mQreyj2y3NILW2o7axnyhqpqg4YQv76X3NNO1PW2Yf3NIs0VbQEvuu1LVmka5TXeb5x440G+goZpK9d6Wl2UKtFa+p0y932LNZzmfisbFwn8/XFx6LxTP5crPD9LKJmzB70W6349xcQLYiMJc7brfmYtYge8+q/PM/FucHOq0bmC8+yo9h1WPI6hSkuxymB19fO5g+lC4uGLBRPXuyHSrKtzlWka3f61FdHziQLK/FjXzCeE2yxUFAbfGIxO41Fgy+JO+CBLWcjCj9fz3/q+xb48/obfZKL4HCN+jRff+H9YA5TRZYf9Cdwqv3wKe7fxeT5nX5pE6Z7L3yFjy693c0asWajeqsSaGzPlgV5+/4rZlz/46442pH/Svqv2UPWCTPsqgTO2jloHBkNwk7IFXiRrhUbS2TV7B/pxF7MGXkVLCN7XTKisB/2C5UOyxIsNJGg9MLcBMB2yhCT6EltSpdwotJgI2UEN62DCemhPtvr2clvIWU5AVQ/LvjsVcAD9UH1/qXQPH/kR9sJj894S2d/0Of6ijYTqNUyYg+E/G/HibBAZoktnFf8D+JdOvOBBjWCRPquRL/90rJ/gcLL5insTmkhA8IQikS/5/IllXZ7T0JlzSVJMgSNjh+sE3wnxL+EoDDphJKIzhxG8VfiBJeUDpQAXM2lBYtEIUckn+amhr+FXGGGlauyY+a4GBF/G9KAIgTjPwSfyP+DzgpABCf6X80L4d/jDkrQAyv+fKMxPGDOgRnBQDsuV4+YfQpvE/aaQHSeNEUAAAsYf9/0GkBBnH8YEl3L4rgtABE61cAALpx/HveeQHmcWy9GwBm8DYDzgswgFfNAMAajj+B8wIAjmStAUAJjXNuCIDVTkmwKnNuCDBHbVgv3iXghgABvKyXYJEmuCEANAkqSWKv0R0BsA+chEU0yivgP1U6+9kW2ufRtEXYQKOMEv5TzhR8bLNdBk3agF0FLFIwF6b/rYBKdsmBxNTwnyrdvnkdE5ShikZjihdOldoo9jE0pQp1NAq7I0AYTanDORr1uSNAH5pyDndo5HNHAB+acscvAPsRsF9C9mfIrogcVMUlJVWsYoxCf8zw//tJyRgpmeOQcXPc/PVBzRyzAxJ2SMYOStlhOb9jwu6asTun7O45e4CCP0TDHqRiD9OxByr5Q7XswWr+cL2ZhIWQjz61lLAwk7L5QQX4billYyZpNXRGhO63lrQyk7br/1a/fab613cW03b8iUv21C1/8po9fc9fwMBewsFfxMJexsNfyMRfysVezMZfzsdf0Mhf0sle1Mpf1stf2Mxf2s1f3M5f3s/f4MDf4gHsTS7A3+bD3+gE7K1ewN/sBuztfgDsDY8A7C2fAOxNrwDsbb9P0TzWxucnG8Xb+v1ErM3vL2Rj+/8/ZgWIpKC1NRQAAAAASUVORK5CYII=';

Avatar.prototype.render = function(containerId, selection) {
  if (!selection) {
    selection = Avatar.AVATAR_DEFAULT;
  }
  this.image.src = selection;
  this.input.value = selection;
  let container = dom.find(containerId);
  container.innerHTML = '';
  container.appendChild(this.root);
};
function BMI(opts) {
	this.upperWeight = opts.upperWeight || 20;
	this.upperWeek = opts.upperWeek || 40;

	this.horizontalLines = [];
	this.verticalLines = [];

	this.dpr = opts.dpr;
	this.height = opts.height;
	this.width = opts.width;
}

BMI._185_UPPER = [0.1, 0.3, 0.9, 1.1, 1.4, 1.6, 1.9, 2.1, 2.2, 2.8, 3.1, 3.2, 4, 4.4, 5, 5.6, 6, 6.4, 7, 7.4, 8, 8.6, 9, 9.4, 10, 10.6, 11, 11.3, 12, 12.7, 13.2, 13.5, 14.3, 14.9, 15.2, 15.7, 16.4, 16.8, 17.2, 18];
BMI._185_LOWER = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.7, 2, 2.3, 3, 3.2, 3.5, 4.1, 4.6, 5, 5.3, 5.7, 6.1, 6.5, 6.9, 7.2, 7.8, 8.4, 8.6, 9, 9.6, 10, 10.4, 10.8, 11.2, 11.6, 11.9, 12.5];

BMI.prototype.render = function (canvas, params) {
	this.context = canvas.getContext('2d');
	if (!this.dpr) {
		this.dpr = window.devicePixelRatio || 1;
		this.height = canvas.clientHeight;
		this.width = canvas.clientWidth;
		let rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * this.dpr;
		canvas.height = rect.height * this.dpr;
		this.context.scale(this.dpr, this.dpr);
	} else {
		canvas.width = this.width * this.dpr;
		canvas.height = this.height * this.dpr;
		this.context.scale(this.dpr, this.dpr);
	}

	// this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
	// 画网格线
	this.drawGrids(this.context);
	// this.drawLowerLimit(this.context);
	// this.drawUpperLimit(this.context);
	this.drawLine(this.context, BMI._185_LOWER);
	this.drawLine(this.context, BMI._185_UPPER);

	//绘制需要实际展示的线段
	if (Array.isArray(params) && params.length > 0) {//多条线
		params.forEach((item, index) => {
			this.drawLine(this.context, item.data, (item.color ? item.color : color));
		})
	} else if (!Array.isArray(params) && params.data && params.data.length > 0) {//单条线
		const linedata = params.data || [];
		const linecolor = params.color || '#333';
		this.drawLine(this.context, linedata, linecolor);
	}
};

BMI.prototype.drawGrids = function (ctx) {
	let marginLeft = 80;
	let marginRight = 20;
	let marginBottom = 80;
	let marginTop = 10;

	this.chartWidth = this.width - marginLeft - marginRight;
	this.chartHeight = this.height - marginTop - marginBottom;

	this.startX = marginLeft;
	this.startY = this.height - marginBottom;
	let endX = this.width - marginRight;
	let endY = marginTop;

	ctx.beginPath();
	ctx.lineWidth = 1;

	// X轴
	ctx.moveTo(this.startX - 10, this.startY);
	ctx.lineTo(endX, this.startY);
	ctx.stroke();

	// Y轴
	ctx.moveTo(this.startX, this.startY + 10);
	ctx.lineTo(this.startX, endY);
	ctx.stroke();
	ctx.closePath();

	let xLineCount = 10;
	let yLineCount = 40;

	let xSpace = this.chartHeight / xLineCount;
	let ySpace = this.chartWidth / yLineCount;

	// 画横线
	ctx.beginPath();
	ctx.font = '14px serif';
	ctx.lineWidth = 0.2;
	for (let i = 0; i < xLineCount; i++) {
		ctx.moveTo(this.startX - 10, this.startY - xSpace * (i + 1));
		ctx.lineTo(endX, this.startY - xSpace * (i + 1));
		ctx.fillText(i * 2 + '', this.startX - 30, this.startY - xSpace * i + 4);
		this.horizontalLines.push(this.startY - xSpace * (i + 1));
	}
	ctx.fillText('20', this.startX - 30, this.startY - xSpace * xLineCount + 4);
	this.drawVtext(ctx, '体重增长', '（kg）', 15, this.startY - xSpace * xLineCount + 4, 0, '#000', 6);

	// 画竖线
	for (let i = 0; i < yLineCount; i++) {
		ctx.moveTo(this.startX + ySpace * (i + 1), this.startY + 10);
		ctx.lineTo(this.startX + ySpace * (i + 1), endY);
		if ((i + 1) % 3 == 1) {
			ctx.fillText((i + 1) + '', this.startX + ySpace * (i + 1) - ySpace, this.startY + 25);
		}
		this.verticalLines.push(this.startX + ySpace * (i + 1));
	}
	ctx.fillText('孕期（周）', (this.width / 2) - 16, this.startY + 50);
	ctx.stroke();
	ctx.closePath();
};
//左边标题
BMI.prototype.drawVtext = function (ctx, text, unit, tx, ty, ux, color, ls) {
	let x = tx, y = ty; // 文字开始的坐标
	let letterSpacing = ls || 10; // 设置字间距
	for (let i = 0; i < text.length; i++) {
		const str = text.slice(i, i + 1).toString();
		if (str.match(/[A-Za-z0-9]/) && (y < 576)) { // 非汉字 旋转
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(Math.PI / 180 * 90);
			ctx.textBaseline = 'bottom';
			ctx.fillText(str, 0, 0);
			ctx.restore();
			y += ctx.measureText(str).width + letterSpacing; // 计算文字宽度
		} else if (str.match(/[\u4E00-\u9FA5]/) && (y < 576)) {
			ctx.save();
			ctx.textBaseline = 'top';
			ctx.fillText(str, x, y);
			ctx.restore();
			y += ctx.measureText(str).width + letterSpacing; // 计算文字宽度
		}
	}
	ctx.fillText(unit, ux, y + 10);
}

BMI.prototype.drawLine = function (ctx, data, color = '#ffc0cb', lineWidth = 2) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.setLineDash([10, 5]);
	let prevPoint = null;
	let ySpace = this.chartWidth / 40;
	for (let i = 0; i < data.length; i++) {
		let val = data[i], xval = -1, yval = -1;
		let x = 0, y = 0;
		if (typeof (val) == 'object') {
			xval = data[i].x;
			yval = data[i].y;
			x = this.startX + ySpace * xval;
		} else {
			yval = data[i];
			x = this.verticalLines[i];
		}
		y = this.startY - (yval * this.chartHeight / 20);
		if (prevPoint = null) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
			ctx.stroke();
		}
		prevPoint = this.verticalLines[i];
	}
	ctx.closePath();
};

if (typeof module !== 'undefined') {
	module.exports = BMI;
}

function Building(opt) {

}

Building.DROPLET = dom.element(`
  <symbol id="icon-droplet" viewBox="0 0 32 32">
    <title>droplet</title>
    <path class="path1" d="M27.020 14.786c-2.055-5.732-6.41-10.88-11.020-14.786-4.61 3.907-8.965 9.054-11.020 14.786-1.271 3.545-1.396 7.393 0.393 10.794 2.058 3.911 6.207 6.42 10.626 6.42s8.569-2.509 10.626-6.42c1.79-3.401 1.664-7.249 0.393-10.794zM23.086 23.717c-1.369 2.602-4.15 4.283-7.086 4.283-1.723 0-3.391-0.579-4.753-1.583 0.414 0.054 0.832 0.083 1.254 0.083 3.67 0 7.146-2.1 8.856-5.351 1.402-2.665 1.281-5.433 0.746-7.636 0.455 0.88 0.841 1.756 1.151 2.623 0.706 1.971 1.251 4.886-0.168 7.581z"></path>
  </symbol>
`);

Building.prototype.render = function(containerId) {
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }

};
function ChartWrapper(opts) {
  let self = this;
  this.url = opts.url;
  this.params = opts.params || {};
  this.options = opts;
  this.chartType = opts.chartType;
  this.interval = opts.interval || 0;
  this.scheduleName = opts.scheduleName;
  this.refresh = opts.refresh;
  this.formatX = opts.formatX;
  this.convertRow = opts.convert || function(data) {
    return data;
  };
  this.click = opts.click;
}

/**
 * Converts customized options to echarts options.
 *
 * @returns echarts options
 */
ChartWrapper.prototype.convert = function() {
  let color = [];
  let data = this.options.data || [];
  let category = this.options.category;
  let values = this.options.values;

  // group field means chart legend
  let dataLegend = [];
  let hashLegend = {};

  let hashCategory = {};

  // 填充category数据
  for (let i = 0; i < data.length; i++) {
    let row = data[i];

    // 这一行所属的类别
    let valueCategory = row[category.name];
    let textCategory = valueCategory;

    // 如果是图例，则要收集图例的数据
    if (category.values && category.values[valueCategory]) {
      textCategory = category.values[valueCategory].text;
      textCategory = (typeof textCategory === 'undefined') ? valueCategory : textCategory;
    }
    if (typeof hashCategory[textCategory] === 'undefined') {
      // 注意此处的数据结构
      hashCategory[textCategory] = {name: textCategory, values: []};
    }

    // 收集category的数据
    for (let j = 0; j < values.length; j++) {
      let valueValue = row[values[j].name];
      if (typeof hashCategory[textCategory].values[j] === 'undefined')
        hashCategory[textCategory].values[j] = {};
      if (values[j].operator === 'sum') {
        if (typeof hashCategory[textCategory].values[j]['sum'] === 'undefined')
          hashCategory[textCategory].values[j]['sum'] = [];
        hashCategory[textCategory].values[j]['sum'].push(valueValue);
      } else {
        // operator为某个字段名，意味着以operator字段作为legend分别计算
        let valueOperator = row[values[j].operator];
        // 编码转文本
        if (values[j].values && values[j].values[valueOperator]) {
          valueOperator = values[j].values[valueOperator].text;
        }
        if (typeof hashCategory[textCategory].values[j][valueOperator] === 'undefined')
          hashCategory[textCategory].values[j][valueOperator] = [];
        hashCategory[textCategory].values[j][valueOperator].push(valueValue);
        // 注意此处，从value的operator指定的字段中获取subcategory的值
        hashLegend[valueOperator] = valueOperator;
      }
    }
  }

  if (category.legend) {
    // 图例的数据来源来自于分类的数据
    for (let textCategory in hashCategory) {
      dataLegend.push(textCategory);
      for (let i = 0; i < values.length; i++) {
        if (values[i].operator === 'sum') {
          let sum = hashCategory[textCategory].values[i]['sum'].reduce(function (a, b) {
            return a + b;
          }, 0);
          hashCategory[textCategory].values[i]['sum'] = sum;
        }
      }
    }
  } else {
    // 图例的数据来源于值的定义
    for (let i = 0; i < values.length; i++) {
      if (values[i].operator === 'sum') {
        dataLegend.push(values[i].text);
      } else {
        if (i == 0) {
          // 动态的图例数据，来源于值域中的operator值，相当于把subcategory作为图例
          for (let key in hashLegend)
            dataLegend.push(key);
        }
      }
      for (let textCategory in hashCategory) {
        if (values[i].operator === 'sum') {
          // 需要求和
          let sum = hashCategory[textCategory].values[i]['sum'].reduce(function (a, b) {
            return a + b;
          }, 0);
          // 把数组转换为数字
          hashCategory[textCategory].values[i]['sum'] = sum;
        } else {
          for (let key in hashCategory[textCategory].values[i]) {
            // 把数组转换为数字
            hashCategory[textCategory].values[i][key] = hashCategory[textCategory].values[i][key][0];
          }
        }
      }
    }
  } // if (category.legend)

  // compatible echarts option
  let ret = {
    legend: {
      data: dataLegend
    },
    categories: hashCategory
  };
  if (this.options.tooltip) {
    ret.tooltip = {
      formatter: this.options.tooltip
    }
  }
  if (color.length > 0) ret.color = color;
  return ret;
};

/**
 * Converts the data to echarts series data.
 *
 * @param data
 *        the raw data
 */
ChartWrapper.prototype.process = function(data) {

};

ChartWrapper.prototype.paint = function() {
  let self = this;
  if (this.chartType == 'pie') {
    this.pie();
  } else if (this.chartType == 'bar') {
    this.bar();
  } else if (this.chartType == 'line') {
    this.line();
  } else if (this.chartType == 'stack') {
    this.stack();
  } else if (this.chartType == 'scatter') {
    this.scatter();
  } else if (this.chartType == 'orgchart') {
    // this.orgchart();
    $(this.container).orgchart({
      data : this.options.data[0],
      nodeContent: this.options.fieldContent,
      nodeTitle: this.options.fieldTitle,
      pan: true,
      // zoom: true
    });
    return;
  }

  // text color
  if (this.options.textColor) {
    this.echartOptions.textStyle = {
      color: this.options.textColor
    };
    this.echartOptions.legend.textStyle = {
      color: this.options.textColor
    };
  }

  // title
  if (this.options.title) {
    this.echartOptions.title = {
      text: this.options.title,
      left: 'center',
      textStyle: {
        color: this.options.textColor
      }
    };
  }

  this.echart = echarts.init(this.container);
  this.echart.setOption(this.echartOptions);

  // 事件绑定
  if (this.click) {
    this.echart.on('click', 'series.scatter', function(event) {
      event.event.stop();
      self.click(event);
    });
  }
};

/**
 * Gets echarts options for PIE.
 */
ChartWrapper.prototype.pie = function() {
  this.container.setAttribute('_echarts_instance_', '');

  this.echartOptions = this.convert();
  this.echartOptions.tooltip = this.echartOptions.tooltip || {};

  // series
  let seriesData = [];
  for (let category in this.echartOptions.categories) {
    seriesData.push({
      name: this.echartOptions.categories[category].name,
      value: this.echartOptions.categories[category].values[0][this.options.values[0].operator]
    });
  }

  // series color
  for (let i = 0; i < seriesData.length; i++) {
    for (let key in this.options.category.values) {
      if (seriesData[i].name == this.options.category.values[key].text) {
        seriesData[i].color = this.options.category.values[key].color;
        break;
      }
    }
  }
  this.echartOptions.series = [{
    type: 'pie',
    data: seriesData
  }];
  this.echartOptions.legend.show = false;
};

/**
 * Gets echarts options for BAR.
 */
ChartWrapper.prototype.bar = function() {
  this.container.setAttribute('_echarts_instance_', '');
  this.echartOptions = this.convert();

  let series = [];
  let xAxis = {type: 'category', data: []};
  for (let i = 0; i < this.options.values.length; i++) {
    let seriesItem = {
      name: this.options.values[i].text,
      type: 'bar',
      data: []
    };
    if (this.options.values[i].color) {
      seriesItem.itemStyle = {color: this.options.values[i].color};
    }
    // 填充数值
    for (let textCategory in this.echartOptions.categories) {
      if (i == 0) xAxis.data.push(textCategory);
      let values = this.echartOptions.categories[textCategory].values;
      seriesItem.data.push(values[i][this.options.values[i].operator]);
    }
    series.push(seriesItem);
  }

  this.echartOptions.tooltip = this.echartOptions.tooltip || {};
  this.echartOptions.xAxis = xAxis;
  this.echartOptions.series = series;
  this.echartOptions.yAxis = {};
};

/**
 * Gets echarts options for LINE.
 */
ChartWrapper.prototype.line = function() {
  this.container.setAttribute('_echarts_instance_', '');
  this.echartOptions = this.convert();
  let series = [];
  let xAxis = {type: 'category', data: []};
  for (let i = 0; i < this.options.values.length; i++) {
    let seriesItem = {
      name: this.options.values[i].text,
      type: this.options.values[i].type || 'line',
      data: [],
    };
    if (this.options.values[i].color) {
      seriesItem.itemStyle = {color: this.options.values[i].color};
    }
    for (let textCategory in this.echartOptions.categories) {
      if (i == 0) xAxis.data.push(textCategory);
      let values = this.echartOptions.categories[textCategory].values;
      if (seriesItem.type === 'scatter') {
        seriesItem.symbolSize = 6;
        if (values[i][this.options.values[i].operator] > 0) {
          seriesItem.data.push([textCategory, values[i][this.options.values[i].operator]]);
        }
      } else {
        seriesItem.data.push(values[i][this.options.values[i].operator]);
      }
    }
    series.push(seriesItem);
  }
  this.echartOptions.tooltip = this.echartOptions.tooltip || {};
  this.echartOptions.xAxis = xAxis;
  this.echartOptions.series = series;
  this.echartOptions.yAxis = {
    splitLine: {
      show: false
    }
  };
};

/**
 * Gets echarts options for STACK.
 */
ChartWrapper.prototype.stack = function() {
  this.echartOptions = this.convert();

  let series = [];
  let legendData = this.echartOptions.legend.data;

  let xAxis = {data: []};
  for (let i = 0; i < this.options.values.length; i++) {
    for (let j = 0; j < legendData.length; j++) {
      let seriesItem = {
        name: legendData[j],
        type: 'bar',
        stack: i + '',
        data: []
      };
      for (let textCategory in this.echartOptions.categories) {
        if (i == 0 && j == 0) xAxis.data.push(textCategory);
        let values = this.echartOptions.categories[textCategory].values;
        seriesItem.data.push(values[i][legendData[j]]);
      }
      if (this.options.values[i].values) {
        let valuesInValues = this.options.values[i].values;
        for (let code in valuesInValues) {
          if (legendData[j] == code || valuesInValues[code].text == legendData[j]) {
            seriesItem.color = valuesInValues[code].color;
          }
        }
      }
      series.push(seriesItem);
    }
  }

  this.echartOptions.tooltip = this.echartOptions.tooltip || {};
  this.echartOptions.xAxis = xAxis;
  this.echartOptions.series = series;
  this.echartOptions.yAxis = {};
};

/**
 * Gets echarts options for SCATTER.
 */
ChartWrapper.prototype.scatter = function() {
  this.echartOptions = this.convert();
  let series = [];
  let xAxis = {
    type: 'category', data: [],
  };
  if (this.formatX) {
    xAxis.axisLabel = {
      formatter: this.formatX
    }
  }
  for (let i = 0; i < this.options.values.length; i++) {
    let seriesItem = {
      name: this.options.values[i].text,
      type: 'scatter',
      symbolSize: 6,
      data: [],
    };
    if (this.options.values[i].color) {
      seriesItem.itemStyle = {color: this.options.values[i].color};
    }
    for (let textCategory in this.echartOptions.categories) {
      if (i == 0) xAxis.data.push(textCategory);
      let values = this.echartOptions.categories[textCategory].values;
      seriesItem.data.push(values[i][this.options.values[i].operator]);
    }
    series.push(seriesItem);
  }
  this.echartOptions.tooltip = this.echartOptions.tooltip || {};
  this.echartOptions.xAxis = xAxis;
  this.echartOptions.series = series;
  this.echartOptions.yAxis = {
    splitLine: {
      show: false
    }
  };
};

/**
 * Gets echarts options for RATIO.
 */
ChartWrapper.prototype.ratio = function() {
  let title = this.options.title;
  let value = this.options.value || 0;

  this.echartOptions = {
    grid: {
      bottom: 0,
      top: 0
    },
    textStyle: {
      color: 'white'
    },
    legend: {
      textStyle: 'white'
    },
    xAxis: {
      type: 'category',
      data: [''],
      show: false
    },
    yAxis: [{
      type: 'value',
      min: 0,
      max: 100,
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },{
      type: 'value',
      min: 0,
      max: 100,
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    }],
    series: [{
      data: [{
        value: value
      }],
      barWidth: '100%',
      type: 'bar',
      label: {
        show: true,
        position: 'inside',
        formatter: function (series) {
          return title + '\n' + series.data.value + '%';
        }
      },
    }]
  };
};

/**
 * 组织结构图。
 */
ChartWrapper.prototype.orgchart = function() {
  this.echartOptions = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series:[{
      type: 'tree',
      data: this.options.data,
      left: '2%',
      right: '2%',
      top: '8%',
      bottom: '20%',
      symbol: 'emptyCircle',
      orient: 'vertical',
      expandAndCollapse: false,
      lineStyle: {
        curveness: 0
      },
      label: {
        position: 'top',
        rotate: 0,
        verticalAlign: 'middle',
        align: 'center',
        fontSize: 15,
        padding: [12, 12, 12, 12],
        borderWidth: 2,
        borderColor: '#39f',
        symbolSize: 0,
        color: 'white',
        backgroundColor: '#39f',
        formatter: this.options.formatter
      },
      leaves: {
        label: {
          position: 'top',
          rotate: 0,
          verticalAlign: 'middle',
          padding: [12, 12, 12, 12],
          align: 'center'
        }
      },
      animationDurationUpdate: 750
    }]
  };
};

ChartWrapper.prototype.fetch = function(refresh) {
  let self = this;
  new Promise(function(resolve) {
    xhr.post({
      url: self.url,
      data: self.params,
      success: function(resp) {
        if (resp.error) {
          // dialog.error('获取图表数据失败：' + resp.error.message);
          return;
        }
        // let series = self.echartOptions.series[0];
        // series.shift()
        for (let i = 0; i < resp.data.length; i++) {
          resp.data[i] = self.convertRow(resp.data[i]);
        }
        resolve(resp.data);
      }
    });
  }).then(function(data) {
    if (refresh) {
      // custom
      refresh(data);
    } else {
      // default
      self.options.data = data;
      self.paint();
    }
  });
};

/**
 * Renders the chart under the containerId.
 *
 * @param containerId
 *        the container or the container selector
 */
ChartWrapper.prototype.render = function(containerId, params) {
  let self = this;
  params = params || {};
  for (let k in params) {
    this.params[k] = params[k];
  }
  this.container = dom.find(containerId);
  if (self.url) {
    this.fetch();
  } else {
    this.paint();
  }
  if (this.interval > 0) {
    schedule.start(this.scheduleName, function() {
      if (self.refresh) {
        self.fetch(self.refresh);
      } else {
        self.fetch();
      }
    }, this.interval);
  }
};

function Kanban(opts) {
  this.drop = opts.drop;
  this.boards = opts.boards;
}

Kanban.prototype.initialize = function() {
  this.jkanbanBoards = [];
  for (let i = 0; i < this.boards.length; i++) {
    let board = this.boards[i];
    this.jkanbanBoards.push({
      id: board.id,
      title: board.title,
      class: board.classes,
      dragTo: board.target
    });
  }
};

Kanban.prototype.addElement = function(boardId, element) {
  this.kanban.addElement(boardId, element);
};

Kanban.prototype.render = function(containerId, params) {
  let self = this;
  this.initialize();
  this.kanban = new jKanban({
    element: containerId,
    gutter: "10px",
    responsivePercentage: true,
    itemHandleOptions:{
      enabled: false,
    },
    click: function(el) {
      // console.log("Trigger on all items click!");
    },
    dropEl: function(el, target, source, sibling) {
      console.log(target);
      console.log(el);
      // self.drop(el, target, source, sibling);
    },
    boards: self.jkanbanBoards
  });

};

function Logo(opt) {
  let self = this;
  this.shape = opt.shape || 'circle';
  this.size = opt.size || 128;
  this.readonly = opt.readonly || false;
  this.name = opt.name;

  this.root = dom.element(`
    <div class="row mb-3" style="justify-content: center; margin-right: -20px; margin-left: -20px;">
      <img src="">
      <input name="${opt.name}" type="hidden">
      <input name="_${opt.name}_logo" type="file" style="display: none"
             accept="image/*">
    </div>
  `);

  this.image = dom.find('img', this.root);
  this.input = dom.find('input[type=hidden]', this.root);
  this.fileinput = dom.find('input[type=file]', this.root);
  if (!this.readonly) {
    this.image.style.cursor = 'pointer';
    // dom.bind(this.image, 'mouseover', function () {
    //   this.src = Logo.AVATAR_ADD;
    // });
    // dom.bind(this.image, 'mouseout', function () {
    //   this.src = self.input.value;
    // });
    dom.bind(this.image, 'click', function() {
      self.fileinput.click();
    })
    dom.bind(this.fileinput, 'change', function(ev) {
      if (!('files' in this)) return;
      if (this.files.length == 0) return;
      let reader = new FileReader();

      reader.addEventListener("loadend", function () {
        // convert image file to base64 string
        self.image.src = reader.result;
        self.input.value = reader.result;
      }, false);

      if (this.files[0]) {
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
}

Logo.DEFAULT = 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/4QMvaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGNDk4Mjc3REFFRkExMUU5OUFFOEREMkVENjJFMDExNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGNDk4Mjc3RUFFRkExMUU5OUFFOEREMkVENjJFMDExNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkY0OTgyNzdCQUVGQTExRTk5QUU4REQyRUQ2MkUwMTE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkY0OTgyNzdDQUVGQTExRTk5QUU4REQyRUQ2MkUwMTE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4AJkFkb2JlAGTAAAAAAQMAFQQDBgoNAAAL9gAAEmEAABorAAAhVv/bAIQAAgICAgICAgICAgMCAgIDBAMCAgMEBQQEBAQEBQYFBQUFBQUGBgcHCAcHBgkJCgoJCQwMDAwMDAwMDAwMDAwMDAEDAwMFBAUJBgYJDQsJCw0PDg4ODg8PDAwMDAwPDwwMDAwMDA8MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8IAEQgAtgH0AwERAAIRAQMRAf/EANEAAQEBAQEBAQEBAAAAAAAAAAAGBwUEAwIBCAEBAAAAAAAAAAAAAAAAAAAAABAAAQQBAwIGAgMBAAAAAAAABAECAwUAMhMVEBRQESExEjRAcDCgNSQRAAEDAQMHCAcFCQEAAAAAAAEAAgMRIXESEDFBIjITBFFhkcHRkjM0UIGxQlJyI+FiokMUIDBAcKGCU3OD8RIBAAAAAAAAAAAAAAAAAAAAoBMBAAEDAgUDBAIDAQEAAAAAAREAITFBUfBhcYGREKHRULHB8SAwQHCg4WD/2gAMAwEAAhEDEQAAAf8AdQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP6AAAAAAfwAAAAAAAAAAAAAAAAAAAAAAAAyE5wAAAAAP6aOU4AAAAAAAAAAAAAAAAAAAAAAAMLO4doAAAAH9Iguy5AAAAAAAAAAAAAAAAAAAAAAABhZeFwAAAAAYYXRcgAAAAAAAAAAAAAAAAAAAAAAAwsvC4AJspAeYz8tDqgwwui5AAAAAAAAAAAAAAAAAAAAAAABhZeFwDhmUmxnvOMZEaOV4MMLouQAAAAAAAAAAAAAAAAAAAAAAAYWXhcAy8mSjNTB5T1AGGF0XIAAAAAAAAAAAAAAAAAAAAAAAMLLwuDwmMH8BqBTHiPCdsGGF0XIAAAAAAAAAAAAAAAAAAAAAAAMLLwuDPyJAPaUhInqNlPoYYXRcgAAAAAAAAAAAAAAAAAAAAAAAwsvC3MvPOAAAW5RGGF0XIAAAAAAAAAAAAAAAAAAAAAAAMLLwuAAAAADDC6LkAAAAAAAAAAAAAAAAAAAAAAAGFnqPWAAAAAcgvi4AAAAAAAAAAAAAAAAAAAAAAABBHgAAAAAALU64AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPMcM6p5D6kyUJ2z8kuVRxCeKY6hIHzLA8ZKnaKEHnOCe4/R8j0HIKY5B+znlQfklSsJc8RWE2VpFHpKwAAAAAAAAHLMhL48xNGimemqH2MrNPMqNCM6KY/B9T2kYaCQpop1CLIw0wkjyl4ZSaCeE+xOmqkyZwbAZsfgriKNgMWLYswAAAAAAAAcshjklITprZlppB6zKjSDODUzJTtnSJ4+xyjWzOSyO4Y4esrCRPoUBPH4KE+xOGpmWn5O4cQ9x7SaNdMaL4qgAAAAAAAAeInD2n4PyShRlgfgzM7B6CbKsoDPj5l8c4jTtlueEkTuHHPUeg45RkydQ9ZJHXPKVBMH3OWWpFHTOce0vwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUC/SxJk80u7Lm7Lm7Lm7Lm7Lm7Lm7Lm7Lm7Lm7Lm7Lm7Lm7LlWTJPF4gvuGD3acKucKucKucKucKucKucKucKucKucKucKuL6LS6fEF96XT/G7VS6fEF96XT1FPbOR0llbDG64I+QhTS4ujtVLp8QX3pdPSwn2BmOdG4adpMOHxOmFyoheyLo7VS6fEF96XT0tZ90jK0rt5uiwwud1dqpdPiC+9Lpwmbt4FVVXpWFb8WTEQjoKdGW7o7VS6fEF96XTlxP5u6jzOHlIt5H45znqPMo8zXI9uO1UunxBfel05KCfLJxhucYbnGG5xhucYbnGG5xhuVzCYosdqpdPiC+9Lp/jdqpdPiC+8RE0Gd+ZnfmZ35md+ZnfmZ35md+ZnfmZ35md+ZnfmdKXT4gRUPdJw5WcOVnDlZw5WcOVnDlZw5WcOVnDlZw5WcOVnDlZw5WBioJH+nppNmIWzjJlJnQaEMxDMJMhFTmvUU+Eroq+SD2jSJsKPhFzmvUYyEpFVESW4iasdyxVY9sjSCohmrdeo1jASvSWRsMYtmwmUwvtGiFNLYYa0PBSO6iItWQStcj2mGoHkJaTDDWbSZcVURIbaOWXCbNo0yXUeRSsmjhtWyzYtyxFgtWzzfhG/Ub8mqSQhVZTu+LGJIcUlaGjSoXBEwSb0L9Fb92aTZhFhcaStaGrZGyAlWxPnHXgwuhJDBkSuj7d0r3mlsrRGMPF7SYOZZxsuJvJibgzy2IUFTy/Ge0k3C08gg/g+VKmbcguvYH/ADKr7mWs20MrHsYPNvwWn3SVA2qmN7Bgvu4zb7gZatZ/wjfqVbGyvlSUValvziEl7UpHsVtiQ0ggWNYhn6K30MJbvD187RyfmxGly90VawLGgMrCAygGisqY1eS3zELZLHI21IZNLXRrGJhc3cEGlREtqJvnA/8A4jwmKSdcTeTRioYR66bZKuvYH/Mq/QzzRcs5t0mYqGQSmmy0+6SAPEPTyvXA/uI5q5GxJSR62GCb8IiN0sFeDOLLYBd02uElFQytaQvFG4HVpC7HJ5t4gvAa+cYgyrSZ3FG4HWtHWWJkzJaidqx1JT1HHjGjMAYVi1RiKLU/F2ENlfALVObJJWiujCBLGnsAJCZK4J4uFV5ZE6VwaIRUyrKYISVEMLLCHxBeBgEivgqZt7jw8HrjIJza8iclKgrAw2iRrUF4FXEDkuqS1UWsIhI/Y/8A/9oACAECAAEFAv61P//aAAgBAwABBQL+tT//2gAIAQICBj8CNT//2gAIAQMCBj8CNT//2gAIAQEBBj8C/ks47xzW11GA0oF4r+8V4r+8V4r+8V4r+8V4r+8V4r+8V4r+8V4r+8V4r+8V4r+8V4r+8V4r+8V4r+8U8SHE6I7XMfSJvUh3mDBTRVeYHdXmB3V5gd1eYHdXmB3V5gd1eYHdXmB3V5gd1eYHdXmB3URyLiL29fpE3riLx+8deVxF7ev0ib1xF4/Ymh0V+geUDK+V+ywWqrWMDfhzrGBhcLHtyuvK4i9vX6RN64i8ZX025NRnrTXsNHNNQU2VunaHIckjGWusIHLTJJI4U3pGAcw05XXlcRe3r9Im9cReMu7GzDZ69OTC4/SlsdzHQcuJ0TC74iP2HXlcRe3r9Im9cReMkkvwjVv0Ik2k58u7cfqxf1GSsrw3kGnoUjWgtLM1dIyuvK4i9vX6RN64i8ZGcOPd1n36P2GSt93OOULDw7d2PjO0sTiXOOclMlHu7Q5RpQc01a4VByOvK4i9vX6RN64i8Ll5k+R0NrzXaHavB/EO1eD+Idq8H8Q7V4P4h2rwfxDtXg/iHavB/EO1GGdmEN8M1B9WR15XEXt6/SJvXEXj9468riL29fpE3o7qQsxZ6LzDl5hy8w5eYcvMOXmHLzDl5hy8w5eYcvMOycRe3r9IudA9uFxrhdoW1H0nsW1H0nsW1H0nsW1H0nsW1H0nsW1H0nsW1H0nsW1H0nsW1H0nsW1H0nsW1H0nsW1H0nsW1H0nsWGuJzrXu/k/JLTFgFaLdbsxk7NTWqMpbjoQKXqSkZjwU01zrXNXnNGM68vZ8ywt1JP8Z6shPIKpkIhLcfvVyYXa8n+Mda8vZ8y1DR4zxnOiSaAZyqRRmX72YKksJYPiBqg9jsTXZiFilOfZYM5VnD2c7lg8KQ5mnTccr5XZmCq3W7MZIsJNUxxjMgcaWGlE54bgwmhbnTKs3hfoBpmW93e7FaCpqnRboyYM7gU17dlwqFHWMyY66aZk/iMGEMxatfhTYhCWVrbXISbALSmRbosxmgfXI6Ewl+GmtXlVsDgL0JIziaUyHcFuM0xVyEfpzZ977EyLcFuM0xV/g+I+QrG2wstxciMnvVbjHPVcU45m0J9VUKnWlNp5AsO6r96tqox2bWieopfjbUp/ylQ+v2KSX4GkrC921V0rlh3VPvVtRDTrRGrXcoUEbbGyt3jupfqOItB2WnNQaSgeHnihfp1rCnM/VRStfaGNNtVzyOwx8wWEx7w6XnOhgJwPtj5Qo5DtZnXjIyAZ36z7goJdJAkZcn4Lat3kftT49ErbLwi0W7sBgvQr+Sy2/wD9U02fBrSG8oxHahNlxXD/AN3Up/8Ap7FHc72ZMA2ptX1aVHNmDycB+VRy/ELb9Klub7Ez9MHb3389P6pxcKCR1WXUUH+zIN94WP6lyj3Adva6m1/B8R8hXERPta+Oh6VPwzszqV56WgrjGfGKdIKY54pgJbJ7FjD2lnxVsVY7WMGFp5VDGc7W2p/ylQ1sz+xTRsILnNNAgX2McMLjyLGXtwfFWxPdHaHENj59C4V2hrN2TzhO4TGGSBpZbyHSsTuIDne7HS1Y/djaam+xAuFsMloQex4c06U1sZxNiFrucqIGwu1unJJJ7taNuChEcZjMQw28iMRzwmz5Sq6I31HylBzviMj1Hw497WfdoU8L43OM+dw/omVOrJqO9a4f+7qU/wD09ijrZYfYrCCnAbMOoOtQ8O2NzXQ5n+1ScOfnZ1qW5vsW+bPr0FGGltVNETVjRibzKD/YrHA+tNjccIfJQu9aZK2cuczM2z+DljbtPbQVT3y4aFtBQpro6CZnLpCl3uHXpShqt5Gd3Lp5CqYRT5rEJZyHvGywZhkcOUFfl977EJZMGGhFhRlgIY87TDmKphFPmsW8kO8lGzyBOjkFWuX0XCRujQV9TDGNJJqVu4/7naSVjB3cw97lvVA1pHKHIP4kh1M0QzevJIyGm8cKAlV4oNdHSxoOlPDIgx5Go7nQkdgwEUkAOhMkhw1pR9TS5SGWmN9AKW2KSXUo46utoQG4BppTjw+BsR2QTmXDDV3kY+pbpUkD6Y3Y6UNloX5fe+xSSalTGQy3Smu4jA6OtXgHOvAA50yUYCGH4tCfLHhwmlKlflj1oiuJ79tyPh977FHK/BhbWtDzJx+nafi+xRSvwYWG2h/mR//aAAgBAQMBPyH/AOYh2qHaodqh2qHaodqh2qHaodqh2qHaodqh2+pQLFCQDGK4A/NcAfmuAPzXAH5rgD81wB+a4A/NcAfmuAPzXAH5rgD81wB+ajucBzpG5gPKFp8fUffvvTEGcXuTXGPmuMfNcY+a4x81xj5rjHzXGPmuMfNcY+a4x81xj5ocwJ4riu31F799643s/wBnHt64rt9Re/feuN7P8EdAE9APz6txEiGXYKXenZio5s1emOrh+H149vXFdvqL3771xvZ9Zko+QPYqEhXNFWRGzbcnofkPVyYpso2TI0yYyDWT3T68e3riu31F799643s+txZPz8D0wmh9QOWKyv8ADj29cV2+ovfvvXG9n0BDNhu7DzSASJW6+uVwgr2X8enkPVdMqihojPc9ePb1xXb6i9++9cb2fSRtvPYeP4ZaV1jJUh3G9mhSHLBS1fzl1HCoJxbofTj29cV2+ovfvvXG9mlgWLDuq686+z/QaaaaaaamVmcYc2Lj049vXFdvqL3771xvZ/s49vXFdvqL3770ET8OqK40+K40+K40+K40+K40+K40+K40+K40+K40+K40+K40+KVVW63WuK7fUU1Zrok6CD/csWLFixYsWLFixYMe3/oidA5H+nxQidliYoAgysJDTBTrREWPKhlMZTc8Cj0xZzXPlS8PvvtSVyCdV6tfTW+aHSmQ8rixBOI9ErkM6p1aUPLt3fan0xJxXPnQJjytgKbxjWzdNaHoHJepagtGnGovc7h0ivZfJ7FGUPJP1Gc3o35d6DzuSZJpgqSUzbhEmjmnZqeOyRoadJi0GrWrYUsbiNcFB/AEhOpjSmokT8mglgKLFnJ3o0vIZLCcxTNIqZcE4j0ROGpsFQMU0KTpaNfRQEFAmE4ikJvxC+0FaO9uomjQ6Vdix2j0lBySYaUKa4iLFpxH+I5EnSAaptRXsC2zd80GPPRBULZ3tl/YrYuu13zUomOsjTxVtIiDnr71wjauL56tlMSc9PepQOpY1rYugK75qwB+4Lk9SkZwXNNFQrJyyDkoAAGyCXSbUqYK5wModM00hmDOJIKOHhvWT2bUIYlM5BuTyrMrJd7C9/Sf937B5aENjmFJ+KSMH1DgVMLkeT9ppLeEPJ92ttJ+b/2qNmjsKp0YXlFe9o9p66ko0PDpv8K92QBFEXm32FvdXANlMEUyTgi/lTHmCeQT3rgOvpAkmWBOq+KCDTTSEw7sY/xHHz9jF6UrxIUOtHEC9BUkwAag3eKHLBNqzrTdIkvknerSpY827964RtSFIGttrooNekZS9OnNc4wvcpjCBNqzrRCkJaws81BWQ98fNPQEjVJA3iamxrA3Pe1OYeWDCl5gKB/JRdqkl99qF6kBhyR0ig5umdcnt6X2l+zioZMihm2C3SpbzaPB70FgY9vc+zV5YOxMnvU6LvtLe6pBLCCAiMtmpbB8SfNe9o9pWxCBnbUHQpsI1PqS7pl5qJKCiQsfdWWcECuAbKk4u0KUJCL1NuSLeTZCmDLAXL3pCEtgNSxW2g5XpJaKmciadf8ADiPlYRLW8R9MyOxSYgA2C5F5UW5PJk8im5V1+/s0g3+4FLslcy3d/RAMiO56YtwGdMvarsl8y3NqkbfdChM+ie3u1B11z8nOn7uex+bUJl/40j5o0Fsp3DWPQgjINhSZC0EPmK1ZTcy5vSIBKyAnLPSo/c5RnmxTB6krbRrV9xJiy7aNRaDy0eRoGduDYb8tal4YhcDY0prLALW7vmibgFUVro61nBl9sgwxyq0d8hhF49MNQcT68RNsUCFKUr7DLS4l8YLb3pVbx3Yum1HpDNi2IxS0lHVv+xQTz2HGA5Uh3Gjmhum6NqEliJ1NM3GXrhNv9kf/2gAIAQIDAT8h/wCan//aAAgBAwMBPyH/AJqf/9oADAMBAAIRAxEAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQSSSSSSAAAAAAAAAAAAAAAAAAAAAAAACQSSSSSAQAAAAAAAAAAAAAAAAAAAAAAASQAAAAASAAAAAAAAAAAAAAAAAAAAAAACSAAAQQCQAAAAAAAAAAAAAAAAAAAAAAASQASCAASAAAAAAAAAAAAAAAAAAAAAAACSAQACACQAAAAAAAAAAAAAAAAAAAAAAASQCAASASAAAAAAAAAAAAAAAAAAAAAAACSAAAQSCQAAAAAAAAAAAAAAAAAAAAAAASQCSSSASAAAAAAAAAAAAAAAAAAAAAAACSAAAAACQAAAAAAAAAAAAAAAAAAAAAAASSSSSSQQAAAAAAAAAAAAAAAAAAAAAAAAQAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASQAQSQSCCAACAASQAAQSCAAAAAAAAASSQQQCCSQQQACQCQSCACSQQAAAAAAAACACSCCCASASQCCQACCQACCQAAAAAAAAACSQQCQACCAAQSQAQQSSACSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9oACAEBAwE/EP8A5cFwL0rnvFc94rnvFc94rnvFc94rnvFc94rnvFc94rnvFc94rnvH1EuhSob4CEsRKmV/t9evXr169evXr16GAaXGlmHD3hl1SRP1Ayda4buqbs6JYrokRFfslf2Sv7JX9kr+yV/ZK/slf2Sv7JX9kr+yVv8Azfd5JP1EyZOtcN3f2FN+jXGN31EyZOtcN3fwKe3OlDwsIsLuqR5dPVoUJZGOYVApEH3WOhX6FZQPrhyI6hc9N+jXGN31EyZOtcN3fwKbc/ciGLud4pzgzaJJ/wC1AMGDm089zl6IGQJm6HmmKCRWxaImRHFRGHDCHA6Kzp6b9GuMbvqJkyda4bu/gUlpLGGzAvtbs9IOclLbD7sPLp6giJm8u6pevxj036NcY3fUTJk61w3d6lHnJ4/7IUidZ+USr1X1zaJl8fPTLtv6RGqSj2dKqYULifZIYhsnT036NcY3fUTJk61w3d6lMc/AajCdJPf+DtTA0bJ+p71fq7WmOS/utKPWVneay1PaIR5DumOdHcMfA5Gt+jXGN31EyZOtcN3ehRhGkQQKDBMF6lzkeGWw2BB/QEEEEEEEqPPyPNyErnWt+jXGN31EyZOtcN3f2FN+jXGN31EyZOtcd3U8RBi3WCyOJr9lR+yo/ZUfsqP2VH7Kj9lR+yo/ZUfsqP2VCJSVGq3X6iZxQDLF1ZKAJOP7QIECBAgQIECBAgR0EjVkjtUXxUpICAZgxP8Ap9i0kIOgUYoMjxS4TEDFynCEDtlEyHHSoypAVgtogiKwDARLdKA5tYAutOPtGpJHkhgMoWh55ekgEEMJgse1WoDQsvEZmN/STDgFIHClpeeVYAuvo+8aALYlC2QoOZ3p+4HQC6q4CjX7ht1shRzQpoXRCHMgvFT5KFKPwmo0mEniSTOCxqtqvL0roI8xSrYyGimwWXkg+uAiMwwwOagKiFDwFliXIl7UIq8GBcTJAfFQ1mvRZIAsztRCtxCwSlMlinZmGityEgJYprMy1FEBWqM1GpudRE+9TAyAXNJkmhb9SS4cABOMUVU6dMSBz19DepngEr2Cm5ErgpvAygzr6NZMDWDI8TvR0qbvh1SeaPKJYIyAOE1KgRHhFe6DON6L071O5cknwpFxALBSQZxv/h8Q5U4PWORXS5TJhf6QDozDlXvfiE+1OHHvuGVBsUBRll2S08lIehFRyxY4pyTVCO9DEkeYGQTsa4rvr31EoI3PCCzvCpKcsvGlk6qgbdqUkvA081ZepFIxRBYMQNkhKSmMTViXlMr0q6o8LZECTKOWAo2CpdZZkUaRWssci6mjKzagKF0tCTkF2rYoN0pIDkCkUp9YFCiVQjT3ynfF8RPpZpgxvQXydqWWzJIUPUQ9aiSnUvZgdyaWDIPzYe6ltEj1WPwdqNsWBiclOsCmprvmb7yzV1+AOWfwsniuE7ejTg2700UzG5ce5HdV10d8hi+W1NCQkuSOwfTULpQ87nJF0RUmwaxRYXRFvQhmmWBYCWezLxT3SgQBmXeM/wCHxDlU8lw1MA2RhKk4KA4D1A+6UwbyHEB8tWmirZFY3V6j6AjcJug71AUomYryCoKOO7bS3dmFcV30dksmAc1oCMTYCBAuYip4x+ZoQbEDT+Yit4m6KiGiCwRY5r1MQcWAYT1mHSoDRYaFFNAhUJHoXK3coBeUqUYRjsMDqitLzZ2rdI6klQtzEkGwcjUaWYbcvCFqAE7zTt5M5C4eFWJVALq4CplUCmmM6l+9JlkCoBzA0LLgGqr2EjxSeYR+kHWKgNv2xgnqwrTDmc0HrJ7UadhbYyLri1rxJcRCbpGuB7ejQaIncGWrWvnpZ4FrR3BwtPes7UpsmLMFpe5mvC+vQXs+mpWuQv2hQkS+L0I5OLKMhgcxQMphABzLQFJw4ew07AwolgRhbnSREmg1S6cSt/h5lN7YJYYKUJKk9ZBsQVPZM/MLIOVy2+9KClM6whmYM0b8caqEDC/MO5SEOt5tzhR9qQkYSocIhM0tHpE/fPEoE+akIV8pUisPJ42C0fvSERZkTlAVutooBRjZ99Ar7Vj+wLK2mV+Y40q0S7EiXE0DcamLKYYtByPMaSnCRMXJWXrRL91pYUKHsaVGhBtTYFe2iXOdNECEouZJ7Vfpw6oLk4SGwd69gwUwqOB22INyUWpQSyTWAYEAJc0E+UYe+6tOabRoxQJEEygNOEjNpEiIkylNM3JxJUqXK9qegYwm3Y1xd51KiKRIhXM3qweDhBAMEJL0cIjzhgzNmbsUxEcmakwRfNqtAr7qHMImSZYsCLtTVAQeFBOoXo/IQJFJEnJUrmJkLWY1qbb03O8Xo1MHUqeJMKkG8XatLrDgoQeQTrS1KESVhZoYMQSbOwR1d6Xi75YRJ7qKaTmoW0Izd3/2R//aAAgBAgMBPxD/AJqf/9oACAEDAwE/EP8Amp//2Q==';

Logo.prototype.render = function(containerId, selection) {
  if (!selection) {
    selection = Logo.DEFAULT;
  }
  this.image.src = selection;
  this.input.value = selection;
  let container = dom.find(containerId);
  container.innerHTML = '';
  container.appendChild(this.root);
};
/**
 *
 * @param opt
 *
 * @constructor
 */
function Members(opt) {
  this.members = opt.members;
  this.onMemberClicked = opt.onMemberClicked;
  this.model = opt.model;
}

Members.prototype.renderTo = function (container) {
  // make container empty
  container.innerHTML = '';

  let model = this.model;
  let htmlMembers = `
    <div class="row m-auto" style="justify-content: center;">
      <style>
      .tooltip-avatar {

      }
      .tooltip-text {
        visibility: hidden;
        min-width: 56px;
        background-color: #666666;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        font-size: 12px;
        padding: 2px 0;
        position: absolute;
        z-index: 1;
        opacity: 1;
        top: 25px;
        left: 20px;
      }
      .tooltip-avatar:hover .tooltip-text {
        visibility: visible;
      }
      </style>
    </div>
  `;

  let elMembers = dom.element(htmlMembers);
  for (let i = 0; i < this.members.length; i++) {
    let member = this.members[i];
    if (typeof member.fnAvatar !== 'function') {
      member.fnAvatar = function () {
        return member.avatar;
      };
    }
    if (typeof member.fnName !== 'function') {
      member.fnName = function () {
        return member.name;
      };
    }
    let htmlMember = `
      <div class="avatar avatar-36 tooltip-avatar">
        <img src="${member.fnAvatar()}">
        <span class="tooltip-text">${member.fnName()}</span>
      </div>
    `;
    let elMember = dom.element(htmlMember);
    if (this.onMemberClicked) {
      dom.model(elMember, member);
      elMember.classList.add('pointer');
      dom.bind(elMember, 'click', (event) => {
        let member = dom.model(event.target);
        this.onMemberClicked(member);
      });
    }
    elMembers.appendChild(elMember);
  }
  container.appendChild(elMembers);
};


function Money(opt) {
  this.model = opt.model;
}

Money.prototype.renderTo = function(container) {
  let model = this.model;
  let html = `
    <div>
      <div>${model.primary}</div>
      <div class="small text-muted">${model.secondary}</div>
    </div>
  `;
  let el = dom.element(html);
  container.appendChild(el);
};

function Person(opt) {
  this.value = opt.value;
  this.model = opt.model;
  this.onPersonClicked = opt.onPersonClicked;
}

Person.prototype.renderTo = function(container) {
  container.innerHTML = '';
  let model = this.model;
  let el = dom.element(`
    <div class="ui yellow image label bg-info text-white">
      <img src="${model.avatar}" height="32">
      <span>${model.name}</span>
      <p class="detail">${model.detail}</p>
    </div>
  `);
  if (this.onPersonClicked) {
    el.classList.add('pointer');
    dom.model(el, this.value);
    dom.bind(el, 'click', event => {
      let div = dom.ancestor(event.target, 'div');
      this.onPersonClicked(dom.model(div));
    });
  }
  container.appendChild(el);
};

function Progress(opt) {
  this.model = opt.model;
  this.value = opt.value;
}

Progress.prototype.renderTo = function(container) {
  container.innerHTML = '';

  let model = this.model;
  let max = model.max || 100;
  let value = model.value || 0;
  model.fnPercentage = function() {
    if (parseFloat(model.value) == 0) return '未开始';
    let progress = (model.value / model.max) * 100;
    return progress + '%';
  };
  model.fnDuration = function() {
    let startDate = model.startDate;
    let finishDate = model.finishDate;
    if (typeof startDate === 'number') {
      startDate = moment(startDate).format('YYYY年MM月DD日');
    }
    if (typeof finishDate === 'undefined') {
      finishDate = '待定';
    } else if (typeof finishDate === 'number') {
      finishDate = moment(finishDate).format('YYYY年MM月DD日');
    }
    return startDate + ' - ' + finishDate;
  };
  model.fnStatus = function() {
    let startDate = model.startDate;
    let finishDate = model.finishDate;
    let now = moment(new Date());
    if (typeof finishDate === 'undefined') return 'success';
    if (typeof finishDate === 'number') {
      finishDate = moment(finishDate);
    }
    let diff = finishDate.subtract(now).days();
    if (diff < 0) return 'danger';
    return 'success';
  };

  let html = `
    <div>
      <div class="clearfix">
        <div class="float-left">
          <strong>${model.fnPercentage()}</strong>
        </div>
        <div class="float-right">
          <small class="text-muted">${model.fnDuration()}</small>
        </div>
      </div>
      <div class="progress progress-xs">
        <div class="progress-bar bg-${model.fnStatus()}" role="progressbar" style="width: ${model.fnPercentage()}" aria-valuenow="${model.value}" aria-valuemin="0" aria-valuemax="${model.max}"></div> 
      </div>
    </div>
  `;
  let el = dom.element(html);
  dom.model(el, this.value);
  container.appendChild(el);
};
ruler = {
  /**
   * 初始化刻度尺插件
   * @el 容器 String
   * @height 刻度尺高度 Number
   * @maxScale 最大刻度 Number
   * @startValue 开始的值 Number
   * @region 区间 Array
   * @background 刻度尺背景颜色 String
   * @color 刻度线和字体的颜色 String
   * @markColor  中心刻度标记颜色 String
   * @isConstant 是否不断地获取值 Boolean
   * @success(res) 滑动结束后的回调 Function
   * */
  initPlugin: function (params) {
    let initParams = {
      el: params.el,
      height: params.height || 60,
      maxScale: params.maxScale || 200,
      startValue: params.startValue || 0,
      region: params.region || false,
      background: params.background || false,
      color: params.color || false,
      markColor: params.markColor || "#FFCC33",
      isConstant: params.isConstant || false,
      minicolor:params.minicolor||'#f6f6f6',
      scale:params.scale||1,
      point:params.point||0
    };

    if (!initParams.el) {
      console.warn("没有容器元素的参数");
      return false;
    }

    let rulerWrap = params.el;
    rulerWrap.style.height = initParams.height < 50 ? 50 + "px" : initParams.height + "px";

    //最大刻度的小值是50
    initParams.maxScale = initParams.maxScale < 50 ? 50 : initParams.maxScale;

    if (initParams.startValue > initParams.maxScale) {
      initParams.startValue = initParams.maxScale;
    }

    let minSildeNum = 0;//最小滑动的值
    let maxSildeNum = initParams.maxScale;//最大滑动的值

    if (initParams.region) {
      minSildeNum = Math.floor(initParams.region[0]);
      maxSildeNum = Math.floor(initParams.region[1]);
    }

    let count = initParams.startValue; //初始值

    let winWidth = rulerWrap.offsetWidth; //容器宽度
    let division = winWidth / 50; //每个刻度的距离 分割线
    //刻度值数组
    let scaleValueList = [];
    for (let i = 0; i <= initParams.maxScale; i += 10) {
      scaleValueList.push((i/initParams.scale).toFixed(initParams.point));
    }

    let canvas = rulerWrap.getElementsByTagName("canvas")[0]; //获取容器下的canvas标签
    //没有canvas就创建一个
    if (!canvas) {
      canvas = document.createElement("canvas"); //创建canvas标签
      canvas.width = winWidth;
      canvas.height = initParams.height;
      rulerWrap.appendChild(canvas);
    }
    let cxt = canvas.getContext("2d");

    if (window.devicePixelRatio) {
      canvas.width = window.devicePixelRatio * winWidth;
      canvas.height = window.devicePixelRatio * initParams.height;
      cxt.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    //画刻度尺
    function drawRuler(count) {
      count = count - 25;

      //清空画布
      cxt.clearRect(0, 0, winWidth, initParams.height);

      //刻度尺背景
      if (initParams.background) {
        cxt.fillStyle = initParams.background;
        cxt.fillRect(0, 0, canvas.width, initParams.height);
      }

      //画刻度线
      for (let i = 0; i < initParams.maxScale; i++) {
        cxt.beginPath();
        cxt.save();
        cxt.strokeStyle = initParams.minicolor ? initParams.minicolor : "#F6F6F6";
        cxt.lineWidth = 1;
        cxt.lineCap = "round";
        cxt.moveTo(division * i - count * division, 0);
        cxt.lineTo(division * i - count * division, Math.floor(initParams.height * 0.3));

        if (i % 5 === 0) {
          cxt.strokeStyle = initParams.color ? initParams.color : "#999";
          cxt.lineTo(division * i - count * division, Math.floor(initParams.height * 0.35));
        }
        if (i % 10 === 0) {
          cxt.strokeStyle = initParams.color ? initParams.color : "#666";
          cxt.lineTo(division * i - count * division, Math.floor(initParams.height * 0.52));
        }

        cxt.stroke();
        cxt.restore();
        cxt.closePath();
      }

      //添加体重数字
      cxt.beginPath();
      cxt.font = "14px Arial";
      cxt.fillStyle = initParams.color ? initParams.color : "#333";
      cxt.textAlign = "center";
      cxt.textBaseline = "middle";
      scaleValueList.forEach(function (num, i) {
        cxt.fillText(num.toString(), (division * i * 10) - (count * division), Math.floor(initParams.height * 0.78));
      });
      cxt.closePath();

      //中心刻度线
      cxt.beginPath();
      cxt.save();
      cxt.strokeStyle = initParams.markColor;
      cxt.lineWidth = 2;
      cxt.lineCap = "round";
      cxt.moveTo((winWidth / 2), 0);
      cxt.lineTo((winWidth / 2), Math.floor(initParams.height * 0.52));
      cxt.stroke();
      cxt.restore();
      cxt.closePath();

    }

    if (window.devicePixelRatio) {
      canvas.style.transform = "scale(" + 1 / window.devicePixelRatio + ")";
      canvas.style.transformOrigin = "left top";
    }

    drawRuler(count);

    //滑动相关
    let initX = 0, //初始x 距离
      endX = 0, //结束x 距离
      distanceX = 0, //移动距离
      _distanceX = 0,// 判断用的移动距离
      lastX = count; //上次移动距离

    if (!canvas) return false;

    //手指按下
    canvas.addEventListener("touchstart", function (e) {
      initX = e.targetTouches[0].pageX;

    }, false);

    //手指滑动
    canvas.addEventListener("touchmove", function (e) {
      endX = e.targetTouches[0].pageX;
      moveEvent();
    }, false);

    //手指抬起
    canvas.addEventListener("touchend", function (e) {
      lastX = count;
      overEvent();
    }, false);

    let isMouseDown = false; //鼠标是否按下

    //鼠标按下
    canvas.addEventListener("mousedown", function (e) {
      isMouseDown = true;
      initX = e.layerX;
    }, false);

    //鼠标移动
    canvas.addEventListener("mousemove", function (e) {
      if (!isMouseDown) {
        return false;
      }
      endX = e.layerX;
      moveEvent();
    }, false);


    //鼠标抬起&离开
    canvas.addEventListener("mouseup", function (e) {
      lastX = count;
      isMouseDown = false;
      overEvent();
    }, false);

    canvas.addEventListener("mouseleave", function (e) {
      if (isMouseDown) {
        lastX = count;
        isMouseDown = false;
        overEvent();
      }
    }, false);


    //手指&鼠标移动事件
    function moveEvent() {
      distanceX = Math.floor((endX - initX) / (winWidth / 50));
      if (distanceX === _distanceX) {
        return false;
      }
      _distanceX = distanceX;
      count = lastX + distanceX;

      if (count >= initParams.maxScale || count <= 0) {
        count = count >= initParams.maxScale ? initParams.maxScale : 0;
      }
      drawRuler(count);

      if (initParams.isConstant) {
        params.success && params.success(count);
      }
    }

    //手指&鼠标结束事件
    function overEvent() {
      if (count > maxSildeNum) {
        lastX = count = count > maxSildeNum ? maxSildeNum : count;
      } else if (count < minSildeNum) {
        lastX = count = count < minSildeNum ? minSildeNum : count;
      } else {

      }
      drawRuler(count);

      //返回最后的值
      params.success && params.success(count);
    }
  }
};


function Sparkline(opt) {
  this.color = opt.color || 'black';
  this.type = opt.type || 'line';
  this.data = opt.data || [];
}

Sparkline.PADDING = 3;

Sparkline.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
  let rect = this.container.getBoundingClientRect();
  let width = rect.width;
  let height = rect.height;

  let min = 0;
  let max = 0;

  for (let i = 0; i < this.data.length; i++) {
    let num = parseFloat(this.data[i]);
    if (min == 0) {
      min = num;
    }
    if (min > num) {
      min = num;
    }
    if (max < num) {
      max = num;
    }
  }

  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  this.container.appendChild(canvas);

  let ctx = canvas.getContext('2d');

  let dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  canvas.style = "width: 100%; height: 100%;";

  ctx.scale(dpr, dpr);

  if (this.type == 'line') {
    this.line(ctx, max, min, width, height);
  } else if (this.type == 'bar') {
    this.bar(ctx, max, min, width, height);
  }

  this.container.appendChild(canvas);
};

Sparkline.prototype.line = function (ctx, max, min, width, height) {
  let vRange = Math.abs(max - min);
  let vScale = (height - Sparkline.PADDING * 2) / vRange;
  let hScale = width / (this.data.length - 1);

  ctx.strokeStyle = this.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < this.data.length; i++) {
    let x = i * hScale;
    let y = height - (this.data[i] - min) * vScale - Sparkline.PADDING;
    if (i == 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
};

Sparkline.prototype.bar = function (ctx, max, min, width, height) {
  let vRange = Math.abs(max - min);
  let vScale = (height - Sparkline.PADDING * 2) / max;
  let barWidth = width / this.data.length - Sparkline.PADDING;

  ctx.fillStyle = this.color;
  ctx.lineWidth = 0;
  ctx.beginPath();
  let prev = 0;
  for (let i = 0; i < this.data.length; i++) {
    let x = (barWidth + Sparkline.PADDING) * i;
    let y = height - Sparkline.PADDING - this.data[i] * vScale;
    ctx.rect(x.toFixed(0), y.toFixed(0),
      barWidth.toFixed(0), (this.data[i] * vScale).toFixed(0));
    ctx.fill();
  }
};

function Status(opt) {
  this.model = opt.model;
  this.value = opt.value;
  this.onStatusClicked = opt.onStatusClicked;
}

Status.PENDING = {text: '暂停', color: ''};
Status.IN_PROCESSING = {text: '处理中', color: ''};
Status.COMPLETED = {text: '完成', color: ''};
Status.TERMINATED = {text: '中止', color: ''};
Status.CONNECTED = {text: '已连接', color: ''};

Status.prototype.renderTo = function(container) {
  let model = this.model;
  container.innerHTML = '';

  let el = dom.element(`
    <div class="font-13 m-auto tag-success">
      <span>${model.status.text}</span>
      <div class="tag-success-after"></div>
    </div>
  `);
  if (this.onStatusClicked) {
    el.classList.add('pointer');
    dom.bind(el, 'click', event => {
      this.onStatusClicked(dom.model(event.target));
    });
  }
  dom.model(el, this.value);
  container.appendChild(el);
};


function TwoLine(opt) {
  this.model = opt.model;
}

TwoLine.prototype.renderTo = function(container) {
  let model = this.model;
  let html = `
    <div class="d-flex align-items-center">
      <div class="bg-gradient-primary">
        <svg class="c-icon c-icon-xl">
          <use xlink:href="vendors/@coreui/icons/svg/free.svg#cil-settings"></use>
        </svg>
      </div>
      <div>
        <div class="text-value text-primary font-16">${model.primary}</div>
        <div class="text-muted font-weight-bold small">${model.secondary}</div>
      </div>
    </div>
  `;
  let el = dom.element(html);
  if (!model.icon) {
    el.children[0].remove();
  }
  container.appendChild(el);
};


function Swimlane(opt) {
  this.lanes = opt.lanes || [];
  this.shapes = [];
  this.padding = 10;
  this.gutter = 40;
  this.defaultWidth = 120;
  this.passed = opt.passed || [];

  this.colorSuccess = '#73b17b';
  this.colorFailed = '#d32f2f';
  this.colorDefault = '#333333';
}

Swimlane.prototype.draw = function() {
  const headSize = 36;

  // top-left corner
  this.context.beginPath();
  this.setColorContext(null);

  this.context.strokeWidth = 1;
  this.context.moveTo(this.padding, this.padding);
  this.context.lineTo(this.width - this.padding, this.padding);
  this.context.lineTo(this.width - this.padding, this.height - this.padding);
  this.context.lineTo(this.padding, this.height - this.padding);
  this.context.lineTo(this.padding, this.padding);
  this.context.stroke();

  this.context.moveTo(this.padding + headSize, this.padding);
  this.context.lineTo(this.padding + headSize, this.height - this.padding);
  this.context.stroke();
  this.context.closePath();

  let len = this.lanes.length;
  if (len == 0) return;

  this.laneHeight = (this.height - this.padding * 2) / len;

  this.context.font = 'bold 14px arial';
  const textPadding = 4;
  for (let i = 0; i < len; i++) {
    this.context.beginPath()
    this.setColorContext(null);
    let lane = this.lanes[i];
    this.context.moveTo(this.padding, this.padding + this.laneHeight * i);
    this.context.lineTo(this.width - this.padding, this.padding + this.laneHeight * i);
    this.context.stroke();

    let title = lane.title;
    let lineNo = Math.round(title.length / 2);
    let textY = this.padding + this.laneHeight * i + (this.laneHeight - lineNo * 18) / 2;
    // 渲染文本
    for (let j = 0; j < lineNo; j++) {
      this.context.fillText(lane.title.substring(j * 2, (j + 1) * 2),
        this.padding + textPadding, textY + (j + 1) * 18);
    }
    this.context.closePath();
    for (let j = 0; j < lane.actions.length; j++) {
      let action = lane.actions[j];
      if (action.type == 'PROC') {
        this.drawProcess(this.padding * 2 + headSize + this.gutter * j + this.defaultWidth * j, i, action)
      } else if (action.type == 'COND') {
        this.drawCondition(this.padding * 2 + headSize + this.gutter * j + this.defaultWidth * j, i, action);
      }
    }
  }
  this.drawConnections();
};

Swimlane.prototype.drawProcess = function(x, laneIndex, action) {
  let radius = 10;
  let text = action.name;
  let metrics = this.context.measureText(text);

  let width = 120;
  let height = 60;

  let y = this.laneHeight * laneIndex + (this.laneHeight - height) / 2 + this.padding;

  this.context.beginPath();
  this.setColorContext(action.id);

  this.context.moveTo(x + radius, y);
  this.context.lineTo(x + width - radius, y);
  this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.context.lineTo(x + width, y + height - radius);
  this.context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.context.lineTo(x + radius, y + height);
  this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.context.lineTo(x, y + radius);
  this.context.quadraticCurveTo(x, y, x + radius, y);
  this.context.stroke();

  let textX = x + (width - metrics.width) / 2;
  let textY = y + (height - 0) / 2;
  this.context.fillText(text, textX, textY);
  this.context.stroke();
  this.context.closePath();

  this.shapes.push({
    id: action.id,
    x: x,
    y: y,
    width: width,
    height: height,
    type: 'PROC',
  });
};

Swimlane.prototype.drawCondition = function(x, laneIndex, action) {
  let radius = 10;
  let text = action.name;
  let metrics = this.context.measureText(text);

  let width = 120;
  let height = 60;

  let y = this.laneHeight * laneIndex + (this.laneHeight - height) / 2 + this.padding;

  this.context.beginPath();
  this.setColorContext(action.id);
  // 从左侧开始画
  this.context.moveTo(x, y + height / 2);
  // 到顶部
  this.context.lineTo(x + width / 2, y);
  // 到右侧
  this.context.lineTo(x + width, y + height / 2);
  // 到底部
  this.context.lineTo(x + width / 2, y + height);
  // 再到左侧
  this.context.lineTo(x, y + height / 2);
  this.context.stroke();

  let textX = x + (width - metrics.width) / 2;
  let textY = y + (height - 0) / 2;
  this.context.fillText(text, textX, textY);
  this.context.stroke();
  this.context.closePath();

  this.shapes.push({
    id: action.id,
    x: x,
    y: y,
    width: width,
    height: height,
    type: 'COND',
  });
};

Swimlane.prototype.drawConnections = function () {
  for (let i = 0; i < this.lanes.length; i++) {
    let lane = this.lanes[i];
    for (let j = 0; j < lane.actions.length; j++) {
      let action = lane.actions[j];
      let next = action.next;
      let shape = this.getShape(action.id);
      if (typeof next === 'string') {
        let nextShape = this.getShape(next);
        this.drawConnection(shape, nextShape, '', this.isDone(action.id));
      } else if (typeof next === 'object') {
        for (let key in next) {
          let nextShape = this.getShape(next[key]);
          if (key === 'Y')
            this.drawConnection(shape, nextShape, '同意', this.isDone(action.id + 'Y'));
          else if (key === 'N')
            this.drawConnection(shape, nextShape, '驳回', this.isDone(action.id + 'N'));
        }
      }
    }
  }
};

Swimlane.prototype.drawConnection = function(curr, next, text, done) {
  this.context.beginPath();
  if (done === true) {
    this.setColorContext(curr.id);
  } else {
    this.setColorContext(null);
  }

  if (next.y > curr.y) {
    // 底部连接顶部
    this.context.moveTo(curr.x + curr.width / 2, curr.y + curr.height);
    this.context.lineTo(next.x + next.width / 2, next.y);
    this.context.stroke();
    if (text) {
      this.context.font = '12px arial';
      this.context.fillText(text, curr.x + curr.width / 2, curr.y + curr.height + 20);
    }
    // 箭头
    this.context.beginPath();
    this.context.moveTo(next.x + next.width / 2, next.y);
    this.context.lineTo(next.x + next.width / 2 + 3, next.y - 6);
    this.context.lineTo(next.x + next.width / 2 - 3, next.y - 6);
    this.context.lineTo(next.x + next.width / 2, next.y);
    this.context.fill();
    this.context.closePath();
  } else {
    if (next.x > curr.x) {
      // 右侧连接底部
      this.context.moveTo(curr.x + curr.width, curr.y + curr.height / 2);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2, curr.y + curr.height / 2);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2, next.y + next.height);
      this.context.stroke();
      if (text) {
        this.context.font = '12px arial';
        this.context.fillText(text, curr.x + curr.width, curr.y + curr.height / 2 + 20);
      }
      // 箭头
      this.context.beginPath();
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2, next.y + next.height);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2 + 3, next.y + next.height + 6);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2 - 3, next.y + next.height + 6);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2, next.y + next.height);
      this.context.fill();
      this.context.closePath();
    } else {
      // 右侧链接右侧
      this.context.moveTo(curr.x + curr.width, curr.y + curr.height / 2);
      this.context.lineTo(curr.x + curr.width + this.gutter / 2, curr.y + curr.height / 2);
      this.context.lineTo(curr.x + curr.width + this.gutter / 2, next.y + next.height / 2);
      this.context.lineTo(next.x + next.width, next.y + next.height / 2);
      this.context.stroke();
      if (text) {
        this.context.font = '12px arial';
        this.context.fillText(text, curr.x + curr.width, curr.y + curr.height / 2 + 20);
      }
      // 箭头
      this.context.beginPath();
      this.context.lineTo(next.x + next.width, next.y + next.height / 2);
      this.context.lineTo(next.x + next.width + 6, next.y + next.height / 2 - 3);
      this.context.lineTo(next.x + next.width + 6, next.y + next.height / 2 + 3);
      this.context.lineTo(next.x + next.width, next.y + next.height / 2);
      this.context.fill();
      this.context.closePath();
    }
  }
  this.context.closePath();
};

Swimlane.prototype.getShape = function (id) {
  for (let i = 0; i < this.shapes.length; i++) {
    if (id === this.shapes[i].id)
      return this.shapes[i];
  }
  return null;
};

Swimlane.prototype.render = function(containerId) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  let rect = this.container.getBoundingClientRect();
  this.width = rect.width;
  this.height = rect.height;

  let canvas = document.createElement('canvas');
  this.context = canvas.getContext('2d');

  const scale = window.devicePixelRatio || 1;
  canvas.width = this.width * scale;
  canvas.height = this.height * scale;
  canvas.style.width = this.width + 'px';
  canvas.style.height = this.height + 'px';
  this.container.appendChild(canvas);
  this.context.scale(scale, scale);

  this.context.lineWidth = 2;
  this.context.fillStyle = this.colorDefault;
  this.context.strokeStyle = this.colorSuccess;

  this.draw();
};

Swimlane.prototype.isCompleted = function (id) {
  for (let i = 0; i < this.passed.length; i++) {
    if (this.passed[i].status === id ||
        this.passed[i].status === (id + 'Y')) {
      return true;
    }
  }
  return false;
};

Swimlane.prototype.isFailed = function (id) {
  for (let i = 0; i < this.passed.length; i++) {
    if (this.passed[i].status === (id + 'N')) {
      return true;
    }
  }
  return false;
};

Swimlane.prototype.isDone = function (id) {
  for (let i = 0; i < this.passed.length; i++) {
    if (this.passed[i].status === id) {
      return true;
    }
  }
  return false;
};

Swimlane.prototype.setColorContext = function (id) {
  if (this.isCompleted(id) === true) {
    this.context.fillStyle = this.colorSuccess;
    this.context.strokeStyle = this.colorSuccess;
  } else if (this.isFailed(id) === true) {
    this.context.fillStyle = this.colorFailed;
    this.context.strokeStyle = this.colorFailed;
  } else {
    this.context.fillStyle = this.colorDefault;
    this.context.strokeStyle = this.colorDefault;
  }
};


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

  let usecase = opts.usecase || ''; 

  let req  = new XMLHttpRequest();
  req.timeout = 10 * 1000;
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
  req.timeout = 10 * 1000;
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

xhr.promise = function(xhrOpt, error) {
  return new Promise(function(resolve, reject) {
    xhrOpt.success = function (resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        if (error) error(resp.error);
        return;
      }
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
  }, function (index) {
    layer.close(index);
    callback();
  }, function () {

  });
};

dialog.view = function (opts) {
  let dialogTemplate = '' +
    '<div class="modal fade" id="dialogApplication">' +
    '  <div class="modal-dialog modal-dialog-centered">' +
    '    <div class="modal-content">' +
    '      <div class="modal-header">' +
    '        <h4 class="modal-title">{{title}}</h4>' +
    '        <button type="button" class="close" data-dismiss="modal">&times;</button>' +
    '      </div>' +
    '      <div id="dialogApplicationBody" class="modal-body">{{body}}</div>' +
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
      success: opts.save
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
    area : ['50%', ''],
    shadeClose: true,
    title: opt.title || '&nbsp;',
    content: opt.html,
    btn: ['确定', '关闭'],
    success: function(layero, index) {
      if (opt.load) opt.load(layero, index);
    },
    yes: function (index) {
      layer.close(index);
      opt.success();
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
}
var dom = {};

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

dom.toggle = function (selector, resolve) {
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
    element.addEventListener('click',  function() {
      // clear all
      let siblings = container.querySelectorAll(sources[0]);
      for (let i = 0; i < siblings.length; i++) {
        siblings[i].classList.remove(sources[1].substring(1));
      }
      element.classList.add(sources[1].substring(1));
      if (resolve) resolve(element);
    });
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
      if (el.tagName == 'INPUT') {
        if (el.type == 'check') {
          // TODO
        } else {
          el.value = val || '';
        }
      } else if (el.tagName == 'SELECT') {
        $('select[name=\'' + name + '\']').val(val).trigger('change');
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
}
let utils = {};

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
  if (empty)
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
utils.nameVar = function(name) {
  if (name.indexOf('-') == -1) return name;
  const names = name.split('-');
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
}
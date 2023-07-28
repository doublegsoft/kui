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
        if (fragment && fragment.id && window[fragment.id] && window[fragment.id].show && !callback) {
          window[fragment.id].show(params);
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
              <button type="button" class="close text-danger">
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
var dom = {};

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

  let top = rect.top;
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
    yes: function (index) {
      layer.close(index);
      let layerContent = dom.find('.layui-layer-content');
      if (layerContent.children.length == 1) {
        opt.success(dom.find('.layui-layer-content').children[0]);
      } else {
        opt.success(dom.find('.layui-layer-content').children);
      }
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
      <img class="m-auto" src="img/nodata.png" width="60%">
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

function Tabs(opts) {
  this.navigator = dom.find(opts.navigatorId);
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
    tab.style += 'min-width: ' + (tab.text.length * 16 + 32) + 'px;text-align: center;';
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

/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function Numpad(opt) {
  this.unit = opt.unit || '';
  this.regex = opt.regex || /.*/;
  this.success = opt.success || function (val) {};
  this.type = opt.type || 'decimal';
}

Numpad.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom numpad in">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="confirm">确认</button>
        </div>
        <div class="d-flex flex-wrap full-width">
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">1</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">2</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">3</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">4</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">5</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">6</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">7</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">8</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">9</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button widget-id="buttonSpecial" class="number">.</button>
          </div>
          <div class="col-24-08" style="line-height: 48px;">
            <button class="number">0</button>
          </div>
          <div class="col-24-08" style="line-height: 48px; font-size: 24px;">
            <button class="number">
              <i class="fas fa-backspace" style="font-size: 20px;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `, this);
  this.bottom = dom.find('.popup-bottom', ret);
  // this.audio = new Audio('img/keypressed.wav');
  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let value = dom.find('.value', ret);
  let special = dom.find('[widget-id=buttonSpecial]', ret);

  if (this.type == 'id') {
    special.innerText = 'X';
    this.regex = /^.{0,18}$/;
  } else if (this.type == 'mobile') {
    special.remove();
    this.regex = /^.{0,11}$/;
  }

  let numbers = ret.querySelectorAll('.number');
  for (let i = 0; i < numbers.length; i++) {
    let num = numbers[i];
    dom.bind(num, 'click', ev => {
      let str = value.innerText;
      let text = ev.currentTarget.innerText;
      if (text == '') {
        if (str === '') return;
        str = str.substr(0, str.length - 1);
      } else {
        if (this.regex.test(str + text)) {
          str += text;
        }
      }
      value.innerText = str;
    });
    // dom.bind(num, 'touchstart', ev => {
    //   this.audio.src= 'img/keypressed.wav';
    //   this.audio.play();
    // });
    // dom.bind(num, 'touchend', ev => {
    //   // this.audio.pause();
    // });
  }

  dom.bind(mask, 'click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(confirm, 'click', ev => {
    this.success(value.innerText);
    this.close();
  });
  return ret;
};

Numpad.prototype.show = function(container) {
  container.appendChild(this.root());
};

Numpad.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};

/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function DistrictPicker(opt) {
  this.unit = opt.unit || '';
  this.regex = opt.regex || /.*/;
  this.success = opt.success || function (vals) {};
  this.selections = opt.selections || {};
}

DistrictPicker.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom district-picker">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="confirm">确认</button>
        </div>
        <div class="bottom-dialog-body">
          <div style="padding: 4px 16px">
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetProvince" class="font-16">选择省份</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetCity" class="font-16">选择城市</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetCounty" class="font-16">选择区县</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetTown" class="font-16">选择街道/乡镇</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
          </div>
          <div style="border-top: 1px solid var(--color-divider);"></div>
          <ul widget-id="widgetDistrict" class="list-group" style="height: 240px; overflow-y: auto;">
          </ul>
        </div>
      </div>
    </div>
  `, this);
  this.bottom = dom.find('.popup-bottom', ret);
  this.district = dom.find('[widget-id=widgetDistrict]', ret);
  this.province = dom.find('[widget-id=widgetProvince]', ret);
  this.city = dom.find('[widget-id=widgetCity]', ret);
  this.county = dom.find('[widget-id=widgetCounty]', ret);
  this.town = dom.find('[widget-id=widgetTown]', ret);

  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let value = dom.find('.value', ret);

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  if (this.selections.province) {
    this.province.setAttribute('data-model-chinese-district-code', this.selections.province.chineseDistrictCode);
    this.province.innerText = this.selections.province.chineseDistrictName;
  }
  if (this.selections.city) {
    this.city.setAttribute('data-model-chinese-district-code', this.selections.city.chineseDistrictCode);
    this.city.innerText = this.selections.city.chineseDistrictName;
  }
  if (this.selections.county) {
    this.county.setAttribute('data-model-chinese-district-code', this.selections.county.chineseDistrictCode);
    this.county.innerText = this.selections.county.chineseDistrictName;
  }
  if (this.selections.town) {
    this.town.setAttribute('data-model-chinese-district-code', this.selections.town.chineseDistrictCode);
    this.town.innerText = this.selections.town.chineseDistrictName;
  }

  dom.bind(confirm, 'click', ev => {
    let vals = {};
    let provinceCode = this.province.getAttribute('data-model-chinese-district-code');
    let cityCode = this.city.getAttribute('data-model-chinese-district-code');
    let countyCode = this.county.getAttribute('data-model-chinese-district-code');
    let townCode = this.town.getAttribute('data-model-chinese-district-code');
    if (provinceCode != '') {
      vals.province = {chineseDistrictCode: provinceCode, chineseDistrictName: this.province.innerText,};
    }
    if (cityCode != '') {
      vals.city = {chineseDistrictCode: cityCode, chineseDistrictName: this.city.innerText,};
    }
    if (countyCode != '') {
      vals.county = {chineseDistrictCode: countyCode, chineseDistrictName: this.county.innerText,};
    }
    if (townCode != '') {
      vals.town = {chineseDistrictCode: townCode, chineseDistrictName: this.town.innerText,};
    }
    this.success(vals);
    this.close();
  });

  let onSelectionClicked = ev => {
    let div = dom.ancestor(ev.target, 'div');
    let strong = dom.find('strong', div);
    let chineseDistrictCode = strong.getAttribute('data-model-chinese-district-code');
    if (chineseDistrictCode.length == 9) {
      this.renderDistrict(chineseDistrictCode.substr(0, 6));
    } else {
      this.renderDistrict(chineseDistrictCode.substr(0, chineseDistrictCode.length - 2));
    }
  }

  dom.bind(this.province.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });
  dom.bind(this.city.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });
  dom.bind(this.county.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });
  dom.bind(this.town.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });

  setTimeout(() => {
    this.bottom.classList.add('in');
  }, 50);
  return ret;
};

DistrictPicker.prototype.renderDistrict = async function(districtCode) {
  let andCondition = null;
  let elDistrict = null;
  if (!districtCode) {
    andCondition = `
      and length(chndistcd) = 2
    `;
    elDistrict = this.province;
    this.city.setAttribute('data-model-chinese-district-code', '');
    this.city.innerText = '选择城市';
    this.county.setAttribute('data-model-chinese-district-code', '');
    this.county.innerText = '选择区县';
    this.town.setAttribute('data-model-chinese-district-code', '');
    this.town.innerText = '选择街道/乡镇';
  } else if (districtCode.length == 2) {
    andCondition = `
      and length(chndistcd) = 4 and substring(chndistcd, 1, 2) = '${districtCode}'
    `;
    elDistrict = this.city;
    this.county.setAttribute('data-model-chinese-district-code', '');
    this.county.innerText = '选择区县';
    this.town.setAttribute('data-model-chinese-district-code', '');
    this.town.innerText = '选择街道/乡镇';
  } else if (districtCode.length == 4) {
    andCondition = `
      and length(chndistcd) = 6 and substring(chndistcd, 1, 4) = '${districtCode}'
    `;
    elDistrict = this.county;
    this.town.setAttribute('data-model-chinese-district-code', '');
    this.town.innerText = '选择街道/乡镇';
  } else if (districtCode.length == 6) {
    andCondition = `
      and length(chndistcd) = 9 and substring(chndistcd, 1, 6) = '${districtCode}'
    `;
    elDistrict = this.town;
  } else {
    return;
  }
  let districts = await xhr.promise({
    url: "/api/v3/common/script/stdbiz/gb/chinese_district/find",
    params: {
      _and_condition: andCondition,
      _order_by: 'convert(chndistnm using gbk) asc',
    },
  });
  this.district.innerHTML = '';
  for (let i = 0; i < districts.length; i++) {
    let district = districts[i];
    let el = dom.templatize(`
      <li class="list-group-item">{{chineseDistrictName}}</li>
    `, district);
    dom.model(el, district);
    dom.bind(el, 'click', ev => {
      let li = dom.ancestor(ev.target, 'li');
      let model = dom.model(li);
      elDistrict.innerText = model.chineseDistrictName;
      elDistrict.setAttribute('data-model-chinese-district-code', model.chineseDistrictCode);
      this.renderDistrict(model.chineseDistrictCode);
    });
    this.district.appendChild(el);
  }
};

DistrictPicker.prototype.show = function(container) {
  container.appendChild(this.root());
  this.renderDistrict();
};

DistrictPicker.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};

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

/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function CascadePicker(opt) {
  this.success = opt.success || function (vals) {};
  this.selections = opt.selections || {};
  this.levels = opt.levels;
}

CascadePicker.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom district-picker">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="confirm">确认</button>
        </div>
        <div>
          <div widget-id="widgetLevel" style="padding: 4px 16px">
          </div>
          <div style="border-top: 1px solid var(--color-divider);"></div>
          <ul widget-id="widgetValue" class="list-group" style="height: 240px; overflow-y: auto;">
          </ul>
        </div>
      </div>
    </div>
  `, this);
  this.bottom = dom.find('.popup-bottom', ret);
  this.widgetLevel = dom.find('[widget-id=widgetLevel]', ret);
  this.widgetValue = dom.find('[widget-id=widgetValue]', ret);

  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);

  let onSelectionClicked = ev => {
    let div = dom.ancestor(ev.target, 'div');
    let strong = dom.find('strong', div);
    let level = parseInt(strong.getAttribute('data-cascade-level'));
    let value = strong.getAttribute('data-cascade-value');
    let name = strong.getAttribute('data-cascade-name');
    let params = null;

    let  elPrev = dom.find('[data-cascade-level="' + (level - 1) + '"]', this.widgetLevel);
    if (elPrev != null) {
      let prevValue = elPrev.getAttribute('data-cascade-value');
      let prevName = elPrev.getAttribute('data-cascade-name');
      params = {};
      params[prevName] = prevValue;
    }
    this.renderValue(level, params);

    for (let i = level + 1; i < this.levels.length; i++) {
      let  elNext = dom.find('[data-cascade-level="' + i + '"]', this.widgetLevel);
      elNext.setAttribute('data-cascade-value', '');
      elNext.innerText = this.levels[i].placeholder;
    }
  }

  for (let i = 0; i < this.levels.length; i++) {
    let el = dom.templatize(`
      <div class="d-flex" style="line-height: 40px;">
        <strong data-cascade-level="${i}" data-cascade-name="{{name}}" class="font-16">{{placeholder}}</strong>
        <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
      </div>
    `, this.levels[i]);
    this.widgetLevel.appendChild(el);

    dom.bind(el, 'click', ev => {
      onSelectionClicked(ev);
    });
  }

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(confirm, 'click', ev => {
    let strongs = dom.find('strong', this.widgetLevel);
    let vals = {};
    for (let i = 0; i < strongs.length; i++) {
      let strong = strongs[i];
      let model = dom.model(strong);
      vals[strong.getAttribute('data-cascade-name')] = model;
    }
    this.success(vals);
    this.close();
  });

  setTimeout(() => {
    this.bottom.classList.add('in');
  }, 50);
  return ret;
};

CascadePicker.prototype.renderValue = async function(level, params, selected) {
  let elLevel = dom.find('[data-cascade-level="' + level + '"]', this.widgetLevel);
  if (elLevel == null) {
    return;
  }
  let optLevel = this.levels[level];
  this.widgetValue.innerHTML = '';

  if (!optLevel.url) {
    return;
  }
  if (typeof optLevel.params === 'function') {
    params = optLevel.params(params);
  } else {
    params = optLevel.params;
  }
  let rows = await xhr.promise({
    url: optLevel.url,
    params: params,
  });
  for (let i = 0; i < rows.length; i++) {
    let data = {
      value: rows[i][optLevel.fields.value],
      text: rows[i][optLevel.fields.text],
    };
    let el = dom.templatize(`
      <li class="list-group-item" data-cascade-value="{{value}}">{{text}}</li>
    `, data);
    dom.model(el, rows[i]);
    dom.bind(el, 'click', ev => {
      let li = dom.ancestor(ev.target, 'li');
      let model = dom.model(li);
      elLevel.innerText = model[optLevel.fields.text];
      elLevel.setAttribute('data-cascade-value', model[optLevel.fields.value]);
      dom.model(elLevel, model);
      let newParams = {};
      newParams[optLevel.fields.value] = model[optLevel.fields.value];
      this.renderValue(level + 1, newParams, model);
    });
    this.widgetValue.appendChild(el);
  }
};

CascadePicker.prototype.show = function(container) {
  container.appendChild(this.root());
  this.renderValue(0);
};

CascadePicker.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};

function ActionSheet(opt) {
  this.title = opt.title || '';
  this.actions = opt.actions || [];
}

ActionSheet.prototype.root = function() {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom" style="background: transparent;">
        <div class="action-sheet">
          <div class="title">{{title}}</div>
          <div class="actions"></div>
          <div class="cancel">取消</div>
        </div>
      </div>
    </div>
  `, this);

  this.bottom = dom.find('.popup-bottom', ret);
  let cancel = dom.find('.cancel', ret);
  let mask = dom.find('.popup-mask', ret);
  let actions = dom.find('.actions', ret);

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  for (let i = 0; i < this.actions.length; i++) {
    let action = dom.templatize(`
      <div class="action">{{text}}</div>
    `, this.actions[i]);
    dom.bind(action, 'click', ev => {
      this.close();
      this.actions[i].onClick(ev);
    });
    if (i == this.actions.length - 1) {
      action.classList.add('last');
    }
    actions.appendChild(action);
  }
  this.bottom.classList.add('in');

  setTimeout(() => {
    this.bottom.style.bottom = '0';
  }, 300);

  return ret;
};

ActionSheet.prototype.show = function (container) {
  container.appendChild(this.root());
};

ActionSheet.prototype.close = function () {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};

function Weekdays(opt) {
  opt = opt || {};
  this.today = moment(new Date());
  this.days = opt.days || 14;
}

Weekdays.prototype.root = function() {
  let ret = dom.templatize(`
    <div class="swiper weekly">
      <div class="swiper-wrapper">
      </div>
    </div>
  `, {});
  let wrapper = dom.find('.swiper-wrapper', ret);
  let dates = [];
  for (let i = 0; i < this.days; i++) {
    let date = moment(this.today).add(i, 'days');
    let day = date.day();
    if (day == 1) {
      day = '一';
    } else if (day == 2) {
      day = '二';
    } else if (day == 3) {
      day = '三';
    } else if (day == 4) {
      day = '四';
    } else if (day == 5) {
      day = '五';
    } else if (day == 6) {
      day = '六';
    } else {
      day = '日';
    }
    let slide = dom.element('<div class="swiper-slide d-flex" style="width: calc(100% / 7)"></div>');
    let el = dom.templatize(`
      <div class="weekday pb-2" data-date="{{fulldate}}">
        <span class="day">{{day}}</span>
        <span class="date">{{date}}</span>
      </div>
    `, {
      day: day,
      date: date.format('DD'),
      fulldate: date.format('YYYY-MM-DD'),
    });
    if (i == 0) {
      el.classList.add('active');
    }
    slide.appendChild(el);
    wrapper.appendChild(slide);

    dom.bind(el, 'click', ev => {
      let wds = ret.querySelectorAll('.weekday');
      wds.forEach(wd => {
        wd.classList.remove('active');
      })
      el.classList.add('active');
    });
  }

  let swiper = new Swiper(ret, {
    speed: 400,
    slidesPerView: 7,
    loop: false,
  });
  return ret;
};

Weekdays.prototype.render = function(containerId) {
  let container = dom.find(containerId);
  container.appendChild(this.root());
};

/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function PopupRuler(opt) {
  this.unit = opt.unit || '';
  this.regex = opt.regex || /.*/;
  this.success = opt.success || function (val) {};
  this.type = opt.type || 'decimal';
  this.value = opt.value;
  this.range = opt.range;
}

PopupRuler.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom in">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="confirm">确认</button>
        </div>
        <div class="popup-content" style="height: 200px; width: 100%;"></div>
      </div>
    </div>
  `, this);

  this.bottom = dom.find('.popup-bottom', ret);
  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let value = dom.find('.value', ret);

  dom.bind(mask, 'click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(confirm, 'click', ev => {
    this.success(value.innerText);
    this.close();
  });

  return ret;
};

PopupRuler.prototype.show = function(container) {
  let root = this.root();
  container.appendChild(root);

  let content = dom.find('.popup-content', root);
  let value = dom.find('.value', root);
  value.innerText = this.value;
  ruler.initPlugin({
    el: content, //容器id
    startValue: this.value,
    maxScale: this.range[1], //最大刻度
    region: [this.range[0], this.range[1]], //选择刻度的区间范围
    background: "#fff",
    color: "#E0E0E0", //刻度线和字体的颜色
    markColor: "#73B17B", //中心刻度标记颜色
    isConstant: true, //是否不断地获取值
    success: res => {
      value.innerText = res;
    }
  });
};

PopupRuler.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};
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

flutter = {};

flutter.log = (data) => {
  if (!window.print) return;
  print.postMessage(data);
};
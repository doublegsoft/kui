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
        console.log(msg);
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
          '  <img width="48" height="48" src="img/kui/nodata.png" class="mb-2" style="opacity: 25%;">' +
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

PaginationGrid.skeleton = function() {
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
  let ul = dom.create('ul', 'list-group', 'full-width');
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
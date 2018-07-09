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
ajax.save = function(url, form, callback) {
  var errors = form.validate();
  var errmsg = '';
  for (var i = 0; i < errors.length; i++) {
    errmsg += errors[i].message + '<br>';
  }
  if (errmsg != '') {
    dialog.error(errmsg);
    return;
  }
  var data = form.formdata();
  $.ajax({
    url : url,
    data : data,
    method : 'POST',
    dataType : 'json',
    success : function(resp) {
      if (typeof resp.error !== 'undefined') {
        dialog.error('保存出错！');
        return;
      }
      dialog.success('保存成功！');
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
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
ajax.post = function(url, data, callback) {
  $.ajax({
    url : url,
    data : data,
    method : 'POST',
    dataType : 'json',
    success : function(resp) {
      if (typeof resp.error !== 'undefined') {
        dialog.error('请求出错！');
        return;
      }
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
    }
  });
};

ajax.get = function(url, data, callback) {
  $.ajax({
    url : url,
    data : data,
    dataType : 'json',
    success : function(resp) {
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
    }
  });
};

ajax.view = function(url, cntr, data, callback) {
  if (typeof data === 'undefined')
    data = {};
  $.ajax({
    url : url,
    data : data,
    success : function(resp) {
      if (cntr) {
        cntr.empty();
        cntr.html(resp);
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
ajax.dialog = function(title, url, data, width, height, callback) {
  $.ajax({
    url : url,
    data : data,
    async : false,
    success : function(html) {
      layer.open({
        type : 1,
        title : title,
        shadeClose : false,
        skin : 'layui-layer-rim', //加上边框
        area : [ width + 'px', height + 'px' ], //宽高
        content : html,
        end: callback || function () {}
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
ajax.upload = function(url, data, onSuccess, onProgress, onError) {
  if (typeof data === 'undefined')
    data = {};
  var formdata = new FormData();
  for (var k in data) {
    formdata.append(k, data[k]);
  }
  $.ajax({
    url : url,
    data : formdata,
    method : 'POST',
    cache: false,
    contentType : false,
    processData : false,
    xhr: function() {
      var ret = $.ajaxSettings.xhr();
      if(ret.upload && onProgress){
        ret.upload.addEventListener('progress', function(e) {
          if(e.lengthComputable){
            if (onProgress)
              onProgress(e.total, e.loaded);
          }  
        }, false);
      }
      return ret;
    },
    success: function(resp) {
      if (onSuccess)
        onSuccess(resp);
    },
    error: function(resp) {
      if (onError)
        onError(resp);
    }
  });
};
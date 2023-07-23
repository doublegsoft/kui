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

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
  this.containerId = options.containerId;
  this.properties = options.properties || [];
  this.confirm = options.confirm || function () {};
  this.selected = null;
}

/**
 * 在父容器下渲染属性编辑器。
 * 
 * @since 1.0
 */
PropertiesEditor.prototype.render = function() {
  var self = this;
  var form = $('<div class="form"></div>');
  for (var i = 0; i < this.properties.length; i++) {
    var prop = this.properties[i];
    var formItem = $('<div class="form-group"></div>');
    
    var label = $('<label></label>');
    label.text(prop.label);
    formItem.append(label);

    var input = $('<input>');
    input.attr('name', prop.id);
    input.addClass('form-control');
    input.attr('pe-prop-id', prop.id);
    if (prop.readonly) {
      input.prop('readonly', true);
    } else {
      input.on('keyup', function(ev) {
        var input = $(ev.target);
        var propId = input.attr('pe-prop-id')
        if (self.selected && self.selected[propId]) {
          self.selected[propId] = input.val();
        }
      });
    }
    
    if (prop.input == 'dialog') {
      var inputGroup = $('<div class="input-group"></div>');
      var link = $(
          '<span class="input-group-append">' + 
          '  <span class="input-group-text" style="padding: 0;">' +
          '    <a class="btn btn-sm btn-link" href="javascript:void(0);">设置</a>' + 
          '  </span>' + 
          '</span>');
      link.find('a.btn-link').attr('pe-prop-id', prop.id);
      link.find('a.btn-link').on('click', function(ev) {
        var link = $(ev.target);
        var propId = link.attr('pe-prop-id')
        if (self.selected && self.selected[propId]) {
          for (var i = 0; i < self.properties.length; i++) {
            var prop = self.properties[i];
            if (prop.id == propId) {
              self.openDialog(prop);
            }
          }
        }
      });
      inputGroup.append(input);
      inputGroup.append(link);
      formItem.append(inputGroup);
    } else {
      formItem.append(input);
    }
    form.append(formItem);
  }

  $('#' + this.containerId).empty();
  $('#' + this.containerId).append(form);
};

/**
 * 设置当前编辑的对象实例。
 * 
 * @param {object} obj
 *        当前编辑的对象实例，实例的定义由设计器来决定
 */
PropertiesEditor.prototype.setSelected = function (obj) {
  this.selected = obj;
  for (var i = 0; i < this.properties.length; i++) {
    var prop = this.properties[i];
    // 通过判断对象是否含有
    if (obj && obj[prop.id]) {
      $('#' + this.containerId + ' input[name=' + prop.id + ']').val(prop.display(obj));
    } else {
      $('#' + this.containerId + ' input[name=' + prop.id + ']').val('');
    }
  }
};

/**
 * 打开设置对话框。
 * 
 * @param {object} parentProp
 *        含有子属性的属性
 */
PropertiesEditor.prototype.openDialog = function (parentProp) {
  if (!this.selected) return;
  var self = this;

  var dialog = $('<div class="row" style="margin-top: 15px; padding: 0 15px 0 15px"></div>');
  var col12 = $('<div class="col-md-12"></div>');
  var form = $('<div class="form form-horizontal"></div>');

  dialog.append(col12);
  col12.append(form);

  var buttons = $(
    '<div class="button-group float-right">' + 
    '  <button class="btn btn-sm btn-confirm">确认</button>' + 
    '  <button class="btn btn-sm btn-close" onclick="layer.close(layer.index);">关闭</button>' + 
    '</div>'
  );
  buttons.find('.btn-confirm').on('click', function () {
    self.confirmDialog();
  });
  var height = 110;
  for (var i = 0; i < parentProp.properties.length; i++) {
    var prop = parentProp.properties[i];
    var formItem = $('<div class="form-group row"></div>');
    var col9 = $('<div class="col-md-9"></div>');

    var group = $('<div class="input-group"></div>');
    var unit = $(
      '<div class="input-group-append">' + 
      '  <span class="input-group-text">' + prop.unit + '</span>' + 
      '</div>'
    );

    var label = $('<label class="col-form-label col-md-3"></label>');
    label.text(prop.label + '：');

    var input = $('<input>');
    input.attr('name', prop.id);
    input.addClass('form-control');
    input.attr('pe-prop-id', prop.id);
    // input.on('keyup', function(ev) {
    //   var input = $(ev.target);
    //   var propId = input.attr('pe-prop-id')
    //   if (self.selected && self.selected[propId]) {
    //     self.selected[propId] = input.val();
    //   }
    // });
    input.val(this.selected[prop.id]);
    if (prop.unit) {
      col9.append(group);
      group.append(input);
      group.append(unit);
    } else {
      col9.append(input);
    }

    formItem.append(label);
    formItem.append(col9);

    form.append(formItem);
    // 行高，包括margin
    height += 52.5;
  }
  form.append(buttons);

  layer.open({
    type : 1,
    title : parentProp.label + '属性编辑',
    shadeClose : false,
    skin : 'layui-layer-rim', //加上边框
    area : [ 480 + 'px', height + 'px' ], //宽高
    content : '<div id="dialog"></div>',
    success: function () {
      // 重新设置样式
      var layerContent = document.querySelector('.layui-layer-content');
      layerContent.style += '; overflow: hidden;';
      
      // 加载对话框的JQuery对象
      $('#dialog').append(dialog);
    },
    end: function () {}
  });

};

/**
 * 设置对话框确认修改。
 */
PropertiesEditor.prototype.confirmDialog = function () {
  var self = this;
  $('#dialog input').each(function(idx, el) {
    var input = $(el);
    var propId = input.attr('pe-prop-id');
    if (self.selected && self.selected[propId]) {
      self.selected[propId] = parseInt(input.val());
    }
  }); 
  layer.close(layer.index);
  self.confirm();
}
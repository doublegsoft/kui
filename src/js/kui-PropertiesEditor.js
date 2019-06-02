
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
 *   2.5. handle      如果为input为dialog，点击【设置】按钮触发的函数
 *   2.6. display     属性在输入框中的显示内容
 * 
 * @param {object} options
 *        属性编辑器的构造参数
 * 
 * @since 1.0
 */
function PropertiesEditor(options) {
  this.containerId = options.containerId;
  this.properties = options.properties || [];
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
      link.find('a.btn-link').on('click', prop.handle);
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
 * 
 */
PropertiesEditor.prototype.openDialog = function (prop) {

};
function MultiSelect(opts) {
  this.contextPath = opts.contextPath || '';
  this.sqlId = opts.sqlId;
  this.groupIdKey = opts.groupIdKey;
  this.groupTextKey = opts.groupTextKey;
  this.idKey = opts.idKey;
  this.textKey = opts.textKey;
  this.fieldName = opts.fieldName;
  this.template = 
    '<div id="any-selector-container" class="list-group">' + 
    '  {{#each data}}' + 
    '  <div class="list-group-item"><b>{{text}}</b></div>' +
    '    {{#each children}}' +
    '    <a class="list-group-item list-group-item-action" cd={{id}} text="{{text}}" href="#">' +
    '      <input type="checkbox" class="form-checkbox" style="font-size: 16px; margin-right: 12px;">' +
    '      <label style="cursor: pointer">{{text}}</label>' +
    '    </a>' +
    '    {{/each}}' +
    '  {{/each}}' +
    '</div>';
}

MultiSelect.prototype.render = function(containerId, params) {
  var self = this;
  var httpParams = {};
  for (var k in params) {
    httpParams[k] = params[k];
  }
  
  httpParams.sqlId = this.sqlId;
  httpParams.groupIdKey = this.groupIdKey;
  httpParams.groupTextKey = this.groupTextKey;
  httpParams.idKey = this.idKey;
  httpParams.textKey = this.textKey;
  
  var button = $('<button class="btn btn-link float-right" style="text-decoration: none"><i class="icon-plus icons font-2xl"></i></button>');
  button.on('click', function(e) {
    e.preventDefault();
    ajax.get(self.contextPath + '/data/common/group.do', httpParams, function(resp) {
      var source = self.template;
      var template = Handlebars.compile(source);
      var html = template(resp);
      
      layer.open({
        type : 1,
        title : '',
        shadeClose : true,
        skin : 'layui-layer-rim', //加上边框
        area : [ 400 + 'px', 600 + 'px' ], //宽高
        content : html,
        success: function() {
          
          var selected = [];
          $('#' + containerId).find('span').each(function(idx, elm) {
            if ($(elm).attr('cd') != '') 
              selected.push($(elm).attr('cd'));
          });
          
          $('#any-selector-container').find('a').each(function(idx, elm) {
            for (var i = 0; i < selected.length; i++) {
              if (selected[i] == $(elm).attr('cd')) {
                $(elm).find('input').prop('checked', true);
              }
            }
            $(elm).on('click', function() {
              var checkbox = $(elm).find('input');
              if (checkbox.prop('checked')) {
                checkbox.prop('checked', false);
              } else {
                checkbox.prop('checked', true);
              }
              
              var cd = $(this).attr('cd');
              var text = $(this).attr('text');
              
              if (checkbox.prop('checked')) {
                var badge = $('<span cd="' + cd + '" class="badge badge-info badge-pill">' + text + '</span>');
                var remove = $('<button class="btn btn-sm btn-link"><i class="fa fa-remove"></i></button>');
                var hidden = $('<input type="hidden" name="' + self.fieldName + '" value="' + cd + '">');
                remove.on('click', function(e) {
                  e.preventDefault();
                  $(this).parent().remove();
                });
                badge.append(remove);
                badge.append(hidden);
                badge.insertBefore(button);
              } else {
                $('#' + containerId).find('span[cd="' + cd + '"]').remove();
              }
            });
          });
        }
      });
    });
  });
  $('#' + containerId).append(button);
};
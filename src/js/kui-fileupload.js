function FileUpload(opts) {
  this.contextPath = opts.contextPath;
  this.directoryKey = opts.directoryKey;
  this.label = opts.label || '附件';
  this.template = 
    '<label class="col-md-3 col-form-label" for="text-input">' + this.label + '</label>' +
    '  <div class="col-md-9">' +
    '    <div class="float-right">' +
    '      <label class="file-upload btn btn-sm btn-info" style="color: white; cursor: pointer">上传文档' +
    '        <input name="fileupload_doc" id="fileupload_doc" type="file">' +
    '      </label>' +
    '    </div>' +
    '  </div>' +
    '  <div class="progress mb-3" style="height: 3px; width: 95%; margin-left: 15px;">' +
    '    <div id="progress-upload" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>' +
    '  </div>' +
    '  <div class="col-md-12">' +
    '    <ul id="fileupload_doc_list" class="icons-list">' +
    '    </ul>' +
    '  </div>';
  
  this.itemTemplate = 
    '      <li flcd="{{flcd}}">' +
    '        <i class="fa fa-file-text-o bg-info"></i>' +
    '        <div class="desc">' +
    '          <div class="title">{{flnm}}</div>' +
    '        </div>' +
    '        <div class="actions">' +
    '          <button flcd="{{flcd}}" type="button" class="btn btn-link text-muted text-red" style="font-size: 18px; text-decoration: none">' +
    '            <i class="fa fa-remove"></i>' +
    '          </button>' +
    '        </div>' +
    '        <input name="flcds[]" type="hidden" value="{{flcd}}">' + 
    '      </li>';
};

FileUpload.prototype.render = function(containerId, params) {
  var self = this;
  var source = this.template;
  var template = Handlebars.compile(source);
  var html = template({});
  $('#' + containerId).append(html);
  
  this.initialize(params);
  if (params.relcd == '') return;
  ajax.get(this.contextPath + '/data/km/doc/find.do', params, function(resp) {
    if (resp.errorMessage) return;
    for (var i = 0; i < resp.data.length; i++) {
      var doc = resp.data[i];
      self.addFileItem(doc.fl); 
    }
  })
};

FileUpload.prototype.initialize = function(params) {
  var self = this;
  var httpParams = {
    directoryKey: this.directoryKey
  };
  for (var k in params) {
    httpParams[k] = params[k];
  }
  $('#fileupload_doc').on('change', function() {
    // $('#btn_save').prop('disabled', true);
    var uploadingFile = $(this)[0].files[0];
    httpParams.file = uploadingFile;
    ajax.upload(self.contextPath + '/data/fs/file/upload.do', httpParams, function(resp) {
      if (resp.errmsg) {
        dialog.error("文件上传出现错误！");
        return;
      }
      // 列表显示上传文件
      self.addFileItem(resp);
      // $('#btn_save').prop('disabled', false);
    }, function(total, loaded) {
      var percentage = (loaded * 100) / total;
      $('#progress-upload').css('width', percentage + '%');
      $('#progress-upload').attr('aria-valuenow', percentage);

      if (percentage >= 100) {
        $('#progress-upload').css('width', '100%');
        $('#progress-upload').attr('aria-valuenow', '100');
      }
    });
  });
};

FileUpload.prototype.addFileItem = function(fl) {
  var self = this;
  var source = this.itemTemplate;
  var template = Handlebars.compile(source);
  var html = template(fl);
  $('#fileupload_doc_list').append(html);
  
  $('#fileupload_doc_list button.btn-link').on('click', function() {
    var flcd = $(this).attr('flcd');
    $(this).parent().parent().remove();
  });
};
function FileUpload(opts) {
  this.contextPath = opts.contextPath;
  this.directoryKey = opts.directoryKey;
  this.uploadUrl = opts.uploadUrl;
  this.downloadUrl = opts.downloadUrl;
  this.label = opts.label || '附件';
  this.template = 
    // '<label class="col-md-3 col-form-label" for="text-input">' + this.label + '</label>' +
    '  <div class="row">' +
    '    <div class="col-md-12">' +
    '      <label class="file-upload btn btn-sm btn-info" style="color: white; cursor: pointer">上传文档' +
    '        <input name="fileupload_doc" id="fileupload_doc" type="file">' +
    '      </label>' +
    '    </div>' +
    '  </div>' +
    '  <div class="progress mb-3" style="height: 3px; width: 100%;">' +
    '    <div id="progress-upload" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>' +
    '  </div>' +
    '  <div class="row">' +
    '    <div class="col-md-12">' +
    '      <ul id="fileupload_doc_list" class="list-group" style="width: 100%">' +
    '      </ul>' +
    '    </div>' + 
    '  </div>';
  
  this.itemTemplate = 
    '      <li class="list-group-item" style="padding: 0">' +
    // '        <i class="fa fa-file-text-o bg-info"></i>' +
    '        <a class="btn btn-link" href="{{uri}}" target="_blank">{{uri}}</a>' +
    '        <button class="btn btn-link float-right"><i class="fa fa-trash-alt" style="color: #f86c6b;"></i></button>'
    // '        <div class="float-right">' +
    // '          <button type="button" class="btn btn-link text-muted text-red" style="font-size: 15px; text-decoration: none">' +
    // '            <i class="fa fa-remove"></i>' +
    // '          </button>' +
    // '        </div>' +
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
  ajax.get(this.downloadUrl, params, function(resp) {
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
    // directoryKey: this.directoryKey
  };
  for (var k in params) {
    httpParams[k] = params[k];
  }
  $('#fileupload_doc').on('change', function() {
    // $('#btn_save').prop('disabled', true);
    var uploadingFile = $(this)[0].files[0];
    httpParams.file = uploadingFile;
    ajax.upload(self.uploadUrl, httpParams, function(resp) {
      if (resp.errmsg) {
        dialog.error("文件上传出现错误！");
        return;
      }
      console.log(resp);
      // 列表显示上传文件
      self.addFileItem(JSON.parse(resp));
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
    $(this).parent().remove();
  });
};
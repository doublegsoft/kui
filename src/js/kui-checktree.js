
$.fn.checktree = function(opts) {
  let setting = {
    check: {
      enable: true,
      chkboxType: {
        "Y": "ps",
        "N": "ps"
      }
    },
    data: {
      simpleData: {
        enable: true,
        idKey: opts.fields.id,
        pIdKey: opts.fields.parentId
      },
      key: {
        name: opts.fields.name
      }
    }
  };
  let self = this;
  xhr.post({
    url: opts.url,
    data: opts.data,
    success: function (resp) {
      opts.tree = $.fn.zTree.init(self, setting, resp.data);
    }
  })
};

function OfficialForm(opt) {

}

OfficialForm.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
};

OfficialForm.prototype.toPdf = function () {
  let html = this.container.innerHTML;
  xhr.promise({
    url: '/api/v3/common/script/misc/pdf/export',
    content: html,
  }).then(resp => {

  });
};

OfficialForm.prototype.toDocx = function () {
  let html = this.container.innerHTML;
  xhr.promise({
    url: '/api/v3/common/script/misc/docx/export',
    content: html,
  }).then(resp => {

  });
};
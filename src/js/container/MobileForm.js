
function MobileForm(opts) {
  let self = this;
  this.fields = opts.fields;
  this.readonly = opts.readonly || false;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
}

MobileForm.prototype.render = async function (container) {
  let root = await this.root();
  container.appendChild(root);
};

MobileForm.prototype.root = async function() {
  let ret = dom.element(`
    <div class="form form-horizontal"></div>
  `);
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    let el = null;
    if (field.input === 'date') {
      el = this.buildDate(field);
    } else if (field.input === 'select') {
      el = await this.buildSelect(field);
    } else if (field.input === 'hidden') {
      el = dom.templatize(`
        <input type="hidden" name="{{name}}">
      `, field);
    } else {
      el = dom.templatize(`
        <div class="form-group row">
          <label class="col-form-label col-24-06">{{title}}</label>
          <div class="col-24-18">
            <input type="text" name="{{name}}" class="form-control">
          </div>
        </div>
      `, field);
    }
    ret.appendChild(el);
  }
  return ret;
};

MobileForm.prototype.buildDate = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <label class="col-form-label"></label>
        <input type="hidden" name="{{name}}">
        <span class="ml-auto material-icons font-16 position-relative" style="top: 5px; left: -2px;">calendar_today</span>
      </div>
    </div>
  `, field);
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      confirm: date => {
        dom.find('label', ev.target).innerHTML = moment(date).format('YYYY年MM月DD日');
        dom.find('input', ev.target).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
      },
    });
    rd.show();
  });
  return ret;
};

MobileForm.prototype.buildSelect = async function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <label class="col-form-label"></label>
        <input type="hidden" name="{{name}}">
        <span class="ml-auto material-icons font-20 position-relative" style="top: 3px;">expand_more</span>
      </div>
    </div>
  `, field);
  let values = field.values;
  if (!values && field.url) {
    let data = await xhr.promise({
      url: field.url,
      params: {},
    });
    values = [];
    for (let i = 0; i < data.length; i++) {
      values.push({
        text: data[i][field.textField],
        value: data[i][field.valueField],
      });
    }
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      format: 'oo',
      values: values,
      confirm: data => {
        dom.find('label', ev.target).innerHTML = data.text;
        dom.find('input', ev.target).value = data.value;
      },
    });
    rd.show();
  });
  return ret;
};
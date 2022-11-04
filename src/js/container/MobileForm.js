
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
    } else if (field.input === 'mobile') {
      el = this.buildMobile(field);
    } else if (field.input === 'id') {
      el = this.buildId(field);
    } else if (field.input === 'district') {
      el = this.buildDistrict(field);
    } else {
      el = dom.templatize(`
        <div class="form-group row">
          <label class="col-form-label col-24-06">{{title}}</label>
          <div class="col-24-18">
            <input type="text" name="{{name}}" class="form-control" placeholder="请填写">
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
        <input type="text" class="form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="ml-auto material-icons font-16 position-relative" style="top: 5px; left: -2px;">calendar_today</span>
      </div>
    </div>
  `, field);
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      confirm: date => {
        let row = dom.ancestor(ev.target, 'div', 'col-24-18');
        dom.find('input[type=text]', row).value = moment(date).format('YYYY年MM月DD日');
        dom.find('input[type=hidden]', row).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
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
        <input type="text" class="form-control" readonly placeholder="请选择...">
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
        let row = dom.ancestor(ev.target, 'div', 'col-24-18');
        console.log(row);
        dom.find('input[type=text]', row).value = data.text;
        dom.find('input[type=hidden]', row).value = data.value;
      },
    });
    rd.show();
  });
  return ret;
};

MobileForm.prototype.buildMobile = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" name="{{name}}" class="form-control" readonly placeholder="请输入...">
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  dom.bind(ret, 'click', ev => {
    new Numpad({
      type: 'mobile',
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

MobileForm.prototype.buildId = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" name="{{name}}" class="form-control" readonly placeholder="请输入...">
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  dom.bind(ret, 'click', ev => {
    new Numpad({
      type: 'id',
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

MobileForm.prototype.buildDistrict = function (field) {
  let ret = dom.templatize(`
    <div class="form-group row">
      <label class="col-form-label col-24-06">{{title}}</label>
      <div class="col-24-18 d-flex">
        <input type="text" name="{{name}}" class="form-control" readonly placeholder="请选择...">
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  dom.bind(ret, 'click', ev => {
    new DistrictPicker({
      type: 'id',
      success: (val) => {
        let str = '';
        if (val.province) {
          str += val.province.chineseDistrictName;
        }
        if (val.city) {
          str += ' ' + val.city.chineseDistrictName;
        }
        if (val.county) {
          str += ' ' + val.county.chineseDistrictName;
        }
        if (val.town) {
          str += ' ' + val.town.chineseDistrictName;
        }
        input.value = str;
        input.setAttribute('data-value', JSON.stringify(val));
      }
    }).show(document.body);
  });
  return ret;
};
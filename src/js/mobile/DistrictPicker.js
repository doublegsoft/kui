
/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function DistrictPicker(opt) {
  this.unit = opt.unit || '';
  this.regex = opt.regex || /.*/;
  this.success = opt.success || function (vals) {};
  this.selections = opt.selections || {};
}

DistrictPicker.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom district-picker">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="confirm">确认</button>
        </div>
        <div class="bottom-dialog-body">
          <div style="padding: 4px 16px">
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetProvince" class="font-16">选择省份</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetCity" class="font-16">选择城市</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetCounty" class="font-16">选择区县</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetTown" class="font-16">选择街道/乡镇</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
          </div>
          <div style="border-top: 1px solid var(--color-divider);"></div>
          <ul widget-id="widgetDistrict" class="list-group" style="height: 240px; overflow-y: auto;">
          </ul>
        </div>
      </div>
    </div>
  `, this);
  this.bottom = dom.find('.popup-bottom', ret);
  this.district = dom.find('[widget-id=widgetDistrict]', ret);
  this.province = dom.find('[widget-id=widgetProvince]', ret);
  this.city = dom.find('[widget-id=widgetCity]', ret);
  this.county = dom.find('[widget-id=widgetCounty]', ret);
  this.town = dom.find('[widget-id=widgetTown]', ret);

  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let value = dom.find('.value', ret);

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  if (this.selections.province) {
    this.province.setAttribute('data-model-chinese-district-code', this.selections.province.chineseDistrictCode);
    this.province.innerText = this.selections.province.chineseDistrictName;
  }
  if (this.selections.city) {
    this.city.setAttribute('data-model-chinese-district-code', this.selections.city.chineseDistrictCode);
    this.city.innerText = this.selections.city.chineseDistrictName;
  }
  if (this.selections.county) {
    this.county.setAttribute('data-model-chinese-district-code', this.selections.county.chineseDistrictCode);
    this.county.innerText = this.selections.county.chineseDistrictName;
  }
  if (this.selections.town) {
    this.town.setAttribute('data-model-chinese-district-code', this.selections.town.chineseDistrictCode);
    this.town.innerText = this.selections.town.chineseDistrictName;
  }

  dom.bind(confirm, 'click', ev => {
    let vals = {};
    let provinceCode = this.province.getAttribute('data-model-chinese-district-code');
    let cityCode = this.city.getAttribute('data-model-chinese-district-code');
    let countyCode = this.county.getAttribute('data-model-chinese-district-code');
    let townCode = this.town.getAttribute('data-model-chinese-district-code');
    if (provinceCode != '') {
      vals.province = {chineseDistrictCode: provinceCode, chineseDistrictName: this.province.innerText,};
    }
    if (cityCode != '') {
      vals.city = {chineseDistrictCode: cityCode, chineseDistrictName: this.city.innerText,};
    }
    if (countyCode != '') {
      vals.county = {chineseDistrictCode: countyCode, chineseDistrictName: this.county.innerText,};
    }
    if (townCode != '') {
      vals.town = {chineseDistrictCode: townCode, chineseDistrictName: this.town.innerText,};
    }
    this.success(vals);
    this.close();
  });

  let onSelectionClicked = ev => {
    let div = dom.ancestor(ev.target, 'div');
    let strong = dom.find('strong', div);
    let chineseDistrictCode = strong.getAttribute('data-model-chinese-district-code');
    if (chineseDistrictCode.length == 9) {
      this.renderDistrict(chineseDistrictCode.substr(0, 6));
    } else {
      this.renderDistrict(chineseDistrictCode.substr(0, chineseDistrictCode.length - 2));
    }
  }

  dom.bind(this.province.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });
  dom.bind(this.city.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });
  dom.bind(this.county.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });
  dom.bind(this.town.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });

  setTimeout(() => {
    this.bottom.classList.add('in');
  }, 50);
  return ret;
};

DistrictPicker.prototype.renderDistrict = async function(districtCode) {
  let andCondition = null;
  let elDistrict = null;
  if (!districtCode) {
    andCondition = `
      and length(chndistcd) = 2
    `;
    elDistrict = this.province;
    this.city.setAttribute('data-model-chinese-district-code', '');
    this.city.innerText = '选择城市';
    this.county.setAttribute('data-model-chinese-district-code', '');
    this.county.innerText = '选择区县';
    this.town.setAttribute('data-model-chinese-district-code', '');
    this.town.innerText = '选择街道/乡镇';
  } else if (districtCode.length == 2) {
    andCondition = `
      and length(chndistcd) = 4 and substring(chndistcd, 1, 2) = '${districtCode}'
    `;
    elDistrict = this.city;
    this.county.setAttribute('data-model-chinese-district-code', '');
    this.county.innerText = '选择区县';
    this.town.setAttribute('data-model-chinese-district-code', '');
    this.town.innerText = '选择街道/乡镇';
  } else if (districtCode.length == 4) {
    andCondition = `
      and length(chndistcd) = 6 and substring(chndistcd, 1, 4) = '${districtCode}'
    `;
    elDistrict = this.county;
    this.town.setAttribute('data-model-chinese-district-code', '');
    this.town.innerText = '选择街道/乡镇';
  } else if (districtCode.length == 6) {
    andCondition = `
      and length(chndistcd) = 9 and substring(chndistcd, 1, 6) = '${districtCode}'
    `;
    elDistrict = this.town;
  } else {
    return;
  }
  let districts = await xhr.promise({
    url: "/api/v3/common/script/stdbiz/gb/chinese_district/find",
    params: {
      _and_condition: andCondition,
      _order_by: 'convert(chndistnm using gbk) asc',
    },
  });
  this.district.innerHTML = '';
  for (let i = 0; i < districts.length; i++) {
    let district = districts[i];
    let el = dom.templatize(`
      <li class="list-group-item">{{chineseDistrictName}}</li>
    `, district);
    dom.model(el, district);
    dom.bind(el, 'click', ev => {
      let li = dom.ancestor(ev.target, 'li');
      let model = dom.model(li);
      elDistrict.innerText = model.chineseDistrictName;
      elDistrict.setAttribute('data-model-chinese-district-code', model.chineseDistrictCode);
      this.renderDistrict(model.chineseDistrictCode);
    });
    this.district.appendChild(el);
  }
};

DistrictPicker.prototype.show = function(container) {
  container.appendChild(this.root());
  this.renderDistrict();
};

DistrictPicker.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};
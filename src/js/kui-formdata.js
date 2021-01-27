/**
 * Gets the form data under a container element.
 * 
 * @param {object} initial - the initial object, it could be json string.
 * 
 * @return json string or javascript object
 */
$.fn.formdata = function(initial) {
  if (typeof initial !== "undefined") {
    let obj;
    if (typeof initial === "string") {
      obj = $.parseJSON(initial);
    } else {
      obj = initial;
    }
    $(this).find('input').each(function(idx, elm) {
      $(this).val('');
    });
    $(this).find('input[type=checkbox]').each(function(idx, elm) {
      $(this).prop('checked', false);
    });
    $(this).find('textarea').each(function(idx, elm) {
      $(this).val('');
    });
    let params = obj;
    for (let key in params) {
      let elementNodeName;
      this.find('[name=' + key + ']').each(function(idx, elm) {
        elementNodeName = $(this)[0].nodeName;
        if (elementNodeName == "INPUT" && ($(this).attr("type") == "radio" || $(this).attr("type") == "checkbox")) {
          if (params[key].constructor == Array) {
            let arr = params[key];
            for (let i = 0; i < arr.length; i++) {
              if ($(this).val() == arr[i]) {
                $(this).prop("checked", true);
              }
            }
          } else {
            if ($(this).val() == params[key]) {
              $(this).prop("checked", true);
            }
          }
        } else if (elementNodeName == "INPUT" && ($(this).attr("type") == "file" || $(this).attr("type") == "button")) {
          // 无需回显
        } else if (elementNodeName == "SELECT") {
          let found = false;
          $(this).find('option').each(function() {
            let option = $(this);
            if (option.attr('value') == params[key]) {
              option.prop('selected', true);
              found = true;
            }
          });
          if (!found) {
            $(this).val($($(this).find("option:first")).val());
          }
          // select2
          // FIXME: NOT WORKING
          $(this).val(null).trigger('change');
        } else {
          if ($(this).attr('data-domain-type') == 'date') {
            $(this).val(moment(params[key]).format('YYYY-MM-DD'));
            // $(elm).data('DateTimePicker').date(new Date(params[key]));
          } else {
            $(this).val(params[key]);
          }
        }
      });
    }
    return {};
  }
  let ret = {};
  this.find('input[type!=checkbox][type!=radio][type!=button]').each(function(idx, el) {
    let name = $(el).attr('name');
    if (!name) return;
    let objname = name;
    let attrname = '';
    let isArray = name.indexOf('[]') != -1;
    let dotIndex = name.indexOf('.');
    let value = $(el).val();
    if (dotIndex != -1) {
      objname = name.substr(0, dotIndex);
      attrname = name.substr(dotIndex + 1,
          isArray ? name.indexOf('[]') - objname.length - 1 : name.length - objname.length - 1);
    }

    if (isArray) {
      ret[objname] = ret[objname] || [];
      if (attrname != '') {
        let item = {};
        item[attrname] = value;
        ret[objname].push(item);
      } else {
        ret[name].push(value);
      }
    } else {
      if (attrname != '') {
        let item = {};
        item[attrname] = value;
        ret[objname] = name;
      } else {
        ret[name] = value;
      }
    }
  });

  this.find('input[type=checkbox]').each(function(idx, el) {
    if ($(el).prop('checked')) {
      let name = $(el).attr('name');
      if (name.indexOf('[]') != -1) {
        let objname = name;
        let attrname = '';
        let dotIndex = objname.indexOf('.');
        if (dotIndex == -1) {
          ret[objname] = ret[objname] || [];
          ret[objname].push($(el).val());
        } else {
          objname = name.substr(0, dotIndex);
          attrname = name.substr(dotIndex + 1, name.indexOf('[]') - objname.length - 1);
          ret[objname] = ret[objname] || [];
          let item = {};
          item[attrname] = $(el).val();
          ret[objname].push(item);
        }
      } else {
        ret[name] = $(el).val();
      }
    }
  });
  this.find('input[type=checkbox]').each(function(idx, el) {
    let name = $(el).attr('name');
    if (typeof ret[name] === "undefined" && name.indexOf('[]') == -1) {
      ret[name] = '';
    }
  });
  this.find('input[type=radio]').each(function(idx, el) {
    if ($(el).prop('checked')) {
      ret[$(el).attr('name')] = $(el).val();
    }
  });
  this.find('input[type=radio]').each(function(idx, el) {
    var name = $(el).attr('name');
    if (typeof ret[name] === "undefined") {
      ret[name] = '';
    }
  });
  this.find('select').each(function(idx, el) {
    if ($(el).val() != '' && $(el).val() != '-1' && $(el).val() != null) {//&& $(el).val() != '0'
      let name = $(el).attr('name');
      let value = $(el).val();
      let objname = name;
      let attrname = '';
      if (typeof name === 'undefined') return;
      let dotIndex = name.indexOf('.');
      if (dotIndex != -1) {
        objname = name.substr(0, dotIndex);
        attrname = name.substr(dotIndex + 1,
            name.length - objname.length - 1);
      }
      if (typeof $(el).val() === 'object') {
        ret[$(el).attr('name')] = $(el).val().join(',');
      } else {
        if (attrname != '') {
          let item = {};
          item[attrname] = value;
          ret[objname] = item;
        } else
          ret[name] = value;
      }
    } else if ($(el).val() == '-1') {
      // NOT ALLOW EMPTY STRING
      ret[$(el).attr('name')] = '';
    } else {
      // NOT ALLOW EMPTY STRING
      ret[$(el).attr('name')] = '';
    }
  });
  this.find('textarea').each(function(idx, el) {
    if ($(el).val() != '') {
      ret[$(el).attr('name')] = $(el).val();
    } else {
      ret[$(el).attr('name')] = '';
    }
  });
  return ret;
};

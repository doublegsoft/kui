/*
 * Copyright 2019 doublegsoft.net
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
 * sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

$.fn.simpleselect = function (opts) {
  let value = opts.fields.value;
  let text = opts.fields.text;
  let selection = opts.selection || '-1';
  let self = $(this);
  let dotIndex = value.indexOf('.');
  let objname = value.substr(0, dotIndex);
  let attrname = value.substr(dotIndex + 1);
  xhr.post({
    url: opts.url,
    data: opts.data || {},
    success: function (resp) {
      if (!resp.data) return;
      for (let i = 0; i < resp.data.length; i++) {
        let item = resp.data[i];
        let option = $('<option></option>');
        if (dotIndex == -1) {
          option.prop('selected', selection == item[value]);
          option.attr('value', item[value]);
        } else {
          option.prop('selected', selection == item[objname][attrname]);
          option.attr('value', item[objname][attrname]);
        }
        option.text(item[text]);
        self.append(option);
      }
    }
  });
};

$.fn.searchselect = function (opts) {
  let value = opts.fields.value;
  let text = opts.fields.text;
  let selection = opts.selection || '-1';
  let self = $(this);
  let dotIndex = value.indexOf('.');
  let objname = value.substr(0, dotIndex);
  let attrname = value.substr(dotIndex + 1);

  xhr.post({
    url: opts.url,
    data: opts.data || {},
    success: function (resp) {
      if (!resp.data) {
        return;
      }
      for (let i = 0; i < resp.data.length; i++) {
        let item = resp.data[i];
        let option = $('<option></option>');
        if (dotIndex == -1) {
          option.prop('selected', selection == item[value]);
          option.attr('value', item[value]);
        } else {
          option.prop('selected', selection == item[objname][attrname]);
          option.attr('value', item[objname][attrname]);
        }
        option.text(item[text]);
        self.append(option);
      }
      self.select2({
        liveSearch: true
      });
    }
  });
};

$.fn.multiselect = function (opts) {
  var value = opts.value;
  var text = opts.text;
  var self = $(this);
  xhr.post({
    url: opts.url,
    data: opts.params || {},
    success: function (resp) {
      if (!resp.data) return;
      for (var i = 0; i < resp.data.length; i++) {
        var item = resp.data[i];
        var option = $('<option></option>');
        option.attr('value', item[value]);
        option.text(item[text]);
        self.append(option);
      }
      self.selectpicker();
    }
  });
};

$.fn.autocomplete = function (opts) {
  var value = opts.value;
  var text = opts.text;
  var self = $(this);
  xhr.post({
    url: opts.url,
    data: opts.params || {},
    success: function (resp) {
      if (!resp.data) return;
      for (var i = 0; i < resp.data.length; i++) {
        var item = resp.data[i];
        var option = $('<option></option>');
        option.attr('value', item[value]);
        option.text(item[text]);
        self.append(option);
      }
      self.select2({});
    }
  });
};
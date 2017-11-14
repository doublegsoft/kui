var NO_ERRORS = 0;
var REQUIRED_ERROR = 1;
var FORMAT_ERROR = 2;
var INVALID_ERROR = 3;

// add string trim method if not existing
if (!String.prototype.trim) {
    (function() {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
            return this.replace(rtrim, '');
        };
    })();
}

/**
 * The jquery plugin to validate user-input elements under a element.
 * 
 * @param {function}
 *            callback - the callback function
 * 
 * @return errors including message and element
 */
$.fn.validate = function(callback) {
    return Validation.validate(this, callback);
};

Validation = {
    /**
     * 
     */
    validate: function(container, callback) {
        var ret = [];
        if (typeof container === 'undefined') {
            container = $(document);
        }
        // 输入框
        container.find('input[type!=checkbox][type!=radio][type!=button]').each(function(idx, el) {
            var val = $(el).val().trim();
            var label = Validation.getLabel(el);
            // 必填项校验
            var msg = $(el).attr('required-message') ? $(el).attr('required-message') : label + '必须填写！';
            if (($(el).prop('required') || $(el).attr("required") == "required") && val === '') {
                ret.push({
                    element: el,
                    message: msg
                });
            }
            // 专用类型校验
            var expr = $(el).attr('domain-type');
            if (!expr) {
                return;
            }
            var msg = label + '填写不合要求。';
            var dt = Validation.getDomainValidator(new ValidationModel(expr));
            if (dt != null && val !== '') {
                var res = dt.test(val);
                switch (res) {
                case REQUIRED_ERROR:
                    break;
                case FORMAT_ERROR:
                    msg = $(el).attr('format-message') ? $(el).attr('format-message') : msg;
                    break;
                case INVALID_ERROR:
                    msg = $(el).attr('invalid-message') ? $(el).attr('invalid-message') : msg;
                    break;
                default:
                    break;
                }
                if (res != NO_ERRORS) {
                    ret.push({
                        element: $(el),
                        message: msg
                    });
                }
            }
        });
        container.find('textarea').each(function(idx, el) {
            var val = $(el).val().trim();
            var label =Validation.getLabel(el);
            // 必填项校验
            var msg = $(el).attr('required-message') ? $(el).attr('required-message') : label + '必须填写！';
            if ($(el).prop('required') && val === '') {
                ret.push({
                    element: el,
                    message: msg
                });
            }
            // 专用类型校验
            var expr = $(el).attr('domain-type');
            if (!expr) {
                return;
            }
            var msg = label + '填写不合要求。';
            var dt = Validation.getDomainValidator(new ValidationModel(expr));
            if (dt != null && val !== '') {
                var res = dt.test(val);
                switch (res) {
                case REQUIRED_ERROR:
                    break;
                case FORMAT_ERROR:
                    msg = $(el).attr('format-message') ? $(el).attr('format-message') : msg;
                    break;
                case INVALID_ERROR:
                    msg = $(el).attr('invalid-message') ? $(el).attr('invalid-message') : msg;
                    break;
                default:
                    break;
                }
                if (res != NO_ERRORS) {
                    ret.push({
                        element: $(el),
                        message: msg
                    });
                }
            }
        });
        // 下拉框
        container.find('select').each(function(idx, el) {
            if ($(el).prop('required') && $(el).val() === '-1') {
                var label = Validation.getLabel(el);
                var msg = label + '必须选择！';
                msg = $(el).attr('required-message') ? $(el).attr('required-message') : msg;
                ret.push({
                    element: $(el),
                    message: msg
                });
            }
        });
        // 复选框
        var names = {};
        container.find('input[type=checkbox]').each(function(idx, el) {
            // 名称必须要有
            var name = $(el).attr('name');
            names[name] = name;
        });
        for ( var name in names) {
            var checked = false;
            var label = null;
            var elm = null;
            container.find('input[name="' + name + '"]').each(function(idx, el) {
                if (idx == 0) {
                    label = Validation.getLabel(el);
                    elm = el;
                }
                if (!checked && $(el).prop('checked')) {
                    checked = true;
                }
            });
            if (!checked && $(elm).prop('required')) {
                var msg = label + '必须选择！';
                msg = $(elm).attr('required-message') ? $(elm).attr('required-message') : msg;
                ret.push({
                    element: $(elm),
                    message: msg
                });
            }
        }
        // 单选框
        var names = {};
        container.find('input[type=radio]').each(function(idx, el) {
            // 名称必须要有
            var name = $(el).attr('name');
            names[name] = name;
        });
        for ( var name in names) {
            var checked = false;
            var label = null;
            var elm = null;
            container.find('input[name="' + name + '"]').each(function(idx, el) {
                if (idx == 0) {
                    label = Validation.getLabel(el);
                    elm = el;
                }
                if (!checked && $(el).prop('checked')) {
                    checked = true;
                }
            });
            if (!checked && $(elm).prop('required')) {
                var msg = label + '必须选择！';
                msg = $(elm).attr('required-message') ? $(elm).attr('required-message') : msg;
                ret.push({
                    element: $(elm),
                    message: msg
                });
            }
        }
        // ajax验证
        container.find('input[remote]').each(function(idx, el) {
            var uri = $(el).attr('remote');
            var val = $(el).val().trim();
            if (uri && uri != '' && val != '') {
                $.ajax({
                    url: uri,
                    method: 'POST',
                    data: "check=" + val,
                    success: function(resp) {
                        var obj = $.parseJSON(resp);
                        if (obj.err) {
                            ret.push({
                                element: $(el),
                                message: obj.msg
                            });
                        }
                    }
                });
            }
        });
        if (callback) {
            callback(ret);
        }

        return ret;
    },

    getLabel: function(_el){
        var el = $(_el);
        return el.attr('label') || (el.attr("name") || el.attr("id"));
    },

    getDomainValidator: function(model) {
        var domain = model.keyword.toLowerCase();
        var vm = model;
        var ret = null;
        if (domain === 'mail' || domain === 'email') {
            ret = new Validation.Mail();
        } else if (domain === 'number') {
            ret = new Validation.Number(vm.symbol, vm.args);
        } else if (domain === 'string') {
            ret = new Validation.String(vm.args);
        } else if (domain === 'mobile') {
            ret = new Validation.Mobile();
        } else if (domain === 'range') {
            ret = new Validation.Range(vm.opts, vm.args);
        } else if (domain === 'phone') {
            ret = new Validation.Phone();
        } else if (domain === 'cmpexp') {
            ret = new Validation.CmpExp(vm.args[0], vm.args[1]);
        } else if (domain === 'regexp') {
            ret = new Validation.RegExp(vm.args[0]);
        } else if (domain === 'remote') {
            ret = new Validation.Remote(vm.args[0]);
        } else if (domain === 'date') {
            ret = new Validation.Date();
        } else if (domain === 'time') {
            ret = new Validation.Time();
        } else if (domain === 'datetime') {
            ret = new Validation.DateTime();
        } else {
            throw new Error('not support for the domain("' + domain + '")');
        }
        return ret;
    },

    String: function(args) {
        this.min = 0;
        this.max = parseInt(args[0]);
        if (args.length > 1) {
            this.min = parseInt(args[0]);
            this.max = parseInt(args[1]);
        }
        this.test = function(str) {
            if (str.length < this.min) {
                return FORMAT_ERROR;
            }
            if (this.max && str.length > this.max) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Number: function(sym, args) {
        var start = 7;
        this.plus = -1;
        this.minus = -1;
        if (sym === '-') {
            this.minus = 0;
        } else if (sym === '+') {
            this.plus = 0;
        }

        if (this.minus == 0 || this.plus == 0) {
            start += 1;
        }
        this.precision = parseInt(args[0]);
        if (args.length > 1) {
            this.scale = parseInt(args[1]);
        }

        this.test = function(str) {
            if (this.plus == 0) {
                var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
                if (!re.test(str)) {
                    return FORMAT_ERROR;
                }
            } else if (this.minus == 0) {
                var re = /^\s*(-)((\d+(\.\d+)?)|(\.\d+))\s*$/;
                if (!re.test(str)) {
                    return FORMAT_ERROR;
                }
            } else {
                var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
                if (!re.test(str)) {
                    return FORMAT_ERROR;
                }
            }

            var idx = str.indexOf('.');
            var maxlen = idx == -1 ? this.precision : this.precision + 1;
            maxlen = this.plus == 0 || this.minus == 0 ? maxlen + 1 : maxlen;
            if (str.length > maxlen) {
                return FORMAT_ERROR;
            }

            if (idx != -1 && this.scale) {
                var s = str.substring(idx + 1);
                if (s.length > this.scale) {
                    return FORMAT_ERROR;
                }
            }
            return NO_ERRORS;
        }
    },

    Mail: function() {
        this.test = function(str) {
            var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Phone: function() {
        this.test = function(str) {
            var re = /^\d{11}$/i;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Mobile: function() {
        this.test = function(str) {
            var re = /^\d{11}$/i;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Date: function() {
        this.test = function(str) {
            var re = /^\d{4}-\d{1,2}-\d{1,2}$/;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            if (isNaN(Date.parse(str))) {
                return INVALID_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Time: function() {
        this.test = function(str) {
            var re = /^\d{1,2}:\d{1,2}(:\d{1,2})?$/;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            str = "1970-01-01 " + str;
            if (isNaN(Date.parse(str))) {
                return INVALID_ERROR;
            }
            return NO_ERRORS;
        }
    },

    DateTime: function() {
        this.test = function(str) {
            var re = /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}(:\d{1,2})?$/;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            if (isNaN(Date.parse(str))) {
                return INVALID_ERROR;
            }
            return NO_ERRORS;
        }
    },

    RegExp: function(expr) {
        this.re = new RegExp(expr);
        this.test = function(str) {
            if (!this.re.test(str)) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    CmpExp: function(type, expr) {
        this.model = new ValidationModel(type);
        this.expr = expr;
        this.ignore = false;
        var self = this;
        this.test = function(str) {
            var expr = this.expr;
            var dt = Validation.getDomainValidator(this.model);
            if (dt.test(str) != NO_ERRORS) {
                return FORMAT_ERROR;
            }
            $('input[type!=checkbox][type!=radio][type!=button]').each(function(idx, el) {
                var name = $(el).attr('name');
                var val = $(el).val();
                if (expr.indexOf(name) != -1) {
                    if (val == '') {
                        self.ignore = true;
                    }
                    expr = expr.replace(new RegExp(name, 'g'), val);
                }
            });
            if (!this.ignore) {
                try {
                    if (!eval(expr)) {
                        return INVALID_ERROR;
                    }
                } catch (e) {
                    return INVALID_ERROR;
                }
            }
            return NO_ERRORS;
        }
    },

    Remote: function(uri) {
        this.test = function(str) {
            $.ajax({
                url: uri + str,
                dataType: "json",
                success: function(resp) {
                    if (resp.error != 0) {

                    }
                }
            });
        }
    },

    Range: function(opts, args) {
        this.min = parseFloat(args[0]);
        this.max = parseFloat(args[1]);
        this.test = function(str) {
            var check = parseFloat(str.trim());
            if (isNaN(check)) {
                return INVALID_ERROR;
            }
            var ret = false;
            if (opts[0] == ">") {
                ret = (check > this.min);
            } else if (opts[0] === ">=") {
                ret = (check >= this.min);
            }
            if (!ret) {
                return INVALID_ERROR;
            }
            if (opts[1] == "<") {
                ret = (check < this.max);
            } else if (opts[1] === "<=") {
                ret = (check <= this.max);
            }
            if (!ret) {
                return INVALID_ERROR;
            }
            return NO_ERRORS;
        }
    }
};

ValidationModel = function(expr) {
    this.symbol = '';
    this.keyword = '';
    this.opts = [];
    this.args = [];

    this.unary_ops = {
        '+': true,
        '-': true
    };

    this.keywords = {
        'string': true,
        'number': true,
        'range': true,
        'regexp': true,
        'mobile': true,
        'email': true,
        'phone': true,
        'cmpexp': true
    };
    var index = 0;
    var length = expr.length;
    var word = '';
    while (index < length) {
        var ch = expr.charAt(index);
        if (this.isUnaryOp(ch) && index == 0) {
            this.symbol = ch;
        } else if (ch == '[') {
            if (this.keyword != '') {
                word += ch;
            } else {
                if (!this.stringEqual('range', word)) {
                    throw new Error('"[" is just available for range.');
                }
                this.keyword = word;
                this.opts.push('>=');
                word = '';
            }
        } else if (ch == '(') {
            if (this.keyword != '') {
                this.opts.push('(');
                word += ch;
            } else {
                this.keyword = word;
                this.opts.push(">");
                word = '';
            }
        } else if (ch == ']') {
            this.opts.push("<=")
            this.args.push(word);
            word = '';
        } else if (ch == ')' && index == length - 1) {
            this.args.push(word);
            this.opts.push('<');
            word = '';
        } else if (ch == ')') {
            this.opts.pop('<');
            if (this.opts.length == 1) {
                word += ch;
            }
        } else if (ch == ',') {
            if (this.opts.length == 1) {
                this.args.push(word);
                word = '';
            } else {
                word += ch;
            }
        } else {
            word += ch;
        }
        index++;
    }
    if (this.keyword == '') {
        this.keyword = word;
    }
};

ValidationModel.prototype = {

    isKeyword: function(str) {
        return this.keywords[str.toLowerCase()];
    },

    isUnaryOp: function(ch) {
        return this.unary_ops[ch];
    },

    isDecimalDigit: function(ch) {
        return (ch >= 48 && ch <= 57); // 0...9
    },

    isIdentifierStart: function(ch) {
        return (ch === 36) || (ch === 95) || // `$` and `_`
        (ch >= 65 && ch <= 90) || // A...Z
        (ch >= 97 && ch <= 122); // a...z
    },

    isIdentifierPart: function(ch) {
        return (ch === 36) || (ch === 95) || // `$` and `_`
        (ch >= 65 && ch <= 90) || // A...Z
        (ch >= 97 && ch <= 122) || // a...z
        (ch >= 48 && ch <= 57); // 0...9
    },

    stringEqual: function(str0, str1) {
        return str0.toLowerCase() === str1.toLowerCase();
    }
};

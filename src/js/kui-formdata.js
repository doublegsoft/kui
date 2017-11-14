/**
 * Gets the form data under a container element.
 * 
 * @param {object} initial - the initial object, it could be json string.
 * 
 * @return json string or javascript object
 */
$.fn.formdata = function (initial) {
	if (typeof initial !== "undefined") {
		var obj;
		if (typeof initial === "string") {
			obj = $.parseJSON(initial);
		} else {
			obj = initial;
		}
		var params =  obj;
	    for(var key in params){
	        var elemtNodeName;
	        this.find('[name=' + key + ']').each(function(){
	            elemtNodeName = $(this)[0].nodeName;
	            if(elemtNodeName == "INPUT" && ($(this).attr("type") == "radio" || $(this).attr("type") == "checkbox")) {
	            	if (params[key].constructor == Array) {
	            		var arr = params[key];
	            		for (var i = 0; i < arr.length; i++) {
	            			if($(this).val() == arr[i]){
			                    $(this).prop("checked", true);
			                }
	            		}
	            	} else {
	            		if($(this).val() == params[key]){
		                    $(this).prop("checked", true);
		                }
	            	}
	            }else if(elemtNodeName == "INPUT" && ($(this).attr("type") == "file" || $(this).attr("type") == "button")) {
	                // 无需回显
	            }else{
	                $(this).val(params[key]);
	            }
	        });
	    }
		return;
	}
    var ret = {};
    this.find('input[type!=checkbox][type!=radio][type!=button]').each(function (idx, el) {
        if ($(el).val() != '') {
            ret[$(el).attr('name')] = $(el).val();
        } else {
        	ret[$(el).attr('name')] = '';
        }
    });
    
    this.find('input[type=checkbox]').each(function (idx, el) {
        if ($(el).prop('checked')) {
        	var existingVals = ret[$(el).attr('name')];
            if (typeof existingVals != 'undefined') {
            	if (typeof ret[$(el).attr('name')] === "string") {
            		var val = ret[$(el).attr('name')];
            		ret[$(el).attr('name')] = [];
            		ret[$(el).attr('name')].push(val);
            	}
                ret[$(el).attr('name')].push($(el).val());
            } else {
                ret[$(el).attr('name')] = $(el).val();
            }
        }
    });
    this.find('input[type=checkbox]').each(function (idx, el) {
    	var name = $(el).attr('name');
    	if (typeof ret[name] === "undefined") {
    		ret[name] = '';
    	}
    });
    this.find('input[type=radio]').each(function (idx, el) {
        if ($(el).prop('checked')) {
            ret[$(el).attr('name')] = $(el).val();
        }
    });
    this.find('input[type=radio]').each(function (idx, el) {
    	var name = $(el).attr('name');
    	if (typeof ret[name] === "undefined") {
    		ret[name] = '';
    	}
    });
    this.find('select').each(function (idx, el) {
        if ($(el).val() != ''  && $(el).val() != '-1' && $(el).val() != null) {//&& $(el).val() != '0'
            if (typeof $(el).val() === 'object') {
                ret[$(el).attr('name')] = $(el).val().join(',');
            } else {
                ret[$(el).attr('name')] = $(el).val();
            }
        } else if ($(el).val() == '-1') {
        	ret[$(el).attr('name')] = '';
        } else {
        	ret[$(el).attr('name')] = '';
        }
    });
    this.find('textarea').each(function (idx, el) {
        if ($(el).val() != '') {
            ret[$(el).attr('name')] = $(el).val();
        } else {
        	ret[$(el).attr('name')] = '';
        }
    });
    return ret;
};

/**
 * @description 回显html元素数据，标准html元素，数据字段与页面元素一一对应，radio，checkbox除外。
 * @param  json json数据
 * @buffer  目前只考虑到input textArea  select.
 * */
$.fn.reviewFormdata = function(data){
    var _this = this;
    $.each(data, function(key, value) {
        var ctrl = $(_this).find('[name='+key.toLowerCase()+']').first();
        switch(ctrl.prop("type")) {
            case "radio": case "checkbox":
                ctrl.each(function() {
                    if($(this).attr('value') == value) $(this).attr("checked",value);
                });
                break;

            default:
                ctrl.val(value);
        }
    });
}

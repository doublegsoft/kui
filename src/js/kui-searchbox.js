
$.fn.searchbox = function(options) {
    options = options || {};
    this.direction = options.direction || 'down';
    var self = this;
    $(this).on('keyup', function(e) {
        var input = $(this);
        var offset = input.offset();
        var left = offset.left;
        if (self.direction === 'up') {
            var top = offset.top - input.height();
        } else {
            var top = offset.top + input.height();
        }

        var keyword = input.val();
        if (keyword === '') return;
        $.ajax({
            url: options.url,
            data: {keyword: keyword},
            dataType: 'json',
            success: function(data) {
                displayResult(data, {left: left, top: top});
            }
        });
    });
    
    this.data = [];

    var self = this;
    function displayResult(data, pos) {
        self.data = data;
        var divResult = $('#__search_result');
        if (divResult.length) {
            divResult.empty();
        } else {
            divResult = $('<divResult id="__search_result" class="dropdown-menu dropdown-menu-right" style="width: 200px" role="menu"></divResult>');
            $('body').append(divResult);
        }
        divResult.css('position', 'absolute');
        
        var ul = $('<ul style="list-style: none">');
        for (var i = 0; i < data.length; i++) {
            var itm = data[i];
            var li = $('<li>');
            var a = $('<a style="cursor: pointer">');
            for (var k in itm) {
                a.attr('data-' + k, itm[k]);
            }
            a.on('click', function() {
                divResult.hide();
                $(self).val($(this).text());
                var attrs = {};
                $(this).each(function() {
                    $.each(this.attributes, function() {
                        if(this.specified) {
                            if (this.name.indexOf('data-') == 0)
                                attrs[this.name.substr(5)] = this.value;
                        }
                    });
                });
                if (typeof options.callback !== 'undefined') {
                    options.callback(attrs);
                }
            });
            a.text(itm.text);
            li.append(a);
            ul.append(li);
        }
        divResult.append(ul);

        // positioning
        if (self.direction == 'down') {
            divResult.css('left', pos.left);
            divResult.css('top', pos.top);
        } else {
            divResult.css('left', pos.left);
            divResult.css('top', pos.top - divResult[0].offsetHeight);
        }

        divResult.show();
    }
};
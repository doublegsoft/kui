
$.fn.searchbox = function(options) {
    options = options || {};
    $(this).on('keyup', function(e) {
        var input = $(this);
        var offset = input.offset();
        var left = offset.left;
        var top = offset.top + input.height();
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
        self.data = data.rs;
        var div = $('#search_result');
        if (div.length) {
            div.empty();
        } else {
            div = $('<div id="search_result" class="dropdown-menu dropdown-menu-right" style="width: 200px" role="menu"></div>');
            $('body').append(div);
        }
        div.css('position', 'absolute');
        div.css('left', pos.left);
        div.css('top', pos.top);
        
        var ul = $('<ul style="list-style: none">');
        for (var i = 0; i < data.rs.length; i++) {
            var itm = data.rs[i];
            var li = $('<li>');
            var a = $('<a style="cursor: pointer">');
            for (var k in itm) {
                a.attr('data-' + k, itm[k]);
            }
            a.on('click', function() {
                div.hide();
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
        div.append(ul);
        div.show();
    }
};
if (typeof dialog === 'undefined') dialog = {};

dialog.alert = function (message) {
    layer.open({
        type: 0,
        icon: 0,
        offset: '300px',
        shade: 0,
        shadeClose: true,
        title: '警告',
        content: message,
    }); 
};

dialog.error = function (message) {
    layer.open({
        type: 0,
        icon: 2,
        offset: '300px',
        shade: 0,
        shadeClose: true,
        title: '错误',
        content: message,
    }); 
};

dialog.success = function (message) {
    layer.open({
        type: 0,
        icon: 1,
        offset: '300px',
        shade: 0,
        shadeClose: true,
        title: '成功',
        content: message
    }); 
};

dialog.confirm = function (message, callback) {
    layer.confirm(message, {
        btn: ['确定', '取消'] //按钮
    }, function(index){
        layer.close(index);
        callback();
    }, function(){
        
    });
};
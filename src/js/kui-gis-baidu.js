const DEFAULT_MAP_STYLE = [{
    'featureType': 'point',
    'elementType': 'all',
    'stylers': {
        'color': '#909e84',
        'hue': '#000000',
        'weight': '1',
        'visibility': 'off'
    }
}, {
    'featureType': 'building',
    'elementType': 'all',
    'stylers': {
        'color': '#909e84',
        'hue': '#000000',
        'weight': '1',
        'visibility': 'off'
    }
}, {
    'featureType': 'water',
    'elementType': 'all',
    'stylers': {
        'color': '#a3cdff',
        'weight': '1',
        'lightness': 1,
        'saturation': 1,
        'visibility': 'on'
    }
}, {
    'featureType': 'land',
    'elementType': 'all',
    'stylers': {
        'color': '#f2f1ed',
        'weight': '1',
        'lightness': 100,
        'saturation': 1,
        'visibility': 'on'
    }
}, {
    'featureType': 'manmade',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'boundary',
    'elementType': 'all',
    'stylers': {
        'color': '#6dabfe',
        'weight': '1',
        'visibility': 'on'
    }
}, {
    'featureType': 'green',
    'elementType': 'all',
    'stylers': {
        'color': '#c1db9a',
        'saturation': -4
    }
},
{
    'featureType': 'arterial',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'highway',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'local',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'railway',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'subway',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'road',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}];

if (typeof gis === 'undefined') gis = {};

/**
 * @constructor
 *
 * 百度地图构造函数。
 * 
 * @param {string} containerId - 容器标识 
 * 
 * @param {object} centerCoordinate - 中心点坐标
 */
gis.Baidu = function (containerId, centerCoordinate, zoom) {
	this.centerCoordinate = centerCoordinate;
    this.zoom = zoom || 10;
	
	this.map = new BMap.Map(containerId);
	// this.map.setMapType(BMAP_SATELLITE_MAP);
    this.map.setMapStyle({
        styleJson: DEFAULT_MAP_STYLE
    });
    // this.map.setMapStyle({style: 'midnight'});
	this.map.disableScrollWheelZoom(); 
	this.map.centerAndZoom(new BMap.Point(centerCoordinate.lng, centerCoordinate.lat), this.zoom);
	this.overlays = {};
};

/**
 * @public
 * 
 * 在地图上标记一个点坐标。
 * 
 * @param {object} data - 普通标记对象
 *
 * @param {object} coordinate - 含有经纬度的坐标点，维度：lat，精度：lng
 *
 * @param {object} triggers - 事件方法的封装对象，包括click, mouseover, mouseout这些基本事件
 */
gis.Baidu.prototype.mark = function (data, coordinate, triggers) {
    var markerPoint = new BMap.Point(coordinate.lng, coordinate.lat);
	var markerIcon = new BMap.Icon(data.icon, new BMap.Size(24, 24));
	var marker = new BMap.Marker(markerPoint, {icon: markerIcon});
	this.map.addOverlay(marker);      
    
    marker.data = data;
    if (typeof triggers === 'undefined') return;
    if (typeof triggers.click !== 'undefined') {
        marker.addEventListener('click', function() {
            triggers.click(this.data);
        });
    }
};

/**
 * @public
 * 
 * 在地图上标记一个数字点坐标。
 * 
 * @param {object} data - 数字标记对象
 *
 * @param {object} coordinate - 含有经纬度的坐标点，维度：lat，精度：lng
 *
 * @param {object} triggers - 事件方法的封装对象，包括click, mouseover, mouseout这些基本事件
 */
gis.Baidu.prototype.number = function (data, coordinate, triggers) {
    var overlay = new gis.Baidu.NumberOverlay(this.map, data, coordinate, triggers);
    this.map.addOverlay(overlay);
};

/**
 * @public
 * 
 * 在地图上标记一条折线，通常用于绘制线路或者河流。
 * 
 * @param {object} data - 折线标记对象
 *
 * @param {array} coordinates - 含有经纬度的坐标点集合，维度：lat，精度：lng
 *
 * @param {object} triggers - 事件方法的封装对象，包括click, mouseover, mouseout这些基本事件
 */
gis.Baidu.prototype.polyline = function (data, coordinates, triggers) {
    var points = [];
    for (var i = 0; i < coordinates.length; i++) {
        var coord = coordinates[i];
        points.push(new BMap.Point(coord.lng, coord.lat));
    }
    var polyline = new BMap.Polyline(points, {
        strokeColor: data.color || '#2eadd3'
    });
    this.map.addOverlay(polyline);
    
    polyline.data = data;
    if (typeof triggers === 'undefined') return;
    if (typeof triggers.click !== 'undefined') {
        polyline.addEventListener('click', function() {
            triggers.click(this.data);
        });
    }
};

/**
 * @public
 * 
 * 在地图上画出边界。
 */
gis.Baidu.prototype.boundary = function (addv, custom) {
    var bdary = new BMap.Boundary();
    var self = this;
    bdary.get(addv, function(rs) {       //获取行政区域
        // this.map.clearOverlays();        //清除地图覆盖物       
        var count = rs.boundaries.length; //行政区域的点有多少个
        if (count === 0) {
            alert('未能获取当前输入行政区域');
            return ;
        }
        var pointArray = [];
        for (var i = 0; i < count; i++) {
            var ply = new BMap.Polygon(rs.boundaries[i], {strokeWeight: 2, strokeColor: '#ff0000'}); //建立多边形覆盖物
            self.map.addOverlay(ply);  //添加覆盖物
            pointArray = pointArray.concat(ply.getPath());
        }
        // self.map.setViewport(pointArray);    //调整视野     
        self.map.setZoom(this.zoom);
    });   
};

/**
 * @public
 *
 * 清除所有绘制的标记。
 */
gis.Baidu.prototype.restore = function() {
    this.map.clearOverlays();
    this.map.centerAndZoom(new BMap.Point(this.centerCoordinate.lng, this.centerCoordinate.lat), this.zoom);
};

gis.Baidu.prototype.clear = function() {
    this.map.clearOverlays();
};

gis.Baidu.prototype.getMap = function() {
    return this.map;  
};

/**
 * 地图上显示工具栏，工具栏通常加载一些搜索框、监测按钮等。
 *
 * @param {object} data - 工具栏对象
 *
 * @param {array} coordinates - 含有经纬度的坐标点集合，维度：lat，精度：lng
 *
 * @param {object} triggers - 事件方法的封装对象，包括click, mouseover, mouseout这些基本事件
 *
 * @public
 */
gis.Baidu.prototype.toolbar = function (option) {
    var bar = new gis.Baidu.Toolbar(option);
    bar.setAnchor(BMAP_ANCHOR_BOTTOM_RIGHT);
    bar.setOffset(new BMap.Size(10, 10));
    this.map.addControl(bar);
};

/**
 * 设置地图的东部面板（右侧面板）悬浮在地图上，可伸缩。
 * 
 * @param {object} east - 实例化东部面板的对象
 *
 * @public
 */
gis.Baidu.prototype.east = function(east) {
    if (east.onLoad) {
        this.map.addEventListener("addcontrol", function() {
            setTimeout(east.onLoad(), 3000);
        });
    }
    east.id = '__map_east_pane';
    var pane = new gis.Baidu.PaneControl(east);
    pane.setAnchor(BMAP_ANCHOR_TOP_RIGHT);
    pane.setOffset(new BMap.Size(10, 10));
    this.map.addControl(pane);
};

/**
 * 设置地图的西部面板（左侧面板）悬浮在地图上，可伸缩。
 * 
 * @param {object} west - 实例化东部面板的对象
 *
 * @public
 */
gis.Baidu.prototype.west = function(west) {
    if (west.onLoad) {
        this.map.addEventListener("addcontrol", function() {
            setTimeout(west.onLoad(), 3000);
        });
    }
    west.id = '__map_west_pane';
    var pane = new gis.Baidu.PaneControl(west);
    pane.setAnchor(BMAP_ANCHOR_TOP_LEFT);
    pane.setOffset(new BMap.Size(10, 10));
    this.map.addControl(pane);
};

/**
 * 显示数字的自定义地图覆盖物，通常用于显示统计数字，可钻取。
 *
 * @constructor
 */
gis.Baidu.NumberOverlay = function (map, data, coordinate, triggers) {
    this.data = data;
    this.coordinate = coordinate;
    this.map = map;
    this.triggers = triggers || {};
};

gis.Baidu.NumberOverlay.prototype = new BMap.Overlay();

/**
 * 继承实现百度地图覆盖物的初始化方法。
 *
 * @private
 */
gis.Baidu.NumberOverlay.prototype.initialize = function(map) {
    var div = this.div = document.createElement('div');
    div.value = this.data;
    var self = this;
    
    var self = this;
    if (this.triggers.click) {
        div.addEventListener('click', function() {
            self.triggers.click(this.value);
        });
    }
    div.style.zIndex = BMap.Overlay.getZIndex(this.coordinate.lat);
    div.className = 'bmap-num rounded-circle';
    var span = document.createElement('span');
    div.appendChild(span);
    span.appendChild(document.createTextNode(this.data.text)); 
    map.getPanes().labelPane.appendChild(div);
    return div;
};

/**
 * 继承实现百度地图覆盖物的绘制方法。
 *
 * @private
 */
gis.Baidu.NumberOverlay.prototype.draw = function() {
    var pixel = this.map.pointToOverlayPixel(new BMap.Point(this.coordinate.lng, this.coordinate.lat));
    this.div.style.left = pixel.x - parseInt(0) + 'px';
    this.div.style.top  = pixel.y + 'px';
};

/**
 * 构造地图自定义控件，用于东南西北面板构造。
 *
 * @constructor
 *
 * @private
 */
gis.Baidu.PaneControl = function(options) {
    // id
    this.id = options.id;
    // 在地图上显示的文本
    this.title = options.title || '';
    // 在地图上显示的位置，单位pixel
    this.top = options.top;
    this.left = options.left;
    this.height = options.height;
    this.width = options.width;

    this.contentHtml = options.contentHtml;
    this.onLoad = options.onLoad;
    
    // 是否直接显示
    this.display = options.display || false;
};

gis.Baidu.PaneControl.prototype = new BMap.Control();

gis.Baidu.PaneControl.prototype.initialize = function(map) {
    var ret = document.getElementById(this.id);
    var existing = true;
    if (ret == null) {
        // 创建一个DOM元素
        ret = document.createElement('div');
        ret.setAttribute('id', this.id);
        existing = false;
    }
    ret.innerHTML = '';
    
    ret.style.overflow = 'hidden';

    // 标题
    var titlebar = document.createElement('div');

    var text = document.createElement('div');
    text.appendChild(document.createTextNode(this.title));
    text.className = 'bmap-title';
    
    var icon = document.createElement('div');
    icon.className = 'bmap-icon icon-size-actual';

    titlebar.appendChild(icon);
    titlebar.appendChild(text);

    titlebar.className ='row col-12 bmap-titlebar';
    ret.appendChild(titlebar);

    // 定位
    ret.style.border = '1px solid gray';
    ret.style.backgroundColor = 'white';
    ret.style.width = this.width;
    ret.style.height = this.height;

    var content = document.createElement('div');
    content.style.width = '100%';
    content.style.overflowY = 'auto';
    // this.height could be number + 'px'
    content.style.height = parseInt(this.height) - 32 + 'px';
    content.innerHTML = this.contentHtml;
    // custom scroll bar
    PerfectScrollbar.initialize(content);
    
    ret.appendChild(content);
    
    if (!this.display) {
        ret.style.height = '32px';
        ret.style.width = '32px';
        content.style.display = 'none';
        text.style.display = 'none';
        icon.className = 'bmap-icon icon-size-fullscreen';
    }

    var self = this;
    icon.onclick = function(event) {
        if (ret.style.height == self.height) {
            ret.style.height = '32px';
            ret.style.width = '32px';
            
            content.style.display = 'none';
            text.style.display = 'none';
            icon.className = 'bmap-icon icon-size-fullscreen';
        } else {
            ret.style.height = self.height;
            ret.style.width = self.width;

            content.style.display = '';
            text.style.display = '';
            icon.className = 'bmap-icon icon-size-actual';
        }
    };
    
    if (!existing) {
        map.getContainer().appendChild(ret);
        return ret;
    }
    
    return ret;
};

/**
 * 构建工具栏，工具栏自带搜索框，可以API控制显示隐藏。
 *
 * @param {object} option - 工具栏配置项
 *
 * @constructor
 *
 * @private
 */
gis.Baidu.Toolbar = function(option) {
    this.actions = option.actions || [];
    this.searchUrl = option.searchUrl;
    this.direction = option.direction;
    this.onRestore = option.onRestore;
};

/**
 * 继承于百度地图Control。
 */
gis.Baidu.Toolbar.prototype = new BMap.Control();

/**
 * 初始化工具栏，渲染工具栏显示内容。
 *
 * @param {object} map - 地图实例
 *
 * @returns {Element|*} 根容器对象
 */
gis.Baidu.Toolbar.prototype.initialize = function (map) {
    var ret = document.createElement('div');
    ret.innerHTML = '';

    var searchbar = '' +
    '<div class="input-group">' +
    '    <button class="btn btn-success">全屏</button>' +
    '    <button class="btn btn-success">还原</button>' +
    '    <input type="text" class="form-control" style="width: 200px">' +
    '    <span class="input-group-btn">' +
    '       <button class="btn btn-info" type="button">' +
    '           <i class="fa fa-search"></i>' +
    '       </button>' +
    '    </span>' +
    '</div>';
    ret.innerHTML = searchbar;

    for (var i = 0; i < this.actions.length; i++) {
        var action = this.actions[i];
        var btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.innerText = action.text;
        ret.children[0].appendChild(btn);
    }

    // bind events
    if (this.onRestore) {
        var btnRestore = ret.children[0].children[1];
        btnRestore.addEventListener('click', this.onRestore);
    }
    $(ret.children[0].children[2]).searchbox({
        url: this.searchUrl,
        direction: this.direction
    });


    map.getContainer().appendChild(ret);
    return ret;
};

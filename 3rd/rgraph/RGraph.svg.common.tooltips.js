
RGraph=window.RGraph||{isrgraph:true,isRGraph:true,rgraph:true};RGraph.SVG=RGraph.SVG||{};(function(win,doc,undefined)
{RGraph.SVG.tooltips={};RGraph.SVG.tooltips.css=RGraph.SVG.tooltips.style={display:'inline-block',position:'absolute',padding:'6px',lineHeight:'initial',fontFamily:'Arial',fontSize:'12pt',fontWeight:'normal',textAlign:'center',left:0,top:0,backgroundColor:'black',color:'white',visibility:'visible',zIndex:3,borderRadius:'5px',boxShadow:'rgba(96,96,96,0.5) 0 0 5px',transition:'left ease-out .25s, top ease-out .25s'};RGraph.SVG.tooltip=function(opt)
{var obj=opt.object;RGraph.SVG.fireCustomEvent(obj,'onbeforetooltip');if(!opt.text||typeof opt.text==='undefined'||RGraph.SVG.trim(opt.text).length===0){return;}
var properties=obj.properties;if(typeof properties.tooltipsOverride==='function'){document.body.addEventListener('mouseup',function(e)
{obj.removeHighlight();},false);return(properties.tooltipsOverride)(obj,opt);}
if(!RGraph.SVG.REG.get('tooltip')){var tooltipObj=document.createElement('DIV');tooltipObj.className=properties.tooltipsCssClass;for(var i in RGraph.SVG.tooltips.style){if(typeof i==='string'){tooltipObj.style[i]=substitute(RGraph.SVG.tooltips.style[i]);}}
for(var i in RGraph.SVG.tooltips.css){if(typeof i==='string'){tooltipObj.style[i]=substitute(RGraph.SVG.tooltips.css[i]);}}
if(!RGraph.SVG.isNull(obj.properties.tooltipsCss)){for(var i in obj.properties.tooltipsCss){if(typeof i==='string'){tooltipObj.style[i]=substitute(obj.properties.tooltipsCss[i]);}}}}else{var tooltipObj=RGraph.SVG.REG.get('tooltip');tooltipObj.__object__.removeHighlight();tooltipObj.style.width='';}
if(RGraph.SVG.REG.get('tooltip-lasty')){tooltipObj.style.left=RGraph.SVG.REG.get('tooltip-lastx')+'px';tooltipObj.style.top=RGraph.SVG.REG.get('tooltip-lasty')+'px';}
function substitute(original)
{original=String(original);if(typeof opt.object.tooltipSubstitutions!=='function'){return original;}
if(typeof opt.object.tooltipSubstitutions==='function'){var specific=opt.object.tooltipSubstitutions({index:opt.sequentialIndex});}
var text=original.replace(/%%/g,'___--PERCENT--___')
var keyReplacementFunction=function()
{if(!specific.values){return;}
var colors=properties.tooltipsFormattedKeyColors?properties.tooltipsFormattedKeyColors:properties.colors;for(var i=0,str=[];i<specific.values.length;++i){var value=(typeof specific.values==='object'&&typeof specific.values[i]==='number')?specific.values[i]:0;var color=colors[i];var label=((typeof properties.tooltipsFormattedKeyLabels==='object'&&typeof properties.tooltipsFormattedKeyLabels[i]==='string')?properties.tooltipsFormattedKeyLabels[i]:'');if(typeof opt.object.tooltipsFormattedCustom==='function'){var ret=opt.object.tooltipsFormattedCustom(specific,i,colors);if(ret.continue){continue;};if(typeof ret.label==='string'){label=ret.label;};if(ret.color){color=ret.color;};if(typeof ret.value==='number'){value=ret.value;};}
value=RGraph.SVG.numberFormat({object:opt.object,num:value.toFixed(opt.object.properties.tooltipsFormattedDecimals),thousand:opt.object.properties.tooltipsFormattedThousand||',',point:opt.object.properties.tooltipsFormattedPoint||'.',prepend:opt.object.properties.tooltipsFormattedUnitsPre||'',append:opt.object.properties.tooltipsFormattedUnitsPost||''});var borderRadius=0;if(typeof opt.object.properties.tooltipsFormattedKeyColorsShape==='string'&&opt.object.properties.tooltipsFormattedKeyColorsShape==='circle'){borderRadius='100px';}
var tooltipsFormattedKeyColorsCss='';if(properties.tooltipsFormattedKeyColorsCss){for(property in properties.tooltipsFormattedKeyColorsCss){if(typeof property==='string'){tooltipsFormattedKeyColorsCss+='{1}: {2};'.format(property.replace(/[A-Z]/,function(match)
{return'-'+match.toLowerCase();}),String(properties.tooltipsFormattedKeyColorsCss[property]));}}}
str[i]='<tr><td><div class="RGraph_tooltipsFormattedKeyColor" style="text-align: left; background-color: '
+color+'; color: transparent; pointer-events: none; border-radius: '
+borderRadius+';'+tooltipsFormattedKeyColorsCss+'">Ml</div></td><td style="text-align: left">'
+label
+' '+value+'</td></tr>';}
str=str.join('');text=text.replace('%{key}','<table style="color: inherit">'+str+'</table>');};keyReplacementFunction();text=text.replace(/%{index}/g,specific.index);text=text.replace(/%{dataset2}/g,specific.dataset2);text=text.replace(/%{dataset}/g,specific.dataset);text=text.replace(/%{group2}/g,specific.dataset2);text=text.replace(/%{group}/g,specific.dataset);text=text.replace(/%{sequential_index}/g,specific.sequentialIndex);text=text.replace(/%{seq}/g,specific.sequentialIndex);if(text.indexOf('%{table}')!==-1){(function()
{var str='<table>';if(properties.tooltipsFormattedTableHeaders&&properties.tooltipsFormattedTableHeaders.length){str+='<thead><tr>';for(var i=0;i<properties.tooltipsFormattedTableHeaders.length;++i){str+='<th>'+properties.tooltipsFormattedTableHeaders[i]+'</th>';}
str+='</tr></thead>';}
if(typeof properties.tooltipsFormattedTableData==='object'&&!RGraph.isNull(properties.tooltipsFormattedTableData)){str+='<tbody>';for(var i=0;i<properties.tooltipsFormattedTableData[specific.sequentialIndex].length;++i){str+='<tr>';for(var j=0;j<properties.tooltipsFormattedTableData[specific.sequentialIndex][i].length;++j){str+='<td>'+String(properties.tooltipsFormattedTableData[specific.sequentialIndex][i][j])+'</td>';}
str+='</tr>';}
str+='</tbody>';}
str+='</table>';text=text.replace(/%{table}/g,str);})();}
var reg=/%{prop(?:erty)?:([a-z0-9]+)\[([0-9]+)\]}/i;while(text.match(reg)){var property=RegExp.$1;var index=parseInt(RegExp.$2);if(opt.object.properties[property]){text=text.replace(reg,opt.object.properties[property][index]||'');}else{text=text.replace(reg,'');}
RegExp.lastIndex=null;}
while(text.match(/%{property:([a-z0-9]+)}/i)){var str='%{property:'+RegExp.$1+'}';text=text.replace(str,opt.object.properties[RegExp.$1]);}
while(text.match(/%{prop:([a-z0-9]+)}/i)){var str='%{prop:'+RegExp.$1+'}';text=text.replace(str,opt.object.properties[RegExp.$1]);}
if(opt.object.type==='rose'&&opt.object.properties.variant==='non-equi-angular'){while(text.match(/%{value2}/i)){text=text.replace('%{value2}',specific.value2);}}
while(text.match(/%{value(?:_formatted)?}/i)){var value=specific.value;if(opt.object.type==='waterfall'&&specific.index!=opt.object.data.length-1&&RGraph.SVG.isNull(value)){for(var i=0,tot=0;i<specific.index;++i){tot+=opt.object.data[i];}
value=tot;}
if(text.match(/%{value_formatted}/i)){text=text.replace('%{value_formatted}',typeof value==='number'?RGraph.SVG.numberFormat({object:opt.object,num:value.toFixed(opt.object.properties.tooltipsFormattedDecimals),thousand:opt.object.properties.tooltipsFormattedThousand||',',point:opt.object.properties.tooltipsFormattedPoint||'.',prepend:opt.object.properties.tooltipsFormattedUnitsPre||'',append:opt.object.properties.tooltipsFormattedUnitsPost||''}):null);}else{text=text.replace('%{value}',value);}}
var regexp=/%{function:([A-Za-z0-9]+)\((.*?)\)}/;text=text.replace(/\r/,'|CR|');text=text.replace(/\n/,'|LF|');while(text.match(regexp)){var str=RegExp.$1+'('+RegExp.$2+')';for(var i=0,len=str.length;i<len;++i){str=str.replace(/\r?\n/,"\\n");}
var func=new Function('return '+str);var ret=func();text=text.replace(regexp,ret)}
text=text.replace(/\|CR\|/,' ');text=text.replace(/\|LF\|/,' ');text=text.replace(/\r?\n/g,'<br />');text=text.replace(/___--PERCENT--___/g,'%')
return text.toString();}
tooltipObj.__original_text__=opt.text;opt.text=substitute(opt.text);if(opt.object.properties.tooltipsPointer){opt.text+='<div id="RGraph_tooltipsPointer" style="background-color:rgb(255,255,239);color: transparent;position:absolute;bottom:-5px;left:50%;transform:translateX(-50%) rotate(45deg);width:10px;height:10px"></div>';}
tooltipObj.innerHTML=opt.text;tooltipObj.__text__=opt.text;tooltipObj.id='__rgraph_tooltip_'+obj.id+'_'+obj.uid+'_'+opt.index;tooltipObj.__event__=properties.tooltipsEvent||'click';tooltipObj.__object__=obj;if(typeof opt.index==='number'){tooltipObj.__index__=opt.index;}
if(typeof opt.dataset==='number'){tooltipObj.__dataset__=opt.dataset;}
if(typeof opt.group==='number'||RGraph.SVG.isNull(opt.group)){tooltipObj.__group__=opt.group;}
if(typeof opt.sequentialIndex==='number'){tooltipObj.__sequentialIndex__=opt.sequentialIndex;}
document.body.appendChild(tooltipObj);var width=tooltipObj.offsetWidth,height=tooltipObj.offsetHeight;obj.properties.tooltipsOffsetx=obj.properties.tooltipsOffsetx||0;obj.properties.tooltipsOffsety=obj.properties.tooltipsOffsety||0;tooltipObj.style.left=opt.event.pageX-(width/2)+obj.properties.tooltipsOffsetx+'px';var y=opt.event.pageY-height-15;if(y<0){y=5;}
tooltipObj.style.top=y+obj.properties.tooltipsOffsety+'px';tooltipObj.style.width=width+'px';if(opt.object.properties.tooltipsPointer){var styles=window.getComputedStyle(tooltipObj,false);var pointer=document.getElementById('RGraph_tooltipsPointer');pointer.style.backgroundColor=styles['background-color'];tooltipObj.__pointer__=pointer;var tooltipsPointerCss='';if(opt.object.properties.tooltipsPointerCss){var pointerDiv=document.getElementById('RGraph_tooltipsPointer');for(property in opt.object.properties.tooltipsPointerCss){if(typeof property==='string'){pointerDiv.style[property]=opt.object.properties.tooltipsPointerCss[property];}}}}
if(parseFloat(tooltipObj.style.left)<=5){tooltipObj.style.left=5+obj.properties.tooltipsOffsetx+'px';}
if(parseFloat(tooltipObj.style.left)+parseFloat(tooltipObj.style.width)>window.innerWidth){tooltipObj.style.left=''
tooltipObj.style.right=5+obj.properties.tooltipsOffsety+'px'}
if(opt.object.properties.tooltipsPositionStatic&&typeof opt.object.positionTooltipStatic==='function'){opt.object.positionTooltipStatic({object:opt.object,event:opt.event,tooltip:tooltipObj,index:tooltipObj.__sequentialIndex__});}
if(parseInt(tooltipObj.style.left)<0){var left=parseInt(tooltipObj.style.left);var width=parseInt(tooltipObj.style.width)
left=left+(width*0.1*4);tooltipObj.style.left=left+'px';var pointer=document.getElementById('RGraph_tooltipsPointer');if(pointer){pointer.style.left='calc(10% + 5px)';}}else if((parseInt(tooltipObj.style.left)+parseInt(tooltipObj.offsetWidth))>document.body.offsetWidth){var left=parseInt(tooltipObj.style.left);var width=parseInt(tooltipObj.style.width)
left=left-(width*0.1*4);tooltipObj.style.left=left+'px';var pointer=document.getElementById('RGraph_tooltipsPointer');if(pointer){pointer.style.left='calc(90% - 5px)';}}
if(RGraph.SVG.isFixed(obj.svg)){var scrollTop=window.scrollY||document.documentElement.scrollTop;tooltipObj.style.position='fixed';tooltipObj.style.top=opt.event.pageY-scrollTop-height-10+obj.properties.tooltipsOffsety+'px';}
tooltipObj.onmousedown=function(e)
{e.stopPropagation();};tooltipObj.onmouseup=function(e)
{e.stopPropagation();};tooltipObj.onclick=function(e)
{if(e.button==0){e.stopPropagation();}};document.body.addEventListener('mouseup',function(e)
{RGraph.SVG.hideTooltip();},false);RGraph.SVG.REG.set('tooltip',tooltipObj);RGraph.SVG.REG.set('tooltip-lastx',parseFloat(tooltipObj.style.left));RGraph.SVG.REG.set('tooltip-lasty',parseFloat(tooltipObj.style.top));RGraph.SVG.fireCustomEvent(obj,'ontooltip');};})(window,document);
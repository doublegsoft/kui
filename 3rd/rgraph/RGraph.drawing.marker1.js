
RGraph=window.RGraph||{isrgraph:true,isRGraph:true,rgraph:true};RGraph.Drawing=RGraph.Drawing||{};RGraph.Drawing.Marker1=function(conf)
{var id=conf.id,canvas=document.getElementById(id),x=conf.x,y=conf.y,radius=conf.radius,text=conf.text;this.id=id;this.canvas=canvas;this.context=this.canvas.getContext("2d");this.colorsParsed=false;this.canvas.__object__=this;this.original_colors=[];this.firstDraw=true;this.centerx=x;this.centery=y;this.radius=radius;this.text=text;this.type='drawing.marker1';this.isRGraph=true;this.isrgraph=true;this.rgraph=true;this.uid=RGraph.createUID();this.canvas.uid=this.canvas.uid?this.canvas.uid:RGraph.createUID();this.properties={colorsStroke:'black',colorsFill:'white',linewidth:2,textColor:'black',textSize:12,textFont:'Arial, Verdana, sans-serif',textBold:false,textItalic:false,textAccessible:true,textAccessibleOverflow:'visible',textAccessiblePointerevents:false,shadow:true,shadowColor:'#aaa',shadowOffsetx:0,shadowOffsety:0,shadowBlur:15,highlightStroke:'rgba(0,0,0,0)',highlightFill:'rgba(255,0,0,0.7)',tooltips:null,tooltipsHighlight:true,tooltipsCssClass:'RGraph_tooltip',tooltipsCss:null,tooltipsEvent:'onclick',tooltipsFormattedPoint:'.',tooltipsFormattedThousand:',',tooltipsFormattedDecimals:0,tooltipsFormattedUnitsPre:'',tooltipsFormattedUnitsPost:'',tooltipsPointer:true,tooltipsPositionStatic:true,align:'center',clearto:'rgba(0,0,0,0)'}
if(!this.canvas){alert('[DRAWING.MARKER1] No canvas support');return;}
this.$0={};this.coords=[];this.coordsText=[];var properties=this.properties;this.path=RGraph.pathObjectFunction;if(RGraph.Effects&&typeof RGraph.Effects.decorate==='function'){RGraph.Effects.decorate(this);}
this.set=function(name)
{var value=typeof arguments[1]==='undefined'?null:arguments[1];if(arguments.length===1&&typeof arguments[0]==='object'){for(i in arguments[0]){if(typeof i==='string'){this.set(i,arguments[0][i]);}}
return this;}
properties[name]=value;return this;};this.get=function(name)
{return properties[name];};this.draw=function()
{RGraph.fireCustomEvent(this,'onbeforedraw');if(!this.canvas.__rgraph_aa_translated__){this.context.translate(0.5,0.5);this.canvas.__rgraph_aa_translated__=true;}
var r=this.radius;if(properties.align=='left'){this.markerCenterx=this.centerx-r-r-3;this.markerCentery=this.centery-r-r-3;}else if(properties.align=='right'){this.markerCenterx=this.centerx+r+r+3;this.markerCentery=this.centery-r-r-3;}else{this.markerCenterx=this.centerx;this.markerCentery=this.centery-r-r-3;}
if(!this.colorsParsed){this.parseColors();this.colorsParsed=true;}
this.coordsText=[];this.path('b lw %',properties.linewidth);if(properties.shadow){RGraph.setShadow(this,properties.shadowColor,properties.shadowOffsetx,properties.shadowOffsety,properties.shadowBlur);}
this.drawMarker();this.path('c s % f %',properties.colorsStroke,properties.colorsFill);RGraph.noShadow(this);var textConf=RGraph.getTextConf({object:this,prefix:'text'});this.context.fillStyle=properties.textColor;RGraph.text({object:this,font:textConf.font,size:textConf.size,color:textConf.color,bold:textConf.bold,italic:textConf.italic,x:this.coords[0][0]-1,y:this.coords[0][1]-1,text:this.text,valign:'center',halign:'center',tag:'labels'});RGraph.installEventListeners(this);if(this.firstDraw){this.firstDraw=false;RGraph.fireCustomEvent(this,'onfirstdraw');this.firstDrawFunc();}
RGraph.fireCustomEvent(this,'ondraw');return this;};this.exec=function(func)
{func(this);return this;};this.getObjectByXY=function(e)
{if(this.getShape(e)){return this;}};this.getShape=function(e)
{var mouseXY=RGraph.getMouseXY(e),mouseX=mouseXY[0],mouseY=mouseXY[1];this.context.beginPath();this.drawMarker();if(this.context.isPointInPath(mouseXY[0],mouseXY[1])){if(RGraph.parseTooltipText&&properties.tooltips){var tooltip=RGraph.parseTooltipText(properties.tooltips,0);}
return{object:this,x:this.coords[0][0],y:this.coords[0][1],radius:this.coords[0][2],dataset:0,index:0,sequentialIndex:0,tooltip:typeof tooltip==='string'?tooltip:null};}
return null;};this.highlight=function(shape)
{if(properties.tooltipsHighlight){if(typeof properties.highlightStyle==='function'){(properties.highlightStyle)(shape);}else{this.context.beginPath();this.context.strokeStyle=properties.highlightStroke;this.context.fillStyle=properties.highlightFill;this.drawMarker();this.context.closePath();this.context.stroke();this.context.fill();}}};this.drawMarker=function()
{var r=this.radius;if(properties.align==='left'){var x=this.markerCenterx,y=this.markerCentery;this.path('a % % % % % false',x,y,r,RGraph.HALFPI,RGraph.TWOPI);this.path('qc % % % %',x+r,y+r,x+r+r,y+r+r);this.path('qc % % % %',x+r,y+r,x,y+r);}else if(properties.align==='right'){var x=this.markerCenterx,y=this.markerCentery;this.path('a % % % % % true',x,y,r,RGraph.HALFPI,RGraph.PI);this.path('qc % % % %',x-r,y+r,x-r-r,y+r+r);this.path('qc % % % %',x-r,y+r,x,y+r);}else{var x=this.markerCenterx,y=this.markerCentery;this.path('a % % % % % true',x,y,r,RGraph.HALFPI/2,RGraph.PI-(RGraph.HALFPI/2));this.path('qc % % % %',x,y+r+(r/4),x,y+r+r-2);this.path('qc % % % %',x,y+r+(r/4),x+(Math.cos(RGraph.HALFPI/2)*r),y+(Math.sin(RGraph.HALFPI/2)*r));}
this.coords[0]=[x,y,r];};this.parseColors=function()
{if(this.original_colors.length===0){this.original_colors.colorsFill=RGraph.arrayClone(properties.colorsFill);this.original_colors.colorsStroke=RGraph.arrayClone(properties.colorsStroke);this.original_colors.highlightFill=RGraph.arrayClone(properties.highlightFill);this.original_colors.highlightStroke=RGraph.arrayClone(properties.highlightStroke);this.original_colors.textColor=RGraph.arrayClone(properties.textColor);}
properties.colorsFill=this.parseSingleColorForGradient(properties.colorsFill);properties.colorsStroke=this.parseSingleColorForGradient(properties.colorsStroke);properties.highlightStroke=this.parseSingleColorForGradient(properties.highlightStroke);properties.highlightFill=this.parseSingleColorForGradient(properties.highlightFill);properties.textColor=this.parseSingleColorForGradient(properties.textColor);};this.reset=function()
{};this.parseSingleColorForGradient=function(color)
{if(!color||typeof color!='string'){return color;}
if(color.match(/^gradient\((.*)\)$/i)){if(color.match(/^gradient\(({.*})\)$/i)){return RGraph.parseJSONGradient({object:this,def:RegExp.$1});}
var parts=RegExp.$1.split(':'),grad=this.context.createRadialGradient(this.markerCenterx,this.markerCentery,0,this.markerCenterx,this.markerCentery,this.radius),diff=1/(parts.length-1);grad.addColorStop(0,RGraph.trim(parts[0]));for(var j=1;j<parts.length;++j){grad.addColorStop(j*diff,RGraph.trim(parts[j]));}}
return grad?grad:color;};this.on=function(type,func)
{if(type.substr(0,2)!=='on'){type='on'+type;}
if(typeof this[type]!=='function'){this[type]=func;}else{RGraph.addCustomEventListener(this,type,func);}
return this;};this.firstDrawFunc=function()
{};this.tooltipSubstitutions=function(opt)
{return{index:0,dataset:0,sequentialIndex:0,value:null};};this.positionTooltipStatic=function(args)
{var obj=args.object,e=args.event,tooltip=args.tooltip,index=args.index,canvasXY=RGraph.getCanvasXY(obj.canvas),x=this.centerx;if(properties.align=='left'){x=x-this.radius-this.radius;}else if(properties.align=='right'){x=x+this.radius+this.radius;}
args.tooltip.style.left=(canvasXY[0]
+x
-(tooltip.offsetWidth/2)
+obj.properties.tooltipsOffsetx)+'px';args.tooltip.style.top=(canvasXY[1]
-tooltip.offsetHeight
+obj.properties.tooltipsOffsety
+this.centery
-this.radius-this.radius-this.radius
-15)+'px';};RGraph.register(this);RGraph.parseObjectStyleConfig(this,conf.options);};
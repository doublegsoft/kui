
RGraph=window.RGraph||{isrgraph:true,isRGraph:true,rgraph:true};RGraph.Drawing=RGraph.Drawing||{};RGraph.Drawing.Poly=function(conf)
{var id=conf.id,coords=conf.coords;this.id=id;this.canvas=document.getElementById(this.id);this.context=this.canvas.getContext('2d');this.colorsParsed=false;this.canvas.__object__=this;this.coords=coords;this.coordsText=[];this.original_colors=[];this.firstDraw=true;this.type='drawing.poly';this.isRGraph=true;this.isrgraph=true;this.rgraph=true;this.uid=RGraph.createUID();this.canvas.uid=this.canvas.uid?this.canvas.uid:RGraph.createUID();this.properties={linewidth:1,colorsStroke:'black',colorsFill:'red',tooltips:null,tooltipsOverride:null,tooltipsEffect:'fade',tooltipsCssClass:'RGraph_tooltip',tooltipsCss:null,tooltipsEvent:'onclick',tooltipsHighlight:true,tooltipsFormattedPoint:'.',tooltipsFormattedThousand:',',tooltipsFormattedDecimals:0,tooltipsFormattedUnitsPre:'',tooltipsFormattedUnitsPost:'',tooltipsPointer:true,tooltipsPositionStatic:true,highlightStroke:'rgba(0,0,0,0)',highlightFill:'rgba(255,255,255,0.7)',shadow:false,shadowColor:'rgba(0,0,0,0.2)',shadowOffsetx:3,shadowOffsety:3,shadowBlur:5,clearto:'rgba(0,0,0,0)'}
if(!this.canvas){alert('[DRAWING.POLY] No canvas support');return;}
this.$0={};var properties=this.properties;this.path=RGraph.pathObjectFunction;if(RGraph.Effects&&typeof RGraph.Effects.decorate==='function'){RGraph.Effects.decorate(this);}
this.set=function(name)
{var value=typeof arguments[1]==='undefined'?null:arguments[1];if(arguments.length===1&&typeof arguments[0]==='object'){for(i in arguments[0]){if(typeof i==='string'){this.set(i,arguments[0][i]);}}
return this;}
properties[name]=value;return this;};this.get=function(name)
{return properties[name];};this.draw=function()
{RGraph.fireCustomEvent(this,'onbeforedraw');if(!this.canvas.__rgraph_aa_translated__){this.context.translate(0.5,0.5);this.canvas.__rgraph_aa_translated__=true;}
if(!this.colorsParsed){this.parseColors();this.colorsParsed=true;}
this.coordsText=[];if(properties.shadow){this.context.shadowColor=properties.shadowColor;this.context.shadowOffsetX=properties.shadowOffsetx;this.context.shadowOffsetY=properties.shadowOffsety;this.context.shadowBlur=properties.shadowBlur;}
this.context.strokeStyle=properties.colorsStroke;this.context.fillStyle=properties.colorsFill;this.drawPoly();this.context.lineWidth=properties.linewidth;RGraph.noShadow(this);RGraph.installEventListeners(this);if(this.firstDraw){this.firstDraw=false;RGraph.fireCustomEvent(this,'onfirstdraw');this.firstDrawFunc();}
RGraph.fireCustomEvent(this,'ondraw');return this;};this.exec=function(func)
{func(this);return this;};this.getObjectByXY=function(e)
{if(this.getShape(e)){return this;}};this.drawPoly=function()
{var coords=this.coords;this.path('b m % %',coords[0][0],coords[0][1]);for(var i=1,len=coords.length;i<len;++i){this.context.lineTo(coords[i][0],coords[i][1]);}
this.path('lw % c f % s %',properties.linewidth,this.context.fillStyle,this.context.strokeStyle);};this.getShape=function(e)
{var coords=this.coords,mouseXY=RGraph.getMouseXY(e),mouseX=mouseXY[0],mouseY=mouseXY[1];var old_strokestyle=this.context.strokeStyle,old_fillstyle=this.context.fillStyle;this.context.beginPath();this.context.strokeStyle='rgba(0,0,0,0)';this.context.fillStyle='rgba(0,0,0,0)';this.drawPoly();this.context.strokeStyle=old_strokestyle;this.context.fillStyle=old_fillstyle;if(this.context.isPointInPath(mouseX,mouseY)){if(RGraph.parseTooltipText&&properties.tooltips){var tooltip=RGraph.parseTooltipText(properties.tooltips,0);}
return{object:this,coords:this.coords,dataset:0,index:0,sequentialIndex:0,tooltip:typeof tooltip==='string'?tooltip:null};}
return null;};this.highlight=function(shape)
{this.context.fillStyle=properties.colorsFill;if(properties.tooltipsHighlight){if(typeof properties.highlightStyle==='function'){(properties.highlightStyle)(shape);}else{this.path('b');this.drawPoly();this.path('f % s %',properties.highlightFill,properties.highlightStroke);}}};this.parseColors=function()
{if(this.original_colors.length===0){this.original_colors.colorsFill=RGraph.arrayClone(properties.colorsFill);this.original_colors.colorsStroke=RGraph.arrayClone(properties.colorsStroke);this.original_colors.highlightStroke=RGraph.arrayClone(properties.highlightStroke);this.original_colors.highlightFill=RGraph.arrayClone(properties.highlightFill);}
var func=this.parseSingleColorForGradient;properties.colorsFill=func(properties.colorsFill);properties.colorsStroke=func(properties.colorsStroke);properties.highlightStroke=func(properties.highlightStroke);properties.highlightFill=func(properties.highlightFill);};this.reset=function()
{};this.parseSingleColorForGradient=function(color)
{if(!color){return color;}
if(typeof color==='string'&&color.match(/^gradient\((.*)\)$/i)){if(color.match(/^gradient\(({.*})\)$/i)){return RGraph.parseJSONGradient({object:this,def:RegExp.$1});}
var parts=RegExp.$1.split(':'),grad=this.context.createLinearGradient(0,0,this.canvas.width,0),diff=1/(parts.length-1);grad.addColorStop(0,RGraph.trim(parts[0]));for(var j=1,len=parts.length;j<len;++j){grad.addColorStop(j*diff,RGraph.trim(parts[j]));}}
return grad?grad:color;};this.on=function(type,func)
{if(type.substr(0,2)!=='on'){type='on'+type;}
if(typeof this[type]!=='function'){this[type]=func;}else{RGraph.addCustomEventListener(this,type,func);}
return this;};this.firstDrawFunc=function()
{};this.tooltipSubstitutions=function(opt)
{return{index:0,dataset:0,sequentialIndex:0,value:null};};this.positionTooltipStatic=function(args)
{var obj=args.object,e=args.event,tooltip=args.tooltip,index=args.index,canvasXY=RGraph.getCanvasXY(obj.canvas);for(var i=0,minx=this.coords[0][0],maxx=0,miny=this.coords[0][1],maxy=0;i<this.coords.length;++i){minx=Math.min(minx,this.coords[i][0]);maxx=Math.max(maxx,this.coords[i][0]);miny=Math.min(miny,this.coords[i][1]);maxy=Math.max(maxy,this.coords[i][1]);}
var x=((maxx-minx)/2)+minx,y=((maxy-miny)/2)+miny;args.tooltip.style.left=(canvasXY[0]
-(tooltip.offsetWidth/2)
+obj.properties.tooltipsOffsetx
+x)+'px';args.tooltip.style.top=(canvasXY[1]
-tooltip.offsetHeight
+obj.properties.tooltipsOffsety
+y
-10)+'px';};RGraph.register(this);RGraph.parseObjectStyleConfig(this,conf.options);};
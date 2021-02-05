
RGraph=window.RGraph||{isrgraph:true,isRGraph:true,rgraph:true};RGraph.Drawing=RGraph.Drawing||{};RGraph.Drawing.Rect=function(conf)
{var id=conf.id,x=conf.x,y=conf.y,width=conf.width,height=conf.height;this.id=id;this.canvas=document.getElementById(this.id);this.context=this.canvas.getContext('2d');this.colorsParsed=false;this.canvas.__object__=this;this.original_colors=[];this.coordsText=[];this.firstDraw=true;this.type='drawing.rect';this.isRGraph=true;this.isrgraph=true;this.rgraph=true;this.uid=RGraph.createUID();this.canvas.uid=this.canvas.uid?this.canvas.uid:RGraph.createUID();this.properties={colorsStroke:'rgba(0,0,0,0)',colorsFill:'red',shadow:false,shadowColor:'gray',shadowOffsetx:3,shadowOffsety:3,shadowBlur:5,highlightStroke:'black',highlightFill:'rgba(255,255,255,0.7)',tooltips:null,tooltipsEffect:'fade',tooltipsCssClass:'RGraph_tooltip',tooltipsCss:null,tooltipsEvent:'onclick',tooltipsHighlight:true,tooltipsCoordsPage:false,tooltipsValign:'top',tooltipsFormattedPoint:'.',tooltipsFormattedThousand:',',tooltipsFormattedDecimals:0,tooltipsFormattedUnitsPre:'',tooltipsFormattedUnitsPost:'',tooltipsPointer:true,tooltipsPositionStatic:true,clearto:'rgba(0,0,0,0)'}
if(!this.canvas){alert('[DRAWING.RECT] No canvas support');return;}
this.coords=[[Math.round(x),Math.round(y),width,height]];this.$0={};var properties=this.properties;this.path=RGraph.pathObjectFunction;if(RGraph.Effects&&typeof RGraph.Effects.decorate==='function'){RGraph.Effects.decorate(this);}
this.set=function(name)
{var value=typeof arguments[1]==='undefined'?null:arguments[1];if(arguments.length===1&&typeof arguments[0]==='object'){for(i in arguments[0]){if(typeof i==='string'){this.set(i,arguments[0][i]);}}
return this;}
properties[name]=value;return this;};this.get=function(name)
{return properties[name];};this.draw=function()
{RGraph.fireCustomEvent(this,'onbeforedraw');if(!this.canvas.__rgraph_aa_translated__){this.context.translate(0.5,0.5);this.canvas.__rgraph_aa_translated__=true;}
this.coordsText=[];if(!this.colorsParsed){this.parseColors();this.colorsParsed=true;}
this.path('b');if(properties.shadow){this.path('sc % sx % sy % sb %',properties.shadowColor,properties.shadowOffsetx,properties.shadowOffsety,properties.shadowBlur);}
this.path('r % % % % f %',this.coords[0][0],this.coords[0][1],this.coords[0][2],this.coords[0][3],properties.colorsFill);RGraph.noShadow(this);this.path('s %',properties.colorsStroke);RGraph.installEventListeners(this);if(this.firstDraw){this.firstDraw=false;RGraph.fireCustomEvent(this,'onfirstdraw');this.firstDrawFunc();}
RGraph.fireCustomEvent(this,'ondraw');return this;};this.exec=function(func)
{func(this);return this;};this.getObjectByXY=function(e)
{if(this.getShape(e)){return this;}};this.getShape=function(e)
{var mouseXY=RGraph.getMouseXY(e),mouseX=mouseXY[0],mouseY=mouseXY[1];for(var i=0,len=this.coords.length;i<len;i++){var coords=this.coords[i];var left=coords[0],top=coords[1],width=coords[2],height=coords[3];if(mouseX>=left&&mouseX<=(left+width)&&mouseY>=top&&mouseY<=(top+height)){if(RGraph.parseTooltipText&&properties.tooltips){var tooltip=RGraph.parseTooltipText(properties.tooltips,0);}
return{object:this,x:left,y:top,width:width,height:height,dataset:0,index:0,sequentialIndex:0,tooltip:typeof tooltip==='string'?tooltip:null};}}
return null;};this.highlight=function(shape)
{if(typeof properties.highlightStyle==='function'){(properties.highlightStyle)(shape);}else{RGraph.Highlight.rect(this,shape);}};this.parseColors=function()
{if(this.original_colors.length===0){this.original_colors.colorsFill=RGraph.arrayClone(properties.colorsFill);this.original_colors.colorsStroke=RGraph.arrayClone(properties.colorsStroke);this.original_colors.highlightStroke=RGraph.arrayClone(properties.highlightStroke);this.original_colors.highlightFill=RGraph.arrayClone(properties.highlightFill);}
properties.colorsFill=this.parseSingleColorForGradient(properties.colorsFill);properties.colorsStroke=this.parseSingleColorForGradient(properties.colorsStroke);properties.highlightStroke=this.parseSingleColorForGradient(properties.highlightStroke);properties.highlightFill=this.parseSingleColorForGradient(properties.highlightFill);};this.reset=function()
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
{var obj=args.object,e=args.event,tooltip=args.tooltip,index=args.index,canvasXY=RGraph.getCanvasXY(obj.canvas);args.tooltip.style.left=(canvasXY[0]
+this.coords[0][0]+(this.coords[0][2]/2)
-(tooltip.offsetWidth/2)
+obj.properties.tooltipsOffsetx)+'px';args.tooltip.style.top=(canvasXY[1]
-tooltip.offsetHeight
+obj.properties.tooltipsOffsety
+this.coords[0][1]
-10)+'px';};RGraph.register(this);RGraph.parseObjectStyleConfig(this,conf.options);};

RGraph=window.RGraph||{isrgraph:true,isRGraph:true,rgraph:true};RGraph.Drawing=RGraph.Drawing||{};RGraph.Drawing.Circle=function(conf)
{var id=conf.id,canvas=document.getElementById(id),x=conf.x,y=conf.y,radius=conf.radius;this.id=id;this.canvas=document.getElementById(this.id);this.context=this.canvas.getContext('2d');this.canvas.__object__=this;this.original_colors=[];this.firstDraw=true;this.centerx=x;this.centery=y;this.radius=radius;this.type='drawing.circle';this.isRGraph=true;this.isrgraph=true;this.rgraph=true;this.uid=RGraph.createUID();this.canvas.uid=this.canvas.uid?this.canvas.uid:RGraph.createUID();this.properties={colorsStroke:'rgba(0,0,0,0)',colorsFill:'red',shadow:false,shadowColor:'gray',shadowOffsetx:3,shadowOffsety:3,shadowBlur:5,highlightStyle:null,highlightStroke:'black',highlightFill:'rgba(255,255,255,0.7)',tooltips:null,tooltipsHighlight:true,tooltipsCssClass:'RGraph_tooltip',tooltipsCss:null,tooltipsEvent:'onclick',tooltipsFormattedThousand:',',tooltipsFormattedPoint:'.',tooltipsFormattedDecimals:0,tooltipsFormattedUnitsPre:'',tooltipsFormattedUnitsPost:'',tooltipsPointer:true,tooltipsPositionStatic:true,linewidth:1,clearto:'rgba(0,0,0,0)'}
if(!this.canvas){alert('[DRAWING.CIRCLE] No canvas support');return;}
this.coords=[[this.centerx,this.centery,this.radius]];this.$0={};var properties=this.properties;this.path=RGraph.pathObjectFunction;if(RGraph.Effects&&typeof RGraph.Effects.decorate==='function'){RGraph.Effects.decorate(this);}
this.set=function(name)
{var value=typeof arguments[1]==='undefined'?null:arguments[1];if(arguments.length===1&&typeof arguments[0]==='object'){for(i in arguments[0]){if(typeof i==='string'){this.set(i,arguments[0][i]);}}
return this;}
properties[name]=value;return this;};this.get=function(name)
{return properties[name];};this.draw=function()
{RGraph.fireCustomEvent(this,'onbeforedraw');if(!this.canvas.__rgraph_aa_translated__){this.context.translate(0.5,0.5);this.canvas.__rgraph_aa_translated__=true;}
if(!this.colorsParsed){this.parseColors();this.colorsParsed=true;}
this.path('b lw %',properties.linewidth);if(properties.shadow){RGraph.setShadow({object:this,prefix:'shadow'});}
this.path('b a % % % % % false f % s %',this.coords[0][0],this.coords[0][1],this.radius,0,RGraph.TWOPI,properties.colorsFill,properties.colorsStroke);RGraph.noShadow(this);RGraph.installEventListeners(this);if(this.firstDraw){this.firstDraw=false;RGraph.fireCustomEvent(this,'onfirstdraw');this.firstDrawFunc();}
RGraph.fireCustomEvent(this,'ondraw');return this;};this.exec=function(func)
{func(this);return this;};this.getObjectByXY=function(e)
{if(this.getShape(e)){return this;}};this.getShape=function(e)
{var mouseXY=RGraph.getMouseXY(e),mouseX=mouseXY[0],mouseY=mouseXY[1];if(RGraph.getHypLength(this.centerx,this.centery,mouseXY[0],mouseXY[1])<=this.radius){if(RGraph.parseTooltipText&&properties.tooltips){var tooltip=RGraph.parseTooltipText(properties.tooltips,0);}
return{object:this,x:this.centerx,y:this.centery,radius:this.radius,dataset:0,index:0,sequentialIndex:0,tooltip:typeof tooltip==='string'?tooltip:null};}
return null;};this.highlight=function(shape)
{if(properties.tooltipsHighlight){if(typeof properties.highlightStyle==='function'){(properties.highlightStyle)(shape);}else{this.path('b a % % % % % false f % s %',this.centerx,this.centery,this.radius+0.5,0,RGraph.TWOPI,properties.highlightFill,properties.highlightStroke);}}};this.parseColors=function()
{if(this.original_colors.length===0){this.original_colors.colorsFill=RGraph.arrayClone(properties.colorsFill);this.original_colors.colorsStroke=RGraph.arrayClone(properties.colorsStroke);this.original_colors.highlightStroke=RGraph.arrayClone(properties.highlightStroke);this.original_colors.highlightFill=RGraph.arrayClone(properties.highlightFill);}
properties.colorsFill=this.parseSingleColorForGradient(properties.colorsFill);properties.colorsStroke=this.parseSingleColorForGradient(properties.colorsStroke);properties.highlightStroke=this.parseSingleColorForGradient(properties.highlightStroke);properties.highlightFill=this.parseSingleColorForGradient(properties.highlightFill);};this.reset=function()
{};this.parseSingleColorForGradient=function(color)
{if(!color){return color;}
if(typeof color==='string'&&color.match(/^gradient\((.*)\)$/i)){if(color.match(/^gradient\(({.*})\)$/i)){return RGraph.parseJSONGradient({object:this,def:RegExp.$1});}
var parts=RegExp.$1.split(':');var grad=this.context.createRadialGradient(this.centerx,this.centery,0,this.centerx,this.centery,this.radius),diff=1/(parts.length-1);for(var j=0;j<parts.length;j+=1){grad.addColorStop(j*diff,RGraph.trim(parts[j]));}}
return grad?grad:color;};this.on=function(type,func)
{if(type.substr(0,2)!=='on'){type='on'+type;}
if(typeof this[type]!=='function'){this[type]=func;}else{RGraph.addCustomEventListener(this,type,func);}
return this;};this.firstDrawFunc=function()
{};this.tooltipSubstitutions=function(opt)
{return{index:0,dataset:0,sequentialIndex:0,value:null};};this.positionTooltipStatic=function(args)
{var obj=args.object,e=args.event,tooltip=args.tooltip,index=args.index,canvasXY=RGraph.getCanvasXY(obj.canvas);args.tooltip.style.left=(canvasXY[0]
+this.centerx
-(tooltip.offsetWidth/2)
+obj.properties.tooltipsOffsetx)+'px';args.tooltip.style.top=(canvasXY[1]
-tooltip.offsetHeight
+obj.properties.tooltipsOffsety
+this.centery
-10)+'px';};RGraph.register(this);RGraph.parseObjectStyleConfig(this,conf.options);};
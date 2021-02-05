
RGraph=window.RGraph||{isrgraph:true,isRGraph:true,rgraph:true};RGraph.Drawing=RGraph.Drawing||{};RGraph.Drawing.Text=function(conf)
{var id=conf.id
var x=conf.x;var y=conf.y;var text=String(conf.text);this.id=id;this.canvas=document.getElementById(id);this.context=this.canvas.getContext('2d');this.colorsParsed=false;this.canvas.__object__=this;this.x=x;this.y=y;this.text=String(text);this.coords=[];this.coordsText=[];this.original_colors=[];this.firstDraw=true;this.type='drawing.text';this.isRGraph=true;this.isrgraph=true;this.rgraph=true;this.uid=RGraph.createUID();this.canvas.uid=this.canvas.uid?this.canvas.uid:RGraph.createUID();this.properties={textSize:12,textFont:'Arial, Verdana, sans-serif',textBold:false,textItalic:false,angle:0,colors:['black'],highlightStroke:'#ccc',highlightFill:'rgba(255,255,255,0.5)',tooltips:null,tooltipsEffect:'fade',tooltipsCssClass:'RGraph_tooltip',tooltipsCss:null,tooltipsEvent:'onclick',tooltipsHighlight:true,tooltipsCoordsPage:false,tooltipsFormattedPoint:'.',tooltipsFormattedThousand:',',tooltipsFormattedDecimals:0,tooltipsFormattedUnitsPre:'',tooltipsFormattedUnitsPost:'',tooltipsPointer:true,tooltipsPositionStatic:true,bounding:false,boundingFill:'rgba(255,255,255,0.7)',boundingStroke:'#777',boundingShadow:false,boundingShadowColor:'#ccc',boundingShadowBlur:3,boundingShadowOffsetx:3,boundingShadowOffsety:3,marker:false,halign:'left',valign:'bottom',link:null,linkTarget:'_self',linkOptions:'',textAccessible:true,textAccessibleOverflow:'visible',textAccessiblePointerevents:false,shadow:false,shadowColor:'#ccc',shadowOffsetx:2,shadowOffsety:2,shadowBlur:3,clearto:'rgba(0,0,0,0)'}
if(!this.canvas){alert('[DRAWING.TEXT] No canvas support');return;}
this.$0={};var properties=this.properties;this.path=RGraph.pathObjectFunction;if(RGraph.Effects&&typeof RGraph.Effects.decorate==='function'){RGraph.Effects.decorate(this);}
this.set=function(name)
{var value=typeof arguments[1]==='undefined'?null:arguments[1];if(arguments.length===1&&typeof arguments[0]==='object'){for(i in arguments[0]){if(typeof i==='string'){this.set(i,arguments[0][i]);}}
return this;}
properties[name]=value;return this;};this.get=function(name)
{return properties[name];};this.draw=function()
{RGraph.fireCustomEvent(this,'onbeforedraw');if(!this.canvas.__rgraph_aa_translated__){this.context.translate(0.5,0.5);this.canvas.__rgraph_aa_translated__=true;}
if(!this.colorsParsed){this.parseColors();this.colorsParsed=true;}
this.coords=[];this.coordsText=[];var dimensions=RGraph.measureText(this.text,properties.textBold,properties.textFont,properties.textSize);this.context.fillStyle=properties.colors[0];if(properties.shadow){RGraph.setShadow(this,properties.shadowColor,properties.shadowOffsetx,properties.shadowOffsety,properties.shadowBlur);}
var ret=RGraph.text({object:this,font:properties.textFont,size:properties.textSize,bold:properties.textBold,italic:properties.textItalic,color:properties.colors[0],x:this.x,y:this.y,text:this.text,angle:properties.angle,bounding:properties.bounding,'bounding.fill':properties.boundingFill,'bounding.stroke':properties.boundingStroke,'bounding.shadow':properties.boundingShadow,'bounding.shadow.color':properties.boundingShadowColor,'bounding.shadow.blur':properties.boundingShadowBlur,'bounding.shadow.offsetx':properties.boundingShadowOffsetx,'bounding.shadow.offsety':properties.boundingShadowOffsety,marker:properties.marker,halign:properties.halign,valign:properties.valign});if(properties.shadow){RGraph.noShadow(this);}
this.coords.push({0:ret.x,x:ret.x,1:ret.y,y:ret.y,2:ret.width,width:ret.width,3:ret.height,height:ret.height});RGraph.installEventListeners(this);if(this.firstDraw){this.firstDraw=false;RGraph.fireCustomEvent(this,'onfirstdraw');this.firstDrawFunc();}
RGraph.fireCustomEvent(this,'ondraw');return this;};this.exec=function(func)
{func(this);return this;};this.getObjectByXY=function(e)
{if(this.getShape(e)){return this;}};this.getShape=function(e)
{var coords=this.coords;var mouseXY=RGraph.getMouseXY(e);var mouseX=mouseXY[0];var mouseY=mouseXY[1];for(var i=0,len=this.coords.length;i<len;i++){var left=coords[i].x;var top=coords[i].y;var width=coords[i].width;var height=coords[i].height;if(mouseX>=left&&mouseX<=(left+width)&&mouseY>=top&&mouseY<=(top+height)){if(RGraph.parseTooltipText&&properties.tooltips){var tooltip=RGraph.parseTooltipText(properties.tooltips,0);}
return{object:this,x:left,y:top,width:width,height:height,dataset:0,index:0,sequentialIndex:0,tooltip:typeof tooltip==='string'?tooltip:null};}}
return null;};this.highlight=function(shape)
{if(typeof properties.highlightStyle==='function'){(properties.highlightStyle)(shape);}else{RGraph.Highlight.rect(this,shape);}};this.parseColors=function()
{if(this.original_colors.length===0){this.original_colors.colors=RGraph.arrayClone(properties.colors)[0];this.original_colors.colorsFill=RGraph.arrayClone(properties.colorsFill);this.original_colors.colorsStroke=RGraph.arrayClone(properties.colorsStroke);this.original_colors.highlightStroke=RGraph.arrayClone(properties.highlightStroke);this.original_colors.highlightFill=RGraph.arrayClone(properties.highlightFill);}
properties.colors[0]=this.parseSingleColorForGradient(properties.colors[0]);properties.colorsFill=this.parseSingleColorForGradient(properties.colorsFill);properties.colorsStroke=this.parseSingleColorForGradient(properties.colorsStroke);properties.highlightStroke=this.parseSingleColorForGradient(properties.highlightStroke);properties.highlightFill=this.parseSingleColorForGradient(properties.highlightFill);};this.reset=function()
{};this.parseSingleColorForGradient=function(color)
{if(!color){return color;}
if(typeof color==='string'&&color.match(/^gradient\((.*)\)$/i)){if(color.match(/^gradient\(({.*})\)$/i)){return RGraph.parseJSONGradient({object:this,def:RegExp.$1});}
var parts=RegExp.$1.split(':');var grad=this.context.createLinearGradient(0,0,this.canvas.width,0);var diff=1/(parts.length-1);grad.addColorStop(0,RGraph.trim(parts[0]));for(var j=1,len=parts.length;j<len;++j){grad.addColorStop(j*diff,RGraph.trim(parts[j]));}}
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
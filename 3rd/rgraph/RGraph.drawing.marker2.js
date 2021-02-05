
RGraph=window.RGraph||{isrgraph:true,isRGraph:true,rgraph:true};RGraph.Drawing=RGraph.Drawing||{};RGraph.Drawing.Marker2=function(conf)
{var id=conf.id,canvas=document.getElementById(id),x=conf.x,y=conf.y,text=conf.text;this.id=id;this.canvas=document.getElementById(this.id);this.context=this.canvas.getContext('2d')
this.colorsParsed=false;this.canvas.__object__=this;this.original_colors=[];this.firstDraw=true;this.x=x;this.y=y;this.text=text;this.type='drawing.marker2';this.isRGraph=true;this.isrgraph=true;this.rgraph=true;this.uid=RGraph.createUID();this.canvas.uid=this.canvas.uid?this.canvas.uid:RGraph.createUID();this.properties={colorsStroke:'black',colorsFill:'white',textColor:'black',textSize:12,textFont:'Arial, Verdana, sans-serif',textBold:false,textItalic:false,textAccessible:true,textAccessibleOverflow:'visible',textAccessiblePointerevents:false,shadow:true,shadowColor:'gray',shadowOffsetx:3,shadowOffsety:3,shadowBlur:5,highlightStyle:null,highlightStroke:'rgba(0,0,0,0)',highlightFill:'#fcc',tooltips:null,tooltipsHighlight:true,tooltipsCssClass:'RGraph_tooltip',tooltipsCss:null,tooltipsEvent:'onclick',tooltipsFormattedPoint:'.',tooltipsFormattedThousand:',',tooltipsFormattedDecimals:0,tooltipsFormattedUnitsPre:'',tooltipsFormattedUnitsPost:'',tooltipsPointer:true,tooltipsPositionStatic:true,voffset:20,clearto:'rgba(0,0,0,0)'}
if(!this.canvas){alert('[DRAWING.MARKER2] No canvas support');return;}
this.coords=[];this.coordsText=[];this.$0={};var properties=this.properties;this.path=RGraph.pathObjectFunction;if(RGraph.Effects&&typeof RGraph.Effects.decorate==='function'){RGraph.Effects.decorate(this);}
this.set=function(name)
{var value=typeof arguments[1]==='undefined'?null:arguments[1];if(arguments.length===1&&typeof arguments[0]==='object'){for(i in arguments[0]){if(typeof i==='string'){this.set(i,arguments[0][i]);}}
return this;}
properties[name]=value;return this;};this.get=function(name)
{return properties[name];};this.draw=function()
{RGraph.fireCustomEvent(this,'onbeforedraw');if(!this.canvas.__rgraph_aa_translated__){this.context.translate(0.5,0.5);this.canvas.__rgraph_aa_translated__=true;}
this.context.lineWidth=1;this.metrics=RGraph.measureText(this.text,properties.textBold,properties.textFont,properties.textSize);if(this.x+this.metrics[0]>=this.canvas.width){this.alignRight=true;}
if(!this.colorsParsed){this.parseColors();this.colorsParsed=true;}
var x=this.alignRight?this.x-this.metrics[0]-6:this.x,y=this.y-6-properties.voffset-this.metrics[1],width=this.metrics[0]+6,height=this.metrics[1];this.coords[0]=[x,y,width,height];this.coordsText=[];this.context.lineWidth=properties.linewidth;if(properties.shadow){RGraph.setShadow(this,properties.shadowColor,properties.shadowOffsetx,properties.shadowOffsety,properties.shadowBlur);}
this.context.strokeStyle=properties.colorsStroke;this.context.fillStyle=properties.colorsFill;this.context.strokeRect(x+(this.alignRight?width:0),y,0,height+properties.voffset-6);this.context.strokeRect(x,y,width,height);this.context.fillRect(x,y,width,height);RGraph.noShadow(this);this.context.fillStyle=properties.textColor;RGraph.text({object:this,font:properties.textFont,size:properties.textSize,color:properties.textColor,bold:properties.textBold,italic:properties.textItalic,x:Math.round(this.x)-(this.alignRight?this.metrics[0]+3:-3),y:y+(height/2),text:this.text,valign:'center',halign:'left',tag:'labels'});this.coords[0].push([x,y,width,height]);RGraph.noShadow(this);this.context.textBaseline='alphabetic';RGraph.installEventListeners(this);if(this.firstDraw){this.firstDraw=false;RGraph.fireCustomEvent(this,'onfirstdraw');this.firstDrawFunc();}
RGraph.fireCustomEvent(this,'ondraw');return this;};this.exec=function(func)
{func(this);return this;};this.getObjectByXY=function(e)
{if(this.getShape(e)){return this;}};this.getShape=function(e)
{var mouseXY=RGraph.getMouseXY(e),mouseX=mouseXY[0],mouseY=mouseXY[1];if(mouseX>=this.coords[0][0]&&mouseX<=(this.coords[0][0]+this.coords[0][2])){if(mouseY>=this.coords[0][1]&&mouseY<=(this.coords[0][1]+this.coords[0][3])){if(RGraph.parseTooltipText&&properties.tooltips){var tooltip=RGraph.parseTooltipText(properties.tooltips,0);}
return{object:this,x:this.coords[0][0],y:this.coords[0][1],width:this.coords[0][2],height:this.coords[0][3],dataset:0,index:0,sequentialIndex:0,tooltip:typeof tooltip==='string'?tooltip:null};}}
return null;};this.highlight=function(shape)
{if(properties.tooltipsHighlight){if(typeof properties.highlightStyle==='function'){(properties.highlightStyle)(shape);}else{this.path('b r % % % % f % s %',this.coords[0][0],this.coords[0][1],this.coords[0][2],this.coords[0][3],properties.highlightFill,properties.highlightStroke);this.path('b r % % % % f % s %',this.coords[0][0],this.coords[0][1],this.coords[0][2],this.coords[0][3],properties.highlightFill,properties.highlightStroke);}}};this.parseColors=function()
{if(this.original_colors.length===0){this.original_colors.colorsFill=RGraph.arrayClone(properties.colorsFill);this.original_colors.colorsStroke=RGraph.arrayClone(properties.colorsStroke);this.original_colors.highlightFill=RGraph.arrayClone(properties.highlightFill);this.original_colors.highlightStroke=RGraph.arrayClone(properties.highlightStroke);this.original_colors.textColor=RGraph.arrayClone(properties.textColor);}
properties.colorsFill=this.parseSingleColorForGradient(properties.colorsFill);properties.colorsStroke=this.parseSingleColorForGradient(properties.colorsStroke);properties.highlightStroke=this.parseSingleColorForGradient(properties.highlightStroke);properties.highlightFill=this.parseSingleColorForGradient(properties.highlightFill);properties.textColor=this.parseSingleColorForGradient(properties.textColor);};this.reset=function()
{};this.parseSingleColorForGradient=function(color)
{if(!color){return color;}
if(typeof color==='string'&&color.match(/^gradient\((.*)\)$/i)){if(color.match(/^gradient\(({.*})\)$/i)){return RGraph.parseJSONGradient({object:this,def:RegExp.$1});}
var parts=RegExp.$1.split(':'),grad=this.context.createLinearGradient(this.x,this.y,this.x+this.metrics[0],this.y),diff=1/(parts.length-1);grad.addColorStop(0,RGraph.trim(parts[0]));for(var j=1;j<parts.length;++j){grad.addColorStop(j*diff,RGraph.trim(parts[j]));}}
return grad?grad:color;};this.on=function(type,func)
{if(type.substr(0,2)!=='on'){type='on'+type;}
if(typeof this[type]!=='function'){this[type]=func;}else{RGraph.addCustomEventListener(this,type,func);}
return this;};this.firstDrawFunc=function()
{};this.tooltipSubstitutions=function(opt)
{return{index:0,dataset:0,sequentialIndex:0,value:null};};this.positionTooltipStatic=function(args)
{var obj=args.object,e=args.event,tooltip=args.tooltip,index=args.index,canvasXY=RGraph.getCanvasXY(obj.canvas);args.tooltip.style.left=(canvasXY[0]
-(tooltip.offsetWidth/2)
+obj.properties.tooltipsOffsetx
+this.coords[0][0]
+(this.coords[0][2]/2))+'px';args.tooltip.style.top=(canvasXY[1]
-tooltip.offsetHeight
+obj.properties.tooltipsOffsety
+this.coords[0][1]
-10)+'px';};RGraph.register(this);RGraph.parseObjectStyleConfig(this,conf.options);};
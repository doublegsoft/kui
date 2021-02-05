
RGraph=window.RGraph||{isrgraph:true,isRGraph:true,rgraph:true};RGraph.Drawing=RGraph.Drawing||{};RGraph.Drawing.XAxis=function(conf)
{var id=conf.id
var y=conf.y;this.id=id;this.canvas=document.getElementById(this.id);this.context=this.canvas.getContext('2d');this.canvas.__object__=this;this.y=y;this.coords=[];this.coordsText=[];this.original_colors=[];this.firstDraw=true;this.type='drawing.xaxis';this.isRGraph=true;this.isrgraph=true;this.rgraph=true;this.uid=RGraph.createUID();this.canvas.uid=this.canvas.uid?this.canvas.uid:RGraph.createUID();this.properties={marginLeft:35,marginRight:35,marginBottom:35,marginTop:35,marginInner:0,colors:['black'],textColor:'black',textFont:'Arial, Verdana, sans-serif',textSize:12,textBold:false,textItalic:false,textAccessible:true,textAccessibleOverflow:'visible',textAccessiblePointerevents:false,xaxis:true,xaxisLinewidth:1,xaxisColor:'black',xaxisTickmarks:true,xaxisTickmarksLength:3,xaxisTickmarksLastLeft:null,xaxisTickmarksLastRight:null,xaxisTickmarksCount:null,xaxisLabels:null,xaxisLabelsSize:null,xaxisLabelsFont:null,xaxisLabelsItalic:null,xaxisLabelsBold:null,xaxisLabelsColor:null,xaxisLabelsOffsetx:0,xaxisLabelsOffsety:0,xaxisLabelsHalign:null,xaxisLabelsValign:null,xaxisLabelsPosition:'section',xaxisPosition:'bottom',xaxisLabelsAngle:0,xaxisTitle:'',xaxisTitleBold:null,xaxisTitleSize:null,xaxisTitleFont:null,xaxisTitleColor:null,xaxisTitleItalic:null,xaxisTitlePos:null,xaxisTitleOffsetx:0,xaxisTitleOffsety:0,xaxisTitleX:null,xaxisTitleY:null,xaxisTitleHalign:'center',xaxisTitleValign:'top',xaxisScale:false,xaxisScaleMin:0,xaxisScaleMax:null,xaxisScaleUnitsPre:'',xaxisScaleUnitsPost:'',xaxisScaleLabelsCount:10,xaxisScaleFormatter:null,xaxisScaleDecimals:0,xaxisScaleThousand:',',xaxisScalePoint:'.',xaxisScaleRound:false,yaxisPosition:'left',tooltips:null,tooltipsEffect:'fade',tooltipsCssClass:'RGraph_tooltip',tooltipsCss:null,tooltipsEvent:'onclick',tooltipsFormattedPoint:'.',tooltipsFormattedThousand:',',tooltipsFormattedDecimals:0,tooltipsFormattedUnitsPre:'',tooltipsFormattedUnitsPost:'',tooltipsFormattedTableHeaders:null,tooltipsFormattedTableData:null,tooltipsPointer:true,tooltipsPositionStatic:true,clearto:'rgba(0,0,0,0)'}
if(!this.canvas){alert('[DRAWING.XAXIS] No canvas support');return;}
this.$0={};var properties=this.properties;this.path=RGraph.pathObjectFunction;if(RGraph.Effects&&typeof RGraph.Effects.decorate==='function'){RGraph.Effects.decorate(this);}
this.set=function(name)
{var value=typeof arguments[1]==='undefined'?null:arguments[1];if(arguments.length===1&&typeof arguments[0]==='object'){for(i in arguments[0]){if(typeof i==='string'){this.set(i,arguments[0][i]);}}
return this;}
properties[name]=value;return this;};this.get=function(name)
{return properties[name];};this.draw=function()
{RGraph.fireCustomEvent(this,'onbeforedraw');if(!this.canvas.__rgraph_aa_translated__){this.context.translate(0.5,0.5);this.canvas.__rgraph_aa_translated__=true;}
this.coordsText=[];this.marginLeft=properties.marginLeft;this.marginRight=properties.marginRight;if(!this.colorsParsed){this.parseColors();this.colorsParsed=true;}
this.drawXAxis();RGraph.installEventListeners(this);if(this.firstDraw){this.firstDraw=false;RGraph.fireCustomEvent(this,'onfirstdraw');this.firstDrawFunc();}
RGraph.fireCustomEvent(this,'ondraw');return this;};this.exec=function(func)
{func(this);return this;};this.getObjectByXY=function(e)
{if(this.getShape(e)){return this;}};this.getShape=function(e)
{var mouseXY=RGraph.getMouseXY(e);var mouseX=mouseXY[0];var mouseY=mouseXY[1];if(mouseX>=this.marginLeft&&mouseX<=(this.canvas.width-this.marginRight)&&mouseY>=this.y-(properties.xaxisTickmarksAlign=='top'?(properties.textSize*1.5)+5:0)&&mouseY<=(this.y+(properties.xaxisTickmarksAlign=='top'?0:(properties.textSize*1.5)+5))){var x=this.marginLeft;var y=this.y;var w=this.canvas.width-this.marginLeft-this.marginRight;var h=25;if(RGraph.parseTooltipText&&properties.tooltips){var tooltip=RGraph.parseTooltipText(properties.tooltips,0);}
return{object:this,x:x,y:y,width:w,height:h,dataset:0,index:0,sequentialIndex:0,tooltip:typeof tooltip==='string'?tooltip:null};}
return null;};this.highlight=function(shape)
{if(typeof properties.highlightStyle==='function'){(properties.highlightStyle)(shape);}};this.parseColors=function()
{if(this.original_colors.length===0){this.original_colors.colors=RGraph.arrayClone(properties.colors),this.original_colors.textColor=RGraph.arrayClone(properties.textColor),this.original_colors.xaxisLabelsColor=RGraph.arrayClone(properties.xaxisLabelsColor),this.original_colors.xaxisTitleColor=RGraph.arrayClone(properties.xaxisTitleColor)}
properties.colors[0]=this.parseSingleColorForGradient(properties.colors[0]);properties.textColor=this.parseSingleColorForGradient(properties.textColor);properties.xaxisLabelsColor=this.parseSingleColorForGradient(properties.xaxisLabelsColor);properties.xaxisTitleColor=this.parseSingleColorForGradient(properties.xaxisTitleColor);};this.reset=function()
{};this.parseSingleColorForGradient=function(color)
{if(!color){return color;}
if(typeof color==='string'&&color.match(/^gradient\((.*)\)$/i)){if(color.match(/^gradient\(({.*})\)$/i)){return RGraph.parseJSONGradient({object:this,def:RegExp.$1});}
var parts=RegExp.$1.split(':');var grad=this.context.createLinearGradient(properties.marginLeft,0,this.canvas.width-properties.marginRight,0);var diff=1/(parts.length-1);grad.addColorStop(0,RGraph.trim(parts[0]));for(var j=1,len=parts.length;j<len;++j){grad.addColorStop(j*diff,RGraph.trim(parts[j]));}}
return grad?grad:color;};this.getYCoord=function()
{if(properties.xaxisPosition==='center'){return((this.canvas.height-properties.marginTop-properties.marginBottom)/2)+properties.marginTop;}else{return this.y;}};this.drawXAxis=function()
{RGraph.drawXAxis(this);};this.on=function(type,func)
{if(type.substr(0,2)!=='on'){type='on'+type;}
if(typeof this[type]!=='function'){this[type]=func;}else{RGraph.addCustomEventListener(this,type,func);}
return this;};this.firstDrawFunc=function()
{};this.tooltipSubstitutions=function(opt)
{return{index:0,dataset:0,sequentialIndex:0,value:null};};this.positionTooltipStatic=function(args)
{var obj=args.object,e=args.event,tooltip=args.tooltip,index=args.index,canvasXY=RGraph.getCanvasXY(obj.canvas);args.tooltip.style.left=(canvasXY[0]
+((this.canvas.width-properties.marginLeft-properties.marginRight)/2)+properties.marginLeft
-(tooltip.offsetWidth/2)
+obj.properties.tooltipsOffsetx)+'px';args.tooltip.style.top=(canvasXY[1]
-tooltip.offsetHeight
+obj.properties.tooltipsOffsety
+this.y
-10)+'px';};RGraph.register(this);RGraph.parseObjectStyleConfig(this,conf.options);};
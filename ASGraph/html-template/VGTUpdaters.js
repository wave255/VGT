//keeps track of the variables found in var data
var varMap = new Object();
var objMap = new Object();
var varData = new Array();

//last maxTime posted timings
var timeArray = new Array();
var maxTime = 300;

//the index for the focus range
var fi = {x:0, dx:705};
var selectedGroups = new Object();
var selectedGroupsArray = new Array();
var selectedGroupIdx = null;

var colorArray = [ 	
"steelBlue", "#0000FF", "#FF00FF", "#808080",	"#008000", "#00FF00", "#800000","#000080", "#808000", "#800080", "#FF0000",	"#C0C0C0", "#008080",
"steelBlue", "#0000FF", "#FF00FF", "#808080",	"#008000", "#00FF00", "#800000","#000080", "#808000", "#800080", "#FF0000",	"#C0C0C0", "#008080",
"steelBlue", "#0000FF", "#FF00FF", "#808080",	"#008000", "#00FF00", "#800000","#000080", "#808000", "#800080", "#FF0000",	"#C0C0C0", "#008080",
"steelBlue", "#0000FF", "#FF00FF", "#808080",	"#008000", "#00FF00", "#800000","#000080", "#808000", "#800080", "#FF0000",	"#C0C0C0", "#008080",
"steelBlue", "#0000FF", "#FF00FF", "#808080",	"#008000", "#00FF00", "#800000","#000080", "#808000", "#800080", "#FF0000",	"#C0C0C0", "#008080",
"steelBlue", "#0000FF", "#FF00FF", "#808080",	"#008000", "#00FF00", "#800000","#000080", "#808000", "#800080", "#FF0000",	"#C0C0C0", "#008080"];
//zoom panel stuff
var end = new Date();
var start = new Date(end - (1000*maxTime));
var related = new Array();
var selectedNames = '';
var zoomData;
var zoomIdxDate = start;
var zoomIdx = 0;

//player comment stuff
var playerComments = new Array();

var fakedNum = 0;
var realBias = 0.7;
var fakeBias = 0.3;

function urlDecode( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function FindUrlParameters()
{
	var fn = urlDecode("fakedNum");
	var rb = urlDecode("realBias");
	var fb = urlDecode("fakeBias");
	if(fn != "") 
		fakedNum = parseInt(fn);
	if(rb != "")
		realBias = parseFloat(rb);
	if(fb != "")
		fakeBias = parseFloat(fb);
}

/*
var sampleExpr = '<b><font color='+colorArray[0]+'>My:own:sample = </font></b><font color='+colorArray[1]+'>My:own:sample</font>';
varData.push({varName:"My:own:sample", expression: sampleExpr, related:[0], index:0, values:[182904,196530,203944,192492,77393,81243,83653,80634,80015,84246,85383,83490,26730,27663,27360,27685,25642,26938,26407,27043,24198,25500,25935,26271,89108,93122,93594,91355,89745,94387,95463]});

selectedGroups[0] = varData[0];
*/
/* 
//sample format
var gameMsg = "1:29:46@Car:Car|suspensionRange,0.1$suspensionDamper,50$suspensionSpringFront,18500$suspensionSpringRear,9250$throttle,0$topSpeed,80.4672$numberOfGears,5$maximumTurn,15$minimumTurn,10$resetTime,5$wheelCount,3$DVolume,0.226$EVolume,0.32$FVolume,0.312$KVolume,0.3955$LVolume,0.244$windVolume,0.32$tunnelVolume,0.8$crashLowVolume,0.8$crashHighVolume,0.5$BackgroundMusicVolume,1$sound$DVolume,0.226$sound$EVolume,0.32$sound$FVolume,0.312$sound$KVolume,0.3955$sound$LVolume,0.244$sound$windVolume,0.32$sound$tunnelVolume,0.8$sound$crashLowVolume,0.8$sound$crashHighVolume,0.5$sound$BackgroundMusicVolume,1$fudgeScale,1$textureSize,256@

Car:Car:Performance,5|Car:Car:topSpeed+Car:Car:numberOfGears+Car:Car:throttle@

Car:Car:Handling,10|Car:Car:maximumTurn+Car:Car:minimumTurn+Car:Car:resetTime+wheelCount";
*/

function UpdateVarMap(msg) {
	var goMsgs = msg.split("@");
	var time = goMsgs[0];
	var oldTime = timeArray.shift();
	timeArray.push(time);
	for (var i = 1; i < goMsgs.length; i++) {
		var goMsg = goMsgs[i];
		//check if this is a user comment and break if so
		if(goMsg[0] == '!'){
			AddPlayerComment(time,goMsg);
			break;
		}
		var params = goMsg.split("|");
		var go, go2, varName, newVal, expression, objName;
		//if there are a list of variables, this msg describes a gameMsg update
		if(params[0].split(",").length == 1){
			var varStr = params[1];
			//traverse through all variables and create/update values
			var goPathPairs = varStr.split("$");
			for (var j = 0; j < goPathPairs.length; ++j) {
				var gopp = goPathPairs[j].split(",");
				objName = params[0];
				varName = gopp[0];
				newVal = gopp[1]; 
				if(typeof newVal != "undefined"){
					//setup this var if it doesnt exist yet
					if (varMap[varName] == undefined) {
						expression = '<b><font color='+colorArray[0]+'>'+varName+' = </font></b><font color='+colorArray[1]+'>'+varName+'</font>';
						go = {objName: objName, varName: varName, expression: expression, index: varData.length, values: new Array(), related: new Array(), varType: 'independant' };
						varMap[go.varName] = go.index;
						go.related.push(go.index);
						varData.push( go );
						if(objMap[go.objName] == undefined)
							objMap[go.objName] = new Object();
						objMap[go.objName][go.varName] = varData[go.index];
						//insert random values to test
						if(fakedNum > 1)
						for(var i = 1; i <= fakedNum; ++i){
							go2 = {objName: objName+i, varName: varName, expression: expression, index: varData.length, values: new Array(), related: new Array(), varType: 'independant' };
							go2.related.push(go2.index); //rand val
							varData.push(go2);
							if(objMap[go2.objName] == undefined)
								objMap[go2.objName] = new Object();
							objMap[go2.objName][go2.varName] = varData[go2.index];
						}
					} else { 
						go = varData[varMap[varName]]; 
					}
					//update the value
					if(go.values.length > maxTime){
						go.values.shift();
						if(fakedNum > 1)
						for(var i = 1; i <= fakedNum; ++i)
						{
							go2 = varData[varMap[varName]+i];
							go2.values.shift();
						}
					}
					go.values.push(newVal);
					if(fakedNum > 1)
					for(var i = 1; i <= fakedNum; ++i){
						go2 = varData[varMap[varName]+i];
						go2.values.push(newVal * (realBias + (fakeBias*Math.random())) + (0.05 * newVal));
					}
				}
			}
		}
		else {
			var gopp = params[0].split(",");
			var g = gopp[0].split(":");
			objName = g[0];
			for(var k = 1; k < gopp[0].length; ++k){
				varName += g[k] + ":";
			}
			varName = varName.substr(0,varName.length-2);
			
			newVal = gopp[1];
			if(typeof newVal != "undefined"){
				var exprStr = params[1];
				//setup this var if it doesnt exist yet
				if (varMap[varName] == undefined) {
					expression = '<b><font color='+colorArray[0]+'>'+varName+' = </font></b>';
					go = {varName: varName, expression: expression, index: varData.length, values: new Array(), related: new Array(), varType: 'composite' };
					varMap[varName] = go.index;
					varData.push( go );
					var symbs = exprStr.split("+"); //this is limited and temporary
					var c = 0;
					for(sym in symbs){	
						go.related.push(varMap[sym]);
						go.expression += '<font color='+colorArray[c++]+'>'+sym+'</font> +';
					}
					go.expression = go.expression.substr(0,go.expression.length-1);
				} else { go = varData[varMap[varName]]; }
				//update the value
				if(go.values.length > maxTime)
					go.values.shift();
				go.values.push(newVal);
			}
		}
	}
	
	function AddPlayerComment(timeStr,commentMsg){
		var cMsg = commentMsg.split(',');
		var date = new Date();
		var t = timeStr.split(':');
		date.setHours(parseInt(t[0]),parseInt(t[1]),parseInt(t[2]));
		playerComments.push({time: date, type: cMsg[0], comment: cMsg[1]});
	}
}
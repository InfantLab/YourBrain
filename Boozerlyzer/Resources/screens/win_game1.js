/**
 * The main game - Object is to click accurately and swiftly on the icons.
 * But avoiding them if they upside down.
 * 
 */
var win = Titanium.UI.currentWindow;
var winHome = win.home;
win.idx = -1;

var gameStarted = false;
var currentObj = 0;
var points = 0;
var accbonus = 0;
var speedbonus = 0;
var inhibitbonus = 0;
var count = 0;
var missCount = 0;
var falseAlarmCount = 0;
var inverted = false;
var shrinkTime = 5000; // how long does this blob stay visible?
var clicked = false;

//
// a set of virtual objects that must be clicked quickly when made visible
//
var loc = [];
var whatClicked = function (e) {
	
	clicked = true;
	Titanium.API.debug("touchstart " + e.x + ", " + e.y  );
	for(x in e)
		Ti.API.debug(x);

	var cen = e.source.center;
	var idx = parseInt(e.source.idx);
	Ti.API.debug('idx:' + idx);
	if (idx === currentObj && !inverted){ //clicked correct one
		points += 10;
	//	Titanium.API.debug(e.globalPoint.x+","+e.globalPoint.y+")");
		accbonus += calcAccuracyBonus(cen,e);
		speedbonus += calcSpeedBonus(null, null);
		loc[idx].visible = false;
		count++;
		gameStep(count);			
	}else if (idx === currentObj && inverted){ // accidently clicked inverted
		falseAlarmCount++;
		labelGameMessage.text = 'Keep away!';
		clear(labelGameMessage);
		count++;
		gameStep(count);			
	}
	else if (inverted){ //correctly clicked away 
		points += 10;
		inhibitbonus += 5;
		accbonus += calcAccuracyBonus(cen,e);
		speedbonus += calcSpeedBonus(null, null);
		count++;
		loc[currentObj].visible = false;
		gameStep(count);			
	}
	else{ //missed
		missCount++;
		labelGameMessage.text = 'Oops!'
		clear(labelGameMessage);
	}	
};

function setUpOnce(){

	var imgtop = [40,40,40,160,160,160];
	var imgleft = [60,180,300,60,180,300];
	for(var img=0;img<6;img++){
		Titanium.API.debug('../icons/teddy_bear_toy_' + img + '.png');
		loc[img] = Ti.UI.createImageView({
			idx:img,
			anchorPoint: {x:0.5,y:0.5},
			width:100,height:100,
			top:imgtop[img],
			left:imgleft[img],
			image:'../icons/teddy_bear_toy_' + img + '.png'
		});	
		loc[img].visible = false;
		loc[img].addEventListener('touchstart',whatClicked)
		win.add(loc[img]);
	}

}


//
//	The labels for the scores. 
//
var labelScore = Ti.UI.createLabel({
	color:'white',
	font:{fontSize:14,fontFamily:'Helvetica Neue'},
	top:2,
	left:2,
	textAlign:'left',
	text:'Score:',
	height:'auto',
	width:40
});

var score = Ti.UI.createLabel({
	color:'green',
	font:{fontSize:14,fontWeight:'bold',fontFamily:'Helvetica Neue'},
	top:2,
	left:40,
	textAlign:'right',
	text:'      0',
	height:'auto',
	width:80
});
var labelBonus = Ti.UI.createLabel({
	color:'white',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	top:2,
	left:140,
	textAlign:'left',
	text:'Bonus',
	height:'auto',
	width:46
});
var bonus = Ti.UI.createLabel({
	color:'red',
	font:{fontSize:12,fontWeight:'bold',fontFamily:'Helvetica Neue'},
	top:2,
	left:190,
	textAlign:'right',
	text:'  0 speed,   0 coord,   0 oops',
	height:'auto',
	width:'auto'
});
win.add(labelScore);
win.add(score);
win.add(labelBonus);
win.add(bonus);

// label across centre of screen for pause, start etc
var labelGameMessage = Ti.UI.createLabel({
	color:'purple',
	font:{fontSize:18,fontWeight:'bold',fontFamily:'Helvetica Neue'},
	textAlign:'center',
	text:'Double click to start'
});
win.add(labelGameMessage);

function updateScore(){
	score.text = points;
	//round the bonus points
	bonus.text = Math.round(speedbonus) + ' speed\t' + Math.round(accbonus) + ' coord\t' + Math.round(inhibitbonus) + ' oops';
}

// new game function
function newGame(){
	//ultimately this should log stuff
	//at moment it doesn't do much
	gameStarted = true;
	labelGameMessage.visible = false;
	gameStep(0);
}

/**
 * The main game loop all the clever stuff happens in here
 */
function gameStep(stepcount){
 	Ti.API.debug('Game Step ' + stepcount);
	clicked = false;
	if (missCount > 4){
		
		labelGameMessage.visible = true;
		labelGameMessage.text = 'Final Score: ' + (points+inhibitbonus+accbonus+speedbonus) + '\nGame Over';
		count = 0;
		missCount = 0;
		setTimeout(function()
		{// do something 
			labelGameMessage.text = 'Double click to start game';
			gameStarted = false;
		},6000);
		return;
	}
	shrinkTime *= .97; //shrink quicker each step
	currentObj = Math.floor(6*Math.random());
	inverted = (Math.random()<0.1);
	if (inverted){		
		var flip = Ti.UI.create2DMatrix();
		flip = flip.rotate(180);
		loc[currentObj].animate({transform:flip,duration:10});
	}
	loc[currentObj].visible = true;
	var transform = Ti.UI.create2DMatrix();
	transform = transform.scale(0.0001);
	loc[currentObj].animate({transform:transform,duration:shrinkTime});
	updateScore();	
}

function calcSpeedBonus(startTime,clickTime){
	//TODO - the reaction time bonus
	return 3;
}

function calcAccuracyBonus(centObj,centTouch){
	// a simple linear bonus of between 0 & 10 points for being
	// between 50 and 0 units from the object center
	var distx = centObj.x - centTouch.x; 
	var disty = centObj.y - centTouch.y;
	var dist = Math.sqrt(distx*distx + disty*disty);
	var bonusdist = Math.min(dist,50);
	return 10*(50-bonusdist)/50;
}
function clear(o){
	var t  = o.text;
	setTimeout(function()
	{
		if (o.text == t)
		{
			o.text = "";
		}
	},1000);
}

//add a whatClicked event to window 
win.addEventListener('click',whatClicked);
win.addEventListener('dblclick',function(ev)
{
	if (!gameStarted){
	 	Ti.API.debug('Game Start');
		gameStarted = true;
		newGame();
	}
});

var paused = false;

Titanium.App.addEventListener('pause',function(e)
{
	paused = true;
	label.text = "App has been paused";
});

Titanium.App.addEventListener('resume',function(e)
{
	if (paused)
	{
		label.text = "App has resumed";
	}
	else
	{
		label.text = "App has resumed (w/o pause)";
	}
});

setUpOnce();
//
//var transformed = false;
//
//// create button event listener
//animateTabButton.addEventListener('click', function(e)
//{
//	if (transformed == false)
//	{
//		var transform = Ti.UI.create2DMatrix();
//		transform = transform.scale(0.6);
//		transform = transform.rotate(45);
//		tabGroup.animate({transform:transform,duration:1000});
//
//		transformed = true;
//	}
//	else
//	{
//		var transform = Ti.UI.create2DMatrix();
//		tabGroup.animate({transform:transform,duration:1000});
//
//		transformed = false;
//	}
//});
//
//messageWin.animate({opacity:1,duration:800});
//
//// close timer window after 4 seconds
//setTimeout(function()
//{
//	messageWin.animate({opacity:0,duration:800},function()
//	{
//		messageWin.close();
//		messageWin=null;
//	});
//},4000);
//add1.addEventListener('click', function()
//{
//	Ti.API.log("Adding...");
//	row1.backgroundColor = '#390A0E';
//	setTimeout(function()
//	{
//		delete1.show();
//	},100);
//	add1.hide();
//	cost1.animate({left:50, duration:100});
//	item1.animate({left:50, duration:100});
//
//});
//
//
//
//
//// 
////
//// SUB VIEWS
////
//var image1 = Titanium.UI.createView({
//	backgroundImage:'../images/smallpic1.jpg',
//	height:75,
//	width:75,
//	borderWidth:3,
//	borderColor:'#777'
//});
//
//var image2 = Titanium.UI.createView({
//	backgroundImage:'../images/smallpic2.jpg',
//	height:75,
//	width:75,
//	borderWidth:3,
//	borderColor:'#777'
//});
//
//var image3 = Titanium.UI.createView({
//	backgroundImage:'../images/smallpic3.jpg',
//	height:75,
//	width:75,
//	borderWidth:3,
//	borderColor:'#777'
//});
//
//image1.addEventListener('click', function()
//{
//	imageView.animate({view:image2,transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
//});
//
//image2.addEventListener('click', function()
//{
//	imageView.animate({view:image3,transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
//});
//
//image3.addEventListener('click', function()
//{
//	imageView.animate({view:image1,transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
//});
//
//view.add(imageView);
//
//imageView.add(image3);
//imageView.add(image2);
//imageView.add(image1);
//
////
////  SLIDE
////
//var button2 = Titanium.UI.createButton({
//	title:'Animate (Slide)',
//	width:200,
//	height:40,
//	top:70
//});
//
//button2.addEventListener('click', function()
//{
//	// use inline style
//	win.animate({right:-320, duration:500}, function()
//	{
//		win.animate({right:0, left:-320, duration:500}, function()
//		{
//			win.animate({right:0, left:0, duration:500});
//		});
//	});
//});
//
//
////
////  CUSTOM
////
//var button3 = Titanium.UI.createButton({
//	title:'Animate (Custom)',
//	width:200,
//	height:40,
//	top:120
//});
//
//button3.addEventListener('click', function()
//{
//	var t1 = Ti.UI.create3DMatrix();
//	t1 = t1.scale(0.00001);
//	t1 = t1.rotate(180,0,0,1);
//	var a1 = Titanium.UI.createAnimation();
//	a1.transform = t1;
//	a1.duration = 500;
//	win.animate(a1);
//	
//	a1.addEventListener('complete', function()
//	{
//		// simply reset animation
//		var t2 = Ti.UI.create3DMatrix();
//		var a2 = Titanium.UI.createAnimation();
//		a2.transform = t2;
//		a2.duration = 500;
//		win.animate(a2);
//		
//	});
//});
//
//
//win.addEventListener('touchstart', function(e)
//{
//	l.text = "touchstart " + e.x + ", " + e.y + " ("+e.globalPoint.x+","+e.globalPoint.y+")";
//    Titanium.API.log("touchstart " + e.x + ", " + e.y + " ("+e.globalPoint.x+","+e.globalPoint.y+")");
//});
//
//win.addEventListener('singletap', function(e)
//{
//	l2.text = "singletap " + e.x + ", " + e.y + " ("+e.globalPoint.x+","+e.globalPoint.y+")";
//    Titanium.API.log("singletap " + e.x + ", " + e.y + " ("+e.globalPoint.x+","+e.globalPoint.y+")");
//});
//
//win.addEventListener('touchmove', function(e)
//{
//	l3.text = "touchmove " + e.x + ", " + e.y + " ("+e.globalPoint.x+","+e.globalPoint.y+")";
//    Titanium.API.log("touchmove " + e.x + ", " + e.y + " ("+e.globalPoint.x+","+e.globalPoint.y+")");
//});
//
//win.addEventListener('swipe', function(e)
//{
//	l4.text = "swipe ("+e.direction+") " + e.x + ", " + e.y + " ("+e.globalPoint.x+","+e.globalPoint.y+")";
//    Titanium.API.log("swipe ("+e.direction+") " + e.x + ", " + e.y + " ("+e.globalPoint.x+","+e.globalPoint.y+")");
//});
//
//
//var circle0 = Titanium.UI.createView({
//	height:100,
//	width:100,
//	borderRadius:50,
//	backgroundColor:'#336699',
//	top:0,
//	left:0
//});
//
//win.add(circle0);
//
//var a = Ti.UI.createAnimation();
//a.top = 400;
//a.left = 300;
//a.duration = 10000;
//
//var l = Ti.UI.createLabel({
//	text:'N/A',
//	bottom:10,
//	height:20,
//	color:'#999',
//	textAlign:'center'
//});
//
//win.add(l);
//
//var b = Ti.UI.createButton({
//	title:'Stop Animation',
//	height:30,
//	width:200
//});
//win.add(b);
//b.addEventListener('click', function()
//{
//	circle0.animate({center:{x:circle0.animatedCenter.x,y:circle0.animatedCenter.y }});
//});
//circle0.animate(a, function()
//{
//	clearInterval(interval);
//});
//
//var interval = setInterval(function(){
//	l.text = 'center x: ' + circle0.animatedCenter.x + ' y: ' + circle0.animatedCenter.y;
//},1000);
//
//var circle = Titanium.UI.createView({
//	height:100,
//	width:100,
//	borderRadius:50,
//	backgroundColor:'#666699',
//	top:10
//});
//
//win.add(circle);
//
//var label = Titanium.UI.createLabel({
//	text:'Click circle repeatedly to animate or drag the circle',
//	bottom:100,
//	color:'#555',
//	font:{fontSize:12,fontFamily:'Helvetica Neue'},
//	textAlign:'center',
//	height:'auto',
//	width:'auto'
//});
//
//win.add(label);
//
//circle.addEventListener('touchmove', function(e)
//{
//	Ti.API.debug('Our event tells us the center is ' + e.x + ', ' + e.y );
//	var newX = e.x + circle.animatedCenter.x - circle.width/2;
//	var newY = e.y + circle.animatedCenter.y - circle.height/2;
//	circle.animate({center:{x:newX,y:newY}, duration:1});
//});
//
//var mode = 0;
//circle.addEventListener('click', function()
//{
//	switch(mode)
//	{
//		case 0:
//		{
//			firstAnimation();
//			mode++;
//			break;
//		}
//		case 1:
//		{
//			secondAnimation();
//			mode++;
//			break;
//		}
//		case 2:
//		{
//			thirdAnimation();
//			mode++;
//			break;
//		}
//		case 3:
//		{
//			fourthAnimation();
//			mode=0;
//			break;
//		}
//
//	}
//});
//
//
// ANIMATION FUNCTIONS
//
//
// opacity - use inline animation object
//function firstAnimation()
//{
//	var t = Ti.UI.create2DMatrix();
//	t.a = 1;
//	t.b = 2;
//	t.c = 3;
//	t.d = 4;
//
//	// pass inline animation objects and get callback when done
//	circle.animate({opacity:0,transform:t,duration:500}, function()
//	{
//		var t = Ti.UI.create2DMatrix();
//
//		circle.animate({opacity:1,transform:t,duration:500});
//	});
//};
//
// background color - use animation object
//function secondAnimation()
//{
//	var a = Titanium.UI.createAnimation();
//	a.backgroundColor = '#ff0000';
//	a.duration = 1000;
//
//	var b = Titanium.UI.createAnimation();
//	b.backgroundColor = '#336699';
//	b.duration = 1000;
//
//	circle.animate(a);
//
//	//
//	// ANIMATIONS SUPPORT A START EVENT
//	//
//	a.addEventListener('start', function()
//	{
//		Ti.API.debug('IN START');
//		label.text = 'Animation started';
//
//	});
//
//	//
//	// ANIMATIONS SUPPORT A COMPLETE EVENT
//	//
//	a.addEventListener('complete', function()
//	{
//		Ti.API.debug('IN COMPLETE');
//		label.text = 'Animation completed';
//		circle.animate(b);
//
//		setTimeout(function()
//		{
//			label.text = 'Click circle repeatedly to animate or drag window';
//		},2000);
//	});
//};
//
// animate the top and right property
//function thirdAnimation()
//{
//	circle.animate({top:200,right:30,duration:500}, function()
//	{
//		circle.animate({top:0,left:0, duration:500});
//	});
//};
//
// animate the center point object
//function fourthAnimation()
//{
//	circle.animate({center:{x:100,y:100},curve:Ti.UI.ANIMATION_CURVE_EASE_IN_OUT,duration:1000}, function()
//	{
//		circle.animate({center:{x:0,y:200},duration:1000}, function()
//		{
//			circle.animate({center:{x:300,y:300},duration:1000},function()
//			{
//				circle.animate({center:{x:150,y:60, duration:1000}});
//			});
//		});
//	});
//};


//
// Cleanup and return home
win.addEventListener('android:back', function(e) {
	if (winHome === undefined || winHome === null) {
		winHome = Titanium.UI.createWindow({ modal:true,
			url: '../app.js',
			title: 'Boozerlyzer',
			backgroundImage: '../images/smallcornercup.png',
			orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
		})
	}
	winHome.open();
	win.close();
});

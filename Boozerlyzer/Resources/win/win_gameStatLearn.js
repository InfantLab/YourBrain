/**
 * @author Caspar Addyman
 * 
 * The statistical learning / reaction time game. Cute little animals
 * pop up at various locations on the screen. The player has to tap them
 * as quickly and as accurately as possible to gain points. However, the
 * animals will occasionally be upside-down and these must be avoided 
 * (more bonus points for click further away from these).
 * 
 * TODO -
 * The order in which the animals are appear will be controlled by a
 * matrix of probablities. Hence there are statistical patterns that 
 * the player may learn subconsciously. 
 * TODO
 * THe location of individual objects should be randomised on each round
 * or turn
 * 
 * Copyright yourbrainondrugs.net 2011
 */

// (function() {

exports.createApplicationWindow =function(){
	var win = Titanium.UI.createWindow({
		title:'YBOB Boozerlyzer',
		backgroundImage:'/images/smallcornercup.png',
		modal:true,
		// orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});	
	win.orientationModes =  [Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];	
	if (Titanium.App.Properties.getBool('MateMode',false)){
		win.backgroundImage = '/images/smallcornercup.matemode.png';
	}else{
		win.backgroundImage = '/images/smallcornercup.png';
	}
	var scoresDialog = require('/ui/scoresDialog');
	//include the menu choices	
	// Ti.include('/ui/menu.js');
	// var menu = menus;
	var menu = require('/ui/menu');
	//need to give it specific help for this screen
	menu.setHelpMessage("Tap on the animals as fast as they appear. But if animal is upside down, tap as far away from it as possible. Points are awarded for speed, coordination & avoiding errors.");

	win.idx = -1;
	
	var currentObj = 0, previousObj = 0, startTime = 0,stepStartTime = 0, proportionInverted = 0.1;
	var gameStarted = false, clicked = false, inverted = false, dialogOpen = false, shrinkTime = 5000; // how long does this blob stay visible?
	var points = 0, coordbonus = 0, speedbonus = 0, inhibitbonus = 0;
	var count_GO, miss_GO, count_NOGO, miss_NOGO;
	var speed_GO, speed_NOGO, coord_GO, coord_NOGO, inhibit;
	var imgtop = [40,40,40,160,160,160];
	var imgleft = [60,180,300,60,180,300];
	var stopAnim  = Titanium.UI.createAnimation();
	var missTimeOut;

	// a set of virtual objects that must be clicked quickly when made visible
	var loc = [];
	
	var whatClicked = function (e) {
		if (currentObj < -1 || clicked){ 
			//don't fire more than once
			return;
		}
		clicked = true;
		
		
		var idx = parseInt(e.source.idx,10);
		Ti.API.debug('idx:' + idx);
		var cen = e.source.center;
		//need the click in global coordinates
		var globalCoords = {x:0,y:0}; 
		if (idx < 0 ){
			globalCoords.x = e.x;
			globalCoords.y = e.y;
		}else{
			globalCoords.x = e.x + imgleft[idx];
			globalCoords.y = e.y + imgtop[idx];
		}
		Ti.API.debug("whatClicked x,y " + e.x + ", " + e.y  );
		Ti.API.debug("global x,y " + globalCoords.x + ", " + globalCoords.y  );
		Ti.API.debug('source cen' + JSON.stringify(cen));
		loc[currentObj].animate(stopAnim);			//cancel remaining animation 
		loc[currentObj].visible = false;	//and hide the object
		if (idx === currentObj && !inverted){ //clicked correct one
			currentObj = -99;
			points += 10;
			calcCoordinationBonus("GO",cen,globalCoords);
			calcSpeedBonus("GO",stepStartTime, new Date().getTime());
		}else if (idx === currentObj && inverted){ // accidently clicked inverted
			miss_NOGO++;
			labelGameMessage.text = 'Keep away!';
			clear(labelGameMessage);
			inhibitbonus -= 10;
		}else if (inverted){ //correctly clicked away 
			points += 10;
			inhibitbonus += 5;
			calcCoordinationBonus("NOGO",cen,globalCoords);
			calcSpeedBonus("NOGO",stepStartTime, new Date().getTime());
			currentObj = -99;
		}else{ //missed
			miss_GO++;
			labelGameMessage.text = 'Oops!'
			clear(labelGameMessage);
		}
		gameStep();				
	};

	var stepTimedOut = function(){
		Ti.API.debug('stepTimedOut TIMEOUT ' + JSON.stringify(missTimeOut));
		//missed because of time out
		// missCount++;
		// labelGameMessage.text = 'Too slow!'
		// clear(labelGameMessage);
		// gameStep();
		gameOver();
	}


	/**
	 * The main game loop all the clever stuff happens in here
	 */
	function gameStep(){
		// if (stepcount !== count){
			// Ti.API.debug('Game count != Stepcount: ' + count + '!=' + stepcount);
	 		// return;
		// }
	 	if (missTimeOut >=0){
	 		//clear the previous timeOut counter
			Ti.API.debug('gameStep CLEAR TIMEOUT ' +missTimeOut );
		 	clearTimeout(missTimeOut);  		
	 	}
	 	stepStartTime = new Date().getTime();
		clicked = false;
		if (miss_GO + miss_NOGO > 4){			
			gameOver();
			return;
		}
		//Random but no repeating 
		currentObj = Math.floor(6*Math.random());
		while(currentObj===previousObj){
			currentObj = Math.floor(6*Math.random());
		}	
		previousObj = currentObj;
		inverted = (Math.random()<proportionInverted);
		if (inverted){		
			loc[currentObj].image = '/icons/inverted_teddy_bear_toy_' + currentObj + '.png';
			count_NOGO++; //another nogo trial
		}else{
			loc[currentObj].image = '/icons/teddy_bear_toy_' + currentObj + '.png';
			count_GO++;			
		}
		Ti.API.debug('Game Step ' + (count_GO+count_NOGO));
		shrinkTime *= .97; //shrink quicker each step
		//only show currentObj
		for(i=0;i<6;i++){
			loc[i].visible = (i===currentObj);			
		}
		var shrink = Ti.UI.create2DMatrix();
		shrink = shrink.scale(0.001);
		anchor={
			x:loc[currentObj].center.x,
			y:loc[currentObj].center.y
		};
		loc[currentObj].animate({transform:shrink,anchor:anchor,duration:shrinkTime});
		updateScore();	
		//set a timeout in case user doesn't press anything
		//Ti.API.debug('old missTimeOut -' + missTimeOut);
		missTimeOut = setTimeout(stepTimedOut, Math.round(1.5*shrinkTime));
		//Ti.API.debug('new missTimeOut -' + missTimeOut);
	}
	function gameOver(){
		// labelGameMessage.visible = true;
		// labelGameMessage.text = 'Final Score: ' + Math.floor(points+inhibitbonus+coordbonus+speedbonus) + '\nGame Over';
		gameEndSaveScores();
		gameStarted = false;
		dialogOpen = true;
		scoresDialog.setScores( 'Raccoon Hunt', 
						Math.floor(points+inhibitbonus+coordbonus+speedbonus),
						speedbonus, 
						coordbonus,
						inhibitbonus,
						5,
						"",
						'/icons/teddy_bears.png' );
		scoresDialog.open();
	}
	scoresDialog.addEventListener('close', function(e){
		setTimeout(function(){
			dialogOpen = false;
			labelGameMessage.visible = true;
			labelGameMessage.text = 'Double click to start game';
		}, 1000);
	});

	function setUpOnce(){	
		for(var img=0;img<6;img++){
			Titanium.API.debug('/icons/teddy_bear_toy_' + img + '.png');
			loc[img] = Ti.UI.createImageView({
				idx:img,
				anchorPoint: {x:0.5,y:0.5},
				width:100,height:100,
				top:imgtop[img],
				left:imgleft[img],
				image:'/icons/teddy_bear_toy_' + img + '.png'
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
	
	//label for how many  misses we have
	var missCountLabel = Ti.UI.createLabel({
		color:'blue',
		font:{fontSize:18,fontWeight:'bold',fontFamily:'Helvetica Neue'},
		top:2,
		right:2,
		textAlign:'right',
		text:'0 Missed',
		width:100
	});
	win.add(missCountLabel);

	function updateScore(){
		score.text = '' + Math.round(points);
		missCountLabel.text = (miss_GO + miss_NOGO === 0 ? '' : miss_GO + miss_NOGO + " missed");
		
		//round the bonus points
		bonus.text = Math.round(speedbonus) + ' speed\t' + Math.round(coordbonus) + ' coord\t' + Math.round(inhibitbonus) + ' oops';
	}
	// new game function
	function newGame(){
		//ultimately this should log stuff
		//at moment it doesn't do much
		
		//reset counters & other variables 
		currentObj = 0;
		previousObj = 0;
		points = 0;
		coordbonus = 0;
		speedbonus = 0;
		inhibitbonus = 0;
		count_GO = 0;
		count_NOGO = 0;
		miss_GO= 0;
		miss_NOGO = 0;
		speed_GO = 0;
		speed_NOGO = 0;
		coord_GO = 0;
		coord_NOGO = 0;
		inverted = false;
		shrinkTime = 5000; // how long does this blob stay visible?
	
		gameStarted = true;
		startTime = new Date().getTime();
		labelGameMessage.visible = false;
		gameStep(0);
	}
	
	
	function calcSpeedBonus(trialType,stepStart,clickTime){
		var timediff = clickTime -stepStart;
		Ti.API.debug('calcSpeedBonus - timediff' + timediff);
		if(trialType === "GO"){
			speed_GO += timediff;
		}else{
			speed_NOGO += timediff;
		}
		speedbonus += Math.max(0, 10 - (timediff) /100);
	}
	
	function calcCoordinationBonus(trialType,centObj,centTouch){
		// a simple linear bonus of between 0 & 10 points for being
		// between 50 and 0 units from the object center
		var distx = centObj.x - centTouch.x; 
		var disty = centObj.y - centTouch.y;
		var dist = Math.sqrt(distx*distx + disty*disty);
		Ti.API.debug('calcCoordinationBonus - dist' + dist);
		if(trialType === "GO"){
			coord_GO += dist;
			//more bonus for closer
			coordbonus += Math.max(0, 5*(50-dist)/50);
		}else{
			coord_NOGO += dist;
			//more bonus for further away
			coordbonus +=  dist/50;
		}
	}
	function clear(o){
		var t  = o.text;
		setTimeout(function()
		{
			if (o.text == t)
			{
				o.text = "";
			}
		},2000);
	}
	
	win.addEventListener('click',function(ev)
	{
		if (dialogOpen){
			
		}else if (!gameStarted){
		 	Ti.API.debug('Game Start');
			gameStarted = true;
			newGame();
		}else{
			//add a whatClicked event to window 
			whatClicked(ev);
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
	
	function gameEndSaveScores(){
		Ti.API.debug('save game scores USERID' + Titanium.App.Properties.getInt('UserID'));
		
		var now = parseInt((new Date()).getTime()/1000,10);

		//have to be careful of dividing by zero as NaN upset the database 
		var AvSpeed_GO = (count_GO-miss_GO===0 ? null :speed_GO/(count_GO-miss_GO) );
		var AvSpeed_NOGO = (count_NOGO-miss_NOGO===0 ? null :speed_NOGO/(count_NOGO-miss_NOGO) );
		var AvCoord_GO = (count_GO-miss_GO===0 ? null :coord_GO/(count_GO-miss_GO) );
		var AvCoord_NOGO = (count_NOGO-miss_NOGO===0 ? null :coord_NOGO/(count_NOGO-miss_NOGO) );
		var gameSaveData = [{Game: 'StatLearning',
							GameVersion:1,
							PlayStart: startTime/1000 ,
							PlayEnd: now,
							TotalScore:points + speedbonus + coordbonus + inhibitbonus,
							GameSteps:count_GO + count_NOGO,
							Speed_GO:speed_GO/(count_GO-miss_GO),  //average speed
							Speed_NOGO:speed_NOGO/(count_NOGO-miss_NOGO), //average speed
							Coord_GO:coord_GO/(count_GO-miss_GO), 	//average distance from target
							Coord_NOGO:coord_NOGO/(count_NOGO-miss_NOGO), //average distance from target
							Level:0,
							Inhibition:inhibitbonus,
							Feedback:'',
							Choices:'',
							SessionID:Titanium.App.Properties.getInt('SessionID'),
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:5
						}];
		Boozerlyzer.db.gameScores.SaveResult(gameSaveData);
	}
	
	//
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (Boozerlyzer.winHome === undefined || Boozerlyzer.winHome === null) {
			Boozerlyzer.winHome = Boozerlyzer.win.main.createApplicationWindow();
		}
		win.close();
		Boozerlyzer.winHome.open();
		Boozerlyzer.winHome.refresh();
	});
	return win;
};
// })();

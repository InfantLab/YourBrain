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

(function() {

	var win = Titanium.UI.currentWindow;
	if (Titanium.App.Properties.getBool('MateMode',false)){
		win.backgroundImage = '/images/smallcornercup.matemode.png';
	}else{
		win.backgroundImage = '/images/smallcornercup.png';
	}
	//include the menu choices	
	Ti.include('/ui/menu.js');
	var menu = menus;
	//need to give it specific help for this screen
	menu.setHelpMessage("Tap on the animals as fast as they appear. But if animal is upside down, tap as far away from it as possible. Points are awarded for speed, coordination & avoiding errors.");

	win.idx = -1;
	
	var currentObj = 0, startTime = 0,stepStartTime = 0;
	var gameStarted = false, clicked = false, inverted = false, shrinkTime = 5000; // how long does this blob stay visible?
	var points = 0, coordbonus = 0, speedbonus = 0, inhibitbonus = 0;
	var count = 0, missCount = 0, falseAlarmCount = 0;
	var speed_GO, speed_NOGO, coord_GO, coord_NOGO, inhibit;
	var imgtop = [40,40,40,160,160,160];
	var imgleft = [60,180,300,60,180,300];
	var stopAnim  = Titanium.UI.createAnimation();
	var missTimeOut;

	// a set of virtual objects that must be clicked quickly when made visible
	var loc = [];
	var whatClicked = function (e) {
		if (currentObj < 0){ 
			//don't fire more than once
			return;
		}
		clicked = true;
		 if (e.message === "TIMEOUT"){
			//missed because of time out
			missCount++;
			labelGameMessage.text = 'Too slow!'
			clear(labelGameMessage);
			count++;
			gameStep(count);
		}
		Ti.API.debug("whatClicked x,y " + e.x + ", " + e.y  );
		 // for(x in e)
			 // Ti.API.debug(JSON.stringify(x));	
		// Ti.API.debug('source ' + JSON.stringify(e.source));
		var cen = e.source.center;
		Ti.API.debug('source cen' + JSON.stringify(cen));

		var idx = parseInt(e.source.idx);
		Ti.API.debug('idx:' + idx);
		if (idx === currentObj && !inverted){ //clicked correct one
			currentObj = -1;
			points += 10;
//			Titanium.API.debug("e.globalPoint.x, e.globalPoint.y " + e.globalPoint.x +"," + e.globalPoint.y);
			coordbonus += calcCoordinationBonus(cen,e);
			speedbonus += calcSpeedBonus(stepStartTime, new Date().getTime());
			loc[idx].animate(stopAnim);		//cancel remaining animation 
			loc[idx].visible = false;	//and hide the object
		}else if (idx === currentObj && inverted){ // accidently clicked inverted
			falseAlarmCount++;
			labelGameMessage.text = 'Keep away!';
			clear(labelGameMessage);
			inhibitbonus -= 10;
		}else if (inverted){ //correctly clicked away 
			points += 10;
			loc[currentObj].animate(stopAnim);			//cancel remaining animation 
			loc[currentObj].visible = false;	//and hide the object
			inhibitbonus += 5;
			coordbonus += calcCoordinationBonus(cen,e);
			speedbonus += calcSpeedBonus(stepStartTime, new Date().getTime());
			currentObj = -1;
		}else{ //missed
			missCount++;
			labelGameMessage.text = 'Oops!'
			clear(labelGameMessage);
		}
		count++;
		gameStep(count);				
	};
	
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
	
	function updateScore(){
		score.text = '' + Math.round(points);
		//round the bonus points
		bonus.text = Math.round(speedbonus) + ' speed\t' + Math.round(coordbonus) + ' coord\t' + Math.round(inhibitbonus) + ' oops';
	}
	
	// new game function
	function newGame(){
		//ultimately this should log stuff
		//at moment it doesn't do much
		
		//reset counters & other variables 
		currentObj = 0;
		points = 0;
		coordbonus = 0;
		speedbonus = 0;
		inhibitbonus = 0;
		count = 0;
		missCount = 0;
		falseAlarmCount = 0;
		inverted = false;
		shrinkTime = 5000; // how long does this blob stay visible?
	
		gameStarted = true;
		startTime = new Date().getTime();
		labelGameMessage.visible = false;
		gameStep(0);
	}
	
	/**
	 * The main game loop all the clever stuff happens in here
	 */
	function gameStep(stepcount){
	 	if (missTimeOut>=0){
		 	clearTimeout(missTimeOut); //clear the timeOut counter 		
	 	}
	 	Ti.API.debug('Game Step ' + stepcount);
	 	stepStartTime = new Date().getTime();
		clicked = false;
		if (missCount > 3){
			
			labelGameMessage.visible = true;
			labelGameMessage.text = 'Final Score: ' + Math.floor(points+inhibitbonus+coordbonus+speedbonus) + '\nGame Over';
			count = 0;
			missCount = 0;
			gameStarted = false;
			gameEndSaveScores();
			setTimeout(function()
			{// do something 
				labelGameMessage.text = 'Double click to start game';
				gameStarted = false;
			},6000);
			return;
		}
		shrinkTime *= .97; //shrink quicker each step
		currentObj = Math.floor(6*Math.random());
		inverted = (Math.random()<0.15);
		if (inverted){		
			loc[currentObj].image = '/icons/inverted_teddy_bear_toy_' + currentObj + '.png';
		}else{
			loc[currentObj].image = '/icons/teddy_bear_toy_' + currentObj + '.png';			
		}
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
		loc[currentObj].animate({transform:shrink,center:anchor,duration:shrinkTime});
		updateScore();	
		//set a timeout in case user doesn't press anything
	//	missTimeOut = setTimeout(whatClicked({message:"TIMEOUT"}), 3*shrinkTime);
	}
	
	function calcSpeedBonus(stepStart,clickTime){
		//TODO - the reaction time bonus
		//Ti.API.debug('calcSpeedBonus - stepStart' + stepStart);
		//Ti.API.debug('calcSpeedBonus - clickTime' + clickTime);
		var timediff = 10 - (clickTime -stepStart) /100;
		Ti.API.debug('calcSpeedBonus - timediff' + timediff);
		return Math.max(0, timediff);
	}
	
	function calcCoordinationBonus(centObj,centTouch){
		// a simple linear bonus of between 0 & 10 points for being
		// between 50 and 0 units from the object center
		var distx = centObj.x - centTouch.x; 
		var disty = centObj.y - centTouch.y;
		var dist = Math.sqrt(distx*distx + disty*disty);
		Ti.API.debug('calcCoordinationBonus - dist' + dist);
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
		},2000);
	}
	
	win.addEventListener('click',function(ev)
	{
		if (!gameStarted){
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
		var gameSaveData = [{Game: 'StatLearning',
							GameVersion:1,
							PlayStart:startTime ,
							PlayEnd: parseInt((new Date()).getTime()/1000),
							TotalScore:points + speedbonus + coordbonus + inhibitbonus,
							Speed_GO:speedbonus,
							Speed_NOGO:0,
							Coord_GO:coordbonus,
							Coord_NOGO:0,
							Level:0,
							Inhibition:inhibitbonus,
							Feedback:'',
							Choices:'',
							SessionID:Titanium.App.Properties.getInt('SessionID'),
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:5		
						}];
		Ti.App.boozerlyzer.data.gameScores.Result(gameSaveData);
	}
	
	//
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (Ti.App.boozerlyzer.winHome === undefined 
			 || Ti.App.boozerlyzer.winHome === null) {
			Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
				url: '/app.js',
				title: 'Boozerlyzer',
				backgroundImage: '/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			})
		}
		win.close();
		Ti.App.boozerlyzer.winHome.open();
	});
})();

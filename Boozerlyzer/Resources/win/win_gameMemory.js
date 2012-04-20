 /**
 * @author Caspar Addyman
 * 
 * The memory game.. is basically a dual N-back task. The player must 
 * keep track of both the the location and identity of objects from 
 * N steps before hand and press the appropriate button if they match. 
 * 
 * There is some evidence that this task might lead to "Brain Training" effects
 * but it's far from certain.  http://www.pnas.org/content/108/25/10081.full
 * 
 * Copyright yourbrainondrugs.net 2011
 */

var winHome;

exports.createApplicationWindow = function(){
	var win = Titanium.UI.createWindow({
		title:'YBOB Boozerlyzer',
		backgroundImage:'/images/smallcornercup.png',
		modal:true
	});	
	win.orientationModes =  [Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];	

	Ti.API.debug('gameMemory 1');
	var scoresDialog = require('/ui/scoresDialog');
	scoresDialog.setParent(win);
	var dbGameScores = require('/db/gameScores');
	//include the menu choices	
	// var menu = menus;
	var menu = require('/ui/menu');
	//need to give it specific help for this screen
	var memoryGameHelp = "Press the buttons to advance the images. If two IMAGES are the same press the lower LEFT button. If the LOCATION is the same press the lower RIGHT button. Otherwise press either NO MATCH button. Points are awarded for speed & coordination.";
	menu.setHelpMessage(memoryGameHelp);
	win.activity.onCreateOptionsMenu = function(event){
		menu.createMenus(event);
	};
	
	//overload the open function to display help dialog
	win.addEventListener('open', function(){
		var initialHelp = require('/ui/initialHelpDialog');
		initialHelp.showNotice('memoryGame',memoryGameHelp);
	});
	
	var stimulus, grid;
	var labelScore, score, labelBonus, bonus, countLabel,nBackLabel,missCountLabel, labelGameMessage;
	var currentObj = 0, points = 0, coordbonus = 0, speedbonus = 0,  inhibitbonus = 0;
	var startTime = 0, stepStartTime = 0, count = 0, missCount = 0, falseAlarmCount = 0;
	var count_GO, miss_GO, count_NOGO, miss_NOGO;
	var speed_GO, speed_NOGO, coord_GO, coord_NOGO, inhibit;
	var gameStarted = false, gameAllowRestart = true, clicked = false,dialogOpen  = false;
	var iconSize = 90;
	var imgtop = [2,2,2,96,96,96,190,190,190];
	var imgleft = [2,96,190,2,96,190,2,96,190];
	var leftButton = 5, rightButton= 376;
	var topButton = 30, bottomButton = 150;
	
	var fruitprefix = '/images/fruit/';
	var fruits = ['apple.png','banana.png','cherry.png','grapefruit.png','kiwi.png','lemon.png','lime.png','strawberry.png','watermelon.png','starfruit.png'];
	
	//	track what object is shown and its location for each step
	var stepImage = [],stepLocation = [];
	var nBack = 1;
	
	// funtion to handle the button presses
	var whatClicked = function (e) {
		if (clicked ){ 
			//don't do anything
			return;
		}
		clicked = true;
		//var cen = e.source.center;
		for (item in e.source){
			Ti.API.debug('e.' + item + ' ' + e.source[''+item]);
			
		}
		
		var cen = {x:0,y:0};
		cen.x = e.source.left + 0.5 * e.source.width;
		cen.y = e.source.top + 0.5 * e.source.height;
		var idx = parseInt(e.source.idx, 10);
		var globalCoords = {x:0,y:0}; 
		
		Ti.API.debug("whatClicked x,y " + e.x + ", " + e.y  );
		Ti.API.debug('source cen' + JSON.stringify(cen));
		Ti.API.debug('Button clicked idx:' + idx);
		Ti.API.debug('stepLocation   :' + stepLocation[count]);
		Ti.API.debug('stepLocation -n:' + stepLocation[count-nBack]);
		Ti.API.debug('stepImage   :' + stepImage[count]);
		Ti.API.debug('stepImage -n:' + stepImage[count-nBack]);
		if(count < nBack){
			//nothing to do
		}else if (idx === -1){ 
			//work out correct location of the click globally
			globalCoords.x = e.x + leftButton;
			globalCoords.y = e.y + bottomButton;
		
			//clicked left button, cheick if image matches N back item
			//clicked teh right button see if location matches nBack location.
			if (stepImage[count] === stepImage[count - nBack]){
				Ti.API.debug('image match');
				//CORRECT!
				points += 10;
				speedbonus += calcSpeedBonus(stepStartTime, new Date().getTime());
				coordbonus += calcCoordinationBonus("GO",cen,globalCoords);
			}else{
				//WRONG!
				inhibitbonus -= 5;
				missCount++;
			}	
		}else if (idx === 1){ 
			globalCoords.x = e.x + rightButton;
			globalCoords.y = e.y + bottomButton;
			//clicked teh right button see if location matches nBack location.
			if (stepLocation[count] === stepLocation[count - nBack]){
				Ti.API.debug('location match');
				//CORRECT!
				points += 10;
				speedbonus += calcSpeedBonus(stepStartTime, new Date().getTime());
				coordbonus += calcCoordinationBonus("GO",cen,globalCoords);
			}else{
				//WRONG!
				inhibitbonus -= 5; 
				missCount++;
			} 			
		}else if (idx === -10 || idx === 10){
			if (stepLocation[count] === stepLocation[count - nBack]
			|| stepImage[count] === stepImage[count - nBack] ){
				//player missed this one.
				//too bad
				missCount++;
			}else{
				globalCoords.x = e.x + (idx=== -10 ? leftButton: rightButton);
				globalCoords.y = e.y + topButton;

				Ti.API.debug('no match');
				speedbonus += calcSpeedBonus(stepStartTime, new Date().getTime());
				coordbonus += calcCoordinationBonus("NOGO",cen,globalCoords);
				points += 2;
			}			
		}	
		gameStep();			
	};
	

	function updateScore(){
		Ti.API.debug('updateScore :' + points + 'pts');
		score.text = '' + Math.round(points);
		countLabel.text = '' + Math.round(count);
		missCountLabel.text = (missCount === 0 ? '' : missCount + " missed");
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
	
		gameStarted = true;
		gameAllowRestart = false;
		startTime = new Date().getTime();
		labelGameMessage.visible = false;
		
		gameStep();
	}
	Ti.API.debug('gameMemory 2');
	
	/**
	 * The main game loop all the clever stuff happens in here
	 */
	function gameStep(){
		count++;
	 	Ti.API.debug('Game Step ' + count);
	 	clicked = false;
		if (missCount > 4){
			gameOver();
			return;
		}
		updateScore();
		
		stepStartTime = new Date().getTime();
		
		//get next item
		currentImg = Math.floor(9*Math.random());
		currentLoc = Math.floor(9*Math.random());
		//keep track of what has been shown.
		stepImage[count] = currentImg;
		stepLocation[count] = currentLoc;
		
		//show new item
		stimulus.visible = false;
		stimulus.image = fruitprefix + fruits[currentImg];
		stimulus.top = imgtop[currentLoc];
		stimulus.left = imgleft[currentLoc];
		stimulus.visible = true;

	}
	function gameOver(){
		//GAME OVER!
		stimulus.visible = false;	
		// labelGameMessage.visible = true;
		// labelGameMessage.text = 'Final Score: ' + Math.floor(points+inhibitbonus+coordbonus+speedbonus) + '\nGame Over';
		count = 0;
		missCount = 0;
		gameStarted = false;
		gameEndSaveScores();
		dialogOpen = true;
		scoresDialog.setParent(win);
		scoresDialog.setScores( 'Memory Game', 
								Math.floor(points+inhibitbonus+coordbonus+speedbonus),
								speedbonus, 
								coordbonus,
								inhibitbonus,
								5,
								"",
								'/icons/Memory.png' );
		scoresDialog.open();
		Ti.API.debug('memory game over end');
	}
	scoresDialog.addEventListener('close', function(e){
		setTimeout(function(){
			dialogOpen = false;
			labelGameMessage.visible = true;
			labelGameMessage.text = 'Tap to start game';
			gameStarted = false;
			gameAllowRestart = true;
		}, 1000);
	});

	Ti.API.debug('gameMemory 3');

	function calcSpeedBonus(stepStart,clickTime){
		//TODO - the reaction time bonus
		//Ti.API.debug('calcSpeedBonus - stepStart' + stepStart);
		//Ti.API.debug('calcSpeedBonus - clickTime' + clickTime);
		var timediff = 10 - (clickTime -stepStart) /100;
		Ti.API.debug('calcSpeedBonus - timediff' + timediff);
		return Math.max(0, timediff);
	}
	
	function calcCoordinationBonus(trialType, centObj,centTouch){
		// a simple linear bonus of between 0 & 10 points for being
		// between 50 and 0 units from the object center
		var distx = centObj.x - centTouch.x; 
		var disty = centObj.y - centTouch.y;
		var dist = Math.sqrt(distx*distx + disty*disty);
		Ti.API.debug('calcCoordinationBonus - dist' + dist);
		var bonusdist = Math.min(dist,50);
		return 10*(50-bonusdist)/50;
		if(trialType === "GO"){
			speed_GO += timediff;
		}else{
			speed_NOGO += timediff;
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
	
	function setUpOnce(){	
		Ti.API.debug('win_gameMemory - setup once');
		var leftNOButton = Ti.UI.createButton({
			title:'No match',
			width:'100',
			height:'100',
			top:topButton,
			left:leftButton,
			backgroundColor:'#888',
			borderWidth:3,
			borderRadius:4,
			idx:-10
		});
		leftNOButton.addEventListener('click',function(events)
		{
			whatClicked(events);
		});	
		win.add(leftNOButton);
		Ti.API.debug('win_gameMemory - setup once 2');

		var leftYESButton = Ti.UI.createButton({
			title:'Shape matched item 1 step before',
			width:'100',
			height:'100',
			top:bottomButton,
			left:leftButton,
			backgroundColor:'#888',
			borderWidth:3,
			borderRadius:4,
			idx:-1
		});
		leftYESButton.addEventListener('click',function(events)
		{
			whatClicked(events);
		});	
		win.add(leftYESButton);

		var rightNOButton = Ti.UI.createButton({
			title:'No match',
			width:'100',
			height:'100',
			top:topButton,
			left:rightButton,
			backgroundColor:'#888',
			borderWidth:3,
			borderRadius:4,
			idx:10
		});
		rightNOButton.addEventListener('click',function(events)
		{
			whatClicked(events);
		});	
		win.add(rightNOButton);
		
		var rightYESButton = Ti.UI.createButton({
			title:'Location matched item 1 step before',
			width:'100',
			height:'100',
			top:bottomButton,
			left:rightButton,
			backgroundColor:'#888',
			borderWidth:3,
			borderRadius:4,
			idx:1
		});
		rightYESButton.addEventListener('click',function(events)
		{
			whatClicked(events);
		});	
		win.add(rightYESButton);

		Ti.API.debug('win_gameMemory - setup once 3');	
		grid = Ti.UI.createView({
			//TODO 
			//The grid image is commented out because of a bug in SDK 1.7.2
			//check back periodically to see if the bug has been fixed.
			// http://developer.appcelerator.com/question/40711/unable-to-load-bitmap-not-enough-memory-bitmap-size-exceeds-vm-budget#81151
			//backgroundImage:'/images/grid3x3.png',
			height:282,
			width:282,
			top:20,
			left:100
		});
		Ti.API.debug('win_gameMemory - setup once 4');			
//		grid.visible = false; 
		Ti.API.debug('win_gameMemory - setup once 5');			
		win.add(grid);
		Ti.API.debug('win_gameMemory - setup once 6');
		stimulus = Ti.UI.createImageView({
				width:iconSize,height:iconSize,
				top:imgtop[0],
				left:imgleft[0],
				image:fruitprefix + fruits[0]
			});	
		stimulus.visible = false;
		grid.add(stimulus);

		//
		//	The labels for the scores. 
		//
		labelScore = Ti.UI.createLabel({
			color:'white',
			font:{fontSize:14,fontFamily:'Helvetica Neue'},
			top:2,
			left:2,
			textAlign:'left',
			text:'Score:',
			height:'auto',
			width:40
		});
		
		score = Ti.UI.createLabel({
			color:'green',
			font:{fontSize:14,fontWeight:'bold',fontFamily:'Helvetica Neue'},
			top:2,
			left:40,
			textAlign:'right',
			text:'      0',
			height:'auto',
			width:80
		});
		labelBonus = Ti.UI.createLabel({
			color:'white',
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
			top:2,
			left:140,
			textAlign:'left',
			text:'Bonus',
			height:'auto',
			width:46
		});
		bonus = Ti.UI.createLabel({
			color:'red',
			font:{fontSize:12,fontWeight:'bold',fontFamily:'Helvetica Neue'},
			top:2,
			left:190,
			textAlign:'right',
			text:'  0 speed,   0 coord,   0 oops',
			height:'auto',
			width:'auto'
		});
	
		//label for how many steps back we are currently counting
		countLabel = Ti.UI.createLabel({
			color:'black',
			font:{fontSize:18,fontWeight:'bold',fontFamily:'Helvetica Neue'},
			bottom:2,
			right:70,
			textAlign:'right',
			text:'0',
			width:100
		});
		
		//label for how many steps back we are currently counting
		nBackLabel = Ti.UI.createLabel({
			color:'blue',
			font:{fontSize:18,fontWeight:'bold',fontFamily:'Helvetica Neue'},
			bottom:2,
			right:2,
			textAlign:'right',
			text:'1 Back',
			width:100
		});
	
		//label for how many location or shape misses we have
		missCountLabel = Ti.UI.createLabel({
			color:'blue',
			font:{fontSize:18,fontWeight:'bold',fontFamily:'Helvetica Neue'},
			top:2,
			right:2,
			textAlign:'right',
			text:'0 Missed',
			width:100
		});
		
		// label across centre of screen for pause, start etc
		labelGameMessage = Ti.UI.createLabel({
			color:'purple',
			font:{fontSize:18,fontWeight:'bold',fontFamily:'Helvetica Neue'},
			textAlign:'center',
			text:'Tap to start'
		});
		win.add(labelScore);
		win.add(score);
		win.add(labelBonus);
		win.add(bonus);
		win.add(countLabel);
		win.add(nBackLabel);
		win.add(missCountLabel);
		win.add(labelGameMessage);

		Ti.API.debug('win_gameMemory - setup done');
	}

	Ti.API.debug('gameMemory 4');

	win.addEventListener('click',function(ev)
	{
		if (!gameStarted && gameAllowRestart && !dialogOpen){
		 	Ti.API.debug('Game Start');
			newGame();
		}
	});
	
	
	setUpOnce();
	Ti.API.debug('gameMemory 5');
	
	function gameEndSaveScores(){
		var now = parseInt((new Date()).getTime()/1000, 10);
									  
		var gameSaveData = [{Game: 'DualNBack',
							GameVersion:2,
							PlayStart: startTime/1000 ,
							PlayEnd: now,
							TotalScore:points,
							GameSteps:count,
							Speed_GO:speedbonus,
							Speed_NOGO:0,
							Coord_GO:coordbonus,
							Coord_NOGO:0,
							Level:nBack,
							Inhibition:inhibitbonus,
							Feedback:count + ' steps',
							Choices:'',
							SessionID:Titanium.App.Properties.getInt('SessionID'),
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:5 //,
						}];
		dbGameScores.SaveResult(gameSaveData);
	}
	
	//KLUDGE
	//to make parent window focus event fire when you press back button
	labelScore.focus();
	
	//
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (!winHome) {
			var winmain = require('/win/win_main');
				winHome = winmain.createApplicationWindow();
		}
		win.close();
		winHome.open();
		winHome.refresh();
	});
	
	return win;
};

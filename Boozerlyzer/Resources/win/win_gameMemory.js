/**
 * @author Caspar Addyman
 * 
 * The memory game.. is basically a dual N-back task. The player must 
 * keep track of both the the location and identity of objects from 
 * N steps before hand and press the appropriate button if they match. 
 * 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {

	Ti.include('/ui/scoresDialog.js');

	var win = Titanium.UI.currentWindow;
	var stimulus, grid;
	var currentObj = 0, points = 0, coordbonus = 0, speedbonus = 0,  inhibitbonus = 0;
	var startTime = 0, stepStartTime = 0, count = 0, missCount = 0, falseAlarmCount = 0;
	var gameStarted = false, gameAllowRestart = true, clicked = false;
	var iconSize = 90;
	var imgtop = [2,2,2,96,96,96,190,190,190];
	var imgleft = [2,96,190,2,96,190,2,96,190];
	
	var fruitprefix = '/images/fruit/';
	var fruits = ['apple.png','banana.png','cherry.png','grapefruit.png','kiwi.png','lemon.png','lime.png','strawberry.png','watermelon.png','starfruit.png']
	
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
		var cen = e.source.center;
		var idx = parseInt(e.source.idx);
		
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
			//clicked left button, cheick if image matches N back item
			//clicked teh right button see if location matches nBack location.
			if (stepImage[count] === stepImage[count - nBack]){
				Ti.API.debug('image match');
				//CORRECT!
				points += 10;
				speedbonus += calcSpeedBonus(stepStartTime, new Date().getTime());
				coordbonus += calcCoordinationBonus(cen,e);
			}else{
				//WRONG!
				inhibitbonus -= 5;
				missCount++;
			} 			
		}else if (idx === 1){ 
			//clicked teh right button see if location matches nBack location.
			if (stepLocation[count] === stepLocation[count - nBack]){
				Ti.API.debug('location match');
				//CORRECT!
				points += 10;
				speedbonus += calcSpeedBonus(stepStartTime, new Date().getTime());
				coordbonus += calcCoordinationBonus(cen,e);
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
				Ti.API.debug('no match');
				score += 2;
			}			
		}	
		gameStep();			
	};
	

	function updateScore(){
		Ti.API.debug('updateScore :' + points + 'pts');
		score.text = points;
		countLabel.text = Math.round(count);
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
	
	/**
	 * The main game loop all the clever stuff happens in here
	 */
	function gameStep(){
		count++;
	 	Ti.API.debug('Game Step ' + count);
	 	clicked = false;
		if (missCount > 4){
			//GAME OVER!
			stimulus.visible = false;	
			labelGameMessage.visible = true;
			labelGameMessage.text = 'Final Score: ' + Math.floor(points+inhibitbonus+coordbonus+speedbonus) + '\nGame Over';
			count = 0;
			missCount = 0;
			gameStarted = false;
			gameEndSaveScores();
			setTimeout(function()
			{// do something 
				labelGameMessage.text = 'Tap to start game';
				gameStarted = false;
				gameAllowRestart = true;
			},4000);
			scoresDialog.setScores( 'Memory Game', 
									Math.floor(points+inhibitbonus+coordbonus+speedbonus),
									speedbonus, 
									coordbonus,
									inhibitbonus,
									5,
									"",
									'/icons/Memory.png' )
			scoresDialog.open();
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
	
	function setUpOnce(){	
	
		var leftNOButton = Ti.UI.createButton({
			title:'No match',
			width:'20%',
			height:'30%',
			bottom:'60%',
			left:'1%',
			backgroundColor:'#888',
			idx:-10
		});
		leftNOButton.addEventListener('click',function(events)
		{
			whatClicked(events);
		});	
		win.add(leftNOButton);
		var leftYESButton = Ti.UI.createButton({
			title:'Shape matched item 1 step before',
			width:'20%',
			height:'30%',
			bottom:'23%',
			left:'1%',
			backgroundColor:'#888',
			idx:-1
		});
		leftYESButton.addEventListener('click',function(events)
		{
			whatClicked(events);
		});	
		win.add(leftYESButton);

		var rightNOButton = Ti.UI.createButton({
			title:'No match',
			width:'20%',
			height:'30%',
			bottom:'60%',
			right:'1%',
			backgroundColor:'#888',
			idx:10
		});
		rightNOButton.addEventListener('click',function(events)
		{
			whatClicked(events);
		});	
		win.add(rightNOButton);
		
		var rightYESButton = Ti.UI.createButton({
			title:'Location matched item 1 step before',
			width:'20%',
			height:'30%',
			bottom:'23%',
			right:'1%',
			backgroundColor:'#888',
			idx:1
		});
		rightYESButton.addEventListener('click',function(events)
		{
			whatClicked(events);
		});	
		win.add(rightYESButton);
	
		grid = Ti.UI.createView({
			backgroundImage:'/images/grid3x3.png',
			height:282,
			width:282,
			top:20,
			left:100
		});
//		grid.visible = false;
		win.add(grid);
		stimulus = Ti.UI.createImageView({
				width:iconSize,height:iconSize,
				top:imgtop[0],
				left:imgleft[0],
				image:fruitprefix + fruits[0]
			});	
		stimulus.visible = false;
		grid.add(stimulus);

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

	//label for how many steps back we are currently counting
	var countLabel = Ti.UI.createLabel({
		color:'black',
		font:{fontSize:18,fontWeight:'bold',fontFamily:'Helvetica Neue'},
		bottom:2,
		right:70,
		textAlign:'right',
		text:'0',
		width:100
	});
	win.add(countLabel);
	
	//label for how many steps back we are currently counting
	var nBackLabel = Ti.UI.createLabel({
		color:'blue',
		font:{fontSize:18,fontWeight:'bold',fontFamily:'Helvetica Neue'},
		bottom:2,
		right:2,
		textAlign:'right',
		text:'1 Back',
		width:100
	});
	win.add(nBackLabel);

	//label for how many location or shape misses we have
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
	
	// label across centre of screen for pause, start etc
	var labelGameMessage = Ti.UI.createLabel({
		color:'purple',
		font:{fontSize:18,fontWeight:'bold',fontFamily:'Helvetica Neue'},
		textAlign:'center',
		text:'Tap to start'
	});
	win.add(labelGameMessage);
	
	win.addEventListener('click',function(ev)
	{
		if (!gameStarted && gameAllowRestart){
		 	Ti.API.debug('Game Start');
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
	
	function gameEndSaveScores(){
		var gameSaveData = [{Game: 'DualNBack',
							GameVersion:1,
							PlayStart:startTime ,
							PlayEnd: parseInt((new Date()).getTime()/1000),
							TotalScore:points,
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

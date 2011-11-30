/**
 * @author Caspar Addyman
 * 
 * The Progressive numerical Stroop game where you have to press
 * the numerically largest number irrespective of font size.
 * We score speed, accuracy and coordination (closeness to centre of label)
 * It is progressive because for with level (each 10 correct answers) we increase 
 * the range of numbers that are included  
 * 	Level 1  -  1 - 9
 *  Level 2  -  1 - 19, etc
 *  
 *  TODO With each the timeout also decreases
 *  The game ends when we make 5 mistakes in one level 
 * 
 * @param {object} Home      	//reference to homescreen
 * 
 * Copyright yourbrainondrugs.net 2011
 */

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
	menu.setHelpMessage("On each step tap on the NUMERICALLY larger value and try to ignore the font-size. Points are awarded for speed, coordination & avoiding errors.");

	var labelGameMessage, gameStarted = false, initialised = false;
	var winopened = parseInt((new Date()).getTime()/1000);
	var useSmallerFonts =  false;
	var fontsLarger =  [12, 20, 30, 55, 70, 90, 110, 136]; // eight possible sizes for levels with only 2 digit numbers
	var fontsSmaller = [10,14,18,24,30,40,50,61,72,84,95, 110]; //
	var imgTop = [80,80];
	var imgLeft = [60,240];
	var startTime = 0, maxDigit = 10;
	var points = 0, count = 0; coordbonus = 0, speedbonus = 0, inhibitbonus = 0, level = 0;
	var missCount = 0, correctCount = 0, stroopMissTotal = 0, nonStroopMissTotal = 0;
	var stepInterval = 500;
	var loc = [];
	var score, bonus;
	
	
	//this code just needs to be called once for this window
	function setUpOnce(){
		if (initialised) return;
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
		win.add(labelScore);
		win.add(score);
		win.add(labelBonus);
		win.add(bonus);
	
	
		// label across centre of screen for pause, start etc
		labelGameMessage = Ti.UI.createLabel({
			color:'purple',
			font:{fontSize:16,fontWeight:'bold',fontFamily:'Helvetica Neue'},
			textAlign:'center',
			text:'Tap the larger values.'
		});
		win.add(labelGameMessage);
		
		
		// the two possible locations that the numbers may appear
		loc[0] = Ti.UI.createLabel({
			idx:0,
			anchorPoint:{x:0.5,y:0.5},
			backgroundColor:'orange',
			color:'black',
			top:imgTop[0],left:imgLeft[0],
			height:160,width:160,
			center:{x:60+80,y:80+80},
			name:"left",
			text:'',
			textAlign:'center',
			font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}
		});
		loc[1] = Ti.UI.createLabel({
			idx:1,
			anchorPoint:{x:0.5,y:0.5},
			backgroundColor:'purple',
			color:'black',
			top:imgTop[1],left:imgLeft[1],
			height:160,width:160,
			center:{x:240+80,y:80+80},
			name:"right",
			text:'',
			textAlign:'center',
			font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}
		});
		loc[0].visible = false;
		loc[1].visible = false;
			
		for (var i = 0; i < 2; i++) {
			win.add(loc[i]);
			loc[i].addEventListener('touchstart', function(ev){
				// for (t in ev)
					// Ti.API.debug(t);
				Ti.API.debug('Clicked ' + ev.source );
				var choiceTime = parseInt((new Date()).getTime() / 1000);
				buttonClicked(choiceTime, ev);
			});
		}
		win.addEventListener('click',function(ev)
		{
		 	Ti.API.debug('Game Start');
			if (!gameStarted){
				gameStarted = true;
				nextStep();
			}
		});
		Titanium.App.addEventListener('pause',function(e)
		{
			paused = true;
			label.text = "App has been paused";
		});
		
		Titanium.App.addEventListener('resume',function(e)
		{
			if (paused)	{
				label.text = "App has resumed";
			} else {
				label.text = "App has resumed (w/o pause)";
			}
		});
		
		

		// //
		// // Cleanup and return home
		// win.addEventListener('android:back', function(e) {
			// if (Boozerlyzer.winHome === undefined 
				 // || Boozerlyzer.winHome === null) {
// 
			// }
			// win.close();
			// Boozerlyzer.winHome.open();
			// Boozerlyzer.winHome.refresh();
		// });
		initialised = true;
	}
	
	function buttonClicked(choiceTime,events){
		Ti.API.debug('stroop button clicked time' + choiceTime );
		
		for (t in events)
			Ti.API.debug(t);
			
		var idx = parseInt(events.source.idx);
		var globalCoords = {x:0,y:0}; 
		if (idx < 0 ){
			globalCoords.x = events.x;
			globalCoords.y = events.y;
		}else{
			globalCoords.x = events.x + imgLeft[idx];
			globalCoords.y = events.y + imgTop[idx];
		}
		var oppidx = 1 - idx;
		loc[idx].touchEnabled = false;
		loc[oppidx].touchEnabled = false;
		var clickTime = new Date().getTime();
		if (parseInt(loc[idx].text) > parseInt(loc[oppidx].text)){
			//they picked the right one!
			//clear the other text box
			loc[oppidx].text = '';
			correctCount++;
			points += 10;
			speedbonus += calcSpeedBonus(startTime,clickTime);
			coordbonus += calcCoordinationBonus(loc[idx].center, globalCoords);
			//five extra points for stroop trials
			inhibitbonus += (isStroopTrial?5:0);
			
		}else{
			loc[idx].text = '';
			missCount++;
			points -= 2;
		}
		//picked one go on to next
		setTimeout(function(){
			if (missCount < 5){
				nextStep();
			}else{
				gameOver();				
			}
		}, stepInterval);
		//fill in the score
		writeScore();
	}
	
	/***
	 * A function that returns n Random Integers 
	 * in the range  0 - floor(max),
	 * with or without duplicates
	 *
	 * @param {Object} n
	 * @param {Object} max
	 * @param {Object} allowDuplicates
	 */
	function nRandomIntegers(n,max,allowDuplicates){
		var set = [];
		var mx = Math.floor(max);
		var count = 0;
		while (set.length<n && (count<mx)){
			var candidate = Math.floor(mx*Math.random());
			if (allowDuplicates){
				set.push(candidate);
			}else if (set.indexOf(candidate) < 0){
				set.push(candidate);
				count++;
			}
		}
		return set;
		
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
	
	function resetScores(){
		maxDigit = 10;
		count = 0;
		points = 0;
		coordbonus = 0;
		speedbonus = 0;
		inhibitbonus = 0;
		level = 0;
		missCount = 0;
		correctCount = 0;
		stroopMissTotal = 0;
		nonStroopMissTotal = 0;		
	}	

	//take these sets each time we reset this screen
	function nextStep(){
		count++;
		if (correctCount > 9){
			//nextLevel!
			level++;
			correctCount = 0;
			missCount = 0;
			stepInterval = Math.max(100,500 - 100*level);
			labelGameMessage.text = "Level " + level;
			clear(labelGameMessage);
			maxDigit = 10 + (level-1)*10;
			useSmallerFonts = (level>9);
		}
		
		//pick two random numbers
		var nums = nRandomIntegers(2,maxDigit,false);
		var maxNumberIndex = (nums[0]>nums[1]?0:1);
		Ti.API.debug('random nums ' + JSON.stringify(nums));
		
		var digitSizeIndices= [];
		if (useSmallerFonts){
			digitSizeIndices = nRandomIntegers(2,11,false);
		}else{
			digitSizesIndices = nRandomIntegers(2,7,false); 
		}
		var maxSizeIndex = (digitSizesIndices[0]>digitSizesIndices[1]?0:1);
		
		//So is this a stroop trial??
		isStroopTrial = (maxNumberIndex !== maxSizeIndex);
		
		for (var i = 0; i < 2; i++) {
			loc[i].visible = true;
			loc[i].text = ''+ nums[i];
			Ti.API.debug('loc[i].text' + loc[i].text);
			if (useSmallerFonts){
				loc[i].font = {fontWeight:"bold",fontFamily:"Helvetica Neue",fontSize: fontsSmaller[digitSizesIndices[i]] };
			}else{
				loc[i].font = {fontWeight:"bold",fontFamily:"Helvetica Neue",fontSize: fontsLarger[digitSizesIndices[i]] };
			}
			loc[i].touchEnabled = true;		
		};
		startTime = new Date().getTime();
		Ti.API.debug('gamestep complete ');
	}
	
	function calcSpeedBonus(startTime,clickTime){
		//TODO - the reaction time bonus (properly!)
		var RT = clickTime - startTime;
		//max 11 points if you do it do it instantly!
		//min  0 points if you take more that 2 seconds 
		return Math.max(0,11-11*RT/2000);
	}
	
	function calcCoordinationBonus(centObj,centTouch){
		// a simple linear bonus of between 0 & 10 points for being
		// between 50 and 0 units from the object center
		var distx = centObj.x - centTouch.x; 
		var disty = centObj.y - centTouch.y;
		var dist = Math.sqrt(distx*distx + disty*disty);
		var bonusdist = Math.min(dist,50);
		return 10*(50-bonusdist)/50;
	}
	
	function writeScore(){
		score.text = Math.floor(points);
	
		var bonusstr = '';
		bonusstr += '   ' + Math.floor(speedbonus) + ' Speed,';
		bonusstr += '   ' + Math.floor(coordbonus) + ' Coordination,';
		bonusstr += '   ' + Math.floor(inhibitbonus) + 'Accuracy';	
		bonus.text = bonusstr;
	}
	
	function gameOver(){
		
		loc[0].visible = false;
		loc[1].visible = false;
		labelGameMessage.visible = true;
		labelGameMessage.text = 'Game Over';
		//labelGameMessage.text = 'Final Score: ' + Math.floor(points+inhibitbonus+coordbonus+speedbonus) + '\nGame Over';
		count = 0;
		missCount = 0;
		setTimeout(function(){// do something 
			labelGameMessage.text = 'Click to start game';
			gameStarted = false;
			},
			6000);
		gameEndSaveScores();
		scoresDialog.setScores( 'Number Stroop', 
						Math.floor(points+inhibitbonus+coordbonus+speedbonus),
						speedbonus, 
						coordbonus,
						inhibitbonus,
						5,
						"",
						'/icons/numberStroop.png' );
		scoresDialog.open();
	}
	scoresDialog.addEventListener('close', function(e){
		setTimeout(function(){
			dialogOpen = false;
			labelGameMessage.visible = true;
			labelGameMessage.text = 'Click to start game';
		}, 1000);
	});
	
	function gameEndSaveScores(){
		var gameSaveData = [{Game: 'NumberStroop',
							GameVersion:1,
							PlayStart:winopened ,
							PlayEnd: parseInt((new Date()).getTime()/1000),
							TotalScore:points,
							Speed_GO:speedbonus,
							Speed_NOGO:0,
							Coord_GO:coordbonus,
							Coord_NOGO:0,
							Level:level,
							Inhibition:inhibitbonus,
							Feedback:'',
							Choices:'',
							SessionID:Titanium.App.Properties.getInt('SessionID'),
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:5		
						}];
		Boozerlyzer.db.gameScores.SaveResult(gameSaveData);
	}

	
	setUpOnce();
	var paused = false;
	
	return win;
};

/**
 * @author Caspar Addyman
 * 
 * The word choice game - which can come in several different varieties
 * When this window is created we pass a variable to say which type
 * @param {String} gameTypes
 * - 'Pissonyms' - select the synonym for being drunk
 * - 'WeFeelFine' - select a feeling word from wefeelfine.org list
 * - 'Emotions' - select one of the emotional words.
 * 
 * Can also pass in a counter to tell how many times we ask the question
 * 
 * @param {object} Home			//reference to homescreen
 * @param {integer} numRounds	//how many more cycles through this screen
 * @param {String} gameType		//what type of words to show
 * 
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

	var winHome = win.Home;
	Ti.include('/analysis/maths.js');
	//include the menu choices	
	Ti.include('/ui/menu.js');
	var menu = menus;
	//need to give it specific help for this screen
	menu.setHelpMessage("Simply pick which ever words you like best. There are no right answers.");

	var suggest, labelGameMessage;
	var choiceTime, roundStarted;
	var winopened = parseInt((new Date()).getTime()/1000,10);
	var gameStarted = false, initialised = false, paused = false;
	var wordList = '', loc = [], wordChoices = [], answers = [];	//array to store the selected answers.
	var answersChoiceTime = [], answersCoordination = [];
	var numRounds = Titanium.UI.currentWindow.numRounds;
	var MgameType = Titanium.UI.currentWindow.gameType;
	var labelChosenWords;
	var imageXyAxes, imageYAxisUp, imageYAxisDown, imageXAxisLeft, imageXAxisRight;
	var imageMisc, arousal = 0,	valence = 0;	
	var imgtop = [60,60,60,180,180,180];
	var imgleft = [60,190,320,60,190,320];
		
	Ti.API.debug('wordgame - numRounds ' + numRounds);
	Ti.API.debug('wordgame - gameType ' + MgameType);
	
	//this code just needs to be called once for this window
	function setUpOnce(){
		if (initialised){return;}
		Ti.API.debug('wordgames setUpOnce started');
	
		answers.length = 0; //empty the array.
		answersChoiceTime.length = 0;
		answersCoordination.length = 0;
		// label across centre of screen for pause, start etc
		labelGameMessage = Ti.UI.createLabel({
			color:'purple',
			font:{fontSize:16,fontWeight:'bold',fontFamily:'Helvetica Neue'},
			textAlign:'center',
			text:'Click to begin telling us how you feel'
		});
		win.add(labelGameMessage);
		
		// Button to allow user to suggest new
		suggest = Ti.UI.createButton({
			title:'Suggest new..',
			width:110,
			height:28,
			bottom:4,
			right:4,
			visible:false,
			backgroundColor:'green'
		});
		win.add(suggest);
		suggest.addEventListener('click',function()
		{
			//TODO
			//lanuch new window with combo box to allow choice.
			setTimeout(function()
			{
				win.close();
			},2000);
		});	
		//suggest.visible = false;
	
		labelChosenWords = Ti.UI.createLabel({
			color:'black',
			font:{fontSize:14,fontWeight:'bold',fontFamily:'Helvetica Neue'},
			textAlign:'center',
			text:'You picked:     \n',
			right:0
		});
		labelChosenWords.visible = false;
		win.add(labelChosenWords);
	
		var bgColor = 'pink';
		if (MgameType === 'Emotions') {
			labelGameMessage.text = 'Choose the word that best appeals to you.';
			bgColor = 'pink';
		} else if (MgameType === 'WeFeelFine') {
			labelGameMessage.text = 'Choose a word, any word';
			bgColor = 'cyan';
		} else if (MgameType === 'Pissonyms') {
			labelGameMessage.text = 'Which pissonym is closest to your level of drunkeness?';
			bgColor = 'orange';
		}
		
		// the six possible locations that the words may appear
		loc[0] = Ti.UI.createLabel({idx:0,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:110,height:80,top:imgtop[0],left:imgleft[0],text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[1] = Ti.UI.createLabel({idx:1,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:110,height:80,top:imgtop[1],left:imgleft[1],text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[2] = Ti.UI.createLabel({idx:2,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:110,height:80,top:imgtop[2],left:imgleft[2],text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[3] = Ti.UI.createLabel({idx:3,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:110,height:80,top:imgtop[3],left:imgleft[3],text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[4] = Ti.UI.createLabel({idx:4,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:110,height:80,top:imgtop[4],left:imgleft[4],text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[5] = Ti.UI.createLabel({idx:5,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:110,height:80,top:imgtop[5],left:imgleft[5],text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
	
		for (var i = 0; i < 6; i++) {
			win.add(loc[i]);
			loc[i].addEventListener('touchstart', function(ev){
				// for (t in ev)
					// Ti.API.debug(t);
				// Ti.API.debug('Clicked ' + ev.source );
				buttonClicked(ev);
			});
			loc[i].visible = false;
		}
		win.addEventListener('click',function(ev)
		{
			Ti.API.debug('Game Start');
			if (!gameStarted){
				gameStarted = true;
				setUpThisRound();
			}
		});
		Titanium.App.addEventListener('pause',function(e)
		{
			paused = true;
			labelGameMessage.text = "App has been paused";
		});
		
		Titanium.App.addEventListener('resume',function(e)
		{
			if (paused)	{
				labelGameMessage.text = "App has resumed";
			} else {
				labelGameMessage.text = "App has resumed (w/o pause)";
			}
		});
		
		
		//
		// Cleanup and return home
		win.addEventListener('android:back', function(e) {
			if (Ti.App.boozerlyzer.winHome === undefined || Ti.App.boozerlyzer.winHome === null) {
				Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
					url: '/app.js',
					title: 'Boozerlyzer',
					backgroundImage: '/images/smallcornercup.png',
					orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
				});
			}
			win.close();
			Ti.App.boozerlyzer.winHome.open();
			Ti.App.boozerlyzer.winHome.refresh();
		
		});
		
		//
		//set up the feedback items.
		//
		imageXyAxes = Ti.UI.createImageView({
								visible:false,
								image:'/images/xy-axes.png',
								height:320,
								width:320,
								top:0,left:60});
		win.add(imageXyAxes);
		imageXAxisLeft = Ti.UI.createImageView({
								visible:false,
								image:'/icons/Sad.png',
								width:40,height:40,
								top:165,left:(60)});
		win.add(imageXAxisLeft);
		imageXAxisRight = Ti.UI.createImageView({
								visible:false,
								image:'/icons/Happy.png',
								width:40,height:40,
								top:165,left:(60+320-40)});
		win.add(imageXAxisRight);
		imageYAxisUp = Ti.UI.createImageView({
								visible:false,
								image:'/icons/OnLamp.png',
								width:40,height:40,
								top:0,left:(60+160-40)});
		win.add(imageYAxisUp);
		imageYAxisDown = Ti.UI.createImageView({
								visible:false,
								image:'/icons/OffLamp.png',
								width:40,height:40,
								top:280,left:(60+160-40)});
		win.add(imageYAxisDown);
		imageMisc = Ti.UI.createImageView({
								visible:false,
								image:'/icons/Misc.png',
								width:30,height:30,
								top:145,left:(60+145)});
		win.add(imageMisc);						
		initialised = true;	
	}
	
	function buttonClicked(events){
		choiceTime = (new Date()).getTime() / 1000;
		Ti.API.debug('word game button clicked time' + choiceTime );
		answers.push(events.source.text);
		answersChoiceTime.push(choiceTime-roundStarted);	
		var idx = parseInt(events.source.idx,10);
		Ti.API.debug('idx:' + idx);
		var cen = events.source.center;
		//need the click in global coordinates
		var globalCoords = {x:0,y:0}; 
		if (idx < 0 ){
			globalCoords.x = events.x;
			globalCoords.y = events.y;
		}else{
			globalCoords.x = events.x + imgleft[idx];
			globalCoords.y = events.y + imgtop[idx];
		}
		Ti.API.debug("whatClicked x,y " + events.x + ", " + events.y  );
		Ti.API.debug("global x,y " + globalCoords.x + ", " + globalCoords.y  );
		Ti.API.debug('source cen' + JSON.stringify(cen));
		var coord =	calcCoordination(cen,globalCoords);
		answersCoordination.push(coord);
		var choice = [{
			ChosenWord: events.source.text,
			WordList: wordList,
			ChoiceStart: roundStarted,
			ChoiceFinish: choiceTime,
			Coordination: coord
		}];
		
		//clear all other words so it's obvious they have picked this one
		for (var j = 0; j < 6; j++) {
			if (idx !== j) {
				loc[j].text = '';
			}
		}
		Ti.API.debug('Clicked ' + idx + ' ' + choice);
		Ti.API.debug('MgameType' + MgameType);
		switch (MgameType) {	
			case 'Pissonyms':
				Ti.App.boozerlyzer.db.pissonyms.Chosen(choice);
				break;
			case 'Emotions':
				Ti.App.boozerlyzer.db.emotionWords.Chosen(choice);
				break;
			case 'WeFeelFine':
				Ti.App.boozerlyzer.db.weFeelFine.Chosen(choice);
				break;
			default:
			//do nothing	
		}
	
		//picked one go on to next
		setTimeout(function(){
			if (win.numRounds > 0){
				//we go around again
				win.numRounds--;
				setUpThisRound();
			}else{
				//show the results.
				gameEndFeedback();				
			}
		}, 1700);
	}
	function calcCoordination(centObj,centTouch){
		var distx = centObj.x - centTouch.x; 
		var disty = centObj.y - centTouch.y;
		var dist = Math.sqrt(distx*distx + disty*disty);
		Ti.API.debug('calcCoordination - dist' + dist);
		return dist;
	}
	
	function gameEndSaveScores(){
		var now = parseInt((new Date()).getTime()/1000,10);
		var speed =  answersChoiceTime.sum() /answersChoiceTime.length;
		var coord = answersCoordination.sum() /answersCoordination.length;
		var SessionID = Titanium.App.Properties.getInt('SessionID');
		var gameSaveData = [{Game: MgameType,
							GameVersion:1,
							PlayStart:winopened ,
							PlayEnd: parseInt((new Date()).getTime()/1000,10),
							TotalScore:valence,
							Speed_GO:speed.toFixed(5),
							Speed_NOGO:0,
							Coord_GO:coord.toFixed(5),
							Coord_NOGO:0,
							Level:arousal,
							Feedback:'',
							Choices:answers,
							SessionID:SessionID,
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:5	
						}];
		Ti.App.boozerlyzer.db.gameScores.SaveResult(gameSaveData);
	}
	/**
	 * Here we display list of chosen words and 
	 * for emotional words the average dominance and arousal scores 
	 * for this selected set. 
	 */
	function gameEndFeedback(){
		for (var i = 0; i < 6; i++) {
			loc[i].text = '';
			loc[i].visible = false;
		}
		Ti.API.debug('answers.length:' + answers.length);
		var answersStr = 'You picked:     \n';	
		for (var i =0; i< answers.length; i++){
			answersStr += answers[i] + '\n';	
		}	
		labelChosenWords.text = answersStr;	
		labelChosenWords.visible = true;
		
		arousal = 0;
		valence = 0;	
		switch (MgameType) {
			case 'Pissonyms':
				pissonymFeedback();
				break;
			case 'Emotions':
				emotionFeedback();
				break;
			case 'WeFeelFine':
				break;
			default:
			//do nothing	
		}
		gameEndSaveScores();
	}
	
	
	//take these sets each time we reset this screen
	function setUpThisRound(){
		
		// note we only make this visible for the pissonyms.	
		suggest.visible = false;
	    imageMisc.visible = false;
		showAxis(false);
		//start a timer
		roundStarted = (new Date()).getTime() / 1000;
		
		//get the number of rounds we still have to go.
		if (numRounds === undefined) {
			numRounds = 1;
		}
		else if (numRounds < 1) {
			//time to go 
			labelGameMessage.text = 'Thank you';
			setTimeout(function(){
				win.close();
			}, 3000);
		}
			
		
		///////////////////////////
		//what type of game is it?
		//get the gameType that has been passed in
		if (MgameType === undefined) {
			//default to emotional words
			MgameType = 'Emotions';
		}
	
		labelGameMessage.text = '';
		
		wordChoices = [];
		if (MgameType === 'Emotions') {
			var emotionwords = Ti.App.boozerlyzer.db.emotionWords.selectNRandomRows(6);
			for (var i = 0; i < 6; i++) {
				wordChoices[i] = emotionwords[i].EmotionalWord;
			}
		} else if (MgameType === 'WeFeelFine') {
			var wefeelfinewords = Ti.App.boozerlyzer.db.weFeelFine.selectNRandomRows(6);
			for (var i = 0; i < 6; i++) {
				wordChoices[i] = wefeelfinewords[i].Feeling;
			}
		} else if (MgameType === 'Pissonyms') {
			var pissonymList = Ti.App.boozerlyzer.db.pissonyms.selectNRandomRows(6);
			for (var i = 0; i < 6; i++) {
				wordChoices[i] = pissonymList[i].Pissonym;
			}
			//except sober is always one of the choices.. 
			//just overwrite one at random
			var soberloc = Math.floor(6*Math.random());
			wordChoices[soberloc] = "Sober";
			//TODO
			//make a suggest new dialog
			//suggest.visible = true;
		}
		wordList = '';
		for (var i = 0; i < 6; i++) {
			wordList += wordChoices[i] + ',';
		}
		
		
		for (var i = 0; i < 6; i++) {
			win.add(loc[i]);
			loc[i].visible = true;
			loc[i].text = wordChoices[i];
			var word = wordChoices[i];
			loc[i].addEventListener('touchstart', function(event){
				var l = i;
				choiceTime = parseInt((new Date()).getTime() / 1000,10);
			});
		}
	}
	
	/**
	 * here we find the mean arousal and valence for all the words chosen
	 * and plot these on xy-axis
	 */ 
	function emotionFeedback(){
		var arousal = 0;
		var valence = 0;
		for (var i =0; i< answers.length; i++){
			var info = Ti.App.boozerlyzer.db.emotionWords.getWordInfo(answers[i]);
			Ti.API.debug('emotion word info ' + JSON.stringify(info));
			if (info!==null){
				arousal += info[0].ArousalMean;
				valence += info[0].ValenceMean;	
			}
		}
		Ti.API.debug('ArousalMean - ' + arousal/answers.length);
		Ti.API.debug('ValenceMean - ' + valence/answers.length);
		
		//convert this scores into values between 0 & 1
		var val = (valence/answers.length - 1.25)/(8.82-1.25);
		var aro = (arousal/answers.length - 2.39)/(8.17-2.39);
	    //then use these to plot the x and y coords of the spot
	    //TODO use layout variables instead of hard coding these values
	    imageMisc.left = 60 + Math.floor(320*val)-15;
	    imageMisc.top = Math.floor(320*aro)-15;
	    imageMisc.visible = true;
		showAxis(true,'Emotions');
	}
	
	function showAxis(visibleFlag, gameType){
		imageXyAxes.visible = visibleFlag;
		imageYAxisUp.visible = visibleFlag;
		imageYAxisDown.visible = visibleFlag;
		imageXAxisLeft.visible = visibleFlag;
		imageXAxisRight.visible = visibleFlag;
		
		switch (gameType){
		case 'Pissonyms':
			imageXAxisLeft.image = '/icons/sober.png';
			imageXAxisRight.image = '/icons/drunk.png';			
			imageXyAxes.visible = false;
			imageYAxisUp.visible = false;
			imageYAxisDown.visible = false;
			break;
		case 'Emotions':
			imageXAxisLeft.image = '/icons/Sad.png';
			imageXAxisRight.image = '/icons/Happy.png';
			break;
			//currently the default
		default:
			//TODO what should we do here? Not sure
		}
	}
	/**
	 * here we find the mean arousal and valence for all the words chosen
	 * and plot these on xy-axis
	 */ 
	function pissonymFeedback(){
		var drunkscore = 0, coordscore = 0, speedscore = 0, count = 0;
		for (var i =0; i< answers.length; i++){
			var info = Ti.App.boozerlyzer.db.pissonyms.getWordInfo(answers[i]);
			Ti.API.debug('pissonym  info ' + JSON.stringify(info));
			if (info!==null && info.length===1){
				count++;
				drunkscore += info[0].DrunkFactor;
			}
		}
		if (count>0){
			Ti.API.debug('DrunkScore - ' + drunkscore/count);

			//convert this scores into values between 0 & 1
			var drunk = (drunkscore/count)/(7);
			//then use these to plot the x and y coords of the spot
		    //TODO use layout variables instead of hard coding these values
		    imageMisc.left = 60 + Math.floor(320*drunk)-15;
		    imageMisc.top = Math.floor(320*0.5)-15;
		    imageMisc.visible = true;
			showAxis(true,'Pissonyms');			
		}
	}
	
	setUpOnce();
	paused = false;

})();
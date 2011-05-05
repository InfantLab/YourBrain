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
 * @param {object} Home      	//reference to homescreen
 * @param {integer} numRounds	//how many more cycles through this screen
 * @param {String} gameType		//what type of words to show
 * 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
				
	var win = Titanium.UI.currentWindow;
	var winHome = win.Home;
	var suggest;
	var labelGameMessage;
	var labelGameMessage;
	var winopened = parseInt((new Date()).getTime()/1000);
	var gameStarted = false;
	var	initialised = false;
	var loc = [];
	var wordChoices = [];
	var wordList = '';
	var answers = [];  		//array to store the selected answers.
	var numRounds = Titanium.UI.currentWindow.numRounds;
	var MgameType = Titanium.UI.currentWindow.gameType;
	var imageXyAxes;
	var imageYAxisUp;
	var imageYAxisDown;
	var imageXAxisLeft;
	var imageXAxisRight;
	var imageMisc;
	var arousal = 0;
	var	valence = 0;	
		
	Ti.API.debug('wordgame - numRounds ' + numRounds);
	Ti.API.debug('wordgame - gameType ' + MgameType);
	
	//this code just needs to be called once for this window
	function setUpOnce(){
		if (initialised) return;
		Ti.API.debug('wordgames setUpOnce started');
	
		answers.length = 0; //empty the array.
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
			width:100,
			height:28,
			bottom:4,
			right:4,
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
		loc[0] = Ti.UI.createLabel({idx:0,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:100,height:80,top:60,left:60,text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[1] = Ti.UI.createLabel({idx:1,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:100,height:80,top:60,left:180,text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[2] = Ti.UI.createLabel({idx:2,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:100,height:80,top:60,left:300,text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[3] = Ti.UI.createLabel({idx:3,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:100,height:80,top:180,left:60,text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[4] = Ti.UI.createLabel({idx:4,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:100,height:80,top:180,left:180  ,text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
		loc[5] = Ti.UI.createLabel({idx:5,anchorPoint:{x:0.5,y:0.5},backgroundColor:bgColor,color:'black',width:100,height:80,top:180,left:300,text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
	
		for (var i = 0; i < 6; i++) {
			win.add(loc[i]);
			loc[i].addEventListener('touchstart', function(ev){
				for (t in ev)
					Ti.API.debug(t);
				Ti.API.debug('Clicked ' + ev.source );
				var choiceTime = parseInt((new Date()).getTime() / 1000);
				buttonClicked(choiceTime, ev);
			});
			loc[i].visible = false;
		}
		win.addEventListener('dblclick',function(ev)
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
		
		
		//
		// Cleanup and return home
		win.addEventListener('android:back', function(e) {
			if (Ti.App.boozerlyzer.winHome === undefined 
				 || Ti.App.boozerlyzer.winHome === null) {
				Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
					url: '../app.js',
					title: 'Boozerlyzer',
					backgroundImage: '../images/smallcornercup.png',
					orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
				})
			}
			win.close();
			Ti.App.boozerlyzer.winHome.open();
		});
		
		//
		//set up the feedback items.
		//
		imageXyAxes = Ti.UI.createImageView({
								visible:false,
								image:'../images/xy-axes.png',
								height:320,
								width:320,
								top:0,left:60});
	   	win.add(imageXyAxes);
		imageXAxisLeft = Ti.UI.createImageView({
								visible:false,
								image:'../icons/Sad.png',
								width:40,height:40,
								top:165,left:(60)});
		win.add(imageXAxisLeft);
		imageXAxisRight = Ti.UI.createImageView({
								visible:false,
								image:'../icons/Happy.png',
								width:40,height:40,
								top:165,left:(60+320-40)});
		win.add(imageXAxisRight);
		imageYAxisUp = Ti.UI.createImageView({
								visible:false,
								image:'../icons/OnLamp.png',
								width:40,height:40,
								top:0,left:(60+160-40)});
		win.add(imageYAxisUp);
		imageYAxisDown = Ti.UI.createImageView({
								visible:false,
								image:'../icons/OffLamp.png',
								width:40,height:40,
								top:280,left:(60+160-40)});
		win.add(imageYAxisDown);
		imageMisc = Ti.UI.createImageView({
								visible:false,
								image:'../icons/Misc.png',
								width:30,height:30,
								top:145,left:(60+145)});
		win.add(imageMisc);						
		initialised = true;	
	}
	
	function buttonClicked(choiceTime,events){
		Ti.API.debug('game2 button clicked time' + choiceTime );
		answers.push(events.source.text);	
		var idx = parseInt(events.source.idx);
		var choice = {
			ChosenWord: events.source.text,
			WordList: wordList,
			ChoiceStart: winopened,
			ChoiceFinish: choiceTime,
			Coordination: -1
		};
		
		
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
				Titanium.App.boozerlyzer.data.pissonyms.Chosen(choice);
				break;
			case 'Emotions':
				Titanium.App.boozerlyzer.data.emotionWords.Chosen(choice);
				break;
			case 'WeFeelFine':
				Titanium.App.boozerlyzer.data.weFeelFine.Chosen(choice);
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
	
	function gameEndSaveScores(){
		var gameSaveData = [{Game: MgameType,
							GameVersion:1,
							PlayStart:winopened ,
							PlayEnd: parseInt((new Date()).getTime()/1000),
							TotalScore:valence,
							Speed_GO:0,
							Speed_NOGO:0,
							Coord_GO:0,
							Coord_NOGO:0,
							Level:arousal,
							Feedback:'',
							Choices:answers,
							SessionID:Titanium.App.Properties.getInt('SessionID'),
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:2		
						}];
		Titanium.App.boozerlyzer.data.gameScores.Result(gameSaveData);
	}
	/**
	 * Here we display list of chosen words and 
	 * for emotional words the average dominance and arousal scores 
	 * for this selected set. 
	 */
	function gameEndFeedback(){
		feedbackState = true;
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
			var emotionwords = Titanium.App.boozerlyzer.data.emotionWords.selectNRandomRows(6);
			for (var i = 0; i < 6; i++) {
				wordChoices[i] = emotionwords[i].EmotionalWord;
			}
		} else if (MgameType === 'WeFeelFine') {
			var wefeelfinewords = Titanium.App.boozerlyzer.data.weFeelFine.selectNRandomRows(6);
			for (var i = 0; i < 6; i++) {
				wordChoices[i] = wefeelfinewords[i].Feeling;
			}
		} else if (MgameType === 'Pissonyms') {
			var pissonymList = Titanium.App.boozerlyzer.data.pissonyms.selectNRandomRows(6);
			for (var i = 0; i < 6; i++) {
				wordChoices[i] = pissonymList[i].Pissonym;
			}
			suggest.visible = true;
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
			loc[i].addEventListener('touchstart', function(ev){
				var l = i;
				var choiceTime = parseInt((new Date()).getTime() / 1000);
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
			var info = Titanium.App.boozerlyzer.data.emotionWords.getWordInfo(answers[i]);
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
		showAxis(true);
	}
	
	function showAxis(visibleFlag){
		imageXyAxes.visible = visibleFlag;
		imageYAxisUp.visible = visibleFlag;
		imageYAxisDown.visible = visibleFlag;
		imageXAxisLeft.visible = visibleFlag;
		imageXAxisRight.visible = visibleFlag;
	}
	
	setUpOnce();
	var paused = false;

})();
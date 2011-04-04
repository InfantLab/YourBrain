/**
 * The word choice game - which can come in several different varieties
 * When this window is created we pass a variable to say which type
 * @param {String} gameTypes
 * - 'Pissonym' - select the synonym for being drunk
 * - 'WeFeelFine' - select a feeling word from wefeelfine.org list
 * - 'Emotion' - select one of the emotional words.
 * 
 * Can also pass in a counter to tell how many times we ask the question
 * 
 * @param {object} Home      	//reference to homescreen
 * @param {integer} numRounds	//how many more cycles through this screen
 * @param {String} gameType		//what type of words to show
 * 
 */
Ti.include('../data/pissonyms.js');
Ti.include('../data/weFeelFine.js');
Ti.include('../data/emotionWords.js');
		
var win = Titanium.UI.currentWindow;
var winHome = win.Home;
var suggest;
var labelGameMessage;
var winopened = parseInt((new Date()).getTime()/1000);
var gameStarted = false;
var	initialised = false;
var loc = [];
var wordChoices = [];
var wordList = '';
var numRounds = Titanium.UI.currentWindow.numRounds;
var MgameType = Titanium.UI.currentWindow.gameType;
Ti.API.debug('game2 - numRounds ' + numRounds);
Ti.API.debug('game2 - gameType ' + MgameType);


//this code just needs to be called once for this window
function setUpOnce(){
	if (initialised) return;

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
		width:70,
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

	// the six possible locations that the words may appear
	loc[0] = Ti.UI.createLabel({idx:0,anchorPoint:{x:0.5,y:0.5},backgroundColor:'orange',color:'black',width:100,height:80,top:60,left:60,name:"loc a",text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
	loc[1] = Ti.UI.createLabel({idx:1,anchorPoint:{x:0.5,y:0.5},backgroundColor:'purple',color:'black',width:100,height:80,top:60,left:180,name:"loc b",text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
	loc[2] = Ti.UI.createLabel({idx:2,anchorPoint:{x:0.5,y:0.5},backgroundColor:'red',color:'black',width:100,height:80,top:60,left:300,name:"loc c",text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
	loc[3] = Ti.UI.createLabel({idx:3,anchorPoint:{x:0.5,y:0.5},backgroundColor:'cyan',color:'black',width:100,height:80,top:180,left:60,name:"loc d",text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
	loc[4] = Ti.UI.createLabel({idx:4,anchorPoint:{x:0.5,y:0.5},backgroundColor:'yellow',color:'black',width:100,height:80,top:180,left:180,name:"loc e",text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});
	loc[5] = Ti.UI.createLabel({idx:5,anchorPoint:{x:0.5,y:0.5},backgroundColor:'pink',color:'black',width:100,height:80,top:180,left:300,name:"loc f",text:'',textAlign:'center',font:{fontSize:13,fontFamily:'Helvetica Neue',fontWeight:'bold'}});

	for (var i = 0; i < 6; i++) {
		win.add(loc[i]);
		loc[i].addEventListener('touchstart', function(ev){
			for (t in ev)
				Ti.API.debug(t);
			Ti.API.debug('Clicked ' + ev.source );
			var choiceTime = parseInt((new Date()).getTime() / 1000);
			buttonClicked(choiceTime, ev);
		});
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
	
	
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (winHome === undefined || winHome === null) {
			winHome = Titanium.UI.createWindow({
				exitOnClose: true,
				url: '../app.js',
				title: 'Boozerlyzer',
				backgroundImage: '../images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			})
		}
		win.close();
		winHome.open();
	});
	initialised = true;
}

function buttonClicked(choiceTime,events){
	for (t in events)
		Ti.API.debug(t);
		
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
	switch (MgameType) {
		case 'Pissonyms':
			pissonyms.Chosen(choice);
			break;
		case 'Emotions':
			emotionalWords.Chosen(choice);
			break;
		case 'WeFeelFine':
			weFeelFineWords.Chosen(choice);
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
			win.close();				
		}
	}, 1700);

}



//take these sets each time we reset this screen
function setUpThisRound(){
	
	// note we only make this visible for the pissonyms.	
	suggest.visible = false;
	
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
		MgameType = 'Emotion';
	}
	
	wordChoices = [];
	if (MgameType === 'Emotion') {
		labelGameMessage.text = 'Choose the word that best appeals to you.';
		var emotionwords = emotionWords.selectNRandomRows(6);
		for (var i = 0; i < 6; i++) {
			wordChoices[i] = emotionwords[i].EmotionalWord;
		}
	} else if (MgameType === 'WeFeelFine') {
		labelGameMessage.text = 'Choose a word, any word';
		var wefeelfinewords = weFeelFineWords.selectNRandomRows(6);
		for (var i = 0; i < 6; i++) {
			wordChoices[i] = wefeelfinewords[i].Feeling;
		}
	} else if (MgameType === 'Pissonyms') {
		labelGameMessage.text = 'Which pissonym is closest to your level of drunkeness?';
		var pissonymList = pissonyms.selectNRandomRows(6);
		for (var i = 0; i < 6; i++) {
			wordChoices[i] = pissonymList[i].Pissonym;
		}
		suggest.visible = false;
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

setUpOnce();
var paused = false;


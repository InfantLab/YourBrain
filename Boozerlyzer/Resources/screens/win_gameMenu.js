/**
 * Copyright 2011 Caspar Addyman
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 *  @author Caspar Addyman
 * 
 * The Game menu, here the user can choose the game they want to play
 * and see how many times they've played each type of game.
 */

Ti.include('../js/datetimehelpers.js');

var win = Titanium.UI.currentWindow;
var winHome = win.Home;
var initialised = false;
var gameViews = []; //keep an array of subviews each containing info for one game
var gameIcons = [];
var gameCounts = [];
var gameNameLabels = [];
var gameLastPlayedLabels = [];
var gameNames = ['Raccoon Hunt', 'Pissonyms', 'Emotional Words', 'We feel fine','Targets','Number Stroop'];
var gametypes = ['StatLearning','Pissonyms', 'Emotion', 'WeFeelFine','Coordination','NumberStroop'];
var numRounds = [0,3,10,10,0,0];
var imgtop = [20,20,20,160,160,160];
var imgleft = [60,180,300,60,180,300];
var iconSize = 94;
var gameImgUrls = ['../icons/teddy_bears.png','../icons/Ice.png','../icons/emotionalwords.png','../icons/feelings.png','../icons/Target-256.png','../icons/numberStroop.png'];
var gameWinUrls = ['../screens/win_game1.js','../screens/win_game2.js','../screens/win_game2.js','../screens/win_game2.js','../screens/win_game1.js','../screens/win_gameStroop.js'];

//this code just needs to be called once for this window
function setUpOnce(){
	if (initialised) return;
	
	for (var idx = 0;idx < 6; idx++){
		//view containing all bits associated with this game
		gameViews[idx] = Ti.UI.createView({idx:idx,top:imgtop[idx],left:imgleft[idx],width:'auto',height:'auto'});
		win.add(gameViews[idx]);
		//icons
		gameIcons[idx] = Ti.UI.createImageView({
										idx:idx,
										image:gameImgUrls[idx],
										height:iconSize,
										width:iconSize,
										top:0,left:0});
		gameViews[idx].add(gameIcons[idx]);
		gameIcons[idx].addEventListener('click',function(e){
			var which = parseInt(e.source.idx);
			Ti.API.debug('winurl -' + gameWinUrls[which] );
			var winplay = Titanium.UI.createWindow({ modal:true,
				url:gameWinUrls[which],
				title:gameNames[which],
				backgroundImage:'../images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT],  //Landscape mode only
				gameType:gametypes[which],
				numRounds:numRounds[which]
				});
			winplay.home = winHome; //reference to home
			winplay.open();
		});
		//The last played time 
		gameNameLabels[idx] = Ti.UI.createLabel({idx:idx,font:{fontSize:9,fontWeight:'bold'},text:gameNames[idx],textAlign:'center',top:95,left:0,width:94});
		gameViews[idx].add(gameNameLabels[idx]);
		//the number of times played 
		gameCounts[idx] = Ti.UI.createLabel({idx:idx,font:{fontSize:9},text:'Game played: ',textAlign:'center',top:108,left:0,width:94});
		gameViews[idx].add(gameCounts[idx]);
		//last played 
		gameLastPlayedLabels[idx] = Ti.UI.createLabel({idx:idx,font:{fontSize:9},text:'Never',textAlign:'center',top:120,left:0,width:94});
		gameViews[idx].add(gameLastPlayedLabels[idx]);
	}
		

	// label across centre of screen for pause, start etc
	labelGameMessage = Ti.UI.createLabel({
		color:'purple',
		font:{fontSize:16,fontWeight:'bold',fontFamily:'Helvetica Neue'},
		textAlign:'center',
		text: '' //'Please choose a game.'
	});
	win.add(labelGameMessage);
	
	
		
//	for (var i = 0; i < 6; i++) {
//		win.add(loc[i]);
//		loc[i].addEventListener('touchstart', function(ev){
//			for (t in ev)
//				Ti.API.debug(t);
//			Ti.API.debug('Clicked ' + ev.source );
//			var choiceTime = parseInt((new Date()).getTime() / 1000);
//			buttonClicked(choiceTime, ev);
//		});
//	}
//	win.addEventListener('dblclick',function(ev)
//	{
//	 	Ti.API.debug('Game Start');
//		if (!gameStarted){
//			gameStarted = true;
//			setUpThisRound();
//		}
//	});
//	Titanium.App.addEventListener('pause',function(e)
//	{
//		paused = true;
//		label.text = "App has been paused";
//	});
//	
//	Titanium.App.addEventListener('resume',function(e)
//	{
//		if (paused)	{
//			label.text = "App has resumed";
//		} else {
//			label.text = "App has resumed (w/o pause)";
//		}
//	});
	
	
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (winHome === undefined || winHome === null) {
			winHome = Titanium.UI.createWindow({
				exitOnClose: true,
				url:'../app.js',
				title:'Boozerlyzer',
				backgroundImage:'../images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			})
		}
		win.close();
		winHome.open();
	});
	
	updateAllGameStats();	
	initialised = true;
}

function updateAllGameStats(){
	for(var i=0;i<6;i++){
		var stats =	fillGameStats(i);
		gameCounts[i].text = 'Games played ' + stats.playcount;
		gameLastPlayedLabels[i].text = prettyDate(stats.lastplayed);
	}

}
	

function fillGameStats(idx){
	var stats ={playcount:0,lastplayed:0};
	switch(idx){
	case 0:
		stats.playcount = 0;
		stats.lastplayed = 0;
		break;
	case 1:
		stats.playcount = 0;
		stats.lastplayed = 0;
		break;
	case 2:
		stats.playcount = 0;
		stats.lastplayed = 0;
		break;
	case 3:
		stats.playcount = 0;
		stats.lastplayed = 0;
		break;
	case 4:
		stats.playcount = 0;
		stats.lastplayed = 0;
		break;
	case 5:
		stats.playcount = 0;
		stats.lastplayed = 0;
		break;		
	}
	return stats;
		
}

setUpOnce();

/** 
 *  @author Caspar Addyman
 * 
 * The Game menu, here the user can choose the game they want to play
 * and see how many times they've played each type of game.
 * 
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
 * 
 * Copyright 2011 YourBrainonDrugs.net
 */
// (function() {

var dbAlias = Boozerlyzer.db;
	
exports.createApplicationWindow = function(){
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
	var winHome = win.Home;
	//include the menu choices	
	// Ti.include('/ui/menu.js');
	// var menu = menus;
	var menu = require('/ui/menu');
	//need to give it specific help for this screen
	menu.setHelpMessage("Click on game icon to start the game.");

	
	var initialised = false;
	//keep an array of subviews each containing info for one game
	var gameViews = [], gameIcons = [],gameCounts = [], gameNameLabels = [], gameLastPlayedLabels = [];
	var gameNames = ['Raccoon Hunt','Memory','Number Stroop', 'Pissonyms', 'Emotional Words', 'We feel fine'];
	var gameTypes = ['StatLearning','DualNBack','NumberStroop','Pissonyms', 'Emotions', 'WeFeelFine'];
	var numRounds = [0,0,0,4,10,10];
	var imgtop = [20,20,20,160,160,160];
	var imgleft = [60,180,300,60,180,300];
	var iconSize = 94;
	var gameImgUrls = ['/icons/teddy_bears.png','/icons/Memory.png','/icons/numberStroop.png','/icons/Ice.png','/icons/emotionalwords.png','/icons/feelings.png'];
//	var gameWinUrls = ['/win/win_gameStatLearn.js','/win/win_gameMemory.js','/win/win_gameStroop.js','/win/win_gameWords.js','/win/win_gameWords.js','/win/win_gameWords.js'];
	var gameWin = [];
	gameWin[0] = require('/win/win_gameStatLearn');
	gameWin[1] = require('/win/win_gameMemory');
	gameWin[2] = require('/win/win_gameStroop');
	gameWin[3] = require('/win/win_gameWords');
	gameWin[4] = require('/win/win_gameWords');
	gameWin[5] = require('/win/win_gameWords');
	
	//this code just needs to be called once for this window
	function setUpOnce(){ 
		if (initialised) {return};
		
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
				var which = parseInt(e.source.idx,10);
				// Ti.API.debug('winurl -' + gameWinUrls[which] );
				// var winplay = Titanium.UI.createWindow({ modal:true,
					// url:gameWinUrls[which],
					// title:gameNames[which],
					// backgroundImage:'/images/smallcornercup.png',
					// orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT],  //Landscape mode only
					// gameType:gameTypes[which],
					// numRounds:numRounds[which]
					// });
				var winplay = gameWin[which].createApplicationWindow(gameTypes[which],numRounds[which]);
				winplay.home = winHome; //reference to home
				winplay.open();
				//add a callback that will fire when the subwindow is closed 
				//a workaround for the focus event not working properly in android
				winplay.addEventListener('close', function() { 
						Titanium.API.debug('gameMenu close callback fired.');
						updateAllGameStats(); 
					});
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
	}//end setupOnce
	
	function updateAllGameStats(){
		for(var i=0;i<6;i++){
			var countObj = dbAlias.gameScores.PlayCount(gameTypes[i]);
			Ti.API.debug('i, countObj ' + i + ' ' + JSON.stringify(countObj));
			if (countObj){
				gameCounts[i].text = 'Games played ' + countObj[0].PlayCount;
			}	
			var lastObj = dbAlias.gameScores.LastPlayed(gameTypes[i]);
			Ti.API.debug('i, lastObj ' + i + ' ' + JSON.stringify(lastObj));
			if (lastObj){
				gameLastPlayedLabels[i].text = Boozerlyzer.dateTimeHelpers.prettyDate(lastObj[0].LastPlayed);
			}
		}
	}
	// label across centre of screen for pause, start etc
	var labelGameMessage = Ti.UI.createLabel({
		color:'purple',
		font:{fontSize:16,fontWeight:'bold',fontFamily:'Helvetica Neue'},
		textAlign:'center',
		text: '' //'Please choose a game.'
	});
	win.add(labelGameMessage);
	
	win.addEventListener('focus', function(){
		Ti.API.debug('gameMenu got focus');
		if (initialised){
			//this code only runs when we reload this page
		    updateAllGameStats();		
		}
	});

		
	//TODO
	//There ought to be a simple way of wrapping this up as a UI element rather than repeating code in 
	//every win_.js file but i tried it a few ways and i never got it to work.
	function goHome(){
		if (Boozerlyzer.winHome === undefined || Boozerlyzer.winHome === null) {
			Boozerlyzer.winHome = Boozerlyzer.win.main.createApplicationWindow();
		}
		win.close();
		Boozerlyzer.winHome.open();
		Boozerlyzer.winHome.refresh();
	}
	//invisible button to return home over the cup
	var homeButton = Titanium.UI.createView({
								image:'/icons/transparenticon.png',
								bottom:0,
							    left:0,
							    width:30,
							    height:60
						    });
	win.add(homeButton);
	homeButton.addEventListener('click',goHome);
	// Cleanup and return home
	win.addEventListener('android:back', goHome);

	setUpOnce();
	initialised = true;
	updateAllGameStats();	
	
	return win;
};
// })();

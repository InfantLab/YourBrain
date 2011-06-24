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
(function() {
	
	var win = Titanium.UI.currentWindow;
	if (Titanium.App.Properties.getBool('MateMode',false)){
		win.backgroundImage = '/images/smallcornercup.matemode.png';
	}else{
		win.backgroundImage = '/images/smallcornercup.png';
	}
	var winHome = win.Home;
	//include the menu choices	
	Ti.include('/ui/menu.js');
	var menu = menus;
	//need to give it specific help for this screen
	menu.setHelpMessage("Click on game icon to start the game.");

	
	var initialised = false;
	//keep an array of subviews each containing info for one game
	var gameViews = [], gameIcons = [],gameCounts = [], gameNameLabels = [], gameLastPlayedLabels = [];
	var gameNames = ['Raccoon Hunt','Memory','Number Stroop', 'Pissonyms', 'Emotional Words', 'We feel fine'];
	var gameTypes = ['StatLearning','DualNBack','NumberStroop','Pissonyms', 'Emotions', 'WeFeelFine'];
	var numRounds = [0,0,0,3,10,10];
	var imgtop = [20,20,20,160,160,160];
	var imgleft = [60,180,300,60,180,300];
	var iconSize = 94;
	var gameImgUrls = ['/icons/teddy_bears.png','/icons/Memory.png','/icons/numberStroop.png','/icons/Ice.png','/icons/emotionalwords.png','/icons/feelings.png'];
	var gameWinUrls = ['/win/win_gameStatLearn.js','/win/win_gameMemory.js','/win/win_gameStroop.js','/win/win_gameWords.js','/win/win_gameWords.js','/win/win_gameWords.js'];
	
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
					backgroundImage:'/images/smallcornercup.png',
					orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT],  //Landscape mode only
					gameType:gameTypes[which],
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
		
		win.addEventListener('focus', function(){
			if (initialised){
				//this code only runs when we reload this page
			    updateAllGameStats();		
			}
		});
		
			
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
		
		updateAllGameStats();	
		initialised = true;
	}
	
	function updateAllGameStats(){
		for(var i=0;i<6;i++){
			var countObj =Ti.App.boozerlyzer.data.gameScores.PlayCount(gameTypes[i]);
			Ti.API.debug('i, countObj ' + i + ' ' + JSON.stringify(countObj));
			if (countObj){
				gameCounts[i].text = 'Games played ' + countObj[0].PlayCount;
			}	
			var lastObj = Ti.App.boozerlyzer.data.gameScores.LastPlayed(gameTypes[i]);
			Ti.API.debug('i, lastObj ' + i + ' ' + JSON.stringify(lastObj));
			if (lastObj){
				gameLastPlayedLabels[i].text = Ti.App.boozerlyzer.dateTimeHelpers.prettyDate(lastObj[0].LastPlayed);
			}
		}
	}
		
	
	
	setUpOnce();
})();
/**
 * @author Caspar Addyman
 * 
 * The user interface for the drink tracking screen. Can add new drinks here.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

// (function() {
// 
		// Boozerlyzer.win.drinks = {}
		var dbAlias = Boozerlyzer.db;
		var dataAlias = Boozerlyzer.data;
		
		exports.createApplicationWindow = function(){
			//the start screen for the YBOB boozerlyzer
			var win = Titanium.UI.createWindow({
				title:'YBOB Boozerlyzer',
				backgroundImage:'/images/smallcornercup.png',
				modal:true,
				title:'What have you had to drink?',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});		
			if (Titanium.App.Properties.getBool('MateMode',false)){
				win.backgroundImage = '/images/smallcornercup.matemode.png';
			}else{
				win.backgroundImage = '/images/smallcornercup.png';
			}
			//include the menu choices	
			// Ti.include('/ui/menu.js');
			// var menu = menus;
			var menu = require('/ui/menu');
			// Include drinks picker component 
			var optionPickerDialog = require('ui/picker_drinks');
			//need to give it specific help for this screen
			menu.setHelpMessage("Click on the icons to add new drinks. Double click on drinks list to edit or delete an entry.");
	
		
			var winOpened = parseInt((new Date()).getTime()/1000,10);
			var loadedonce = false;
			var totalvolAlcohol, currentBloodAlcohol;
			var howLong = ['this session', '1 week', '4 weeks', 'a year'];
			var howLongDays = [1, 7, 28, 365];
			var drinkNames = ['Beer','Wine','Spirits','NULL'];
			var drinkImgs = ['/icons/beer-full.png','/icons/wine.png','/icons/whiskey.png','/icons/whiskey-empty.png'];
			
			
			if (!dataAlias.personalInfo || dataAlias.personalInfo === null || dataAlias.personalInfo === 'undefined'){
				dataAlias.personalInfo = dbAlias.personalInfo.getData();
			}
			Ti.API.debug('dataAlias.standardDrinks ' + dataAlias.standardDrinks );
			Titanium.API.debug('personal info' + JSON.stringify(dataAlias.personalInfo));
			if (!dataAlias.standardDrinks || dataAlias.standardDrinks === null || dataAlias.standardDrinks ==='undefined'){
				dataAlias.standardDrinks = dbAlias.alcoholStandardDrinks.get(dataAlias.personalInfo.Country);
			}
			Ti.API.debug('dataAlias.standardDrinks ' + JSON.stringify(dataAlias.standardDrinks));
			var millsPerStandardUnits = dataAlias.standardDrinks[0].MillilitresPerUnit;
			
			
			// the Dosesage database object
			//current session ID
			var SessionID = Titanium.App.Properties.getInt('SessionID');
			
			//All dose data for this session
			Ti.API.debug('dataAlias.AllDrinks '+ dataAlias.AllDrinks);
			if (!dataAlias.AllDrinks || dataAlias.AllDrinks === null || dataAlias.AllDrinks === false){
				dataAlias.AllDrinks = dbAlias.doseageLog.getAllSessionData(SessionID);
			}
			if (!dataAlias.AllDrinks || dataAlias.AllDrinks.length === 0){
				dataAlias.AllDrinks = dbAlias.doseageLog.newDrink();
				dbAlias.sessions.Updated(SessionID);
			}
			Ti.API.debug('dataAlias.AllDrinks '+ dataAlias.AllDrinks);
			var sessionData = dbAlias.sessions.getSession(SessionID);
	//		Titanium.API.debug('sessionData -' + JSON.stringify(sessionData));
			//find the last row 
			var lastIndex = dataAlias.AllDrinks.length - 1;
			//we will use these to keep count of drinks..
			dataAlias.AllDrinks[lastIndex].DoseageStart = winOpened;
			
			
			// Respond when selection made and dialog closed
			optionPickerDialog.addEventListener('close', function(e){
			    if (e.done===true && e.selectedRow){
			        Ti.API.debug('e.drugVariety '+ e.drugVariety );
			        Ti.API.debug('e.doseSize '+ e.doseSize );
			        Ti.API.debug('e.strength '+ e.strength );
			        Ti.API.debug('e.NumDoses' + e.NumDoses);
					var newDrinks = dbAlias.doseageLog.newDrink();
					newDrinks[0].DoseDescription = e.doseDescription;
					newDrinks[0].DrugVariety = e.drugVariety;
					newDrinks[0].Volume = e.doseSize;
					newDrinks[0].Strength = e.strength;
					newDrinks[0].NumDoses = e.NumDoses;
					newDrinks[0].DrugType = 'Alcohol';
					Ti.API.debug('Total units' +  1000 * e.doseSize * e.strength * e.NumDoses / (100) );
					newDrinks[0].TotalUnits = 1000*e.doseSize * e.strength * e.NumDoses / (100);
					if (isNaN(dataAlias.standardDrinks[0].MillilitresPerUnit) || dataAlias.standardDrinks[0].MillilitresPerUnit <= 0){
						newDrinks[0].StandardUnits = 0;
					}else{
						newDrinks[0].StandardUnits = newDrinks[0].TotalUnits / dataAlias.standardDrinks[0].MillilitresPerUnit;
					}
					newDrinks[0].Changed = true;
			 		Ti.API.debug('std units ' + newDrinks[0].StandardUnits );
					dbAlias.doseageLog.setData(newDrinks);
					tv.appendRow(formatTableRow(newDrinks[0]));
					dataAlias.AllDrinks.push(newDrinks[0]);	
					tv.scrollToIndex(dataAlias.AllDrinks.length -1);
					totalizeDrinks();
			    }
			});
			
			
			//layout variables
			//glass icons and drink counters  
			var leftFull = 140, leftDrinkType = 22;
			var smlIcon = 40, bigIcons = 60;
			var halfOffset = bigIcons-15;
			var topBeer = 10, topWine = 85, topSpirit =150,  topTotal= 200;		
			//session log 
			var leftSession = 250,  topSession = 0;
			
			var sessionView = Ti.UI.createView({
				borderColor:'#888',
				borderWidth:3,
				borderRadius:4,
				backgroundColor:'black',
				width:'auto',
				height:'auto',
				top:topSession,
				left:leftSession,
			});
			win.add(sessionView);
			
			//TODO - find a nice way to show this data
			var calendarTotalDrinksButton = Ti.UI.createButton({
				title:'Total Drinks in last ' + Ti.App.Properties.getString('GrandTotal','1 week'),
				width:136,
				height:36,
				top:3,
				left:3,
				backgroundColor:'gray',
				borderRadius:4
			});
			var howLongDialog = Titanium.UI.createOptionDialog({
				options:howLong,
				destructive:2,
				cancel:1,
				title:'Count drinks over what time period?'
			});
					// add event listener
			howLongDialog.addEventListener('click',function(e)
			{
				Ti.App.Properties.setString('GrandTotal',howLong[e.index]);
				calendarTotalDrinksButton.title = 'Total Drinks in last ' + Ti.App.Properties.getString('GrandTotal','1 week');
				calendarTotalDrinks();
			});
			calendarTotalDrinksButton.addEventListener('click',function()
			{
				howLongDialog.show();
			});	
			win.add(calendarTotalDrinksButton);
	
			
			var beeradd = Titanium.UI.createImageView({
				image:'/icons/beer-full.png',
				height:bigIcons,
				width:bigIcons,
				top:topBeer,
				left:leftFull+halfOffset
			});
			win.add(beeradd);
			beeradd.addEventListener('click',function (){
				// Set data in picker and open as a modal
				optionPickerDialog.setDrinkType('Beer',[2,4,0]);
				optionPickerDialog.open();
			});
			
			
			var beeradd_sml = Titanium.UI.createImageView({
				image:'/icons/beer-full.png',
				height:smlIcon,
				width:smlIcon,
				top:topBeer+bigIcons-smlIcon,
				left:leftFull
			});
			win.add(beeradd_sml);
			beeradd_sml.addEventListener('click',function (){
				// Set data in picker and open as a modal
				optionPickerDialog.setDrinkType('Beer',[2,0,0]);
				optionPickerDialog.open();
			});
	
			var drinkCountLabels = [];
			drinkCountLabels[0] = Ti.UI.createLabel({
				text:'Beer / cider',
				top:topBeer + 20,
				left:leftDrinkType,
				width:100,
				height:bigIcons,
				textAlign:'center',
				color:'white'
			});
			win.add(drinkCountLabels[0]);
			
			
			var wineadd = Titanium.UI.createImageView({
				image:'/icons/wine.png',
				height:bigIcons,
				width:bigIcons,
				top:topWine,
				left:leftFull+halfOffset
			});
			win.add(wineadd);
			wineadd.addEventListener('click',function (){
				// Set data in picker and open as a modal
				optionPickerDialog.setDrinkType('Wine',[2,2,0]);
				optionPickerDialog.open();
			});
			
			
			var wineadd_sml = Titanium.UI.createImageView({
				image:'/icons/wine.png',
				height:smlIcon,
				width:smlIcon,
				top:topWine+bigIcons-smlIcon,
				left:leftFull
			});
			win.add(wineadd_sml);
			wineadd_sml.addEventListener('click',function (){
				// Set data in picker and open as a modal
				optionPickerDialog.setDrinkType('Wine',[2,0,0]);
				optionPickerDialog.open();
			});
			
			drinkCountLabels[1]= Ti.UI.createLabel({
				text:'Wine',
				top:topWine + 20,
				left:leftDrinkType,
				width:100,
				height:bigIcons,
				textAlign:'center',
				color:'white'
			});
			win.add(drinkCountLabels[1]);
			
			var spiritadd = Titanium.UI.createImageView({
				image:'/icons/whiskey.png',
				height:bigIcons * 0.9,
				width:bigIcons * 0.9,
				top:topSpirit+10,
				left:leftFull+halfOffset
			});
			win.add(spiritadd);
			spiritadd.addEventListener('click',function (){
				// Set data in picker and open as a modal
				optionPickerDialog.setDrinkType('Spirits',[2,2,0]);
				optionPickerDialog.open();
			});
			
			
			var spiritadd_sml = Titanium.UI.createImageView({
				image:'/icons/whiskey.png',
				height:smlIcon * 0.9,
				width:smlIcon * 0.9,
				top:topSpirit+bigIcons-smlIcon,
				left:leftFull
			});
			win.add(spiritadd_sml);
			spiritadd_sml.addEventListener('click',function (){
				// Set data in picker and open as a modal
				optionPickerDialog.setDrinkType('Spirits',[2,0,0]);
				optionPickerDialog.open();
			});
			
			
			drinkCountLabels[2] = Ti.UI.createLabel({
				text:'Spirits',
				top:topSpirit + 20,
				left:leftDrinkType,
				width:100,
				height:bigIcons,
				textAlign:'center',
				color:'white'
			});
			win.add(drinkCountLabels[2]);
			
			var BloodAlcohol = Ti.UI.createLabel({
				text:'Blood Alcohol',
				top:topTotal+22,
				left:leftDrinkType,
				width:180,
				height:'auto',
				textAlign:'center',
				color:'white'
			});
			win.add(BloodAlcohol);
			
			function formatTableRow(DrinkData){
				Titanium.API.debug("formatTableRow -" + JSON.stringify(DrinkData));
				//row that holds drink info
			    var row = Ti.UI.createTableViewRow({
			        height: 30,
			        className: 'oneDrink'
			    });
				//first keep a copy of all data .. handy for updating later.		    
			    row.drinkData = DrinkData;
			    //convert DrinkData obj into text, etc.
			    Titanium.API.debug('DrinkData.DoseageStart '+ DrinkData.DoseageStart);
			    var addedTime = Boozerlyzer.dateTimeHelpers.formatTime(DrinkData.DoseageStart,true);
			    var numUnits = DrinkData.TotalUnits / dataAlias.standardDrinks[0].MillilitresPerUnit;
				//calorie calculation = 7kCals per gram of alcohol , 0.79 grams per millilitre
				var numkCals = DrinkData.TotalUnits * 0.79 * 7;
				var thisDrinkUnits = '', thisDrinkkCals = '';
				if (!isNaN(numUnits) && numUnits > 0){
					thisDrinkUnits = numUnits.toFixed(1) + ' u';
					thisDrinkkCals = numkCals.toFixed(0) + 'kCal';
				}
				var whatDrink;
				whatDrink = (DrinkData.DrugVariety !== null  ? DrinkData.DrugVariety : '');
				var doseDesc; 
				doseDesc = (DrinkData.DoseDescription  !== null ? DrinkData.DoseDescription :'');
				var drinkDesc;
			    if (DrinkData.NumDoses === null || DrinkData.NumDoses ===1){
					drinkDesc = doseDesc;
			    }else{
					drinkDesc = DrinkData.NumDoses +  ' x ' + doseDesc;
			    }
				var drinkIDX = drinkNames.indexOf(DrinkData.DrugVariety);
			    //if image is missing show empty class
			    drinkIDX = (drinkIDX >= 0 ? drinkIDX : drinkImgs.length - 1);
			   //icon for drink
			    var imgView = Ti.UI.createImageView({
						            image: drinkImgs[drinkIDX],
						            width:	28,
						            height: 28,
						            left: 0, top:0
						        });
			    row.add(imgView);
			    var drinkDescriptionLabel = Ti.UI.createLabel({
															text:drinkDesc,
															top:0,
															left:32,
															textAlign:'left',
															color:'white',
															font:{fontSize:14,fontWeight:'bold'}
														});
				row.add(drinkDescriptionLabel);
				
				//label to display time and percentage strength
			    var drinkDetailsLabel = Ti.UI.createLabel({
															text:addedTime + '  (' +DrinkData.Strength + '% )',
															top:16,
															left:32,
															textAlign:'left',
															color:'white',
															font:{fontSize:12,fontWeight:'normal'}
														});
				row.add(drinkDetailsLabel);
			    //label to display number of standard drinks/units for this entry
			    var drinkUnitsLabel = Ti.UI.createLabel({
															text: thisDrinkUnits,
															bottom:2,
															right:4,
															textAlign:'right',
															color:'green',
															font:{fontSize:18,fontWeight:'Bold'}
														});
				row.add(drinkUnitsLabel);
			    var drinkkCalsLabel = Ti.UI.createLabel({
															text: thisDrinkkCals,
															top:2,
															right:66,
															textAlign:'right',
															color:'orange',
															font:{fontSize:12,fontWeight:'normal'}
														});
				row.add(drinkkCalsLabel);
				row.addEventListener('click', function(){
					alert('Row clicked - row info:' + JSON.stringify(row.drinkData));
				});
				
				return row;
			}
			
			function totalizeDrinks(){
				var len = dataAlias.AllDrinks.length;
				totalvolAlcohol = 0;
				for (var idx =0;idx<len;idx++){
					totalvolAlcohol += dataAlias.AllDrinks[idx].TotalUnits; 
				}
				if (dataAlias.standardDrinks[0].MillilitresPerUnit > 0){
					footerUnits.text = (totalvolAlcohol / dataAlias.standardDrinks[0].MillilitresPerUnit).toFixed(1) +'u';
					//calorie calculation = 7kCals per gram of alcohol , 0.79 grams per millilitre
					footerkCals.text = (totalvolAlcohol * 0.79 * 7).toFixed(0) + 'kCal'; 
				} 
				calendarTotalDrinks();
	  		 	calcDisplayBloodAlcohol();
			}
			function calendarTotalDrinks(){
				var now = parseInt((new Date()).getTime()/1000);
				var howLongAgo;
				var idx = howLong.indexOf(Titanium.App.Properties.getString('GrandTotal','1 week'));
				Ti.API.debug('calendarTotalDrinks idx, N' + idx + '  ' + howLongDays[idx]);
				if (idx === 0){
					howLongAgo = sessionData[0].StartTime;
				}else{
					howLongAgo = now - howLongDays[idx]*3600*24;
				}
				var totalDrinks	=dbAlias.doseageLog.drinksinTimePeriod(howLongAgo, now);			
				var lenType = drinkNames.length -1;
				var len = totalDrinks.length;
				for (var d=-0;d<lenType;d++){				
					for (var i=0;i<len;i++){
						if (drinkNames[d] === totalDrinks[i].DrugVariety){
							drinkCountLabels[d].text = (totalDrinks[i].TotalUnits / dataAlias.standardDrinks[0].MillilitresPerUnit).toFixed(1) + ' U ' + drinkNames[d];
						
						} 
					}
				}
			
			}
			
			function calcDisplayBloodAlcohol(){
				var now = parseInt((new Date()).getTime()/1000,10);
				currentBloodAlcohol = Boozerlyzer.analysis.BAC.calculate(now, dataAlias.AllDrinks.slice(lastIndex),dataAlias.personalInfo);
				BloodAlcohol.text = 'Blood Alcohol ' + currentBloodAlcohol.toFixed(4) + '%';
				var baLevel = Boozerlyzer.analysis.BAC.levels(currentBloodAlcohol);
				BloodAlcohol.color = baLevel.color;
				footerUnits.color = baLevel.color;	
			}
			
	
			var footer = Ti.UI.createView({	backgroundColor:'#111',height:30});
	
			var footerLabel = Ti.UI.createLabel({
				font:{fontFamily:'Helvetica Neue',fontSize:14,fontWeight:'normal'},
				text:'Totals: ',
				color:'#282',
				textAlign:'right',
				left:4,
				width:'auto',
				height:'auto'
			});
			footer.add(footerLabel);
			var footerUnits = Ti.UI.createLabel({
				font:{fontFamily:'Helvetica Neue',fontSize:24,fontWeight:'bold'},
				text:'',
				color:'Green',
				textAlign:'right',
				right:2,
				bottom:2,
				width:'auto',
				height:'auto'
			});		
			footer.add(footerUnits);
			var footerkCals = Ti.UI.createLabel({
				font:{fontFamily:'Helvetica Neue',fontSize:14,fontWeight:'normal'},
				text:'',
				color:'orange',
				textAlign:'right',
				right:80,
				bottom:2,
				width:'auto',
				height:'auto'
			});		
			footer.add(footerkCals);
			var header = Ti.UI.createView({
				backgroundColor:'#999',
				height:'auto'
			});
			var headerLabel = Ti.UI.createLabel({
				font:{fontFamily:'Helvetica Neue',fontSize:12,fontWeight:'bold'},
				text:'',
				color:'#222',
				textAlign:'center',
				top:0,
				left:4,
				width:'auto',
				height:30
			});
			header.add(headerLabel);
			
			
			var tv = Ti.UI.createTableView({
				headerView:header,
				footerView:footer,
				rowHeight:28
			});
			
			//initial population of drink list.
			var len = dataAlias.AllDrinks.length;
			for(var idx=0;idx<len; idx++){
				tv.appendRow(formatTableRow(dataAlias.AllDrinks[idx]));	
			}
			sessionView.add(tv);
			
			function setSessionLabel(){
				headerLabel.text = 'Session began: ' + Boozerlyzer.dateTimeHelpers.formatDayPlusTime(sessionData[0].StartTime,true);
			}		
			setSessionLabel();
			totalizeDrinks();
			//buttons to navigate to other screens
			
			//Button layout Vars
			var bottomButtons = 5, leftFirst = 50, leftSecond = 132, leftThird = 180;
			
			var newmood = Titanium.UI.createImageView({
				image:'/icons/TheaterYellow2.png',
				height:bigIcons,
				width:bigIcons,
				bottom:bottomButtons,
				left:leftFirst
			});
			newmood.addEventListener('click',function(){
				if (!Boozerlyzer.winEmotion){
					Boozerlyzer.winEmotion = Boozerlyzer.win.emotion.createApplicationWindow();
				}
				Boozerlyzer.winEmotion.open();
				gameEndSaveScores();
				win.close();
			});
			win.add(newmood);
			
			var newtripreport = Titanium.UI.createImageView({
				image:'/icons/tripreport.png',
				height:bigIcons * 0.8,
				width:bigIcons * 0.8,
				bottom:bottomButtons,
				left:leftSecond
			});
			newtripreport.addEventListener('click',function(){
				if (!Boozerlyzer.winTripReport){
					Boozerlyzer.winTripReport = Boozerlyzer.win.tripReport.createApplicationWindow();
				}
				Boozerlyzer.winTripReport.open();
				gameEndSaveScores();
				win.close();
			});
			win.add(newtripreport);
			
			var newgame = Titanium.UI.createImageView({
				image:'/icons/hamsterwheel.png',
				height:bigIcons,
				width:bigIcons,	
				bottom:bottomButtons,
				left:leftThird
			});
			newgame.addEventListener('click',function(){
				if (!Boozerlyzer.winGameMenu || Boozerlyzer.winGameMenu === undefined){
					Boozerlyzer.winGameMenu = Boozerlyzer.win.gameMenu.createApplicationWindow();
				}
				Boozerlyzer.winGameMenu.open();
			});
			win.add(newgame);
			
			//log data to the activity tracker
			// record the total units at the moment
			// and give user 2 lab points for using this screen
			function gameEndSaveScores(){
				Ti.API.debug('Drinks gameEndSaveScores');
				// first get the total drinks this session
				
				var gameSaveData = [{Game: 'Drink Logging',
									GameVersion:1,
									PlayStart:winOpened ,
									PlayEnd: parseInt((new Date()).getTime()/1000,10),
									TotalScore:parseFloat(footerUnits.text,10),
									GameSteps:0,
									Speed_GO:0,
									Speed_NOGO:0,
									Coord_GO:0,
									Coord_NOGO:0,
									Level:0,
									Inhibition:0,
									Feedback:'',
									Choices:'',
									SessionID:Titanium.App.Properties.getInt('SessionID'),
									UserID:Titanium.App.Properties.getInt('UserID'),
									LabPoints:4
								}];
				dbAlias.gameScores.SaveResult(gameSaveData);
			}
			
			//TODO
			//There ought to be a simple way of wrapping this up as a UI element rather than repeating code in 
			//every win_.js file but i tried it a few ways and i never got it to work.
			function goHome(){
				gameEndSaveScores();
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
			
			win.addEventListener('close', function(){
				if (loadedonce){
					//this code only runs when we close this page
					gameEndSaveScores();
				}
			});
					
			loadedonce = true;
			return win;
		};
		
// 		
// })();
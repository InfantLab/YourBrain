/**
 * @author Caspar Addyman
 * 
 * The user interface for the drink tracking screen. Can add new drinks here.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

//include all the necessary objects
var analysisBloodAlcohol = require('/analysis/bloodalcohol');
var dataObject = require('/db/dataObject');
var dbDoseageLog = require('/db/doseageLog');
var dbSessions = require('/db/sessions');
var dbGameScores = require('/db/gameScores');
var dateTimeHelpers = require('/js/dateTimeHelpers');
var picker_drinks = require('/ui/picker_drinks');
var menu = require('/ui/menu');


var allDrinks,win, winHome, winOpened;
var totalUnitsAlcohol,totalvolAlcohol, currentBloodAlcohol;
var labelBloodAlcohol, tableView, footerUnits, footerkCals, headerLabel;
var drinkCountLabels = [];
var loadedonce = false;
var howLong = ['this session', '1 week', '4 weeks', 'a year'];
var howLongDays = [1, 7, 28, 365];
var drinkNames = ['Beer','Wine','Spirits','NULL'];
var drinkImgs = ['/icons/beer-full.png','/icons/wine.png','/icons/whiskey.png','/icons/whiskey-empty.png'];
var lastIndex;
		
//current session ID
var SessionID = Titanium.App.Properties.getInt('SessionID');
Ti.API.debug('win_drinks - SessionID:'+ SessionID);
var sessionData = dbSessions.getSession(SessionID);
	
//need to know where user is from so we can tell standard drink sizes
var standardDrinks = dataObject.getStandardDrinks();
var millsPerStandardUnits = standardDrinks[0].MillilitresPerUnit;
	
		
	function getAllDrinkData(forceReload){
		//All dose data for this session
		if (forceReload || !allDrinks || allDrinks === null || allDrinks === false){
			allDrinks = dataObject.getAllDrinks(true);
		}
		Ti.API.debug('allDrinks '+ JSON.stringify(allDrinks));
		//find the last row 
		lastIndex = allDrinks.length - 1;
	}

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
							TotalScore:totalUnitsAlcohol,
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
		dbGameScores.SaveResult(gameSaveData);
	}
		
	//changed things so reload data
		function updateDrinks(){
			getAllDrinkData(true);
			refreshDrinksTable();
			tableView.scrollToIndex(allDrinks.length -1);
			totalizeDrinks();
		}
		
	// Respond when selection made and dialog closed
	picker_drinks.addEventListener('close', function(editedDrink){
		    if (editedDrink.deleteDrink && editedDrink.ID > 0 ){
				//remove this drink
				dbDoseageLog.deleteDrink(editedDrink.ID);
		    }else  if (editedDrink.done===true && editedDrink.selectedRow){
		        Ti.API.debug('editedDrink='+ JSON.stringify(editedDrink));
				editedDrink.TotalUnits = 1000*editedDrink.Volume * editedDrink.Strength * editedDrink.NumDoses / (100);
				if (isNaN(millsPerStandardUnits) || millsPerStandardUnits<= 0){
					editedDrink.StandardUnits = 0;
				}else{
					editedDrink.StandardUnits = editedDrink.TotalUnits / millsPerStandardUnits;
				}
				//set a few more properties before saving
				editedDrink.SessionID = SessionID;
				if (editedDrink.DoseageStart === null || editedDrink.DoseageStart === 0){
					editedDrink.DoseageStart = parseInt((new Date()).getTime()/1000,10);
				}
				//always update editing time
				editedDrink.DoseageChanged = parseInt((new Date()).getTime()/1000,10);
				editedDrink.Changed = true; 
				dbDoseageLog.setData(editedDrink);
			}
			updateDrinks();
		});
			
	//TODO
	//There ought to be a simple way of wrapping this up as a UI element rather than repeating code in 
	//every win_.js file but i tried it a few ways and i never got it to work.
	function goHome(){
		gameEndSaveScores();
		if (!winHome) {
			var winmain = require('/win/win_main');
			winHome = winmain.createApplicationWindow();
		}
		win.close();
		winHome.open();
		winHome.refresh();
	}		
		function calendarTotalDrinks(){
			var now = parseInt((new Date()).getTime()/1000, 10);
			var howLongAgo;
			var idx = howLong.indexOf(Titanium.App.Properties.getString('GrandTotal','1 week'));
			Ti.API.debug('calendarTotalDrinks idx, N' + idx + '  ' + howLongDays[idx]);
			if (idx === 0){
				howLongAgo = sessionData[0].StartTime;
			}else{
				howLongAgo = now - howLongDays[idx]*3600*24;
			}
			var totalDrinks	=dbDoseageLog.drinksinTimePeriod(howLongAgo, now);			
			var lenType = drinkNames.length -1;
			var len = totalDrinks.length;
			for (var d=-0;d<lenType;d++){				
				for (var i=0;i<len;i++){
					if (drinkNames[d] === totalDrinks[i].DrugVariety){
						drinkCountLabels[d].text = (totalDrinks[i].TotalUnits / millsPerStandardUnits).toFixed(1) + ' U ' + drinkNames[d];
					} 
				}
			}			
		}
		function calcDisplayBloodAlcohol(){
			var now = parseInt((new Date()).getTime()/1000,10);
			currentBloodAlcohol = analysisBloodAlcohol.calculate(now, allDrinks,dataObject.getPersonalInfo());
			labelBloodAlcohol.text = 'Blood Alcohol ' + currentBloodAlcohol.toFixed(4) + '%';
			var baLevel = analysisBloodAlcohol.levels(currentBloodAlcohol);
			labelBloodAlcohol.color = baLevel.color;
			footerUnits.color = baLevel.color;	
		}	
		//count up the units, etc
		function totalizeDrinks(){
			var len = allDrinks.length;
			totalvolAlcohol = 0;
			for (var idx =0;idx<len;idx++){
				totalvolAlcohol += allDrinks[idx].TotalUnits; 
			}
			
			if (millsPerStandardUnits > 0){
				totalUnitsAlcohol = totalvolAlcohol / millsPerStandardUnits;
				footerUnits.text = (totalUnitsAlcohol).toFixed(1) +'u';
				//calorie calculation = 7kCals per gram of alcohol , 0.79 grams per millilitre
				footerkCals.text = (totalvolAlcohol * 0.79 * 7).toFixed(0) + 'kCal'; 
			} 
			calendarTotalDrinks();
			calcDisplayBloodAlcohol();
		}

		
		function setSessionLabel(){
			headerLabel.text = 'Session began: ' + dateTimeHelpers.formatDayPlusTime(sessionData[0].StartTime,true);
		}		
		
		
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
		    Titanium.API.debug('DrinkData.DoseageChanged '+ DrinkData.DoseageChanged);
		    var addedTime = dateTimeHelpers.formatTime(DrinkData.DoseageChanged,true);
		    var numUnits = DrinkData.TotalUnits / millsPerStandardUnits;
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
			//click to edit
			row.addEventListener('click', function(){
		
				// alert('Row clicked - row info:' + JSON.stringify(row.drinkData));
				picker_drinks.setParent(win);
				picker_drinks.setDrinkData(row.drinkData);
				picker_drinks.open();
			});
			//longclick to delete 
			row.addEventListener('longclick',function(){
      	   		var alertDialog = Titanium.UI.createAlertDialog({  
	                title: 'Delete this drink..',  
	                message: 'Are you sure?',  
	                buttonNames: ['OK', 'Cancel']  
	            });
	            alertDialog.addEventListener('click',function(e)  
	            {  
					var drinkID = row.ID;
					if (e.index === 0){
						dbDoseageLog.deleteDrink(drinkID);	
					}
					updateDrinks();
	            });  
			});
			return row;
		}
		
		function formatSameAgainRow(DrinkData){
			Titanium.API.debug("formatSameAgain -" + JSON.stringify(DrinkData));
			//row that holds drink info
		    var row = Ti.UI.createTableViewRow({
		        height: 30,
		        className: 'sameAgainDrink'
		    });
			//first keep a copy of all data .. handy for updating later.		    
		    row.drinkData = DrinkData;
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
														text:"Same Again?",
														top:0,
														left:32,
														textAlign:'left',
														color:'white',
														font:{fontSize:18,fontWeight:'bold'}
													});
			row.add(drinkDescriptionLabel);
							//click to edit
			row.addEventListener('click', function(){
				// picker_drinks.setDrinkData(row.drinkData, true);
				// picker_drinks.open();
				var newDrink = row.drinkData;
				newDrink.ID = -1;
				newDrink.DoseageChanged = parseInt((new Date()).getTime()/1000,10);
				newDrink.Changed = true; 
				dbDoseageLog.setData(newDrink);
				updateDrinks();
			});
			return row;	
		}
		function refreshDrinksTable(){
			Ti.API.debug('refreshDrinksTable');
			//initial population of drink list.
			var len = allDrinks.length;
			var drinkRows = [];
			for(var idx=0;idx<len; idx++){
				if (allDrinks[idx].TotalUnits > 0){
					//add a row
					drinkRows.push(formatTableRow(allDrinks[idx]));	
				}
			}
			if (len > 0){
				//add the same again button
				drinkRows.push(formatSameAgainRow(allDrinks[len-1]));
			}
			tableView.setData(drinkRows);
		}

	/****
	 * create this window
	 */		
	exports.createApplicationWindow = function(){
		//the start screen for the YBOB boozerlyzer
		win = Titanium.UI.createWindow({
			backgroundImage:'/images/smallcornercup.png',
			modal:true,
			title:'What have you had to drink?'
		});	
		win.orientationModes = [Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];	
		if (Titanium.App.Properties.getBool('MateMode',false)){
			win.backgroundImage = '/images/smallcornercup.matemode.png';
		}else{
			win.backgroundImage = '/images/smallcornercup.png';
		}
		
		picker_drinks.setParent(win);
		//need to give it specific help for this screen
		menu.setHelpMessage("Click on the icons to add new drinks. Double click on drinks list to edit or delete an entry.");
		win.activity.onCreateOptionsMenu = function(event){
			menu.createMenus(event);
		};

		winOpened = parseInt((new Date()).getTime()/1000,10);
	
		
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
			left:leftSession
		});
		win.add(sessionView);
		
		//TODO - find a nice way to show this data
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
			openPickerDrinks('Beer',[2,4,0] );
		});
		
		function openPickerDrinks(drinkType,quickSelect){
			// Set data in picker and open as a modal
			picker_drinks.setParent(win);
			picker_drinks.setDrinkType(drinkType);
			picker_drinks.quickSelect(quickSelect);
			picker_drinks.open();
		}
		
		var beeradd_sml = Titanium.UI.createImageView({
			image:'/icons/beer-full.png',
			height:smlIcon,
			width:smlIcon,
			top:topBeer+bigIcons-smlIcon,
			left:leftFull
		});
		win.add(beeradd_sml);
		beeradd_sml.addEventListener('click',function (){
			openPickerDrinks('Beer',[2,0,0] );
		});
			
		
		var wineadd = Titanium.UI.createImageView({
			image:'/icons/wine.png',
			height:bigIcons,
			width:bigIcons,
			top:topWine,
			left:leftFull+halfOffset
		});
		win.add(wineadd);
		wineadd.addEventListener('click',function (){
			openPickerDrinks('Wine',[3,2,0] );
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
			openPickerDrinks('Wine',[2,0,0] );
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
			openPickerDrinks('Spirits',[2,2,0] );
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
			openPickerDrinks('Spirits',[2,0,0] );
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
		
		labelBloodAlcohol = Ti.UI.createLabel({
			text:'Blood Alcohol',
			top:topTotal+22,
			left:leftDrinkType,
			width:180,
			height:'auto',
			textAlign:'center',
			color:'white'
		});
		win.add(labelBloodAlcohol);
		

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
		footerUnits = Ti.UI.createLabel({
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
		footerkCals = Ti.UI.createLabel({
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
		headerLabel = Ti.UI.createLabel({
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


		
		tableView = Ti.UI.createTableView({
			headerView:header,
			footerView:footer,
			rowHeight:28
		});
		sessionView.add(tableView);
		

		
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
			var win_emotion = require('/win/win_emotion');
			var winEmotion = win_emotion.createApplicationWindow();
			winEmotion.open();
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
			var win_TripReport = require('/win/win_tripreport');
			var winTripReport = win_TripReport.createApplicationWindow();
			winTripReport.open();
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
			var  winGames = require('/win/win_gameMenu');
			var winGameMenu =winGames.createApplicationWindow();
			winGameMenu.open();
			win.close();
		});
		win.add(newgame);
		

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
		
		
		//overload the open function to display help dialog
		win.addEventListener('open', function(){
			var initialHelp = require('/ui/initialHelpDialog');
			initialHelp.showNotice('drinkDialog','Click on the different drinks to add them to your total.  You can click on list entires to edit them.');
		});
		
		
		win.addEventListener('close', function(){
			if (loadedonce){
				//this code only runs when we close this page
				gameEndSaveScores();
			}
		});
				
		loadedonce = true;
		updateDrinks();
		

		return win;
	};
	
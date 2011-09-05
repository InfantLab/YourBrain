/**
 * @author Caspar Addyman
 * 
 * The user interface for the drink tracking screen. Can add new drinks here.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {

		var win = Ti.UI.currentWindow;
		if (Titanium.App.Properties.getBool('MateMode',false)){
			win.backgroundImage = '/images/smallcornercup.matemode.png';
		}else{
			win.backgroundImage = '/images/smallcornercup.png';
		}
		//include the menu choices	
		Ti.include('/ui/menu.js');
		var menu = menus;
		//need to give it specific help for this screen
		menu.setHelpMessage("Click on the icons to add new drinks. Double click on drinks list to edit or delete an entry.");

		var winOpened = parseInt((new Date()).getTime()/1000,10);
		var loadedonce = false;
		var totalvolAlcohol, currentBloodAlcohol;
		var howLong = ['this session', '1 week', '4 weeks', 'a year'];
		var howLongDays = [1, 7, 28, 365];
		var drinkNames = ['Beer','Wine','Spirits','NULL'];
		var drinkImgs = ['/icons/beer-full.png','/icons/wine.png','/icons/whiskey.png','/icons/whiskey-empty.png'];
		
		// //Ti.include('/js/datetimehelpers.js');
		// Include component in page
		Ti.include('/ui/picker_drinks.js');
		
		if (!Ti.App.boozerlyzer.data.personalInfo || Ti.App.boozerlyzer.data.personalInfo === null || Ti.App.boozerlyzer.data.personalInfo === 'undefined'){
			Ti.App.boozerlyzer.data.personalInfo = Ti.App.boozerlyzer.db.personalInfo.getData();
		}
		Ti.API.debug('Ti.App.boozerlyzer.data.standardDrinks ' + Ti.App.boozerlyzer.data.standardDrinks );
		if (!Ti.App.boozerlyzer.data.standardDrinks || Ti.App.boozerlyzer.data.standardDrinks === null || Ti.App.boozerlyzer.data.standardDrinks ==='undefined'){
			Ti.App.boozerlyzer.data.standardDrinks = Ti.App.boozerlyzer.db.alcoholStandardDrinks.get(Ti.App.boozerlyzer.data.personalInfo.Country);
		}
		var millsPerStandardUnits = Ti.App.boozerlyzer.data.standardDrinks[0].MillilitresPerUnit;
		Ti.API.debug('Ti.App.boozerlyzer.data.standardDrinks ' + JSON.stringify(Ti.App.boozerlyzer.data.standardDrinks));
		
		
		// the Dosesage database object
		//current session ID
		var SessionID = Titanium.App.Properties.getInt('SessionID');
		
		//All dose data for this session
		Ti.API.debug('Ti.App.boozerlyzer.data.AllDrinks '+ Ti.App.boozerlyzer.data.AllDrinks);
		if (!Ti.App.boozerlyzer.data.AllDrinks || Ti.App.boozerlyzer.data.AllDrinks === null || Ti.App.boozerlyzer.data.AllDrinks === false){
			Ti.App.boozerlyzer.data.AllDrinks = Ti.App.boozerlyzer.db.doseageLog.getAllSessionData(SessionID);
		}
		if (!Ti.App.boozerlyzer.data.AllDrinks || Ti.App.boozerlyzer.data.AllDrinks.length === 0){
			Ti.App.boozerlyzer.data.AllDrinks = Ti.App.boozerlyzer.db.doseageLog.newDrink();
			Ti.App.boozerlyzer.db.sessions.Updated(SessionID);
		}
		Ti.API.debug('Ti.App.boozerlyzer.data.AllDrinks '+ Ti.App.boozerlyzer.data.AllDrinks);
		var sessionData = Ti.App.boozerlyzer.db.sessions.getSession(SessionID);
//		Titanium.API.debug('sessionData -' + JSON.stringify(sessionData));
		//find the last row 
		var lastIndex = Ti.App.boozerlyzer.data.AllDrinks.length - 1;
		//we will use these to keep count of drinks..
		Ti.App.boozerlyzer.data.AllDrinks[lastIndex].DoseageStart = winOpened;
		
		
		// Respond when selection made and dialog closed
		optionPickerDialog.addEventListener('close', function(e){
		    if (e.done===true && e.selectedRow){
		        Ti.API.debug('e.drugVariety '+ e.drugVariety );
		        Ti.API.debug('e.doseSize '+ e.doseSize );
		        Ti.API.debug('e.strength '+ e.strength );
		        Ti.API.debug('e.NumDoses' + e.NumDoses);
				var newDrinks = Ti.App.boozerlyzer.db.doseageLog.newDrink();
				newDrinks[0].DoseDescription = e.doseDescription;
				newDrinks[0].DrugVariety = e.drugVariety;
				newDrinks[0].Volume = e.doseSize;
				newDrinks[0].Strength = e.strength;
				newDrinks[0].NumDoses = e.NumDoses;
				newDrinks[0].DrugType = 'Alcohol';
				Ti.API.debug('Total units' +  1000 * e.doseSize * e.strength * e.NumDoses / (100) );
				newDrinks[0].TotalUnits = 1000*e.doseSize * e.strength * e.NumDoses / (100);
				if (isNaN(Ti.App.boozerlyzer.data.standardDrinks[0].MillilitresPerUnit) || Ti.App.boozerlyzer.data.standardDrinks[0].MillilitresPerUnit <= 0){
					newDrinks[0].StandardUnits = 0;
				}else{
					newDrinks[0].StandardUnits = newDrinks[0].TotalUnits / Ti.App.boozerlyzer.data.standardDrinks[0].MillilitresPerUnit;
				}
				newDrinks[0].Changed = true;
				Ti.API.debug('std units ' + newDrinks[0].StandardUnits );
				Ti.App.boozerlyzer.db.doseageLog.setData(newDrinks);
				tv.appendRow(formatTableRow(newDrinks[0]));
				Ti.App.boozerlyzer.data.AllDrinks.push(newDrinks[0]);	
				tv.scrollToIndex(Ti.App.boozerlyzer.data.AllDrinks.length -1);
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
			title:'Total Drinks in last ' + Ti.App.Properties.getString('GrandTotal','4 weeks'),
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
			howLongDialog.title = 'Total Drinks in last ' + Ti.App.Properties.setString('GrandTotal','4 weeks'),
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
		    var addedTime = Ti.App.boozerlyzer.dateTimeHelpers.formatTime(DrinkData.DoseageStart,true);
		    var numUnits = DrinkData.TotalUnits / Ti.App.boozerlyzer.data.standardDrinks[0].MillilitresPerUnit;
			//calorie calculation = 7kCals per gram of alcohol , 0.79 grams per millilitre
			var numkCals = DrinkData.TotalUnits * 0.79 * 7;
			var thisDrinkUnits = '', thisDrinkkCals = '';
			if (!isNaN(numUnits) && numUnits > 0){
				thisDrinkUnits = numUnits.toFixed(1) + ' u';
				thisDrinkkCals = numkCals.toFixed(0) + 'kCal'
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
			var len = Ti.App.boozerlyzer.data.AllDrinks.length;
			totalvolAlcohol = 0;
			for (var idx =0;idx<len;idx++){
				totalvolAlcohol += Ti.App.boozerlyzer.data.AllDrinks[idx].TotalUnits; 
			}
			if (Ti.App.boozerlyzer.data.standardDrinks[0].MillilitresPerUnit > 0){
				footerUnits.text = (totalvolAlcohol / Ti.App.boozerlyzer.data.standardDrinks[0].MillilitresPerUnit).toFixed(1) +'u';
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
			var totalDrinks	=Ti.App.boozerlyzer.db.doseageLog.drinksinTimePeriod(howLongAgo, now);			
			var lenType = drinkNames.length -1;
			var len = totalDrinks.length;
			for (d=-0;d<lenType;d++){				
				for (i=0;i<len;i++){
					if (drinkNames[d] === totalDrinks[i].DrugVariety){
						drinkCountLabels[d].text = (totalDrinks[i].TotalUnits / Ti.App.boozerlyzer.data.standardDrinks[0].MillilitresPerUnit).toFixed(1) + ' U ' + drinkNames[d];
					
					} 
				}
			}
		
		}
		
		function calcDisplayBloodAlcohol(){
			var now = parseInt((new Date()).getTime()/1000);
			currentBloodAlcohol = Ti.App.boozerlyzer.analysis.BAC.calculate(now, Ti.App.boozerlyzer.data.AllDrinks.slice(lastIndex),Ti.App.boozerlyzer.data.personalInfo);
			BloodAlcohol.text = 'Blood Alcohol ' + currentBloodAlcohol.toFixed(4) + '%';
			var baLevel = Ti.App.boozerlyzer.analysis.BAC.levels(currentBloodAlcohol);
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
		var len = Ti.App.boozerlyzer.data.AllDrinks.length;
		for(var idx=0;idx<len; idx++){
			tv.appendRow(formatTableRow(Ti.App.boozerlyzer.data.AllDrinks[idx]));	
		}
		sessionView.add(tv);
		
		function setSessionLabel(){
			headerLabel.text = 'Session began: ' + Ti.App.boozerlyzer.dateTimeHelpers.formatDayPlusTime(sessionData[0].StartTime,true);
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
			var newmoodwin = Titanium.UI.createWindow({ modal:true,
				url:'/win/win_emotion.js',
				title:'How are you feeling?',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
			gameEndSaveScores();
			win.close();
			newmoodwin.open();
		});
		win.add(newmood);
		
		var newtripreport = Titanium.UI.createImageView({
			image:'/icons/tripreport.png',
			height:bigIcons * .8,
			width:bigIcons * .8,
			bottom:bottomButtons,
			left:leftSecond
		});
		newtripreport.addEventListener('click',function(){
			var newtripwin = Titanium.UI.createWindow({ modal:true,
				url:'/win/win_tripreport.js',
				title:'How are you feeling?',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
			gameEndSaveScores();
			win.close();
			newtripwin.open();
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
			var winplay = Titanium.UI.createWindow({ modal:true,
				url:'/win/win_gameMenu.js',
				title:'YBOB Game',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
			gameEndSaveScores();
			win.close();
			winplay.open();
		});
		win.add(newgame);
		
		// Cleanup and return home
		win.addEventListener('android:back', function(e) {
			gameEndSaveScores();
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
		
		//log data to the activity tracker
		// record the total units at the moment
		// and give user 2 lab points for using this screen
		function gameEndSaveScores(){
			Ti.API.debug('Drinks gameEndSaveScores');
			// first get the total drinks this session
			var now = parseInt((new Date()).getTime()/1000,10);
			
			
			var gameSaveData = [{Game: 'Drink Logging',
								GameVersion:1,
								PlayStart:winOpened ,
								PlayEnd: parseInt((new Date()).getTime()/1000),
								TotalScore:parseFloat(footerUnits.text),
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
								LabPoints:2
							}];
			Ti.App.boozerlyzer.db.gameScores.SaveResult(gameSaveData);
		}

				
		win.addEventListener('close', function(){
			if (loadedonce){
				//this code only runs when we close this page
				gameEndSaveScores();
			}
		});
				
		loadedonce = true;
		
})();
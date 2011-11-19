
/**
 * @author Caspar Addyman
 * 
 * Copyright yourbrainondrugs.net 2011
 */

/**
 * optionPickerDialog.js
 *
 * Works like an OptionDialog, but with a Picker object.
 *
 * Limitations (needs improvements):
 *  - Not a true modal. Does not overlay TabGroup and etc.
 *
 *  Usage:
 *  <code>
 *  // Include component in page
 *  Ti.include('/optionPickerDialog.js');
 *
 *  // Set data in picker and open as a modal
 *  optionPickerDialog.setData([
 *      {title:'Option A'}, {title:'Option B'}, {title:'Option C'}
 *  ]);
 *  optionPickerDialog.open();
 *
 *  // Respond when selection made and close
 *  optionPickerDialog.addEventListener('close', function(e){
 *      if (e.done==true && e.selectedRow){
 *          alert('You selected '+e.selectedRow.title);
 *      }
 *  });
 *  </code>
 *
 * @link http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.OptionDialog-object
 * @link http://cssgallery.info/making-a-combo-box-in-titanium-appcelerator-code-and-video/
 *
 * @author Bart Lewis <bartlewis@gmail.com>
 */

	var callbackOnClose, isControlsCreated = false;
	var coverViewOpenAnimation,coverViewCloseAnimation;
	var containerViewOpenAnimation, containerViewCloseAnimation, cancelButton;
	var deleteButton, doneButton, flexibleSpace, toolbar, picker, containerView, coverView;
	var strengths, sizes, drinkTypeImage;
	var typeIcons =[];
	typeIcons['Beer']    ='/icons/beer-full.png';
	typeIcons['Wine']    = '/icons/wine.png';
	typeIcons['Spirits'] = '/icons/whiskey.png';
	// basic callback event object - very like drink object
	var	returnData = {
			cancel:false,
			done:false,
			selectedRow:null,
			deleteDrink:false,
			ID:-1,
			DrugVariety:'',
			DoseDescription:'',
			DoseageStart: 0,
			DoseageChanged: 0,
			ExitCode: '',
			SessionID:0,
			Volume: 0,
			Strength:0,
			StandardUnits: 0,
			DrugType:'Alcohol',
			TotalUnits: 0,
			NumDoses: 0
		};


	function createControls(){
		if (isControlsCreated) {return;}

		colVolumeLabel = Ti.UI.createLabel({text:'% ABV',top:28,left:66,color:'blue',font: {fontSize: '16',fontWeight:'bold'}});
		colDescriptionLabel = Ti.UI.createLabel({text:'Amount',top:28,left:166,color:'blue',font: {fontSize: '16',fontWeight:'bold'}});
		colCountLabel = Ti.UI.createLabel({text:'Number',top:28,left:282,color:'blue',font: {fontSize: '16',fontWeight:'bold'}});

		picker = Ti.UI.createPicker({		
			useSpinner: true, visibleItems: 4,
			type : Ti.UI.PICKER_TYPE_PLAIN,
			top: 36, height: 160,
			font: {fontSize: "14"}
		});
		
		coverViewOpenAnimation = Ti.UI.createAnimation({opacity:0.9});
		coverViewCloseAnimation = Ti.UI.createAnimation({opacity:0});
		containerViewOpenAnimation = Ti.UI.createAnimation({bottom:0});
		containerViewCloseAnimation = Ti.UI.createAnimation({bottom:-281});


		drinkTypeImage = Ti.UI.createImageView({
			image:'/icons/newdrinks.png',
			height:52,
			width:52,
			top:12,
			left:8
		});
		deleteButton =  Ti.UI.createButton({
			title:'Delete',
			bottom:20,
			left:20,
			width:90
		});
		deleteButton.addEventListener('click', function(){
			returnData.deleteDrink = true;
			returnData.deleteDrink = false;
			exports.close();
		});
		
		cancelButton =  Ti.UI.createButton({
			title:'Cancel',
			bottom:20,
			left:150,
			width:90
		});
		cancelButton.addEventListener('click', function(){
			returnData.deleteDrink = false;
			returnData.cancel = true;
			exports.close();
		});

		doneButton =  Ti.UI.createButton({
			title:'Done',
			bottom:20,
			left:280,
			width:90
 		});
		doneButton.addEventListener('click', function(){
			returnData.deleteDrink = false;
			returnData.cancel = false;
			returnData.done = true;
			returnData.selectedRow = picker.getSelectedRow(0);
			returnData.Strength = parseFloat(picker.getSelectedRow(0).title);
			returnData.Volume = parseFloat(picker.getSelectedRow(1).Volume);
			returnData.DoseDescription = picker.getSelectedRow(1).DoseDesc;
			returnData.NumDoses = picker.getSelectedRow(2).title;
			Ti.API.debug('selected row strength ' + picker.getSelectedRow(0).title); 
			Ti.API.debug('selected row obj ' + JSON.stringify(picker.getSelectedRow(1))); 
			Ti.API.debug('Done button dose Desc' + returnData.doseDescription);
			exports.close();
		});

		Ti.API.debug('win width ' + Ti.UI.currentWindow.width);
		coverView = Ti.UI.createView({
			top:40,
			left:40,
			height:280,
			width:400,
			backgroundColor:'#000',
			opacity:1,
			borderRadius:4,
			borderWidth:4 
		});
		Ti.UI.currentWindow.add(coverView);

		containerView = Ti.UI.createView({height:281, width:400, bottom:-281, zIndex:9});
		containerView.add(colVolumeLabel);
		containerView.add(colDescriptionLabel);
		containerView.add(colCountLabel);
		containerView.add(picker);
		containerView.add(drinkTypeImage);
		containerView.add(doneButton);
		containerView.add(deleteButton);
		containerView.add(cancelButton);
		deleteButton.visible = false;
		Ti.UI.currentWindow.add(containerView);		

		isControlsCreated = true;
	}

	exports.getPicker = function(){return picker;};
	exports.open = function(){	
		coverView.animate(coverViewOpenAnimation);
		containerView.animate(containerViewOpenAnimation);
	};
	exports.close = function(){
		coverView.animate(coverViewCloseAnimation);
		containerView.animate(containerViewCloseAnimation);
		if (callbackOnClose){
			callbackOnClose(returnData);
		}
	};

	/***
	 * Set up a new drink dialog based on an existing drinkData object
	 */
	exports.setDrinkData = function(drinkData){
		createControls();
		returnData = drinkData;
		returnData.cancel =false;
		returnData.done = false;
		returnData.deleteDrink = false;
		deleteButton.visible = true;

		//fill picker rows appropriately
		exports.setDrinkType(returnData.DrugVariety);
	
		//select the correct picker rows.
		//strength
		Ti.API.debug('picker strength row:' + JSON.stringify(picker.columns[0]));
		var nRows = picker.columns[0].rows.length;
		for(var r=0;r<nRows;r++){
			if (picker.columns[0].rows[r].Strength === returnData.Strength){
				Ti.API.debug('picker strength setSelectedRow:');
				picker.setSelectedRow(0,r);
				break;
			}
		}
		//size
		nRows = picker.columns[1].rows.length;
		for(r=0;r<nRows;r++){
			if (picker.columns[1].rows[r].Volume === returnData.Volume){
				picker.setSelectedRow(1,r);
				break;
			}
		}
		//quantity is a bit easier
		picker.setSelectedRow(2,returnData.NumDoses-1);
	};

	/***
	 * fill the spinners with the appropriate drink choices.
	 * 
	 * @DrinkType - String description of drinks are we choosing from
	 * @prevChoice - [optional] three integer array of previous row choices
	 */
	exports.setDrinkType = function(DrinkType){
		createControls();
		
		var i = 0, len, property, row, rows = [], dataLength = DrinkType.length;
		
		returnData.DrugVariety =DrinkType;
		drinkTypeImage.image =  typeIcons[DrinkType];
		Ti.API.debug('picker_drinks set data 3');		
		//Retrieve the strengths for this DrugType
		strengths = Boozerlyzer.db.drugDoses.getStrengths(DrinkType);
		//Fill the appropriate column	
		var columnStrength = Ti.UI.createPickerColumn();
		for (i=0;i<strengths.length;i++){
			var thisStrength = strengths[i].DoseStrength;
			var row = Ti.UI.createPickerRow({title:		thisStrength.toFixed(1)});
			row.extend({
				Strength:thisStrength
			});
			columnStrength.add(row);			
		}

		//Retrieve the strengths for this DrugType
		sizes = Boozerlyzer.db.drugDoses.getSizes(DrinkType);
		//Fill the appropriate column	
		var columnSize = Ti.UI.createPickerColumn();
		// Loop with each data instance to create picker rows
		Ti.API.debug('picker_drinks set data 4');
		for (i=0; i<sizes.length; i++){
			var sizeStr = Math.round(1000*sizes[i].DoseSize) + 'ml -' + sizes[i].DoseDescription;
			var row = Ti.UI.createPickerRow({title:sizeStr});
			row.extend({
					Volume: sizes[i].DoseSize,
					DoseDesc: sizes[i].DoseDescription
				});
			columnSize.add(row);
		}
		
		//how many drinks between 1 & 4
		var columnNumber = Ti.UI.createPickerColumn();
		for (i=0; i<4; i++){		
			columnNumber.add(Ti.UI.createPickerRow({title:(i+1).toFixed(0)}));
		}
		picker.columns = [columnStrength,columnSize,columnNumber];
		Ti.API.debug('picker_drinks set data end');
	};
	exports.quickSelect = function(prevChoices){
		for(var i=0;i<3;i++){
			if (prevChoices[i] >= 0 ){picker.setSelectedRow(i,prevChoices[i]);}
		}
	};

	exports.addEventListener = function(eventName, callback){
		if (eventName=='close') {callbackOnClose = callback;}
	};


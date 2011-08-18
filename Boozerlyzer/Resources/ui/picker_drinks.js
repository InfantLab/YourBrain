
/**
 * @author Caspar Addyman
 * 
 * The user interface for the main screen of the boozerlyzer app.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
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

var optionPickerDialog = (function(){
	var e, callbackOnClose, isControlsCreated = false;
	var containerViewOpenAnimation, containerViewCloseAnimation, cancelButton;
	var doneButton, flexibleSpace, toolbar, picker, containerView, coverView;
	var strengths, sizes;

	function createControls(){
		if (isControlsCreated) {return;}

		colVolumeLabel = Ti.UI.createLabel({text:'%',top:28,left:120,color:'blue',font: {fontSize: "16"}});
		colDescriptionLabel = Ti.UI.createLabel({text:'Amount',top:28,left:210,color:'blue',font: {fontSize: "16"}});
		colCountLabel = Ti.UI.createLabel({text:'Num',top:28,left:330,color:'blue',font: {fontSize: "16"}});

		picker = Ti.UI.createPicker({		
			useSpinner: true, visibleItems: 4,
			type : Ti.UI.PICKER_TYPE_PLAIN,
			top: 36, height: 160,
			font: {fontSize: "14"}
		});
		
		coverViewOpenAnimation = Ti.UI.createAnimation({opacity:0.7});
		coverViewCloseAnimation = Ti.UI.createAnimation({opacity:0});
		containerViewOpenAnimation = Ti.UI.createAnimation({bottom:0});
		containerViewCloseAnimation = Ti.UI.createAnimation({bottom:-251});

		cancelButton =  Ti.UI.createButton({
			title:'Cancel',
			bottom:20,
			left:60,
			width:120
			
			//,style:Ti.UI.iPhone.SystemButtonStyle.BORDERED
		});
		cancelButton.addEventListener('click', function(){
			e.cancel = true;
			api.close();
		});

		doneButton =  Ti.UI.createButton({
			title:'Done',
			bottom:20,
			right:60,
			width:120
			//,			style:Ti.UI.iPhone.SystemButtonStyle.DONE
 		});
		doneButton.addEventListener('click', function(){
			e.done = true;
			e.selectedRow = picker.getSelectedRow(0);
			e.strength = picker.getSelectedRow(0).title;
			Ti.API.debug('selected row strength ' + picker.getSelectedRow(0).strength); 
			
			Ti.API.debug('selected row obj ' + JSON.stringify(picker.getSelectedRow(1))); 
			e.doseSize = picker.getSelectedRow(1).doseSize;
			e.doseDescription = picker.getSelectedRow(1).doseDesc;
			Ti.API.debug('Done button dose Desc' + e.doseDescription);
			e.NumDoses = picker.getSelectedRow(2).title;
			api.close();
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

		containerView = Ti.UI.createView({height:251, bottom:-251, zIndex:9});
		containerView.add(colVolumeLabel);
		containerView.add(colDescriptionLabel);
		containerView.add(colCountLabel);
		containerView.add(picker);
		containerView.add(doneButton);
		containerView.add(cancelButton);

		Ti.UI.currentWindow.add(containerView);		

		isControlsCreated = true;
	}

	/**
	 * Public API
	 */
	var api = {};

	api.getPicker = function(){return picker;};
	api.open = function(){	
		coverView.animate(coverViewOpenAnimation);
		containerView.animate(containerViewOpenAnimation);
	};
	api.close = function(){
		coverView.animate(coverViewCloseAnimation);
		containerView.animate(containerViewCloseAnimation);

		if (callbackOnClose){
			callbackOnClose(e);
		}
	};

	/***
	 * fill the spinners with the appropriate drink choices.
	 * 
	 * @DrinkType - String description of drinks are we choosing from
	 * @prevChoice - [optional] three integer array of previous row choices
	 */
	api.setDrinkType = function(DrinkType,prevChoices){
		var i = 0, len, property, row, rows = [], dataLength = DrinkType.length;

		createControls();

		// reset callback event object
		e = {
			cancel:false,
			done:false,
			selectedRow:null,
			drugType:'Alcohol',
			drugVariety:DrinkType,
			doseSize:0,
			strength:0,
			NumDoses:0,
			doseDescription:0
		};
	
		//clear old columns	
		picker.colums = null;

		Ti.API.debug('picker_drinks set data 3');		
		//Retrieve the strengths for this DrugType
		strengths = Ti.App.boozerlyzer.db.drugDoses.getStrengths(DrinkType);
		//Fill the appropriate column	
		var columnStrength = Ti.UI.createPickerColumn();
		for (i=0;i<strengths.length;i++){
			var thisStrength = strengths[i].DoseStrength;
			var row = Ti.UI.createPickerRow({title:		thisStrength.toFixed(1)});
			row.extend({
				strength:thisStrength
			});
			columnStrength.add(row);			
		}

		//Retrieve the strengths for this DrugType
		sizes = Ti.App.boozerlyzer.db.drugDoses.getSizes(DrinkType);
		//Fill the appropriate column	
		var columnSize = Ti.UI.createPickerColumn();
		// Loop with each data instance to create picker rows
		Ti.API.debug('picker_drinks set data 4');
		for (i=0; i<sizes.length; i++){
			var sizeStr = Math.round(1000*sizes[i].DoseSize) + 'ml -' + sizes[i].DoseDescription;
			var row = Ti.UI.createPickerRow({title:sizeStr});
			row.extend({
					doseSize: sizes[i].DoseSize,
					doseDesc: sizes[i].DoseDescription
				});
			columnSize.add(row);
		}
		
		//how many drinks between 1 & 4
		var columnNumber = Ti.UI.createPickerColumn();
		for (i=0; i<4; i++){		
			columnNumber.add(Ti.UI.createPickerRow({title:(i+1).toFixed(0)}));
		}
	
		picker.columns = [columnStrength,columnSize,columnNumber];
		for(i=0;i<3;i++){
			if (prevChoices[i] >= 0){picker.setSelectedRow(i,prevChoices[i]); } 	 	
		}
		Ti.API.debug('picker_drinks set data end');

	};

	api.addEventListener = function(eventName, callback){
		if (eventName=='close') {callbackOnClose = callback;}
	};

	return api;
}());
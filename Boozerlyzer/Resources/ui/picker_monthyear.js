
/**
 * @author Caspar Addyman
 * 
 * The user interface for the main screen of the boozerlyzer app.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

	var win;
	var e, callbackOnClose, isControlsCreated = false;
	var containerViewOpenAnimation, containerViewCloseAnimation, cancelButton;
	var coverViewOpenAnimation, coverViewCloseAnimation;
	var doneButton, flexibleSpace, toolbar, picker, containerView, coverView;
	var monthName = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	
	function createControls(){
		if (isControlsCreated) {return;}

		picker = Ti.UI.createPicker({		
			useSpinner: true, visibleItems: 4,
			type : Ti.UI.PICKER_TYPE_PLAIN,
			top: 40, height: 160,
			font: {fontSize: "20"},
			zIndex:0
		});
		
		coverViewOpenAnimation = Ti.UI.createAnimation({opacity:0.7});
		coverViewCloseAnimation = Ti.UI.createAnimation({opacity:0});
		containerViewOpenAnimation = Ti.UI.createAnimation({bottom:0});
		containerViewCloseAnimation = Ti.UI.createAnimation({bottom:-251});

		cancelButton =  Ti.UI.createButton({
			title:'Cancel',
			bottom:20,
			left:60,
			width:120,
			zIndex:0
			//,style:Ti.UI.iPhone.SystemButtonStyle.BORDERED
		});
		cancelButton.addEventListener('click', function(){
			e.cancel = true;
			exports.close();
		});

		doneButton =  Ti.UI.createButton({
			title:'Done',
			bottom:20,
			right:60,
			width:120,
			zIndex:0
			//,			style:Ti.UI.iPhone.SystemButtonStyle.DONE
 		});
		doneButton.addEventListener('click', function(){
			e.done = true;
			e.month = monthName.indexOf(picker.getSelectedRow(0).title) + 1;
			e.year = picker.getSelectedRow(1).title;
			exports.close();
		});

		Ti.API.debug('win width ' + win.width);
		coverView = Ti.UI.createView({
			top:40,
			left:40,
			height:280,
			width:360,
			backgroundColor:'#000',
			opacity:1,
			borderRadius:4,
			borderWidth:4 ,
			zIndex:0
		});
		win.add(coverView);

		containerView = Ti.UI.createView({height:251, bottom:-251, zIndex:9});
		containerView.add(picker);
		containerView.add(doneButton);
		containerView.add(cancelButton);

		win.add(containerView);		

		isControlsCreated = true;
	}


	exports.getPicker = function(){return picker;};
	exports.setParent = function (window){
		win = window;
	};
	exports.open = function(){	
		coverView.animate(coverViewOpenAnimation);
		containerView.animate(containerViewOpenAnimation);
	};
	exports.close = function(){
		coverView.animate(coverViewCloseAnimation);
		containerView.animate(containerViewCloseAnimation);

		if (callbackOnClose){
			callbackOnClose(e);
		}
	};

	/***
	 * fill the spinners with the appropriate drink choices.
	 * 
	 * @minYear - String description of drinks are we choosing from
	 * @prevChoice - [optional] three integer array of previous row choices
	 */
	exports.setBirthMonthYear = function(minYear, maxYear, prevChoices){
		var i = 0, len, property, row, rows = [];

		createControls();

		// reset callback event object
		e = {
			cancel:false,
			done:false,
			month:0,
			year:0
		};
	
		//clear old columns	
		picker.colums = null;

		//Fill the month column	
		var columnMonth = Ti.UI.createPickerColumn();
		// Loop with each data instance to create picker rows
		for (i=0; i<monthName.length; i++){
			columnMonth.add(Ti.UI.createPickerRow({title:monthName[i]}));
		}
		
		//how many drinks between 1 & 4
		var columnYear = Ti.UI.createPickerColumn();
		for (i=minYear; i<maxYear; i++){		
			columnYear.add(Ti.UI.createPickerRow({title:(i).toFixed(0)}));
		}
	
		picker.columns = [columnMonth,columnYear];
		Ti.API.debug('prevChoices' + JSON.stringify(prevChoices));
		if (prevChoices[0] >= 0){picker.setSelectedRow(0,prevChoices[0] -1);}  	 	
		if (prevChoices[1] >= 0){picker.setSelectedRow(1,prevChoices[1]-minYear);}  	 	
		
	};

	exports.addEventListener = function(eventName, callback){
		if (eventName=='close') {callbackOnClose = callback;}
	};


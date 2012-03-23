	
	/***
	 * A dialog that shows when you first access a screen but 
	 * not after that.
	 */
	exports.showNotice= function(noticeName,noticeMessage){
	
		if (Ti.App.Properties.getBool(noticeName, true)){
			var alertNotice = Ti.UI.createAlertDialog({
				buttonNames: ['OK',  'Don\'t show again'],
				cancel:0,
				title: 'Notice',
				message: noticeMessage
			});
			alertNotice.show();
			alertNotice.addEventListener('click', function(e){
				if(e.index === 1){
					Ti.App.Properties.setBool(noticeName, false);
				}
			});
		}
			
	}
	
/**
 * @author Caspar Addyman
 * 
 * functions for exporting sending gameScores to a file stored on the
 * user's phone.  
 */

(function(){

	Ti.App.boozerlyzer.comm.exportGameData = {};

	/*
	 * function to send the gameScores  table entries to the ybodnet web database
	 */
	Ti.App.boozerlyzer.comm.exportGameData.exportCSV = function(){
		Ti.API.debug('Exporting CSV...');
		if (!Titanium.Filesystem.isExternalStoragePresent){
			var noStorage = Ti.UI.createAlertDialog('Export failed. SD Card not found.');
			noStorage.show();
		}
		
		var boozerlyzerDir = Titanium.Filesystem.getFile(Titanium.Filesystem.externalStorageDirectory,'BoozeData');
		if (!boozerlyzerDir.exists()){
			Ti.API.info('creating Boozerlyzer directory on SD card');
			boozerlyzerDir.createDirectory();
		}
		Ti.API.info('BoozeData directory - ' + boozerlyzerDir.nativePath);
		var outfile = Titanium.Filesystem.getFile(boozerlyzerDir.nativePath,'boozerlyzing.csv');
		var overwriteDialog = Titanium.UI.createAlertDialog({
					buttonNames:['OK', 'Cancel'],
					cancel:1,
					title:'File already exists. Overwrite?'
				});
		// add event listener
		overwriteDialog.addEventListener('click',function(e)
		{
			if (e.index === 0) {
				Ti.App.boozerlyzer.comm.exportGameData.writeCSV(outfile);
			}else{
				//nothing
			}
		});
		if (outfile.exists()){
			overwiteDialog.show();
		} else {
			Ti.App.boozerlyzer.comm.exportGameData.writeCSV(outfile);
		}

	
	};
	Ti.App.boozerlyzer.comm.exportGameData.writeCSV = function(outfile){
		//get data from elsewhere
		var data = Ti.App.boozerlyzer.db.gameScores.GamePlaySummary(null,null,0);
		//what is the last row id from this dataset?
		if (!data || data.length==0) {
			Ti.API.error('sendGameData: no data to send; play some games first!');
			return;
		}
	
		//set up column headers
		var result = [];
		result.push('"name","company"\n');
		 
		for(var i=0,j=data.length; i<j; i++)
		{
		 result.push('"');
		 result.push(data[i].name);
		 result.push('","');
		 result.push(data[i].company);
		 result.push('"\n');
		}
		 
		var dataString = result.join('');
		outfile.write(dataString);
		 
		Titanium.API.info("export.csv created: " + String(new Date( outfile.createTimestamp())));
		Titanium.API.info("export.csv modified: " + String(new Date( outfile.modificationTimestamp())));
	
	};
}());
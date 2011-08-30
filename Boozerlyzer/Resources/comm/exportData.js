/**
 * @author Caspar Addyman
 * 
 * functions for exporting sending gameScores to a tabfile stored on the
 * user's phone.  
 */

(function(){

	Ti.App.boozerlyzer.comm.exportData = {};

	/*
	 * function to send the gameScores  table entries to the ybodnet web database
	 */
	Ti.App.boozerlyzer.comm.exportData.exportTabFiles = function(){
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
		// var overwriteDialog = Titanium.UI.createAlertDialog({
					// buttonNames:['OK', 'Cancel'],
					// cancel:1,
					// title:'File already exists. Overwrite?'
				// });
		// // add event listener
		// overwriteDialog.addEventListener('click',function(e)
		// {
			// if (e.index === 0) {
				// Ti.App.boozerlyzer.comm.exportData.writeCSV(outfile);
			// }else{
				// //nothing
			// }
		// });
		// if (outfile.exists()){
			// overwriteDialog.show();
		// } else {
			// Ti.App.boozerlyzer.comm.exportData.writeCSV(outfile);
		// }

	
	};
	Ti.App.boozerlyzer.comm.exportData.writeGameScores = function(dataDir){
		Ti.API.debug('writing Game scores...');
		var outfile = Titanium.Filesystem.getFile(dataDir.nativePath,'gameScores.dat');

		//get data from elsewhere
		var data = Ti.App.boozerlyzer.db.gameScores.GamePlaySummary(null,null,0);
		//what is the last row id from this dataset?
		if (!data || data.length===0) {
			Ti.API.error('writeCSV: no data to send; play some games first!');
			return;
		}
	
		//set up column headers
		var columnHeadings = 'ID\tUserID\tGame\tGameVersion\tPlayStart\tPlayEnd\tLabPoints\t';
		columnHeadings    += 'TotalScore\tLevel\tGameSteps\tFeedback\tChoices\tSpeed_GO\tSpeed_NOGO\t';
		columnHeadings    += 'Coord_GO\tCoord_NOGO\tMemoryScore\tInhibtionScore\tSessionID\tAlcohol_ml\tBloodAlcoholConc\n'
		var result = [];
		result.push(columnHeadings);
		
		Ti.API.error('writeCSV: writing ' + data.length + 'rows');
		for(var i=0,j=data.length; i<j; i++)
		{
		 result.push('');
		 result.push(data[i].ID);
		 result.push('\t');
		 result.push(data[i].UserID);
		 result.push('\t');
		 result.push(data[i].Game);
		 result.push('\t');
		 result.push(data[i].GameVersion);
		 result.push('\t');
		 result.push(data[i].PlayStart);
		 result.push('\t');
 		 result.push(data[i].PlayEnd);
		 result.push('\t');
		 result.push(data[i].LabPoints);
		 result.push('\t');
		 result.push(data[i].TotalScore);
		 result.push('\t');
		 result.push(data[i].Level);
		 result.push('\t');
		 result.push(data[i].GameSteps);
		 result.push('\t');
		 result.push(data[i].Feedback);
		 result.push('\t');
		 result.push(data[i].Choices);
		 result.push('\t');
		 result.push(data[i].Speed_GO);
		 result.push('\t');
		 result.push(data[i].Speed_NOGO);
		 result.push('\t');
		 result.push(data[i].Coord_GO);
		 result.push('\t');
		 result.push(data[i].Coord_NOGO);
		 result.push('\t');
		 result.push(data[i].MemoryScore);
		 result.push('\t');
		 result.push(data[i].InhibitionScore);
		 result.push('\t');
		 result.push(data[i].SessionID);
		 result.push('\t');
		 result.push(data[i].Alcohol_ml);
		 result.push('\t');
		 result.push(data[i].BloodAlcoholConc);
		 result.push('\n');

		}
		 
		var dataString = result.join('');
		outfile.write(dataString);
		 
		Titanium.API.info("export.csv created: " + String(new Date( outfile.createTimestamp())));
		Titanium.API.info("export.csv modified: " + String(new Date( outfile.modificationTimestamp())));
	
	};
		Ti.App.boozerlyzer.comm.exportData.writeGameScores = function(dataDir){
		Ti.API.debug('writing Game scores...');
		var outfile = Titanium.Filesystem.getFile(dataDir.nativePath,'gameScores.dat');

		//get data from elsewhere
		var data = Ti.App.boozerlyzer.db.gameScores.GamePlaySummary(null,null,0);
		//what is the last row id from this dataset?
		if (!data || data.length===0) {
			Ti.API.error('writeCSV: no data to send; play some games first!');
			return;
		}
	
		//set up column headers
		var columnHeadings = 'ID\tUserID\tGame\tGameVersion\tPlayStart\tPlayEnd\tLabPoints\t';
		columnHeadings    += 'TotalScore\tLevel\tGameSteps\tFeedback\tChoices\tSpeed_GO\tSpeed_NOGO\t';
		columnHeadings    += 'Coord_GO\tCoord_NOGO\tMemoryScore\tInhibtionScore\tSessionID\tAlcohol_ml\tBloodAlcoholConc\n'
		var result = [];
		result.push(columnHeadings);
		
		Ti.API.error('writeCSV: writing ' + data.length + 'rows');
		for(var i=0,j=data.length; i<j; i++)
		{
		 result.push('');
		 result.push(data[i].ID);
		 result.push('\t');
		 result.push(data[i].UserID);
		 result.push('\t');
		 result.push(data[i].Game);
		 result.push('\t');
		 result.push(data[i].GameVersion);
		 result.push('\t');
		 result.push(data[i].PlayStart);
		 result.push('\t');
 		 result.push(data[i].PlayEnd);
		 result.push('\t');
		 result.push(data[i].LabPoints);
		 result.push('\t');
		 result.push(data[i].TotalScore);
		 result.push('\t');
		 result.push(data[i].Level);
		 result.push('\t');
		 result.push(data[i].GameSteps);
		 result.push('\t');
		 result.push(data[i].Feedback);
		 result.push('\t');
		 result.push(data[i].Choices);
		 result.push('\t');
		 result.push(data[i].Speed_GO);
		 result.push('\t');
		 result.push(data[i].Speed_NOGO);
		 result.push('\t');
		 result.push(data[i].Coord_GO);
		 result.push('\t');
		 result.push(data[i].Coord_NOGO);
		 result.push('\t');
		 result.push(data[i].MemoryScore);
		 result.push('\t');
		 result.push(data[i].InhibitionScore);
		 result.push('\t');
		 result.push(data[i].SessionID);
		 result.push('\t');
		 result.push(data[i].Alcohol_ml);
		 result.push('\t');
		 result.push(data[i].BloodAlcoholConc);
		 result.push('\n');

		}
		 
		var dataString = result.join('');
		outfile.write(dataString);
		 
		Titanium.API.info("export.csv created: " + String(new Date( outfile.createTimestamp())));
	};
	
}());
/**
 * @author Caspar Addyman
 * 
 * functions for exporting sending gameScores to a tabfile stored on the
 * user's phone.  
 */

(function(){

	//Note we need to use an alias of comm variable (for some reason that i don't fully understand)
	var commAlias = Boozerlyzer.comm;
	commAlias.exportData = {};

	/*
	 * function to send the gameScores  table entries to the ybodnet web database
	 */
	commAlias.exportData.exportTabFiles = function(){
		Ti.API.debug('Exporting Tab Files...');
		if (!Titanium.Filesystem.isExternalStoragePresent){
			var noStorage = Ti.UI.createAlertDialog('Export failed. SD Card not found.');
			noStorage.show();
			return;
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
				// commAlias.exportData.writeCSV(outfile);
			// }else{
				// //nothing
			// }
		// });
		// if (outfile.exists()){
			// overwriteDialog.show();
		// } else {
			// commAlias.exportData.writeCSV(outfile);
		// }
		commAlias.exportData.writeGameScores(boozerlyzerDir);
		commAlias.exportData.writeAllDrinks(boozerlyzerDir);
	
	};
	commAlias.exportData.writeGameScores = function(dataDir){
		Ti.API.debug('writing Game scores...');
		var outfile = Titanium.Filesystem.getFile(dataDir.nativePath,'gameScores.dat');

		//get data from elsewhere
		var data = Boozerlyzer.db.gameScores.GamePlaySummary(null,null,0);
		//what is the last row id from this dataset?
		if (!data || data.length===0) {
			Ti.API.error('writeCSV: no data to send; play some games first!');
			return;
		}
	
		//set up column headers
		var columnHeadings = 'ID\tUserID\tGame\tGameVersion\tPlayStart\tPlayEnd\tLabPoints\t';
		columnHeadings    += 'TotalScore\tLevel\tGameSteps\tFeedback\tChoices\tSpeed_GO\tSpeed_NOGO\t';
		columnHeadings    += 'Coord_GO\tCoord_NOGO\tMemoryScore\tInhibtionScore\tSessionID\tAlcohol_ml\t';
		columnHeadings    += 'BloodAlcoholConc\tHappiness\tEnergy\tDrunkeness\n';
		var result = [];
		result.push(columnHeadings);
		
		Ti.API.error('writeTABfile: writing ' + data.length + 'rows');
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
		 result.push('\t');
		 result.push(data[i].Happiness);
		 result.push('\t');
		 result.push(data[i].Energy);
		 result.push('\t');
		 result.push(data[i].Drunkeness);
		 result.push('\n');

		}
		 
		var dataString = result.join('');
		outfile.write(dataString);
		 
		Titanium.API.info("gameScores.tsv created: " + String(new Date( outfile.createTimestamp())));
		Titanium.API.info("gameScores.tsv modified: " + String(new Date( outfile.modificationTimestamp())));
	
	};
	commAlias.exportData.writeAllDrinks = function(dataDir){
		Ti.API.debug('writing all Drinks...');
		var outfile = Titanium.Filesystem.getFile(dataDir.nativePath,'gameScores.dat');

		//get data from elsewhere
		var now =  parseInt((new Date()).getTime()/1000,10);
		var data = Boozerlyzer.db.doseageLog.getTimeRangeData(0,now);
		//what is the last row id from this dataset?
		if (!data || data.length===0) {
			Ti.API.error('writeDrinkData: no data to send; drink something first!');
			return;
		}
	
		//set up column headers
		var columnHeadings = 'ID\tDrugVariety\tDoseDescription\tDoseageStart\tDoseageChanged\tExitCode\t';
		columnHeadings    += 'SessionID\tVolume\tStrength\tStandardUnits\tDrugType\tTotalUnits\tNumDoses\n';
		var result = [];
		result.push(columnHeadings);
				
		Ti.API.error('writeCSV: writing ' + data.length + 'rows');
		for(var i=0,j=data.length; i<j; i++)
		{
		 result.push('');
		 result.push(data[i].ID);
		 result.push('\t');
		 result.push(data[i].DrugVariety);		//beer/wine/spirits
		 result.push('\t');
		 result.push(data[i].DoseDescription);	//pint/sml glass etc
		 result.push('\t');
		 result.push(data[i].DoseageStart);		//time opened the drinks log window
		 result.push('\t');
		 result.push(data[i].DoseageChanged);	//time we closed it
		 result.push('\t');
		 result.push(data[i].ExitCode);			//how did we close it (not used)
		 result.push('\t');
		 result.push(data[i].SessionID);		//current session id
		 result.push('\t');
		 result.push(data[i].Volume);			//Size of drink in millilitres
		 result.push('\t');
		 result.push(data[i].Strength);			//Strength as % abv
		 result.push('\t');
		 result.push(data[i].StandardUnits);	//how many standard units (for given country)
		 result.push('\t');
		 result.push(data[i].DrugType);			//always 'Alcohol'
		 result.push('\t');
		 result.push(data[i].TotalUnits);		//Total millilitres pure alcohol
		 result.push('\t');
		 result.push(data[i].NumDoses);			//Number of drinks
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
		 result.push('\t');
		 result.push(data[i].Happiness);
		 result.push('\t');
		 result.push(data[i].Energy);
		 result.push('\t');
		 result.push(data[i].Drunkeness);
		 result.push('\n');

		}
		 
		var dataString = result.join('');
		outfile.write(dataString);
		 
		Titanium.API.info("drinkdata.tsv created: " + String(new Date( outfile.createTimestamp())));
	};
	
}());
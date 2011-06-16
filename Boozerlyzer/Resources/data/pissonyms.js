/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing drunk settings
 * to and from the database tables Pissonyms and  DrunkenessReports
 */

// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function(){
	
	//create an object which will be our public API
	Ti.App.boozerlyzer.data.pissonyms = {};
	
	//maintain a database connection we can use
	var conn = Titanium.Database.install('ybob.db','ybob');

	//get data for the maximum row id 
	Ti.App.boozerlyzer.data.pissonyms.selectNRandomRows = function (numRows, frequencyRange){
		var returnData = [];
		var nRows = parseInt(numRows);
		//TODO Filter by frequency range
		var rows = conn.execute('SELECT * FROM pissonyms ORDER BY RANDOM() LIMIT ?', nRows);
		if (rows !== null ) {
			while(rows.isValidRow()){
				returnData.push({
					ID: parseInt(rows.fieldByName('ID')),
					Pissonym: rows.fieldByName('Pissonym'),
					DrunkFactor:parseFloat(rows.fieldByName('DrunkFactor')),
					DrunkListID: parseInt(rows.fieldByName('DrunkListID')),
					Frequency: parseFloat(rows.fieldByName('Frequency'))
				});
				rows.next();
			};
			rows.close();
			return returnData;
		}
		//something didn't work
		return false;
	};
	
	Ti.App.boozerlyzer.data.pissonyms.getWordInfo = function (word){
		var returnData = [];
		//TODO Filter by frequency range
		var rows = conn.execute('SELECT * FROM pissonyms WHERE Pissonym = ?', word);
		if (rows !== null ) {
			while(rows.isValidRow()){
				returnData.push({
					ID: parseInt(rows.fieldByName('ID')),
					Pissonym: rows.fieldByName('Pissonym'),
					DrunkFactor:parseFloat(rows.fieldByName('DrunkFactor')),
					DrunkListID: parseInt(rows.fieldByName('DrunkListID')),
					Frequency: parseFloat(rows.fieldByName('Frequency'))
				});
				rows.next();
			};
			rows.close();
			return returnData;
		}
		//something didn't work
		return false;
	};

	/**
	 * Participant has chosen a pissonym - record their choice
	 * @param {Object} choiceData
	 */
	Ti.App.boozerlyzer.data.pissonyms.Chosen = function (choiceData){
		Titanium.API.debug('chosen Pissonym ' + JSON.stringify(choiceData));
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		for (var i=0; i<choiceData.length; i++){
			var insertstr = 'INSERT INTO WordChoices (SessionID,WordType,chosenWord,WordList,ChoiceStart,ChoiceFinish,) VALUES(?,?,?,?,?,?)';
			conn.execute(insertstr,sessionID, 'Pissonym',choiceData[i].ChosenWord, choiceData[i].WordList, choiceData[i].StartTime,choiceData[i].EndTime);
			Titanium.API.debug('Emotional Word choices, rowsAffected = ' + conn.rowsAffected);
			Titanium.API.debug('Emotional Word choices, lastInsertRowId = ' + conn.lastInsertRowId);	
		}
	};
	
	Ti.App.boozerlyzer.data.pissonyms.PlayCount = function (){
		var selectStr = 'SELECT COUNT(*) from WORDCHOICES  where WordType = ?';
		var rows = conn.execute(selectStr, 'Pissonym');
		if (rows !== null) {
			var retval = parseInt(rows.field(0))
			rows.close();
			return retval;
		}else{
			return 0;
		}
	};
	Ti.App.boozerlyzer.data.pissonyms.LastPlayed = function(){
		var selectStr = 'SELECT max(ChoiceFinish) from WORDCHOICES  where WordType = ?';
		var rows = conn.execute(selectStr, 'Pissonym');
		if (rows !== null) {
			var retval = parseInt(rows.field(0))
			rows.close();
			return retval;
		}else{
			return 0;
		}
	}

	/** 
	 * Participant has suggested new pissonym. Let's add it to the list
	 */
//	Ti.App.boozerlyzer.data.pissonyms.addUserPissonym = function (pissonym){
//		Titanium.API.debug('addUserPissonym');
//		
//		//first check that suggestion is actually new.
//		var rows = conn.execute('SELECT COUNT(*) From pissonymns where pissonym = ?', pissonym)
//		if (rows !== null){
//			select 
//			var insertstr = 'INSERT INTO TripReports (ReportStarted,ReportChanged,SessionID,Content)';
//			insertstr += 'VALUES(?,?,?,?)';
//			conn.execute(insertstr,newData.ReportStarted,newData.ReportChanged,newData.SessionID,newData.Content);
//			Titanium.API.debug('TripReports updated, rowsAffected = ' + conn.rowsAffected);
//			Titanium.API.debug('TripReports, lastInsertRowId = ' + conn.lastInsertRowId);
//		}
//		//also an entry to the tripreport table about this 
//	};
	
}());

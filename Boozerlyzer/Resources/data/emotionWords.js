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
	Ti.App.boozerlyzer.data.emotionWords = {};
		
	//maintain a database connection we can use
 	var conn = Titanium.Database.install('../ybob.db','ybob');
 
	//get data for the maximum row id 
	Ti.App.boozerlyzer.data.emotionWords.selectNRandomRows = function (numRows, frequencyRange){
		var returnData = [];
		var nRows = parseInt(numRows);
		//TODO Filter by frequency range
		var rows = conn.execute('SELECT * FROM EmotionalWordLists ORDER BY RANDOM() LIMIT ?', nRows);
		return fillDataObject(rows);
	};
	
		/***
	 * copy data from recordset into our own datastructure
	 */
	function fillDataObject(rows){
		if ((rows !== null) && (rows.isValidRow())) {
			var returnData = [];
			while(rows.isValidRow()){
				returnData.push({
					ID: parseInt(rows.fieldByName('WordID')),
					EmotionalWord: rows.fieldByName('Word'),
					ValenceMean:parseFloat(rows.fieldByName('ValenceMean')),
					ValenceSD:parseFloat(rows.fieldByName('ValenceSD')),
					ArousalMean:parseFloat(rows.fieldByName('ArousalMean')),
					ArousalSD:parseFloat(rows.fieldByName('ArousalSD')),
					DominanceMean:parseFloat(rows.fieldByName('DominanceMean')),
					DominanceSD:parseFloat(rows.fieldByName('DominanceSD')),
					Weight:parseFloat(rows.fieldByName('Weight')),
					Frequency: parseFloat(rows.fieldByName('Frequency')),
					Category: parseFloat(rows.fieldByName('Category'))
				});
				rows.next();
			};
			rows.close();
			return returnData;	
		}
		//something didn't work
		return false;
	};
	
	Ti.App.boozerlyzer.data.emotionWords.getWordInfo = function (word){
		Ti.API.debug('emotionWords getWordInfo for ' + word);
		var returnData = [];
		//TODO Filter by frequency range
		var rows = conn.execute('SELECT * FROM EmotionalWordLists WHERE Word = ?', word);
		return fillDataObject(rows);
	};

	/**
	 * Participant has chosen a pissonym - record their choice
	 * @param {Object} choiceData
	 */
	Ti.App.boozerlyzer.data.emotionWords.Chosen = function (choiceData){
		Titanium.API.debug('chosen emotionWords ' + JSON.stringify(choiceData));
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		for (var i=0; i<choiceData.length; i++){
			var insertstr = 'INSERT INTO WordChoices (SessionID,WordType,chosenWord,WordList,ChoiceStart,ChoiceFinish,) VALUES(?,?,?,?,?,?)';
			conn.execute(insertstr,sessionID, 'EmotionalWords',choiceData[i].ChosenWord, choiceData[i].WordList, choiceData[i].StartTime,choiceData[i].EndTime);
			Titanium.API.debug('Emotional Word choices, rowsAffected = ' + conn.rowsAffected);
			Titanium.API.debug('Emotional Word choices, lastInsertRowId = ' + conn.lastInsertRowId);	
		}	
	};

	Ti.App.boozerlyzer.data.emotionWords.PlayCount = function (){
		var selectStr = 'SELECT COUNT(*) from WORDCHOICES  where WordType = ?';
		var rows = conn.execute(selectStr, 'EmotionalWords');
		if (rows !== null) {
			var retval = parseInt(rows.field(0))
			rows.close();
			return retval;
		}else{
			return 0;
		}
	};
	Ti.App.boozerlyzer.data.emotionWords.LastPlayed = function(){
		var selectStr = 'SELECT max(ChoiceFinish) from WORDCHOICES  where WordType = ?';
		var rows = conn.execute(selectStr, 'EmotionalWords');
		if (rows !== null) {
			var retval = parseInt(rows.field(0))
			rows.close();
			return retval;
		}else{
			return 0;
		}
	}
}());

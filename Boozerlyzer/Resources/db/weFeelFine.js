/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing weFeelFine choices.
 * This ia a long list of feelings taken from the WefeelFine.org
 * project website. 
 */

	//maintain a database connection we can use
	var conn	
	if (!conn){
		conn = Titanium.Database.install('/ybob.db','ybob');
	}

	//get data for the maximum row id 
	exports.selectNRandomRows = function (numRows, frequencyRange){
		var returnData = [];
		var nRows = parseInt(numRows);
		//TODO Filter by frequency range
		var rows =conn.execute('SELECT * FROM WeFeelFineList ORDER BY RANDOM() LIMIT ?', nRows);
		if (rows !== null ) {
			while(rows.isValidRow()){
				returnData.push({
					Feeling: rows.fieldByName('Feeling'),
					Frequency: parseFloat(rows.fieldByName('Frequency')),
					ColorCode:rows.fieldByName('ColorCode')
				});
				rows.next();
			};
			rows.close();
			return returnData;
		}
		//something didn't work
		return false;
	};
	
	exports.getWordInfo = function (word){
		var returnData = [];
		//TODO Filter by frequency range
		var rows =conn.execute('SELECT * FROM weFeelFineLists WHERE Feeling = ?', word);
		if (rows !== null ) {
			while(rows.isValidRow()){
				returnData.push({
					Feeling: rows.fieldByName('Word'),
					Frequency: parseFloat(rows.fieldByName('Frequency')),
					ColorCode:rows.fieldByName('ColorCode')
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
	exports.Chosen = function (choiceData){
		Titanium.API.debug('chosen weFeelFine word ' + JSON.stringify(choiceData));
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		for (var i=0; i<choiceData.length; i++){
			var insertstr = 'INSERT INTO WordChoices (SessionID,WordType,chosenWord,WordList,ChoiceStart,ChoiceFinish) VALUES(?,?,?,?,?,?)';
			conn.execute(insertstr,sessionID, 'WeFeelFine',choiceData[i].ChosenWord, choiceData[i].WordList, choiceData[i].StartTime,choiceData[i].EndTime);
			Titanium.API.debug('Emotional Word choices, rowsAffected = ' +conn.rowsAffected);
			Titanium.API.debug('Emotional Word choices, lastInsertRowId = ' +conn.lastInsertRowId);	
		}	
	};	
	
	exports.PlayCount = function (){
		var selectStr = 'SELECT COUNT(*) from WORDCHOICES  where WordType = ?';
		var rows =conn.execute(selectStr, 'WeFeelFine');
		if (rows !== null) {
			return rows.field(0);
		}else{
			return 0;
		}
	};
	
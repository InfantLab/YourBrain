/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing happiness & drunkeness
 * to and from the database table SelfAssessment 
 */

// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
var selfAssessment = (function(){
	
	//create an object which will be our public API
	var api = {};
	
	//maintain a database connection we can use
	var conn = Titanium.Database.open('ybob');
  
	//get data for the maximum row id 
	api.getLatestData = function (sessionID){
		var mostRecentData = [];
		//have to do count first because max on empty set behaves badly
		//and a cast cos sessionID sometimes treated as string
		var sessID = parseInt(sessionID);
		Titanium.API.trace('selfAssessment sessID:' + sessID );
		var rows = conn.execute('SELECT count(*) FROM SelfAssessment WHERE SESSIONID = ?', sessID);
		Titanium.API.trace('selfAssessment count executed');
		if (rows !== null && rows.isValidRow() && parseInt(rows.field(0)) > 0 ){		
			Titanium.API.trace('selfAssessment count > 0');
			rows.close();
			rows = conn.execute('SELECT max(ID) FROM SelfAssessment WHERE SESSIONID = ?', sessID);
			Ti.API.trace('selfAssessment max exectue');
			if (rows !== null && rows.isValidRow()) {
				Ti.API.trace('selfAssessment maxid pre' );
				var maxid = parseInt(rows.field(0));
				Ti.API.trace('selfAssessment maxid - ' + maxid);
				rows.close();
				rows = conn.execute('SELECT * FROM SelfAssessment WHERE ID = ?', maxid);
				if ((rows !== null) && (rows.isValidRow())) {
					mostRecentData.push({
						Changed: false,
						SesssionID: sessionID,
						DrunkBlur: parseFloat(rows.fieldByName('DrunkBlur')),
						Drunkeness: parseInt(rows.fieldByName('Drunkeness')),
						Energy: parseInt(rows.fieldByName('Energy')),
						EnergyBlur: parseFloat(rows.fieldByName('EnergyBlur')),
						Happiness: parseInt(rows.fieldByName('Happiness')),
						HappyBlur: parseInt(rows.fieldByName('HappyBlur')),
						SelfAssessmentStart: parseInt(rows.fieldByName('SelfAssessmentStart')),
						SelfAssessmentChanged: parseInt(rows.fieldByName('SelfAssessmentChanged'))
					});
					rows.close();
					return mostRecentData;
				}
			}
		}
		//something didn't work
		return false;
	};
	
	api.newEmotion = function (insertFlag){
		var result = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID', 0);
		var now = parseInt((new Date()).getTime()/1000);
		if (insertFlag){ //then we also insert this blank row into database
			var insertstr = 'INSERT INTO SelfAssessment (SessionID, DrunkBlur,Drunkeness,Energy,EnergyBlur,Happiness,HappyBlur,SelfAssessmentStart,SelfAssessmentChanged)';
			insertstr += 'VALUES(?,?,?,?,?,?,?,?,?)';
			conn.execute(insertstr,sessionID,0,0,50,0,50,0,now,now);
			Titanium.API.debug('SelfAssessment NEW, rowsAffected = ' + conn.rowsAffected);
			Titanium.API.debug('SelfAssessment, lastInsertRowId = ' + conn.lastInsertRowId);
		}
		result.push({
			Changed: false,
			SesssionID:sessionID,
			DrunkBlur: 0,
			Drunkeness: 0,
			Energy: 50,
			EnergyBlur: 0,
			Happiness: 50,
			HappyBlur: 0,
			SelfAssessmentStart: now,
			SelfAssessmentChanged: now
		});
		return result;
	};
	
	api.setData = function (newData){
		Titanium.API.debug('selfAssessment setData');		
		if (newData[0].Changed){
			var insertstr = 'INSERT INTO SelfAssessment (SessionID, DrunkBlur,Drunkeness,Energy,EnergyBlur,Happiness,HappyBlur,SelfAssessmentStart,SelfAssessmentChanged)';
			insertstr += 'VALUES(?,?,?,?,?,?,?,?,?)';
			conn.execute(insertstr,newData[0].SessionID,newData[0].DrunkBlur,newData[0].Drunkeness,newData[0].Energy,newData[0].EnergyBlur,newData[0].Happiness,newData[0].HappyBlur,newData[0].SelfAssessmentStart,newData[0].SelfAssessmentChanged);
			Titanium.API.debug('selfAssessment updated, rowsAffected = ' + conn.rowsAffected);
			Titanium.API.debug('selfAssessment, lastInsertRowId = ' + conn.lastInsertRowId);
			Titanium.API.debug('selfAssessment, lastInsertRowId = ' + newData.SessionID);
		}
	};
	
	//get all data for this Session ID 
	api.getAllSessionData = function (sessionID){
		var mostRecentData = [];
		//cast cos sessionID sometimes treated as string
		var sessID = parseInt(sessionID);
		var rows = conn.execute('SELECT * FROM SelfAssessment WHERE SESSION ID = ? ORDER BY SelfAssessmentStart ASC', sessID);
		if ((rows !== null) && (rows.isValidRow())) {
			var maxid = parseInt(rows.field(0));
			rows.close();
			rows = conn.execute('SELECT * FROM PERSONALINFO WHERE ID = ' + maxid);
			if ((rows !== null) && (rows.isValidRow())) {
				while(row.isValidRow()){
					mostRecentData.push({
						SesssionID:sessionID,
						DrunkBlur: parseFloat(rows.fieldByName('DrunkBlur')),
						Drunkeness: parseInt(rows.fieldByName('Drunkeness')),
						Energy: parseInt(rows.fieldByName('Energy')),
						EnergyBlur: parseFloat(rows.fieldByName('EnergyBlur')),
						Happiness: parseInt(rows.fieldByName('Happiness')),
						HappyBlur: parseInt(rows.fieldByName('HappyBlur')),
						SelfAssessmentStart: parseInt(rows.fieldByName('SelfAssessmentStart')),
						SelfAssessmentChanged: parseInt(rows.fieldByName('SelfAssessmentChanged'))
					});
					row.next();				
				}
				rows.close();
				return mostRecentData;
			}
		}
		//something didn't work
		return false;
	};	

	return api;
}());

/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing doseage settings
 * to and from the database table DoseageLog 
 */

function numUnits(drinkData){
	var unitsPerEvent = []
	for(var event = 0; event<drinkData.length;event++){
		unitsPerEvent.push(drinkData[event].HalfPints + drinkData[event].SingleSpirits + drinkData[event].SmallWine);
	}
	return unitsPerEvent;
}

// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
var doseageLog = (function(){
	
	//create an object which will be our public API
	var api = {};
	
	//maintain a database connection we can use
	var conn = Titanium.Database.open('ybob');
  
	//get data for the maximum row id 
	api.getLatestData = function (){
		var mostRecentData = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		//have to do count first because max on empty set behaves badly
		var rows = conn.execute('SELECT count(*) FROM DoseageLog WHERE SESSIONID = ?', sessionID);
		if (rows !== null && rows.isValidRow() && rows.field(0) > 0 ){		
		 	rows.close();
			rows = conn.execute('SELECT max(ID) FROM DoseageLog WHERE SESSIONID = ?', sessionID);
			if (rows !== null && (rows.isValidRow())) {
				var maxid = pasrseInt(rows.field(0));
				rows.close();
				rows = conn.execute('SELECT * FROM DoseageLog WHERE ID = ?', maxid);
				if ((rows !== null) && (rows.isValidRow())) {
					mostRecentData.push({
						Changed: false,
						DoseageStart: parseInt(rows.fieldByName('DoseageStart')),
						DoseageChanged: parseInt(rows.fieldByName('DoseageChanged')),
						ExitCode: rows.fieldByName('ExitCode'),
						SessionID: parseInt(rows.fieldByName('SessionID')),
						HalfPints: parseInt(rows.fieldByName('HalfPints')),
						SingleSpirits: parseInt(rows.fieldByName('SingleSpirits')),
						SmallWine: parseInt(rows.fieldByName('SmallWine'))
					});
					rows.close();
					return mostRecentData;
				}
			}
		}
		//something didn't work
		return false;
	};
	
	api.setData = function (newData){
		Titanium.API.debug('doseagelog setData');
		
		if (newData.Changed){
			var insertstr = 'INSERT INTO DOSEAGELOG (DoseageStart,DoseageChanged,ExitCode,SessionID,HalfPints,SingleSpirits,SmallWine)';
			insertstr += 'VALUES(?,?,?,?,?,?,?)';
			conn.execute(insertstr,newData.DoseageStart,newData.DoseageChanged,newData.ExitCode,newData.SessionID,newData.HalfPints,newData.SingleSpirits,newData.SmallWine);
			Titanium.API.debug('DoseageLog updated, rowsAffected = ' + conn.rowsAffected);
			Titanium.API.debug('DoseageLog, lastInsertRowId = ' + conn.lastInsertRowId);
		}
	};
	
	api.newDoseage = function (){
		var result = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		var insertstr = 'INSERT INTO DOSEAGELOG (DoseageStart,DoseageChanged,ExitCode,SessionID,HalfPints,SingleSpirits,SmallWine)';
		insertstr += 'VALUES(?,?,?,?,?,?,?)';
		var now = parseInt((new Date()).getTime()/1000);
		conn.execute(insertstr,now,now,'',sessionID,0,0,0);
		Titanium.API.debug('DoseageLog updated, rowsAffected = ' + conn.rowsAffected);
		Titanium.API.debug('DoseageLog, lastInsertRowId = ' + conn.lastInsertRowId);
		result.push({
			Changed: false,
			DoseageStart: now,
			DoseageChanged: now,
			ExitCode: '',
			SessionID: sessionID,
			HalfPints: 0,
			SingleSpirits:0,
			SmallWine: 0
		});
		return result;
	};
		
	//get all data for this Session ID 
	api.getAllSessionData = function (sessionID){
		var mostRecentData = [];
		var rows = conn.execute('SELECT * FROM DoseageLog WHERE SESSIONID = ? ORDER BY DoseageChanged ASC', sessionID);
		if ((rows !== null) && (rows.isValidRow())) {
			while(rows.isValidRow()){
				mostRecentData.push({
					DoseageStart: parseInt(rows.fieldByName('DoseageStart')),
					DoseageChanged: parseInt(rows.fieldByName('DoseageChanged')),
					ExitCode: rows.fieldByName('ExitCode'),
					SessionID: parseInt(rows.fieldByName('SessionID')),
					SessionStart: parseInt(rows.fieldByName('SessionStart')),
					HalfPints: parseInt(rows.fieldByName('HalfPints')),
					SingleSpirits: parseInt(rows.fieldByName('SingleSpirits')),
					SmallWine: parseInt(rows.fieldByName('SmallWine'))
				});
				rows.next();				
			}
			rows.close();
			return mostRecentData;
		}
		//something didn't work
		return false;
	};
	
	//get simplified 2d array of time & units
	api.getDataArray_TimeUnits = function(sessionID){
		
		var rawData  = api.getAllSessionData(sessionID);
		var dataArray = [];
		
		for (var i = 0; i < rawData.length; i++) {
			var units = rawData[i].HalfPints + rawData[i].SmallWine + rawData[i].SingleSpirits;
			dataArray.push([rawData[i].DoseageChanged, units]);
		}
		return dataArray;
	}	
	return api;
}());

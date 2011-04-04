/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing doseage settings
 * to and from the database table TripReports
 */


// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
var tripReports = (function(){
	
	//create an object which will be our public API
	var api = {};
	
	//maintain a database connection we can use
	var conn = Titanium.Database.open('ybob');
  
	//get data for the maximum row id 
	api.getLatestData = function (){
		var mostRecentData = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID',1);
		//have to do count first because max on empty set seems to behave badly
		var rows = conn.execute('SELECT count(*) FROM TripReports WHERE SESSIONID = ?', sessionID);
		if (rows !== null && rows.isValidRow() && rows.field(0) > 0 ){		
			var rows = conn.execute('SELECT max(ID) FROM TripReports WHERE SESSIONID = ?', sessionID);
			if (rows !== null && (rows.isValidRow())) {
				var maxid = rows.field(0);
				rows = conn.execute('SELECT * FROM TripReports WHERE ID = ?', maxid);
				if ((rows !== null) && (rows.isValidRow())) {
					mostRecentData.push({
						Changed: false,
						ReportStarted: rows.fieldByName('ReportStarted'),
						ReportChanged: rows.fieldByName('ReportChanged'),
						SessionID: parseInt(rows.fieldByName('SessionID')),
						Content: rows.fieldByName('Content')
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
		Titanium.API.debug('TripReports setData');
		
		for (var i = 0; i< newData.length; i++){
			if (newData[i].Changed){
				var insertstr = 'INSERT INTO TripReports (ReportStarted,ReportChanged,SessionID,Content)';
				insertstr += 'VALUES(?,?,?,?)';
				conn.execute(insertstr,newData[i].ReportStarted,newData[i].ReportChanged,newData[i].SessionID,newData[i].Content);
				Titanium.API.debug('TripReports updated, rowsAffected = ' + conn.rowsAffected);
				Titanium.API.debug('TripReports, lastInsertRowId = ' + conn.lastInsertRowId);
			}
			
		}
	};
	
	api.newReport = function (){
		var result = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		var insertstr = 'INSERT INTO TripReports (ReportStarted,ReportChanged,SessionID,Content)';
		insertstr += 'VALUES(?,?,?,?)';
		var now = parseInt((new Date()).getTime()/1000);
		conn.execute(insertstr,now,now,'',sessionID,0,0,0);
		Titanium.API.debug('TripReports updated, rowsAffected = ' + conn.rowsAffected);
		Titanium.API.debug('TripReports, lastInsertRowId = ' + conn.lastInsertRowId);
		result.push({
			Changed: false,
			ReportStarted: now,
			ReportChanged: now,
			SessionID: sessionID,
			Content: ''
		});
		return result;
	};
		
	//get all data for this Session ID 
	api.getAllSessionData = function (sessionID){
		var mostRecentData = [];
		var sessID = parseInt(sessionID);
		var rows = conn.execute('SELECT * FROM TripReports WHERE SESSIONID = ? ORDER BY DoseageStart ASC', sessionID);
		if ((rows !== null) && (rows.isValidRow())) {
			while(rows.isValidRow()){
				mostRecentData.push({
					Changed: false,
					ReportStarted: rows.fieldByName('ReportStarted'),
					ReportChanged: rows.fieldByName('ReportChanged'),
					SessionID: parseInt(rows.fieldByName('SessionID')),
					Content: rows.fieldByName('Content')
				});
				rows.next();				
			}
			rows.close();
			return mostRecentData;
		}
		//something didn't work
		return false;
	};
	
	api.PlayCount = function (){
		var selectStr = 'SELECT COUNT(*) from TripReports';
		var rows = conn.execute(selectStr);
		if (rows !== null) {
			return rows.field(0);
		}else{
			return 0;
		}
	};
	
	return api;
}());

/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing doseage settings
 * to and from the database table TripReports
 */


// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function(){
	
	//create an object which will be our public API
	Ti.App.boozerlyzer.db.tripReports = {};
	
	//maintain a database connection we can use
  	var conn = Titanium.Database.install('ybob.db','ybob');

	//get data for the maximum row id 
	Ti.App.boozerlyzer.db.tripReports.getLatestData = function (){
		var mostRecentData = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID',1);
		//have to do count first because max on empty set seems to behave badly
		var rows = conn.execute('SELECT count(*) FROM TripReports WHERE SESSIONID = ?', sessionID);
		if (rows !== null && rows.isValidRow() && rows.field(0) > 0 ){		
			rows.close();
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
		rows.close();
		return false;
	};
	
	Ti.App.boozerlyzer.db.tripReports.setData = function (newData){
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
	
	Ti.App.boozerlyzer.db.tripReports.newReport = function (){
		var result = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		var insertstr = 'INSERT INTO TripReports (ReportStarted,ReportChanged,SessionID,Content)';
		insertstr += 'VALUES(?,?,?,?)';
		var now = parseInt((new Date()).getTime()/1000);
		conn.execute(insertstr,now,now,sessionID,'');
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
	Ti.App.boozerlyzer.db.tripReports.getAllSessionData = function (sessionID){
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
		rows.close();
		return false;
	};
	
	Ti.App.boozerlyzer.db.tripReports.PlayCount = function (){
		var selectStr = 'SELECT COUNT(*) from TripReports';
		var rows = conn.execute(selectStr);
		if (rows !== null) {
			var count = rows.field(0);
			rows.close();
			return count;
		}else{
			return 0;
		}
	};
	
}());

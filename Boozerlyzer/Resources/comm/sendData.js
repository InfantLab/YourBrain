/**
 * @author Caspar Addyman
 * 
 * functions for exporting gameScores to a csv file on the phone.  
 */

(function(){

	//Note we need to use an alias of comm variable (for some reason that i don't fully understand)
	var commAlias = Ti.App.boozerlyzer.comm;
	commAlias.sendData = {};

/*
 queries the database and returns a JSON object that looks something like this:
 {
   [
     { data_type: 'GameScore', data: { RowID: 3, Game: 1,
GameVersion: 1, PlayStart: 39594855, MemoryScore: 76, ReactionScore:
45, .... other columns of the data ... } },
     { data_type: 'GameScore', data: { RowID: 7, Game: 1,
GameVersion: 1, PlayStart: 39603589, MemoryScore: 80, ReactionScore:
42, ...............................................} },
     { data_type: 'GameScore', data: { RowID: 8, Game: 2,
GameVersion: 1, PlayStart: 39653985, MemoryScore: -1, ReactionScore:
50, ................................................} },
   ]
 }*/

	/*
	 * function to send the gameScores  table entries to the ybodnet web database
	 */
	commAlias.sendData.sync = function(){
		//find the ID of the last data sent to website
		//based on a persistent app property
		//TODO retrieve this from server.
		var lastSentID = Titanium.App.Properties.getInt('LastSentID', 0);
		alert('Got lastSentID ' + lastSentID);
		
		Ti.API.debug('sendData - lastSentID ' + lastSentID);
		// build an object containing the data that we should send
		var dataToSend = Ti.App.boozerlyzer.db.gameScores.GamePlaySummaryforWebserver(null,null,lastSentID);
		
		
		//what is the last row id from this dataset?
		if (!dataToSend || dataToSend.length===0) {
			Ti.API.error('sendData: no data to send; play some games first!');
			return;
		}
		
		//var newLastID = dataToSend[dataToSend.length -1].ID;

        var xhrPost = Ti.Network.createHTTPClient();
        
        //Ti.API.debug('About to send data for ' + dataToSend);
        //Ti.API.debug(dataToSend);


		//what do we get back?
		xhrPost.onload = function() {
		  alert ('data sending onload');
				var rc = Titanium.JSON.parse(this.responseText);
				if (rc.status == 'success') {
					var complete = Ti.UI.createAlertDialog('Game scores saved.');
					complete.show();
					Ti.API.info('Game scores saved.');
					alert(rc.SavedCount.toString() + ' Game Scores saved - last ID was ' + rc.LastReceivedID.toString());
					Titanium.App.Properties.setInt('LastSentID', rc.LastReceivedID/*newLastID*/);
				} else {
					alert('Cloud Error: try again (' + this.responseText + ')');
				}
			};
		xhrPost.onerror = function(e) {
			Ti.API.error('got error ' + e.error);
		}
		

        alert('About to send data');
		// send the data to the server
		xhrPost.open('POST', 'http://boozerlyzer.net/receive/submit_data.php');
		xhrPost.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		//xhrPost.setRequestHeader('Content-type','application/json');
		//xhrPost.setRequestHeader('Accept','application/json');
		Ti.API.debug('about to send data for ' + dataToSend.length + ' items');
		xhrPost.send(
		 /*JSON.stringify(*/{
		   UUID: commAlias.ybodnet.getUUID(),  // our user ID, username, email etc - unique identifier of the submitter
		   AuthToken: commAlias.ybodnet.getAuthToken(), // some kind of magic key that the client-server has previously negotiated to determine authenticity
		   ClientVersion: commAlias.ybodnet.getClientVersion(), // software version of the client
		   ProtocolVersion: commAlias.ybodnet.getProtocolVersion(), // protocol version to use
		   //data: dataToSend.to_json(),
		   data: Titanium.JSON.stringify(dataToSend)
		 }//)
		);
		Ti.API.debug( dataToSend.length + ' items sent.');
		
	};

	commAlias.sendData.getLastServerRowID = function(){
		
		var xhrPost = Ti.Network.createHTTPClient();
	
		xhrPost.open('POST', 'http://boozerlyzer.net/receive/req_GameScoresLastID.php');
		xhrPost.setRequestHeader('Content-type','application/json');
		xhrPost.setRequestHeader('Accept','application/json');
		
		//what do we get back?
		xhrPost.onload = function() {
				var rc = Titanium.JSON.parse(this.responseText);
				if (rc['status'] == 'success') {
					newLastID = rc['Last'];
					alert('Got last ID ' + newLastID);
					Titanium.App.Properties.setInt('LastSentID', newLastID);
				} else {
					alert('Network Error: try again (' + this.responseText + ')');
				}
			};
			
		xhrPost.send(
	     JSON.stringify(
		 {
		   UUID: commAlias.ybodnet.getUUID(),  // our user ID, username, email etc - unique identifier of the submitter
		   AuthToken: commAlias.ybodnet.getAuthToken(), // some kind of magic key that the client-server has previously negotiated to determine authenticity
		   ClientVersion: commAlias.ybodnet.getClientVersion(), // software version of the client
		   ProtocolVersion: commAlias.ybodnet.getProtocolVersion() // protocol version to use
		 }
		 )
		);
		

	};
	
	
}());

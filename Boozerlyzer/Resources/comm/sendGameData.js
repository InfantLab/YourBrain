/**
 * @author Caspar Addyman
 * 
 * functions for sending gameScores to the website 
 */

(function(){

	Ti.App.boozerlyzer.comm.sendGameData = {};

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
	Ti.App.boozerlyzer.comm.sendGameData.sync = function(){
		//find the ID of the last data sent to website
		//based on a persistent app property
		//TODO retrieve this from server.
		var lastSentID = Titanium.App.Properties.getInt('LastSentID', 0);
		
		// build an object containing the data that we should send
		var dataToSend = Ti.App.boozerlyzer.data.gameScores.GamePlaySummary(null,null,lastSentID);
		
		
		//what is the last row id from this dataset?
		if (!dataToSend || dataToSend.length==0) {
			Ti.API.error('sendGameData: no data to send; play some games first!');
			return;
		}
		
		//var newLastID = dataToSend[dataToSend.length -1].ID;

        var xhrPost = Ti.Network.createHTTPClient();
        
        //Ti.API.debug('About to send data for ' + dataToSend);
        //Ti.API.debug(dataToSend);


		//what do we get back?
		xhrPost.onload = function() {
				var rc = Titanium.JSON.parse(this.responseText);
				if (rc['status'] == 'success') {
					alert('Game scores saved.');
					Ti.API.info('Game scores saved.');
					Titanium.App.Properties.setInt('LastSentID', rc['LastReceivedID']/*newLastID*/);
				} else {
					Ti.API.error('Cloud Error: try again (' + this.responseText + ')');
				}
			};
		xhrPost.onerror = function(e) {
			Ti.API.error('got error ' + e.error);
		}
		

		// send the data to the server
		xhrPost.open('POST', 'http://yourbrainondrugs.net/boozerlyzer/submit_data.php');
		xhrPost.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		//xhrPost.setRequestHeader('Content-type','application/json');
		//xhrPost.setRequestHeader('Accept','application/json');
		alert('about to send data for ' + dataToSend.length + ' items');
		xhrPost.send(
		 /*JSON.stringify(*/{
		   User: Ti.App.boozerlyzer.comm.ybodnet.getUserID(),  // our user ID, username, email etc - unique identifier of the submitter
		   AuthToken: Ti.App.boozerlyzer.comm.ybodnet.getAuthToken(), // some kind of magic key that the client-server has previously negotiated to determine authenticity
		   ClientVersion: Ti.App.boozerlyzer.comm.ybodnet.getClientVersion(), // software version of the client
		   ProtocolVersion: Ti.App.boozerlyzer.comm.ybodnet.getProtocolVersion(), // protocol version to use
		   //data: dataToSend.to_json(),
		   data: Titanium.JSON.stringify(dataToSend)
		 }//)
		);
		alert('sent.');
		
	};

	Ti.App.boozerlyzer.comm.sendGameData.getLastServerRowID = function(){
		
		var xhrPost = Ti.Network.createHTTPClient();
	
		xhrPost.open('POST', 'http://yourbrainondrugs.net/boozerlyzer/req_GamesScoresLastID.php');
		xhrPost.setRequestHeader('Content-type','application/json');
		xhrPost.setRequestHeader('Accept','application/json');
		xhrPost.send(
	     JSON.stringify(
		 {
		   User: Ti.App.boozerlyzer.comm.ybodnet.getUserID(),  // our user ID, username, email etc - unique identifier of the submitter
		   AuthToken: Ti.App.boozerlyzer.comm.ybodnet.getAuthToken(), // some kind of magic key that the client-server has previously negotiated to determine authenticity
		   ClientVersion: Ti.App.boozerlyzer.comm.ybodnet.getClientVersion(), // software version of the client
		   ProtocolVersion: Ti.App.boozerlyzer.comm.ybodnet.getProtocolVersion(), // protocol version to use
		 }
		 )
		);
		
		//what do we get back?
		xhrPost.onload = function() {
				var rc = Titanium.JSON.parse(this.responseText);
				if (rc['status'] == 'success') {
					newLastID = rc['Last'];
					alert('Got last ID ' + newLastID);
					Titanium.App.Properties.setInt('LastSentID', newLastID);
				} else {
					alert('Cloud Error: try again (' + this.responseText + ')');
				}
			};
	
	};
	
	
}());
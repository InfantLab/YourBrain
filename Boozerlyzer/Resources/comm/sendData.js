/**
 * @author Caspar Addyman
 * 
 * functions for exporting gameScores to a csv file on the phone.  
 */

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
	 * since data sending is asynchronous we will mostly succeed fail silently
	 * but allow possiblity of callbacks.
	 * */
	exports.sync = function(callbackFn){
		if (!Ti.App.Properties.getBool('Registered', false)){
			return {status:'failed',message:'Please register first'};
		}
		if (!Ti.Network.online){
			return {status:'failed',message:'No internet connection'};
		}
		if(Ti.App.Properties.getInt('NetPrivacy',0)===1){
			return {status:'failed',message:'Net Privacy turned on'};
		}

		
		//find the ID of the last data sent to website
		//based on a persistent app property
		//TODO retrieve this from server.
		var lastSentID = Titanium.App.Properties.getInt('LastSentID', 0);
		Ti.API.debug('sendData - lastSentID ' + lastSentID);
		// build an object containing the data that we should send
		var ybodnet = require('/comm/ybodnet');
		var dbGameScores = require('/db/gameScores');
		var dataToSend = dbGameScores.GamePlaySummaryforWebserver(null,null,lastSentID);
		
		//what is the last row id from this dataset?
		if (!dataToSend || dataToSend.length===0) {
			Ti.API.error('sendData: no data to send; play some games first!');
			return {status:'failed',message:'No data to send; play some games first!'};
		}
		
        var xhrPost = Ti.Network.createHTTPClient();

		//what do we get back?
		xhrPost.onload = function() {
			Ti.API.debug('sync data sending onload');
			var rc = JSON.parse(this.responseText);
			Ti.API.debug(this.responseText);
			if (rc.status == 'success') {
				// var complete = Ti.UI.createAlertDialog('Game scores saved.');
				// complete.show();
				Ti.API.info('Game scores saved.');
				var id  = (rc.LastReceivedID? rc.LastReceivedID.toString(): 0 );
				var retMessage = rc.SavedCount.toString() + ' Game Scores saved - last ID was ' + id;
				Titanium.App.Properties.setInt('LastSentID', id/*newLastID*/);
				var now = parseInt((new Date()).getTime()/1000,10);
				Titanium.App.Properties.setInt('LastSentTime',now);
				if (callbackFn){
					callbackFn( {status:'success',message:retMessage});
				}
			} else {
				Ti.API.debug('Cloud Error: try again (' + this.responseText + ')');
				if (callbackFn){
					callbackFn( {status:'failed',message:'Cloud Error: try again (' + this.responseText + ')'});
				}
			}
		};
		xhrPost.onerror = function(e) {
			Ti.API.error('got error ' + e.error);
		};
		
		// send the data to the server
		xhrPost.open('POST', 'http://boozerlyzer.net/receive/submit_data.php');
		xhrPost.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		//xhrPost.setRequestHeader('Content-type','application/json');
		//xhrPost.setRequestHeader('Accept','application/json');
		Ti.API.debug('about to send data for ' + dataToSend.length + ' items');
		xhrPost.send(
		 /*JSON.stringify(*/{
		   UUID: ybodnet.getUUID(),  // our user ID, username, email etc - unique identifier of the submitter
		   AuthToken: ybodnet.getAuthToken(), // some kind of magic key that the client-server has previously negotiated to determine authenticity
		   ClientVersion: ybodnet.getClientVersion(), // software version of the client
		   ProtocolVersion: ybodnet.getProtocolVersion(), // protocol version to use
		   //data: dataToSend.to_json(),
		   data: JSON.stringify(dataToSend)
		 }//)
		);
		Ti.API.debug( dataToSend.length + ' items sent.');
		return {status:'success',message:'Nothing went wrong at this end.'};
		
	};

	exports.getLastServerRowID = function(callbackFn){
		if (!Ti.Network.online){
			return {status:'failed',message:'No internet connection'};
		}		
		var xhrPost = Ti.Network.createHTTPClient();
		xhrPost.open('POST', 'http://boozerlyzer.net/receive/req_GameScoresLastID.php');
		xhrPost.setRequestHeader('Content-type','application/json');
		xhrPost.setRequestHeader('Accept','application/json');
		
		//what do we get back?
		xhrPost.onload = function() {
				var rc = Titanium.JSON.parse(this.responseText);
				if (rc.status == 'success') {
					var newLastID = rc.Last;
					Ti.API.debug('Got last ID ' + newLastID);
					Titanium.App.Properties.setInt('LastSentID', newLastID);
					Titanium.App.Properties.setString('LastSentTime','#Sent Time#');
				} else {
					Ti.API.debug('Network Error: try again (' + this.responseText + ')');
				}
			};
			
		xhrPost.send(
	     JSON.stringify(
		 {
		   UUID: ybodnet.getUUID(),  // our user ID, username, email etc - unique identifier of the submitter
		   AuthToken: ybodnet.getAuthToken(), // some kind of magic key that the client-server has previously negotiated to determine authenticity
		   ClientVersion: ybodnet.getClientVersion(), // software version of the client
		   ProtocolVersion: ybodnet.getProtocolVersion() // protocol version to use
		 }
		 )
		);
		

	};
	
	/*
	 * a function that gets called every time we return to the main menu
	 * every 20th time it checks if we have an internet connection
	 * and if so attempts to send the most recent data.
	 */
	exports.autoSync = function(){
		if (!Ti.App.Properties.getBool('AutoSync',true)){
			//not autosyncing so return home
			return;
		}
		var count = Ti.App.Properties.getInt('AutoSyncCount', 0);
		count++;
		Ti.API.debug('autoSync count ' + count);
		Ti.App.Properties.setInt('AutoSyncCount', count);
		if (count % 10 === 0 && Ti.Network.online){
			exports.sync();
		}
	};


//
// Set of functions to register this phone/user with
// our website.
// 
//


//
// call remote service to save location
//
A2B.saveCheckIn = function(longitude, latitude, name) {
	var xhr = Ti.Network.createHTTPClient();
	xhr.open("POST","http://localhost/");
	xhr.setRequestHeader('Content-type','application/json');
	xhr.setRequestHeader('Accept','application/json');

	xhr.onload = function() {
		var rc = eval('('+this.responseText+')');
		if (rc['status'] == 'success') {
			alert('Location saved.');
		} else {
			alert('Cloud Error: try again.');
		}
	};
	xhr.send({
		'date':new Date(),
		'name':name,
		'long':longitude,
		'lat':latitude
	});

};

//
// retrieve all check-ins
//
A2B.getCheckIns = function(longitude, latitude, name) {
	var xhr = Ti.Network.createHTTPClient();
	xhr.open("GET","http://localhost/");

	xhr.onload = function() {
		A2B.checkInArray = eval('('+this.responseText+')');
		A2B.updateCheckInTable();
		for (var i=0;i<A2B.checkInArray.length;i++){
			var obj = A2B.checkInArray[i]['check_in'];
			var name = obj['name'].split('***');
			A2B.addPin(obj['long'], obj['lat'], name[0],name[1]);
		}
	};
	xhr.send();

};


//
// A place holder in case we decide to track location. 
//

//
// check-in
//
A2B.checkIn = function(longitude,latitude) {

	// get current location
	Titanium.Geolocation.getCurrentPosition( function(e) {
		if (!e.success) {
			alert('Could not retrieve location');
			return;
		}
		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		A2B.mapview.region = {
			latitude:latitude,
			longitude:longitude,
			latitudeDelta:0.5,
			longitudeDelta:0.5
		};

		// try to get address
		Titanium.Geolocation.reverseGeocoder(latitude,longitude, function(evt) {
			var street;
			var city;
			var country;
			if (evt.success) {
				var places = evt.places;
				if (places && places.length) {
					street = places[0].street;
					city = places[0].city;
					country = places[0].country_code;
				} else {
					address = "No address found";
				}
			}
	
			// update location labels
			A2B.streetLabel.text = street;
			A2B.cityCountryLabel.text = city + ', ' + country;

			var time = A2B.getTime();
			var title = street;
			var subtitle = city + ', ' + country + ' @ ' + time;
		 
			// drop a pin
			A2B.addPin(longitude,latitude, title, subtitle );

			// add to array
			A2B.checkInArray.push({'check_in':{'lat':latitude,'long':longitude,'name':title + '***' + subtitle}}); 
		
			// update our table view that has all checkins
			A2B.updateCheckInTable();
		
			// save check-in
			A2B.saveCheckIn(longitude,latitude, title + '***' + subtitle);
		});
	});


};

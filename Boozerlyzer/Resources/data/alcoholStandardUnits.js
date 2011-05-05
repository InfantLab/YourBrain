/**
 * @author Caspar Addyman
 * 
 * Alcohol Standard Drinks (units in uk) are the sizes of a standard drink in 
 * the various countries of the world. Taken from wikipedia.
 * http://en.wikipedia.org/wiki/Standard_drink
 */


// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function(){
	
	//create an object which will be our public API
	Titanium.App.boozerlyzer.data.alcoholStandardDrinks= {};

	
	//maintain a database connection we can use
  	var conn = Titanium.Database.install('../ybob.db','ybob');
	
		
	//get standard drinks either for a single country
	//or for all of them!
	Titanium.App.boozerlyzer.data.alcoholStandardDrinks.get = function (Country){
		var returnData = [];
		var rows;
		var selectStr = 'SELECT * FROM AlcoholStandardDrinks ';
		if (typeof(Country)=="undefined" || Country === null){
			rows = conn.execute(selectStr);	 
		}else {
			selectStr += 'WHERE Country = ?';
			rows = conn.execute(selectStr, Country);
		}
		if ((rows !== null) && (rows.isValidRow())) {
			while(rows.isValidRow()){
				returnData.push({
					Country: rows.fieldByName('Country'),
					GramsPerUnit: parseFloat(rows.fieldByName('GramsPerUnit')),
					MillilitresPerUnit: parseFloat(rows.fieldByName('MillilitresPerUnit'))
				});
				rows.next();				
			}
			rows.close();
			return returnData;
		}
		//something didn't work
		return false;
	};
	
	
}());

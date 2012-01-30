/***
 * a module to hold global data objects 
 */


//module's copy of the variables 
var _AllDrinks, _PersonalInfo, _StandardDrinks, _CurrentEmotions;

var dbDoseageLog = require('/db/doseageLog');
var dbSelfAssessment = require('/db/selfAssessment');
var dbSessions = require('/db/sessions');
var dbAlcoholStandardUnits = require('/db/alcoholStandardUnits');
	

exports.setAllDrinks = function(inDrinks){
	_AllDrinks = inDrinks;
};
exports.getAllDrinks = function(forceReload){
	
	var sessionID = Titanium.App.Properties.getInt('SessionID');
	if (!_AllDrinks || forceReload){
		Ti.API.debug('dataObject getAllDrinks reloading...');
		_AllDrinks = dbDoseageLog.getAllSessionData(sessionID);
	}
	//if still nothing create new object
	if (!_AllDrinks || _AllDrinks.length === 0){
		exports.setAllDrinks(dbDoseageLog.newDrink());
		dbSessions.Updated(sessionID);
	}
	return _AllDrinks;
};

exports.setPersonalInfo = function(inPersonalInfo){
	_PersonalInfo = inPersonalInfo;
};
exports.getPersonalInfo = function(){
	if (!_PersonalInfo){
		var dbPersonalInfo = require('/db/personalInfo');
		_PersonalInfo =	dbPersonalInfo.getData();
	}
	return _PersonalInfo;
};


exports.getStandardDrinks = function(){
	if (!_StandardDrinks){
		var persinfo = exports.getPersonalInfo();
		_StandardDrinks = dbAlcoholStandardUnits.get(persinfo.Country);
	}
	return _StandardDrinks;
};

exports.setCurrentEmotions = function(inCurrentEmotions){
	_CurrentEmotions = inCurrentEmotions;
};
exports.getCurrentEmotions = function(forceReload){
	var sessionID = Titanium.App.Properties.getInt('SessionID');
	if (!_CurrentEmotions || forceReload){		
		Ti.API.debug('dataObject getCurrentEmotions reloading...');
		_CurrentEmotions = dbSelfAssessment.getLatestData(sessionID);
	}
		//if still nothing create new object
	if (!_CurrentEmotions){
		exports.setCurrentEmotions(dbSelfAssessment.newEmotion(true));
		dbSessions.Updated(sessionID);
	}
	return _CurrentEmotions;
};

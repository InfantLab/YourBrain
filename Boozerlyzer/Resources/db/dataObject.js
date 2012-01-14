/***
 * a module to hold global data objects 
 */


//module's copy of the variables 
var _AllDrinks, _PersonalInfo, _StandardDrinks, _CurrentEmotions;


exports.setAllDrinks = function(inDrinks){
	_AllDrinks = inDrinks;
};
exports.getAllDrinks = function(forceReload){
	if (!_AllDrinks || forceReload){
		var dbDoseageLog = require('/db/doseageLog');
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		_AllDrinks = dbDoseageLog.getAllSessionData(sessionID);
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

exports.setStandardDrinks = function(inStandardDrinks){
	_StandardDrinks = inStandardDrinks;
};
exports.getStandardDrinks = function(){
	if (!_StandardDrinks){
		var persinfo = exports.getPersonalInfo();
		var dbAlcoholStandardUnits = require('/db/alcoholStandardUnits');
		_StandardDrinks = dbAlcoholStandardUnits.get(persinfo.Country);
	}
	return _StandardDrinks;
};

exports.setCurrentEmotions = function(inCurrentEmotions){
	_CurrentEmotions = inCurrentEmotions;
};
exports.getCurrentEmotions = function(forceReload){
	if (!_CurrentEmotions || forceReload){
		var dbSelfAssessment = require('/db/selfAssessment');
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		_CurrentEmotions = dbSelfAssessment.getLatestData(sessionID);
	}
	return _CurrentEmotions;
};
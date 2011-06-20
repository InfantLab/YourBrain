/**
 * @author Caspar Addyman
 * 
 * A set of routines that process data to make it suitable 
 * for analysis.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

//(function() {

Ti.include('/js/bloodalcohol.js');	

	/***
	 * passed an array of timepoints and set of drink data.
	 * returns the cumulative number of drinks between start time 
	 * and given timepoint together with
	 * the blood alcohol level they cause 
	 */	
	function drinksByTime(timePoints,drinkData,personalInfo, millsPerStandardUnits){
		var returnData = [];
		var lenTime = timePoints.length;
		var lenDrinks = drinkData.length;
		Ti.API.debug('drinksByTime lenDrinks' + lenDrinks);
		for (var t=0;t<lenTime;t++){
			var totalUnits = 0;
			var lastDrinkIdx = 0;
			//first select all drinks that occur prior to current time
			for(var d=0;d<lenDrinks;d++){
				if (drinkData[d].DoseageChanged <= timePoints[t] && drinkData[d].DoseageChanged >= timePoints[0]){
					totalUnits += drinkData[d].TotalUnits;
					lastDrinkIdx = d; 
				}
			}
			bac = BACalculate(timePoints[t],drinkData.slice(0,lastDrinkIdx+1),personalInfo);
			returnData.push({
				time:timePoints[t],
				millsAlcohol:totalUnits,
				standardDrinks:totalUnits / millsPerStandardUnits,
				bloodAlcohol:bac
			});
		}
		return returnData;
	}

	/***
	 * passed an array of timepoints and set of emotion data.
	 * returns array of the most recent emotion scores for each timepoint 
	 */	
	function emotionsByTime(timePoints,emotionData){
		var returnData = [];
		var lenTime = timePoints.length;
		var lenEmotions = emotionData.length;
		Ti.API.debug('emotionsByTime lenEmotions' + lenEmotions);
		for (var t=1;t<lenTime;t++){
			var currTime = timePoints[t];
			var totalUnits = 0;
			var latestDataIdx = -1;
			//first select all drinks that occur prior to current time
			for(var d=0;d<lenEmotions;d++){
				if (emotionData[d].SelfAssessmentChanged <= timePoints[t] && emotionData[d].SelfAssessmentChanged >= timePoints[0]){
					latestDataIdx = d; 
				}
			}
			if (latestDataIdx >= 0 ){
				returnData.push({
					time:currTime,
					DrunkBlur: emotionData[latestDataIdx].DrunkBlur,
					Drunkeness: emotionData[latestDataIdx].Drunkeness,
					Energy: emotionData[latestDataIdx].Energy,
					EnergyBlur: emotionData[latestDataIdx].EnergyBlur,
					Happiness: emotionData[latestDataIdx].Happiness,
					HappyBlur: emotionData[latestDataIdx].HappyBlur,
				});
			}else{
				//default values
				returnData.push({
					time:currTime,
					DrunkBlur: 0,
					Drunkeness: 0,
					Energy: 50,
					EnergyBlur: 0,
					Happiness: 50,
					HappyBlur: 0,
				});
			}
		}//end time loop
		return returnData;
	}
//})();
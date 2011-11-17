/**
 * @author Caspar Addyman
 * 
 * A set of routines that process data to make it suitable 
 * for analysis.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

//(function() {

	/***
	 * passed an array of timepoints and set of drink data.
	 * returns the cumulative number of drinks between start time 
	 * and given timepoint together with
	 * the blood alcohol level they cause 
	 */	
	exports.drinksByTime = function (timePoints,drinkData,personalInfo, millsPerStandardUnits){
		var returnData = [];
		//get lengths of arrays if they exist
		var lenTime = (timePoints ? timePoints.length : 0);
		var lenDrinks = (drinkData ? drinkData.length : 0);
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
			var bac = 0;
			if (lenDrinks > 0){
				bac = Boozerlyzer.analysis.BAC.calculate(timePoints[t],drinkData.slice(0,lastDrinkIdx+1),personalInfo);
			} 
			returnData.push({
				time:timePoints[t],
				millsAlcohol:totalUnits,
				standardDrinks:totalUnits / millsPerStandardUnits,
				bloodAlcohol:bac
			});
		}
		return returnData;
	};

	/***
	 * passed an array of timepoints and set of emotion data.
	 * returns array of the most recent emotion scores for each timepoint 
	 */	
	exports.emotionsByTime = function (timePoints,emotionData){
		var returnData = [];
		//get lengths of arrays if they exist
		var lenTime = (timePoints ? timePoints.length : 0);
		var lenEmotions = (emotionData ? emotionData.length : 0);
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
					//replace missing values with nulls
					DrunkBlur: 	(emotionData[latestDataIdx].DrunkBlur<0 ? null :emotionData[latestDataIdx].DrunkBlur)  ,
					Drunkeness: (emotionData[latestDataIdx].Drunkeness<0 ? null :emotionData[latestDataIdx].Drunkeness),
					Energy: 	(emotionData[latestDataIdx].Energy<0 ? null :emotionData[latestDataIdx].Energy),
					EnergyBlur: (emotionData[latestDataIdx].EnergyBlur<0 ? null :emotionData[latestDataIdx].EnergyBlur),
					Happiness: 	(emotionData[latestDataIdx].Happiness<0 ? null :emotionData[latestDataIdx].Happiness),
					HappyBlur:	(emotionData[latestDataIdx].HappyBlur<0 ? null :emotionData[latestDataIdx].HappyBlur)
				});
			}else{
				//default values
				returnData.push({
					time:currTime,
					DrunkBlur: 0,
					Drunkeness: 0,
					Energy: 0,
					EnergyBlur: 0,
					Happiness: 0,
					HappyBlur: 0
				});
			}
		}//end time loop
		return returnData;
	};
//})();
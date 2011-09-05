/**
 * @author Caspar Addyman
 * 
 *  Our blood-alcohol calculation . heavily adapted from this original code
 *  http://celtickane.com/projects/blood-alcohol-content-bac-calculator/
 *  which was based on 
 *  http://www.nhtsa.dot.gov/people/injury/alcohol/bacreport.html
 *  however, we also have height info so we could potentially use a formula using BMI
 *  like these
 *  http://www.highbeam.com/doc/1G1-132050585.html
 */

 (function(){

	Ti.App.boozerlyzer.analysis.BAC = {};
	/**
	 * Blood Alcohol calculation, returns an array of values for each row of doseageData.
	 * If personalInfo is unavailable we use an average default value. 
	 * 
	 * @param {Object} timeStamp 	- what time are we calculating BAC for?
	 * @param {Object} doseageData
	 * @param {Object} personalInfo
	 */
	Ti.App.boozerlyzer.analysis.BAC.calculate = function (timeStamp,doseageData,personalInfo) {
		
		Ti.API.debug('BACCalculate timeStamp -' + timeStamp);
		Ti.API.debug('BACCalculate doseageData -' + JSON.stringify(doseageData));
		Ti.API.debug('BACCalculate personalInfo -' + JSON.stringify(personalInfo));
		
		
		var gotValidData = ValidateDoseageData(doseageData);
		if (gotValidData !== true){
			return {Success:false,Text:gotValidData};	
		}
		var metricInfo = ConvertPersonalInfo(personalInfo);
		//Percentage of body which is water for male(1) or female(0)
		var mPercentWater = (metricInfo.sex === 0 ? 0.49 : 0.58);
		var mMetabolicRateAdjust  = 1.0; //nothing implemented to change rate yet
			
		
		//Pay attention because this gets quite complicated.
		//we want to accumulate the total unprocessed alcohol in the body
		//at timeStamp.. so for each dose we want to discount it at the 
		//standard processing rate assuming that we are not already
		//processing some previous drink. if we are then don't start
		//discounting until previous one is finished.
		//therefore we always need to keep track of three numbers
		//as we loop round
		var startProcessingThis = 0; //start currently processing time
		var endProcessingThis = 0;  //end of currently processing time.
		var remainingAlcohol = 0;   //accumulated unprocessed alcohol
		var mStandardMetabolicRate = 9.5; // mls alcohol processed per hour (source: http://www.rupissed.com/thebody.html) TODO find a better source!)
			
			
		for (var b = 0; b<doseageData.length; b++ ){	
			var thisDose = doseageData[b].TotalUnits;
			if (doseageData[b].DoseageChanged > timeStamp){
				//can skip this drink.. it happens in the future
			}else if (remainingAlcohol === 0) {
				if (endProcessingThis > doseageData[b].DoseageChanged){
					//our body is ready to process more
					startProcessingThis = endProcessingThis;
				}else{
					startProcessingThis = doseageData[b].DoseageChanged;					
				}
				//it will take this long to process it.
				endProcessingThis = startProcessingThis + 3600*(thisDose / mStandardMetabolicRate);
				if (endProcessingThis > timeStamp){
					//what remains from this dose at end?
					remainingAlcohol = Math.max(0, thisDose - (timeStamp - startProcessingThis) * mStandardMetabolicRate /3600);
				}
			}else if (endProcessingThis > timeStamp){
				//all remaining alcohol will be unprocessed by TimeStamp
				remainingAlcohol += thisDose;
			}else{
				//add this dose to the pile				
				 if (endProcessingThis > doseageData[b].DoseageChanged){
					startProcessingThis = endProcessingThis;
				}else{
					startProcessingThis = doseageData[b].DoseageChanged;
				}
				remainingAlcohol += thisDose;
				endProcessingThis = startProcessingThis + 3600*(remainingAlcohol / mStandardMetabolicRate);
				if (endProcessingThis > timeStamp){
					//what remains of pile at end?
					remainingAlcohol = Math.max(0, remainingAlcohol - (timeStamp - startProcessingThis) * mStandardMetabolicRate /3600);
				}
			}
		}
			
			Ti.API.debug('BAC startProcessingThis' + startProcessingThis);
			Ti.API.debug('BAC endProcessingThis ' + endProcessingThis);
			Ti.API.debug('BAC units ' + remainingAlcohol);
			
			var BAC= CalcBAC(metricInfo.weight_kg,mPercentWater,remainingAlcohol);
			Ti.API.debug('BAC out '+ BAC);
			return BAC;
		}
		
	
	/**
	 * Blood Alcohol calculation that takes numerical inputs and gives numerical answer
	 * @param {Object} mBodyWeight
	 * @param {Object} mPercentWater
	 * @param {Object} mMillilitresEtOH
	 */
	function CalcBAC(mBodyWeightKG, mPercentWater, mMillilitresEtOH) {
			
			//Based on calculations done by http://www.nhtsa.dot.gov/people/injury/alcohol/bacreport.html
			// NHTSA (1994): BAC = (A x 0.806)/(W x TBW x 1000) x 100 
			//	 TBW = 0.58 for men, 0.49 for females
			// BAC = blood alcohol concentration in g/dl, 
			// A = total volume (in ml) of drinks consumed multiplied by the percent of alcohol 
			// of the drink multiplied by the density of alcohol (0.79 g/ ml) divided by 10, 
			// W = weight of participant in kg, H = height in meters, y = the age of the participant in years, h = height measured in cm.
		
	
			//I'm following their math by each letter -- if you're confused by a step, check out the website and go to the letter for more information
			var cGramsPerMillilitreEtOH = 0.79; //A constant: 1unit = 10mls  * 0.79 g/ml = 7.9 grams/unit
			//A) Body weight should be in kilos 
			//B) Find total body water
			var mBodyWaterML = mBodyWeightKG * mPercentWater * 1000;	//Men have a higher water content than women
			//D) Find alcohol per mL of water
			var mConcEtOHinWater = cGramsPerMillilitreEtOH * mMillilitresEtOH / mBodyWaterML;
			//E) Find alcohol per mL of blood
			var mConcEtOHinBlood = mConcEtOHinWater * .806; //Blood is 80.6% water
			//F) Convert mConcEtOHinBlood from g/mL to g/100 mL (gram percent)
			var mGramPercentEtOHinBlood = mConcEtOHinBlood * 100;
			//Note: mGramPercentEtOHinBlood is the BAC with instant consumption, absorption, and distribution
			//H) Calculate BAC 
			var mBAC = mGramPercentEtOHinBlood;
			if(mBAC < 0) { mBAC = 0; }
	
			return mBAC;
	}
	
	function ValidateDoseageData(doseageData){
		//TODO check that the doseageData object has the values we expect
		return true;
	}
	
	/***
	 * function to return a text colour and warning message for this level of BAC
	 * @param BAC - passed as a percentage
	 * */
	Ti.App.boozerlyzer.analysis.BAC.levels = function (BAC){
		// http://celtickane.com/projects/blood-alcohol-content-bac-calculator/
		if (BAC < 0.03){
			return {color:'#00FF00', //green
					warning:'Normal behavior, no impairment'};	
		} else if (BAC < 0.06){
			return {color:'	#7FFF00', //chartreuse !?!?
					warning:'Mild euphoria and impairment; decreased inhibitions'};	
		} else if (BAC < 0.1){
			return {color:'#EEEE00', //yellow
					warning:'Buzzed, euphoric, increased impairment'};	
		} else if (BAC < 0.2){
			return {color:'#FFA500', //orange
					warning:'Drunk, emotional swings, slurred speech, nausea, loss of reaction time and motor control'};	
		} else if (BAC < 0.3){
			return {color:'#EE4000',  //orangered 2
					warning:'Confused, nauseated, poor reasoning, blackout'};	
		} else if (BAC < 0.4){
			return {color:'#FF0000', //red
					warning:'Possibly unconscious, unarrousable, loss of bladder function, risk of death'};	
		} else{
			return {color:'#FF0000', //red 
					warning:'Unconscious, coma, impaired breathing, risk of death'};	
		} 
	}
	
	
	function ConvertPersonalInfo(personalInfo, defaultSexFlag){
		try{ //try to convert the values from the personalInfo table into actual height, weight, age
			//initialise with default values
			var retObj = {
					success:false,
					height_m: 1.64,
					sex: 0,
					weight_kg: 66.7,
					age:30
			};
					
			retObj.sex = personalInfo.gender;		
			var approxDOB = new Date(('15/' + personalInfo.BirthMonth + '/' + personalInfo.BirthYear));					
			var now = new Date();
			var ageinms = now - approxDOB;
			retObj.age = (ageinms / 1000 ) / 31557600;
			
			function isNumber(n) {
			  return !isNaN(parseFloat(n)) && isFinite(n);
			}
			if (isNumber(personalInfo.Weight)){
				retObj.weight_kg = personalInfo.Weight;	
			}
			if (isNumber(personalInfo.Height)){
				retObj.weight_m = personalInfo.Height;	
			}
			return retObj;
		} catch (error) {
			//if it goes wrong return some defaults (from wikipedia)
			if (defaultSexFlag === 0) {
				return ({
					success:false,
					height_m: 1.64,
					sex: 0,
					weight_kg: 66.7,
					age:30
				});
			}else{
				return ({
					success:false,
					height_m:1.776,
					sex:1,
					weight_kg:80,
					age:30
				});
			}
		}
	}
}());


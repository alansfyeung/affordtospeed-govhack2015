// Afford to speed?
if ('geolocation' in navigator) {
	console.log('There is geolocation here!!');
} 
else {
	console.warn('There NO is geolocation here!!');

}

// Main controller
var AffordController = function(opts){
	var progressDisplay, resultsDisplay;

	opts = opts || {};
	if (opts.progressScreen){
		progressDisplay = new DisplayPanel(opts.progressScreen);
	}
	if (opts.resultsScreen){
		resultsDisplay = new DisplayPanel(opts.resultsScreen);
	}

	var tracker = new Tracker(progressDisplay);

	// This should be called right after document.ready
	var bindEvents = function(){
		$('.action-start').on('click', function(){
			launch();
		});
		$('.action-finish').on('click', function(){
			displayResults();
		});
		$('.action-reset').on('click', function(){
			$('.content').html('');
		});
	};

	var launch = function(){
		console.log('started tracking on affordtospeed');
		tracker.start();
	};

	// Display results
	var displayResults = function(){
		console.log('started tracking on affordtospeed');
		var elapsed = tracker.stop();
		resultsDisplay.writeLog('Tracked for ' + elapsed + ' mins');
	};

	// Debug results
	var debugResults = function(){


	}

	return {
		bindEvents: bindEvents,
		tracker: tracker
	};

};

var Tracker = function(progressDisplay){
	var geo = navigator.geolocation;

	var trip = new TripData();
	var watchId, intervalId;
	var trackerLastStartTime = 0;

	var coordLog = [];

	var start = function(){
		if (geo){
			trackerLastStartTime = Date.now();

			var positionOptions = {
  				enableHighAccuracy: true
			};

			// #1, set a periodical poll
			var intervalTime = 30000;
			var intervalId = setInterval(function(){
				console.log('polling');
				geo.getCurrentPosition(function(position){
					var coords = {
				  		lat: position.coords.latitude, 
				  		lon: position.coords.longitude,
				  		timestamp: Date.now(),
				  		src: 'poll'
				  	};

				  	console.log('[IntervalPosition] sent position ', coords);
			  		progressDisplay.writeLog('Position '+coords.lat + ',' + coords.lon);

			  		if (checkForMovement(coords)){
			  			var opts = {};
			  			trackToApi(coords, opts, trip.record);	
			  		}

				  	coordLog.push(coords);
					
				}, function(){
					console.warn('Failed to use position');
				});
			}, intervalTime);

			// #2, set a watch
			var watchId = geo.watchPosition(function(position){
				var coords = {
			  		lat: position.coords.latitude, 
			  		lon: position.coords.longitude,
			  		speed: position.coords.speed,
			  		heading: position.coords.heading,
			  		timestamp: Date.now(),
			  		src: 'watch'
			  	};
			  	
			  	console.log('[WatchPosition] sent position ', coords);
			  	progressDisplay.writeLog('Position '+coords.lat + ',' + coords.lon);

			  	if (checkForMovement(coords)){
		  			var opts = {};
		  			trackToApi(coords, opts, trip.record);	
		  		}

		  		coordLog.push(coords);

			}, function(){
				console.warn('Failed to use position');
			}, positionOptions);
		}
		else {
			console.warn('No geo available');
		}
	};

	var stop = function(){
		geo.clearWatch(watchId);
		clearInterval(intervalId);

		trip.saveToBrowser();

		// figure out how long the tracker went for
		var timeTrackedMins = Math.floor((trackerLastStartTime - Date.now()) / 60000);

	  	progressDisplay.writeLog('Time tracked ' + timeTrackedMins);
		return timeTrackedMins;
	};

	var getLastCoords = function(){
		if (coordLog.length > 0){
			var lastRecorded = coordLog[coordLog.length-1];
			return {
				lat: lastRecorded.lat,
				lon: lastRecorded.lon
			};
		}
		return {};
	};

	var checkForMovement = function(currentCoords){
		var lastCoords = getLastCoords();
		var arcSec = 1/3600;		// 1 arcsec is about 30m
		// var moveDistTrigger = arcSec * 6;		// about 200m
		var moveDistTrigger = 0.1;		// about 100m
		if (lastCoords.lat && lastCoords.long){
			if (calculateDistance(currentCoords.lat, currentCoords.lon, lastCoords.lat, lastCoords.lon) > moveDistTrigger){
			  	progressDisplay.writeLog('Moved 10m Position');
				return true;
			}
		}
		return false;
	};

	var trackToApi = function(coords, opts, callback){
		// Send it to the server
		progressDisplay.writeLog('Sending co-ords to server');
		$.get('http://affordtospeed.gh.alanyeung.net/track.php', coords, function(data){
			console.log('tracked data received ', data);
			progressDisplay.writeLog('You\'re passing through ' + data.location.suburb );
			callback(data);
		});
	};

	return {
		start: start,
		stop: stop,
		log: coordLog
	};
		
};


// Storage controller
var TripData = function(){
 	
	this.hasStorage = typeof(Storage) !== "undefined";
	this.timestamp = Date.now();
	this.trip = [];

	var record = function(data){
		var trip = {
			timestamp: Date.now(),
			suburb: data.location.suburb_name,
			data: data
		}
		// ? Check out whether this suburb was already recorded

		this.tripData.push(record);
	};

	var getSaved = function(){
		if (localStorage){
 			if (localStorage.trips){
				return JSON.parse(localStorage.trips);
 			}
 			return true;
 		}
 		console.warn('localStorage not available');
 		return false
	};

 	var saveToBrowser = function(){
 		console.log('Saving to browser');
 		if (localStorage){
 			if (localStorage.trips){
		 		saved = JSON.parse(localStorage.trips);
 			}
 			saved.push(this);
 			localStorage.trips = JSON.stringify(saved);
 		}
 	};

 	var deleteTrip = function(tripIndex){
 		if (localStorage.tripData.length > tripIndex){
 			localStorage.trip[tripIndex].pop();
 		}
 	};

 	return {
 		record: record,
		saveToBrowser: saveToBrowser
 	};

};

var DisplayPanel = function($theScreen){
	var $screen = $theScreen;
	var logCounter = 0;

	if (!$screen){
		console.warn('No screen defined');
	}

	var writeLog = function(message){
		$screen.append('<p>'+(logCounter++)+'. '+message+'</p>');

	};
	return {
		writeLog: writeLog
	};
};

var ScreenDefinitions = {
	

};




// a script provided by Moveable Type under a Creative Commons license:

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad(); 
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c;
  return d;
}
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}



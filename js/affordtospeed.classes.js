var Tracker = function(opts){
	
	opts = opts || {};
	var progressDisplay = opts.progressDisplay || new DisplayPanel();
	var triggerDistance = opts.triggerDistance || 100;
	
	var tripLogbook = new TripData();
	var watchId, intervalId;
	var trackerLastStartTime = 0;
	var startEnd = { start: 'Current Location', end: 'Current Location' };
	var log = [];
	
	var geo = navigator.geolocation;

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
				geo.getCurrentPosition(getPositionSuccess, getPositionFailure);
			}, intervalTime);

			// #2, set a watch
			var watchId = geo.watchPosition(getPositionSuccess, getPositionFailure, positionOptions);
		}
		else {
			console.warn('No geo available');
		}
	};

	var stop = function(){
		geo.clearWatch(watchId);
		clearInterval(intervalId);

		tripLogbook.saveToBrowser();

		// figure out how long the tracker went for
		var timeTrackedMins = Math.floor((trackerLastStartTime - Date.now()) / 60000);

	  	// progressDisplay.writeLog('Time tracked ' + timeTrackedMins);
		return timeTrackedMins;
	};
	
	var getPositionSuccess = function(position){
		var coords = {
			lat: position.coords.latitude, 
			lon: position.coords.longitude,
			timestamp: Date.now(),
			src: 'poll'
		};

		console.log('[IntervalPosition] sent position ', coords);
		progressDisplay.writeLog('Position '+coords.lat + ',' + coords.lon);

		// If we've moved substantially (as defined in the trigger)
		if (checkForMovement(coords)){
			var opts = {};
			trackToApi(coords, opts, function(data){
				console.log('TrackToAPI was called back');
				if (tripLogbook.isNewStage(data)){
					if (tripLogbook.trip.length > 0){
						// Show our suburb location on the screen
						ScreenUpdater.addLocationProgress(data);	
					}
					else {
						// Show our suburb location in the start box
						ScreenUpdater.addStartLocation(data);
					}
					// Record it in the logbook
					tripLogbook.recordStage(data);	
				}
			});
		}

		log.push(coords);

	};
	
	var getPositionFailure = function(err){
		console.warn('Failed to use position');		
	};

	var getLastCoords = function(){
		if (log.length > 0){
			var lastRecorded = log[log.length-1];
			return {
				lat: lastRecorded.lat,
				lon: lastRecorded.lon
			};
		}
		return { nothing: 1 };
	};

	var checkForMovement = function(currentCoords){
		var lastCoords = getLastCoords();
		var arcSec = 1/3600;		// 1 arcsec is about 30m
		// var moveDistTrigger = arcSec * 6;		// about 200m
		var moveKmDistTrigger = triggerDistance/1000;
		if (lastCoords.nothing){
			return true;		// trigger the first ever suburb search
		}
		if (lastCoords.lat && lastCoords.lon){
			if (calculateDistance(currentCoords.lat, currentCoords.lon, lastCoords.lat, lastCoords.lon) > moveKmDistTrigger){
				console.log('Moved '+triggerDistance+'m!');
			  	progressDisplay.writeLog('You\'ve moved '+triggerDistance+'m!');
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
	
	var tripStartEnd = function(isTriggering){
		
		if (isTriggering){
			if (tripLogbook.trip.length > 0){
				startEnd.start = tripLogbook.trip[0].suburb;
				startEnd.end = tripLogbook.trip[0].suburb;
				if (tripLogbook.trip.length > 1){
					startEnd.end = tripLogbook.trip.pop().suburb;
				}
			}	
		}
		
		return startEnd;
		
	};

	return {
		start: start,
		stop: stop,
		tripStartEnd: tripStartEnd,
		tripLogbook: tripLogbook,
		log: log
	};	
		
};





// Display controller 
var ScreenUpdater = {
	dataDefinitions: {
		thisMonthName: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][(new Date()).getMonth()],
		speeding: {
			has_school_zone: 'Has School Zones',
			is_top_twenty: 'Top 20 Speed Camera revenue',
			num_offences_this_year: 'Offences this year',
			avg_offences_per_month: 'Average offences / month',
			avg_offences_this_month: 'Average offences historically for ' + this.thisMonthName,
			avg_penalty_amount: 'Average penalty amount',
			most_common_band: 'Most common infraction',
			total_revenue_this_month: 'Historic fine revenue for ' + this.thisMonthName,
			this_month_rank: this.thisMonthName + ' ranked against other months',
			this_location_rank: 'This suburb ranked against other suburbs',
		},
		phone: {
			num_offences_this_year: 'Offences this year',
			avg_offences_per_month: 'Average offences / month',
			avg_offences_this_month: 'Average offences historically for ' + this.thisMonthName,
			avg_penalty_amount: 'Average penalty amount',
			most_common_band: 'Most common infraction',
			total_revenue_this_month: 'Historic fine revenue for ' + this.thisMonthName,
			this_month_rank: this.thisMonthName + ' ranked against other months',
			this_location_rank: 'This suburb ranked against other suburbs',
		}
	},
	preStartDriving: function(tracker){
		$('#drive .driving-state-message').html('Going for a drive?');
	},
	startDriving: function(){
		$('#drive .driving-state-message').html('Now driving...');
		$('#drive .action-start').hide();
		$('#drive .action-stop').show();
	},
	stopDriving: function(suburbName){
		$('#drive .location-progress li').last().remove();
		$('#drive .driving-state-message').html('Done!');
		$('#drive .tripstage-stop .startend-box').removeClass('placeholder').html(suburbName);
		$('#drive .action-stop').hide();
		$('#drive .action-review').show();
	},
	addStartLocation: function(data){
		var suburbName = 'Current Location';
		if (data && data.location){
			suburbName = data.location.suburb_name;
		}
		$('#drive .tripstage-start .startend-box').removeClass('placeholder').html(suburbName);
	},
	addLocationProgress: function(data){
		if (data && data.location){
			var $loc = $('<li>');
			$loc.html(data.location.suburb_name);
			$('#drive .location-progress').append($loc);
		}
		else {
			console.warn('Didnt find a suburb in the callback data');
		}

	},
	createReviewPages: function(tripData){
		var $original = $('#review .pagestack').addClass('original');
		var tripStageCounter = 1;
		
		for (var x in tripData.trip){
			var $clone = $original.clone().removeClass('original');
			$clone.find('.review-suburb').html((tripStageCounter++)+'. '+tripData.trip[x].suburb);
			// '<div class="stratum">Condamine St $$</div>';
			
			var categories = ['speeding', 'phone'];
			for (var i in categories){
				var thisCategory = categories[i];
				for (var j in tripData.trip[x].data[thisCategory]){
					if (this.dataDefinitions[thisCategory] && this.dataDefinitions[thisCategory].hasOwnProperty(j)){
						var label = this.dataDefinitions[thisCategory][j];
						var value = tripData.trip[x].data[thisCategory][j];
						$clone.find('.topmost-inner').append('<div class="stratum category-'+thisCategory+' '+j+'"><aside>'+value+'</aside><h4>'+label+'</h4></div>');
					}
				}
			}
			$clone.insertAfter($original);
			$clone.on('swipeleft', function(){
				// Go to the previous card
				var $thisPagestack = $(this);
				if ($thisPagestack.prev().hasClass('pagestack')){
					var $otherPagestack = $thisPagestack.prev();
					$thisPagestack.fadeOut(400, function(){
						$otherPagestack.fadeIn(200);
					});
				}
			});
			$clone.find('.drag-prompt').on('swiperight', function(){
				// Go to the next card
				var $thisPagestack = $(this).closest('.pagestack');
				if ($thisPagestack.next().hasClass('pagestack')){
					var $otherPagestack = $thisPagestack.next();
					$thisPagestack.fadeOut(400, function(){
						$otherPagestack.fadeIn(200);
					});
				}
			});
		}
		
		// KILL THE ORIGINAL
		$original.remove();
		
		if ($('#review .pagestack').length > 0){
			// hide all the other clones
			$('#review .pagestack').hide();
			$('#review .pagestack').last().show();	
		}

	},
	updateReviewPageHeadings: function(startEnd){
		$('#review .review-mainheading .start-loc').html(startEnd.start);
		$('#review .review-mainheading .end-loc').html(startEnd.end);
		
	}
};


// Storage controller
var TripData = function(){
 	
	var hasStorage = typeof(Storage) !== "undefined";
	var timestamp = Date.now();
	var trip = [];

	var recordStage = function(data){
		if (data && data.location){
			var tripStage = {
				timestamp: Date.now(),
				suburb: data.location.suburb_name,
				data: data
			};		
			trip.push(tripStage);
			console.log('Trip so far: ', trip);	
			return true;
		}
		
		console.warn('Location data was not present, skipping');
		return false;
	};
	
	var isNewStage = function(data){
		if (data && data.location){
			// ? Check out whether this suburb was already recorded
			if (trip.length > 0 && trip[trip.length-1].suburb === data.location.suburb_name){
				console.warn('We are still in the same suburb - dont record this');
				return false;
			}
			return true;
		}
		console.warn('Location data was not present, skipping');
		return false;
	};

	var getSaved = function(){
		if (localStorage){
 			if (localStorage.trips){
 				try {
					return JSON.parse(localStorage.trips);
 				}
 				catch (err){
 					return [];
 				}
 			}
 			return true;
 		}
 		console.warn('localStorage not available');
 		return false
	};

 	var saveToBrowser = function(){
 		console.log('Saving to browser');
 		if (localStorage){
			var saved = [];
 			if (localStorage.trips){
 				try {
			 		saved = JSON.parse(localStorage.trips);
 				}
 				catch (err){
 					saved = [];
 				}
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
		trip: trip,
 		recordStage: recordStage,
		isNewStage: isNewStage,
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
		if ($screen){
			$screen.append('<p>'+(logCounter++)+'. '+message+'</p>');	
		}
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

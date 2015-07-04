/** Afford to speed? */


// Main controller -- display
var AffordController = function(opts){
	var progressDisplay, resultsDisplay;

	opts = opts || {};
	if (opts.progressScreen){
		progressDisplay = new DisplayPanel(opts.progressScreen);
	}
	if (opts.resultsScreen){
		resultsDisplay = new DisplayPanel(opts.resultsScreen);
	}

	var tracker = new Tracker({ 
		progressDisplay: progressDisplay,
		triggerDistance: 10 		// metres
	});

	// This should be called right after document.ready
	var init = function(){
		// $.mobile.navigate('#splash');
		
		if ('geolocation' in navigator) {
			console.log('There is geolocation here!!');
			
			// trigger a prompt to use location
			navigator.geolocation.getCurrentPosition(function(position){
				// this was only a test
			});
		
			$('.action-start').on('click', function(){
				launch();
			});
			$('.action-stop').on('click', function(){
				displayResults();
			});
			$('.action-reset').on('click', function(){
				$('.content').html('');
			});
			
			$('.action-drive').on('click', function(){
				ScreenUpdater.preStartDriving();
			});
			
			// hide the stop button
			$('#drive .action-stop, #drive .action-review').hide();

			
			// Navigate off the splash page
			setTimeout(function(){
				// $.mobile.navigate('#start');
			}, 2000);
			
		} 
		else {
			console.warn('There NO is geolocation here!!');
			$('.no-geoloc-message').show();
		}

	};

	var launch = function(){
		console.log('started tracking on affordtospeed');
		tracker.start();
		ScreenUpdater.startDriving();
	};

	var displayResults = function(){
		console.log('started tracking on affordtospeed');
		var elapsed = tracker.stop();
		resultsDisplay.writeLog('Tracked for ' + elapsed + ' mins');
		
		var tripStage = tracker.updateLastTripStage();
		ScreenUpdater.stopDriving(tripStage.suburb);
	};

	var debugResults = function(){
		// not used

	}

	return {
		init: init,
		tracker: tracker
	};

};



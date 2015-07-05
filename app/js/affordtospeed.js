/** Afford to speed? */


// Main controller -- display
var AffordController = function(opts){
	
	opts = opts || {};
	
	var progressDisplay, resultsDisplay;
	if (opts.progressScreen){
		progressDisplay = new DisplayPanel(opts.progressScreen);
	}
	if (opts.resultsScreen){
		resultsDisplay = new DisplayPanel(opts.resultsScreen);
	}
	
	var tracker = new Tracker({ 
		// progressDisplay: progressDisplay,
		triggerDistance: 100 		// metres
	});

	// This should be called right after document.ready
	var init = function(){		
		$.mobile.navigate('#splash');
				
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
				conclude();
			});
			$('.action-review').on('click', function(){
				displayResults();
			});
			$('.action-reset').on('click', function(){
				$.mobile.navigate('#');
				location.reload();
			});
			
			$('.action-drive').on('click', function(){
				ScreenUpdater.preStartDriving();
			});
			
			// hide the stop and review screen buttons initially
			$('#drive .action-stop, #drive .action-review').hide();

			
			// Navigate off the splash page
			var splashTimeout = setTimeout(function(){
				$.mobile.navigate('#start');
			}, 5000);
			
			$('.splash-page').on('tap', function(){
				clearTimeout(splashTimeout);
				$.mobile.navigate('#start');
			});
			
		} 
		else {
			alert('No geolocation is available on this device');
			console.warn('There NO is geolocation here!!');
			$('#splash .no-geoloc-message').show();
		}

	};

	var launch = function(){
		console.log('started tracking on affordtospeed');
		tracker.start();
		ScreenUpdater.startDriving();
	};

	var conclude = function(){
		console.log('started tracking on affordtospeed');
		var elapsed = tracker.stop();
		resultsDisplay.writeLog('Tracked for ' + elapsed + ' mins');
		
		var startEnd = tracker.tripStartEnd(true);
		ScreenUpdater.stopDriving(startEnd.end);
	};
	
	var displayResults = function(){
		ScreenUpdater.createReviewPages(tracker.tripLogbook);
		ScreenUpdater.updateReviewPageHeadings(tracker.tripStartEnd());
		
	};

	var debugResults = function(){
		// not used

	};

	return {
		init: init,
		tracker: tracker
	};

};



<!DOCTYPE html>
<html>
<head>
	<title>Can you afford to speed?</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<link rel="stylesheet" href="css/jquery.mobile.css" type="text/css" />
	<link rel="stylesheet" href="css/affordtospeed.jquerymobiletheme.css" type="text/css" />
	<link rel="stylesheet" href="css/affordtospeed.css" type="text/css" />
	<link href='http://fonts.googleapis.com/css?family=Roboto:400,700,400italic,300,700italic' rel='stylesheet' type='text/css'>
	<script src="js/jquery-1.11.3.min.js"></script>
	<script src="js/jquery.mobile.min.js"></script>
</head>
<body>
	<!-- Splash screen, picture of car & logo -->
	<div id="splash" class="splash-page" data-role="page">
		<div data-role="content"> 
			<img src="img/splash-logo.png" class="splash-logo"/>
			<div class="no-geoloc-message">Hey, it doesn't look like you have geolocation enabled, or your device doesn't support it! We need geolocation in order to work.</div>
		</div>
	</div>
	
	<div id="start" class="start-page info-page" data-role="page" data-title="Can you afford to Speed">
		<header data-role="header">
			
		</header>
		<div data-role="content">
			
			<a href="#drive" class="ui-btn menu-action action-drive">Drive</a>
			<a href="#statistics" class="ui-btn menu-action action-statistics">Statistics</a>
			<a href="#info" class="ui-btn menu-action action-info">Info</a>

		</div>
		<footer data-role="footer"> 
			<a href="" class="action-reset replay-icon"></a>
		</footer>
	</div>
	
	<div id="info" class="start-page info-page" data-role="page" data-title="Info">
		<header data-role="header"></header>
		<div data-role="content" class="team-info">
			
			<p>Carefully crafted for Govhack 2015 by <strong>The Manly Squirrels:</strong> Alan, Tiffany, Suzanne and Tina</p>

		</div>
		<footer data-role="footer"> 
			<a href="" class="action-reset replay-icon"></a>
		</footer>
	</div>

	<div id="statistics" class="start-page info-page" data-role="page" data-title="Statistics">
		<header data-role="header"></header>
		<div data-role="content">
			
			<a href="#statistics-redlight" class="ui-btn menu-action action-statistics-redlight">Red Light Cameras</a>
			<a href="#statistics-speedcameras" class="ui-btn menu-action action-statistics-speedcameras">Speed Cameras</a>
			<a href="#statistics-schoolzones" class="ui-btn menu-action action-statistics-schoolzones">School Zones</a>
			<a href="#statistics-parkingfines" class="ui-btn menu-action action-statistics-parkingfines">Parking Fines</a>

		</div>
		<footer data-role="footer"> 
			<a href="" class="action-reset replay-icon"></a>
		</footer>
	</div>

	
	<div id="drive" class="run-page drive-page" data-role="page" data-title="Drive">
		<header data-role="header"></header>
		<div data-role="content"> 
			
			<h2 class="driving-state-message">Going for a drive?</h2>
			
			<div class="tripstage-container tripstage-start">
				<div class="startend-box placeholder">Start location</div>
			</div>
			<div class="tripstage-container tripstage-inprogress">
				<ol class="location-progress"></ol>
			</div>
			<div class="tripstage-container tripstage-stop">
				<div class="startend-box placeholder">Final location</div>
			</div>
			
			<div class="controls-container">
				<a href="#" class="ui-btn action-start">Start</a>
				<a href="#" class="ui-btn action-stop">Stop</a>
				<a href="#review" class="ui-btn action-review">Review my journey</a>
			</div>
			
			
			<code class="output"></code>
		</div>
		<footer data-role="footer"> 
			<a href="" class="action-reset replay-icon"></a>
		</footer>
	</div>

	<div id="review" class="run-page review-page" data-role="page" data-title="Review your Journey">
		<div data-role="header"></div>
		<div data-role="content" class="pagestack"> 
			<div class="topmost-review">
				<h1 class="review-mainheading">
					<strong class="start-loc">Current Location</strong> 
					<span>to</span> 
					<strong class="end-loc">Current Location</strong>
				</h1>
				
				<div class="topmost-inner">
					<h2 class="review-suburb">Current Location</h2>
				</div>
				
				<aside class="drag-prompt"></aside>
			</div>
		</div>
		<footer data-role="footer"> 
			<a href="" class="action-reset replay-icon"></a>
		</footer>
	</div>
	
	<script src="js/affordtospeed.classes.js"></script>
	<script src="js/affordtospeed.js"></script>

	<script>
	var afford = new AffordController({
		progressScreen: $('#started .output'),
		resultsScreen: $('#results .output')
	});

	afford.init(); 
	

	</script>

</body>
</html>

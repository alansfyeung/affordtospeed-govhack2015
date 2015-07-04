<!DOCTYPE html>
<html>
<head>
	<title>Can you afford to speed?</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="css/jquery.mobile.css" type="tex/css" />
	<link rel="stylesheet" href="css/affordtospeed.mobile.css" type="tex/css" />
	<script src="js/jquery-1.11.3.min.js"></script>
	<script src="js/jquery.mobile.min.js"></script>
	<script src="js/affordtospeed.js"></script>
</head>
<body>
	<div id="splash" data-role="page">
		<div data-role="header"> 
			<h1>Afford to speed?</h1>
		</div>
		<div data-role="content"> 

		</div>
		<footer data-role="footer"> 
			<a href="#started" class="ui-btn action-start">Start</a>
		</footer>
	</div>


	<div id="started" data-role="page">
		<div data-role="header"> 
			<h1>You've started your journey</h1>	
		</div>
		<div data-role="content"> 
			<div class="output"></div>
		</div>
		<footer data-role="footer"> 
			<a href="#results" class="ui-btn action-finish" data-role="button" data-inline="true">Finish</a>
			<a href="#splash" class="ui-btn action-reset" data-role="button" data-inline="true">Reset</a>
		</footer>
	</div>

	<div id="results" data-role="page">
		<div data-role="header"> 
			<h1>How did you go?</h1>
		</div>
		<div data-role="content"> 
			<div class="output"></div>
		</div>
		<footer data-role="footer"> 
			<a href="#splash" class="ui-btn action-reset" data-role="button" data-inline="true">Reset</a>
		</footer>
	</div>

	<script>
	var afford = new AffordController({
		progressScreen: $('#started .output'),
		resultsScreen: $('#results .output')
	});

	afford.bindEvents();

	</script>

</body>
</html>

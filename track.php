<?php
error_reporting(E_ALL);

function logTrackingRequest($lat, $long, $speed = 0, $heading = 0){
	$accessedIP = $_SERVER['REMOTE_ADDR'];
	$timestamp = date('Y-m-d H:m:s');
	error_log("[$timestamp][$accessedIP] geo($lat,$long) speed($speed) heading($heading)".PHP_EOL, 3, "log/track.log");
}

function randomiser(){
	return json_encode(array(
		'location' => array(
			'suburb_name' => array('Chatswood', 'Artarmon', 'Manly', 'Neutral Bay', 'Mosman')[rand(0,4)],
			'suburb_council' => 'Unknown Council'
		),
		'speeding' => array(
			'location_desc' => '',
			'has_school_zone' => '',
			'is_top_twenty' => '',
			'num_offences_this_year' => '',
			'avg_offences_per_month' => rand(200,400),
			'avg_offences_this_month' => rand(200,400),
			'avg_penalty_amount' => rand(100,900),
			'most_common_band' => array(),
			'total_revenue_this_month' => '',
			'this_month_rank' => '',
			'this_location_rank' => ''
		),
		'phone' => array(
			'location_desc' => '',
			'has_school_zone' => '',
			'is_top_twenty' => '',
			'num_offences_this_year' => '',
			'avg_offences_per_month' => '',
			'avg_offences_this_month' => '',
			'avg_penalty_amount' => '',
			'most_common_band' =>'',
			'total_revenue_this_month' => '',
			'this_month_rank' => '',
			'this_location_rank' => ''
		)
	));
}


// This file accepts queries from mobile browser client side
// WIN2012 Services box 172.31.7.7

$lat = isset($_GET['lat']) ? $_GET['lat'] : 'XX';
$lon = isset($_GET['lon']) ? $_GET['lon'] : 'YY';

// Write to a log to see who's accessed things
logTrackingRequest($lat, $lon);

// Grab the data from the web service
$apiEndpoint = 'http://172.31.7.7/affordtospeed';
$apiQuery = "$apiEndpoint?lat=$lat&long=$long";
$json = file_get_contents($apiQuery);

// echo $apiQuery;

header('content-type: application/json');

// echo $json;

echo randomiser();





echo json_encode(array('location' => array(
	'suburb_name' => "Camperdown",
	'suburb_council' => "Leichhardt City Council"
)));

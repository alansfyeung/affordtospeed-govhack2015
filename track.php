<?php
error_reporting(E_ALL);

require_once 'api.inc.php';

// This file accepts queries from mobile browser client side
// WIN2012 Services box 172.31.7.7

$lat = isset($_GET['lat']) ? $_GET['lat'] : 0;
$lon = isset($_GET['lon']) ? $_GET['lon'] : 0;

// Write to a log to see who's accessed things
logTrackingRequest($lat, $lon);

// Grab the data from the web service  --- We no longer have a web service
// $apiEndpoint = 'http://172.31.7.7/affordtospeed';
// $apiQuery = "$apiEndpoint?lat=$lat&long=$long";
// $json = file_get_contents($apiQuery);

// echo $apiQuery;

// The return struct
$ret = array();

// Grab the suburb name
$suburbData = suburb($lat, $lon);
//var_dump($suburbData);

$ret['location'] = $suburbData;

// SPEEDING DIGITAL FIXED
$ret['speeding'] = fixeddigital_by_suburb($suburbData['suburb']);


header('content-type: application/json');
echo json_encode($ret);

exit;



echo json_encode(array('location' => array(
	'suburb_name' => "Camperdown",
	'suburb_council' => "Leichhardt City Council"
)));

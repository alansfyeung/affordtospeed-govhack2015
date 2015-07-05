<?php
error_reporting(E_ALL);
require_once 'api.inc.php';

$lat = $_GET['lat'];  				// Latitude received
$lon = $_GET['lon'];				// Longitude received

$suburbData = json_decode(suburb($lat, $lon));
// echo suburb($lat, $lon);
$res = fixeddigital_by_suburb($suburbData->suburb);

var_dump($res);
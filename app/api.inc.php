<?php

function suburb($lat = 0, $lon = 0){
	// header('content-type: text/plain');
	require_once 'lib/idiorm.php';

	$databaseName = "govhack15";
	ORM::configure("mysql:host=mysql02.c7vaazdx09rf.ap-southeast-2.rds.amazonaws.com;dbname=$databaseName");
	ORM::configure('username', 'ben');
	ORM::configure('password', 'Password1');

	// 4 queries for all 4 vector directions
	// $q1 = ORM::for_table('locations')->find_many();
	// var_dump($q1);

	$q1 = ORM::for_table('locations')->select_many('suburb', 'lat', 'lon')->where_gte('lat', $lat)->where_gte('lon', $lon)->limit(5)->order_by_asc('lat')->order_by_asc('lon')->find_many();
	$q2 = ORM::for_table('locations')->select_many('suburb', 'lat', 'lon')->where_gte('lat', $lat)->where_lt('lon', $lon)->limit(5)->order_by_asc('lat')->order_by_desc('lon')->find_many();
	$q3 = ORM::for_table('locations')->select_many('suburb', 'lat', 'lon')->where_lt('lat', $lat)->where_gte('lon', $lon)->limit(5)->order_by_desc('lat')->order_by_asc('lon')->find_many();
	$q4 = ORM::for_table('locations')->select_many('suburb', 'lat', 'lon')->where_lt('lat', $lat)->where_lt('lon', $lon)->limit(5)->order_by_desc('lat')->order_by_desc('lon')->find_many();

	// Select closest long
	$closest = false;
	$smallestStraightLineDist = 9999;
	foreach (array($q1, $q2, $q3, $q4) as $resultSet){
		foreach ($resultSet as $record){
			$thisSuburbDist = calculate_distance($lat, $lon, $record->lat, $record->lon);
			// echo "Checking $record->suburb, $record->lat, $record->lon, dist $thisSuburbDist m", PHP_EOL;

			if ($thisSuburbDist < $smallestStraightLineDist){
				$smallestStraightLineDist = $thisSuburbDist;
				$closest = $record; 
				// echo "---- NEW CLOSEST FOUND, $record->suburb", PHP_EOL;
			}
		}	
	}
	
	// Now we have the closest suburb
	$final = ORM::for_table('locations')->where('suburb', $closest->suburb)->find_array();

	// echo "final", PHP_EOL;
	// var_dump($final);

	return $final[0];		// json encode it later
}

function fixeddigital_by_suburb($suburb){
	header('content-type: text/plain');
	require_once 'lib/idiorm.php';

	$databaseName = "govhack15";
	ORM::configure("mysql:host=mysql02.c7vaazdx09rf.ap-southeast-2.rds.amazonaws.com;dbname=$databaseName");
	ORM::configure('username', 'ben');
	ORM::configure('password', 'Password1');

	$thisMonthName = date('M');
	$thisFY = '2013/14';

	// echo 'FixedDigital by '.$suburb, PHP_EOL;
	// echo 'MonthName is '.$thisMonthName, PHP_EOL;

	$qHasSchoolZones = ORM::for_table('fixed_digital')->distinct()->select('zone_type')->where_like('auspost_suburb', "%$suburb%")->where('zone_type', 'School Zone')->find_one();
	$qNumFinesThisYear = ORM::for_table('fixed_digital')->select_expr('SUM(total_fines)', 'total_suburb_fines')->where_like('auspost_suburb', "%$suburb%")->where('fy', $thisFY)->find_one();
	$qAvgOffencesPerMonth = ORM::for_table('fixed_digital')->select('month')->select_expr('SUM(total_fines)', 'total_suburb_fines')->where_like('auspost_suburb', "%$suburb%")->group_by('month')->group_by('auspost_suburb')->order_by_desc('total_suburb_fines')->find_many();
	$qAvgOffencesThisMonth = ORM::for_table('fixed_digital')->select_expr('SUM(total_fines)', 'total_suburb_fines')->where_like('auspost_suburb', "%$suburb%")->where('month', $thisMonthName)->group_by('fy')->find_many();
	$qAvgPenaltyAmount = ORM::for_table('fixed_digital')->select_expr('SUM(total_dollars)', 'total_suburb_dollars')->select_expr('SUM(total_fines)', 'total_suburb_fines')->where_like('auspost_suburb', "%$suburb%")->group_by('auspost_suburb')->find_one();
	$qAvgRevenueThisMonth = ORM::for_table('fixed_digital')->select_expr('SUM(total_dollars)', 'total_suburb_dollars')->where_like('auspost_suburb', "%$suburb%")->where('month', $thisMonthName)->where('fy', $thisFY)->find_one();
	$qMostCommonBand = ORM::for_table('fixed_digital')->select_expr('COUNT(speed_band)', 'total_suburb_speedband')->select('speed_band')->where_like('auspost_suburb', "%$suburb%")->group_by('speed_band')->order_by_desc('total_suburb_speedband')->find_one();


	// if hasSchoolZones
	$hasSchoolZones = false;
	if ($qHasSchoolZones && sizeof($qHasSchoolZones) > 0){
		$hasSchoolZones = true;
	}

	// Calculate avg offences per month
	$sum = 0;
	$thisMonthRank = 0;
	foreach ($qAvgOffencesPerMonth as $i => $perMonth){
		$sum += intval($perMonth->total_suburb_fines);
		if (strtolower($perMonth->month) == strtolower($thisMonthName)){
			$thisMonthRank = $i + 1;
		}
	}
	$avgOffencesPerMonth = 0;
	if (sizeof($qAvgOffencesPerMonth) > 0)
		$avgOffencesPerMonth = $sum / sizeof($qAvgOffencesPerMonth);

	// Calculate avg offences this month
	$sum = 0;
	foreach ($qAvgOffencesThisMonth as $perMonth){
		$sum += intval($perMonth->total_suburb_fines);
	}
	$avgOffencesThisMonth = 0;
	if (sizeof($qAvgOffencesThisMonth))
		$avgOffencesThisMonth = $sum / sizeof($qAvgOffencesThisMonth);

	$avgPenaltyAmount = $qAvgPenaltyAmount && intval($qAvgPenaltyAmount->total_suburb_fines) > 0 ? (intval($qAvgPenaltyAmount->total_suburb_dollars) / intval($qAvgPenaltyAmount->total_suburb_fines)) : 0;


	return array(
		'is_top_twenty' => false,
		'has_school_zones' => $hasSchoolZones,
		'num_offences_this_year' => $qNumFinesThisYear->total_suburb_fines,
		'avg_offences_per_month' => $avgOffencesPerMonth,
		'avg_offences_this_month' => $avgOffencesThisMonth,
		'avg_penalty_amount' => $avgPenaltyAmount,
		'most_common_band' => $qMostCommonBand ? $qMostCommonBand->speed_band : 0,
		'total_revenue_this_month' => $qAvgRevenueThisMonth->total_suburb_dollars,
		'this_month_rank' => $thisMonthRank
	);

}

function calculate_distance1($lat1, $lon1, $lat2, $lon2){
	//Guts of the calculation between two points of (lat,lon)
	$delta = $lon1 - $lon2;
	$distance = (sin(deg2rad($lat1)) * sin(deg2rad($lat2))) + (cos(deg2rad(lat1)) * cos(deg2rad(lat2)) * cos(deg2rad($delta)));
	$distance = acos($distance);
	$distance = rad2deg($dist);
	//Get distance in Kilometres
	$KMperLatitude = 111.325;
	$distance = $distance * $KMperLatitude;
	
	return $distance;
}

/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
/*::                                                                         :*/
/*::  This routine calculates the distance between two points (given the     :*/
/*::  latitude/longitude of those points). It is being used to calculate     :*/
/*::  the distance between two locations using GeoDataSource(TM) Products    :*/
/*::                                                                         :*/
/*::  Definitions:                                                           :*/
/*::    South latitudes are negative, east longitudes are positive           :*/
/*::                                                                         :*/
/*::  Passed to function:                                                    :*/
/*::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :*/
/*::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :*/
/*::    unit = the unit you desire for results                               :*/
/*::           where: 'M' is statute miles (default)                         :*/
/*::                  'K' is kilometers                                      :*/
/*::                  'N' is nautical miles                                  :*/
/*::  Worldwide cities and other features databases with latitude longitude  :*/
/*::  are available at http://www.geodatasource.com                          :*/
/*::                                                                         :*/
/*::  For enquiries, please contact sales@geodatasource.com                  :*/
/*::                                                                         :*/
/*::  Official Web site: http://www.geodatasource.com                        :*/
/*::                                                                         :*/
/*::         GeoDataSource.com (C) All Rights Reserved 2015		   		     :*/
/*::                                                                         :*/
/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
function calculate_distance($lat1, $lon1, $lat2, $lon2, $unit = 'K') {

  $theta = $lon1 - $lon2;
  $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
  $dist = acos($dist);
  $dist = rad2deg($dist);
  $miles = $dist * 60 * 1.1515;
  $unit = strtoupper($unit);

  if ($unit == "K") {
    return ($miles * 1.609344);
  } else if ($unit == "N") {
      return ($miles * 0.8684);
    } else {
        return $miles;
      }
}



function logTrackingRequest($lat, $long, $speed = 0, $heading = 0){
	$accessedIP = $_SERVER['REMOTE_ADDR'];
	$timestamp = date('Y-m-d H:m:s');
	error_log("[$timestamp][$accessedIP] geo($lat,$long) speed($speed) heading($heading)".PHP_EOL, 3, "log/track.log");
}

function randomiser(){
	return json_encode(array(
		'location' => array(
			'suburb_name' => array('Chatswood', 'Chatswood', 'Chatswood', 'Artarmon', 'Manly', 'Neutral Bay', 'Mosman')[rand(0,6)],
			'suburb_council' => 'Unknown Council'
		),
		'speeding' => array(
			'location_desc' => '',
			'has_school_zone' => '',
			'is_top_twenty' => array(true, false)[rand(0,1)],
			'num_offences_this_year' => rand(3040,8090),
			'avg_offences_per_month' => rand(200,400),
			'avg_offences_this_month' => rand(200,400),
			'avg_penalty_amount' => rand(100,900),
			'most_common_band' => array('Band XYZ', 'Band ABC', 'Band 3456')[rand(0,2)],
			'total_revenue_this_month' => rand(70000,200000),
			'this_month_rank' => rand(1,12),
			'this_location_rank' => rand(1,99)
		),
		'phone' => array(
			'num_offences_this_year' => rand(3040,8090),
			'avg_offences_per_month' => rand(200,400),
			'avg_offences_this_month' => rand(200,400),
			'avg_penalty_amount' => rand(100,900),
			'most_common_band' => array('Band XYZ', 'Band ABC', 'Band 3456')[rand(0,2)],
			'total_revenue_this_month' => rand(70000,200000),
			'this_month_rank' => rand(1,12),
			'this_location_rank' => rand(1,99)
		)
	));
}
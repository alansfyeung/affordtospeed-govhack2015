====================================
GovHack 2015 - "Can you afford to Speed"
The Manly Squirrels (team)
====================================

Our JSON API is available for public use. Given any set of decimal GPS co-
ordinates in NSW, the API will match speed camera, red light, school zone, 
phone infringement, and fatalities.

Issue a HTTP GET to
Endpoint: http://canyou.affordtospeed.com/app/track.php
Query string params:  lat, lon


** Example API call: 
http://canyou.affordtospeed.com/app/track.php?lat=-33.77&lon=151.5

** Returns:
{"location":{"id":"207","suburb":"CURL CURL","postcode":"2096","state":"NSW",
"dc":"FRENCHS FOREST DEL FAC-DEL","type":"Delivery Area","lat":"-33.7689",
"lon":"151.294","Has_Fixed_Camera_Data":"0"},"speeding":{"is_top_twenty":false,
"has_school_zones":true,"num_offences_this_year":"817","avg_offences_per_month"
:710.83333333333,"avg_offences_this_month":156,"avg_penalty_amount":
176.05416178195,"most_common_band":"EXCEED SPEED 10KM\/H OR UNDER",
"total_revenue_this_month":"23757","this_month_rank":7}}
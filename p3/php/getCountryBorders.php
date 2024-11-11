<?php
header('Content-Type: application/json');

$country = isset($_GET['country']) ? $_GET['country'] : '';

if ($country) {
    $url = "https://nominatim.openstreetmap.org/search?country=" . urlencode($country) . "&polygon_geojson=1&format=json";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Gazetteer Educational Project');
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    echo $response;
}
?>

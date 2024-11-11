<?php
$countryCode = $_GET['country'];

// In a real application, you would fetch this data from an API or database
$countryInfo = [
    'US' => ['name' => 'United States', 'capital' => 'Washington D.C.', 'population' => 331002651, 'area' => 9833517],
    'GB' => ['name' => 'United Kingdom', 'capital' => 'London', 'population' => 67886011, 'area' => 242495],
    // Add more countries...
];

header('Content-Type: application/json');
echo json_encode($countryInfo[$countryCode] ?? ['error' => 'Country not found']);

// Search API
$('#btnSearch').click(function() {
    $.ajax({
        url: "libs/php/getSearchInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            query: $('#searchQuery').val(),
            maxRows: $('#maxRows').val()
        },
        success: function(result) {
            if (result.status.code === "200") {
                let output = '';
                result.data.forEach(item => {
                    output += `<div>Result: ${item.name}, Country: ${item.country}, Population: ${item.population}</div>`; // Adjust based on actual properties
                });
                $('#searchResult').html(output);
            } else {
                $('#searchResult').html(`<div>Error: ${result.status.description}</div>`);
            }
        },
        error: function(xhr, status, error) {
            $('#searchResult').html("Error fetching search data.");
        }
    });
});


// Time Zone API
$('#btnTimeZone').click(function() {
    $.ajax({
        url: "libs/php/getTimeZoneInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#lat').val(),
            lng: $('#lng').val()
        },
        success: function(result) {
            if (result.status.code === "200") {
                let output = `
                    <div>Time Zone: ${result.data.timezoneId || 'N/A'}</div>
                    <div>UTC Offset: ${result.data.gmtOffset || 'N/A'}</div>
                    <div>Country: ${result.data.countryCode || 'N/A'}</div>
                `;
                $('#timeZoneResult').html(output);
            } else {
                $('#timeZoneResult').html(`<div>Error: ${result.status.description}</div>`);
            }
        },
        error: function(xhr, status, error) {
            $('#timeZoneResult').html("Error fetching time zone data.");
        }
    });
});


// Weather API
$('#btnWeather').click(function() {
    $.ajax({
        url: "libs/php/getWeatherInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            city: $('#city').val()
        },
        success: function(result) {
            if (result.status.code === "200") {
                let weather = result.data;
                let output = `
                    <div>City: ${weather.name || 'N/A'}</div>
                    <div>Temperature: ${weather.main.temp} °C</div>
                    <div>Weather: ${weather.weather[0].description || 'N/A'}</div>
                    <div>Humidity: ${weather.main.humidity}%</div>
                    <div>Wind Speed: ${weather.wind.speed} m/s</div>
                `;
                $('#weatherResult').html(output);
            } else {
                $('#weatherResult').html(`<div>Error: ${result.status.description}</div>`);
            }
        },
        error: function(xhr, status, error) {
            $('#weatherResult').html("Error fetching weather data.");
        }
    });
});


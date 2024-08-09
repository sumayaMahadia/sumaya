function getGeoNames() {
    const lang = document.getElementById('geoLang').value;
    const country = document.getElementById('geoCountry').value;

    $.ajax({
        url: `libs/php/getCountryInfo.php?lang=${lang}&country=${country}`,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data); 
        },
        error: function(error) {
            console.error("Error fetching GeoNames data:", error);
        }
    });
}

function getWeather() {
    const city = document.getElementById('weatherCity').value;
    const apiKey = document.getElementById('weatherApiKey').value;

    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data); 
        },
        error: function(error) {
            console.error("Error fetching weather data:", error);
        }
    });
}

function getCountryInfo() {
    const countryName = document.getElementById('countryName').value;

    $.ajax({
        url: `https://restcountries.com/v3.1/name/${countryName}`,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data); 
        },
        error: function(error) {
            console.error("Error fetching country info:", error);
        }
    });
}

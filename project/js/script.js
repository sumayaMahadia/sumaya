let map;
let currentMarker;
let countryBorder;
let markerClusterGroup;

$(document).ready(function() {
    initMap();
    loadCountryList();

    $('#country-select').change(function() {
        const countryCode = $(this).val();
        if (countryCode) {
            fetchCountryInfo(countryCode);
        }
    });

    $('#close-info').click(function() {
        $('#info-panel').addClass('d-none');
    });
});

function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markerClusterGroup = L.markerClusterGroup();
    map.addLayer(markerClusterGroup);

    getUserLocation();
}

function getUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            map.setView([lat, lon], 5);
            reverseGeocode(lat, lon);
        }, function(error) {
            console.error("Error getting user location:", error);
        });
    } else {
        console.log("Geolocation is not available");
    }
}

function reverseGeocode(lat, lon) {
    $.ajax({
        url: `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=9006b5b8af3c44af891c06488776d8ea`,
        method: 'GET',
        success: function(data) {
            if (data.results && data.results.length > 0) {
                const countryCode = data.results[0].components.country_code.toUpperCase();
                $('#country-select').val(countryCode).trigger('change');
            }
        },
        error: function(xhr, status, error) {
            console.error("Error reverse geocoding:", error);
        }
    });
}

function loadCountryList() {
    $.ajax({
        url: 'https://restcountries.com/v3.1/all',
        method: 'GET',
        success: function(countries) {
            const sortedCountries = countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
            sortedCountries.forEach(country => {
                $('#country-select').append(`<option value="${country.cca2}">${country.name.common}</option>`);
            });
        },
        error: function(xhr, status, error) {
            console.error("Error loading country list:", error);
        }
    });
}

function fetchCountryInfo(countryCode) {
    showPreloader();
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        method: 'GET',
        success: function(data) {
            if (data && data.length > 0) {
                const country = data[0];
                updateMap(country);
                updateInfoPanel(country);
                fetchAdditionalInfo(country);
            }
        },
        error: function(xhr, status, error) {
            console.error("Error fetching country info:", error);
            hidePreloader();
        }
    });
}

function updateMap(country) {
    if (markerClusterGroup) {
        markerClusterGroup.clearLayers();
    }
    if (countryBorder) {
        map.removeLayer(countryBorder);
    }

    const lat = country.latlng[0];
    const lon = country.latlng[1];
    map.setView([lat, lon], 5);


    if (country.capital && country.capital[0]) {
        $.ajax({
            url: `https://api.opencagedata.com/geocode/v1/json?q=${country.capital[0]}&key=9006b5b8af3c44af891c06488776d8ea`,
            method: 'GET',
            success: function(data) {
                if (data.results && data.results.length > 0) {
                    const capitalLat = data.results[0].geometry.lat;
                    const capitalLon = data.results[0].geometry.lng;
                    const marker = L.marker([capitalLat, capitalLon], {icon: defaultIcon})
                        .bindPopup(`Capital: ${country.capital[0]}`);
                    markerClusterGroup.addLayer(marker);
                }
            }
        });
    }

    $.ajax({
        url: `https://api.opencagedata.com/geocode/v1/json?q=cities+in+${country.name.common}&key=9006b5b8af3c44af891c06488776d8ea`,
        method: 'GET',
        success: function(data) {
            if (data.results) {
                data.results.forEach(city => {
                    if (city.components.city) {
                        const marker = L.marker([city.geometry.lat, city.geometry.lng], {icon: defaultIcon})
                            .bindPopup(city.components.city);
                        markerClusterGroup.addLayer(marker);
                    }
                });
            }
        }
    });

    $.ajax({
        url: `https://nominatim.openstreetmap.org/search?country=${country.name.common}&polygon_geojson=1&format=json`,
        method: 'GET',
        success: function(data) {
            if (data && data.length > 0 && data[0].geojson) {
                countryBorder = L.geoJSON(data[0].geojson, {
                    style: {
                        color: "#ff7800",
                        weight: 2,
                        opacity: 0.65
                    }
                }).addTo(map);
                map.fitBounds(countryBorder.getBounds());
            }
        },
        error: function(xhr, status, error) {
            console.error("Error fetching country border:", error);
        }
    });
}

function updateInfoPanel(country) {
    $('#country-name').text(country.name.common);
    let infoHtml = `
        <img src="${country.flags.png}" alt="${country.name.common} flag" class="country-flag">
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Area:</strong> ${country.area.toLocaleString()} km²</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Subregion:</strong> ${country.subregion || 'N/A'}</p>
    `;
    $('#country-info').html(infoHtml);
    $('#info-panel').removeClass('d-none');
}

function fetchAdditionalInfo(country) {
    // Fetch weather data
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${country.capital},${country.cca2}&appid=7526e2e653c519a08473b643654fe319`,
        method: 'GET',
        success: function(weatherData) {
            const weatherHtml = `
                <h4>Weather in ${country.capital}</h4>
                <p><strong>Temperature:</strong> ${weatherData.main.temp}°C</p>
                <p><strong>Conditions:</strong> ${weatherData.weather[0].description}</p>
            `;
            $('#country-info').append(weatherHtml);
        },
        error: function(xhr, status, error) {
            console.error("Error fetching weather data:", error);
        }
    });

    // Fetch currency exchange rate
    const currencyCode = Object.keys(country.currencies)[0];
    $.ajax({
        url: `https://api.exchangerate-api.com/v4/latest/USD`,
        method: 'GET',
        success: function(exchangeData) {
            const rate = exchangeData.rates[currencyCode];
            const currencyHtml = `
                <h4>Currency</h4>
                <p><strong>${country.currencies[currencyCode].name}:</strong> ${rate ? `1 USD = ${rate.toFixed(2)} ${currencyCode}` : 'Exchange rate not available'}</p>
            `;
            $('#country-info').append(currencyHtml);
        },
        error: function(xhr, status, error) {
            console.error("Error fetching exchange rate:", error);
        },
        complete: function() {
            hidePreloader();
        }
    });
}

function showPreloader() {
    $('#preloader').show();
}

function hidePreloader() {
    $('#preloader').hide();
}

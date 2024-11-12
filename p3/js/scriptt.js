let map;
let currentMarker;
let countryBorder;
const airports = L.markerClusterGroup();
const cities = L.markerClusterGroup();
const hospitals = L.markerClusterGroup();

$(document).ready(function() {
    initMap();
    loadCountryList();

    $('#country-select').change(function() {
        const countryCode = $(this).val();
        if (countryCode) {
            fetchCountryInfo(countryCode);
            addCountryPOI(countryCode);
        }
    });

    $('#amount, #fromCurrency, #toCurrency').on('change', convertCurrency);
    
    $('.modal').modal({
        backdrop: true,
        keyboard: true
    });
    
    $('.modal').on('click', function(e) {
        if ($(e.target).hasClass('modal')) {
            $(this).modal('hide');
        }
    });


    var myModals = document.querySelectorAll('.modal');
    myModals.forEach(function(modal) {
        new bootstrap.Modal(modal);
    });
    
    $('.info-button').on('click', function() {
        const countryCode = $('#country-select').val();
        if (countryCode) {
            showInfoModal(countryCode);
        }
    });

    if (map && L.Browser.touch) {
        if (map.dragging) map.dragging.enable();
        if (map.tap) map.tap.enable();
    }

    $('.modal').on('shown.bs.modal', function() {
        $('body').addClass('modal-open-mobile');
        if (map) map.invalidateSize();
    });

    $('.modal').on('hidden.bs.modal', function() {
        $('body').removeClass('modal-open-mobile');
    });

    window.addEventListener('orientationchange', function() {
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 200);
        }
    });

    $(window).on('resize', function() {
        if (map) {
            map.invalidateSize();
        }
    });

    if ('ontouchstart' in window) {
        $('.leaflet-control-zoom a').on('touchstart', function(e) {
            $(this).trigger('click');
            e.preventDefault();
        });
    }
});

function initMap() {
    map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: true
    });

    const defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');

    const baseMaps = {
        "Default": defaultLayer,
        "Satellite": satellite,
        "Dark": dark
    };

    const overlayMaps = {
        "Airports": airports,
        "Major Cities": cities,
        "Hospitals": hospitals
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);


    L.easyButton('fa-solid fa-cloud', function() {
        const countryCode = $('#country-select').val();
        if (countryCode) showWeatherModal(countryCode);
    }, 'Show Weather').addTo(map);

    L.easyButton('fa-solid fa-money-bill-wave', function() {
        const countryCode = $('#country-select').val();
        if (countryCode) showCurrencyModal(countryCode);
    }, 'Currency Exchange').addTo(map);

    L.easyButton('fa-brands fa-wikipedia-w', function() {
        const countryCode = $('#country-select').val();
        if (countryCode) showWikiModal(countryCode);
    }, 'Wikipedia Information').addTo(map);

    L.easyButton('fa-regular fa-newspaper', function() {
        const countryCode = $('#country-select').val();
        if (countryCode) showNewsModal(countryCode);
    }, 'Latest News').addTo(map);

    L.easyButton('fa-solid fa-info-circle', function() {
        const countryCode = $('#country-select').val();
        if (countryCode) showInfoModal(countryCode);
    }, 'Country Information').addTo(map);

    map.invalidateSize();
    getUserLocation();
}

function getUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            map.setView([lat, lon], 5);
            reverseGeocode(lat, lon);
        });
    }
}

function reverseGeocode(lat, lon) {
    $.ajax({
        url: 'php/reverseGeocode.php',
        method: 'GET',
        data: {
            lat: lat,
            lon: lon
        },
        success: function(data) {
            if (data.results && data.results.length > 0) {
                const countryCode = data.results[0].components.country_code.toUpperCase();
                $('#country-select').val(countryCode).trigger('change');
            }
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
        }
    });
}

function addCountryPOI(countryCode) {
    airports.clearLayers();
    cities.clearLayers();
    hospitals.clearLayers();

    const query = `
        [out:json][timeout:25];
        area["ISO3166-1"="${countryCode}"]->.searchArea;
        (
            node["aeroway"="aerodrome"](area.searchArea);
            node["place"="city"](area.searchArea);
            node["amenity"="hospital"](area.searchArea);
        );
        out body;
        >;
        out skel qt;
    `;

    $.ajax({
        url: 'https://overpass-api.de/api/interpreter',
        method: 'POST',
        data: { data: query },
        success: function(data) {
            const airportIcon = L.divIcon({
                html: '<i class="fas fa-plane" style="color: #0d6efd;"></i>',
                className: 'custom-div-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const cityIcon = L.divIcon({
                html: '<i class="fas fa-city" style="color: #198754;"></i>',
                className: 'custom-div-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const hospitalIcon = L.divIcon({
                html: '<i class="fas fa-hospital" style="color: #dc3545;"></i>',
                className: 'custom-div-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            data.elements.forEach(element => {
                const lat = element.lat;
                const lon = element.lon;
                const name = element.tags.name || 'Unnamed';

                if (element.tags.aeroway === 'aerodrome') {
                    const marker = L.marker([lat, lon], {icon: airportIcon})
                        .bindPopup(`<b>Airport:</b> ${name}`);
                    airports.addLayer(marker);
                }
                else if (element.tags.place === 'city') {
                    const marker = L.marker([lat, lon], {icon: cityIcon})
                        .bindPopup(`<b>City:</b> ${name}`);
                    cities.addLayer(marker);
                }
                else if (element.tags.amenity === 'hospital') {
                    const marker = L.marker([lat, lon], {icon: hospitalIcon})
                        .bindPopup(`<b>Hospital:</b> ${name}`);
                    hospitals.addLayer(marker);
                }
            });

            map.addLayer(airports);
            map.addLayer(cities);
            map.addLayer(hospitals);
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
                fetchAdditionalInfo(country);
            }
        },
        complete: function() {
            hidePreloader();
        }
    });
}

function updateMap(country) {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    if (countryBorder) {
        map.removeLayer(countryBorder);
    }

    const lat = country.latlng[0];
    const lon = country.latlng[1];
    map.setView([lat, lon], 5);

    $.ajax({
        url: 'php/getCountryBorders.php',
        method: 'GET',
        data: {
            country: country.name.common
        },
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
        }
    });
}

function fetchAdditionalInfo(country) {
    const countryName = country.name.common;
    const capital = country.capital ? country.capital[0] : 'N/A';
    const population = country.population.toLocaleString();
    const region = country.region;
    const flag = country.flags.png;

    $('#infoCountryName').text(countryName);
    $('#infoCountryFlag').attr('src', flag);
    $('#infoCapital').text(capital);
    $('#infoPopulation').text(population);
    $('#infoRegion').text(region);

    const lat = country.latlng[0];
    const lon = country.latlng[1];

    if (country.currencies) {
        const currencyCode = Object.keys(country.currencies)[0];
    }

    fetchWikiInfo(countryName);
    fetchNews(countryName, country.cca2);
}

function showWeatherModal(countryCode) {
    $("#pre-load").show();
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        method: 'GET',
        success: function(data) {
            if (data && data.length > 0) {
                const country = data[0];
                const lat = country.latlng[0];
                const lon = country.latlng[1];
                fetchWeatherData(lat, lon, country.name.common);
            }
        }
    });
}

function fetchWeatherData(lat, lon, countryName) {
    $.ajax({
        url: 'php/getWeather.php',
        method: 'GET',
        data: {
            lat: lat,
            lon: lon
        },
        success: function(weatherInfo) {
            $("#pre-load").hide();
            const weatherIcon = weatherInfo.weather[0].icon;
            const roundedTemperature = Math.floor(weatherInfo.main.temp);
            
            $("#weatherImg").html(`<img src="https://openweathermap.org/img/wn/${weatherIcon}@4x.png">`);
            $("#weatherCountry").html(countryName);
            $("#tempToday").html(roundedTemperature + "&#8451");
            $("#conditionsToday").html(weatherInfo.weather[0].description);
            
            getFiveDayForecast(lat, lon);
        }
    });
    $("#weatherModal").modal("show");
}

function getFiveDayForecast(lat, lon) {
    $.ajax({
        url: 'php/getForecast.php',
        method: 'GET',
        data: {
            lat: lat,
            lon: lon
        },
        success: function(forecastData) {
            displayForecast(forecastData.list);
        }
    });
}

function displayForecast(weatherData) {
    const forecastContainer = $("#forecast-container");
    forecastContainer.empty();
    
    for(let i = 0; i < weatherData.length; i += 8) {
        const date = new Date(weatherData[i].dt * 1000);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const weatherIcon = weatherData[i].weather[0].icon;
        const temp = Math.floor(weatherData[i].main.temp);
        const weatherDescription = weatherData[i].weather[0].description;
        
        const forecastHtml = `
            <div class="row">
                <div class="col">
                    <p class="fw-bold fs-6">${dayOfWeek}</p>
                </div>
                <div class="col">
                    <p class="fw-bold fs-6">${weatherDescription}</p>
                </div>
                <div class="col">
                    <p><img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="Weather Icon"></p>
                </div>
                <div class="col">
                    <p class="fw-bold fs-6">${temp}°C</p>
                </div>
            </div>
        `;
        forecastContainer.append(forecastHtml);
    }
}

function showCurrencyModal(countryCode) {
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        method: 'GET',
        success: function(data) {
            if (data && data.length > 0) {
                const country = data[0];
                const currencyCode = Object.keys(country.currencies)[0];
                setupCurrencyConverter(country.name.common, currencyCode);
            }
        }
    });
}

function setupCurrencyConverter(countryName, countryCurrency) {
    $('#currencyCountry').text(countryName);
    
    $.ajax({
        url: 'php/getCurrencyRates.php',
        method: 'GET',
        success: function(data) {
            const currencies = Object.keys(data.rates);
            const fromSelect = $('#fromCurrency');
            const toSelect = $('#toCurrency');
            
            fromSelect.empty();
            toSelect.empty();
            
            currencies.forEach(currency => {
                fromSelect.append(`<option value="${currency}">${currency}</option>`);
                toSelect.append(`<option value="${currency}">${currency}</option>`);
            });
            
            fromSelect.val('USD');
            toSelect.val(countryCurrency);
            
            convertCurrency();
        }
    });
    
    $('#currencyModal').modal('show');
}

function convertCurrency() {
    const amount = $('#amount').val();
    const fromCurrency = $('#fromCurrency').val();
    const toCurrency = $('#toCurrency').val();
    
    $.ajax({
        url: 'php/getCurrencyRates.php',
        method: 'GET',
        data: {
            base: fromCurrency,
            symbols: toCurrency
        },
        success: function(data) {
            if (data && data.rates) {
                const rate = data.rates[toCurrency];
                const result = (amount * rate).toFixed(2);
                $('#conversionResult').text(`${amount} ${fromCurrency} = ${result} ${toCurrency}`);
            }
        }
    });
}


function showWikiModal(countryCode) {
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        method: 'GET',
        success: function(data) {
            if (data && data.length > 0) {
                const country = data[0];
                fetchWikiInfo(country.name.common);
                $('#wikiModal').modal('show');
            }
        }
    });
}

function fetchWikiInfo(countryName) {
    $('#wikiCountry').text(countryName);
    
    $.ajax({
        url: 'php/getWikiInfo.php',
        method: 'GET',
        data: {
            country: countryName
        },
        success: function(data) {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const pageData = pages[pageId];
            
            // Get first two sentences
            const extract = pageData.extract || '';
            const sentences = extract.split('. ').slice(0, 2).join('. ') + '.';
            
            let wikiHtml = `
                <div class="wiki-extract">
                    <p>${sentences}</p>
                    <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}" 
                       target="_blank" 
                       class="btn btn-primary mt-3">
                       Read Full Article
                    </a>
                </div>
            `;
            $('#wikiContent').html(wikiHtml);
        }
    });
}


function fetchWikiImages(countryName) {
    $.ajax({
        url: 'php/getWikiImages.php',
        method: 'GET',
        data: {
            country: countryName
        },
        success: function(data) {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pages[pageId].images) {
                const imageGallery = $('#wikiImages');
                imageGallery.empty();
                
                pages[pageId].images.forEach(image => {
                    if (!image.title.toLowerCase().includes('logo') && 
                        !image.title.toLowerCase().includes('icon')) {
                        const imgUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(image.title)}`;
                        imageGallery.append(`
                            <img src="${imgUrl}" 
                                 alt="${image.title}"
                                 onerror="this.style.display='none'"
                                 style="max-width: 200px; margin: 10px;">
                        `);
                    }
                });
            }
        }
    });
}

function showNewsModal(countryCode) {
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        method: 'GET',
        success: function(data) {
            if (data && data.length > 0) {
                const country = data[0];
                fetchNews(country.name.common, countryCode);
                $('#newsModal').modal('show');
            }
        }
    });
}

function fetchNews(countryName, countryCode) {
    $('#newsCountry').text(countryName);
    
    $.ajax({
        url: 'php/getNews.php',
        method: 'GET',
        data: {
            country: countryName
        },
        success: function(data) {
            displayNews(data.articles);
        }
    });
}

function displayNews(articles) {
    const newsContent = $('#newsContent');
    newsContent.empty();
    
    const defaultImage = 'https://placehold.co/600x400/png?text=News';
    
    articles.forEach(article => {
        const newsCard = `
            <div class="news-card">
                <img src="${article.urlToImage || defaultImage}" 
                     class="news-image" 
                     alt="News Image"
                     onerror="this.src='${defaultImage}'">
                <div class="news-content">
                    <div class="news-title">${article.title}</div>
                    <div class="news-description">${article.description}</div>
                    <div class="news-meta">
                        <span>${new Date(article.publishedAt).toLocaleDateString()}</span>
                        <a href="${article.url}" target="_blank" class="read-more">Read More</a>
                    </div>
                </div>
            </div>
        `;
        newsContent.append(newsCard);
    });
}

function showInfoModal(countryCode) {
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        method: 'GET',
        success: function(data) {
            if (data && data.length > 0) {
                const country = data[0];
                displayCountryInfo(country);
            }
        }
    });
}

function displayCountryInfo(country) {
    $('#infoCountryName').text(country.name.common);
    $('#infoCountryFlag').attr('src', country.flags.png);
    $('#infoCapital').text(country.capital ? country.capital[0] : 'N/A');
    $('#infoPopulation').text(country.population.toLocaleString());
    $('#infoRegion').text(country.region);
    
    $('#infoModal').modal('show');
}

function showPreloader() {
    $('#preloader').show();
}

function hidePreloader() {
    $('#preloader').hide();
}

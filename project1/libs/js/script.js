let allRestCountries = [];
let polygons = [];
let countryCodeFromOpenCage = null;
let year = new Date().getFullYear();
let currentYear = year.toString();
// tile layer
let streets = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
  }
);

let satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

let map = L.map("map");
map.setView([51.509865, -0.118092], 4);

// tile layer
L.tileLayer(
  `https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=${LAYER1_API_KEY}`,
  {
    attribution:
      '&copy; <a href="http://www.maptilesapi.com/">MapTiles API</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    apikey:LAYER1_API_KEY ,
    maxZoom: 19,
    minZoom: 4,
  }
).addTo(map);
let basemaps = {
  Streets: streets,
  Satellite: satellite,
};
let marker = null;
// clusterMarkers
let cityMarkers = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
});
// placesmarker
let placesMarkers = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
});

let overlays = {
  Places: placesMarkers,
  Cities: cityMarkers,
};
// layer control
let layerControl = L.control.layers(basemaps, overlays).addTo(map);

// Extra markers

let cityLocationMarkers = L.ExtraMarkers.icon({
  icon: "fa-city",
  prefix: "fa-solid",
  markerColor: "black",
});

let parkLocationMarkers = L.ExtraMarkers.icon({
  icon: "fa-tree",
  iconColor: "lightgreen",
  markerColor: "darkgreen",
  prefix: "fa-solid",
});

let hospitalLocaionMarkers = L.ExtraMarkers.icon({
  icon: "fa-hospital",
  markerColor: "red",
  markerColor: "red",
  prefix: "fa-solid",
});

$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});
$(document).ready(() => {
  //easy buttons
  // Triggers basic Contry Infomatiobn Modal
  L.easyButton("fa-globe", (btn, map) => {
    if ($("#selectCountries").val() === "") {
      alert("Please Select a Country");
    } else {
      let basicCountryImfo = new bootstrap.Modal($("#countryInfo"), {});
      basicCountryImfo.show();
    }
  }).addTo(map);

  // Triggers basic Weather  Modal
  L.easyButton("fa-cloud", (btn, map) => {
    if ($("#selectCountries").val() === "") {
      alert("Please Select a Country");
    } else {
      let weatherModal = new bootstrap.Modal($("#weatherInfo"), {});
      weatherModal.show();
    }
  }).addTo(map);

  // Triggers useful information  Modal
  L.easyButton("fa-info", (btn, map) => {
    if ($("#selectCountries").val() === "") {
      alert("Please Select a Country");
    } else {
      let usefulInfoModal = new bootstrap.Modal($("#usefulInfo"), {});
      usefulInfoModal.show();
    }
  }).addTo(map);

  // Triggers puplic holidays modal
  L.easyButton("fa-umbrella-beach", (btn, map) => {
    if ($("#selectCountries").val() === "") {
      alert("Please Select a Country");
    } else {
      let holidaysModal = new bootstrap.Modal($("#public-holiday"), {});
      holidaysModal.show();
    }
  }).addTo(map);

  // Triggers news headlines modal
  L.easyButton("fa-newspaper", (btn, map) => {
    if ($("#selectCountries").val() === "") {
      alert("Please Select a Country");
    } else {
      let newsModal = new bootstrap.Modal($("#news-headlines"), {});
      newsModal.show();
    }
  }).addTo(map);

  // ------------------------------------------
  // Ajax request functinas
  const getCountries = () => {
    $.ajax({
      type: "GET",
      url: "libs/php/getCountries.php",
      data: "",
      dataType: "json",
      success: (response) => {
        let countryInfo = response;

        countryInfo = Object.values(countryInfo).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        let str = "";
        for (let i = 0; i < countryInfo.length; i++) {
          const country = countryInfo[i];
          str += `<option value="${country.code}">${country.name}</option>`;
        }

        $("#selectCountries").append(str);
        getGeoeolocation();
      },
      error: () => {
        Toastify({
          text: "Could not load countries",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };

  const getGeoeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          let lat = position.coords.latitude;
          let lon = position.coords.longitude;

          let location = [];
          location.push(lat, lon);

          marker = L.marker(location).addTo(map);

          // call  getting country by coordinate
          getCountryByCoord(lat, lon);

          return location;
        },
        () => {
          $("#selectCountries").val("GB").change();
          Toastify({
            text: "Could not get location",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            positionLeft: true,
            backgroundColor: "red",
          }).showToast();
        }
      );
    } else {
      $("#selectCountries").val("GB").change();
    }
  };

  const getCountryByCoord = (lat, long) => {
    $.ajax({
      type: "GET",
      url: "libs/php/getCountryByCoord.php",
      data: { lat: lat, long: long },
      dataType: "json",
      success: (response) => {
        countryCodeFromOpenCage =
          response.data.results[0].components["ISO_3166-1_alpha-2"];
        // Calling change event once data comes back from openCage (reverse geocode)
        $("#selectCountries").val(countryCodeFromOpenCage).change();
      },
      error: () => {
        Toastify({
          text: "Could not find country",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };

  const getRestCountries = () => {
    $.ajax({
      type: "GET",
      url: "libs/php/getRestCountries.php",
      dataType: "json",
      success: (response) => {
        allRestCountries = response.data;
        if (!allRestCountries) {
          Toastify({
            text: "Rest countries empty",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            positionLeft: true,
            backgroundColor: "red",
          }).showToast();
          return;
        }
      },
      error: () => {
        Toastify({
          text: "Could not load rest Countries",
          duration: 3000,

          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };

  const removeBorders = () => {
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) map.removeLayer(layer);
    });
  };

  const getSingleCountryBorders = (isoCode) => {
    $.ajax({
      type: "GET",
      url: "libs/php/getCountries.php",
      data: { iso: isoCode },
      dataType: "json",
      success: (response) => {
        drawBorders(response);
      },
      error: () => {
        Toastify({
          text: "Borders not found",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };
  const drawBorders = (country) => {
    let border = L.geoJSON(country).addTo(map);
    map.fitBounds(border.getBounds());
    let myStyle = {
      color: "#ff7800",
      weight: 5,
      opacity: 0.65,
    };

    let polygon = L.geoJSON(country, {
      style: myStyle,
    }).addTo(map);
    polygons.push(polygon);
  };

  const getCountryFromOpenCageByName = (countryName, latlng) => {
    /*The second parameter latng is used because the bellow ajax request returns null for some values. If this is the case the second parameter will be used  */

    $.ajax({
      type: "GET",
      url: "libs/php/getCountryByCoord.php",
      data: { country: countryName },
      dataType: "json",
      success: (response) => {
        let lat;
        let long;

        if (response.data !== null) {
          lat = response.data.results[0].geometry.lat;
          long = response.data.results[0].geometry.lng;
        } else {
          lat = latlng[0];
          long = latlng[1];
        }

        if (marker !== null) {
          map.removeLayer(marker);
        }

        map.panTo([lat, long], { animate: true, duration: 1 });
      },
      error: () => {
        Toastify({
          text: "Country not found",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };

  const getWeatherInfo = (lat, long) => {
    $.ajax({
      type: "GET",
      url: "libs/php/getWeather.php",
      data: { lat: lat, long: long },
      dataType: "json",
      success: (response) => {
        const { data } = response;
        let todayWeather = data.list[0];
        let tomorrowWeather = data.list[8];
        let dayAfterTomorrowWeather = data.list[15];
        let main = todayWeather.weather[0].main;
        let description = todayWeather.weather[0].description;
        let temp = Math.round(todayWeather.main.temp - 273.15);
        let pressure = todayWeather.main.pressure;
        let humidity = todayWeather.main.humidity;
        let name = data.city.name;

        $("#wrapper-description").html(description);
        $("#wrapper-temp").html(`${temp}°C`);
        $("#wrapper-pressure").html(pressure);
        $("#wrapper-humidity").html(`${humidity}%`);
        $("#wrapper-name").html(name);

        let hourNow = Math.round(todayWeather.main.temp - 273.15);
        let hour1 = Math.round(data.list[1].main.temp - 273.15);
        let hour2 = Math.round(data.list[2].main.temp - 273.15);
        let hour3 = Math.round(data.list[3].main.temp - 273.15);
        let hour4 = Math.round(data.list[4].main.temp - 273.15);
        let hour5 = Math.round(data.list[5].main.temp - 273.15);

        $("#wrapper-hour-now").html(`${hourNow}°`);
        $("#wrapper-hour1").html(`${hour1}°`);
        $("#wrapper-hour2").html(`${hour2}°`);
        $("#wrapper-hour3").html(`${hour3}°`);
        $("#wrapper-hour4").html(`${hour4}°`);
        $("#wrapper-hour5").html(`${hour5}°`);

        // // Time
        let timeNow = new Date().getHours();
        let time1 = timeNow + 3;
        let time2 = time1 + 3;
        let time3 = time2 + 3;
        let time4 = time3 + 3;
        let time5 = time4 + 3;

        $("#wrapper-time1").html(time1);
        $("#wrapper-time2").html(time2);
        $("#wrapper-time3").html(time3);
        $("#wrapper-time4").html(time4);
        $("#wrapper-time5").html(time5);

        // // Weather daily data
        let tomorrowTemp = Math.round(tomorrowWeather.main.temp - 273.15);
        let dATTemp = Math.round(
          Math.round(dayAfterTomorrowWeather.main.temp - 273.15)
        );

        $("#wrapper-forecast-temp-today").html(`${temp}°`);

        $("#wrapper-forecast-temp-tomorrow").html(`${tomorrowTemp}°`);
        $("#wrapper-forecast-temp-dAT").html(`${dATTemp}°`);

        // // Icons
        let iconBaseUrl = "http://openweathermap.org/img/wn/";
        let iconFormat = ".png";

        // // Today
        let iconCodeToday = data.list[0].weather[0].icon;
        let iconFullyUrlToday = iconBaseUrl + iconCodeToday + iconFormat;
        $("#wrapper-icon-today").attr("src", iconFullyUrlToday);

        // // Tomorrow
        let iconCodeTomorrow = data.list[8].weather[0].icon;
        let iconFullyUrlTomorrow = iconBaseUrl + iconCodeTomorrow + iconFormat;
        $("#wrapper-icon-tomorrow").attr("src", iconFullyUrlTomorrow);

        // // Day after tomorrow
        let iconCodeDAT = data.list[15].weather[0].icon;
        let iconFullyUrlDAT = iconBaseUrl + iconCodeDAT + iconFormat;
        $("#wrapper-icon-dAT").attr("src", iconFullyUrlDAT);

        // // Icons hourly

        // // Hour now
        let iconHourNow = data.list[0].weather[0].icon;
        let iconFullyUrlHourNow = iconBaseUrl + iconHourNow + iconFormat;
        $("#wrapper-icon-hour-now").attr("src", iconFullyUrlHourNow);

        // // Hour1
        let iconHour1 = data.list[1].weather[0].icon;
        let iconFullyUrlHour1 = iconBaseUrl + iconHour1 + iconFormat;
        $("wrapper-icon-hour1").attr("src", iconFullyUrlHour1);

        // // Hour2
        let iconHour2 = data.list[2].weather[0].icon;
        let iconFullyUrlHour2 = iconBaseUrl + iconHour2 + iconFormat;
        $("#wrapper-icon-hour2").attr("src", iconFullyUrlHour2);

        // // Hour3
        let iconHour3 = data.list[3].weather[0].icon;
        let iconFullyUrlHour3 = iconBaseUrl + iconHour3 + iconFormat;
        $("#wrapper-icon-hour3").attr("src", iconFullyUrlHour3);

        // // Hour4
        let iconHour4 = data.list[4].weather[0].icon;
        let iconFullyUrlHour4 = iconBaseUrl + iconHour4 + iconFormat;
        $("#wrapper-icon-hour4").attr("src", iconFullyUrlHour4);

        // // Hour5
        let iconHour5 = data.list[5].weather[0].icon;
        let iconFullyUrlHour5 = iconBaseUrl + iconHour5 + iconFormat;
        $("#wrapper-icon-hour5").attr("src", iconFullyUrlHour5);
        // Backgrounds
        switch (main) {
          case "Snow":
            $("#wrapper-bg").css(
              "backgroundImage",
              "url('https://mdbgo.io/ascensus/mdb-advanced/img/snow.gif')"
            );

            break;
          case "Clouds":
            $("#wrapper-bg").css(
              "backgroundImage",
              "url('https://mdbgo.io/ascensus/mdb-advanced/img/clouds.gif')"
            );
            break;
          case "Fog":
            $("#wrapper-bg").css(
              "backgroundImage",
              "url('https://mdbgo.io/ascensus/mdb-advanced/img/fog.gif')"
            );

            break;
          case "Rain":
            $("#wrapper-bg").css(
              "backgroundImage",
              "url('https://mdbgo.io/ascensus/mdb-advanced/img/rain.gif')"
            );

            break;
          case "Clear":
            $("#wrapper-bg").css(
              "backgroundImage",
              "url('https://mdbgo.io/ascensus/mdb-advanced/img/clear.gif')"
            );

            break;
          case "Thunderstorm":
            $("#wrapper-bg").css(
              "backgroundImage",
              "url('https://mdbgo.io/ascensus/mdb-advanced/img/thunderstorm.gif')"
            );

            break;
          default:
            $("#wrapper-bg").css(
              "backgroundImage",
              "url('https://mdbgo.io/ascensus/mdb-advanced/img/clear.gif')"
            );

            break;
        }
      },
      error: () => {
        Toastify({
          text: "Could not load weather ",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };

  const getExchangeRate = (currency) => {
    $.ajax({
      type: "GET",
      url: "libs/php/getExchangeRate.php",
      data: { currency: currency },
      dataType: "json",
      success: (response) => {
        const usd = response.data.rates.USD;
        const gbp = response.data.rates.GBP;
        const eur = response.data.rates.EUR;
        let content = `<h3 class="caption">Exchange Rates<h3><table class="table table-striped w-100 ">`;

        content += `<thead>
          <tr class="bg-info text-dark">
            <th class="thead-styling">USD</th>
            <th class="thead-styling">GBP</th>
            <th class="thead-styling">EUR</th>
          </tr>
         </thead>`;

        content += `<tbody>
             <tr>

               <td>${usd}</td>
               <td>${gbp}</td>
               <td>${eur}</td>
               `;
        content += "</tr></tbody></table>";

        $("#u-info-1").html(content);
      },
      error: () => {
        Toastify({
          text: "Could not load exchange rates ",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };
  const getWikiLinks = (lat, long) => {
    $.ajax({
      type: "GET",
      url: "libs/php/getWikiLinks.php",
      data: { lat: lat, long: long },
      dataType: "json",
      success: (response) => {
        if (response.data.length > 0) {
          let content = ` <h3 class="caption">Wikipedia Links </h3> <table class="table table-striped w-100">`;
          content += `<thead>
          <tr class="bg-info text-dark">
            <th class="thead-styling">Links</th> </thead`;

          content += `<tbody>`;

          let wikiInfo = response.data;
          let linksToDisplay = wikiInfo.map((url) => {
            let fullUrl = "https://" + url.wikipediaUrl;
            return fullUrl;
          });
          let wikiTitles = wikiInfo.map((article) => {
            let title = article.title;

            return title;
          });

          linksToDisplay.forEach((link, index) => {
            content += `<tr class="text-dark wikiLinks"> <td "><a href="${link}">${wikiTitles[index]}</a></tr>`;
            return content;
          });

          content += "</tbody></table>";
          $("#u-info-2").html(content);
        } else {
          $("#u-info-2").html(`<p>No articles found</p>`);
        }
      },
      error: () => {
        Toastify({
          text: "Could not load Wikipedia Links ",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };
  const getPublicHolidayInfo = (countryCode, currentYear) => {
    $.ajax({
      type: "GET",
      url: "libs/php/getPublicHolidayInfo.php",
      data: { countryCode: countryCode, year: currentYear },
      dataType: "json",
      success: (response) => {
        let holidayInformation = response.data;

        const duplicatehols = holidayInformation.map((o) => o.name);
        const filteredHolidays = holidayInformation.filter(
          ({ name }, index) => !duplicatehols.includes(name, index + 1)
        );

        let content = `<table class="table table-striped w-100 ">`;
        content += `<thead>
        <tr  class="bg-info text-dark">
          <th class="thead-styling">Name</th>
          <th class="thead-styling">Date</th>

        </tr>
       </thead>`;

        for (i = 0; i < filteredHolidays.length; i++) {
          const holiday = filteredHolidays[i];

          content += `<tbody>
           <tr>
             <td>${holiday.name}</td>



             <td>${Date.parse(holiday.date).toString("ddd dS MMM")}</td>

           </tr>`;
        }
        content += "</table>";

        $("#ph-info-1").html(content);
      },
      error: () => {

        Toastify({
          text: "Could not load public holidays",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
        $("#ph-info-1").html("<p>Holidays not found</p>");
      },
    });
  };

  const getNewsHeadlines = (countryCode) => {
    $.ajax({
      type: "GET",
      url: "libs/php/getNewsHeadlines.php",
      data: { countryCode: countryCode.toLowerCase() },
      dataType: "json",
      success: (response) => {
        let newsHeadlines = response.data.articles;
        let content = `<table class="table table-striped w-100 ">`;
        for (i = 0; i < newsHeadlines.length; i++) {
          const headline = newsHeadlines[i];

          content += `<tbody>
           <tr>
             <td><a class="news-link" href="${headline.url}">${headline.title}</a></td>
             <td>${headline.author}</td>

           </tr>`;
        }
        content += "</table>";

        $("#nh-info-1").append(content);
      },
      error: () => {
        Toastify({
          text: "Could not load news headlines",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };
  const getCitiesByCountryCode = (countryCode) => {
    $.ajax({
      type: "GET",
      url: "libs/php/getCities.php",
      data: { countryCode: countryCode },
      dataType: "json",
      success: (response) => {
        let cityInfo = response.data;

        for (let i = 0; i < cityInfo.length; i++) {
          let icon = cityLocationMarkers;
          const city = cityInfo[i];
          let cityLat = city.lat;
          let cityLng = city.lng;
          let marker = L.marker([cityLat, cityLng], { icon: icon }).bindTooltip(
            "City",
            { direction: "top", sticky: true }
          );

          cityMarkers.addLayer(marker);
        }
        map.addLayer(cityMarkers);
      },
      error: () => {
        Toastify({
          text: "Could not load cities",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };
  const getNearbyParksAndHospitals = (lat, lng) => {
    $.ajax({
      type: "GET",
      url: "libs/php/getNearbyParksAndHospitals.php",
      data: { lat: lat, lng: lng },
      dataType: "json",
      success: (response) => {
        let places = response.data;

        let icon = null;
        for (let i = 0; i < places.length; i++) {
          const place = places[i];
          if (place.types.includes("parks")) {
            icon = parkLocationMarkers;
          } else if (place.types.includes("hospital")) {
            icon = hospitalLocaionMarkers;
          }

          let placelat = place.location.lat;
          let placelng = place.location.lng;
          if (icon != null) {
            let marker = L.marker([placelat, placelng], {
              icon: icon,
            }).bindTooltip(
              place.types.includes("parks") ? "Park" : "Hospital",
              { direction: "top", sticky: true }
            );
            marker.bindPopup(
              `<h4 class="popup-name">Name: ${place.name}</h4> <p class="popup-address"> Address:${place.address}</p>`
            );

            const onClick = (e) => {
              let popup = e.target.getPopup();
              let content = popup.getContent();
            };
            marker.on("click", onClick);

            placesMarkers.addLayer(marker);
          }
        }
        map.addLayer(placesMarkers);
      },
      error: () => {
        Toastify({
          text: "Could not load places",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };
  // ------------------------------------------

  const getGeoInfo = (countryCode) => {
    return $.ajax({
      type: "GET",
      url: "libs/php/getGeonameCountryInfo.php",
      data: { code: countryCode },
      dataType: "json",
      success: (response) => {
        return response;
      },
      error: () => {
        Toastify({
          text: "Could not load country info",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };

  const getCountrySearch = (countryCode, placeName) => {
    return $.ajax({
      type: "GET",
      url: "libs/php/getCapital.php",
      data: { code: countryCode, place: placeName },
      dataType: "json",
      success: (response) => {
        return response;
      },
      error: () => {
        Toastify({
          text: "Could not load Capital info",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      },
    });
  };

  // Function that populates all modals
  const populateModals = async (countryCode) => {
    let info = await getGeoInfo(countryCode);
    info = info.data[0];

    getExchangeRate(info.currencyCode);
    getPublicHolidayInfo(countryCode, currentYear);
    getNewsHeadlines(countryCode);
    // calling getCitiesByCountryCode
    getCitiesByCountryCode(countryCode);

    let capitalInfo = await getCountrySearch(countryCode, info.capital);
    capitalInfo = capitalInfo.data[0];

    let lat = capitalInfo.lat;
    let long = capitalInfo.lng;

    getWeatherInfo(lat, long);
    getNearbyParksAndHospitals(lat, long);
    getWikiLinks(lat, long);

    if (!allRestCountries) {
      return;
    }

    let singleRestCountry = allRestCountries.find(
      (restCountry) => countryCodeFromOpenCage === restCountry.cca2
    );

    if (singleRestCountry) {
      let content = `<table class="table table-striped w-100 ">`;

      content += `<tbody>
         <tr>
         <td class="fw-bold">Name</td>
           <td>${singleRestCountry.name.common}</td>
           </tr>
           <tr class="row-styling bg-info text-dark">
           <td class="fw-bold">Capital</td>
            <td>${singleRestCountry.capital[0]}</td>
            </tr>
            <tr>
            <td class="fw-bold">Population</td>
           <td>${singleRestCountry.population.toFixed(1)}million</td>
           </tr>
           <tr class="row-styling bg-info text-dark">
           <td class="fw-bold">Flag</td>
           <td><img class="flag" src="${singleRestCountry.flags.png}"/></td>

           </tr>
         `;

      if (singleRestCountry.borders) {
        content += `
<tr>
<td class="sw-bold"> Borders With</td>
<td class="borders-list">`;
        singleRestCountry.borders.forEach((border) => {
          content += `<li>${border}</li>`;
        });
        content += `</td>`;

        content += `</tr>`;
      } else {
        content += `<tr><td class="fw-bold">Borders With </td><td class="borders-list"> <p>Borders Not Found </p> </td></tr>`;
      }

      if (singleRestCountry.subregion) {
        content += `
        <tr class="row-styling bg-info text-dark">
        <td class="fw-bold">Sub-region</td>
        <td class="subregion">${singleRestCountry.subregion}</td>
        </tr>
        `;
      } else {
        content += `
        <tr class="row-styling bg-info text-dark"><td>Sub-region</td>
        <td class="subregion"><p>Sub-region not found</p></td>
        </tr>
        `;
      }
      content += `</tbody> </table> `;

      $("#info-1").html(content);
    }
  };

  //Calling getCountries to populate select
  getCountries();

  //Calling getRestCountries to get more info
  getRestCountries();
  // clear tables before slect change
  $("tr").remove();

  // .change callback function
  $("#selectCountries").change(() => {
    let selectval = $("#selectCountries").val();
    let countryCapital = null;
    let latlng = null;
    countryCodeFromOpenCage = selectval;

    populateModals(selectval);

    if (allRestCountries?.length > 0) {
      let singleRestCountry = allRestCountries.find(
        (restCountry) => countryCodeFromOpenCage === restCountry.cca2
      );
      latlng = singleRestCountry.latlng;

      if (singleRestCountry.capital) {
        countryCapital = singleRestCountry.capital[0];
      } else {
        Toastify({
          text: "Capital not found ",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          positionLeft: true,
          backgroundColor: "red",
        }).showToast();
      }
    }

    if (polygons !== undefined) {
      removeBorders();
    }

    getSingleCountryBorders(selectval);
    // brings back coords based on iso code
    let data = countryCapital ? countryCapital : selectval;

    getCountryFromOpenCageByName(data, latlng);
  });
});

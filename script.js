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
            $('#searchResult').html(JSON.stringify(result.data));
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
            $('#timeZoneResult').html(JSON.stringify(result.data));
        }
    });
});

// Country Info API
$('#btnCountryInfo').click(function() {
    $.ajax({
        url: "libs/php/getCountryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lang: $('#lang').val(),
            country: $('#countryCode').val()
        },
        success: function(result) {
            $('#countryInfoResult').html(JSON.stringify(result.data));
        }
    });
});

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

$(document).ready(function() {
    $('#btnGetChildren').click(function() {
        const geonameId = $('#geonameId').val();

        // Validate input
        if (!geonameId) {
            $('#childrenResult').html('<div>Please enter a valid Geoname ID.</div>');
            return;
        }

        // AJAX request to the PHP script
        $.ajax({
            url: 'libs/php/getChildren.php',
            type: 'POST',
            data: {
                geonameId: geonameId
            },
            success: function(result) {
                if (result.status.code === "200" && result.data) {
                    let output = '<ul>';
                    result.data.forEach(function(child) {
                        output += `<li>${child.name} (ID: ${child.geonameId})</li>`;
                    });
                    output += '</ul>';
                    $('#childrenResult').html(output);
                } else {
                    $('#childrenResult').html(`<div>Error: ${result.status.description || 'No data available'}</div>`);
                }
            },
            error: function() {
                $('#childrenResult').html('<div>Error: Could not retrieve children information.</div>');
            }
        });
    });
});


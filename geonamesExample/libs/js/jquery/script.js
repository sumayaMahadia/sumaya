$(document).ready(function() {
    $('#getInfo').click(function() {
        var country = $('#country').val();
        var lang = $('#lang').val();

        $.ajax({
            url: 'libs/php/getCountryInfo.php',
            type: 'GET',
            data: { lang: lang, country: country },
            dataType: 'json',
            success: function(result) {
                if (result.status === 'ok') {
                    $('#result').html(JSON.stringify(result.data));
                } else {
                    $('#result').html('Error retrieving data');
                }
            },
            error: function() {
                $('#result').html('AJAX error');
            }
        });
    });
});

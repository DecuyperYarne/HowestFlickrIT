/**
 * Created by Yarne on 21/03/2017.
 */
var flickrAPIkey = "6ea2f2fba887b0a93a2b3f37f62b28f9";

var showSearch = function (e) {
    $("#content").html("").prepend('<article class="hide"></article>');
    var html;
    var tag = $("#search").val();
    var getPhoto = {
        method: 'flickr.photos.search',
        format: 'json',
        api_key: flickrAPIkey,
        tags: tag,
        nojsoncallback: '?',
        per_page: 20
    };

    $.ajax({
        type: 'GET',
        url: 'https://api.flickr.com/services/rest/',
        data: getPhoto,
        dataType: 'json'
    }).done(function (gegevens) {
        var getUser = {
            method: 'flickr.profile.getProfile',
            format: 'json',
            api_key: flickrAPIkey,
            user_id: '',
            nojsoncallback: '?'
        };

        $.each(gegevens.photos.photo, function (key, item) {
            var imgsrc = "https://farm" + item.farm + ".staticflickr.com/" + item.server + "/" + item.id + "_" + item.secret + ".jpg";
            var title = item.title;
            var author;
            var photoid = item.id;
            getUser.user_id = item.owner;

            $.ajax({
                type: 'GET',
                url: 'https://api.flickr.com/services/rest/',
                data: getUser,
                dataType: 'json'
            }).done(function (person) {
                if (null == person.profile.first_name && null == person.profile.last_name) {
                    author = "<p class='muted'>Unknown artist</p>";
                } else {
                    var fullName = person.profile.first_name + " " + person.profile.last_name;
                    author = "<a href='#' data-name='" + fullName + "' data-authid='" + person.profile.id + "' id='author'>" + fullName + "</a>";
                }

                if (title == "") {
                    title = "No title given";
                }

                html = "";
                html += '<figure class="cf"><div class="img-wrapper">';
                html += '<img src="' + imgsrc + '"></div>';
                html += '<figcaption>';
                html += '<a href="#" id="location" data-title="' + title + '" data-fotoid="' + photoid + '" class="goright"><i class="fa fa-map-marker fa-lg" aria-hidden="true"></i></a>';
                html += '<p>' + title + '</p>';
                html += author;
                html += '</figcaption></figure>';

                $('#content').append(html);
            });
        });
    });
    e.preventDefault();
};

var showAuthor = function (e) {
    var html;
    var author = $(this).attr("data-authid");
    var fullname = $(this).attr("data-name");
    $("#content").html("").append("<h1>More pictures from " + fullname + "</h1>").append("<article class='hide'></article>");

    var getPhotoUser = {
        method: 'flickr.people.getPublicPhotos',
        format: 'json',
        api_key: flickrAPIkey,
        user_id: author,
        nojsoncallback: '?',
        per_page: 20
    };

    $.ajax({
        type: 'GET',
        url: 'https://api.flickr.com/services/rest/',
        data: getPhotoUser,
        dataType: 'json'
    }).done(function (gegevens) {
        $.each(gegevens.photos.photo, function (key, item) {
            var imgsrc = "https://farm" + item.farm + ".staticflickr.com/" + item.server + "/" + item.id + "_" + item.secret + ".jpg";
            var title = item.title;
            var photoid = item.id;
            if (title == "") {
                title = "No title given";
            }

            html = "";
            html += '<figure class="cf"><div class="img-wrapper">';
            html += '<img src="' + imgsrc + '"></div>';
            html += '<figcaption>';
            html += '<a href="#" id="location" data-title="' + title + '" data-fotoid="' + photoid + '" class="goright"><i class="fa fa-map-marker fa-lg" aria-hidden="true"></i></a>';
            html += '<p>' + title + '</p>';
            html += '</figcaption></figure>';

            $("#content").append(html);
        });
    });
    e.preventDefault();
};

var showLocation = function (e) {
    var title = $(this).attr("data-title");
    var photoid = $(this).attr("data-fotoid");
    var latit;
    var longit;
    var getLocationPhoto = {
        method: 'flickr.photos.geo.getLocation',
        format: 'json',
        api_key: flickrAPIkey,
        photo_id: photoid,
        nojsoncallback: '?'
    };

    $.ajax({
        type: 'GET',
        url: 'https://api.flickr.com/services/rest/',
        data: getLocationPhoto,
        dataType: 'json'
    }).done(function (gegevens) {
        if (gegevens.stat == "ok") {
            latit = parseInt(gegevens.photo.location.latitude);
            longit = parseInt(gegevens.photo.location.longitude);

            $("#content").html("").append("<h1>Location of " + title + "</h1><div class='map'></div>");

            var map = new google.maps.Map($(".map").get(0), {
                center: {lat: latit, lng: longit},
                zoom: 7
            });
        } else {
            var modal = "<h1>No location available for " + title + "</h1>";
            modal += "<p>We are sorry for the inconvenience</p>";

            $("article").removeClass().html(modal).fadeIn();
        }
    });
    e.preventDefault();
};

$(document).ready(function () {
    $("#send").on("click", showSearch);
    $("#content").on("click", '#author', showAuthor);
    $("#content").on("click", "#location", showLocation);
});
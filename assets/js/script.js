//capture elements of the page
var userInput = $("#city-select");
var searchBtn = $("#search-btn");
var pastSearchesEl = $("#past-searches");
var cityEl = $("#city");
var tempEl = $("#current-temp");
var windEl = $("#current-wind");
var humidityEl = $("#current-humidity");
var uvEl = $("#index-icon");
var weatherIcon = $("#weather-icon");
var fiveDay = $("#five-day");


var myKey = "c2ae361906945c54dfb65306f66ae837";

searchBtn.on("click", function(event) {
    event.preventDefault();
    var cityState = userInput.val()
    if (cityState.includes(',')) {
        var cityStateArr = cityState.split(",");
        var city = cityStateArr[0].trim();
        var state = cityStateArr[1].trim();
        var searchURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "," + state + ",USA&limit=5&appid=" + myKey;
    } else {
        var searchURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityState.trim() + "&limit=5&appid=" + myKey;
    }
    console.log(searchURL);

    fetch(searchURL)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        var lat = data[0].lat;
        var lon = data[0].lon;
        getWeather(lat, lon);
    })
    
});

function getWeather(lat, lon) {
    var searchURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + myKey;
    console.log(searchURL);
    fetch(searchURL)
    .then(function(response) {
        return response.json(); 
    }).then(function(data) {
        console.log(data);
        var iconCode = data.current.weather[0].icon;
        var iconURL = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png"
        console.log(iconURL);
        weatherIcon.attr("src", iconURL);
        weatherIcon.attr("alt", "weather icon");
        var temp = kelvinToFahr(data.current.temp);
        var wind = data.current.wind_speed;
        var humidity = data.current.humidity;
        var uvIndex = data.current.uvi;
        postCurrentWeather(temp, wind, humidity, uvIndex);
        postFiveDay(data);
    });
}

function kelvinToFahr(kelv) {
    var fahr = ((kelv-273.15) * 1.8) + 32;
    return fahr.toFixed(1);
}

function postCurrentWeather(temp, wind, humidity, uvIndex) {
    var city = userInput.val();
    $("#city").text(city + " - " + moment().format("L"));

    tempEl.text("Temperature: " + temp + "\u00B0F");
    windEl.text("Wind: " + wind + " MPH");
    humidityEl.text("Humidity: " + humidity + "%");
    uvEl.text(uvIndex);

    if (uvIndex < 3) {
        uvEl.css('background-color', 'green');
    } else if (uvIndex < 6) {
        uvEl.css('background-color', 'yellow');
    } else if (uvIndex < 8) {
        uvEl.css('background-color', 'orange');
    } else if (uvIndex < 11) {
        uvEl.css('background-color', 'red');
    } else {
        uvEl.css('background-color', 'purple');
    }
}

function postFiveDay(data) {
    fiveDay.html("");

    for (let i = 0; i < 5; i++) {
        //get information from the data object.
        var iconCode = data.daily[i].weather[0].icon;
        var iconURL = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png"
        var temp = kelvinToFahr(data.daily[i].temp.max) + "\u00B0F";
        var wind = data.daily[i].wind_speed + " MPH";
        var humidity = data.daily[i].humidity + "%";
        var forecastDate = moment().add(i + 1, 'days').format('L');
        console.log(forecastDate);

        // Create div holding the information.
        var liEl = $('<li class="bg-dark text-white flex-fill mx-1">')
        var liDate = $('<h5>');
        liDate.text(forecastDate)
        liEl.append(liDate);
        var liIcon = $(`<img src="${iconURL}" height="30px" width="30px" alt="weather icon">`);
        liEl.append(liIcon);
        var liTemp = $('<p>');
        liTemp.text("High Temp: " + temp);
        liEl.append(liTemp);
        var liWind = $('<p>');
        liWind.text('Wind: ' + wind);
        liEl.append(liWind);
        var liHumidity = $('<p>');
        liHumidity.text('Humidity: ' + humidity);
        liEl.append(liHumidity);



        fiveDay.append(liEl);
    }
}
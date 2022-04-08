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
var cityState;


loadPastSearches();

//event handler for the button to initiate search.
searchBtn.on("click", function(event) {
    event.preventDefault();
    cityState = userInput.val();
    getResults(cityState);
    userInput.val('');
    
    
});


function getResults(cityState) {
    //check to see if the user did city, state or just a city.Then create api URL.
    if (cityState.includes(',')) {
        var cityStateArr = cityState.split(",");
        var city = cityStateArr[0].trim();
        var state = cityStateArr[1].trim();
        var search = city + "," + state;
        saveSearch(search);
        var searchURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "," + state + ",USA&limit=5&appid=" + myKey;
    } else {
        var searchURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityState.trim() + "&limit=5&appid=" + myKey;
        saveSearch(cityState);
    }
    
    //fetch api data for Lat and Lon of city. then use them in getWeather();
    fetch(searchURL)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data);
            if (data.length > 0) {
            var lat = data[0].lat;
            var lon = data[0].lon;
            getWeather(lat, lon);
        } else {
            cityEl.text('Please enter a valid City')
        }
    });
}

// // Event listener on past searches buttons.
pastSearchesEl.on("click", function(event) {
    var element = event.target;
    if (element.matches("button")) {
        cityState = (element.getAttribute('data-city'));
        getResults(cityState);
    }
});


//Use Lat and Lon to get weather atthat location.
function getWeather(lat, lon) {
    var searchURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + myKey;
    fetch(searchURL)
    .then(function(response) {
        return response.json(); 
    }).then(function(data) {
        // Get the icon for the current weather.
        var iconCode = data.current.weather[0].icon;
        var iconURL = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png"
        weatherIcon.attr("src", iconURL);
        weatherIcon.attr("alt", "weather icon");
        // get the weather stats
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
    //use the current weather stats to create a display in the webpage.
    $("#city").text(cityState + " - " + moment().format("L"));
    tempEl.text("Temperature: " + temp + "\u00B0F");
    windEl.text("Wind: " + wind + " MPH");
    humidityEl.text("Humidity: " + humidity + "%");
    uvEl.text("UV Index: " + uvIndex);

    // Set the UV index button to the correct color based on the UV index scale.
    if (uvIndex < 3) {
        uvEl.css('background-color', 'green');
    } else if (uvIndex < 6) {
        uvEl.css('background-color', 'yellow');
        uvEl.css('color', 'black');
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

function loadPastSearches() {
    // Get the past searches from local storage
    var pastCities = localStorage.getItem("pastCities");
    if (pastCities != null) {
        var pastCitiesJson = JSON.parse(pastCities);
        pastSearchesEl.html("");
        for (let i=0; i < pastCitiesJson.length; i++) {
            var newBtn = $('<button class="list-group-item  mt-3 border border-3 rounded-pill bg-success text-light">');
            newBtn.attr("data-city", pastCitiesJson[i]);
            newBtn.text(pastCitiesJson[i]);
            pastSearchesEl.append(newBtn);
        }
    }
}

function saveSearch(city) {
    var pastCities = localStorage.getItem("pastCities");
    var citySearchArray = [];
    if (pastCities != null) {
        citySearchArray = JSON.parse(pastCities);
    }
    // if the array is longer than 5 and doesn't have the new city, 
    // the new city is added at the beginning and the last city is removed.
    // If the city is already in the array, it is moved to index 0;

    if (citySearchArray.includes(city)) {
        var cityIndex = citySearchArray.indexOf(city);
        var repeatCity = citySearchArray[cityIndex];
        citySearchArray.splice(cityIndex, 1);
        citySearchArray.unshift(repeatCity);
    } else if (citySearchArray.length > 4) {
        citySearchArray.pop();
        citySearchArray.unshift(city)
    } else {
        citySearchArray.push(city);
    }
    localStorage.setItem('pastCities', JSON.stringify(citySearchArray));
    loadPastSearches();
} 

//Clicking on UV box will send you to an explanation of UV Index.
uvEl.on('click', function() {
    window.location = "https://www.epa.gov/sunsafety/uv-index-scale-0";  
})
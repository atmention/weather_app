// add the listeners for page events, pulling weather data 
const cityFormEl = $("#target");
const cityInputEl = $("#city-input");
const citySubmitEl = $("#city-submit");
const searchHistoryEl = $("#search-history");

// initialize necessary global vars
const APIKEY = "222033ee7e3cef36d8116bb25da24eea";
let queryURL = ``;
let currentCity = {
    lat: 0,
    lon: 0,
    name: "EnglandIsMyCity",
    date: "0000000000",
    icon: "aaa",
    temp: 0,
    wind: 0,
    humidity: 0,
    uvi: 0,
};
let currentCityLat = ``;
let currentCityLon = ``;
let currentCityName = ``;

let forecastWeather = [];
let forecastLength = 5;

// grab existing search history, or an empty array if it's the user's first visit
let searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");

// dynamically add all items from search history to the screen
for (var i = 0; i < searchHistory.length; i++) {
    var searchHistoryItem = $('<li>')
        .text(searchHistory[i])
        .addClass('list-group-item-secondary text-center');
    searchHistoryEl.append(searchHistoryItem);
}

// when the user submits their city, use the inputted text to create the api call
// and also store that value to the searchHistory at the same time, then pull the weather.
cityFormEl.submit((event) => {
    let userCity = '';
    event.preventDefault();
    if ($(cityInputEl).val() !== '') {
        userCity = $(cityInputEl).val();
        storeSearchHistory(userCity);
        queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${userCity}&units=imperial&appid=${APIKEY}`;
        pullCityWeatherData();
    };
});

// use the weather api to get the city's current weather,
// and use the geo coordinates to call the onecall api for 5-day forecast afterwards
const pullCityWeatherData = () => {

    // ensure that any previous weather data is cleared before pulling new data
    forecastWeather = [];

    fetch(queryURL).then(response =>
        response.json().then(data => ({
            data: data,
            status: response.status
        })).then(res => {
            if (res.status === 200) {

                console.log(`Status: ${res.status} OK`);
                console.log(res.data);

                // grab the required data from the response object
                // since we need the coordinates for the OneCall api, extract them
                currentCity.lat = res.data.coord.lat;
                currentCity.lon = res.data.coord.lon;
                currentCity.name = res.data.name;

                // now that the city data has been pulled, we can use the coordinates
                // to pull the onecall weather data for the 5 day forecast
                queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${currentCity.lat}&lon=${currentCity.lon}&units=imperial&appid=${APIKEY}`;
                pullCoordWeatherData();

            } else {
                console.log(`An error occurred. Status: ${res.status}`);
            }
        }));
}


const pullCoordWeatherData = () => {

    fetch(queryURL).then(response =>
        response.json().then(data => ({
            data: data,
            status: response.status
        })).then(res => {
            if (res.status === 200) {

                console.log(`Status: ${res.status} OK`);
                console.log(res.data);

                // grab the required data from the response object
                currentCity.date = new Date(res.data.current.dt * 1000).toLocaleDateString('en-US');
                currentCity.uvi = res.data.current.uvi;
                currentCity.temp = res.data.current.temp;
                currentCity.wind = res.data.current.wind_speed;
                currentCity.humidity = res.data.current.humidity;
                currentCity.icon = res.data.current.weather[0].icon;

                loadCurrentWeather();

                for (var i = 1; i < forecastLength + 1; i++) {
                    // start with a fresh object each iteration
                    let nextWeatherForcast = {};

                    // take everything needed from the response and store it
                    Object.assign(nextWeatherForcast, {
                        date: new Date(res.data.daily[i].dt * 1000).toLocaleDateString('en-US', {
                            month: 'numeric',
                            day: 'numeric'
                        }),
                        icon: res.data.daily[i].weather[0].icon,
                        temp: res.data.daily[i].temp.max,
                        wind: res.data.daily[i].wind_speed,
                        humi: res.data.daily[i].humidity,
                    });

                    // lastly, push that object to the array and repeat for all cards
                    forecastWeather.push(nextWeatherForcast);
                }

                loadFiveDayWeather();
            } else {
                console.log(`An error occurred. Status: ${res.status}`);
            }
        }));
}

const storeSearchHistory = (userSearchQuery) => {

    searchHistory.push(userSearchQuery);

    // set the local storage to include the new score
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

const loadCurrentWeather = () => {

    //clear any currently displayed data in the current and forecast boxes
    let currentWeatherEl = $("#right-div");
    currentWeatherEl.empty();

    // check to see what color the uv index div should be on the page
    let uvIndexCondition = 'green';

    if (currentCity.uvi >= 8) {
        uvIndexCondition = 'darkorchid';
    } else if (currentCity.uvi >= 6) {
        uvIndexCondition = 'red';
    } else if (currentCity.uvi >= 3) {
        uvIndexCondition = 'darkorange';
    } else {
        // do nothing, default is green for uvi < 3
    }

    // dynamically add the new weather data to the screen
    let date = $('<h1>')
        .text(`${currentCity.name} (${currentCity.date})`)
        .attr("style", "display: inline");
    let icon = $('<img>')
        .attr("src", `https://openweathermap.org/img/wn/${currentCity.icon}@2x.png`);
    let temp = $('<p>')
        .text(`Temp: ${currentCity.temp}°F`);
    let wind = $('<p>')
        .text(`Wind Speed: ${currentCity.wind} MPH`);
    let humi = $('<p>')
        .text(`Humidity: ${currentCity.humidity}%`);
    let uvi = $('<div><p></p></div>')
        .attr('style', `background-color: ${uvIndexCondition}; width: max-content; padding: 0 5px;`)
        .find('p')
        .text(`UV Index: ${currentCity.uvi}`)
        .attr('style', 'color: white;')
        .end()

    currentWeatherEl.append(date)
        .append(icon)
        .append(temp)
        .append(wind)
        .append(humi)
        .append(uvi);
}

const loadFiveDayWeather = () => {

    for (var i = 0; i < forecastLength; i++) {

        let currentCard = $(`#card-${i}`);

        // clear any existing weather data on the current card before inserting new data
        currentCard.children(".card-header").text('');
        currentCard.children(".card-body").empty();

        let date = $('<h3>')
            .text(forecastWeather[i].date);
        let icon = $('<img>')
            .attr("src", `https://openweathermap.org/img/wn/${forecastWeather[i].icon}@2x.png`);
        let temp = $('<p>')
            .text(`Temp: ${forecastWeather[i].temp}°F`);
        let wind = $('<p>')
            .text(`Wind: ${forecastWeather[i].wind} MPH`);
        let humi = $('<p>')
            .text(`Humidity: ${forecastWeather[i].humi}%`);

        currentCard.children(".card-header").append(date);
        currentCard.children(".card-body").append(icon)
            .append(temp)
            .append(wind)
            .append(humi);
    }
}
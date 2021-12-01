// weather dashboard js logic

const cityFormEl = $("#target");
const cityInputEl = $("#city-input");
const citySubmitEl = $("#city-submit");
const searchHistoryEl = $("#search-history");

const APIKEY = "222033ee7e3cef36d8116bb25da24eea";
let queryURL = ``;
let currentCity = {
    lat: 0,
    lon: 0,
    name: "EnglandIsMyCity",
    dt: "0000000000",
    icon: "aaa",
    temp: 0,
    wind: 0,
    humidity: 0,
    uvi: 0,
};
let currentCityLat = ``;
let currentCityLon = ``;
let currentCityName = ``;

let searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
// dynamically add all highscores from storage + the new highscore to the screen
for (var i = 0; i < searchHistory.length; i++) {
    var searchHistoryItem = $('<li>')
        .text(searchHistory[i])
        .addClass('list-group-item-secondary text-center');
    searchHistoryEl.append(searchHistoryItem);
}

// listen for a user clicking on a lock
cityFormEl.submit((event) => {
    let userCity = '';
    event.preventDefault();
    if ($(cityInputEl).val() !== '') {
        userCity = $(cityInputEl).val();
        storeSearchHistory(userCity);
        queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${userCity}&units=imperial&appid=${APIKEY}`;
        pullCityWeatherData();
    };
});

const pullCityWeatherData = () => {

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
                currentCity.dt = res.data.current.dt;
                currentCity.uvi = res.data.current.uvi;
                currentCity.temp = res.data.current.temp;
                currentCity.wind = res.data.current.wind_speed;
                currentCity.humidity = res.data.current.humidity;
                currentCity.icon = res.data.current.weather[0].icon;
                
                loadCurrentWeather();
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
        var icon = $('<img>')
            .attr("src", `http://openweathermap.org/img/wn/${currentCity.icon}@2x.png`);
        $("#right-div").append(icon);
}

// // if there is no stored data for a user,
// if (userSettings.length === 0) {
//     // then load localStorage with a default array of placeholder data
//     for (let i = 0; i < workingHours.length; i++) {
//         userSettings[i] = {
//             id: i,
//             text: ''
//         };
//     }
//     // and save that default array to localStorage
//     localStorage.setItem("userSettings", JSON.stringify(userSettings));
//     userSettings = JSON.parse(localStorage.getItem("userSettings"));
// } else {
//     // there are existing settings, so store them
//     userSettings = JSON.parse(localStorage.getItem("userSettings"));
//     // and display them in the textarea for each card
//     for (let i = 0; i < userSettings.length; i++) {
//         $(`[data-id=${userSettings[i].id}]`).children('.card-body').children('textarea').val(userSettings[i].text);
//     }
// }
// weather dashboard js logic

const APIKEY = "222033ee7e3cef36d8116bb25da24eea";

var queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=33.1137&lon=-94.1644&units=imperial&appid=${APIKEY}`;

fetch(queryURL).then(response =>
    response.json().then(data => ({
        data: data,
        status: response.status
    })).then(res => {
        if (res.status === 200) {
            console.log(`Status: ${res.status} OK`);
            console.log(res.data);

            console.log("City:");
            console.log("Atlanta");
            console.log(" ");

            // grab the required data from the response object
            console.log("Temp:");
            console.log(res.data.current.temp + " Degrees F");
            console.log(" ");

            console.log("Wind Speed:");
            console.log(res.data.current.wind_speed + " Miles per Hour");
            console.log(" ");

            console.log("Humidity:");
            console.log(res.data.current.humidity + "%");
            console.log(" ");

            console.log("UV Index:");
            console.log(res.data.current.uvi);
        } else {
            console.log(`Status: ${res.status}`);
        }
    }));
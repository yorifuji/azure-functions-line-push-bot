
function _make_url(api_key, lon, lat)
{
    var qs = require("querystring");
    var yahoo_weather_api_url = "http://weather.olp.yahooapis.jp/v1/place?"
    var params = {
        "output"      : "json",
        "past"        : "1",
        "interval"    : "5",
        "coordinates" : lon + "," + lat,
        "appid"       : api_key
    };
    return yahoo_weather_api_url + qs.stringify(params);
}

function _get_weather_data(api_key, lon, lat) {
    return new Promise((resolve, reject) => {
        var http = require("http");
        http.get(_make_url(api_key, lon, lat), res => {
            var body = '';
            res.on('data', chunk => {
                body += chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(body));
            });
        }).on('error', e => {
            reject(new Error(e));
        });
    });
}

function _get_rainfall_data(data) {
    return data.Feature[0].Property.WeatherList.Weather;
}

function _get_latest_observation(data)
{
    var o = data.filter(e => e["Type"] == "observation");
    return o[o.length - 1];
}

// 0: nothing changed, 1: going to rainfall, 2: stop rainfall
function _get_rainfall_status(data) {
    var w_o = data.filter(e => e["Type"] == "observation");
    var w1 = w_o[w_o.length - 1]["Rainfall"];
    var w2 = w_o[w_o.length - 2]["Rainfall"];
    var w3 = w_o[w_o.length - 3]["Rainfall"];
    return (w1 && w2 && !w3) ? 1 : 0;
}

function _make_rainfall_message(data)
{
    if (_get_rainfall_status(data) == 0) return [];

    var weather = data.filter(data => data["Type"] == "observation");
    weather = weather[weather.length - 1];

    if (weather["Rainfall"]) {
        return [
            {
                "type" : "text",
                "text" : ["雨が降り始めました(" + weather["Rainfall"] + "mm/h)", "yjweather://Yahoo!天気を開く"].join("\n")
            }
        ];
    }
    else {
        return [
            {
                "type" : "text",
                "text" : "雨が止みました"
            }
        ];
    }
}

function _make_readable_date(date)
{
    return parseInt(date.slice(8, 10)) + ":" + date.slice(10, 12);
}

/*
  exports
*/
var yahoo_rainfall = function() {
}
yahoo_rainfall.get_weather_data      = _get_weather_data;
yahoo_rainfall.get_rainfall_data     = _get_rainfall_data;
yahoo_rainfall.get_latest_observation = _get_latest_observation;
yahoo_rainfall.get_rainfall_status   = _get_rainfall_status;
yahoo_rainfall.make_rainfall_message = _make_rainfall_message;

module.exports = yahoo_rainfall;

/*
  test code
*/

if (require.main === module) {

    var lon = process.env.lon ? process.env.lon : "139.753945";
    var lat = process.env.lat ? process.env.lat : "35.683801";
    var api_key = process.env.YAHOO_APP_ID;

    var context = {
        log : console.log,
        done: () => {}
    };

    var yr = require("./yahoo_rainfall.js");

    yr.get_weather_data(api_key, lon, lat)
        .then(yr.get_rainfall_data)
        .then(yr.make_rainfall_message)
        .then(console.log)
        .catch(console.log);

    Promise.resolve(_test_data_rainfall_begin())
        .then(yr.make_rainfall_message)
        .then(console.log)
        .catch(console.log)
    Promise.resolve(_test_data_rainfall_end())
        .then(yr.make_rainfall_message)
        .then(console.log)
        .catch(console.log)
    Promise.resolve(_test_data_rainfall_none_1())
        .then(yr.make_rainfall_message)
        .then(console.log)
        .catch(console.log)
    Promise.resolve(_test_data_rainfall_none_2())
        .then(yr.make_rainfall_message)
        .then(console.log)
        .catch(console.log)
}

function _test_data_rainfall_begin()
{
    return [
        { Type: 'observation', Date: '201610090040', Rainfall: 0 },
        { Type: 'observation', Date: '201610090045', Rainfall: 0 },
        { Type: 'observation', Date: '201610090050', Rainfall: 0 },
        { Type: 'observation', Date: '201610090055', Rainfall: 1 },
        { Type: 'observation', Date: '201610090100', Rainfall: 1 },
        { Type: 'forecast', Date: '201610090105', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090110', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090115', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090120', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090125', Rainfall: 0 }
    ]
}

function _test_data_rainfall_end()
{
    return [
        { Type: 'observation', Date: '201610090040', Rainfall: 1 },
        { Type: 'observation', Date: '201610090045', Rainfall: 1 },
        { Type: 'observation', Date: '201610090050', Rainfall: 1 },
        { Type: 'observation', Date: '201610090055', Rainfall: 0 },
        { Type: 'observation', Date: '201610090100', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090105', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090110', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090115', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090120', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090125', Rainfall: 0 }
    ]
}

function _test_data_rainfall_none_1()
{
    return [
        { Type: 'observation', Date: '201610090040', Rainfall: 0 },
        { Type: 'observation', Date: '201610090045', Rainfall: 0 },
        { Type: 'observation', Date: '201610090050', Rainfall: 0 },
        { Type: 'observation', Date: '201610090055', Rainfall: 0 },
        { Type: 'observation', Date: '201610090100', Rainfall: 1 },
        { Type: 'forecast', Date: '201610090105', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090110', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090115', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090120', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090125', Rainfall: 0 }
    ]
}

function _test_data_rainfall_none_2()
{
    return [
        { Type: 'observation', Date: '201610090040', Rainfall: 1 },
        { Type: 'observation', Date: '201610090045', Rainfall: 1 },
        { Type: 'observation', Date: '201610090050', Rainfall: 1 },
        { Type: 'observation', Date: '201610090055', Rainfall: 1 },
        { Type: 'observation', Date: '201610090100', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090105', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090110', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090115', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090120', Rainfall: 0 },
        { Type: 'forecast', Date: '201610090125', Rainfall: 0 }
    ]
}

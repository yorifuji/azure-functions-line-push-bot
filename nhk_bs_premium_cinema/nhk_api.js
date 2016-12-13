
/*
  NHK API
*/

function _get_program_genre(query) {

    const http = require("http");

    const area    = query.area;
    const service = query.service;
    const genre   = query.genre;
    const date    = query.date;

    const apikey  = process.env.NHK_API_KEY;
    
    const url = `http://api.nhk.or.jp/v2/pg/genre/${area}/${service}/${genre}/${date}.json?key=${apikey}`
    
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            var body = '';
            res.on('data', chunk => {
                body += chunk.toString();
            });
            res.on('end', () => {
                resolve(JSON.parse(body))
            });
            res.on('error', err => {
                reject(new Error(err));
            });
        }).on('error', err => {
            reject(new Error(err));
        });
    });
}

function _today_str() {
    var d = new Date();
    d.setTime(d.getTime() + 1000 * 60 * 60 * 9); // UTC --> JST

    var year  = d.getFullYear();
    var month = d.getMonth() + 1;
    var date  = d.getDate();

    if (month < 10) month = '0' + month;
    if (date  < 10) date  = '0' + date;

    return `${year}-${month}-${date}`
}

function _tommorow_str()
{
    var d = new Date();
    d.setTime(d.getTime() + 2 * 1000 * 60 * 60 * 9); // UTC --> JST

    var year  = d.getFullYear();
    var month = d.getMonth() + 1;
    var date  = d.getDate();

    if (month < 10) month = '0' + month;
    if (date  < 10) date  = '0' + date;

    return `${year}-${month}-${date}`
}

/*
  exports
*/

var nhk_api = function() {
}
nhk_api.get_program_genre = _get_program_genre;
nhk_api.today_str         = _today_str;
nhk_api.tommorow_str      = _tommorow_str;
module.exports = nhk_api;

/*
  test code
*/

if (require.main === module) {

    var nhk = require("./nhk_api.js");
    let query = 
          {
              "area"    : "140",
              "service" : "s3",
	      "genre"   : "0600",
	      "date"    : nhk.today_str()
          };

    nhk.get_program_genre(query)
        .then(program => {
	    console.log(program.list);
        })
	.catch(err => {
	    console.log(err);
	})

    query = 
        {
            "area"    : "140",
            "service" : "s3",
	    "genre"   : "0600",
	    "date"    : nhk.tommorow_str()
        };
    
    nhk.get_program_genre(query)
        .then(program => {
	    console.log(program.list);
        })
	.catch(err => {
	    console.log(err);
	})
}

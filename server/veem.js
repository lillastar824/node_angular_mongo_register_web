var request = require('request');
//to get client and secret
//https://developer.veem.com/page/dev-dashboard-sandbox?portalLocation=%2FDashboard%2FApp%2FDetails%3FappId%3D600459 
var clientID = process.env.VEEM_CLIENTID || 'Atregistrar2-5Vq2RE2qR0';
var secretID = process.env.VEEM_SECRETID || '43ac588d-8890-460b-9b84-53c66fafedd1';
var credentials = clientID + ':' + secretID;
const veemURL = process.env.VEEM_URL || 'https://sandbox-api.veem.com/';
const encode = require('nodejs-base64-encode');

// console.log();
// let buff = new Buffer(credentials);
let base64data = encode.encode(credentials, 'base64');
console.log(base64data)
var headers = {
    'Authorization': 'Basic ' + base64data,
    'Accept': 'application/json'
};

var dataString = 'grant_type=client_credentials&scope=all';

var options = {
    url: veemURL + 'oauth/token',
    method: 'POST',
    headers: headers,
    body: dataString
};

function callback(error, response, body) {
    console.log(error)
    console.log(response.statusCode)
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

/*** send payment
// request(options, callback);
var request = require("request");
var data = {
    "notes": "Delivery Bill",
    "payee": {
      "type":"Business",
      "firstName":"Joe",
      "lastName":"Doe",
      "businessName": "ABC Co",
      "countryCode": "US",
      "email": "khannawise+1@gmail.com",
      "phone": "16139987705"
    },
    "payeeAmount": {
      "currency": "USD",
      "number": "10"
    },
    "purposeOfPayment": "Goods"
  };
var options = { method: 'POST',
  url: veemURL+'veem/v1.1/payments',
  headers:
   {
     'x-request-id': 11,//this should be unique
     authorization: 'Bearer f9b09dfa-89e5-4bee-9258-d5a886d6b898',
     'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(data)
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
*/
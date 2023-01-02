const axios = require('axios'); 
const ritekitApiUrl = "https://api.ritekit.com/v1/stats/basic/";


exports.handler = async (event, context, callback) => {

    const coinSymbol = event.queryStringParameters.coin || 'BTC';

    const url = ritekitApiUrl + coinSymbol;

    var config = {
        method: 'get',
        url: url,
    };

    let data = 'Initial data';

    const response = await axios(config).then(function (response) {
        data = response.data;
    });

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    }
  
}
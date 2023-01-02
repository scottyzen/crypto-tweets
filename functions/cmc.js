const axios = require('axios'); 
const myKey = process.env.CMC_API_KEY 


exports.handler = async (event, context, callback) => {

    const limit = event.queryStringParameters.limit || 10;

    var config = {
        method: 'get',
        url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=' + limit,
        headers: { 'X-CMC_PRO_API_KEY': myKey }
    };

    let data = 'Initial data';

    const response = await axios(config)
        .then(function (response) {
            data = response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
    
    

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    }
  
}

// var currentValue = document.querySelector('#curent-value')
// var btcButton = document.getElementById('#')


var requestUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin';
var btcHistoryUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily';

function getApi(requestUrl) {
    fetch(requestUrl)
    .then(function(requestUrl) {
        return requestUrl.json();
    }).then(function(data) {
        btcHistoryPrice(btcHistoryUrl, data) 
        return console.log(data);
             
    })
} 

getApi(requestUrl)
    
// I need to fetch current value, the start price and the end price for the day.
// run through a for loop for one month
// create an empty array of objects. 
// Each itteration create a pricepoint, high and low. Then pass this to Phoenix's function. 

function btcHistoryPrice(btcHistoryUrl, currentPrice) {
    fetch(btcHistoryUrl)
    .then(function(btcHistoryUrl) {
        return btcHistoryUrl.json();
    }).then(function(data) {
        let arr = [];
             
        for (var i = 0; i < data.prices.length; i++) {
            if(i < data.prices.length - 1) {
                let date = moment(data.prices[i][0]).format("L");
                let nextDay = i+1;
                let coinData = {
                    Day: date, 
                    StartDay: data.prices[i][1], 
                    EndDay: data.prices[nextDay][1]
                }

                arr.push(coinData)
            }
        }
        console.log(arr)
        console.log(currentPrice.market_data.current_price.usd)
        return arr;
    })
}





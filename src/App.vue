<template>
  <header class="container mb-4">
    <h1 class="font-semibold mb-2 text-3xl underline">Crypto Tweets</h1>
    <div class="flex gap-8">
      <h2
        class="flex-1 h-6 text-lg mb-4 leading-tight items-end"
      >Quickly see how many people are tweeting about your favorite cryptocurrency</h2>
    </div>
  </header>
  <main class="container flex-1" v-if="coins">
    <div class="flex my-1 gap-4 items-end">
      <button class="mr-auto underline" @click="toggleOrderByRank">Rank</button>
      <button class="underline" @click="toggleOrderByTweets">Tweets</button>
      <button class="underline" @click="toggleOrderByRetweets">Retweets</button>
    </div>
    <ul class="divide-y grid gap-2">
      <li class="pt-1" v-for="(coin) in coins" :key="coin.id">
        <div class="flex gap-2 items-center">
          <h3 class="text-lg">
            <span>{{ coin.cmc_rank }}.</span>
            <strong class="mr-1">{{ coin.name }}</strong>
            <small class="text-xs text-gray-500">{{ coin.symbol }}</small>
          </h3>
          <i
            v-if="coin.tweets && coin.tweets.stats.color == 3 && coin.tweets.stats.retweets > 2000"
            class="text-xs text-red-500 fas fa-fire"
          ></i>
        </div>
        <div class="flex gap-2 justify-between items-center">
          <CoinPrice :coin="coin.quote.USD" class="flex-1" />
          <div class="flex gap-1 items-center">
            <i class="text-blue-500 fab fa-twitter"></i>
            <span v-if="coin.tweets">{{ coin.tweets.stats.tweets }}</span>
            <LoadingIcon v-else />
          </div>
          <div class="flex text-right w-16 gap-1 items-center justify-end">
            <i class="text-green-500 fas fa-retweet inline-block"></i>
            <span v-if="coin.tweets">{{ coin.tweets.stats.retweets }}</span>
            <LoadingIcon v-else />
          </div>
        </div>
      </li>
    </ul>

    <div class="flex my-8 gap-2 justify-end items-center">
      <span>Number of Coins:</span>
      <select class="border border-gray-500 p-1" v-model="numberOfCoins">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>

    <!-- <pre>{{ coins }}</pre> -->
  </main>
  <MyFooter class="container" />
</template>

<script>

const coinmarketcapApiUrl = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
const ritekitApiUrl = "https://api.ritekit.com/v1/stats/basic/";
import LoadingIcon from "./components/LoadingIcon.vue";
import MyFooter from "./components/MyFooter.vue";
import CoinPrice from "./components/CoinPrice.vue";

export default {
  data() {
    return {
      coins: null,
      numberOfCoins: 20,
      bitcoinTweets: null,
      retweetOrder: null,
      tweetOrder: null,
      rankOrder: 'desc'
    };
  },
  components: {
    LoadingIcon,
    MyFooter,
    CoinPrice
  },
  watch: {
    numberOfCoins(newValue) {
      this.coins = null;
      this.getCoins();
    },
  },
  mounted() {
    this.getCoins();
  },
  methods: {
    async getCoins() {
      const res = await fetch(coinmarketcapApiUrl, {
        method: "GET",
        headers: {
          "X-CMC_PRO_API_KEY": import.meta.env.VITE_KEY,
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }).then(res => res.json());

      this.coins = res.data.slice(0, this.numberOfCoins);

      this.bitcoinTweets = await fetch(ritekitApiUrl + "bitcoin").then(res => res.json());

      // loop through coins and get their tweets and add to coins
      this.coins.forEach(async (coin) => {
        coin.tweets = await fetch(ritekitApiUrl + coin.symbol).then(res => res.json());
      });

    },
    toggleOrderByRank() {
      const order = this.rankOrder === "desc" ? "asc" : "desc";
      this.coins.sort((a, b) => {
        return order === "desc" ? a.cmc_rank - b.cmc_rank : b.cmc_rank - a.cmc_rank;
      });
      this.rankOrder = order;
      this.tweetOrder = null;
      this.retweetOrder = null;
    },
    toggleOrderByRetweets() {
      const order = this.retweetOrder === "desc" ? "asc" : "desc";
      this.coins.sort((a, b) => {
        if (a.tweets && b.tweets) {
          return order === "desc" ? b.tweets.stats.retweets - a.tweets.stats.retweets : a.tweets.stats.retweets - b.tweets.stats.retweets;
        }
        return 0;
      });
      this.retweetOrder = order;
      this.tweetOrder = null;
      this.rankOrder = null;
    },
    toggleOrderByTweets() {
      const order = this.tweetOrder === "desc" ? "asc" : "desc";
      this.coins.sort((a, b) => {
        if (a.tweets && b.tweets) {
          return order === "desc" ? b.tweets.stats.tweets - a.tweets.stats.tweets : a.tweets.stats.tweets - b.tweets.stats.tweets;
        }
        return 0;
      });
      this.tweetOrder = order;
      this.retweetOrder = null;
      this.rankOrder = null;
    }
  }
}

</script>

<style>
#app {
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.container {
  margin-inline: auto;
}
.scale-enter-active,
.scale-leave-active {
  transition: opacity 0.5s;
}
.scale-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

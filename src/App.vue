<template>
  <header class="container mb-4">
    <h1 class="mb-2 text-3xl font-semibold underline">Crypto Tweets</h1>
    <div class="flex gap-8">
      <h2 class="items-end flex-1 h-6 mb-4 text-lg leading-tight">Quickly see how many people are tweeting about your favorite cryptocurrency</h2>
    </div>
  </header>
  <main class="container flex-1" v-if="coins">
    <div class="flex items-end gap-4 my-1">
      <button class="mr-auto underline" @click="toggleOrderByRank">Rank</button>
      <button class="underline" @click="toggleOrderByTweets">Tweets</button>
      <button class="underline" @click="toggleOrderByRetweets">Retweets</button>
    </div>
    <ul class="grid gap-2 divide-y">
      <li class="pt-1" v-for="(coin) in coins" :key="coin.id">
        <div class="flex items-center gap-2">
          <h3 class="text-lg">
            <span>{{ coin.cmc_rank }}.</span>
            <strong class="mr-1">{{ coin.name }}</strong>
            <small class="text-xs text-gray-500">{{ coin.symbol }}</small>
          </h3>
          <i v-if="coin.tweets && coin.tweets.stats.color == 3 && coin.tweets.stats.retweets > 2000" class="text-xs text-red-500 fas fa-fire"></i>
        </div>
        <div class="flex items-center justify-between gap-2">
          <CoinPrice :coin="coin.quote.USD" class="flex-1" />
          <div class="flex items-center gap-1">
            <i class="text-blue-500 fab fa-twitter"></i>
            <span v-if="coin.tweets">{{ coin.tweets.stats.tweets }}</span>
            <LoadingIcon v-else />
          </div>
          <div class="flex items-center justify-end w-16 gap-1 text-right">
            <i class="inline-block text-green-500 fas fa-retweet"></i>
            <span v-if="coin.tweets">{{ coin.tweets.stats.retweets }}</span>
            <LoadingIcon v-else />
          </div>
        </div>
      </li>
    </ul>

    <div class="flex items-center justify-end gap-2 my-8">
      <span>Number of Coins:</span>
      <select class="p-1 border border-gray-500" v-model="numberOfCoins">
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

const coinmarketcapApiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest`
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

      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info";
      const qString = "?CMC_PRO_API_KEY=" + import.meta.env.VITE_KEY + "&start=1&limit=5&convert=USD";

      const res = await fetch(url + qString, { mode: "no-cors" })
        .then(res => res.json())
        .catch(err => console.log(err));

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

.scale-enter,
.fade-leave-to

/* .fade-leave-active below version 2.1.8 */
  {
  opacity: 0;
}
</style>

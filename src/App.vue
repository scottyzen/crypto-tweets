<template>
  <header class="container mb-4">
    <h1 class="mb-2 text-3xl font-semibold underline">Crypto Tweets</h1>
    <div class="flex gap-8">
      <h2 class="items-end flex-1 h-6 mb-8 leading-tight md:text-lg">Quickly see how many people are tweeting about your favorite cryptocurrency</h2>
    </div>
  </header>
  <main class="container flex-1" v-if="coins">
    <div class="flex items-end gap-4 my-1 text-sm md:gap-6 lg:text-base">
      <button class="mr-auto underline" @click="toggleOrderByRank">Rank</button>
      <button class="underline" @click="toggleOrderByExposure">Exposure</button>
      <button class="underline" @click="toggleOrderByTweets">Tweets</button>
      <button class="underline" @click="toggleOrderByRetweets">Retweets</button>
    </div>
    <ul class="grid gap-2 divide-y">
      <li class="pt-1" v-for="(coin) in coins" :key="coin.id">
        <div class="flex items-center gap-4">
          <h3 class="md:text-lg">
            <span>{{ coin.cmc_rank }}.</span>
            <strong class="mr-1">{{ coin.name }}</strong>
            <small class="text-xs text-gray-500">{{ coin.symbol }}</small>
          </h3>
          <i v-if="coin.tweets && coin.tweets.stats.color == 3 && coin.tweets.stats.retweets > 2000" class="text-xs text-red-500 fas fa-fire"></i>
        </div>
        <div class="flex items-center justify-between gap-4 text-sm md:text-base tabular-nums">
          <CoinPrice :coin="coin.quote.USD" class="flex-1" />

          <div class="flex items-center w-20 gap-1">
            <i class="fas fa-eye"></i>
            <span v-if="coin.tweets">{{ coin.tweets.stats.exposure }}</span>
            <LoadingIcon v-else />
          </div>

          <div class="flex items-center w-10">
            <i class="text-blue-500 fab fa-twitter"></i>
            <span v-if="coin.tweets">{{ coin.tweets.stats.tweets }}</span>
            <LoadingIcon v-else />
          </div>

          <div class="flex items-center justify-end gap-1 text-right md:w-20">
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
import LoadingIcon from "./components/LoadingIcon.vue";
import MyFooter from "./components/MyFooter.vue";
import CoinPrice from "./components/CoinPrice.vue";
import axios from "axios";

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
      this.coins = [];
      this.getCoins();
    },
  },
  mounted() {
    this.getCoins();
  },
  methods: {
    async getCoins() {


      const url = `/.netlify/functions/cmc?limit=${this.numberOfCoins}`;
      const res = await axios.get(url);

      this.coins = res.data.data || [];


      // loop through coins and get their tweets and add to coins
      this.coins.forEach(async (coin) => {
        const stats = await axios.get(`/.netlify/functions/ritekit?coin=${coin.symbol}`);
        coin.tweets = stats.data;
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
    },
    toggleOrderByExposure() {
      const order = this.exposureOrder === "desc" ? "asc" : "desc";
      this.coins.sort((a, b) => {
        if (a.tweets && b.tweets) {
          return order === "desc" ? b.tweets.stats.exposure - a.tweets.stats.exposure : a.tweets.stats.exposure - b.tweets.stats.exposure;
        }
        return 0;
      });
      this.exposureOrder = order;
      this.tweetOrder = null;
      this.retweetOrder = null;
      this.rankOrder = null;
    },
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

<template>
  <header class="container mt-8 text-center text-slate-700">
    <h1 class="mb-2 text-3xl font-semibold lg:text-4xl">Crypto Tweets</h1>
    <h2 class="items-end flex-1 h-6 mb-4 leading-tight md:text-lg">
      Quickly see how many people are tweeting about your favorite cryptocurrency
    </h2>
  </header>
  <main class="container flex-1 text-slate-700" v-if="coins">
    <div class="relative my-8 overflow-auto border-b rounded shadow bg-slate-100 border-b-slate-300">
      <table class="w-full text-sm text-left border-collapse table-auto">
        <thead>
          <tr>
            <th
              class="p-4 pl-8 font-medium text-left border-b cursor-pointer text-slate-600"
              @click="toggleOrderByRank">
              Coin Rank
            </th>
            <th class="p-4 font-medium text-right border-b cursor-pointer text-slate-600" @click="toggleOrderByTweets">
              <i class="inline-block text-blue-500 fab fa-twitter"></i> <span>Tweets</span>
            </th>
            <th
              class="p-4 font-medium text-right border-b cursor-pointer text-slate-600"
              @click="toggleOrderByRetweets">
              <i class="inline-block text-green-500 fas fa-retweet"></i> <span>Retweets</span>
            </th>
            <th
              class="p-4 pr-8 font-medium text-right border-b cursor-pointer text-slate-600"
              @click="toggleOrderByExposure">
              <i class="fas fa-eye"></i> <span>Exposure</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="coin in coins" :key="coin.id">
            <td class="px-4 py-2 pl-8 border-b border-slate-100">
              <div class="grid">
                <h3 class="md:text-lg">
                  <span>{{ coin.cmc_rank }}.</span>
                  <a
                    class="mr-1 font-semibold"
                    :href="`https://coinmarketcap.com/currencies/${coin.slug}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ coin.name }}</a
                  >
                  <small class="text-xs">{{ coin.symbol }}</small>
                  <i
                    v-if="coin.tweets && coin.tweets.stats.color == 3 && coin.tweets.stats.retweets > 2000"
                    class="ml-1 text-xs text-red-500 fas fa-fire"></i>
                </h3>
                <CoinPrice :coin="coin.quote.USD" class="flex-1" />
              </div>
            </td>
            <td class="px-4 py-2 text-right border-b border-slate-100 text-slate-700">
              <span v-if="coin.tweets">{{ readableNumber(coin.tweets.stats.tweets) }}</span>
              <LoadingIcon class="m-auto" v-else />
            </td>
            <td class="px-4 py-2 text-right border-b border-slate-100 text-slate-700">
              <span v-if="coin.tweets">{{ readableNumber(coin.tweets.stats.retweets) }}</span>
              <LoadingIcon class="m-auto" v-else />
            </td>
            <td class="px-4 py-2 pr-8 text-right border-b border-slate-100 text-slate-700">
              <span v-if="coin.tweets">{{ readableNumber(coin.tweets.stats.exposure) }}</span>
              <LoadingIcon class="m-auto" v-else />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
import LoadingIcon from './components/LoadingIcon.vue';
import MyFooter from './components/MyFooter.vue';
import CoinPrice from './components/CoinPrice.vue';
import axios from 'axios';

export default {
  data() {
    return {
      coins: null,
      numberOfCoins: 20,
      bitcoinTweets: null,
      retweetOrder: null,
      tweetOrder: null,
      rankOrder: 'desc',
    };
  },
  components: {
    LoadingIcon,
    MyFooter,
    CoinPrice,
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
      console.log(res.data.data);

      this.coins = res.data.data || [];

      // const hashtagOverwites = [
      //   { hot: "holochain"},
      //   { gt: "gatetoken"},
      //   {

      //   }
      // ]

      // loop through coins and get their tweets and add to coins
      this.coins.forEach(async (coin) => {
        // const hashtag = coin.symbol;
        const hashtag = coin.name.toLowerCase().replace(/ /g, '');
        const stats = await axios.get(`/.netlify/functions/ritekit?coin=${hashtag}`);
        coin.tweets = stats.data;
      });
    },
    toggleOrderByRank() {
      const order = this.rankOrder === 'desc' ? 'asc' : 'desc';
      this.coins.sort((a, b) => {
        return order === 'desc' ? a.cmc_rank - b.cmc_rank : b.cmc_rank - a.cmc_rank;
      });
      this.rankOrder = order;
      this.tweetOrder = null;
      this.retweetOrder = null;
    },
    toggleOrderByRetweets() {
      const order = this.retweetOrder === 'desc' ? 'asc' : 'desc';
      this.coins.sort((a, b) => {
        if (a.tweets && b.tweets) {
          return order === 'desc'
            ? b.tweets.stats.retweets - a.tweets.stats.retweets
            : a.tweets.stats.retweets - b.tweets.stats.retweets;
        }
        return 0;
      });
      this.retweetOrder = order;
      this.tweetOrder = null;
      this.rankOrder = null;
    },
    toggleOrderByTweets() {
      const order = this.tweetOrder === 'desc' ? 'asc' : 'desc';
      this.coins.sort((a, b) => {
        if (a.tweets && b.tweets) {
          return order === 'desc'
            ? b.tweets.stats.tweets - a.tweets.stats.tweets
            : a.tweets.stats.tweets - b.tweets.stats.tweets;
        }
        return 0;
      });
      this.tweetOrder = order;
      this.retweetOrder = null;
      this.rankOrder = null;
    },
    toggleOrderByExposure() {
      const order = this.exposureOrder === 'desc' ? 'asc' : 'desc';
      this.coins.sort((a, b) => {
        if (a.tweets && b.tweets) {
          return order === 'desc'
            ? b.tweets.stats.exposure - a.tweets.stats.exposure
            : a.tweets.stats.exposure - b.tweets.stats.exposure;
        }
        return 0;
      });
      this.exposureOrder = order;
      this.tweetOrder = null;
      this.retweetOrder = null;
      this.rankOrder = null;
    },
    readableNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
  },
};
</script>

<style>
body {
  background-color: #f8fafc;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1024px;
  margin: 0 auto;
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

/* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

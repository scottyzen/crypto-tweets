<template>
    <div class="flex gap-1 items-center">
        <span>{{ formatedUSD }}</span>
        <span
            class="text-gray-500"
            :class="{
                'text-green-500': percentChange > 0,
                'text-red-500': percentChange < 0
            }"
        >({{ percentChange }}%)</span>
    </div>
</template>

<script>
export default {
    props: {
        coin: {
            type: Object,
            required: true
        }
    },
    computed: {
        formatedUSD() {
            return this.coin.price.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });
        },
        percentChange() {
            return this.coin.percent_change_1h.toFixed(2);
        }
    }
}
</script>

<style>
</style>
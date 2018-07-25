import './style.css';
import test from './test.vue'
import Vue from 'vue';

console.log('app.js loaded!');

new Vue({
    render: h => h(test)
}).$mount("#vue-mound");

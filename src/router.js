import Vue from 'vue';
import Router from 'vue-router';
import Buefy from 'buefy';

import Home from './views/Home.vue';

import 'buefy/dist/buefy.css';

Vue.use(Router, Buefy);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
  ],
});

import Vue from 'vue';
import Router from 'vue-router';
import VueCookies from 'vue-cookies';

import Home from './views/Home.vue';
import './assets/style.scss';

Vue.use(Router);
Vue.use(VueCookies);

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

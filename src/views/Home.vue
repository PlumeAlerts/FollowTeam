<template>
  <div class="content">
    <div class="columns">
      <div class="column"></div>
      <div class="column">
        <h1 class="title has-text-centered">Follow Team</h1>
        <div class="has-text-centered">Following all the channels in the <b>{{team}}</b></div>
        <br>
        <h2 class="title is-5 has-text-centered">
          {{message}}
        </h2>
        <div v-if="accessToken" class="field">
          <label class="checkbox">
            <input type="checkbox" id="checkbox" v-model="checked">
            Notifications
          </label>
        </div>
        <div class="field">
          <div class="control">
            <button v-if="accessToken" v-on:click="follow" :disabled="accessToken && message" class="button is-fullwidth" >
              Follow All
            </button>
            <button v-else v-on:click="login" class="button is-large is-fullwidth" >
              Login
            </button>
          </div>
        </div>
      </div>
      <div class="column"></div>
    </div>
  </div>
</template>

<script>
import TwitchClient from 'twitch';

let twitchClient;
export default {
  name: 'home',
  data() {
    let { team } = this.$route.query;
    const { hash } = this.$route;

    const vars = hash.substring(1, hash.length).split('&');
    const hashbang = {};
    vars.forEach((v) => {
      const tmp = v.split('=');
      if (tmp.length === 2) {
        const key = tmp[0];
        const value = tmp[1];
        hashbang[key] = value;
      }
    });
    const accessToken = hashbang.access_token;
    if (team === undefined) team = process.env.VUE_APP_DEFAULT_TEAM;
    return {
      team, accessToken, message: undefined, checked: false,
    };
  },
  methods: {
    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async follow() {
      if (this.message !== undefined) return;
      this.message = 'Following in progress';
      let team = [];
      await fetch(`https://api.twitch.tv/kraken/teams/${this.team}`, { headers: { 'Client-Id': process.env.VUE_APP_CLIENT_ID, accept: 'application/vnd.twitchtv.v5+json' } })
        .then(value => value.json().then((teamData) => {
          team = teamData.users;
        }))
        .catch(reason => console.log(reason));

      twitchClient = TwitchClient.withCredentials(process.env.VUE_APP_CLIENT_ID, this.accessToken);
      const tokenInfo = await twitchClient.getTokenInfo();
      const { userId } = tokenInfo;


      team.forEach(async (element) => {
        const id = element._id;
        if (id === userId) return;
        const followed = await twitchClient.users.getFollowedChannel(userId, id);
        if (followed == null) {
          await twitchClient.users.followChannel(userId, id, this.checked);
        }
        await this.sleep(500);
      });
      this.message = 'Following is complete';
    },
    login() {
      window.location.href = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${process.env.VUE_APP_CLIENT_ID}&redirect_uri=${process.env.VUE_APP_REDIRECT}&scope=user_follows_edit`;
    },
  },
};
</script>

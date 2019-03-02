<template>
  <div class="content">
    <div class="columns">
      <div class="column"></div>
      <div class="column">
        <h1 class="title has-text-centered">Follow Team</h1>
        <div class="has-text-centered">Following all the channels in the <b>{{teamName}}</b></div>
        <br>
        <h2 class="title is-5 has-text-centered">
          {{message}}
        </h2>
        <div v-if="accessToken">
          <div v-if="!message">
            <div v-if="loading">
              <h4>Loading channels...</h4>
            </div>
            <div v-else-if="teamList.length === 0">
              <h4>You are currently following all channels in this team.</h4>
            </div>
            <div v-else class="box" v-bind:key="item.id" v-for="item in teamList">
              <Channel :item="item"></Channel>
            </div>
          </div>
          <br>
          <br>
          <div class="field">
            <label class="checkbox">
              <input type="checkbox" id="checkbox" v-model="notifications">
              Notifications
            </label>
          </div>
          <div class="field">
            <div class="control">
              <button v-on:click="follow" :disabled="message"
                      class="button is-large is-fullwidth is-primary">
                Follow All
              </button>
            </div>
          </div>
        </div>
        <div v-else>
          <h4>Please login</h4>
          <button v-on:click="login" class="button is-large is-fullwidth is-link">
            Login
          </button>
        </div>
      </div>
      <div class="column"></div>
    </div>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>Created by lclc98</strong> source code available at <a
          href="https://github.com/PlumeAlerts/FollowTeam">here</a>.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import TwitchClient from 'twitch';
import Channel from './components/Channel.vue';

let twitchClient;
export default {
  name: 'home',
  components: { Channel },
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
    if (team === undefined) {
      if (this.$cookies.isKey('team')) {
        team = this.$cookies.get('team');
      } else {
        team = process.env.VUE_APP_DEFAULT_TEAM;
      }
    } else {
      this.$cookies.set('team', team, 60 * 10);
    }
    return {
      team,
      teamList: [],
      teamName: team,
      accessToken,
      message: undefined,
      notifications: true,
      loading: false,
    };
  },
  async mounted() {
    if (this.accessToken) {
      this.loading = true;
      let team = [];
      await fetch(`https://api.twitch.tv/kraken/teams/${this.team}`, {
        headers: {
          'Client-Id': process.env.VUE_APP_CLIENT_ID,
          accept: 'application/vnd.twitchtv.v5+json',
        },
      })
        .then(value => value.json().then((teamData) => {
          this.teamName = teamData.display_name;
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
          this.teamList.push(element);
        }
        await this.sleep(500);
      });
      this.loading = false;
    }
  },
  methods: {
    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async follow() {
      if (this.message !== undefined) return;
      this.message = 'Following in progress';

      twitchClient = TwitchClient.withCredentials(process.env.VUE_APP_CLIENT_ID, this.accessToken);
      const tokenInfo = await twitchClient.getTokenInfo();
      const { userId } = tokenInfo;

      this.teamList.forEach(async (element) => {
        const id = element._id;
        await twitchClient.users.followChannel(userId, id, this.notifications);
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

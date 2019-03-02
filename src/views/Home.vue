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
        <div v-if="!message">
          <div v-if="loading">
            Loading channels....
          </div>
          <div v-if="!loading && teamList.length === 0">
            You are currently following all channels in this team.
          </div>
          <div class="box" v-bind:key="item.id" v-for="item in teamList">
            <article class="media" style="border: 1px;">
              <figure class="media-left">
                <p class="image is-64x64">
                  <img :src="item.logo">
                </p>
              </figure>
              <div class="media-content">
                <div class="content">
                  <p>
                    <strong>{{item.display_name}}</strong>
                    <br>
                    {{item.status}}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
        <br>
        <br>
        <div v-if="accessToken" class="field">
          <label class="checkbox">
            <input type="checkbox" id="checkbox" v-model="checked">
            Notifications
          </label>
        </div>
        <div class="field">
          <div class="control">
            <button v-if="accessToken" v-on:click="follow" :disabled="accessToken && message"
                    class="button is-fullwidth is-primary">
              Follow All
            </button>
            <button v-else v-on:click="login" class="button is-large is-fullwidth is-link">
              Login
            </button>
          </div>
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
    if (team === undefined) {
      if (this.$cookies.isKey('team')) {
        team = this.$cookies.get('team');
      } else {
        team = process.env.VUE_APP_DEFAULT_TEAM;
      }
    } else {
      this.$cookies.set('team', team, 60 * 60);
    }
    return {
      team,
      accessToken,
      message: undefined,
      checked: true,
      teamList: [],
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
        await twitchClient.users.followChannel(userId, id, this.checked);
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

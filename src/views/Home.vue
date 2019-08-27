<template>
  <div class="section">
    <div class="columns is-centered">
      <div class="column is-one-third">
        <h1 class="title has-text-centered">Follow Team</h1>
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
            <div v-else>
              <h4 class="title is-4">You are currently not following the current users:</h4>
              <h4 class="subtitle is-4">Click to not follow the user</h4>
              <div class="columns is-centered">
                <div class="column is-two-thirds">
                  <template v-for="item in teamList" >
                    <Channel v-bind:key="item.id" :item="item"></Channel>
                  </template>
                </div>
              </div>
            </div>
          </div>
          <br>
          <br>
          <div class="field">
            <label class="checkbox">
              <input type="checkbox" id="checkbox" v-model="notifications">
              Receive notification from channel
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
    </div>
    <footer class="box">
      <div class="content has-text-centered">
        <strong>Created by lclc98</strong>
      </div>
      <div class="content has-text-centered">
        Source code available at <a href="https://github.com/PlumeAlerts/FollowTeam">here</a>.
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
    const team = process.env.VUE_APP_TEAM;
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
      const clientId = process.env.VUE_APP_CLIENT_ID;
      this.loading = true;
      twitchClient = await TwitchClient.withCredentials(clientId, this.accessToken);
      const teamData = await twitchClient.kraken.teams.getTeamByName('unitetv');
      const team = await teamData.getUsers();

      const tokenInfo = await twitchClient.getTokenInfo();
      const { userId } = tokenInfo;

      const users = await twitchClient.helix.users.getFollowsPaginated({ user: userId }).getAll();
      team.forEach(async (value) => {
        const { id } = value;
        if (id === userId) return;

        if (!users.some(e => e.followedUserId === id)) {
          const data = {
            userId: id,
            username: value.name,
            displayName: value.displayName,
            logo: value.logoUrl,
            follow: true,
          };
          this.teamList.push(data);
        }
      });
      this.loading = false;
    }
  },
  methods: {
    async follow() {
      if (this.message !== undefined) return;
      this.message = 'Following in progress';

      const tokenInfo = await twitchClient.getTokenInfo();
      const { userId } = tokenInfo;

      this.teamList.forEach(async (value) => {
        if (value.follow) {
          await twitchClient.kraken.users.followChannel(userId, value.id, this.notifications);
        }
      });
      this.message = 'Following is complete';
    },
    login() {
      window.location.href = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${process.env.VUE_APP_CLIENT_ID}&redirect_uri=${process.env.VUE_APP_REDIRECT}&scope=user_follows_edit`;
    },
  },
};
</script>

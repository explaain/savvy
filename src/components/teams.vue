<template>
  <div class="team">
    <header class="settings">
      <ibutton icon="envelope-o" text="Invite New User" :click="toggleNewUser"></ibutton>
      <!-- <button type="button" @click="showingJoinTeam = !showingJoinTeam">Invite Existing User To Join Team</button> -->
      <ibutton icon="refresh" text="Refresh" :click="getTeams"></ibutton>
      <form class="new-user" v-if="showingNewUser">
        <input type="text" v-model="newUserEmail" placeholder="Email Address">
        <ibutton icon="paper-plane" text="Invite" :click="inviteNewUser"></ibutton>
      </form>
      <!-- <form class="block join-team" v-if="showingJoinTeam"> -->
      <!-- search field for users --> <!-- <search v-if="showListSearch" @select="addListItem" :allCards="allCards" :setCard="setCard" :getUser="getUser"></search> -->
      <!-- search field for teams --> <!-- <search v-if="showListSearch" @select="addListItem" :allCards="allCards" :setCard="setCard" :getUser="getUser"></search> -->
      <!-- <button type="button" name="button" @click="">Go</button> -->
      <!-- </form> -->
    </header>
    <div class="team">
      <!-- <h1>List of Team Members</h1> -->
      <table v-for="team in teams">
        <thead>
          <tr>
            <td colspan="3">{{team.name}}</td>
          </tr>
        </thead>
        <tr v-for="user in teamUsers[team.id]">
          <td class="icon"><icon name="user-o"></icon></td>
          <td>{{user.name}}</td>
          <td>{{user.email}}</td>
        </tr>
      </table>
    </div>
  </div>

</template>

<script>
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import IconButton from './explorer/ibutton.vue'

  export default {
    name: 'Team',
    data () {
      return {
        teams: [],
        users: {},
        showingNewUser: false,
        showingJoinTeam: false,
        newUserEmail: ''
      }
    },
    components: {
      ibutton: IconButton,
      icon: Icon
    },
    computed: {
      teamUsers: function () { // This is created by inserting the relevant user from this.users into this.teams
        const self = this
        const teamUsers = {}
        self.teams.forEach(team => {
          teamUsers[team.id] = team.users.map(userID => {
            return self.users[userID]
          })
        })
        return teamUsers // Will this have trouble refreshing? i.e. deep watch
      }
    },

    created: function() {
      this.getTeams()
    },
    methods: {
      inviteNewUser: function() {
        // Use: this.newUserEmail
      },
      toggleNewUser: function() {
        this.showingNewUser = !this.showingNewUser
      },
      getTeams: function() {
        // Dummy Data
        this.teams = [
          {
            id: 'team1',
            name: 'Sales Team',
            users: [
              'userA',
              'userB',
              'userC'
            ]
          },
          {
            id: 'team2',
            name: 'Marketing Team',
            users: [
              'userD',
              'userB'
            ]
          },
        ]
        this.users = {
          userA: {
            name: 'Adam',
            email: 'adam@company.org'
          },
          userB: {
            name: 'Boris',
            email: 'boris@company.org'
          },
          userC: {
            name: 'Callum',
            email: 'callum@company.org'
          },
          userD: {
            name: 'Dom',
            email: 'dom@company.org'
          }
        }
      }
    }
  }
</script>

<style lang="scss">

  @import '../styles/main.scss';

  form.block {
    display: block;
    max-width: 600px;
    margin: auto;

    input {
      max-width: 350px;
    }
  }

</style>

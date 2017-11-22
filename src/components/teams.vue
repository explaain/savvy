<template>
  <div class="teams">
    <header class="teams-settings">
      <ibutton icon="envelope-o" text="Invite New User" :click="toggleNewUser"></ibutton>
      <!-- <button type="button" @click="showingJoinTeam = !showingJoinTeam">Invite Existing User To Join Team</button> -->
      <ibutton icon="refresh" text="Refresh" :click="getTeams"></ibutton>
      <form class="new-user" v-if="showingNewUser">
        <input type="text" v-model="newUser.email" placeholder="Email Address" class="email">
        <select name="cars">
          <option value="">Select Team</option>
          <option v-for="team in teams" value="team.id">{{team.name}}</option>
        </select>
        <input type="text" v-model="newUser.name.first" placeholder="First Name">
        <input type="text" v-model="newUser.name.last" placeholder="Last Name">
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
            <td colspan="4">{{team.name}}</td>
          </tr>
        </thead>
        <tr v-for="user in teamUsers[team.id]" :style="{ fontWeight: (user.role == 'manager' ? 'bold' : 'normal') }">
          <td class="icon"><icon :name="user.role === 'manager' ? 'graduation-cap' : 'user-o'"></icon></td>
          <td>{{user.name}}</td>
          <td>{{user.email}}</td>
          <td>{{user.role.replace('member', 'Member').replace('manager', 'Team Manager')}}</td>
        </tr>
      </table>
    </div>
  </div>

</template>

<script>
  import axios from 'axios'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import IconButton from './explorer/ibutton.vue'

  export default {
    name: 'Teams',
    props: [
      'organisation',
      'auth'
    ],
    data () {
      return {
        teams: [],
        users: {},
        showingNewUser: false,
        showingJoinTeam: false,
        newUser: {
          email: '',
          name: {
            first: '',
            last: ''
          }
        }
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
        self.users.forEach(user => {
          user.teams.forEach(team => {
            const teamUser = JSON.parse(JSON.stringify(user))
            teamUser.role = team.role
            teamUsers[team.team] ? (teamUser.role === 'manager' ? teamUsers[team.team].unshift(teamUser) : teamUsers[team.team].push(teamUser)) : teamUsers[team.team] = [teamUser]
          })
        })
        // self.teams.forEach(team => {
        //   teamUsers[team.id] = team.users.map(userID => {
        //     return self.users[userID]
        //   })
        // })
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
        const self = this
        axios.post('http://localhost:3000/api/user/getTeams', {
          organisationID: self.organisation.id,
          user: { uid: self.auth.user.uid, idToken: self.auth.user.auth.stsTokenManager.accessToken }
        }).then(res => {
          console.log(res)
        }).catch(e => {
          console.log(e)
        })
        // Dummy Data
        this.teams = [
          {
            id: 'team1',
            name: 'Sales Team',
          },
          {
            id: 'team2',
            name: 'Marketing Team',
          },
        ]
        this.users = [
          {
            name: 'Adam',
            email: 'adam@company.org',
            teams: [
              {
                team: 'team1',
                role: 'member'
              }
            ]
          },
          {
            name: 'Boris',
            email: 'boris@company.org',
            teams: [
              {
                team: 'team1',
                role: 'member'
              },
              {
                team: 'team2',
                role: 'manager'
              }
            ]
          },
          {
            name: 'Callum',
            email: 'callum@company.org',
            teams: [
              {
                team: 'team1',
                role: 'manager'
              }
            ]
          },
          {
            name: 'Dom',
            email: 'dom@company.org',
            teams: [
              {
                team: 'team2',
                role: 'member'
              }
            ]
          }
        ]
      }
    }
  }
</script>

<style lang="scss">

  @import '../styles/main.scss';

  form {
    display: block;
    max-width: 600px;
    margin: auto;

    input {
      width: 150px;

      &.email {
        width: 280px;
      }
    }
    select {
      width: 200px
    }
  }

</style>

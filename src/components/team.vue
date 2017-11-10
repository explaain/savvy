<template>
  <div class="team">
    <div class="settings">
      <button type="button" @click="showingNewUser = !showingNewUser">Invite New User to Organisation</button>
      <button type="button" @click="showingJoinTeam = !showingJoinTeam">Invite Existing User To Join Team</button>
    </div>
    <form class="new-user" v-if="showingNewUser">
      <input type="text" v-model="newUserEmail" placeholder="Email Address">
      <button type="button" name="button" @click="inviteNewUser">Go</button>
    </form>
    <form class="join-team" v-if="showingJoinTeam">
      <!-- search field for users --> <!-- <search v-if="showListSearch" @select="addListItem" :allCards="allCards" :setCard="setCard" :getUser="getUser"></search> -->
      <!-- search field for teams --> <!-- <search v-if="showListSearch" @select="addListItem" :allCards="allCards" :setCard="setCard" :getUser="getUser"></search> -->
      <button type="button" name="button">Go</button>
    </form>
    <div class="team">
      List of Team Members
      <table v-for="team in teams">
        <thead>
          <td>{{team.name}}</td>
        </thead>
        <tr v-for="user in teamUsers[team.id]">
          <td>{{user.name}}</td>
          <td>{{user.email}}</td>
        </tr>
      </table>
    </div>
  </div>

</template>

<script>
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
  methods: {
    inviteNewUser: function() {
      // Use: this.newUserEmail
    }
  },
  created: function() {
    // Dummy Data
    this.teams = [
      {
        id: 'team1',
        users: [
          'userA',
          'userB',
          'userC'
        ]
      },
      {
        id: 'team2',
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
</script>

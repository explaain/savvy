<template>
  <div class="Notifications">
    <h1>Cards Pending Your Approval</h1>
    <card v-for="card in cards" :pendingApproval="true" :data="card" :key="card.objectID" :full="false"></card>
  </div>
</template>

<script>
import Card from './explorer/card.vue'
import IconButton from './explorer/ibutton.vue'

export default {
  name: 'Notifications',
  data () {
    return {
      cards: [
        {
          content: {
            description: 'The company colours are: #7789ff and #33ff99'
          },
          objectID: '1'
        },
        {
          content: {
            description: 'The company address is Explaain Ltd, Geovation Hub, 1 Sekforde Street, London EC1R 0BE'
          },
          objectID: '2'
        }
      ]
    }
  },
  components: {
    card: Card,
    ibutton: IconButton
  },
}
</script>

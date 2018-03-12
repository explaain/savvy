<template lang="html">
  <div class="topics field" :class="topics && topics.state">
    <span v-for="topic in (displayTopics.length || editing ? displayTopics : ['general'])" @click="topicClicked">{{topic | capitalise('kebab')}}</span>
    <span v-if="editing" @click="add" class="add">+ <span v-if="!displayTopics.length">Add Topic</span> </span>
  </div>
</template>

<script>
export default {
  props: [
    'topics',
    'editing',
  ],
  data: function() {
    return {
      tempTopics: []
    }
  },
  computed: {
    displayTopics: function () {
      return this.editing ? this.tempTopics : ((this.topics && this.topics.value) || [])
    }
  },
  watch: {
    editing: function (val) {
      console.log(1)
      if (val)
        this.tempTopics = this.topics && this.topics.value ? JSON.parse(JSON.stringify(this.topics && this.topics.value)) : []
      else
        this.$emit('update', { field: 'topics', value: this.tempTopics })
    },
  },
  methods: {
    add: function () {
      const name = prompt('Enter your topic name:')
      const topic = name.toLowerCase().split(' ').join('-')
      if (this.editing && topic) {
        console.log('topic:', topic)
        this.tempTopics.push(topic)
      }
    },
    topicClicked: function (event) {
      console.log('topicClicked')
      console.log(event)
      if (this.editing) {
        const child = event.target
        const parent = child.parentNode
        console.log(parent)
        // The equivalent of parent.children.indexOf(child)
        const index = Array.prototype.indexOf.call(parent.children, child)
        this.tempTopics.splice(index, 1)
      }
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/main.scss';

.topics {
  padding: 10px;

  > p {
    display: inline-block;
  }
  > span {
    display: inline-block;
    margin: 5px;
    padding: 3px 10px;
    // border-radius: 5px;
    background: #eee;
    color: #999;

    &:hover {
      background: $savvy;
      color: white;
    }
  }
}
.editing .topics > span:hover:not(.add) {
  background: red;
}
div.card:not(.editing) .topics {
  &.pending::after, &.reverted::after {
    margin-left: 8px;
    text-align: left;
    // display: block;
    // font-size: 12px;
    // font-weight: normal;
    // font-style: italic;
  }
  &.pending, &.reverted {
    border-width: 0px;
  }
  &.pending {
    border-left-width: 4px;
  }
  &.reverted {
    border-left-width: 4px;
  }
}
</style>

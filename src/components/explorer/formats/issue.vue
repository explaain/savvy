<template lang="html">
  <div class="content" @click="linkClick">
    <field label="title" :content="content.title" :editing="editing" @update="update"></field>
    <field label="description" :content="content.description" :editing="editing" @update="update" :truncate="full"></field>
    <!-- <editable-markdown v-if="content.service === 'sifter'" :content="text" :editable="editing" @update="text = $event" :style="{'font-size': fontSize }" placeholder="Category"></editable-markdown> -->
    <ul v-if="content.integrationFields && content.integrationFields.value.status" class="status" :class="content.integrationFields.value.status && content.integrationFields.value.status.toLowerCase()">
      <li class="open">Open</li>
      <li class="resolved">Resolved</li>
      <li class="closed">Closed</li>
    </ul>
    <img v-if="full && content.attachments && content.attachments[0]" v-bind:src="content.attachments[0].url">
  </div>
</template>


<script>
import Field from './../field.vue'

export default {
  props: [
    'content',
    'full',
    'allCards',
    'position',
    'editing',
  ],
  components: {
    Field,
  },
  data: function() {
    return {
      tempListCards: {},
      showListSearch: false
    }
  },
  computed: {
    updating: function() {
      return this.content.updating || false
    },
    text: function() {
      const text = this.content.description || ''
      const snippetLength = 100
      const snippetStart = Math.max(text.indexOf('**') - (snippetLength / 2), 0)
      return this.full ? text : text.trunc(snippetStart, snippetLength, true)
    },
    fullText: function() {
      return (this.content.title ? this.content.title + '\n\n' : '') + this.text
    },
    fontSize: function() {
      return 16 + 'px'
    }
  },
  watch: {
    data: {
      handler: function(val) {
        if (!this.editing) this.syncData()
      },
      deep: true
    },
  },
  methods: {
    update: function(data) {
      console.log('update (basic)', data)
      this.$emit('update', data)
    },
    linkClick: function(event) {
      const self = this
      if (event.srcElement.nodeName === 'A') {
        event.stopPropagation()
        var myRegexp = /\[.*?\]\((.*?)\)/g
        var match = myRegexp.exec(self.text)
        const toLayerKeys = []
        while (match != null) {
          toLayerKeys.push(match[1].replace('#', ''))
          match = myRegexp.exec(self.text)
        }
        const data = {
          // type: 'link',
          toURI: event.srcElement.hash.replace('#', ''),
          fromPos: self.position,
          toLayerKeys: toLayerKeys
        }
        data.toPos = [ data.fromPos[0] + 1, data.toLayerKeys.indexOf(data.toURI) ]
        this.$emit('showCard', data)
      }
    }
  }
}

String.prototype.trunc = function(start, length, useWordBoundary) {
  if (this.length <= length) return this
  var subString = this.substr(start, length - 1)
  return (start > 0 ? '...' : '') + (useWordBoundary
    ? subString.substr(0, subString.lastIndexOf(' '))
    : subString) + '...'
}
</script>

<style lang="scss">
@import '../../../styles/main.scss';

.content {
  margin: 5px;
  margin-left: 50px;
  padding: 5px;
  min-height: 60px;

  label {
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    margin-left: 5px;
    margin-top: 20px;
    color: #999;
  }

  strong {
    font-weight: 800;
    font-style: normal;
    color: #888;
  }
  p {
    line-height: 1.5;
  }
  a {
    text-decoration: inherit;
    padding: 0 4px;
    border: 2px solid $explaainLink;
    background-color: $explaainLink;
    color: inherit;
    border-radius: 4px;

    &:hover {
      color: white;
      border: 2px solid $savvy;
      background-color: $savvy;

      strong {
        color: white;
      }
    }
  }
  img {
    max-width: calc(100% - 10px);
    border-radius: 5px;
  }
}

.status {
  display: block;
  height: 52px;
  min-width: 250px;
  box-sizing: border-box;
  padding: 0;
  list-style-type: none;
  font-size: 13px;
  clear: both;
  line-height: 1em;
  margin: 0 24px 0 5px;
  text-align: center;

  li {
    box-sizing: border-box;
    float: left;
    padding: 10px 0 10px 15px;
    background: #333;
    color: #fff;
    position: relative;
    width: 32%;
    margin: 10px 1px;

    &:before {
      content: '';
      border-left: 16px solid #fff;
      border-top: 16px solid transparent;
      border-bottom: 16px solid transparent;
      position: absolute;
      top: 0;
      left: 0;
    }
    &:after {
      content: '';
      border-left: 16px solid #333;
      border-top: 16px solid transparent;
      border-bottom: 16px solid transparent;
      position: absolute;
      top: 0;
      left: 100%;
      z-index: 20;
    }
    &.open, &.reopened {
      background: #888;
      &:after {
        border-left-color: #888;
      }
    }
    &.resolved {
      background: #999;
      &:after {
        border-left-color: #999;
      }
    }
    &.closed {
      background: #aaa;
      &:after {
        border-left-color: #aaa;
      }
    }
  }

  &.open li.open, &.reopened li.open {
    background: #EF9A3B;
    font-weight: bold;
    &:after {
      border-left-color: #EF9A3B;
    }
  }
  &.resolved li.resolved {
    background: #34BA9C;
    font-weight: bold;
    &:after {
      border-left-color: #34BA9C;
    }
  }
  &.closed li.closed {
    background: #409AD5;
    font-weight: bold;
    &:after {
      border-left-color: #409AD5;
    }
  }
}
</style>

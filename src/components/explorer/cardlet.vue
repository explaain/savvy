<template lang="html">
  <div class="cardlet" @click.stop="cardletClick" :class="{ 'show-more': card.objectID === 0 }">
    <ibutton v-if="editing" class="drag" icon="bars" text=""></ibutton>
    <ibutton v-if="editing" class="remove" icon="close" text="" :click="removeCardlet"></ibutton>
    <!-- <editable :content="card.description" :editable="editing && editable" @update="card.description = $event"></editable> -->
    <editable-markdown v-if="card.label" class="label" :content="card.label.replace(':', '')" :editable="editing && editable" @update="card.label = $event" :class="{ greyed: greyed }"></editable-markdown>
    <editable-markdown v-if="card.value" class="value" :content="card.value" :editable="editing && editable" @update="card.value = $event" :class="{ greyed: greyed }"></editable-markdown>
    <editable-markdown v-if="card.description" :content="text" :editable="editing && editable" @update="card.description = $event" :class="{ greyed: greyed }"></editable-markdown>
  </div>
</template>

<script>
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import IconButton from './ibutton.vue'
import Editable from './editable.vue'
import EditableMarkdown from './editable-markdown.vue'

export default {
  props: [
    'card',
    'editing',
    'editable'
  ],
  computed: {
    cardletEditable: function() {
      return this.editing && this.editable
    },
    text: {
      get: function() {
        const text = this.card.description || ''
        const snippetLength = 60
        const snippetStart = Math.max(text.indexOf('**') - (snippetLength / 2), 0)
        return this.full ? text : text.trunc(snippetStart, snippetLength, true)
      },
      set: function(val) {
        this.card.description = val
      }
    },
    greyed: function() {
      return this.text.indexOf('**') === -1
    }
  },
  components: {
    icon: Icon,
    ibutton: IconButton,
    editable: Editable,
    EditableMarkdown
  },
  methods: {
    removeCardlet: function() {
      const self = this
      self.$emit('remove', self.card)
    },
    cardletClick: function() {
      const self = this
      self.$emit('cardletClick', self.card)
    },
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
  @import '../../styles/main.scss';

  div.card .cardlet {
    margin: 0 8px -1px;
    min-height: unset;
    padding: 0;
    border-radius: 0;
    width: calc(100% - 20px);
    border: 1px solid #e4e4e4;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.05);
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.05);

    &.show-more {
      text-align: center;
      color: #aaa;
    }
    &:first-of-type {
      border-top-left-radius: $radiusLarge;
      border-top-right-radius: $radiusLarge;
    }
    &:last-of-type {
      border-bottom-left-radius: $radiusLarge;
      border-bottom-right-radius: $radiusLarge;
    }
    > .label, > .value {
      display: inline-block;
      margin: -2px 0 -1px;
      padding: 10px;
      display: table-cell;
      vertical-align: middle;
      line-break: loose;
      text-transform: none;
      font-size: 16px;
    }
    > .label {
      background: #f8f8f8;
      box-shadow: inset 0 1px 1px rgba(0,0,0,.05);
      -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.05);
      border-right: 1px solid #eee;
    }

    p {
      margin: 0;
      padding: 0;
    }
    button {
      padding: 3px 6px;
      margin: 8px -29px;
    }
  }
  .card:not(.editing) .cardlet:hover, .card .cardlet.non-editable:hover {
    background: #eee;
  }

  .drag {
    float: left;
  }
  .remove {
    float: right;
  }
  .greyed {
    // color: #999;
  }

</style>

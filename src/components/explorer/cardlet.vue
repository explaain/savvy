<template lang="html">
  <div class="cardlet" @click.stop="cardletClick">
    <ibutton v-if="editing" class="drag" icon="bars" text=""></ibutton>
    <ibutton v-if="editing" class="remove" icon="close" text="" :click="removeCardlet"></ibutton>
    <!-- <editable :content="card.content.description" :editable="editing && editable" @update="card.content.description = $event"></editable> -->
    <editable-markdown :content="text" :editable="editing && editable" @update="card.content.description = $event" :class="{ greyed: greyed }"></editable-markdown>
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
  data: function() {
    return {

    }
  },
  computed: {
    cardletEditable: function() {
      return this.editing && this.editable
    },
    text: {
      get: function() {
        const text = this.card.content.description || ''
        const snippetLength = 60
        const snippetStart = Math.max(text.indexOf('**') - (snippetLength / 2), 0)
        return this.full ? text : text.trunc(snippetStart, snippetLength, true)
      },
      set: function(val) {
        this.card.content.description = val
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
</script>

<style lang="scss">
  .cardlet {
    margin: 0 8px -1px;
    min-height: unset;
    padding: 8px 15px;
    border-radius: 0;
    width: calc(100% - 50px);
    border: 1px solid #e4e4e4;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.05);
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.05);

    p {
      margin: 0;
      padding: 0;
    }
  }
  .cardlet:first-of-type {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  .cardlet:last-of-type {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  .card:not(.editing) .cardlet:hover, .card .cardlet.non-editable:hover {
    background: #eee;
  }

  .cardlet button {
    padding: 3px 6px;
    margin: 8px -29px;
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

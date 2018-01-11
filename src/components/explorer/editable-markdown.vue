<template lang="html">
  <vue-markdown :class="{ editable: !(editable === false) }" :contenteditable="!(editable === false)" @input="update" :watches="['content']" :source="content" :linkify="false" :emoji="false"></vue-markdown>
</template>

<script type="text/javascript">
  import VueMarkdown from 'vue-markdown'
  export default {
    props: [
      'content',
      'editable'
    ],
    components: {
      VueMarkdown
    },
    mounted: function () {
      // this.$el.innerText = this.content
    },
    watch: {
      editable: function (val) {
        this.$el.innerText = this.content
      },
      content: function (val) {
        if (!this.editable) this.$el.innerText = this.content
      }
    },
    created: function() {

    },
    methods: {
      update: function(event) {
        this.$emit('update', event.target.innerText)
      }
    }
  }
</script>

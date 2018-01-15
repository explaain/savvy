<template lang="html">
  <vue-markdown :class="[{ editable: !(editable === false) }, myClass]" :contenteditable="!(editable === false)" @input="update" :watches="['myContent']" :source="myContent" :linkify="false" :emoji="false"></vue-markdown>
</template>

<script type="text/javascript">
  import VueMarkdown from 'vue-markdown'
  export default {
    props: [
      'content',
      'editable'
    ],
    data: function() {
      return {
        myContent: this.content,
        myClass: String(Math.floor(Math.random() * 10000000000))
      }
    },
    components: {
      VueMarkdown
    },
    watch: {
      editable: function (val) {
        const self = this
        const innerText = document.getElementsByClassName(self.myClass)[0].innerText
        console.log('innerText')
        console.log(innerText)
        if (!self.editable) {
          self.myContent = ''
          this.$emit('update', innerText)
          setTimeout(function() {
            self.myContent = self.content
          }, 1)
        }
      }
    },
    methods: {
      update: function(event) {
        console.log('update')
        this.$emit('update', event.target.innerText)
      }
    }
  }
</script>

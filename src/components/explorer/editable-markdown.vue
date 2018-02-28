<template lang="html">
  <component v-bind:is="component" :class="[{ editable: !(editable === false) }, myClass]" :contenteditable="!(editable === false)" :placeholder="placeholder" @input="update" :watches="['myContent']" :source="myContent" :linkify="false" :emoji="false"></component>
  <!-- <vue-markdown :class="[{ editable: !(editable === false) }, myClass]" :contenteditable="!(editable === false)" :placeholder="placeholder" @input="update" :watches="['myContent']" :source="myContent" :linkify="false" :emoji="false"></vue-markdown> -->
</template>

<script type="text/javascript">
  import VueMarkdown from 'vue-markdown'
  export default {
    props: [
      'content',
      'editable',
      'placeholder'
    ],
    data: function() {
      return {
        myContent: this.content,
        myClass: String(Math.floor(Math.random() * 10000000000))
      }
    },
    computed: {
      component: function() {
        const cv = this.editable ? 'div' : 'vue-markdown'
        return cv
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
      },
      content: function(val) {
        if (!this.editable)
          this.myContent = this.content
      }
    },
    methods: {
      update: function(event) {
        this.$emit('update', event.target.innerText)
      }
    }
  }
</script>

<style lang="scss">
  [contenteditable=true]:empty:before{
    content: attr(placeholder);
    display: block; /* For Firefox */
    color: #999;
  }
</style>

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
      'placeholder',
      'fieldName',
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
        // self.myClass = String(Math.floor(Math.random() * 10000000000))
        const innerText = document.getElementsByClassName(self.myClass)[0].innerText.replace(/^\s+|\s+$/g, '').trim() // Removes newlines and whitespaces from start/end of string
        // console.log('self.fieldName')
        // console.log(self.fieldName)
        // console.log('self.myClass')
        // console.log(self.myClass)
        // console.log('innerText')
        // console.log(innerText)
        // console.log('element')
        // console.log(document.getElementsByClassName(self.myClass)[0])
        // We need to use something like "this.$nextTick": https://vuejs.org/v2/guide/reactivity.html
        if (self.editable) {
          setTimeout(function () {
            document.getElementsByClassName(self.myClass)[0].innerText = innerText
          }, 1)
        } else {
          // self.myContent = ''
          // // this.$emit('update', innerText)
          // setTimeout(function() {
          //   self.myContent = self.content
          // }, 1)
        }
      },
      content: function(val) {
        if (!this.editable)
          this.myContent = this.content
      }
    },
    methods: {
      update: function(event) {
        const self = this
        const innerText = document.getElementsByClassName(self.myClass)[0].innerText.replace(/^\s+|\s+$/g, '').trim() // Removes newlines and whitespaces from start/end of string
        console.log('update (editable-markdown.vue)', innerText)
        this.$emit('update', { field: this.fieldName, value: innerText })
        // this.$emit('finishEdit', event.target.innerText)
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

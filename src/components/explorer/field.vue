<template lang="html">
  <keep-alive>
    <!-- The show conditions are split into v-if and v-show in order to keep the element alive when saving a new card - otherwise editing is never set to false in EditableMarkdown and the watch function is never triggered! -->
    <editable-markdown v-if="content || editing" v-show="content && content.value || editing" class="field" :fieldName="label" :class="[label, content && content.state]" :content="content | truncateValue(truncate)" :editable="editing" @update="update" :placeholder="label | capitalise"></editable-markdown>
  </keep-alive>
</template>

<script type="text/javascript">
  import EditableMarkdown from './editable-markdown'
  export default {
    props: [
      'content',
      'label',
      'editing',
      'truncate',
    ],
    components: {
      EditableMarkdown
    },
    filters: {
      truncateValue: function(prop, full) {
        if (!prop || !prop.value) return ''
        const text = prop.value
        const snippetLength = 100
        const snippetStart = Math.max(text.indexOf('**') - (snippetLength / 2), 0)
        return full ? text : text.trunc(snippetStart, snippetLength, true)
      },
    },
    methods: {
      update: function(data) {
        console.log('update (field.vue)')
        this.$emit('update', data)
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

<template>
  <div class="home">
    <h1>Welcome to Savvy!</h1>
    <h2>Click on the tabs in the sidebar to get started</h2>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {

    }
  }
}
</script>

<style lang="scss">
  @import "../styles/main.scss";

  .home {
    padding: 40px;
    text-align: center;

    h1 {
      font-size: 30px;
    }
    h2 {
      font-size: 22px;
    }
  }
</style>

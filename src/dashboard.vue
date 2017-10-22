<template>
<section id="dashboard">
  <div class="top-banner">
    <!-- Div for the top nav -->
    <div class="logo-container">
      <img class="logo" src="./assets/logo.png"/>
    </div>
    <h1>This is the top navigation</h1>
    <div>

    </div>
  </div>

  <section class="container">
    <div id="navigation-sidebar" class="sidebar">
      <!-- Div for the side nav -->
      <ul class="nav-options">
        <li id="home" class="option">
          <i></i>
          <router-link class="option-text" to="/">Home</router-link>
        </li>
        <li id="notifications" class="option">
          <i></i>
          <router-link class="option-text" to="/notifications">Notifications</router-link>
        </li>
        <li id="analytics" class="option">
          <i></i>
          <router-link class="option-text" to="/analytics">Analytics</router-link>
        </li>
        <li id="card-manager" class="option">
          <i></i>
          <router-link class="option-text" to="/card-manager">Card Manager</router-link>
        </li>
        <li id="team" class="option">
          <i></i>
          <router-link class="option-text" to="/team">Team</router-link>
        </li>
        <li id="help" class="option">
          <i></i>
          <router-link class="option-text" to="/help">Help</router-link>
        </li>
        <li id="billing" class="option">
          <i></i>
          <router-link class="option-text" to="/billing">Billing</router-link>
        </li>
      </ul>
    </div>
    <div class="router-view">
      <router-view></router-view>
    </div>
  </section>
</section>
</template>

<script>
export default {
  name: 'dashboard'
}
</script>

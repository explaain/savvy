
<template lang="html">
  <div class="spinner">
    <div class="grower">
      <img src="static/images/icon.png" alt="" class="fa-spin">
    </div>
  </div>
</template>

<script>

</script>

<style lang="scss">

.spinner {
  margin: 40px auto;
  text-align: center;
  font-size: 80px;

  .grower {
    width: auto;
    height: 1.8em;
    /* The following two lines make this work in Safari */
    max-width: 100%;
    max-height: 100%;
    // animation-name: pulse;
    // animation-duration: 2000ms;
    // transform-origin: 50% 50%;
    // animation-iteration-count: infinite;
    // animation-timing-function: linear;
    animation: pulse 2s ease infinite;
  }

  svg, img {
    width: auto;
    height: 1em;
    /* The following two lines make this work in Safari */
    max-width: 100%;
    max-height: 100%;
    // animation-name: pulse;
    // animation-duration: 2000ms;
    // transform-origin: 50% 50%;
    // animation-iteration-count: infinite;
    // animation-timing-function: linear;
    filter: grayscale(1);
    opacity: 0.6;
    animation: spin 2s linear infinite; //, greyscalePulse 20s linear infinite;
  }
}

@keyframes greyscalePulse {
  0% { filter: grayscale(1); opacity: 0.5; }
  25% { filter: grayscale(0.5); opacity: 0.75; }
  50% { filter: grayscale(0); opacity: 1; }
  75% { filter: grayscale(0.5); opacity: 0.75; }
  100% { filter: grayscale(1); opacity: 0.5; }
}
@keyframes pulse {
  0% { transform: scale(1); }
  25% { transform: scale(0.7); }
  50% { transform: scale(1); }
  75% { transform: scale(0.7); }
  100% { transform: scale(1); }
}
@keyframes spin {
    0% { transform:  otateZ(0deg); }
    25% { transform: rotateZ(90deg); }
    50% { transform: rotateZ(180deg); }
    75% { transform: rotateZ(270deg); }
    100% { transform: rotateZ(360deg); }
}

</style>

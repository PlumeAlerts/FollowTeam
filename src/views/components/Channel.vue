<template>
  <article class="level" style="border: 1px;">
    <div class="level-left">
      <div class="level-item">
        <figure class="image is-64x64">
        <img :src="item.logo">
        </figure>
      </div>
      <div class="level-item">
        <h1 class="title">{{item.display_name}}</h1>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'Channel',
  props: ['item'],
};
</script>

<style scoped>

</style>

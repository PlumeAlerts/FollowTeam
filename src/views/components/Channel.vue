<template>
  <article class="media" style="border: 1px;">
    <figure class="media-left">
      <p class="image is-64x64">
        <img :src="item.logo">
      </p>
    </figure>
    <div class="media-content">
      <div class="content">
        <p>
          <strong>{{item.display_name}}</strong>
          <br>
          {{item.status}}
        </p>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'Channel',
  props: {
    item: Object,
  },
};
</script>

<style scoped>

</style>

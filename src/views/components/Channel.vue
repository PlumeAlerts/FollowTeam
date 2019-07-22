<template>
  <div class="box" :class="item.follow?'selected':'unselected'" @click="select">
    <article class="level" style="border: 1px;">
      <div class="level-left">
        <div class="level-item">
          <figure class="image is-64x64">
            <img class="is-rounded" :src="item.logo">
          </figure>
        </div>
        <div class="level-item">
          <VueResponsiveText>
            <b>{{item.display_name}}</b>
          </VueResponsiveText>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
    import VueResponsiveText from 'vue-responsive-text';

    export default {
        name: 'Channel',
        props: ['item'],
        components: {
            VueResponsiveText,
        },
        methods: {
            select() {
                this.item.follow = !this.item.follow;
            },
        },
    };
</script>

<style scoped>
  .box.selected {
    background-color: #375a7f !important;
  }

  .box.unselected {
    background-color: #e74c3c !important;
  }
</style>

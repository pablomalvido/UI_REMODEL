<template>
    <div>
      <TitlePage page='REMODEL UI'/>
    </div>
    <div class="content">
    </div>
</template>

<script>
import TitlePage from '@/components/Title_page.vue';

export default {
  name: 'Menu',

  components: {TitlePage},

}
</script>

<style scoped>
.content{
  position: relative;
  margin: 20px;
  z-index: 200;
}
</style>
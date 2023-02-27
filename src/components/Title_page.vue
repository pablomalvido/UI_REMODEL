<template>
    <div class="title_page">
      <h1>{{page}}</h1>
    </div>
    <div class="title_page_relative"></div>
</template>

<script>
export default {
  name: 'Title_page',

  props: ['page'],
}
</script>

<style>
.title_page{
  background:#1d1b31;
  position: relative;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 70px;
  width: 100%;
  min-height: min-content;
  text-align: center;
  /* overflow-y: auto;
  background: var(--bg-color);
  padding: 6px 14px 0 14px; */
  z-index: 199;
}

.title_page h1{
  margin:auto;
  color: #dadfe2; font-family: 'Helvetica Neue', sans-serif; font-size: 40px; font-weight: 100; letter-spacing: 1px;
}

.title_page_relative{
  background:#1d1b31;
  position: relative;
  display: flex;
  flex-direction: column;
  left: 0;
  top: 0;
  height: 70px;
  width: 100%;
  /* overflow-y: auto;
  background: var(--bg-color);
  padding: 6px 14px 0 14px; */
  z-index: 1;
}
</style>
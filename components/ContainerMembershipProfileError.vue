<template>
  <div class="wrapper">
    <h1 class="wrapper__title title">儲存失敗</h1>
    <div class="wrapper__description description">
      <p class="description__paragraph">請稍後再操作</p>
    </div>
    <div class="wrapper__button-wrapper button-wrapper">
      <button class="back-to-form-button" @click="handleBackToForm">
        回到個人資料頁
      </button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    handleBackToForm() {
      this.$emit('backToForm')
    },
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  min-width: 240px;
  padding: 40px 20px;
  &__description,
  &__button-wrapper {
    margin: 40px 0 0 0;
  }
}

.title {
  font-weight: bold;
  font-size: 20px;
  letter-spacing: 2px;
  color: #204f74;
  text-align: center;
  @include media-breakpoint-up(xl) {
    font-size: 32px;
  }
}

.description {
  font-size: 18px;
  line-height: 32px;
  color: #4a4a4a;
  display: flex;
  flex-direction: column;
  align-items: center;
  &__paragraph {
    display: flex;
    flex-direction: column;
    align-items: center;
    @include media-breakpoint-up(xl) {
      flex-direction: row;
      justify-content: center;
    }
  }
}

.button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  button + button {
    margin: 20px 0 0 0;
  }
}
.back-to-form-button {
  width: 100%;
  max-width: 240px;
  height: 60px;
  background-color: #204f74;
  color: white;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

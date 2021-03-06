<template>
  <div class="component-wrapper">
    <div
      class="input-wrapper"
      :class="{ 'input-wrapper--invalid': canShowInputInvalid }"
    >
      <input
        v-model.trim="$v.email.$model"
        class="input-wrapper__input input"
        placeholder="name@example.com"
        type="email"
        @input="handleInput"
      />
      <SvgInvalidIcon v-show="canShowInputInvalid" class="invalid-icon" />
    </div>
    <div
      v-show="canShowInputInvalid"
      class="component-wrapper__invalid-hint invalid-hint"
    >
      <div class="invalid-hint__triangle invalid-hint-triangle" />
      <p>請輸入有效的電子郵件地址</p>
    </div>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { email, required } from 'vuelidate/lib/validators'
import SvgInvalidIcon from '~/assets/membership-input-invalid.svg?inline'

export default {
  components: {
    SvgInvalidIcon,
  },
  mixins: [validationMixin],
  props: {
    shouldShowInvalidHint: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      email: '',
    }
  },
  computed: {
    canShowInputInvalid() {
      return this.shouldShowInvalidHint && this.$v.$dirty && this.$v.$invalid
    },
  },
  watch: {
    shouldShowInvalidHint() {
      /*
       * toggling invalid hint when input was empty but we really want to show it
       * because invalid hint was always disable if we never touch it
       */
      if (this.shouldShowInvalidHint && !this.$v.$dirty) {
        // same as this.$v.$dirty = true
        this.$v.$touch()
      }
    },
    '$v.email.$invalid'(value) {
      this.$emit('inputValidStateChange', !value)
    },
  },
  validations: {
    email: {
      required,
      email,
    },
  },
  methods: {
    handleInput() {
      this.$emit('input', this.email)
    },
  },
}
</script>

<style lang="scss" scoped>
.component-wrapper {
  display: flex;
  flex-direction: column;
  &__invalid-hint {
    margin: 16px 0 0 0;
  }
  @include media-breakpoint-up(xl) {
    flex-direction: row;
    position: relative;
    &__invalid-hint {
      margin: 0 0 0 16px;
      position: absolute !important;
      left: 300px;
    }
  }
}

.input-wrapper {
  border: 2px solid #4a4a4a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  &--invalid {
    border: 2px solid #d0021b;
  }
  @include media-breakpoint-up(xl) {
    width: 300px;
  }
}

.input {
  width: 100%;
  &:focus {
    outline: none;
  }
}

.invalid-hint {
  border: 2px solid #d0021b;
  color: #d0021b;
  line-height: 1.5;
  padding: 10px 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &__triangle {
    position: absolute;
    top: -16px;
  }
  p {
    width: 100%;
  }
  @include media-breakpoint-up(xl) {
    padding: 5px 15px;
    flex-direction: row;
    &__triangle {
      top: auto;
      left: -17px;
    }
    p {
      width: max-content;
    }
  }
}

.invalid-hint-triangle {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 9px 16px 9px;
  border-color: transparent transparent #d0021b transparent;
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: -8px;
    top: 3px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 8px 14px 8px;
    border-color: transparent transparent white transparent;
  }
  @include media-breakpoint-up(xl) {
    transform: rotate(-90deg);
  }
}
</style>

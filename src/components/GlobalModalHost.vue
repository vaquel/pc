<script setup>
import BaseModal from './BaseModal.vue'
import { hideModal, modalState } from '../ui/modal'
</script>

<template>
  <BaseModal v-model="modalState.visible" :title="modalState.title">
    <div class="msg">{{ modalState.message }}</div>

    <template #footer>
      <button class="modalBtn" type="button" @click="hideModal">确定</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.msg {
  color: rgba(17, 17, 17, 0.82);
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}
</style>

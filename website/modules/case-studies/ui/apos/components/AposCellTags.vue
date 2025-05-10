<template>
  <div class="apos-table__cell-field">
    <template v-if="Array.isArray(item._tags)">
      <div v-for="tag in item._tags" :key="tag._id">
        {{ tag.title }}
      </div>
    </template>
    <template v-else>
      <div v-if="item._tags && item._tags.title">{{ item._tags.title }}</div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'AposCellTags',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
};
</script>

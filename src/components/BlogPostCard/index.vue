<template>
  <article class="post-item">
    <img v-if="post.imageUrl" :src="post.imageUrl" :alt="post.title" class="post-image"
      :style="{ height: post.imageHeight ? `${post.imageHeight}px` : 'auto' }" />
    <div class="post-content">
      <div class="post-meta">
        <span v-if="post.publishDate" class="post-date">{{ post.publishDate }}</span>
        <!-- Slot for category display -->
        <slot name="category"></slot>
      </div>
      <h3 class="post-title">{{ post.title }}</h3>
      <p v-if="post.excerpt" class="post-excerpt">{{ post.excerpt }}</p>
      <!-- Slot for tags display, only render container if slot is used -->
      <div class="post-tags-slot-container" v-if="$slots.tags">
        <slot name="tags"></slot>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

// Define the expected structure for the 'post' prop.
// This should align with the Post interface used in HomeView or be a subset.
interface PostProp {
  id: number;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  imageHeight?: number;
  publishDate?: string;
  // category and tags objects are not strictly needed as props if handled entirely by slots,
  // but the parent component will need them to populate the slots.
}

defineProps({
  post: {
    type: Object as PropType<PostProp>,
    required: true,
  },
});
</script>

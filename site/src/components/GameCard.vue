<template>
  <RouterLink :to="project.store_path || project.issue_path || '/'" class="game-card">
    <div class="game-card-art" :style="project.screenshot ? { backgroundImage: `url(${project.screenshot})` } : {}">
      <div v-if="!project.screenshot" class="art-placeholder"><span>O</span></div>
      <span class="status-chip">{{ project.status || 'Published' }}</span>
    </div>
    <div class="game-card-copy"><h3>{{ project.title }}</h3><p>{{ project.description || 'Created with OmGithub' }}</p></div>
  </RouterLink>
</template>
<script setup>defineProps({ project: { type: Object, required: true } })</script>

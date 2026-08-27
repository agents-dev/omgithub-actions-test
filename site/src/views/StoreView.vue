<template>
  <main v-if="project" class="store-page">
    <section class="store-hero">
      <div><p class="eyebrow orange">OMGHITHUB STORE</p><h1>{{ project.title }}</h1><p class="store-description">{{ project.description }}</p><div class="store-buttons"><a v-if="project.play_url" class="play" :href="project.play_url" target="_blank">Play</a><a v-if="project.install_url" class="install" :href="project.install_url">Install</a><button @click="share">Share</button><RouterLink :to="`/${project.owner}`" class="creator"><img :src="project.owner_avatar" alt="" />By {{ project.owner }}</RouterLink></div><p class="source-note">Published from <a :href="project.github_url" target="_blank">GitHub pull request #{{ project.number }}</a></p></div><div class="store-icon">O</div>
    </section>
    <section class="screens-section"><h2>Screenshots</h2><div class="store-shots"><img v-for="shot in project.screenshots" :key="shot" :src="shot" alt="Game screenshot" @click="selected = shot" /></div><p v-if="!project.screenshots.length">No screenshots were attached to this pull request.</p></section>
    <div v-if="selected" class="lightbox" @click="selected = ''"><img :src="selected" alt="Screenshot enlarged" /></div>
  </main>
  <main v-else class="studio-loading"><span class="spinner large"></span></main>
</template>
<script setup>
import { onMounted, ref } from 'vue'; import { useRoute } from 'vue-router'
const route = useRoute(), project = ref(null), selected = ref('')
async function share() { await navigator.clipboard?.writeText(location.href) }
onMounted(async () => { const r = await fetch(`/api/github/${route.params.owner}/${route.params.repo}/pull/${route.params.number}`); if (r.ok) project.value = await r.json() })
</script>

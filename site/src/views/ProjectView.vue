<template>
  <main class="studio">
    <div v-if="loading" class="studio-loading"><span class="spinner large"></span><h2>Opening the live build…</h2></div>
    <template v-else-if="project">
      <header class="studio-bar"><div><p class="eyebrow orange">{{ project.status }}</p><h1>{{ cleanTitle }}</h1></div><div class="studio-actions"><a :href="project.github_url" target="_blank">View issue ↗</a><RouterLink v-if="project.pr_path" :to="project.pr_path">Store page</RouterLink></div></header>
      <div class="studio-grid">
        <aside class="progress-panel">
          <div class="timeline">
            <div v-for="(step, index) in steps" :key="step.label" class="timeline-step" :class="step.done ? 'done' : step.active ? 'active' : ''"><span>{{ step.done ? '✓' : index + 1 }}</span><div><strong>{{ step.label }}</strong><small>{{ step.copy }}</small></div></div>
          </div>
          <div class="shots-heading"><h2>Recent screenshots</h2><span>{{ project.screenshots.length }}</span></div>
          <div v-if="project.screenshots.length" class="shots-list"><button v-for="shot in project.screenshots" :key="shot" @click="selectedShot = shot"><img :src="shot" alt="Game progress screenshot" /></button></div>
          <div v-else class="shots-empty"><span>▧</span><p>Screenshots will appear here as the build progresses.</p></div>
        </aside>
        <section class="preview-panel">
          <div class="preview-toolbar"><span class="live-dot"></span><strong>{{ previewLabel }}</strong><a v-if="previewUrl" :href="previewUrl" target="_blank">Open ↗</a></div>
          <iframe v-if="previewUrl" :src="previewUrl" allow="fullscreen; clipboard-read; clipboard-write" title="Live project preview"></iframe>
          <div v-else class="preview-wait"><div class="orbit"><span></span></div><h2>Preparing OpenCode</h2><p>The live workspace opens here as soon as GitHub Actions publishes its secure session.</p></div>
        </section>
      </div>
      <div v-if="selectedShot" class="lightbox" @click="selectedShot = ''"><img :src="selectedShot" alt="Screenshot enlarged" /></div>
    </template>
    <div v-else class="error-page"><h1>Project not found</h1><p>{{ error }}</p></div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute(), project = ref(null), loading = ref(true), error = ref(''), selectedShot = ref('')
const cleanTitle = computed(() => (project.value?.title || '').replace(/^\/goal\s*/i, ''))
const previewUrl = computed(() => project.value?.published_url || project.value?.preview_url || project.value?.opencode_url || '')
const previewLabel = computed(() => project.value?.published_url ? 'Published game' : project.value?.preview_url ? 'Playable preview' : project.value?.opencode_url ? 'OpenCode live' : 'Waiting for runner')
const steps = computed(() => {
  const p = project.value || {}; const complete = p.status === 'complete'
  return [
    { label: 'Issue created', copy: `#${route.params.number} on GitHub`, done: true },
    { label: 'OpenCode building', copy: p.opencode_url ? 'Live session available' : 'Runner is starting', done: Boolean(p.opencode_url), active: !p.opencode_url },
    { label: 'Browser verification', copy: p.preview_url ? 'Public preview verified' : 'Waiting for preview', done: Boolean(p.preview_url), active: Boolean(p.opencode_url && !p.preview_url) },
    { label: 'Published', copy: p.published_url || 'Permanent URL pending', done: Boolean(p.published_url), active: complete && !p.published_url }
  ]
})
async function load() { try { const r = await fetch(`/api/github/${route.params.owner}/${route.params.repo}/issues/${route.params.number}`); const data = await r.json(); if (!r.ok) throw new Error(data.error); project.value = data } catch (e) { error.value = e.message } finally { loading.value = false } }
let timer
onMounted(async () => { await load(); timer = setInterval(load, 8000) }); onBeforeUnmount(() => clearInterval(timer))
</script>

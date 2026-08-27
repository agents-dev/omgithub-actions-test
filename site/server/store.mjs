import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function createStore(dataDir, firestore = null) {
  mkdirSync(dataDir, { recursive: true })
  const file = join(dataDir, 'projects.json')
  const read = () => existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : []
  const write = (rows) => writeFileSync(file, JSON.stringify(rows, null, 2))
  return {
    async all() {
      if (!firestore) return read()
      const snap = await firestore.collection('omgithub_projects').orderBy('published_at', 'desc').limit(200).get()
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },
    async put(project) {
      if (firestore) await firestore.collection('omgithub_projects').doc(project.id).set(project, { merge: true })
      const rows = read(), index = rows.findIndex(row => row.id === project.id)
      if (index >= 0) rows[index] = { ...rows[index], ...project }; else rows.unshift(project)
      write(rows); return project
    }
  }
}

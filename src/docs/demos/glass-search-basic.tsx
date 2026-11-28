import { Folder, LayoutGrid, Users, Zap } from 'lucide-react'
import { useState } from 'react'

import { GlassSearch, type GlassSearchLayer } from '@/components/liquid-glass/glass-search'

const files = ['Friday khutbah notes.md', 'Hajj checklist.pdf', 'Nawawi forty hadith.pdf', 'Ramadan plan.md', 'Sirah reading list.md', 'Zakat sheet.xlsx']

const layers: GlassSearchLayer[] = [
  {
    value: 'apps',
    label: 'Apps',
    icon: <LayoutGrid />,
    items: [
      { value: 'calendar', label: 'Calendar', keywords: ['hijri'] },
      { value: 'maps', label: 'Maps' },
      { value: 'notes', label: 'Notes' },
      { value: 'prayer-times', label: 'Prayer times', keywords: ['salah', 'adhan'] },
      { value: 'qibla', label: 'Qibla', keywords: ['compass', 'kaaba'] },
      { value: 'quran', label: 'Quran', keywords: ['mushaf'] },
    ],
  },
  {
    value: 'files',
    label: 'Files',
    icon: <Folder />,
    // A layer that takes a while: it answers half a second later, and its results join the list then.
    search: (query, signal) =>
      new Promise((resolve) => {
        const id = setTimeout(() => resolve(files.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map((name) => ({ value: name, label: name, description: 'Documents' }))), 500)
        signal.addEventListener('abort', () => clearTimeout(id))
      }),
  },
  {
    value: 'people',
    label: 'People',
    icon: <Users />,
    items: [
      { value: 'bilal', label: 'Bilal ibn Rabah', description: 'The first muezzin' },
      { value: 'muadh', label: 'Muadh ibn Jabal', description: 'Teacher of Yemen' },
      { value: 'musab', label: 'Musab ibn Umayr', description: 'Envoy to Medina' },
      { value: 'umar', label: 'Umar ibn al-Khattab', description: 'Al-Faruq' },
    ],
  },
  {
    value: 'actions',
    label: 'Actions',
    icon: <Zap />,
    items: [
      { value: 'new-note', label: 'New note', keywords: ['create', 'write'] },
      { value: 'sadaqah', label: 'Give sadaqah', keywords: ['charity', 'donate'] },
      { value: 'mute', label: 'Mute for prayer', keywords: ['silence', 'quiet'] },
      { value: 'night', label: 'Night mode', keywords: ['dark'] },
    ],
  },
]

const COLS = 13
const ROWS = 7

/** 1 around the middle of the grid, falling to 0 at its edge. */
const fade = (col: number, row: number) => {
  const distance = Math.hypot((col - (COLS - 1) / 2) / (COLS / 2), (row - (ROWS - 1) / 2) / (ROWS / 2))
  return Math.min(1, Math.max(0, (1 - distance) / 0.45))
}

// Click the field and wait: its layers bud off the end as droplets. Type "n" and they melt back
// in, the best match completes the text and the field grows down into the results; the Files
// layer answers a moment later and the chips line up. Press a droplet or a chip to look in one
// layer alone; choose a result and the field empties.
// Behind it, only the Press demo's fine grid on the page's own colour, centred on the field:
// plain DOM, every cell draws its own top and left line, fainter towards the edge.
export default function Demo() {
  const [opened, setOpened] = useState<string | null>(null)
  return (
    <div className="relative isolate flex h-[30rem] w-full max-w-xl items-center justify-center">
      <div aria-hidden className="absolute top-1/2 left-1/2 -z-10 grid -translate-x-1/2 -translate-y-1/2 grid-cols-[repeat(13,40px)]">
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <span key={i} className="relative size-10" style={{ opacity: fade(i % COLS, Math.floor(i / COLS)) }}>
            <span className="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10" />
            <span className="absolute inset-y-0 left-0 w-px bg-black/10 dark:bg-white/10" />
          </span>
        ))}
      </div>
      {/* Three results at once: the list stays inside the example. */}
      <GlassSearch label="Search" placeholder={opened ? `Opened ${opened}. Search again` : 'Search'} layers={layers} limit={3} className="w-full max-w-md" onAction={(item) => setOpened(item.label)} />
    </div>
  )
}

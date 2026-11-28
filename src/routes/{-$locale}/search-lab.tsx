import { createFileRoute, notFound } from '@tanstack/react-router'
import { Folder, LayoutGrid, Users, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { GlassButton, GlassCard } from '@/components/liquid-glass'
import { BUD, SPRINGS } from '@/components/liquid-glass/engine'
import type { GlassOptics } from '@/components/liquid-glass/glass-layer'
import { GlassSearch, SEARCH, type GlassSearchLayer } from '@/components/liquid-glass/glass-search'

// Development only (a 404 in production): GlassSearch, with every value of its motion and its
// glass on a slider. The droplets' budding is the engine's (BUD and SPRINGS.bud* in engine.ts),
// the field's own timing is SEARCH in glass-search.tsx, and the glass is GlassOptics. A Button
// and a Card stand under it in the kit's own glass, on the same backdrop, to compare with.
export const Route = createFileRoute('/{-$locale}/search-lab')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  head: () => ({ meta: [{ title: 'Search lab — Liquid Glass UI' }, { name: 'robots', content: 'noindex' }] }),
  component: SearchLab,
})

// Slow motion: frames arrive as often as ever, but the clock they carry runs at `rate`, so the
// engine's springs and the field's own (its height) move that much slower. The field's CSS
// timing is stretched to match.
const clock = { rate: 1, real: 0, shown: 0 }

// `?pump`: frames advance only when `__pump(n)` is called, so the motion can be stepped and
// inspected frame by frame (and tested in a hidden tab, where real frames never fire).
const pumped = import.meta.env.DEV && typeof window !== 'undefined' && window.location.search.includes('pump')
if (pumped) {
  const w = window as unknown as { __pump: (n: number) => void; requestAnimationFrame: (cb: FrameRequestCallback) => number; cancelAnimationFrame: (id: number) => void }
  let queue: FrameRequestCallback[] = []
  let now = performance.now()
  w.requestAnimationFrame = (cb) => queue.push(cb)
  w.cancelAnimationFrame = () => {}
  // A hidden tab never reports intersections either: everything observed counts as on screen.
  window.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(target: Element) {
      queueMicrotask(() => this.cb([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver))
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
  w.__pump = (n) => {
    for (let i = 0; i < n; i++) {
      now += (1000 / 60) * clock.rate
      const run = queue
      queue = []
      for (const cb of run) cb(now)
    }
  }
}

type Locale = 'en' | 'tr'

// The kit's own values, kept apart from what the sliders change.
const KIT = {
  bud: { ...BUD },
  springs: { budBody: { ...SPRINGS.budBody }, budOut: { ...SPRINGS.budOut }, budIn: { ...SPRINGS.budIn } },
  search: { ...SEARCH },
}

/** Every value on a slider, flat: `group.key`. */
const defaults = () => ({
  'bud.wait': KIT.bud.wait,
  'bud.lead': KIT.bud.lead,
  'bud.stagger': KIT.bud.stagger,
  'bud.from': KIT.bud.from,
  'bud.seed': KIT.bud.seed,
  'bud.grown': KIT.bud.grown,
  'bud.grownStep': KIT.bud.grownStep,
  'bud.overshoot': KIT.bud.overshoot,
  'bud.softness': KIT.bud.softness,
  'body.omega': KIT.springs.budBody.omega,
  'body.zeta': KIT.springs.budBody.zeta,
  'out.omega': KIT.springs.budOut.omega,
  'out.zeta': KIT.springs.budOut.zeta,
  'in.omega': KIT.springs.budIn.omega,
  'in.zeta': KIT.springs.budIn.zeta,
  'field.layersAfter': 2000,
  'field.gap': KIT.search.gap,
  'field.bodyMin': KIT.search.bodyMin,
  'open.mass': KIT.search.opening.mass,
  'open.stiffness': KIT.search.opening.stiffness,
  'open.damping': KIT.search.opening.damping,
  'close.mass': KIT.search.closing.mass,
  'close.stiffness': KIT.search.closing.stiffness,
  'close.damping': KIT.search.closing.damping,
  'field.meltMs': KIT.search.meltMs,
  'field.rowMs': KIT.search.rowMs,
  'field.rowBackMs': KIT.search.rowBackMs,
  'field.iconFrom': KIT.search.iconFrom,
  'field.iconTo': KIT.search.iconTo,
  'field.iconScale': KIT.search.iconScale,
  'field.iconBlur': KIT.search.iconBlur,
  'field.flowSpeed': KIT.search.flowSpeed,
  'field.flowGap': KIT.search.flowGap,
  'field.arriveMs': KIT.search.arriveMs,
  'field.arriveScale': KIT.search.arriveScale,
  'glass.tint': 0.74,
  'glass.blur': 3.5,
  'glass.outlineAlpha': 0.13,
  'glass.outlineAlphaDark': 0.13,
  'glass.outlineWidth': 0.85,
  'glass.borderAlpha': 0.27,
  'glass.borderAlphaDark': 0.27,
  'glass.borderWidth': 0,
  'glass.shadow': 1.74,
  'glass.shadowSoftness': 4.17,
  'glass.shadowOffset': 1.82,
  'glass.refraction': 1,
  'glass.light': 0.25,
  'glass.rim': 0.75,
  'glass.mirror': 0.25,
  'glass.saturation': 2,
})
type Values = ReturnType<typeof defaults>
type Key = keyof Values

type Knob = { key: Key; min: number; max: number; step: number; en: string; tr: string; hintEn: string; hintTr: string }
type Group = { id: string; en: string; tr: string; knobs: Knob[] }

const k = (key: Key, min: number, max: number, step: number, en: string, tr: string, hintEn: string, hintTr: string): Knob => ({ key, min, max, step, en, tr, hintEn, hintTr })

// Each knob: its range and what it does, in both languages.
const GROUPS: Group[] = [
  {
    id: 'bud',
    en: 'Budding (BUD)',
    tr: 'Tomurcuklanma (BUD)',
    knobs: [
      k('bud.wait', 0, 1, 0.005, 'Wait (s)', 'Bekleme (sn)', 'The body pulls back for this long before the first droplet shows', 'İlk damla görünmeden önce gövdenin geri çekildiği süre'),
      k('bud.lead', 0, 0.5, 0.005, 'Lead of the first (s)', 'İlk damlanın öncülüğü (sn)', 'The other droplets start this much after the first', 'Diğer damlalar ilkinden bu kadar sonra başlar'),
      k('bud.stagger', 0, 0.2, 0.0005, 'Stagger (s)', 'Sıra aralığı (sn)', 'Among the others, each starts this much after the one before', 'Diğerleri arasında her biri öncekinden bu kadar sonra başlar'),
      k('bud.from', 0, 1, 0.01, 'Start (0–1)', 'Başlangıç (0–1)', 'Where the others start from, between the first droplet’s place (0) and their own (1). The first always swells in its own place', 'Diğerlerinin nereden başladığı: ilk damlanın yeri (0) ile kendi yerleri (1) arasında. İlk damla hep kendi yerinde şişer'),
      k('bud.seed', 0.05, 1, 0.01, 'Size coming out (×)', 'Çıkış boyu (×)', 'A droplet’s size as it leaves the body’s end', 'Damlanın gövdenin ucundan çıkarkenki boyu'),
      k('bud.grown', 0.05, 1, 0.01, 'Full size at (0–1)', 'Tam boya varış (0–1)', 'How far along its way the first droplet is full size: low = it grows before it travels', 'İlk damlanın yolunun neresinde tam boya ulaştığı: düşük = yol almadan büyür'),
      k('bud.grownStep', 0, 0.3, 0.01, 'Later for each next', 'Sonrakiler için gecikme', 'Each droplet after the first is full size this much further along', 'İlkinden sonraki her damla bu kadar daha ileride tam boya ulaşır'),
      k('bud.overshoot', 0, 0.3, 0.01, 'Overshoot room', 'Aşma payı', 'The furthest a droplet may swing past its place (× its way there)', 'Damlanın yerini en fazla ne kadar aşabileceği (× yolu)'),
      k('bud.softness', 0, 1, 0.01, 'Bridge softness (× height)', 'Köprü yumuşaklığı (× yükseklik)', 'How gooey the neck between a droplet and what it buds from is', 'Damla ile koptuğu şey arasındaki boynun ne kadar yapışkan olduğu'),
    ],
  },
  {
    id: 'springs',
    en: 'Springs',
    tr: 'Yaylar',
    knobs: [
      k('body.omega', 2, 40, 0.5, 'Body: speed', 'Gövde: hız', 'The body pulling back (rad/s)', 'Gövdenin geri çekilişi (rad/sn)'),
      k('body.zeta', 0.2, 1.5, 0.01, 'Body: damping', 'Gövde: sönüm', 'Under 1 it pulls back too far and returns', '1’in altında fazla çekilir ve geri gelir'),
      k('out.omega', 2, 40, 0.5, 'Droplet out: speed', 'Damla çıkış: hız', 'A droplet on its way to its place (rad/s)', 'Damlanın yerine gidişi (rad/sn)'),
      k('out.zeta', 0.2, 1.5, 0.01, 'Droplet out: damping', 'Damla çıkış: sönüm', 'Under 1 it swings past its place; 1 or more lands without a bounce', '1’in altında yerini aşar; 1 ve üstü sekmeden konar'),
      k('in.omega', 2, 60, 0.5, 'Back in: speed', 'Geri erime: hız', 'Everything going back in (rad/s)', 'Her şeyin geri erimesi (rad/sn)'),
      k('in.zeta', 0.2, 1.5, 0.01, 'Back in: damping', 'Geri erime: sönüm', 'Under 1 the body wobbles as it closes', '1’in altında gövde kapanırken sallanır'),
    ],
  },
  {
    id: 'panel',
    en: 'Opening and shutting (SEARCH)',
    tr: 'Açılış ve kapanış (SEARCH)',
    knobs: [
      k('open.mass', 0.1, 10, 0.1, 'Opening: mass', 'Açılış: kütle', 'How heavy the field is as it grows into its results: heavier starts and stops slower, and swings past its place unless the damping holds it', 'Alanın sonuçlarına büyürken ne kadar ağır olduğu: ağır olan geç kalkar, geç durur ve sönüm tutmazsa yerini aşar'),
      k('open.stiffness', 20, 1200, 10, 'Opening: stiffness', 'Açılış: sertlik', 'How hard it is pulled to its full height', 'Tam boyuna ne kadar güçlü çekildiği'),
      k('open.damping', 1, 200, 1, 'Opening: damping', 'Açılış: sönüm', 'What calms it: low = it bounces, high = it creeps', 'Onu yatıştıran: düşük = sekiyor, yüksek = sürünüyor'),
      k('close.mass', 0.1, 10, 0.1, 'Shutting: mass', 'Kapanış: kütle', 'How heavy the glass is as it shuts over the results', 'Camın sonuçların üstüne kapanırken ne kadar ağır olduğu'),
      k('close.stiffness', 20, 1200, 10, 'Shutting: stiffness', 'Kapanış: sertlik', 'How hard it is pulled shut', 'Kapanmaya ne kadar güçlü çekildiği'),
      k('close.damping', 1, 200, 1, 'Shutting: damping', 'Kapanış: sönüm', 'What calms it: low = it bounces on the field, high = it creeps shut', 'Onu yatıştıran: düşük = alanın üstünde sekiyor, yüksek = sürünerek kapanıyor'),
    ],
  },
  {
    id: 'field',
    en: 'Field (SEARCH)',
    tr: 'Alan (SEARCH)',
    knobs: [
      k('field.layersAfter', 0, 6000, 50, 'Layers after (ms)', 'Katmanların çıkışı (ms)', 'How long the empty field waits before its layers bud off (the `layersAfter` prop)', 'Boş alanın katmanlarını salmadan önce beklediği süre (`layersAfter` prop’u)'),
      k('field.gap', 0, 24, 1, 'Gap (px)', 'Boşluk (px)', 'Between droplets, and between the field and the first one', 'Damlalar arasında ve alan ile ilk damla arasında'),
      k('field.bodyMin', 40, 320, 4, 'Field keeps (px)', 'Alanın kalanı (px)', 'The least the field keeps of itself: fewer droplets come out of a narrow one', 'Alanın kendinden en az bıraktığı: dar alandan daha az damla çıkar'),
      k('field.meltMs', 0, 1000, 10, 'Melt first (ms)', 'Önce eri (ms)', 'Typed in while the droplets are out, the field opens this much later', 'Damlalar dışarıdayken yazılırsa alan bu kadar geç açılır'),
      k('field.rowMs', 0, 2000, 10, 'Text room, out (ms)', 'Yazı alanı, çıkış (ms)', 'How long the text’s own room takes to follow the field’s end as the droplets come out', 'Damlalar çıkarken yazının yerinin alanın ucunu izleme süresi'),
      k('field.rowBackMs', 0, 2000, 10, 'Text room, back (ms)', 'Yazı alanı, dönüş (ms)', 'The same as the droplets go back in', 'Aynısı, damlalar geri erirken'),
      k('field.iconFrom', 0, 0.98, 0.01, 'Icon shows at (0–1)', 'İkonun belirişi (0–1)', 'An icon rides with its droplet and begins to show once the droplet is this far out', 'İkon damlasıyla birlikte gider; damla bu kadar yol alınca belirmeye başlar'),
      k('field.iconTo', 0.02, 1, 0.01, 'Icon sharp at (0–1)', 'İkonun netleşmesi (0–1)', 'The icon is sharp once its droplet is this far out', 'Damla bu kadar yol alınca ikon netleşmiş olur'),
      k('field.iconScale', 0, 1, 0.01, 'Icon size coming in (×)', 'İkonun geliş boyu (×)', 'The icon grows from its own centre, from this share of its size, as it fades up', 'İkon belirirken kendi merkezinden, boyunun bu kadarından büyür'),
      k('field.iconBlur', 0, 20, 0.5, 'Icon blur (px)', 'İkon bulanıklığı (px)', 'The blur an icon comes out of', 'İkonun içinden çıktığı bulanıklık'),
      k('field.flowSpeed', 5, 200, 1, 'Flowing text (px/s)', 'Akan yazı (px/sn)', 'How fast a placeholder too long for the field flows through it (tick Long placeholder to see it)', 'Alana sığmayan yer tutucunun içinden akma hızı (görmek için Uzun yer tutucu’yu işaretle)'),
      k('field.flowGap', 0, 160, 2, 'Flowing text gap (px)', 'Akan yazı boşluğu (px)', 'The space between the end of the text and its next copy', 'Yazının sonu ile sonraki kopyası arasındaki boşluk'),
      k('field.arriveMs', 0, 2000, 10, 'Arrival (ms)', 'Geliş (ms)', 'How long the field takes to come in (the `arrive` prop; press Arrive)', 'Alanın ekrana geliş süresi (`arrive` prop’u; Geliş’e bas)'),
      k('field.arriveScale', 1, 1.4, 0.01, 'Arrival size (×)', 'Geliş boyu (×)', 'How much larger the field is as it comes in', 'Alanın gelirken ne kadar büyük olduğu'),
    ],
  },
  {
    id: 'glass',
    en: 'Glass',
    tr: 'Cam',
    knobs: [
      k('glass.tint', 0, 1, 0.01, 'Tint', 'Ton', 'How much tint covers the backdrop', 'Arka planı ne kadar ton örttüğü'),
      k('glass.blur', 0, 40, 0.5, 'Frost (px)', 'Buz (px)', 'How much the backdrop is frosted', 'Arka planın ne kadar buzlandığı'),
      k('glass.outlineAlpha', 0, 1, 0.01, 'Outline (light glass)', 'Dış çizgi (açık cam)', 'Opacity of the black hairline on the very edge of the glass, on light glass', 'Camın en dış kenarındaki siyah ince çizginin açık camdaki opaklığı'),
      k('glass.outlineAlphaDark', 0, 1, 0.01, 'Outline (dark glass)', 'Dış çizgi (koyu cam)', 'The same hairline on dark glass', 'Aynı çizginin koyu camdaki opaklığı'),
      k('glass.outlineWidth', 0, 3, 0.05, 'Outline width (px)', 'Dış çizgi kalınlığı (px)', 'Width of that hairline; the light line lies just inside it', 'O çizginin kalınlığı; açık çizgi hemen içinde durur'),
      k('glass.borderAlpha', 0, 1, 0.01, 'Rim line (light glass)', 'Kenar çizgisi (açık cam)', 'Opacity of the white line just inside the rim, on light glass', 'Kenarın hemen içindeki beyaz çizginin açık camdaki opaklığı'),
      k('glass.borderAlphaDark', 0, 1, 0.01, 'Rim line (dark glass)', 'Kenar çizgisi (koyu cam)', 'The same line on dark glass', 'Aynı çizginin koyu camdaki opaklığı'),
      k('glass.borderWidth', 0, 4, 0.1, 'Rim line width (px)', 'Kenar çizgisi kalınlığı (px)', 'Width of that line', 'O çizginin kalınlığı'),
      k('glass.shadow', 0, 4, 0.01, 'Drop shadow', 'Gölge', '× the shadow under the glass', '× camın altındaki gölge'),
      k('glass.shadowSoftness', 0.1, 10, 0.01, 'Shadow softness', 'Gölge yumuşaklığı', '× how soft that shadow is', '× o gölgenin yumuşaklığı'),
      k('glass.shadowOffset', 0, 4, 0.01, 'Shadow offset', 'Gölge kayması', '× how far below the glass it falls', '× camın ne kadar altına düştüğü'),
      k('glass.refraction', 0, 3, 0.05, 'Bend', 'Bükme', '× the bend at the rim', '× kenardaki bükme'),
      k('glass.light', 0, 2, 0.05, 'Face light', 'Yüzey ışığı', 'The light on the face of the glass: inner shading, the reflection across the top and the warm caustic. 0 = a flat frosted face. The rim does not depend on it', 'Camın yüzeyindeki ışık: iç gölgelendirme, üstteki yansıma ve sıcak parıltı. 0 = düz, buzlu bir yüzey. Kenar buna bağlı değil'),
      k('glass.rim', 0, 3, 0.05, 'Rim light', 'Kenar ışığı', '× the bright line on the rim, which leans towards the pointer as it moves around the glass', '× kenardaki parlak çizgi; imleç camın etrafında gezdikçe ona doğru yatar'),
      k('glass.mirror', 0, 2, 0.05, 'Rim mirror', 'Kenar yansıması', '× what the rim mirrors of the page around it: a colourful neighbour shows on the rim that faces it', '× kenarın etrafındaki sayfadan yansıttığı: renkli bir komşu, ona bakan kenarda görünür'),
      k('glass.saturation', 0, 2, 0.05, 'Saturation', 'Doygunluk', 'Of what shows through the glass', 'Camın ardından görünenin'),
    ],
  },
]

const RATES = [1, 0.5, 0.25, 0.1]
const BACKS = ['grid', 'split', 'scene'] as const
type Back = (typeof BACKS)[number]

const COPY = {
  en: {
    title: 'Search',
    note: 'Click the field and wait: its layers bud off. Type to melt them back and open the results. Changes apply at once; Replay lets the layers out again, Arrive brings the field in again.',
    copy: 'Copy all values',
    copied: 'Copied',
    reset: 'Reset',
    replay: 'Replay',
    arrive: 'Arrive',
    speed: 'Speed',
    back: 'Behind it',
    backs: { scene: 'SVG', split: 'Page', grid: 'Grid' },
    label: 'Search',
    placeholder: 'Search',
    long: 'Long placeholder',
    longPlaceholder: 'Search apps, files, people and actions, all at once',
    empty: 'No results',
    compare: 'The kit’s own glass, to compare with',
    button: 'Button',
    card: 'Card',
    cardText: 'Frosted, with a white line on its rim and no light of its own.',
    layers: { apps: 'Apps', files: 'Files', people: 'People', actions: 'Actions' },
    page: ['Droplet count follows the width: four at most, enough left to type in', 'A thin light line on the rim', 'Behind the glass, a page of text to frost', 'Half of it dark and half of it light'],
  },
  tr: {
    title: 'Search',
    note: 'Alana tıkla ve bekle: katmanları damla damla ayrılır. Yazınca geri erirler ve sonuçlar açılır. Değişiklikler anında uygulanır; Tekrarla katmanları yeniden salar, Geliş alanı ekrana yeniden getirir.',
    copy: 'Tüm değerleri kopyala',
    copied: 'Kopyalandı',
    reset: 'Sıfırla',
    replay: 'Tekrarla',
    arrive: 'Geliş',
    speed: 'Hız',
    back: 'Arkasında',
    backs: { scene: 'SVG', split: 'Sayfa', grid: 'Izgara' },
    label: 'Ara',
    placeholder: 'Ara',
    long: 'Uzun yer tutucu',
    longPlaceholder: 'Uygulamalarda, dosyalarda, kişilerde ve eylemlerde aynı anda ara',
    empty: 'Sonuç yok',
    compare: 'Kıyas için kitin kendi camı',
    button: 'Button',
    card: 'Card',
    cardText: 'Buzlu; kenarında beyaz bir çizgi var, kendi ışığı yok.',
    layers: { apps: 'Uygulamalar', files: 'Dosyalar', people: 'Kişiler', actions: 'Eylemler' },
    page: ['Damla sayısı genişliğe göre: en fazla dört, yazmaya yer kalacak kadar', 'Kenarda ince açık bir çizgi', 'Camın arkasında, buzlanacak bir sayfa yazı', 'Yarısı koyu, yarısı açık'],
  },
}

// Bumped when the set of values changes, so stale saved ones do not override the kit's.
const STORE = 'glass-search-tuning-21'

const files = ['Friday khutbah notes.md', 'Hajj checklist.pdf', 'Nawawi forty hadith.pdf', 'Ramadan plan.md', 'Sirah reading list.md', 'Zakat sheet.xlsx']

function layersOf(locale: Locale): GlassSearchLayer[] {
  const t = COPY[locale].layers
  return [
    { value: 'apps', label: t.apps, icon: <LayoutGrid />, items: ['Calendar', 'Maps', 'Notes', 'Prayer times', 'Qibla', 'Quran'].map((label) => ({ value: label, label })) },
    {
      value: 'files',
      label: t.files,
      icon: <Folder />,
      search: (query, signal) =>
        new Promise((resolve) => {
          const id = setTimeout(() => resolve(files.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map((name) => ({ value: name, label: name, description: 'Documents' }))), 500)
          signal.addEventListener('abort', () => clearTimeout(id))
        }),
    },
    { value: 'people', label: t.people, icon: <Users />, items: ['Bilal ibn Rabah', 'Muadh ibn Jabal', 'Musab ibn Umayr', 'Umar ibn al-Khattab'].map((label) => ({ value: label, label, description: 'Companion' })) },
    { value: 'actions', label: t.actions, icon: <Zap />, items: ['New note', 'Give sadaqah', 'Mute for prayer', 'Night mode'].map((label) => ({ value: label, label })) },
  ]
}

/** An evening in flat colour, drawn as one inline SVG: a sun and four streaks of cloud. */
function Scene() {
  return (
    <svg aria-hidden viewBox="0 0 576 320" preserveAspectRatio="xMidYMin slice" className="absolute inset-x-0 top-0 -z-10 h-80 w-full">
      <circle cx="288" cy="150" r="130" fill="#ff6b3d" />
      <path fill="#ffd60a" d="M24 40c26-22 78-26 112-14 30-18 96-20 128-2 22 12 18 34-8 38-40 8-96 2-128 6-36 6-84 4-104-6-14-6-12-16 0-22Z" />
      <path fill="#ff375f" d="M250 118c30-16 84-18 120-8 34-14 104-14 150 0 30 10 34 34 8 44-44 14-110 6-152 12-44 6-100 4-126-10-22-12-20-28 0-38Z" />
      <path fill="#bf5af2" d="M56 196c22-14 60-16 88-8 28-10 72-10 96 2 16 8 14 22-4 26-34 8-76 2-106 6-30 4-62 2-78-6-10-6-8-14 4-20Z" />
      <path fill="#ff9f0a" d="M214 248c26-14 70-16 104-8 34-12 96-12 132 0 22 8 22 26 0 32-44 12-98 4-138 8-40 4-82 2-102-8-14-8-12-18 4-24Z" />
    </svg>
  )
}

/** A page of text, half of it dark and half of it light, as the field would lie over an app. */
function Split({ lines }: { lines: string[] }) {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 flex overflow-hidden rounded-3xl text-[15px] leading-7">
      <div className="w-[62%] bg-[#141414] px-6 py-5 text-white/90">
        {[...lines, ...lines].map((line, i) => (
          <p key={i} className="truncate">
            {line}
          </p>
        ))}
      </div>
      <div className="flex-1 bg-[#ececee] px-6 py-5 font-semibold text-neutral-900">
        {lines.map((line, i) => (
          <p key={i} className="truncate">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

/** The fine grid of the Press demo, as plain DOM. */
function Grid() {
  return (
    <div aria-hidden className="absolute top-0 left-1/2 -z-10 grid -translate-x-1/2 grid-cols-[repeat(14,40px)]">
      {Array.from({ length: 14 * 8 }, (_, i) => (
        <span key={i} className="relative size-10">
          <span className="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10" />
          <span className="absolute inset-y-0 left-0 w-px bg-black/10 dark:bg-white/10" />
        </span>
      ))}
    </div>
  )
}

function SearchLab() {
  const { locale } = Route.useRouteContext()
  const t = COPY[locale]
  const [values, setValues] = useState<Values>(defaults)
  const [rate, setRate] = useState(1)
  const [back, setBack] = useState<Back>('grid')
  const [copied, setCopied] = useState(false)
  // Arrive: the field is mounted again, so its arrival plays.
  const [arrival, setArrival] = useState(0)
  // A placeholder too long for the field, to see it flow.
  const [long, setLong] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const layers = useMemo(() => layersOf(locale), [locale])

  // Values survive a reload, so tuning can go on across sessions.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? 'null')
      if (saved) setValues((v) => ({ ...v, ...saved }))
    } catch {
      // Nothing saved, or storage is unavailable: the defaults stand.
    }
  }, [])

  // The engine reads BUD and SPRINGS on every frame, the field reads SEARCH on every render.
  // Slowed down, the field's CSS timing is stretched by as much as the springs' clock.
  const v = values
  Object.assign(BUD, { wait: v['bud.wait'], lead: v['bud.lead'], stagger: v['bud.stagger'], from: v['bud.from'], seed: v['bud.seed'], grown: v['bud.grown'], grownStep: v['bud.grownStep'], overshoot: v['bud.overshoot'], softness: v['bud.softness'] })
  const springs = SPRINGS as unknown as Record<string, { omega: number; zeta: number }>
  springs.budBody = { omega: v['body.omega'], zeta: v['body.zeta'] }
  springs.budOut = { omega: v['out.omega'], zeta: v['out.zeta'] }
  springs.budIn = { omega: v['in.omega'], zeta: v['in.zeta'] }
  Object.assign(SEARCH, {
    gap: v['field.gap'],
    bodyMin: v['field.bodyMin'],
    opening: { mass: v['open.mass'], stiffness: v['open.stiffness'], damping: v['open.damping'] },
    closing: { mass: v['close.mass'], stiffness: v['close.stiffness'], damping: v['close.damping'] },
    meltMs: v['field.meltMs'] / rate,
    rowMs: v['field.rowMs'] / rate,
    rowBackMs: v['field.rowBackMs'] / rate,
    iconFrom: v['field.iconFrom'],
    iconTo: v['field.iconTo'],
    iconScale: v['field.iconScale'],
    iconBlur: v['field.iconBlur'],
    flowSpeed: v['field.flowSpeed'],
    flowGap: v['field.flowGap'],
    arriveMs: v['field.arriveMs'] / rate,
    arriveScale: v['field.arriveScale'],
  })
  useEffect(() => {
    // A resize makes every glass measure and draw again.
    window.dispatchEvent(new Event('resize'))
    try {
      localStorage.setItem(STORE, JSON.stringify(values))
    } catch {
      // Storage is unavailable: the values still apply for this visit.
    }
  }, [values])
  // Leaving the lab puts the kit's own values back.
  useEffect(
    () => () => {
      Object.assign(BUD, KIT.bud)
      Object.assign(springs, KIT.springs)
      Object.assign(SEARCH, KIT.search)
    },
    [springs],
  )

  // The slowed clock (see `clock`).
  useEffect(() => {
    if (pumped) return
    const real = window.requestAnimationFrame
    clock.real = 0
    window.requestAnimationFrame = (cb) =>
      real.call(window, (now) => {
        if (!clock.real) clock.real = clock.shown = now
        // Every callback of one frame is handed the same moment.
        clock.shown += (now - clock.real) * clock.rate
        clock.real = now
        cb(clock.shown)
      })
    return () => {
      window.requestAnimationFrame = real
      clock.rate = 1
    }
  }, [])
  useEffect(() => {
    clock.rate = rate
  }, [rate])

  const optics = useMemo<GlassOptics>(
    () => ({
      borderColor: '#ffffff',
      borderAlpha: v['glass.borderAlpha'],
      borderWidth: v['glass.borderWidth'],
      dark: { borderAlpha: v['glass.borderAlphaDark'], outlineAlpha: v['glass.outlineAlphaDark'] },
      outlineColor: '#000000',
      outlineAlpha: v['glass.outlineAlpha'],
      outlineWidth: v['glass.outlineWidth'],
      shadow: v['glass.shadow'],
      shadowSoftness: v['glass.shadowSoftness'],
      shadowOffset: v['glass.shadowOffset'],
      // The shadow begins right at the field's edge, as Card's does (the kit's own for this field).
      shadowFlush: true,
      refraction: v['glass.refraction'],
      // The face's light and the rim's are apart: `light` itself stays whole, or the rim would dim with the face.
      inner: v['glass.light'],
      reflection: v['glass.light'],
      caustic: v['glass.light'],
      rim: v['glass.rim'],
      mirror: v['glass.mirror'],
      saturation: v['glass.saturation'],
    }),
    [v],
  )

  // Replay: the field lets go of the focus (its droplets melt back), takes it again and waits.
  const replay = () => {
    const input = stage.current?.querySelector('input')
    if (!input) return
    input.blur()
    setTimeout(() => input.focus(), 320 / rate)
  }

  // What to paste back into the kit: engine.ts (BUD, SPRINGS), glass-search.tsx (SEARCH, OPTICS) and the props.
  const text = JSON.stringify(
    {
      BUD: { wait: v['bud.wait'], lead: v['bud.lead'], stagger: v['bud.stagger'], from: v['bud.from'], seed: v['bud.seed'], grown: v['bud.grown'], grownStep: v['bud.grownStep'], overshoot: v['bud.overshoot'], softness: v['bud.softness'] },
      SPRINGS: { budBody: { omega: v['body.omega'], zeta: v['body.zeta'] }, budOut: { omega: v['out.omega'], zeta: v['out.zeta'] }, budIn: { omega: v['in.omega'], zeta: v['in.zeta'] } },
      SEARCH: { gap: v['field.gap'], bodyMin: v['field.bodyMin'], opening: { mass: v['open.mass'], stiffness: v['open.stiffness'], damping: v['open.damping'] }, closing: { mass: v['close.mass'], stiffness: v['close.stiffness'], damping: v['close.damping'] }, meltMs: v['field.meltMs'], rowMs: v['field.rowMs'], rowBackMs: v['field.rowBackMs'], iconFrom: v['field.iconFrom'], iconTo: v['field.iconTo'], iconScale: v['field.iconScale'], iconBlur: v['field.iconBlur'], flowSpeed: v['field.flowSpeed'], flowGap: v['field.flowGap'], arriveMs: v['field.arriveMs'], arriveScale: v['field.arriveScale'] },
      props: { layersAfter: v['field.layersAfter'], tint: v['glass.tint'], blur: v['glass.blur'] },
      OPTICS: optics,
    },
    null,
    2,
  )
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // No clipboard access: the values are in the box below, ready to select.
    }
  }

  const pill = (on: boolean) => `press rounded-md px-2 py-1 text-caption ${on ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent'}`

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center gap-10 bg-stage px-4 pt-28 pb-16 md:pr-80 xl:pr-[21rem]">
      <section ref={stage} className="relative isolate flex h-[30rem] w-full max-w-xl flex-col items-center">
        {back === 'scene' ? <Scene /> : back === 'split' ? <Split lines={t.page} /> : <Grid />}
        <GlassSearch
          key={arrival}
          arrive
          label={t.label}
          placeholder={long ? t.longPlaceholder : t.placeholder}
          empty={t.empty}
          layers={layers}
          layersAfter={v['field.layersAfter']}
          tint={v['glass.tint']}
          blur={v['glass.blur']}
          optics={optics}
          className="mt-10 w-full max-w-md"
        />
        {/* The kit's own Button and Card on the same backdrop: nothing here follows the sliders. */}
        <div className="mt-20 flex w-full max-w-md flex-col gap-3">
          <p className="text-caption text-muted-foreground">{t.compare}</p>
          <div className="flex items-start justify-between gap-6">
            <GlassButton size="lg">{t.button}</GlassButton>
            <GlassCard className="w-60 p-4">
              <p className="text-sm font-semibold">{t.card}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-70">{t.cardText}</p>
            </GlassCard>
          </div>
        </div>
      </section>

      <aside
        data-glass-skip=""
        className="fixed top-24 right-4 bottom-4 z-30 flex w-72 flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-background p-4 text-ui text-foreground xl:w-80 max-md:static max-md:w-full"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-body-sm font-semibold">{t.title}</h2>
          <button type="button" onClick={() => setValues(defaults())} className="press rounded-md px-2 py-1 text-caption text-muted-foreground hover:bg-accent">
            {t.reset}
          </button>
        </div>
        <p className="text-caption text-muted-foreground">{t.note}</p>
        <div className="flex gap-2">
          <button type="button" onClick={replay} className="press flex-1 rounded-md bg-foreground px-3 py-2 text-ui font-medium text-background">
            {t.replay}
          </button>
          <button type="button" onClick={() => setArrival((n) => n + 1)} className="press flex-1 rounded-md border border-border px-3 py-2 text-ui font-medium">
            {t.arrive}
          </button>
        </div>
        <button type="button" onClick={copy} className="press shrink-0 rounded-md border border-border px-3 py-2 text-ui font-medium">
          {copied ? t.copied : t.copy}
        </button>
        <div className="flex items-center justify-between gap-2">
          <span className="text-caption text-muted-foreground">{t.speed}</span>
          <span className="flex gap-1">
            {RATES.map((r) => (
              <button key={r} type="button" aria-pressed={rate === r} onClick={() => setRate(r)} className={pill(rate === r)}>
                {r}×
              </button>
            ))}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-caption text-muted-foreground">{t.back}</span>
          <span className="flex gap-1">
            {BACKS.map((b) => (
              <button key={b} type="button" aria-pressed={back === b} onClick={() => setBack(b)} className={pill(back === b)}>
                {t.backs[b]}
              </button>
            ))}
          </span>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={long} onChange={(e) => setLong(e.target.checked)} />
          <span>{t.long}</span>
        </label>
        {GROUPS.map((group, g) => (
          <details key={group.id} open={g === 0} className="border-t border-border pt-3">
            <summary className="cursor-pointer text-body-sm font-semibold select-none">{locale === 'tr' ? group.tr : group.en}</summary>
            <div className="mt-3 flex flex-col gap-3">
              {group.knobs.map((knob) => (
                <label key={knob.key} className="flex flex-col gap-1" title={locale === 'tr' ? knob.hintTr : knob.hintEn}>
                  <span className="flex items-baseline justify-between gap-2">
                    <span>{locale === 'tr' ? knob.tr : knob.en}</span>
                    <span className="font-mono text-caption text-muted-foreground tabular-nums">{values[knob.key]}</span>
                  </span>
                  <input type="range" min={knob.min} max={knob.max} step={knob.step} value={values[knob.key]} onChange={(e) => setValues((before) => ({ ...before, [knob.key]: Number(e.target.value) }))} className="w-full" />
                  <span className="text-micro text-muted-foreground">{locale === 'tr' ? knob.hintTr : knob.hintEn}</span>
                </label>
              ))}
            </div>
          </details>
        ))}
        <textarea readOnly value={text} rows={8} onFocus={(e) => e.currentTarget.select()} className="shrink-0 rounded-md border border-border bg-background p-2 font-mono text-micro" />
      </aside>
    </main>
  )
}

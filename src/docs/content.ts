// The single source of truth for the documentation. Plain data, no React:
// the site renders it (EN + TR), and the build turns it into llms.txt, llms-full.txt,
// per-page Markdown, the shadcn registry and the agent skill reference (scripts/ai-files.ts).
// Live examples are files in ./demos — the code shown on a page IS that file.
import type { L } from '../site/i18n'

export type PropRow = { name: string; type: string; default?: string; description: L }

export type Block =
  | { type: 'p'; text: L }
  | { type: 'h'; text: L }
  | { type: 'list'; items: L[] }
  | { type: 'note'; text: L }
  | { type: 'demo'; id: string; title?: L }
  | { type: 'code'; code: string; title?: string }
  | { type: 'install'; item: string }
  | { type: 'props'; rows: PropRow[] }
  /** "Use it for / Not for": what sets this component apart from the others. */
  | { type: 'when'; use: L[]; avoid: L[] }
  /** The components as live cards. */
  | { type: 'index' }

export type DocGroup = 'start' | 'components'

export type DocPage = {
  slug: string
  group: DocGroup
  /** What the docs call it. The site is Liquid Glass, so components drop the prefix: "Button". */
  title: L
  /** Components: the export you import (`GlassButton`). Code, llms files and Markdown use it. */
  name?: string
  description: L
  /** Components: the one verb that names what it does (Press, Merge, Travel, Flow, Drag). */
  verb?: L
  /** One line: the single thing this component does that the others don't. */
  signature?: L
  /** Shown first on the page and used as the card preview. */
  hero?: string
  blocks: Block[]
}

export const GROUPS: { id: DocGroup; title: L }[] = [
  { id: 'start', title: { en: 'Get started', tr: 'Başlarken' } },
  { id: 'components', title: { en: 'Components', tr: 'Bileşenler' } },
]

// ── Registry ────────────────────────────────────────────────────────────────
// Every item installs into components/liquid-glass/. Files are copied byte-for-byte;
// nothing is generated or rewritten.

export type RegistryItem = {
  name: string
  title: string
  description: string
  /**
   * Entry files (repo paths). The build follows their relative imports and ships the
   * whole closure, each file to the same path under the user's `components/` folder
   * (src/components/liquid-glass/x.tsx → components/liquid-glass/x.tsx).
   */
  entries: string[]
  /** The docs page (slug) the item points to. Defaults to its name. */
  docs?: string
  dependencies?: string[]
  /** Tailwind v4 CSS the CLI merges into the user's stylesheet. */
  css?: Record<string, unknown>
  cssVars?: Record<string, Record<string, string>>
}

const liquid = (file: string) => `src/components/liquid-glass/${file}`

export const REGISTRY: RegistryItem[] = [
  {
    name: 'liquid-glass',
    title: 'Liquid Glass (everything)',
    description: 'GlassButton, GlassActionButton, GlassTabs, GlassBadge, GlassSlideToConfirm, GlassCard and GlassButtonGroup on one WebGL2 engine. GlassButton and GlassTabs need @ui-sdk/core and @ui-sdk/react.',
    entries: [liquid('index.ts')],
    dependencies: ['@ui-sdk/core'],
    docs: 'introduction',
  },
  { name: 'button', title: 'GlassButton', description: 'Press: a clear or tinted glass button that swells under the pointer. Needs @ui-sdk/core and @ui-sdk/react.', entries: [liquid('glass-button.tsx')], dependencies: ['@ui-sdk/core'] },
  {
    name: 'action-button',
    title: 'GlassActionButton',
    description: 'Merge: an async action button whose arrow droplet melts into the body when pressed, and stays.',
    entries: [liquid('glass-action-button.tsx')],
  },
  { name: 'tabs', title: 'GlassTabs', description: 'Travel: a segmented control whose selection travels as a lens (GlassLens included). Needs @ui-sdk/core and @ui-sdk/react.', entries: [liquid('glass-tabs.tsx')], dependencies: ['@ui-sdk/core'] },
  { name: 'badge', title: 'GlassBadge', description: 'Flow: a glass badge with its text flowing through the lens.', entries: [liquid('glass-badge.tsx')] },
  {
    name: 'slide-to-confirm',
    title: 'GlassSlideToConfirm',
    description: 'Drag: a slide-to-confirm track whose glass thumb is dragged to the end to run one deliberate action.',
    entries: [liquid('glass-slide-to-confirm.tsx')],
  },
  {
    name: 'card',
    title: 'GlassCard',
    description: 'Hold: a frosted glass card that holds your content while its rim bends what slides behind.',
    entries: [liquid('glass-card.tsx')],
  },
  {
    name: 'button-group',
    title: 'GlassButtonGroup',
    description: 'Share: related actions in one body of glass, side by side or stacked, with separators and text.',
    entries: [liquid('glass-button-group.tsx')],
  },
  // The controls below are drawn by their own renderer (controls/glass), which needs `three`; their behaviour is UI SDK's.
  { name: 'slider', title: 'RangeSlider', description: 'Slide: a range slider whose glass thumb opens into a wide lens while held. Needs three, @ui-sdk/core and @ui-sdk/react.', entries: [liquid('controls/RangeSlider.tsx')], dependencies: ['@ui-sdk/core'] },
  { name: 'switch', title: 'Switch', description: 'Flip: an on/off switch whose knob swells into a clear lens as it crosses the track. Needs three, @ui-sdk/core and @ui-sdk/react.', entries: [liquid('controls/Switch.tsx')], dependencies: ['@ui-sdk/core'] },
  { name: 'checkbox', title: 'Checkbox', description: 'Tick: a checkbox under a cap of clear glass. Needs three, @ui-sdk/core and @ui-sdk/react.', entries: [liquid('controls/Checkbox.tsx')], dependencies: ['@ui-sdk/core'] },  // Behaviour (keyboard, focus, the top layer, ARIA) comes from UI SDK; the glass is the kit's own engine.
  {
    name: 'select',
    title: 'GlassSelect',
    description: 'Stretch: a select whose list swells out of its button as one body of glass, on a neck that stretches and snaps (GlassPopup included). Needs @ui-sdk/core and @ui-sdk/react.',
    entries: [liquid('glass-select.tsx')],
    dependencies: ['@ui-sdk/core'],
  },
  {
    name: 'dropdown-menu',
    title: 'GlassDropdownMenu',
    description: 'Open: a menu of actions that swells out of its trigger, or out of a whole GlassButtonGroup, as one body of glass (GlassPopup included). Needs @ui-sdk/core and @ui-sdk/react.',
    entries: [liquid('glass-dropdown-menu.tsx')],
    dependencies: ['@ui-sdk/core'],
  },
  {
    name: 'popover',
    title: 'GlassPopover',
    description: 'Unfold: a small surface its button unfolds into, right where the button is (GlassPopup included). Needs @ui-sdk/core and @ui-sdk/react.',
    entries: [liquid('glass-popover.tsx')],
    dependencies: ['@ui-sdk/core'],
  },
  {
    name: 'menu',
    title: 'GlassMenu',
    description: 'Grow: a menu its button (or a whole GlassButtonGroup) grows into, on any side, with submenus, checkbox and radio items, groups and shortcuts (GlassPopup included). Needs @ui-sdk/core and @ui-sdk/react.',
    entries: [liquid('glass-menu.tsx')],
    dependencies: ['@ui-sdk/core'],
  },
]

// ── Pages ───────────────────────────────────────────────────────────────────

const t = (en: string, tr: string): L => ({ en, tr })

const h = (en: string, tr: string): Block => ({ type: 'h', text: t(en, tr) })

export const PAGES: DocPage[] = [
  {
    slug: 'introduction',
    group: 'start',
    title: t('Introduction', 'Giriş'),
    description: t(
      'Glass components for React. Copy a file, get exactly what the demo shows.',
      'React için cam bileşenleri. Dosyayı kopyala, demoda gördüğünün aynısını al.',
    ),
    blocks: [
      {
        type: 'p',
        text: t(
          'Liquid Glass UI is a set of React components drawn in WebGL2. Each does one thing the others don\'t. There is no npm package: you copy the files into your project, and they are yours.',
          'Liquid Glass UI, WebGL2 ile çizilen React bileşenleridir. Her biri, diğerlerinin yapmadığı tek bir işi yapar. npm paketi yok: dosyaları projene kopyalarsın ve artık senindir.',
        ),
      },
      { type: 'index' },
      h('How it works', 'Nasıl çalışır'),
      {
        type: 'list',
        items: [
          t('**One engine.** One WebGL2 context draws every glass surface on the page, in plain TypeScript files; only Slider, Switch and Checkbox keep a renderer of their own, built on three.js. Where a component needs behaviour (keyboard, focus, forms, ARIA), it comes from UI SDK.', '**Tek motor.** Sayfadaki cam yüzeyleri tek bir WebGL2 bağlamı çizer, düz TypeScript dosyalarında; yalnızca Slider, Switch ve Checkbox three.js üzerine kurulu kendi çizicisini kullanır. Bir bileşenin davranışa (klavye, odak, formlar, ARIA) ihtiyacı varsa, o UI SDK\'dan gelir.'),
          t('**Your DOM.** The glass is a canvas behind your own elements, so any router, any styling and your own markup keep working.', '**Senin DOM\'un.** Cam, senin öğelerinin arkasındaki bir tuvaldir; her router, her stil ve kendi işaretlemen çalışmaya devam eder.'),
          t('**Free at rest.** The render loop runs only while a spring moves and stops completely when nothing does.', '**Dururken bedava.** Çizim döngüsü yalnız bir yay hareket ederken çalışır, hiçbir şey kıpırdamıyorsa tamamen durur.'),
        ],
      },
      h('Browser support', 'Tarayıcı desteği'),
      {
        type: 'p',
        text: t(
          'The glass needs WebGL2, which current desktop and mobile browsers have. Without it, or before the first frame, every component keeps its plain CSS look: never a blank box. With reduced motion the springs stand still and the badge text stops.',
          'Cam WebGL2 ister; güncel masaüstü ve mobil tarayıcılarda vardır. Yoksa ya da ilk kare çizilene dek her bileşen sade CSS görünümünü korur: asla boş bir kutu değil. Hareketi azalt açıksa yaylar durur, rozetteki yazı akmaz.',
        ),
      },
      h('The one rule', 'Tek kural'),
      {
        type: 'p',
        text: t(
          'Copy the files verbatim. The look lives in the exact shader constants and spring values. Customise through props and class names, never by editing the engine.',
          'Dosyaları birebir kopyala. Görünüm gölgelendiricinin ve yayların tam değerlerinde yaşar. Özelleştirmeyi prop ve sınıf adlarıyla yap, motoru düzenleyerek değil.',
        ),
      },
    ],
  },
  {
    slug: 'installation',
    group: 'start',
    title: t('Installation', 'Kurulum'),
    description: t('Add components with the shadcn CLI, or copy the folder by hand.', 'Bileşenleri shadcn CLI ile ekle ya da klasörü elle kopyala.'),
    blocks: [
      h('Requirements', 'Gereksinimler'),
      {
        type: 'list',
        items: [
          t('React 19 (Next.js 15+, Vite, TanStack Start, React Router…)', 'React 19 (Next.js 15+, Vite, TanStack Start, React Router…)'),
          t('Tailwind CSS v4', 'Tailwind CSS v4'),
          t('An `@/` import alias pointing at your source folder (the shadcn default).', 'Kaynak klasörünü gösteren bir `@/` içe aktarma takma adı (shadcn varsayılanı).'),
        ],
      },
      h('With the CLI', 'CLI ile'),
      {
        type: 'p',
        text: t(
          'Every component page has its own command. This one installs all of them into `components/liquid-glass/`:',
          'Her bileşen sayfasının kendi komutu var. Bu komut hepsini birden `components/liquid-glass/` içine kurar:',
        ),
      },
      { type: 'install', item: 'liquid-glass' },
      h('By hand', 'Elle'),
      {
        type: 'p',
        text: t(
          'Copy `src/components/liquid-glass/` from the repository into your project as `components/liquid-glass/`. Nothing else is needed: no npm package, no CSS file (the components inject the few rules they need).',
          'Depodaki `src/components/liquid-glass/` klasörünü projene `components/liquid-glass/` olarak kopyala. Başka bir şey gerekmez: npm paketi yok, CSS dosyası yok (bileşenler ihtiyaç duydukları birkaç kuralı kendileri ekler).',
        ),
      },
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { GlassButton } from '@/components/liquid-glass'

export function Hero() {
  return <GlassButton material="tinted" className="bg-sky-500 text-white">Get started</GlassButton>
}`,
      },
      h('Dark mode', 'Karanlık mod'),
      {
        type: 'p',
        text: t(
          'The glass reads its colours from your CSS (the nearest opaque background and the element\'s own colours), so it follows whatever theme system you use. Clear glass picks its text colour from the tone it ends up, so labels stay readable on light and dark backdrops alike.',
          'Cam renklerini senin CSS\'inden okur (en yakın opak arka plan ve öğenin kendi renkleri); hangi tema sistemini kullanırsan onu izler. Berrak cam yazı rengini vardığı tondan seçer; etiketler açık ve koyu zeminlerde aynı şekilde okunur.',
        ),
      },
      h('Next.js', 'Next.js'),
      {
        type: 'p',
        text: t(
          'The files already start with `"use client"`. Import them from server components as usual.',
          'Dosyalar zaten `"use client"` ile başlıyor. Sunucu bileşenlerinden her zamanki gibi içe aktar.',
        ),
      },
    ],
  },
  {
    slug: 'ai',
    group: 'start',
    title: t('For AI agents', 'Yapay zekâ ajanları için'),
    description: t(
      'Machine-readable docs and a skill, so assistants install the real components instead of re-inventing them.',
      'Makinece okunur dokümanlar ve bir skill: asistanlar bileşenleri yeniden icat etmek yerine gerçeğini kursun.',
    ),
    blocks: [
      {
        type: 'p',
        text: t(
          'Every page of these docs exists as Markdown, and the whole set is published as `llms.txt` and `llms-full.txt`. Point your assistant at them, or install the skill.',
          'Bu dokümanın her sayfası Markdown olarak da var; tamamı `llms.txt` ve `llms-full.txt` olarak yayımlanır. Asistanını bunlara yönlendir ya da skill\'i kur.',
        ),
      },
      {
        type: 'list',
        items: [
          t('`/llms.txt` — index of every page with one line each.', '`/llms.txt` — her sayfanın tek satırlık dizini.'),
          t('`/llms-full.txt` — every page, every example, every prop in one file.', '`/llms-full.txt` — tüm sayfalar, örnekler ve prop\'lar tek dosyada.'),
          t('`/docs/<page>.md` — one page as Markdown (also under `/tr/docs/`).', '`/docs/<sayfa>.md` — tek sayfa Markdown olarak (`/tr/docs/` altında da).'),
          t('`/r/<item>.json` — shadcn registry items.', '`/r/<öğe>.json` — shadcn registry öğeleri.'),
        ],
      },
      h('Install the skill', 'Skill\'i kur'),
      { type: 'code', title: 'terminal', code: `npx skills add bilalgursen/liquid-glass` },
      {
        type: 'p',
        text: t(
          'The skill teaches an agent which component fits which need, the install command, the props, and the rule that matters most: copy the files verbatim and customise only through props and classes.',
          'Skill, ajana hangi bileşenin hangi ihtiyaca uyduğunu, kurulum komutunu, prop\'ları ve en önemli kuralı öğretir: dosyaları birebir kopyala, yalnız prop ve sınıflarla özelleştir.',
        ),
      },
      h('A prompt that works', 'İşe yarayan bir istem'),
      {
        type: 'code',
        title: 'prompt',
        code: `Add a glass "Deploy" button that shows Deploying… then Deployed ✓.
Use Liquid Glass UI (https://liquidglass.onemorethink.dev/llms.txt):
install it with the shadcn CLI, use its GlassActionButton as documented,
and do not modify the files in components/liquid-glass/.`,
      },
    ],
  },

  // ── Components ──
  {
    slug: 'button',
    group: 'components',
    title: t('Button', 'Button'),
    name: 'GlassButton',
    description: t(
      'A button made of glass. Clear glass bends the page behind it; tinted glass takes your background colour.',
      'Camdan bir buton. Berrak cam arkasındaki sayfayı büker; renkli cam senin arka plan rengini alır.',
    ),
    verb: t('Press', 'Bas'),
    signature: t('Swells under the pointer, bends the page behind it.', 'İmleç altında şişer, arkasındaki sayfayı büker.'),
    hero: 'glass-button-clear',
    blocks: [
      {
        type: 'when',
        use: [
          t('One action: a call to action, a toolbar button, a link that looks like a button.', 'Tek bir eylem: harekete geçirici buton, araç çubuğu butonu, buton gibi görünen bir bağlantı.'),
          t('Clear glass over imagery or colour, where the bend shows.', 'Bükülmenin göründüğü görsel ya da renk üstünde berrak cam.'),
        ],
        avoid: [
          t('An async action whose result should show on the button: use GlassActionButton.', 'Sonucu butonda görünmesi gereken asenkron bir eylem: GlassActionButton kullan.'),
          t('Choosing between options: use GlassTabs.', 'Seçenekler arasında seçim: GlassTabs kullan.'),
          t('Every button of a dense form: keep the glass for the action that matters.', 'Yoğun bir formun her butonu: camı önemli olan eyleme sakla.'),
        ],
      },
      { type: 'install', item: 'button' },
      {
        type: 'note',
        text: t(
          'The button underneath is UI SDK\'s, so Button needs `@ui-sdk/core` and `@ui-sdk/react`. Return a Promise from `onClick` and the button stays pending until it settles: it ignores further presses and says so to screen readers. The install command adds both packages at the exact version this was built on: UI SDK is in beta and its API may still change.',
          'Alttaki buton UI SDK\'nın butonudur; bu yüzden Button `@ui-sdk/core` ve `@ui-sdk/react` paketlerine ihtiyaç duyar. `onClick`\'ten bir Promise döndürürsen buton, o sonuçlanana kadar beklemede kalır: yeni basışları yok sayar ve bunu ekran okuyuculara bildirir. Kurulum komutu iki paketi, bileşenin yazıldığı tam sürümle ekler: UI SDK beta aşamasında ve API\'si hâlâ değişebilir.',
        ),
      },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { GlassButton } from '@/components/liquid-glass'

<GlassButton>Get started</GlassButton>
<GlassButton material="tinted" className="bg-sky-500 text-white">Save</GlassButton>
<GlassButton asChild>
  <Link href="/docs">Read the docs</Link>
</GlassButton>`,
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'glass-button-props', title: t('Every prop, side by side', 'Bütün prop\'lar yan yana') },
      {
        type: 'p',
        text: t(
          'One row per prop, its values next to each other: `material` (clear glass and three colours of tinted glass), `tint` at 0 and 1 over flat colour, the four of `size`, `icon` with `iconPosition`, and `pull`. The buttons of a row sit 10 px apart: hold one and pull it towards its neighbour, and the two melt into one body.',
          'Her prop için bir satır, değerleri yan yana: `material` (berrak cam ve üç renkte renkli cam), düz renk üstünde 0 ve 1 değerleriyle `tint`, dört `size`, `iconPosition` ile `icon` ve `pull`. Bir satırdaki butonlar arasında 10 px var: birini basılı tutup komşusuna doğru çek, ikisi tek gövdede kaynaşır.',
        ),
      },
      { type: 'demo', id: 'glass-button-tinted', title: t('Tinted colours and sizes', 'Renkli cam ve boyutlar') },
      {
        type: 'p',
        text: t(
          'Colour tinted glass with a normal class such as `bg-sky-500`; the glass paints itself in that colour and adds light and shadow. A `border-*` class becomes the glass rim.',
          'Renkli camı `bg-sky-500` gibi sıradan bir sınıfla boya; cam kendini o renge boyar, ışık ve gölge ekler. Bir `border-*` sınıfı camın kenarı olur.',
        ),
      },
      { type: 'demo', id: 'glass-button-link', title: t('As a link (asChild)', 'Bağlantı olarak (asChild)') },
      {
        type: 'p',
        text: t(
          'With `asChild` the glass goes on your single child element instead of a `<button>`: an `<a>`, a Next.js `<Link>`, a TanStack Router `<Link>`. Your element keeps its own props and navigation.',
          '`asChild` ile cam, `<button>` yerine tek çocuk öğene gelir: bir `<a>`, Next.js `<Link>`, TanStack Router `<Link>`. Öğen kendi prop\'larını ve gezinmesini korur.',
        ),
      },
      { type: 'demo', id: 'glass-button-scrim', title: t('Over colour with a scrim', 'Örtülü renkler üstünde') },
      {
        type: 'p',
        text: t(
          'Clear glass repaints what lies behind it: background colours, gradients and images, `<img>` and `<video>` the way the page crops them (`object-fit`), text, inline SVG icons and backdrop blur, in their stacking order. Shadows, `::before`/`::after` and conic gradients are not painted.',
          'Berrak cam arkasında kalanı yeniden boyar: arka plan renkleri, gradyanlar ve görseller, sayfanın kırptığı haliyle `<img>` ve `<video>` (`object-fit`), yazı, satır içi SVG ikonlar ve arka plan bulanıklığı; hepsi kendi yığın sırasıyla. Gölgeler, `::before`/`::after` ve konik gradyanlar boyanmaz.',
        ),
      },
      {
        type: 'note',
        text: t(
          'An image from another origin must be served with CORS headers (image CDNs usually send them): the glass requests it again with CORS, and leaves it out if the server refuses.',
          'Başka bir kaynaktan gelen görsel CORS başlıklarıyla sunulmalıdır (görsel CDN\'leri çoğunlukla gönderir): cam görseli CORS ile yeniden ister, sunucu izin vermezse onu dışarıda bırakır.',
        ),
      },
      { type: 'demo', id: 'glass-button-corners', title: t('Square corners', 'Köşeli') },
      {
        type: 'p',
        text: t(
          'The glass takes the corners of the element it sits on. Add a `rounded-*` class and the lens, its rim and its shadow follow; the bend stays as deep as on a pill.',
          'Cam, üstünde durduğu öğenin köşelerini alır. Bir `rounded-*` sınıfı ekle; mercek, kenarı ve gölgesi onu izler, bükülme haptaki kadar derin kalır.',
        ),
      },
      { type: 'demo', id: 'glass-button-pull', title: t('Hold and drag (pull)', 'Basılı tutup çek (pull)') },
      {
        type: 'p',
        text: t(
          'A pointer that holds the button and drags away pulls it after itself. The button follows a little way through a rubber band (10 px at most on a wide button), stretches along the pull and thins across it, and swings back like gel when you let go. A button up to 72 px follows from the point it was pressed at; a wider one moves only once the pointer is past its edge. On by default (`pull={false}` keeps the button in its place), and still under reduced motion. Let go outside the button and nothing is clicked, as with any button.',
          'Butonu basılı tutup uzağa sürükleyen imleç onu peşinden çeker. Buton bir lastik bantla biraz gelir (geniş butonda en çok 10 px), çekiş yönünde uzar, karşı yönde incelir; bırakınca jöle gibi yerine yaylanır. 72 px\'e kadar olan buton basıldığı noktadan itibaren imleci izler; daha geniş olan, imleç kenarını geçince kıpırdar. Varsayılan olarak açıktır (`pull={false}` butonu yerinde tutar); azaltılmış harekette buton yerinde durur. Butonun dışında bırakırsan, her butonda olduğu gibi tıklama gerçekleşmez.',
        ),
      },
      {
        type: 'p',
        text: t(
          'Two buttons that come near each other melt into one body, as two drops of liquid do: pull the round button towards the wide one above. Within reach the sides that face each other lean out, nearer still a bridge forms, and it thins and lets go as they part. They begin to melt once the gap between them is under 6 px, and join under half of that (`COHESION` in `engine.ts`). Joined, hold one and part of its light runs on into the other. Every button of the kit does it, Action Button and Button Group included; a card, a menu or a lens never melts.',
          'Birbirine yaklaşan iki buton, iki damla sıvı gibi tek gövdede kaynaşır: yukarıdaki yuvarlak butonu geniş olana doğru çek. Erime girince birbirine bakan kenarlar dışa doğru uzanır, daha da yaklaşınca aralarında bir köprü oluşur, ayrılırken köprü incelip kopar. Aradaki boşluk 6 px\'in altına inince kaynaşmaya başlarlar, bunun yarısının altında birleşirler (`engine.ts` içinde `COHESION`). Birleşince birini basılı tut, ışığının bir kısmı ötekine de akar. Kitin her butonu bunu yapar, Action Button ve Button Group da; kart, menü ya da mercek asla kaynaşmaz.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'material', type: "'clear' | 'tinted'", default: "'clear'", description: t('Clear bends the page; tinted uses the background colour.', 'Clear sayfayı büker; tinted arka plan rengini kullanır.') },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: t('Height 32, 40, 48 or 64 px.', 'Yükseklik 32, 40, 48 ya da 64 px.') },
          { name: 'icon', type: 'ReactNode', description: t('An icon element (e.g. a lucide-react icon).', 'Bir ikon öğesi (ör. lucide-react ikonu).') },
          { name: 'iconPosition', type: "'start' | 'end'", default: "'end'", description: t('Which side the icon sits on.', 'İkonun hangi tarafta durduğu.') },
          { name: 'tint', type: 'number', default: '0.6', description: t('Clear glass only: how much tint covers the backdrop (0–1).', 'Yalnız clear: renk tonunun arkayı ne kadar örttüğü (0–1).') },
          { name: 'asChild', type: 'boolean', default: 'false', description: t('Put the glass on the single child element instead of a `<button>`.', 'Camı `<button>` yerine tek çocuk öğeye koy.') },
          { name: 'pull', type: 'boolean', default: 'true', description: t('Hold and drag: the button follows the pointer a little way, stretches along the pull and swings back when let go.', 'Basılı tutup sürükle: buton imlecin peşinden biraz gelir, çekiş yönünde uzar, bırakınca yerine yaylanır.') },
          { name: '…rest', type: 'button attributes', description: t('Passed to the button: `onClick`, `disabled`, `type`, and UI SDK\'s `pendingAnnouncement` and `focusableWhenDisabled`.', 'Butona aktarılır: `onClick`, `disabled`, `type` ve UI SDK\'nın `pendingAnnouncement` ile `focusableWhenDisabled` prop\'ları.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A real `<button>` (or your own element with `asChild`): focus, Enter and Space work as usual.', 'Gerçek bir `<button>` (ya da `asChild` ile kendi öğen): odak, Enter ve Space her zamanki gibi çalışır.'),
          t('The glass canvas is `aria-hidden`; only your label is announced.', 'Cam tuvali `aria-hidden`; yalnız senin etiketin okunur.'),
          t('Icon-only buttons need an `aria-label`.', 'Yalnız ikonlu butonlar `aria-label` ister.'),
        ],
      },
    ],
  },
  {
    slug: 'action-button',
    group: 'components',
    title: t('Action Button', 'Action Button'),
    name: 'GlassActionButton',
    description: t(
      'A button for one async action. Its arrow floats apart as a glass droplet; press it and the droplet melts into the body, and stays.',
      'Tek bir asenkron eylem için buton. Oku ayrı bir cam damlası olarak durur; basınca damla gövdeye karışır ve öyle kalır.',
    ),
    verb: t('Merge', 'Birleş'),
    signature: t('The arrow is a droplet: press it and it melts in for good.', 'Ok bir damla: basınca gövdeye karışır ve öyle kalır.'),
    hero: 'glass-action-button-basic',
    blocks: [
      {
        type: 'when',
        use: [
          t('One async commit whose result belongs on the button: Deploy, Publish, Add to cart, Subscribe.', 'Sonucu butonun üstünde görünmesi gereken tek bir asenkron eylem: Yayınla, Gönder, Sepete ekle, Abone ol.'),
          t('Actions that stay done: the merged "Deployed ✓" is the new state of the page.', 'Bir kez yapılınca öyle kalan eylemler: birleşmiş "Deployed ✓" sayfanın yeni durumudur.'),
        ],
        avoid: [
          t('Plain links and instant actions: use GlassButton.', 'Sıradan bağlantılar ve anlık eylemler: GlassButton kullan.'),
          t('Toggling back and forth between two states: use GlassTabs.', 'İki durum arasında gidip gelmek: GlassTabs kullan.'),
          t('More than one per screen: the droplet is the kit\'s one gooey effect, keep it special.', 'Ekran başına birden fazla: damla setin tek yapışkan efekti, özel kalsın.'),
        ],
      },
      { type: 'install', item: 'action-button' },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { GlassActionButton } from '@/components/liquid-glass'

<GlassActionButton
  material="tinted"
  className="bg-neutral-900 text-white"
  pendingLabel="Deploying"
  successLabel="Deployed"
  onAction={deploy} // return the promise
>
  Deploy
</GlassActionButton>`,
      },
      h('The flow', 'Akış'),
      {
        type: 'list',
        items: [
          t('**Idle.** The arrow floats apart from the body as a separate glass droplet.', '**Boşta.** Ok, gövdeden ayrı bir cam damlası olarak durur.'),
          t('**Press.** The droplet stretches back on a gooey bridge and melts into the body.', '**Bas.** Damla yapışkan bir köprüyle geri uzanır ve gövdeye karışır.'),
          t('**Pending.** One body; the label morphs to `pendingLabel` and a spinner turns where the arrow was, until the promise from `onAction` settles.', '**Bekleme.** Tek gövde; etiket `pendingLabel`\'a dönüşür ve okun yerinde bir döner simge, `onAction`\'ın döndürdüğü söz sonuçlanana dek döner.'),
          t('**Success.** Still one body: `successLabel` and a check that draws itself in. As it lands the glass swells, as if hovered and pressed at the same time, and stretches the label and the check with it; it lets go a moment after the label is in. It stays merged, unless you set `resetAfter`.', '**Başarı.** Hâlâ tek gövde: `successLabel` ve kendini çizen bir onay işareti. O anda cam, aynı anda hem üstüne gelinmiş hem basılmış gibi şişer; etiketi ve onay işaretini de kendisiyle birlikte esnetir, etiket yerine geldikten bir an sonra da bırakır. `resetAfter` vermezsen öyle kalır.'),
          t('**Error.** If `onAction` throws, the droplet splits off again and `onActionError` gets the error.', '**Hata.** `onAction` hata fırlatırsa damla yeniden ayrılır ve hata `onActionError`\'a gider.'),
          t('**Start over.** Change `resetKey` and the droplet splits off again from any state. Don\'t remount the button with `key`: that snaps it back.', '**Baştan başla.** `resetKey`\'i değiştirince damla her durumdan yeniden ayrılır. Butonu `key` ile baştan kurma: o zaman birden atlar.'),
        ],
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'glass-action-button-reset', title: t('Reset after success, and a failing action', 'Başarıdan sonra sıfırlama ve başarısız bir eylem') },
      {
        type: 'p',
        text: t(
          'With `resetAfter={2400}` the droplet splits off again 2.4 seconds after a success, ready for the next press. Any icon element can be the droplet with `icon`; the spinner and the check are built in.',
          '`resetAfter={2400}` ile damla, başarıdan 2,4 saniye sonra yeniden ayrılır ve bir sonraki basışa hazır olur. `icon` ile herhangi bir ikon damla olabilir; döner simge ve onay işareti hazır gelir.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'children', type: 'ReactNode', description: t('The idle label, and the button\'s accessible name.', 'Boştaki etiket; butonun erişilebilir adı da budur.') },
          { name: 'onAction', type: '() => unknown', description: t('Required. Runs on press; return a promise to stay pending until it settles.', 'Zorunlu. Basınca çalışır; sonuçlanana dek beklemede kalmak için bir söz (promise) döndür.') },
          { name: 'onActionError', type: '(error) => void', description: t('Called when `onAction` throws; the button returns to idle.', '`onAction` hata fırlatınca çağrılır; buton boşta durumuna döner.') },
          { name: 'pendingLabel', type: 'ReactNode', default: 'children', description: t('Label while `onAction` runs.', '`onAction` çalışırken etiket.') },
          { name: 'successLabel', type: 'ReactNode', default: 'children', description: t('Label after it succeeds.', 'Başarıdan sonraki etiket.') },
          { name: 'resetAfter', type: 'number', default: '0', description: t('Milliseconds before splitting off again after a success. `0` stays merged.', 'Başarıdan sonra yeniden ayrılmadan önceki milisaniye. `0` birleşik kalır.') },
          { name: 'resetKey', type: 'unknown', description: t('Change it to return to idle: the droplet splits off again. A running action\'s result is dropped.', 'Değiştirince buton boşta durumuna döner: damla yeniden ayrılır. Süren eylemin sonucu yok sayılır.') },
          { name: 'icon', type: 'ReactNode', default: 'arrow', description: t('The droplet\'s idle icon.', 'Damlanın boştaki ikonu.') },
          { name: 'material', type: "'clear' | 'tinted'", default: "'clear'", description: t('As on GlassButton.', 'GlassButton\'daki gibi.') },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t('Height 32, 40 or 48 px.', 'Yükseklik 32, 40 ya da 48 px.') },
          { name: '…rest', type: 'button attributes', description: t('Passed to the `<button>` (not `onClick`: use `onAction`).', '`<button>`\'a aktarılır (`onClick` değil: `onAction` kullan).') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A real `<button>`; Enter and Space run the action.', 'Gerçek bir `<button>`; Enter ve Space eylemi çalıştırır.'),
          t('Pending sets `aria-busy`, and pending or done sets `aria-disabled` instead of `disabled`, so focus stays on the button.', 'Bekleme `aria-busy` koyar; bekleme ya da bitmiş durum `disabled` yerine `aria-disabled` koyar, böylece odak butonda kalır.'),
          t('A `role="status"` region announces the pending and success labels.', 'Bir `role="status"` bölgesi bekleme ve başarı etiketlerini duyurur.'),
          t('With reduced motion the droplet and labels switch without animation.', 'Hareketi azalt açıksa damla ve etiketler animasyonsuz değişir.'),
        ],
      },
    ],
  },
  {
    slug: 'tabs',
    group: 'components',
    title: t('Tabs', 'Tabs'),
    name: 'GlassTabs',
    description: t('A segmented control whose selection travels as a glass lens.', 'Seçimi bir cam mercek olarak yolculuk eden bölümlü seçici.'),
    verb: t('Travel', 'Kay'),
    signature: t('The selection travels as a lens that magnifies what it passes.', 'Seçim, geçtiğini büyüten bir mercek olarak yolculuk eder.'),
    hero: 'glass-tabs-basic',
    blocks: [
      {
        type: 'when',
        use: [
          t('Switching a view or a range in place: Day / Week / Month, List / Grid.', 'Yerinde görünüm ya da aralık değiştirmek: Gün / Hafta / Ay, Liste / Izgara.'),
          t('Two to five short options.', 'İki ile beş arası kısa seçenek.'),
        ],
        avoid: [
          t('Navigating between pages: use links.', 'Sayfalar arası gezinme: bağlantı kullan.'),
          t('Long lists of options: use a select.', 'Uzun seçenek listeleri: select kullan.'),
        ],
      },
      { type: 'install', item: 'tabs' },
      {
        type: 'note',
        text: t(
          'The behaviour (one tab stop, arrow keys, a hidden radio per option for forms) comes from UI SDK\'s segmented control, so Tabs needs `@ui-sdk/core` and `@ui-sdk/react`. The install command adds them at the exact version this was built on: UI SDK is in beta and its API may still change.',
          'Davranış (tek sekme durağı, ok tuşları, formlar için her seçeneğe gizli bir radio) UI SDK\'nın segmented control\'ünden gelir; bu yüzden Tabs `@ui-sdk/core` ve `@ui-sdk/react` paketlerine ihtiyaç duyar. Kurulum komutu onları, bileşenin yazıldığı tam sürümle ekler: UI SDK beta aşamasında ve API\'si hâlâ değişebilir.',
        ),
      },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { GlassTabs } from '@/components/liquid-glass'

const [view, setView] = useState('week')

<GlassTabs
  aria-label="Range"
  value={view}
  onValueChange={setView}
  options={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
  ]}
/>`,
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'glass-tabs-icons', title: t('With icons', 'İkonlarla') },
      {
        type: 'p',
        text: t(
          'When the selection changes, the highlight leaves its option, becomes clear glass that bends the labels it passes, and settles as a flat pill again. Press and hold to open the lens in place; drag and release to choose.',
          'Seçim değişince vurgu seçeneğinden ayrılır, geçtiği etiketleri büken berrak bir cama dönüşür ve yine düz bir hap olarak oturur. Basılı tutunca mercek yerinde açılır; sürükleyip bırakarak seçersin.',
        ),
      },
      h('Your own markup', 'Kendi işaretlemen'),
      {
        type: 'p',
        text: t(
          'Already have tabs (Radix Tabs, your own radio group)? Put the lens on them with `GlassLens`, which ships with GlassTabs:',
          'Zaten sekmelerin mi var (Radix Tabs, kendi radyo grubun)? Merceği GlassTabs ile birlikte gelen `GlassLens` ile onlara koy:',
        ),
      },
      {
        type: 'list',
        items: [
          t('The container is `relative isolate` and `<GlassLens value={value} />` is its first child.', 'Kap `relative isolate` olur ve `<GlassLens value={value} />` ilk çocuğudur.'),
          t('Options carry `role="radio"` or `role="tab"` (Radix Tabs works as is)', 'Seçenekler `role="radio"` ya da `role="tab"` taşır (Radix Tabs olduğu gibi çalışır)'),
          t(
            'The selected option contains the resting highlight, marked `data-glass-highlight`. Its background colour is the lens colour and its corners are the lens corners: `rounded-full` travels as a pill, `rounded-lg` as a rounded rectangle.',
            'Seçili seçenek, `data-glass-highlight` ile işaretli duran vurguyu içerir. Arka plan rengi merceğin rengi, köşeleri merceğin köşeleridir: `rounded-full` hap olarak, `rounded-lg` köşeleri yuvarlatılmış dikdörtgen olarak kayar.',
          ),
          t('Hide the highlight while the lens moves: `[[data-glass-moving]_&]:opacity-0`.', 'Mercek hareket ederken vurguyu gizle: `[[data-glass-moving]_&]:opacity-0`.'),
        ],
      },
      { type: 'demo', id: 'glass-tabs-custom', title: t('A billing switch with GlassLens', 'GlassLens ile bir ödeme seçici') },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'options', type: '{ value, label, icon?, aria-label? }[]', description: t('The segments.', 'Bölümler.') },
          { name: 'value', type: 'string | null', description: t('Selected value (controlled).', 'Seçili değer (kontrollü).') },
          { name: 'onValueChange', type: '(value) => void', description: t('Called with the new value.', 'Yeni değerle çağrılır.') },
          { name: 'aria-label', type: 'string', description: t('Required: names the group for screen readers.', 'Zorunlu: grubu ekran okuyuculara adlandırır.') },
          { name: 'name', type: 'string', description: t('Submits the selected value under this name with the form around it.', 'Seçili değeri, çevresindeki formla bu adla gönderir.') },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t('Segment height 28, 32 or 40 px.', 'Bölüm yüksekliği 28, 32 ya da 40 px.') },
          { name: 'highlightClassName', type: 'string', default: "'bg-white dark:bg-neutral-700'", description: t('Classes of the resting pill; its background is the lens colour.', 'Duran hapın sınıfları; arka planı merceğin rengidir.') },
          { name: 'GlassLens value', type: 'string | number | null', description: t('Your own markup: the selected value; any change moves the lens.', 'Kendi işaretlemen: seçili değer; her değişiklik merceği taşır.') },
          { name: 'GlassLens disabled', type: 'boolean', default: 'false', description: t('No lens; the highlight simply jumps.', 'Mercek yok; vurgu doğrudan yer değiştirir.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('Radiogroup pattern: one tab stop, arrow keys move the selection.', 'Radiogroup kalıbı: tek sekme durağı, ok tuşları seçimi taşır.'),
          t('Icon-only options take an `aria-label` each.', 'Yalnız ikonlu seçenekler kendi `aria-label`\'ını alır.'),
          t('With reduced motion the pill simply jumps.', 'Hareketi azalt açıksa hap doğrudan yer değiştirir.'),
        ],
      },
    ],
  },
  {
    slug: 'badge',
    group: 'components',
    title: t('Badge', 'Badge'),
    name: 'GlassBadge',
    description: t('A small glass badge with its text flowing through the lens.', 'İçinden yazısı akan küçük bir cam rozet.'),
    verb: t('Flow', 'Ak'),
    signature: t('Text flows through the glass; the rim bends each letter.', 'Yazı camın içinden akar; kenar her harfi büker.'),
    hero: 'glass-badge-basic',
    blocks: [
      {
        type: 'when',
        use: [t('One short word on a card or a tab: New, Beta, Live.', 'Bir kartta ya da sekmede tek kısa kelime: Yeni, Beta, Canlı.')],
        avoid: [
          t('Counts or status that must be read at a glance: the text is moving.', 'Bir bakışta okunması gereken sayı ya da durum: yazı hareket ediyor.'),
          t('Several on one screen: the motion competes.', 'Bir ekranda birkaç tane: hareketler yarışır.'),
        ],
      },
      { type: 'install', item: 'badge' },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { GlassBadge } from '@/components/liquid-glass'

<div className="relative">
  <Card />
  <GlassBadge className="absolute -top-2 -right-2">New</GlassBadge>
</div>`,
      },
      h('Behaviour', 'Davranış'),
      {
        type: 'p',
        text: t(
          'The text is drawn beneath the glass, so the rim bends the letters as they pass. Whatever sits behind the badge shows through, softly blurred. Hovering the badge\'s positioned parent speeds the flow up. Colour it with `bg-*` and `text-*`. With `tint` at 0.6 or below the glass counts as clear, and its rim mirrors the colours around it.',
          'Yazı camın altında çizilir; kenar, geçen harfleri büker. Rozetin arkasındaki her şey yumuşakça bulanık görünür. Rozetin konumlu atasının üstüne gelince akış hızlanır. `bg-*` ve `text-*` ile renklendir. `tint` 0.6 ya da altındayken cam şeffaf sayılır ve kenarı çevresindeki renkleri yansıtır.',
        ),
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'glass-badge-colors', title: t('Your colours', 'Kendi renklerin') },
      {
        type: 'p',
        text: t(
          'The badge takes its colour from its own classes: `bg-*` is the glass, `text-*` the text that flows through it, and `dotColor` the square between repeats. Hover speeds up only the badge whose positioned parent is under the pointer.',
          'Rozet rengini kendi sınıflarından alır: `bg-*` camın, `text-*` içinden akan yazının, `dotColor` ise tekrarlar arasındaki karenin rengidir. İmleç hangi konumlu atanın üstündeyse yalnız onun rozeti hızlanır.',
        ),
      },
      { type: 'demo', id: 'glass-badge-palette', title: t('A palette', 'Bir palet') },
      {
        type: 'p',
        text: t(
          'Any `bg-*` works as the glass. Pair it with a `text-*` that reads on it (dark text on amber, white on the rest) and a `dotColor` a shade away from the text. They sit side by side here only to compare: in a product, keep to one badge per view.',
          'Her `bg-*` cam rengi olur. Yanına üstünde okunan bir `text-*` (amberde koyu, diğerlerinde beyaz yazı) ve yazıdan bir ton farklı bir `dotColor` koy. Burada yalnız karşılaştırmak için yan yanalar: üründe ekran başına tek rozet kullan.',
        ),
      },
      { type: 'demo', id: 'glass-badge-product', title: t('On a product, for a sale', 'Bir ürünün üstünde, indirim için') },
      {
        type: 'p',
        text: t(
          'A rose badge hangs off the corner of the cover. Half of it is over the yellow and half over the page, so the glass shows both.',
          'Gül rengi bir rozet kapağın köşesinden taşar. Yarısı sarının, yarısı sayfanın üstündedir; cam ikisini de gösterir.',
        ),
      },
      { type: 'demo', id: 'glass-badge-dock', title: t('On a dock item', 'Bir dock öğesinin üstünde') },
      {
        type: 'p',
        text: t(
          'Put the badge inside the button and give the button `relative`: the orange badge then speeds up when that item is hovered, not the whole dock.',
          'Rozeti düğmenin içine koy ve düğmeye `relative` ver: turuncu rozet o zaman bütün dock\'ta değil, yalnız o öğenin üstüne gelince hızlanır.',
        ),
      },
      { type: 'demo', id: 'glass-badge-tint', title: t('Clearer glass over colour', 'Rengin üstünde daha berrak cam') },
      {
        type: 'p',
        text: t(
          '`tint` is how much of the badge colour covers what is behind it. At the default `0.82` the badge reads as a solid colour; lower it over a colourful backdrop and the backdrop shows in the glass, softly blurred. `speed` is the pace at rest, in loops per second. The badge is 64 px wide by default: widen it with a `w-*` class for a longer word.',
          '`tint`, rozet renginin arkasında kalanı ne kadar örttüğüdür. Varsayılan `0.82` değerinde rozet düz bir renk gibi okunur; renkli bir zeminde düşürürsen zemin camın içinde yumuşakça bulanık görünür. `speed`, dururkenki hızdır (saniyedeki tur sayısı). Rozet varsayılan olarak 64 px genişliğindedir: daha uzun bir kelime için `w-*` sınıfıyla genişlet.',
        ),
      },
      { type: 'demo', id: 'glass-badge-inline', title: t('Inline, next to a label', 'Satır içinde, bir etiketin yanında') },
      {
        type: 'p',
        text: t(
          'Without a position class the badge sits in the line like any inline element. Give the row `relative` so the hover that speeds the text up belongs to that row.',
          'Konum sınıfı vermezsen rozet, satır içi herhangi bir öğe gibi satırda durur. Yazıyı hızlandıran hover o satıra ait olsun diye satıra `relative` ver.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'children', type: 'string', description: t('The text: one short word.', 'Yazı: tek kısa kelime.') },
          { name: 'dotColor', type: 'string', default: 'currentColor', description: t('Separator colour between repeats.', 'Tekrarlar arasındaki ayracın rengi.') },
          { name: 'speed', type: 'number', default: '0.4', description: t('Loops per second at rest.', 'Dururken saniyedeki tur sayısı.') },
          { name: 'tint', type: 'number', default: '0.82', description: t('Opacity of the badge colour over the backdrop.', 'Rozet renginin arka plan üzerindeki opaklığı.') },
          { name: 'className', type: 'string', description: t('Position and colour (`bg-*`, `text-*`).', 'Konum ve renk (`bg-*`, `text-*`).') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('The text is announced once, not as a loop.', 'Yazı döngü olarak değil, bir kez okunur.'),
          t('With reduced motion the text stands still, centred.', 'Hareketi azalt açıksa yazı ortada durur.'),
        ],
      },
    ],
  },
  {
    slug: 'slide-to-confirm',
    group: 'components',
    title: t('Slide to Confirm', 'Slide to Confirm'),
    name: 'GlassSlideToConfirm',
    description: t(
      'A slide-to-confirm track. Drag its glass thumb to the end to run one deliberate action; let go early and it springs back.',
      'Kaydırarak onaylama rayı. Cam topuzu sona kadar sürükleyince tek bir bilinçli eylem çalışır; erken bırakırsan geri yaylanır.',
    ),
    verb: t('Drag', 'Sürükle'),
    signature: t('Drag the glass thumb to the end to confirm.', 'Cam topuzu sona kadar sürükle, onaylansın.'),
    hero: 'glass-slide-to-confirm-mirror',
    blocks: [
      {
        type: 'when',
        use: [
          t('A routine action a stray tap must not trigger: send money, pay, unlock, start a shift.', 'Yanlışlıkla dokunuşun tetiklememesi gereken sıradan bir eylem: para gönder, öde, kilidi aç, vardiyayı başlat.'),
          t('Phone-first surfaces, where a deliberate horizontal gesture replaces a confirm dialog.', 'Bilinçli bir yatay hareketin onay penceresinin yerini aldığı, önce telefon için tasarlanan yüzeyler.'),
        ],
        avoid: [
          t('Easily undone actions: use GlassButton.', 'Kolayca geri alınan eylemler: GlassButton kullan.'),
          t('An async action a single press may start: use GlassActionButton.', 'Tek basışla başlayabilecek asenkron bir eylem: GlassActionButton kullan.'),
          t('Consequences people must read first: use a dialog.', 'Önce okunması gereken sonuçlar: bir onay penceresi kullan.'),
        ],
      },
      { type: 'install', item: 'slide-to-confirm' },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { GlassSlideToConfirm } from '@/components/liquid-glass'

<GlassSlideToConfirm
  pendingLabel="Sending"
  successLabel="Sent"
  errorLabel="Not sent, slide to retry"
  onConfirm={send} // return the promise
>
  Slide to send $240
</GlassSlideToConfirm>`,
      },
      h('The flow', 'Akış'),
      {
        type: 'list',
        items: [
          t('**Idle.** The thumb rests at the start as frosted white glass; the instruction is written in the track.', '**Boşta.** Topuz başta buzlu beyaz cam olarak durur; yönerge rayın içinde yazar.'),
          t('**Drag.** The thumb turns to clear glass and bends the fill and the label it passes; its chevron stays in place, in the fill\'s text colour. It stays round while held, and speed stretches it along its travel. The fill trails a moment behind, joined to the thumb by a bridge that thins as they pull apart, and the track and the fill swell around the thumb like a membrane. Pushed past the end the track stretches like a rubber band; pushed against the start the wall gives a little. The thumb stays round at both.', '**Sürükle.** Topuz berrak cama dönüşür, geçtiği dolguyu ve etiketi büker; oku yerinde kalır ve dolgunun yazı rengini alır. Tutulurken yuvarlak kalır, hız onu gittiği yönde uzatır. Dolgu bir an geriden gelir; topuza, aralarındaki mesafe açıldıkça incelen bir köprüyle bağlıdır. Ray ve dolgu da topuzun çevresinde bir zar gibi şişer. Sonu aşacak kadar itilince ray lastik gibi uzar; başa doğru itilince duvar biraz esner. Topuz iki uçta da yuvarlak kalır.'),
          t('**Let go early.** Below `threshold` the thumb springs back; the fill\'s tail follows and is absorbed after it.', '**Erken bırak.** `threshold` altında topuz geri yaylanır; dolgunun kuyruğu arkasından gelir ve emilir.'),
          t('**Pending.** Past the threshold the thumb lands at the end, the track draws in to a ring around it and `pendingLabel` appears beside it while a spinner takes the chevron\'s place, until the promise from `onConfirm` settles.', '**Bekleme.** Eşiği geçince topuz sona oturur, ray onun çevresinde bir halkaya çekilir ve `pendingLabel` yanında belirir, okun yerini bir döner simge alır; `onConfirm`\'in döndürdüğü söz sonuçlanana dek.'),
          t('**Success.** The white glass takes the fill\'s colour and the chevron\'s stroke bends into a check, beside `successLabel`; the thumb swells and settles as the check appears. It stays confirmed, unless you set `resetAfter`: then the track opens first, `successLabel` leaving with its edge, and the thumb flies home after it, squashing a little as it lands against the start.', '**Başarı.** Beyaz cam dolgunun rengine bürünür, okun çizgisi `successLabel`\'ın yanında bir onay işaretine bükülür; işaret belirirken topuz büyüyüp yerine oturur. `resetAfter` vermezsen onaylı kalır; verirsen önce ray açılır ve `successLabel` onun kenarıyla birlikte çekilir, topuz ardından hızla başa döner ve başa çarparken hafifçe ezilir.'),
          t('**Error.** If `onConfirm` throws, the track opens again, the thumb returns and `errorLabel` replaces the instruction until the next slide.', '**Hata.** `onConfirm` hata fırlatırsa ray yeniden açılır, topuz geri döner ve `errorLabel` bir sonraki sürüklemeye dek yönergenin yerini alır.'),
        ],
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'glass-slide-to-confirm-compact', title: t('A fill, and an action that takes a moment', 'Dolgulu ray ve biraz süren bir eylem') },
      {
        type: 'p',
        text: t(
          '`fill={false}` leaves the track bare: the thumb pulls no fill behind it and bends the label alone, its icon dark on a light page and white on a dark one; `fillClassName` then colours only the success. `mirror` lets the held thumb\'s rim mirror the page around the track, so a colourful neighbour (the orange button in the preview at the top of this page) lights the rim that faces it, and the icon inside glows. Both are off unless you ask: the thumb mirrors only while it is clear, never at rest.',
          '`fill={false}` rayı dolgusuz bırakır: topuz arkasından dolgu çekmez, yalnızca etiketi büker; ikonu açık sayfada koyu, koyu sayfada beyazdır. `fillClassName` o zaman yalnızca başarı rengini belirler. `mirror`, tutulan topuzun kenarının rayın çevresindeki sayfayı yansıtmasını sağlar; renkli bir komşu (sayfanın başındaki önizlemede turuncu buton) kendisine bakan kenarı aydınlatır, içindeki ikon da ışıldar. İkisi de sen istemedikçe kapalıdır: topuz yalnızca berrakken yansıtır, dururken asla.',
        ),
      },
      {
        type: 'p',
        text: t(
          'Colour the fill with `fillClassName`: its `bg-*` is the fill, its `text-*` is the label written on it, and the thumb\'s icon while the glass is clear. At rest the thumb is always frosted white glass with a dark icon (a flat white disc without WebGL2). The control fills its container, so set the width on a parent or with `className`.',
          'Dolguyu `fillClassName` ile renklendir: `bg-*` dolgunun rengi, `text-*` ise üstüne yazılan etiketin ve cam berrakken topuzdaki ikonun rengidir. Topuz dururken her zaman koyu ikonlu buzlu beyaz camdır (WebGL2 yoksa düz beyaz bir disk). Bileşen kabını doldurur; genişliği bir üst öğede ya da `className` ile ver.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'children', type: 'string', description: t('The instruction in the track, and the slider\'s accessible name.', 'Raydaki yönerge; kaydırıcının erişilebilir adı da budur.') },
          { name: 'onConfirm', type: '() => unknown', description: t('Required. Runs once the thumb reaches the end; return a promise to stay pending until it settles.', 'Zorunlu. Topuz sona varınca bir kez çalışır; sonuçlanana dek beklemede kalmak için bir söz (promise) döndür.') },
          { name: 'onConfirmError', type: '(error) => void', description: t('Called when `onConfirm` throws; the thumb springs back.', '`onConfirm` hata fırlatınca çağrılır; topuz geri yaylanır.') },
          { name: 'pendingLabel', type: 'string', description: t('Written beside the spinner while `onConfirm` runs.', '`onConfirm` çalışırken döner simgenin yanında yazar.') },
          { name: 'successLabel', type: 'string', description: t('Written beside the check after it succeeds.', 'Başarıdan sonra onay işaretinin yanında yazar.') },
          { name: 'errorLabel', type: 'string', description: t('Replaces the instruction after a failure, until the next slide.', 'Hatadan sonra, bir sonraki sürüklemeye dek yönergenin yerini alır.') },
          { name: 'threshold', type: 'number', default: '0.9', description: t('Share of the track the thumb must pass before letting go confirms.', 'Bırakınca onaylanması için topuzun geçmesi gereken ray payı.') },
          { name: 'resetAfter', type: 'number', default: '0', description: t('Milliseconds after a success before the track opens again. `0` stays confirmed.', 'Başarıdan sonra rayın yeniden açılmasından önceki milisaniye. `0` onaylı kalır.') },
          { name: 'hint', type: 'boolean', default: 'true', description: t('Nudges the thumb every few seconds until it has been touched. Off with reduced motion.', 'Dokunulana dek topuzu birkaç saniyede bir hafifçe iter. Hareketi azalt açıksa kapalıdır.') },
          { name: 'icon', type: 'ReactNode', default: 'chevron', description: t('The thumb\'s idle icon.', 'Topuzun boştaki ikonu.') },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: t('Track height 40, 48, 56 or 96 px.', 'Ray yüksekliği 40, 48, 56 ya da 96 px.') },
          { name: 'fillClassName', type: 'string', default: "'bg-[#3291FF] text-white'", description: t('Classes of the fill: its colour and the colour of the text on it.', 'Dolgunun sınıfları: rengi ve üstündeki yazının rengi.') },
          { name: 'fill', type: 'boolean', default: 'true', description: t('`false` leaves the track bare: no fill behind the thumb; `fillClassName` colours the success alone.', '`false` rayı dolgusuz bırakır: topuzun arkasında dolgu olmaz; `fillClassName` yalnızca başarıyı renklendirir.') },
          { name: 'mirror', type: 'boolean', default: 'false', description: t('The held thumb\'s rim mirrors the page around the track: a colourful neighbour lights the rim that faces it, and the icon glows.', 'Tutulan topuzun kenarı rayın çevresindeki sayfayı yansıtır: renkli bir komşu kendisine bakan kenarı aydınlatır, ikon da ışıldar.') },
          { name: 'disabled', type: 'boolean', default: 'false', description: t('Dims the control and ignores pointer and keyboard.', 'Bileşeni soluklaştırır; imleç ve klavyeyi yok sayar.') },
          { name: 'className', type: 'string', description: t('Width and position of the track.', 'Rayın genişliği ve konumu.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A real `role="slider"` named by its label, with `aria-valuenow` kept in step with the thumb.', 'Etiketiyle adlandırılan gerçek bir `role="slider"`; `aria-valuenow` topuzla birlikte güncellenir.'),
          t('Arrow keys move the thumb in tenths, Page Up and Page Down in quarters, Home returns it and End confirms. Holding Space or Enter glides it to the end; letting go early springs it back.', 'Ok tuşları topuzu onda bir, Page Up ve Page Down dörtte bir oynatır; Home geri döndürür, End onaylar. Space ya da Enter basılı tutulunca topuz sona süzülür; erken bırakılırsa geri yaylanır.'),
          t('A `role="status"` region announces the pending, success and error labels. While pending or confirmed the slider is `aria-disabled`.', 'Bir `role="status"` bölgesi bekleme, başarı ve hata etiketlerini duyurur. Beklemede ya da onaylıyken kaydırıcı `aria-disabled` olur.'),
          t('Success is never colour alone: the chevron becomes a check and the label is written beside it.', 'Başarı yalnız renkle anlatılmaz: ok onay işaretine dönüşür ve etiket yanına yazılır.'),
          t('Vertical page scroll still works over the control on touch. With reduced motion each state shows at once.', 'Dokunmatik ekranda bileşenin üstünde dikey kaydırma çalışmaya devam eder. Hareketi azalt açıksa her durum anında gösterilir.'),
        ],
      },
    ],
  },
  {
    slug: 'card',
    group: 'components',
    title: t('Card', 'Card'),
    name: 'GlassCard',
    description: t(
      'A card made of frosted glass. Your content sits on it; its face blurs and tints whatever lies behind so the text stays readable, and its rim pulls it towards the centre.',
      'Buzlu camdan bir kart. İçeriğin üstünde durur; yüzü arkasında kalanı bulanıklaştırıp tonlar, yazı okunur kalır; kenarı da onu merkeze doğru çeker.',
    ),
    verb: t('Hold', 'Tut'),
    signature: t('Holds your content; its rim bends what slides behind.', 'İçeriğini tutar; kenarı arkasından kayanı büker.'),
    hero: 'glass-card-basic',
    blocks: [
      {
        type: 'when',
        use: [
          t('A small surface of content over colour, imagery or motion: a widget, a now-playing card, a summary.', 'Renk, görsel ya da hareket üstünde küçük bir içerik yüzeyi: bir widget, çalan parça kartı, bir özet.'),
          t('One or two cards, where what is behind them is part of the design.', 'Arkalarında kalanın tasarımın parçası olduğu bir ya da iki kart.'),
        ],
        avoid: [
          t('Long text and forms: the backdrop shows through. Use a plain card.', 'Uzun metin ve formlar: arka plan görünür. Sade bir kart kullan.'),
          t('A card on a flat background: there is nothing to bend.', 'Düz bir zemindeki kart: bükülecek bir şey yok.'),
          t('One clickable action: use GlassButton.', 'Tıklanan tek bir eylem: GlassButton kullan.'),
        ],
      },
      { type: 'install', item: 'card' },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { GlassCard } from '@/components/liquid-glass'

<GlassCard className="w-64 p-5">
  <p className="font-semibold">Wednesday</p>
  <p className="text-sm opacity-60">Design review · 10:00</p>
</GlassCard>

// Something moves behind it: repaint what it bends every frame.
<GlassCard live className="size-44 p-4">…</GlassCard>

// Clearer glass: no frost, less tint.
<GlassCard blur={0} tint={0.3} className="w-64 p-5">…</GlassCard>`,
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'glass-card-widgets', title: t('Widgets over a wallpaper', 'Bir duvar kâğıdının üstünde widget\'lar') },
      {
        type: 'p',
        text: t(
          'Over a still backdrop, like the wallpaper here, the card needs no `live`. Like every glass in the kit it repaints only when something changes, and draws nothing at rest. Turn `live` on only when content moves behind the card, as with the rows of colour above: the card then draws every frame while it is on screen.',
          'Buradaki duvar kâğıdı gibi durağan bir zeminin üstünde kartın `live`a ihtiyacı yok. Setteki her cam gibi yalnız bir şey değişince yeniden boyanır, dururken hiçbir şey çizmez. `live`ı yalnız kartın arkasında bir şey hareket ediyorsa aç (yukarıdaki renk sıraları gibi): kart o zaman ekranda kaldığı sürece her kare çizer.',
        ),
      },
      {
        type: 'p',
        text: t(
          'The rim pulls what is behind towards the card\'s centre, by 6.5% of the viewport, fading over half the card, so type and colour stretch along the edge. The face then frosts the bent picture with a 5 px blur (`blur`) and covers it with a tint (`tint`): 70% white on a light page, 70% black on a dark one. A 1.3 px white line runs inside the rim; there is no colour split or light, only a soft drop shadow. Unlike a button, the card stays still under the pointer: it holds content, it does not swell. Size and padding come from your classes, and the glass takes the card\'s corners: `rounded-[28px]` by default, any `rounded-*` class to change them. Text on clear glass follows the tone the glass ends up (`data-glass-tone`), so it reads on light and dark backdrops. For a coloured card, use `material="tinted"` with a `bg-*` class.',
          'Kenar, arkada kalanı kartın merkezine doğru çeker (görüntü alanının %6.5\'i kadar) ve bu çekiş kartın yarısı boyunca söner; yazı ve renk kenar boyunca uzar. Ardından yüz, bükülmüş görüntüyü 5 px bulanıklıkla buzlar (`blur`) ve bir tonla örter (`tint`): açık sayfada %70 beyaz, koyu sayfada %70 siyah. Kenarın içinde 1.3 px beyaz bir çizgi uzanır; renk ayrışması ya da ışık yok, yalnız yumuşak bir gölge var. Butondan farklı olarak kart imlecin altında sabit kalır: içerik tutar, şişmez. Boyut ve iç boşluk senin sınıflarından gelir; cam kartın köşelerini alır: varsayılan `rounded-[28px]`, değiştirmek için herhangi bir `rounded-*` sınıfı. Berrak camdaki yazı, camın vardığı tonu izler (`data-glass-tone`); açık ve koyu zeminde okunur. Renkli bir kart için `material="tinted"` ile bir `bg-*` sınıfı kullan.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'children', type: 'ReactNode', description: t('The card\'s content.', 'Kartın içeriği.') },
          { name: 'material', type: "'clear' | 'tinted'", default: "'clear'", description: t('Clear bends what is behind; tinted uses the background colour.', 'Clear arkasında kalanı büker; tinted arka plan rengini kullanır.') },
          { name: 'tint', type: 'number', default: '0.7', description: t('Clear glass only: how much tint covers the backdrop (0–1): white on a light page, black on a dark one.', 'Yalnız clear: renk tonunun arkayı ne kadar örttüğü (0–1): açık sayfada beyaz, koyu sayfada siyah.') },
          { name: 'blur', type: 'number', default: '5', description: t('Clear glass only: how much the backdrop is frosted, in px like CSS `blur()`. `0` shows it sharp.', 'Yalnız clear: arkanın ne kadar buzlandığı, CSS `blur()` gibi px. `0` keskin gösterir.') },
          { name: 'live', type: 'boolean', default: 'false', description: t('Repaint the backdrop every frame, for content that moves behind the card.', 'Kartın arkasında hareket eden içerik için arkayı her karede yeniden boya.') },
          { name: 'className', type: 'string', description: t('Size, padding, corners (`rounded-*`) and, for tinted glass, colour (`bg-*`).', 'Boyut, iç boşluk, köşeler (`rounded-*`) ve renkli camda renk (`bg-*`).') },
          { name: '…rest', type: 'div attributes', description: t('Passed to the `<div>` (`role`, `aria-label`, `onClick`…).', '`<div>`\'e aktarılır (`role`, `aria-label`, `onClick`…).') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A plain `<div>`: when the card stands for one thing, name it (`role="group"` with an `aria-label`).', 'Sade bir `<div>`: kart tek bir şeyi temsil ediyorsa adlandır (`role="group"` ve bir `aria-label`).'),
          t('The glass canvas is `aria-hidden`; only your content is read.', 'Cam tuvali `aria-hidden`; yalnız senin içeriğin okunur.'),
          t('Content that moves behind it should respect reduced motion: the rows above stop.', 'Arkasında hareket eden içerik hareketi azalt tercihine uymalı: yukarıdaki sıralar durur.'),
        ],
      },
    ],
  },
  {
    slug: 'slider',
    group: 'components',
    title: t('Slider', 'Slider'),
    name: 'RangeSlider',
    description: t(
      'A range slider with a glass thumb: a small pill at rest that opens into a wide lens while you hold it.',
      'Cam tutamaklı aralık kaydırıcısı: dururken küçük bir hap, basılı tutunca geniş bir merceğe açılır.',
    ),
    verb: t('Slide', 'Kaydır'),
    signature: t('The thumb opens into a wide lens that bends the track and stretches as it moves.', 'Tutamak, rayı büken ve hareket ederken esneyen geniş bir merceğe açılır.'),
    hero: 'range-slider',
    blocks: [
      {
        type: 'when',
        use: [
          t('Picking a value on a continuous range: volume, brightness, opacity.', 'Sürekli bir aralıkta değer seçmek: ses, parlaklık, opaklık.'),
        ],
        avoid: [
          t('Exact numbers the user must type: use a number input.', 'Kullanıcının yazması gereken kesin sayılar: sayı girişi kullan.'),
          t('Confirming one action: that is Slide to Confirm.', 'Tek bir eylemi onaylamak: o iş Slide to Confirm\'in.'),
        ],
      },
      { type: 'install', item: 'slider' },
      {
        type: 'note',
        text: t(
          'Slider, Switch and Checkbox are drawn by their own renderer, which needs `three`, and take their behaviour (keyboard, the label, the input a form reads) from UI SDK: `@ui-sdk/core` and `@ui-sdk/react`. The install command adds all three; UI SDK is in beta, so it is added at the exact version this was built on.',
          'Slider, Switch ve Checkbox kendi çizicileriyle çizilir ve `three` paketine ihtiyaç duyar; davranışlarını (klavye, etiket, formun okuduğu girdi) UI SDK\'dan alır: `@ui-sdk/core` ve `@ui-sdk/react`. Kurulum komutu üçünü de ekler; UI SDK beta aşamasında olduğu için bileşenin yazıldığı tam sürümle eklenir.',
        ),
      },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { RangeSlider } from '@/components/liquid-glass/controls/RangeSlider'

const [volume, setVolume] = useState(60)

<RangeSlider label="Volume" value={volume} onChange={setVolume} />`,
      },
      {
        type: 'p',
        text: t(
          'Drag the glass, or press the track to bring it there. While held, the pill swells into a clear lens that bends the track and the fill beneath it, and squashes and stretches with its speed; released, it springs back to the small pill.',
          'Camı sürükle ya da raya basıp oraya getir. Basılı tutulduğunda hap, altındaki rayı ve dolguyu büken berrak bir merceğe şişer, hızına göre basılıp esner; bırakınca yay gibi küçük hapa döner.',
        ),
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'range-slider-colors', title: t('Colours', 'Renkler') },
      {
        type: 'p',
        text: t(
          '`color` is the filled part of the track; without it the slider is the kit\'s blue. The thumb stays white at rest and clear glass while held.',
          '`color` rayın dolu kısmıdır; verilmezse kaydırıcı kitin mavisidir. Tutamak dururken beyaz, basılıyken berrak cam kalır.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'value', type: 'number', default: '50', description: t('Current value.', 'Geçerli değer.') },
          { name: 'onChange', type: '(value: number) => void', description: t('Called with the new value.', 'Yeni değerle çağrılır.') },
          { name: 'min / max / step', type: 'number', default: '0 / 100 / 1', description: t('The range and its step.', 'Aralık ve adımı.') },
          { name: 'label', type: 'string', default: "'Volume'", description: t('Label above the track; an empty string hides it.', 'Rayın üstündeki etiket; boş dize gizler.') },
          { name: 'name', type: 'string', description: t('Submits the value under this name with the form around it.', 'Değeri, çevresindeki formla bu adla gönderir.') },
          { name: 'showValue', type: 'boolean', default: 'true', description: t('Shows the value next to the label.', 'Değeri etiketin yanında gösterir.') },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: t('Track height 8, 12, 18 or 26 px; the glass scales with it.', 'Ray yüksekliği 8, 12, 18 ya da 26 px; cam onunla ölçeklenir.') },
          { name: 'startIcon / endIcon', type: "IconName | 'none'", default: "'none'", description: t('Icons at either end of the track.', 'Rayın iki ucundaki ikonlar.') },
          { name: 'color', type: 'string', default: "'#3291FF'", description: t('The filled part of the track: a hex, `rgb()` or named colour, not a CSS variable.', 'Rayın dolu kısmı: hex, `rgb()` ya da adlandırılmış bir renk; CSS değişkeni olmaz.') },
          { name: 'theme', type: "'light' | 'dark'", description: t('Overrides the page theme for this slider.', 'Bu kaydırıcı için sayfa temasını ezer.') },
          { name: 'restFrost', type: 'number', default: '1', description: t('The thumb at rest: 1 = a white pill, 0 = clear glass. Held, it is always clear glass.', 'Dururken tutamak: 1 = beyaz hap, 0 = berrak cam. Basılıyken hep berrak cam.') },
          { name: 'refraction', type: 'number', default: '37', description: t('How far the lens bends what lies beneath.', 'Merceğin altındakini ne kadar büktüğü.') },
          { name: 'dispersion / rimIntensity / magnification', type: 'number', default: '0.12 / 0.55 / 0', description: t('Colour fringing, rim light and zoom of the lens.', 'Merceğin renk saçılması, kenar ışığı ve büyütmesi.') },
          { name: 'motionStretch / motionSmoothing', type: 'number', default: '3 / 30', description: t('Squash and stretch with speed; how tightly the glass follows.', 'Hıza göre basılıp esneme; camın ne kadar sıkı izlediği.') },
          { name: 'pressSpeed / pressBounce', type: 'number', default: '16 / 0.4', description: t('The spring that opens and closes the lens.', 'Merceği açıp kapatan yay.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A native range input does the work: arrow keys, Home, End and Page Up / Down, and screen readers announce the value.', 'İşi yerel bir range girişi yapar: ok tuşları, Home, End ve Page Up / Down; ekran okuyucular değeri okur.'),
          t('The `label` names the input.', '`label` girişi adlandırır.'),
          t('With reduced motion the glass follows without springs.', 'Hareketi azalt açıksa cam yaysız izler.'),
        ],
      },
    ],
  },
  {
    slug: 'switch',
    group: 'components',
    title: t('Switch', 'Switch'),
    name: 'Switch',
    description: t(
      'An on/off toggle whose knob swells into a clear lens while it crosses the track.',
      'Topuzu rayı geçerken berrak bir merceğe şişen aç/kapa anahtarı.',
    ),
    verb: t('Flip', 'Çevir'),
    signature: t('The knob swells into clear glass as it crosses, then settles white.', 'Topuz geçerken berrak cama şişer, sonra beyaz olarak oturur.'),
    hero: 'switch',
    blocks: [
      {
        type: 'when',
        use: [t('A setting that takes effect at once: Wi-Fi, notifications, dark mode.', 'Hemen etkili olan bir ayar: Wi-Fi, bildirimler, koyu mod.')],
        avoid: [
          t('A choice that is saved later with a form: use Checkbox.', 'Sonradan formla kaydedilen bir seçim: Checkbox kullan.'),
          t('More than two states: use Tabs.', 'İkiden fazla durum: Tabs kullan.'),
        ],
      },
      { type: 'install', item: 'switch' },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { Switch } from '@/components/liquid-glass/controls/Switch'

const [on, setOn] = useState(false)

<Switch label="Notifications" description="Banners and sounds" checked={on} onChange={setOn} />`,
      },
      {
        type: 'p',
        text: t(
          'Tap to flip, or hold the knob and drag it across. Needs `three` and UI SDK, like Slider.',
          'Dokununca çevrilir; ya da topuzu tutup karşıya sürükle. Slider gibi `three` ve UI SDK gerektirir.',
        ),
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'switch-colors', title: t('Colours', 'Renkler') },
      {
        type: 'p',
        text: t(
          '`color` is the track while on; without it the switch is the kit\'s blue. The knob stays white. Without `onChange` a switch keeps its own state, starting from `checked`.',
          '`color` açıkken rayın rengidir; verilmezse anahtar kitin mavisidir. Topuz beyaz kalır. `onChange` vermezsen anahtar, `checked` ile başlayıp kendi durumunu tutar.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'checked', type: 'boolean', default: 'false', description: t('On or off.', 'Açık ya da kapalı.') },
          { name: 'onChange', type: '(checked: boolean) => void', description: t('Called with the new state.', 'Yeni durumla çağrılır.') },
          { name: 'label', type: 'string', default: "'Notifications'", description: t('Text beside the switch; an empty string leaves the switch alone.', 'Anahtarın yanındaki metin; boş dize yalnız anahtarı bırakır.') },
          { name: 'description', type: 'string', description: t('A second, quieter line under the label.', 'Etiketin altında ikinci, daha sessiz bir satır.') },
          { name: 'name', type: 'string', description: t('Submits with the form around it under this name.', 'Çevresindeki formla bu adla gönderilir.') },
          { name: 'labelSide', type: "'left' | 'right'", default: "'right'", description: t('Which side the label sits on.', 'Etiketin hangi yanda durduğu.') },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t('Track height 22, 28 or 36 px.', 'Ray yüksekliği 22, 28 ya da 36 px.') },
          { name: 'color', type: 'string', default: "'#3291FF'", description: t('The track while on: a hex, `rgb()` or named colour, not a CSS variable.', 'Açıkken rayın rengi: hex, `rgb()` ya da adlandırılmış bir renk; CSS değişkeni olmaz.') },
          { name: 'theme', type: "'light' | 'dark'", description: t('Overrides the page theme for this switch.', 'Bu anahtar için sayfa temasını ezer.') },
          { name: 'disabled', type: 'boolean', default: 'false', description: t('Dimmed and not interactive.', 'Soluk ve etkileşimsiz.') },
          { name: 'lensScale', type: 'number', default: '1.55', description: t('Size of the travelling lens relative to the resting knob.', 'Yolculuk eden merceğin duran topuza göre boyutu.') },
          { name: 'refraction / knobBounce', type: 'number', default: '26 / 0.3', description: t('How far the lens bends the track; how much the knob overshoots.', 'Merceğin rayı ne kadar büktüğü; topuzun ne kadar taştığı.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A `<button role="switch">` with `aria-checked`: Space and Enter flip it.', '`aria-checked` taşıyan bir `<button role="switch">`: Space ve Enter çevirir.'),
          t('The `label` is a real `<label>` tied to the button.', '`label`, butona bağlı gerçek bir `<label>` öğesidir.'),
          t('With reduced motion the knob simply jumps.', 'Hareketi azalt açıksa topuz doğrudan yer değiştirir.'),
        ],
      },
    ],
  },
  {
    slug: 'checkbox',
    group: 'components',
    title: t('Checkbox', 'Checkbox'),
    name: 'Checkbox',
    description: t(
      'A checkbox under a cap of clear glass: the box and its mark are always seen through the lens.',
      'Berrak bir cam kapağın altındaki onay kutusu: kutu ve işareti hep merceğin içinden görünür.',
    ),
    verb: t('Tick', 'İşaretle'),
    signature: t('Always glass: the mark draws itself beneath a clear cap that swells when pressed.', 'Hep cam: işaret, basınca şişen berrak bir kapağın altında kendini çizer.'),
    hero: 'checkbox',
    blocks: [
      {
        type: 'when',
        use: [
          t('Choosing any number of items in a list or a form.', 'Bir listede ya da formda istediğin kadar öğe seçmek.'),
          t('Agreeing to something that is submitted later.', 'Sonradan gönderilecek bir şeyi onaylamak.'),
        ],
        avoid: [
          t('A setting that takes effect at once: use Switch.', 'Hemen etkili olan bir ayar: Switch kullan.'),
          t('One choice out of several: use Tabs.', 'Birkaç seçenekten biri: Tabs kullan.'),
        ],
      },
      { type: 'install', item: 'checkbox' },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { Checkbox } from '@/components/liquid-glass/controls/Checkbox'

const [remember, setRemember] = useState(true)

<Checkbox label="Remember this device" checked={remember} onChange={setRemember} />`,
      },
      {
        type: 'p',
        text: t(
          'The glass cap is there at rest, not only while pressed. Needs `three` and UI SDK, like Slider.',
          'Cam kapak yalnız basılıyken değil, dururken de oradadır. Slider gibi `three` ve UI SDK gerektirir.',
        ),
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'checkbox-colors', title: t('Colours', 'Renkler') },
      {
        type: 'p',
        text: t(
          '`color` is the box while checked; without it the checkbox is the kit\'s blue. The mark stays white.',
          '`color` işaretliyken kutunun rengidir; verilmezse onay kutusu kitin mavisidir. İşaret beyaz kalır.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'checked', type: 'boolean', default: 'true', description: t('Checked or not.', 'İşaretli ya da değil.') },
          { name: 'onChange', type: '(checked: boolean) => void', description: t('Called with the new state.', 'Yeni durumla çağrılır.') },
          { name: 'label', type: 'string', default: "'Remember this device'", description: t('Text beside the box; an empty string leaves the box alone.', 'Kutunun yanındaki metin; boş dize yalnız kutuyu bırakır.') },
          { name: 'description', type: 'string', description: t('A second, quieter line under the label.', 'Etiketin altında ikinci, daha sessiz bir satır.') },
          { name: 'name', type: 'string', description: t('Submits with the form around it under this name.', 'Çevresindeki formla bu adla gönderilir.') },
          { name: 'shape', type: "'rounded' | 'circle'", default: "'rounded'", description: t('A rounded square or a circle.', 'Köşeleri yuvarlak kare ya da daire.') },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t('Box size 18, 22 or 28 px.', 'Kutu boyutu 18, 22 ya da 28 px.') },
          { name: 'color', type: 'string', default: "'#3291FF'", description: t('The box while checked: a hex, `rgb()` or named colour, not a CSS variable.', 'İşaretliyken kutunun rengi: hex, `rgb()` ya da adlandırılmış bir renk; CSS değişkeni olmaz.') },
          { name: 'theme', type: "'light' | 'dark'", description: t('Overrides the page theme for this checkbox.', 'Bu onay kutusu için sayfa temasını ezer.') },
          { name: 'disabled', type: 'boolean', default: 'false', description: t('Dimmed and not interactive.', 'Soluk ve etkileşimsiz.') },
          { name: 'swell', type: 'number', default: '1.18', description: t('How much the cap grows while pressed.', 'Kapağın basılıyken ne kadar büyüdüğü.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A `<button role="checkbox">` with `aria-checked`: Space toggles it.', '`aria-checked` taşıyan bir `<button role="checkbox">`: Space ile işaretlenir.'),
          t('The `label` is a real `<label>` tied to the button.', '`label`, butona bağlı gerçek bir `<label>` öğesidir.'),
          t('With reduced motion the mark and the cap change without springs.', 'Hareketi azalt açıksa işaret ve kapak yaysız değişir.'),
        ],
      },
    ],
  },
  {
    slug: 'select',
    group: 'components',
    title: t('Select', 'Select'),
    name: 'GlassSelect',
    description: t(
      'A select whose list swells out of its button as one body of glass, holds on by a neck that stretches and snaps, and closes by the same motion played backwards.',
      'Listesi butonundan tek bir cam gövde olarak şişen, esneyip kopan bir boyunla ona tutunan ve aynı hareketin tersiyle kapanan seçim kutusu.',
    ),
    verb: t('Stretch', 'Esne'),
    signature: t('The list and its button are one liquid: a neck stretches between them, thins and snaps.', 'Liste ile butonu tek bir sıvıdır: aralarında bir boyun esner, incelir ve kopar.'),
    hero: 'glass-select-basic',
    blocks: [
      {
        type: 'when',
        use: [
          t('Picking one option from a short list that should stay out of the way until asked for.', 'İstenene kadar gözden uzak durması gereken kısa bir listeden tek seçenek seçmek.'),
          t('A form field: the value is submitted under `name`.', 'Bir form alanı: değer `name` ile gönderilir.'),
        ],
        avoid: [
          t('Two to five options that fit on one line: use Tabs.', 'Tek satıra sığan iki ila beş seçenek: Tabs kullan.'),
          t('An on/off setting: use Switch.', 'Aç/kapa bir ayar: Switch kullan.'),
          t('Several of these on one screen: one stretching list is a moment, a form full of them is noise.', 'Aynı ekranda birkaç tane: esneyen tek bir liste bir andır, onlarla dolu bir form gürültüdür.'),
        ],
      },
      { type: 'install', item: 'select' },
      {
        type: 'note',
        text: t(
          'The behaviour (keyboard, typeahead, focus, positioning, ARIA) comes from UI SDK, so Select needs `@ui-sdk/core` and `@ui-sdk/react`. The install command adds them at the exact version this was built on: UI SDK is in beta and its API may still change.',
          'Davranış (klavye, harfle arama, odak, konumlandırma, ARIA) UI SDK\'dan gelir; bu yüzden Select `@ui-sdk/core` ve `@ui-sdk/react` paketlerine ihtiyaç duyar. Kurulum komutu onları, bileşenin yazıldığı tam sürümle ekler: UI SDK beta aşamasında ve API\'si hâlâ değişebilir.',
        ),
      },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import { GlassSelect } from '@/components/liquid-glass/glass-select'

const [speed, setSpeed] = useState<string | null>(null)

<GlassSelect
  label="Delivery"
  placeholder="Choose a speed"
  value={speed}
  onValueChange={setSpeed}
  options={[
    { value: 'standard', label: 'Standard' },
    { value: 'express', label: 'Express' },
    { value: 'pickup', label: 'Pickup', disabled: true },
  ]}
/>`,
      },
      {
        type: 'p',
        text: t(
          'Opening, the list swells out of the whole button, the neck between them stretches and snaps, both halves take the jolt and the options arrive one after another. Closing is the opening played backwards, frame for frame; reopen it on the way and it carries on from there. The button wears Button\'s glass, with its light and shadow. Once the neck lets go, the list settles into Card\'s frost with no light of its own: a thin line draws its edge and a soft shadow lifts it off the page. The glass is clear, so it needs something behind it to bend.',
          'Açılırken liste butonun tamamından şişer, aralarındaki boyun esneyip kopar, iki parça da sarsılır ve seçenekler birer birer gelir. Kapanış, açılışın kare kare tersidir; yoldayken yeniden açarsan kaldığı yerden devam eder. Buton, ışığı ve gölgesiyle Button\'ın camını taşır. Boyun koptuğunda liste kendi ışığı olmayan, Card\'ın buzlu camına geçer: kenarını ince bir çizgi çizer, yumuşak bir gölge onu sayfadan ayırır. Cam berraktır, bu yüzden bükecek bir arka plana ihtiyaç duyar.',
        ),
      },
      h('Your own popup', 'Kendi açılır yüzeyin'),
      {
        type: 'p',
        text: t(
          'The stretch is not tied to a select. `GlassPopup`, which ships with it, puts the same motion on any control and the surface it opens (a menu, a popover):',
          'Esneme yalnızca seçim kutusuna bağlı değil. Onunla birlikte gelen `GlassPopup`, aynı hareketi herhangi bir kontrole ve açtığı yüzeye (menü, popover) koyar:',
        ),
      },
      {
        type: 'code',
        title: 'menu.tsx',
        code: `import { GlassPopupAnchor, GlassPopupSurface, useGlassPopup } from '@/components/liquid-glass'

const popup = useGlassPopup()

<MenuTrigger data-glass-host className="rounded-full px-5 h-12 bg-white/60 dark:bg-white/10">
  <GlassPopupAnchor popup={popup} />
  Options
</MenuTrigger>
<MenuContent data-glass-popup data-glass-skip sideOffset={12} className="rounded-3xl p-1.5">
  <GlassPopupSurface popup={popup} />
  <div role="menu">
    <MenuItem style={{ '--glass-i': 0 }}>Rename</MenuItem>
    <MenuItem style={{ '--glass-i': 1 }}>Duplicate</MenuItem>
  </div>
</MenuContent>`,
      },
      {
        type: 'list',
        items: [
          t('`GlassPopupAnchor` is the first child of the control (marked `data-glass-host`); `GlassPopupSurface` is the first child of the content (marked `data-glass-popup`).', '`GlassPopupAnchor` kontrolün (`data-glass-host` ile işaretli) ilk çocuğudur; `GlassPopupSurface` içeriğin (`data-glass-popup` ile işaretli) ilk çocuğudur.'),
          t('The content carries `data-open` while open and `data-ending-style` while it closes, and stays mounted until its animations finish: UI SDK\'s popups do this.', 'İçerik açıkken `data-open`, kapanırken `data-ending-style` taşır ve animasyonları bitene kadar DOM\'da kalır: UI SDK\'nın açılır yüzeyleri böyle çalışır.'),
          t('Items are `role="option"`, `role="menuitem"` or `data-glass-item`; `--glass-i` is each one\'s place in the queue.', 'Öğeler `role="option"`, `role="menuitem"` ya da `data-glass-item` taşır; `--glass-i` her birinin sıradaki yeridir.'),
          t('The surface takes its corners from the content\'s own `rounded-*` class; leave about 12 px between it and the control for the neck.', 'Yüzey köşelerini içeriğin kendi `rounded-*` sınıfından alır; boyun için kontrolle arasında yaklaşık 12 px bırak.'),
        ],
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'label', type: 'ReactNode', description: t('The field\'s label, tied to the button.', 'Alanın butona bağlı etiketi.') },
          { name: 'options', type: '{ value: string; label: ReactNode; disabled?: boolean }[]', description: t('The choices, in order.', 'Seçenekler, sırasıyla.') },
          { name: 'value', type: 'string | null', description: t('The selected value (controlled). `null` = nothing selected.', 'Seçili değer (kontrollü). `null` = seçim yok.') },
          { name: 'defaultValue', type: 'string | null', description: t('The starting value when the select keeps its own state.', 'Seçim kutusu kendi durumunu tutarken başlangıç değeri.') },
          { name: 'onValueChange', type: '(value: string | null) => void', description: t('Called with the new value.', 'Yeni değerle çağrılır.') },
          { name: 'placeholder', type: 'string', description: t('Shown on the button while nothing is selected.', 'Hiçbir şey seçili değilken butonda görünür.') },
          { name: 'name', type: 'string', description: t('Submits the value with a form under this name.', 'Değeri formla bu adla gönderir.') },
          { name: 'disabled', type: 'boolean', default: 'false', description: t('Dimmed and not interactive.', 'Soluk ve etkileşimsiz.') },
          { name: 'className', type: 'string', description: t('Classes for the field (label and button); it is 16rem wide by default.', 'Alan (etiket ve buton) için sınıflar; varsayılan genişlik 16rem.') },
          { name: 'useGlassPopup({ matchWidth })', type: 'boolean', default: 'false', description: t('Your own popup: keep the surface exactly as wide as its control.', 'Kendi açılır yüzeyin: yüzeyi kontrolüyle tam aynı genişlikte tutar.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A `combobox` button that opens a `listbox` (the WAI-ARIA select pattern), labelled by `label`.', '`listbox` açan bir `combobox` butonu (WAI-ARIA seçim kalıbı); adını `label`dan alır.'),
          t('Arrow keys, Home and End move through the options, typing a letter jumps to a match, Enter selects, Escape closes and returns focus to the button. Disabled options are skipped.', 'Ok tuşları, Home ve End seçenekler arasında gezer; bir harf yazmak eşleşene atlar, Enter seçer, Escape kapatıp odağı butona döndürür. Devre dışı seçenekler atlanır.'),
          t('With reduced motion the list opens and closes at once, with no stretch or jolt.', 'Hareketi azalt açıksa liste esneme ve sarsıntı olmadan anında açılıp kapanır.'),
          t('Without WebGL2 it is a plain frosted list.', 'WebGL2 yoksa düz, buzlu bir listedir.'),
        ],
      },
    ],
  },
  {
    slug: 'button-group',
    group: 'components',
    title: t('Button Group', 'Button Group'),
    name: 'GlassButtonGroup',
    description: t(
      'Related actions in one body of glass. The buttons share a single lens: point at any of them and the whole body swells.',
      'Tek bir cam gövdede ilişkili eylemler. Butonlar tek bir merceği paylaşır: herhangi birinin üstüne gel, bütün gövde şişer.',
    ),
    verb: t('Share', 'Paylaş'),
    signature: t('Several buttons, one body of glass.', 'Birkaç buton, tek bir cam gövde.'),
    hero: 'glass-button-group-basic',
    blocks: [
      {
        type: 'when',
        use: [
          t('Two to five actions on the same thing: a message toolbar, map controls, a split button.', 'Aynı şey üzerinde iki ila beş eylem: bir ileti araç çubuğu, harita kontrolleri, bölünmüş buton.'),
          t('A main action with its options next to it, divided by a separator.', 'Yanında seçenekleriyle bir ana eylem; aralarında bir ayraç.'),
        ],
        avoid: [
          t('Choosing between options, where one stays selected: use Tabs.', 'Birinin seçili kaldığı seçenekler arasında seçim: Tabs kullan.'),
          t('A single action: use Button.', 'Tek bir eylem: Button kullan.'),
          t('Unrelated actions: one body says they belong together.', 'İlişkisiz eylemler: tek gövde, birbirlerine ait olduklarını söyler.'),
        ],
      },
      { type: 'install', item: 'button-group' },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import {
  GlassButtonGroup,
  GlassButtonGroupItem,
  GlassButtonGroupSeparator,
  GlassButtonGroupText,
} from '@/components/liquid-glass'

<GlassButtonGroup aria-label="Message">
  <GlassButtonGroupItem onClick={archive}>Archive</GlassButtonGroupItem>
  <GlassButtonGroupItem onClick={report}>Report</GlassButtonGroupItem>
  <GlassButtonGroupSeparator />
  <GlassButtonGroupItem aria-label="More"><Ellipsis /></GlassButtonGroupItem>
</GlassButtonGroup>`,
      },
      {
        type: 'p',
        text: t(
          'The group is the glass, and the glass is Button\'s, with its light and shadow. It is tinted white, on light and dark pages alike, unless you colour it. Its items are plain buttons lying in it, with no glass of their own. Do not put a Button inside: a lens within a lens bends nothing. The items get no background of their own under the pointer: the glass answers for the whole group.',
          'Cam, grubun kendisidir ve ışığı ve gölgesiyle Button\'ın camıdır. Sen boyamadıkça açık ve koyu sayfada beyaz renkli camdır. Öğeleri onun içinde duran, kendi camı olmayan sade butonlardır. İçine Button koyma: mercek içindeki mercek hiçbir şeyi bükmez. Öğeler imleç altında kendi arka planlarını almaz: grubun tamamı adına cam karşılık verir.',
        ),
      },
      h('Together and apart', 'Birlikte ve ayrı'),
      {
        type: 'p',
        text: t(
          'Nest groups to keep some actions in one body and others on their own. The outer group draws no glass: it only lays the inner ones out with space between them, and a group with a single item is a button standing apart.',
          'Bazı eylemleri tek gövdede, bazılarını ayrı tutmak için grupları iç içe koy. Dıştaki grup cam çizmez: içtekileri aralarında boşlukla dizer; tek öğeli bir grup da ayrı duran bir butondur.',
        ),
      },
      {
        type: 'code',
        title: 'toolbar.tsx',
        code: `<GlassButtonGroup aria-label="Message">
  <GlassButtonGroup>
    <GlassButtonGroupItem aria-label="Back" className="px-0"><ArrowLeft /></GlassButtonGroupItem>
  </GlassButtonGroup>
  <GlassButtonGroup>
    <GlassButtonGroupItem>Archive</GlassButtonGroupItem>
    <GlassButtonGroupItem>Report</GlassButtonGroupItem>
  </GlassButtonGroup>
</GlassButtonGroup>`,
      },
      h('With a menu', 'Menüyle'),
      {
        type: 'p',
        text: t(
          'For the actions that do not fit, wrap one group in a Menu and put its trigger on the three dots with `asChild`: the group\'s glass grows into the menu and the dots go, and it runs back the same way. The example above does it. A Dropdown Menu works the same way. See Menu and Dropdown Menu.',
          'Sığmayan eylemler için bir grubu Menu ile sar ve tetikleyicisini `asChild` ile üç noktaya koy: grubun camı menüye doğru büyür, noktalar gider; kapanırken aynı yoldan geri döner. Yukarıdaki örnek bunu yapıyor. Dropdown Menu de aynı şekilde çalışır. Menu ve Dropdown Menu sayfalarına bak.',
        ),
      },
      h('Examples', 'Örnekler'),
      { type: 'demo', id: 'glass-button-group-split', title: t('Tinted, split, text and sizes', 'Renkli cam, bölünmüş buton, metin ve boyutlar') },
      {
        type: 'p',
        text: t(
          'Colour the glass with a normal class on the group, such as `bg-blue-600 text-white`; `material="clear"` makes it clear glass that bends the page. A separator between a main action and a small second item makes a split button. `GlassButtonGroupText` is text that is not a button: a unit, a branch name, a count.',
          'Camı gruba verdiğin `bg-blue-600 text-white` gibi sıradan bir sınıfla boya; `material="clear"` onu sayfayı büken berrak cam yapar. Ana eylem ile küçük ikinci öğe arasındaki ayraç bölünmüş bir buton yapar. `GlassButtonGroupText` buton olmayan metindir: bir birim, bir dal adı, bir sayı.',
        ),
      },
      { type: 'demo', id: 'glass-button-group-vertical', title: t('Vertical', 'Dikey') },
      {
        type: 'p',
        text: t(
          '`orientation="vertical"` stacks the items; the separators turn with them and the body takes corners that sit concentric with its items. For icon-only items, add `px-0` to keep them square and give each an `aria-label`.',
          '`orientation="vertical"` öğeleri üst üste dizer; ayraçlar onlarla birlikte döner, gövde de öğeleriyle eş merkezli köşeler alır. Yalnız ikonlu öğelerde kare kalmaları için `px-0` ekle ve her birine `aria-label` ver.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: t('Side by side or stacked.', 'Yan yana ya da üst üste.') },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t('Height of a horizontal group: 32, 40 or 48 px. The items follow.', 'Yatay grubun yüksekliği: 32, 40 ya da 48 px. Öğeler buna uyar.') },
          { name: 'material', type: "'tinted' | 'clear'", default: "'tinted'", description: t('Tinted is white, or the colour of your own `bg-*` class; clear bends the page.', 'Tinted beyazdır ya da kendi `bg-*` sınıfının rengini alır; clear sayfayı büker.') },
          { name: 'tint', type: 'number', default: '0.6', description: t('Clear glass only: how much tint covers the backdrop (0–1).', 'Yalnız clear: renk tonunun arkayı ne kadar örttüğü (0–1).') },
          { name: '…rest', type: 'div attributes', description: t('Passed to the group (`aria-label`, `className`…).', 'Gruba aktarılır (`aria-label`, `className`…).') },
          { name: 'GlassButtonGroupItem asChild', type: 'boolean', default: 'false', description: t('Render the item on its single child element (a router `<Link>`, a menu trigger) instead of a `<button>`. Otherwise it takes button attributes (`onClick`, `disabled`…).', 'Öğeyi `<button>` yerine tek çocuk öğesinde çizer (router `<Link>`, menü tetikleyicisi). Aksi halde buton özniteliklerini alır (`onClick`, `disabled`…).') },
          { name: 'GlassButtonGroupSeparator', type: 'className', description: t('A hairline between two items. It turns with the group.', 'İki öğe arasında ince bir çizgi. Grupla birlikte döner.') },
          { name: 'GlassButtonGroupText', type: 'span attributes', description: t('Text that is not a button.', 'Buton olmayan metin.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('The group has `role="group"`: name it with `aria-label` or `aria-labelledby`.', 'Grup `role="group"` taşır: `aria-label` ya da `aria-labelledby` ile adlandır.'),
          t('Every item is a real `<button>`; Tab moves through them one by one, Enter and Space press.', 'Her öğe gerçek bir `<button>`; Tab aralarında tek tek gezer, Enter ve Space basar.'),
          t('Icon-only items need an `aria-label`. Separators are `role="separator"`.', 'Yalnız ikonlu öğeler `aria-label` ister. Ayraçlar `role="separator"` taşır.'),
          t('Without WebGL2 it keeps its plain CSS colour.', 'WebGL2 yoksa düz CSS rengini korur.'),
        ],
      },
    ],
  },
  {
    slug: 'dropdown-menu',
    group: 'components',
    title: t('Dropdown Menu', 'Dropdown Menu'),
    name: 'GlassDropdownMenu',
    description: t(
      'A menu of actions that swells out of the control that opens it as one body of glass: a button of its own, or a whole Button Group.',
      'Kendisini açan kontrolden tek bir cam gövde olarak şişen eylem menüsü: kendi butonundan ya da bütün bir Button Group\'tan.',
    ),
    verb: t('Open', 'Aç'),
    signature: t('Actions pour out of the control that opens them, a whole button group included.', 'Eylemler, onları açan kontrolden dökülür; bütün bir buton grubundan bile.'),
    hero: 'glass-dropdown-menu-basic',
    blocks: [
      {
        type: 'when',
        use: [
          t('A handful of actions on one thing, kept out of the way until asked for: Rename, Duplicate, Delete.', 'Tek bir şey üzerinde, istenene kadar gözden uzak duran birkaç eylem: Yeniden adlandır, Çoğalt, Sil.'),
          t('The overflow of a Button Group: the three dots at its end.', 'Bir Button Group\'un taşan eylemleri: sonundaki üç nokta.'),
        ],
        avoid: [
          t('Picking a value that stays selected: use Select.', 'Seçili kalan bir değer seçmek: Select kullan.'),
          t('Two or three actions that fit on screen: show them in a Button Group.', 'Ekrana sığan iki üç eylem: onları bir Button Group içinde göster.'),
          t('Several of these on one screen: one stretching list is a moment, many are noise.', 'Aynı ekranda birkaç tane: esneyen tek bir liste bir andır, çoğu gürültüdür.'),
        ],
      },
      { type: 'install', item: 'dropdown-menu' },
      {
        type: 'note',
        text: t(
          'The behaviour (keyboard, typeahead, focus, positioning, ARIA) comes from UI SDK, so Dropdown Menu needs `@ui-sdk/core` and `@ui-sdk/react`. The install command adds them at the exact version this was built on: UI SDK is in beta and its API may still change.',
          'Davranış (klavye, harfle arama, odak, konumlandırma, ARIA) UI SDK\'dan gelir; bu yüzden Dropdown Menu `@ui-sdk/core` ve `@ui-sdk/react` paketlerine ihtiyaç duyar. Kurulum komutu onları, bileşenin yazıldığı tam sürümle ekler: UI SDK beta aşamasında ve API\'si hâlâ değişebilir.',
        ),
      },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import {
  GlassDropdownMenu,
  GlassDropdownMenuContent,
  GlassDropdownMenuItem,
  GlassDropdownMenuSeparator,
  GlassDropdownMenuTrigger,
} from '@/components/liquid-glass/glass-dropdown-menu'

<GlassDropdownMenu over="center">
  <GlassDropdownMenuTrigger>Options</GlassDropdownMenuTrigger>
  <GlassDropdownMenuContent>
    <GlassDropdownMenuItem onSelect={rename}>Rename</GlassDropdownMenuItem>
    <GlassDropdownMenuItem onSelect={duplicate}>Duplicate</GlassDropdownMenuItem>
    <GlassDropdownMenuSeparator />
    <GlassDropdownMenuItem destructive onSelect={remove}>Delete</GlassDropdownMenuItem>
  </GlassDropdownMenuContent>
</GlassDropdownMenu>`,
      },
      {
        type: 'p',
        text: t(
          'With `over="center"` on `GlassDropdownMenu`, the button itself unfolds into the menu, which settles around it with the button in its middle: Popover\'s opening. `over="edge"` grows it from the button\'s own edge instead, and `from="bottom"` brings it up from below where it comes down from above by default. Closing folds it back into the button. The menu stays where it is instead of flipping, so keep the button away from the top and bottom of the screen. The trigger wears Button\'s clear glass, so it needs something behind it to bend.',
          '`GlassDropdownMenu` üzerinde `over="center"` ile butonun kendisi menüye dönüşür ve menü, buton ortasında kalacak şekilde çevresine oturur: Popover\'ın açılışı. `over="edge"` onu butonun kendi kenarından büyütür; `from="bottom"` ise varsayılan olarak yukarıdan inen menüyü aşağıdan getirir. Kapanışta yeniden butona katlanır. Menü yön değiştirmeden yerinde kalır; bu yüzden butonu ekranın üst ve alt kenarından uzak tut. Tetikleyici Button\'ın berrak camını taşır, bu yüzden bükecek bir arka plana ihtiyaç duyar.',
        ),
      },
      h('Opening on a neck', 'Boyunla açılış'),
      {
        type: 'p',
        text: t(
          'Leave `over` out for Select\'s motion: the list swells out of the whole trigger, the neck between them stretches and snaps, and the items arrive one after another; closing plays it backwards. It flips when there is no room.',
          '`over` vermezsen Select\'in hareketi oynar: liste tetikleyicinin tamamından şişer, aralarındaki boyun esneyip kopar ve öğeler birer birer gelir; kapanış bunu tersine oynatır. Yer yoksa öbür tarafa döner.',
        ),
      },
      { type: 'demo', id: 'glass-dropdown-menu-stretch', title: t('A list that stretches out of its button', 'Butonundan esneyerek çıkan liste') },
      h('Out of a Button Group', 'Bir Button Group\'tan'),
      {
        type: 'p',
        text: t(
          'Wrap one group and the content in the menu, and put the trigger on one of the group\'s items with `asChild`. The whole group is then the anchor: the menu comes out of its body and takes its colour, white included. Wrap only the group that opens the menu.',
          'Tek bir grubu ve içeriği menüyle sar, tetikleyiciyi de `asChild` ile grubun öğelerinden birine koy. Böylece çapa grubun tamamı olur: menü onun gövdesinden çıkar ve rengini alır, beyaz dahil. Yalnızca menüyü açan grubu sar.',
        ),
      },
      {
        type: 'code',
        title: 'toolbar.tsx',
        code: `<GlassDropdownMenu over="center">
  <GlassButtonGroup>
    <GlassDropdownMenuTrigger asChild>
      <GlassButtonGroupItem aria-label="More" className="px-0"><Ellipsis /></GlassButtonGroupItem>
    </GlassDropdownMenuTrigger>
  </GlassButtonGroup>
  <GlassDropdownMenuContent>
    <GlassDropdownMenuItem>Mark as read</GlassDropdownMenuItem>
    <GlassDropdownMenuItem destructive>Delete</GlassDropdownMenuItem>
  </GlassDropdownMenuContent>
</GlassDropdownMenu>`,
      },
      { type: 'demo', id: 'glass-dropdown-menu-group', title: t('The three dots of a toolbar', 'Bir araç çubuğunun üç noktası') },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open: boolean) => void', description: t('On `GlassDropdownMenu`: control the menu yourself, or let it keep its own state.', '`GlassDropdownMenu` üzerinde: menüyü kendin yönet ya da kendi durumunu tutsun.') },
          { name: 'over', type: "'center' | 'edge'", description: t('On `GlassDropdownMenu`: the button unfolds into the menu. `center`: the menu settles around it. `edge`: it grows from the button\'s own edge, away from it. Left out, the list swells out of the control on a neck.', '`GlassDropdownMenu` üzerinde: buton menüye dönüşür. `center`: menü çevresine oturur. `edge`: butonun kendi kenarından, ondan uzağa doğru büyür. Verilmezse liste kontrolden bir boyunla şişerek çıkar.') },
          { name: 'from', type: "'top' | 'bottom'", default: "'top'", description: t('On `GlassDropdownMenu`, with `over`: which way the menu comes into place. `top`: the button is thrown down and the menu comes down from above. `bottom`: the other way up.', '`GlassDropdownMenu` üzerinde, `over` ile: menünün yerine hangi yönden geldiği. `top`: buton aşağı savrulur, menü yukarıdan iner. `bottom`: tam tersi.') },
          { name: 'GlassDropdownMenuTrigger asChild', type: 'boolean', default: 'false', description: t('Put the trigger on its single child (a `GlassButtonGroupItem`) instead of a glass button of its own.', 'Tetikleyiciyi kendi cam butonu yerine tek çocuğuna (bir `GlassButtonGroupItem`) koyar.') },
          { name: 'GlassDropdownMenuContent side / align', type: "'top' | 'bottom' / 'start' | 'center' | 'end'", default: "'bottom' / 'center'", description: t('Where the list opens against the trigger: below and centred by default. It flips when there is no room.', 'Listenin tetikleyiciye göre nerede açıldığı: varsayılan olarak altta ve ortalı. Yer yoksa öbür tarafa döner.') },
          { name: 'GlassDropdownMenuContent sideOffset', type: 'number', default: '12', description: t('The gap between the control and the list, where the neck stretches. With `over="center"`, passing it places the menu yourself.', 'Kontrol ile liste arasındaki, boynun esnediği boşluk. `over="center"` ile verilirse menüyü kendin konumlandırırsın.') },
          { name: 'GlassDropdownMenuItem onSelect', type: '() => void', description: t('Runs when the item is pressed; the menu then closes (`closeOnSelect={false}` keeps it open).', 'Öğeye basılınca çalışır; ardından menü kapanır (`closeOnSelect={false}` açık tutar).') },
          { name: 'GlassDropdownMenuItem destructive', type: 'boolean', default: 'false', description: t('Paints the item red, for Delete.', 'Öğeyi kırmızıya boyar; Sil için.') },
          { name: 'GlassDropdownMenuItem disabled', type: 'boolean', default: 'false', description: t('Dimmed and skipped by the keyboard.', 'Soluk; klavye onu atlar.') },
          { name: 'GlassDropdownMenuSeparator', type: 'className', description: t('A hairline between items.', 'Öğeler arasında ince bir çizgi.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A button with `aria-haspopup` that opens a `menu` of `menuitem`s (the WAI-ARIA menu button pattern).', '`menuitem` öğelerinden oluşan bir `menu` açan, `aria-haspopup` taşıyan bir buton (WAI-ARIA menü butonu kalıbı).'),
          t('Arrow keys, Home and End move through the items, typing a letter jumps to a match, Enter runs the item, Escape closes and returns focus to the trigger.', 'Ok tuşları, Home ve End öğeler arasında gezer; bir harf yazmak eşleşene atlar, Enter öğeyi çalıştırır, Escape kapatıp odağı tetikleyiciye döndürür.'),
          t('An icon-only trigger needs an `aria-label`.', 'Yalnız ikonlu tetikleyici `aria-label` ister.'),
          t('With reduced motion the list opens and closes at once. Without WebGL2 it is a plain frosted list.', 'Hareketi azalt açıksa liste anında açılıp kapanır. WebGL2 yoksa düz, buzlu bir listedir.'),
        ],
      },
    ],
  },
  {
    slug: 'popover',
    group: 'components',
    title: t('Popover', 'Popover'),
    name: 'GlassPopover',
    description: t(
      'A small surface its button unfolds into, right where the button is: the button lets go of its label, its glass grows over it into the popover and settles, and closing folds it back.',
      'Butonun bulunduğu yerde yayılarak dönüştüğü küçük yüzey: buton etiketini bırakır, camı kendi üstünde büyüyüp popover\'a oturur; kapanış onu geri toplar.',
    ),
    verb: t('Unfold', 'Yayıl'),
    signature: t('The button unfolds into a small surface, right where it is.', 'Buton, bulunduğu yerde küçük bir yüzeye yayılır.'),
    hero: 'glass-popover-basic',
    blocks: [
      {
        type: 'when',
        use: [
          t('A little more about one control, or a few choices for it, without leaving the page: a reminder time, a colour, a short field.', 'Sayfadan ayrılmadan tek bir kontrol hakkında biraz daha fazlası ya da onun için birkaç seçenek: hatırlatma zamanı, renk, kısa bir alan.'),
          t('Content that belongs to the button and should come out of it and go back into it.', 'Butona ait olan, ondan çıkıp ona dönmesi gereken içerik.'),
        ],
        avoid: [
          t('A plain list of actions: use Dropdown Menu. Picking a value for a form: use Select.', 'Düz bir eylem listesi: Dropdown Menu kullan. Bir form için değer seçmek: Select kullan.'),
          t('A hint shown on hover: the button is hidden while the popover is out, so it must be pressed.', 'Üstüne gelince görünen bir ipucu: popover dışarıdayken buton gizlenir, bu yüzden basılması gerekir.'),
        ],
      },
      { type: 'install', item: 'popover' },
      {
        type: 'note',
        text: t(
          'The behaviour (the top layer, positioning, focus, Escape, the outside press, ARIA) comes from UI SDK, so Popover needs `@ui-sdk/core` and `@ui-sdk/react`. The install command adds them at the exact version this was built on: UI SDK is in beta and its API may still change.',
          'Davranış (üst katman, konumlandırma, odak, Escape, dışarı basma, ARIA) UI SDK\'dan gelir; bu yüzden Popover `@ui-sdk/core` ve `@ui-sdk/react` paketlerine ihtiyaç duyar. Kurulum komutu onları, bileşenin yazıldığı tam sürümle ekler: UI SDK beta aşamasında ve API\'si hâlâ değişebilir.',
        ),
      },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import {
  GlassPopover,
  GlassPopoverClose,
  GlassPopoverContent,
  GlassPopoverTitle,
  GlassPopoverTrigger,
} from '@/components/liquid-glass/glass-popover'

<GlassPopover>
  <GlassPopoverTrigger>Remind me</GlassPopoverTrigger>
  <GlassPopoverContent>
    <GlassPopoverTitle>Remind me</GlassPopoverTitle>
    <GlassPopoverClose onClick={() => remind('hour')}>In an hour</GlassPopoverClose>
    <GlassPopoverClose onClick={() => remind('tomorrow')}>Tomorrow morning</GlassPopoverClose>
  </GlassPopoverContent>
</GlassPopover>`,
      },
      {
        type: 'p',
        text: t(
          'The popover settles around the button, the button in its middle (`over="edge"` grows it from the button\'s own edge instead, downwards unless `side` says otherwise). Around the button it stays where it is instead of flipping, so keep the button away from the top and bottom of the screen. Opening, the label goes and a surface comes out of the button, in Card\'s glass from the first frame; its own weight throws it a little way and it comes up into place from below (`from="top"` on `GlassPopover`: down from above), it lands a little past its size and settles, and its corners come last. The content is inside from the start, moves with the glass on both sides, and fades up and sharpens as the glass arrives. The press\'s light grows with it and reaches the content, and the shadow goes along. Closing is a calmer motion of its own: the content fades first, the surface slides back into the button and slows as it lands, and the button swells a little as it takes it while its label comes back letter by letter. A press on a Close part lights the surface where it lands, and that light goes into the button with it and fades there. While it is out the button is hidden, so it closes by a press outside, Escape or a Close part.',
          'Popover, buton ortasında kalacak şekilde çevresine oturur (`over="edge"` onu butonun kendi kenarından, `side` aksini söylemedikçe aşağı doğru büyütür). Çevresine oturduğunda yön değiştirmeden yerinde kalır; bu yüzden butonu ekranın üst ve alt kenarından uzak tut. Açılırken etiket kaybolur ve butondan, ilk kareden beri Card\'ın camını taşıyan bir yüzey çıkar; kendi ağırlığı onu hafifçe savurur ve yerine aşağıdan çıkar (`GlassPopover` üzerinde `from="top"`: yukarıdan iner), boyunu biraz aşıp yerine oturur, köşeleri en son gelir. İçerik baştan beri içeridedir, camla iki yönde birlikte hareket eder ve cam yerine vardıkça belirip netleşir. Basışın ışığı onunla büyür ve içeriğe de ulaşır, gölge de onunla gider. Kapanış kendi başına, daha sakin bir harekettir: önce içerik solar, yüzey butona geri girer ve yaklaşırken yavaşlar, buton da onu alırken hafifçe şişer ve yazısı harf harf geri gelir. Bir Close parçasına basmak yüzeyi basılan yerden aydınlatır; bu ışık yüzeyle birlikte butona girer ve orada söner. Dışarıdayken buton gizlidir; bu yüzden dışarı basarak, Escape ile ya da bir Close parçasıyla kapanır.',
        ),
      },
      h('Your own surface', 'Kendi yüzeyin'),
      {
        type: 'p',
        text: t(
          'The motion is `GlassPopup`\'s second way out, and it is not tied to a popover. For a surface of your own, `useGlassPopup({ opening: \'morph\' })` turns any control into what it opens (a menu, say); the surface should lie over its control, so give its content a negative `sideOffset`, the control\'s height:',
          'Bu hareket `GlassPopup`\'ın ikinci açılışıdır ve yalnızca popover\'a bağlı değildir. Kendi yüzeyin için `useGlassPopup({ opening: \'morph\' })`, herhangi bir kontrolü açtığı şeye (örneğin bir menüye) dönüştürür; yüzey kontrolünün üstüne oturmalıdır, bu yüzden içeriğe kontrolün yüksekliği kadar negatif `sideOffset` ver:',
        ),
      },
      {
        type: 'code',
        title: 'menu.tsx',
        code: `import { GlassPopupAnchor, GlassPopupSurface, useGlassPopup } from '@/components/liquid-glass'

const popup = useGlassPopup({ opening: 'morph' })

<MenuTrigger data-glass-host className="rounded-full px-5 h-12 bg-white/60 dark:bg-white/10">
  <GlassPopupAnchor popup={popup} />
  <span>Actions</span>
</MenuTrigger>
<MenuContent data-glass-popup data-glass-skip sideOffset={-48} className="rounded-3xl p-1.5">
  <GlassPopupSurface popup={popup} />
  <div data-glass-list>
    <MenuItem>Rename</MenuItem>
    <MenuItem>Duplicate</MenuItem>
  </div>
</MenuContent>`,
      },
      {
        type: 'list',
        items: [
          t('What rides the glass is the element marked `data-glass-list` (or `role="menu"` / `role="listbox"`) inside the content: wrap your content in one.', 'Camla birlikte taşınan şey, içeriğin içindeki `data-glass-list` (ya da `role="menu"` / `role="listbox"`) işaretli öğedir: içeriğini bir tanesine sar.'),
          t('The control keeps its place while the surface is out, with its label hidden: it is the surface now.', 'Yüzey dışarıdayken kontrol yerini korur, etiketi gizlenir: artık yüzeyin kendisidir.'),
          t('The surface takes its corners from the content\'s own `rounded-*` class.', 'Yüzey köşelerini içeriğin kendi `rounded-*` sınıfından alır.'),
        ],
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open: boolean) => void', description: t('On `GlassPopover`: control the popover yourself, or let it keep its own state.', '`GlassPopover` üzerinde: popover\'ı kendin yönet ya da kendi durumunu tutsun.') },
          { name: 'modal', type: "boolean | 'trap-focus'", default: 'false', description: t('`false` leaves the page usable, and focus leaving the popover closes it; `true` makes the page inert.', '`false` sayfayı kullanılabilir bırakır, odak popover\'dan çıkınca kapanır; `true` sayfayı etkisiz kılar.') },
          { name: 'GlassPopoverTrigger className', type: 'string', description: t('Classes for the button: 3rem tall with Button\'s glass by default. Any height works: the popover follows it.', 'Buton için sınıflar: varsayılan olarak 3rem yüksekliğinde ve Button\'ın camını taşır. Her yükseklik olur: popover onu izler.') },
          { name: 'from', type: "'bottom' | 'top'", default: "'bottom'", description: t('On `GlassPopover`: which way the popover comes into place. `bottom`: the button is thrown up and the popover comes up from below. `top`: the button is thrown down and it comes down from above.', '`GlassPopover` üzerinde: popover\'ın yerine hangi yönden geldiği. `bottom`: buton yukarı savrulur, popover aşağıdan çıkar. `top`: buton aşağı savrulur, popover yukarıdan iner.') },
          { name: 'GlassPopoverContent over', type: "'center' | 'edge'", default: "'center'", description: t('Where it lies over the button: around it, the button in its middle, or from the button\'s own edge.', 'Butonun üstünde nereye oturduğu: buton ortasında kalacak şekilde çevresine ya da butonun kendi kenarından.') },
          { name: 'GlassPopoverContent side / align', type: "'top' | 'bottom' / 'start' | 'center' | 'end'", default: "'bottom' / 'center'", description: t('`side`, with `over="edge"`: which way it grows from the button (down or up); it flips when there is no room. `align`: how it lines up with the button.', '`side`, `over="edge"` ile: butondan hangi yöne büyüdüğü (aşağı ya da yukarı); yer yoksa ters döner. `align`: butonla nasıl hizalandığı.') },
          { name: 'GlassPopoverContent sideOffset', type: 'number', description: t('Place it yourself. Left out, the popover lies over the button as `over` says.', 'Yerini kendin belirle. Verilmezse popover, `over` ne diyorsa butonun üstüne öyle oturur.') },
          { name: 'GlassPopoverContent className', type: 'string', description: t('Classes for the popover: `w-72`, `rounded-[26px]`, `p-4` by default.', 'Popover için sınıflar: varsayılan olarak `w-72`, `rounded-[26px]`, `p-4`.') },
          { name: 'GlassPopoverTitle / GlassPopoverDescription', type: 'className', description: t('Name the popover and say what it is for.', 'Popover\'ı adlandırır ve ne için olduğunu söyler.') },
          { name: 'GlassPopoverClose variant', type: "'quiet' | 'solid'", default: "'quiet'", description: t('A soft button in the popover\'s own tone, or the main action. It closes the popover; `onClick` runs as it does.', 'Popover\'ın kendi tonunda yumuşak bir buton ya da ana eylem. Popover\'ı kapatır; `onClick` o sırada çalışır.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A button with `aria-expanded` that opens a `dialog` named by its title.', 'Adını başlığından alan bir `dialog` açan, `aria-expanded` taşıyan bir buton.'),
          t('Focus moves into the popover as it opens. Escape, a press outside, focus leaving and every Close part close it, and focus returns to the button.', 'Açılırken odak popover\'a geçer. Escape, dışarı basma, odağın çıkması ve her Close parçası onu kapatır; odak butona döner.'),
          t('An icon-only button needs an `aria-label`.', 'Yalnız ikonlu buton `aria-label` ister.'),
          t('With reduced motion the popover opens and closes at once. Without WebGL2 it is a plain frosted panel.', 'Hareketi azalt açıksa popover anında açılıp kapanır. WebGL2 yoksa düz, buzlu bir paneldir.'),
        ],
      },
    ],
  },
  {
    slug: 'menu',
    group: 'components',
    title: t('Menu', 'Menu'),
    name: 'GlassMenu',
    description: t(
      'A menu its button grows into: the button\'s own glass pours towards where the menu lies, below, above or beside it, and runs the same way back. With submenus, checkbox and radio items, groups and shortcuts.',
      'Butonunun büyüyerek dönüştüğü menü: butonun kendi camı menünün durduğu yere, alta, üste ya da yana doğru akar ve aynı yoldan geri döner. Alt menüler, onay ve seçim öğeleri, gruplar ve kısayollarla.',
    ),
    verb: t('Grow', 'Büyü'),
    signature: t('The button\'s glass grows into a full menu, on whichever side the menu lies.', 'Butonun camı, menü hangi yanda duruyorsa oraya doğru büyüyüp tam bir menüye dönüşür.'),
    hero: 'glass-menu-basic',
    blocks: [
      {
        type: 'when',
        use: [
          t('A menu with structure: options that stay checked, one choice among a few, groups with a label, a submenu.', 'Yapısı olan bir menü: işaretli kalan seçenekler, birkaç seçenekten biri, etiketli gruplar, bir alt menü.'),
          t('A menu that must open to one side: above a bottom bar, beside a sidebar row.', 'Belli bir yana açılması gereken menü: alttaki bir çubuğun üstüne, kenar çubuğundaki bir satırın yanına.'),
          t('The three dots of a card or a row: a small round button that becomes its menu.', 'Bir kartın ya da satırın üç noktası: menüsüne dönüşen küçük, yuvarlak bir buton.'),
        ],
        avoid: [
          t('A few plain actions out of a button or a Button Group: use Dropdown Menu.', 'Bir butondan ya da Button Group\'tan çıkan birkaç yalın eylem: Dropdown Menu kullan.'),
          t('Picking a value that stays shown on the control: use Select.', 'Kontrolün üstünde görünür kalan bir değer seçmek: Select kullan.'),
          t('A short form or a note about one control: use Popover.', 'Tek bir kontrolle ilgili kısa bir form ya da not: Popover kullan.'),
        ],
      },
      { type: 'install', item: 'menu' },
      {
        type: 'note',
        text: t(
          'The behaviour (keyboard, typeahead, focus, submenus, positioning, ARIA) comes from UI SDK, so Menu needs `@ui-sdk/core` and `@ui-sdk/react`. The install command adds them at the exact version this was built on: UI SDK is in beta and its API may still change.',
          'Davranış (klavye, harfle arama, odak, alt menüler, konumlandırma, ARIA) UI SDK\'dan gelir; bu yüzden Menu `@ui-sdk/core` ve `@ui-sdk/react` paketlerine ihtiyaç duyar. Kurulum komutu onları, bileşenin yazıldığı tam sürümle ekler: UI SDK beta aşamasında ve API\'si hâlâ değişebilir.',
        ),
      },
      h('Usage', 'Kullanım'),
      {
        type: 'code',
        title: 'app.tsx',
        code: `import {
  GlassMenu,
  GlassMenuContent,
  GlassMenuItem,
  GlassMenuSeparator,
  GlassMenuTrigger,
} from '@/components/liquid-glass/glass-menu'

<GlassMenu>
  <GlassMenuTrigger aria-label="More" className="w-12 px-0"><Ellipsis /></GlassMenuTrigger>
  <GlassMenuContent align="end">
    <GlassMenuItem onSelect={save}>Save to library</GlassMenuItem>
    <GlassMenuItem onSelect={share}>Share</GlassMenuItem>
    <GlassMenuSeparator />
    <GlassMenuItem destructive onSelect={remove}>Delete</GlassMenuItem>
  </GlassMenuContent>
</GlassMenu>`,
      },
      {
        type: 'p',
        text: t(
          'The button\'s glass is the menu. Pressed, its outline grows into the menu\'s on one spring: the edge that faces the menu runs ahead and the rest follows, so the glass pours towards its place instead of scaling up. The button\'s label softens and goes as the glass leaves it, and the items stay where they are while the glass opens over them. While the menu is out the button is not there: it has become the menu. Closing runs the same path back, and a close turned round half way carries on from where it is, at the speed it has. The trigger wears Button\'s clear glass, so it needs something behind it to bend.',
          'Butonun camı menünün kendisidir. Basılınca dış hattı tek bir yayla menününkine büyür: menüye bakan kenar önden gider, gerisi onu izler; böylece cam ölçeklenerek değil, yerine doğru akarak açılır. Cam butondan ayrılırken butonun etiketi yumuşayıp gider; öğeler yerlerinde durur, cam onların üstüne açılır. Menü açıkken buton orada değildir: menüye dönüşmüştür. Kapanış aynı yolu geri gider; yarı yolda geri çevrilen bir kapanış, bulunduğu yerden ve o anki hızıyla devam eder. Tetikleyici Button\'ın berrak camını taşır, bu yüzden bükecek bir arka plana ihtiyaç duyar.',
        ),
      },
      h('On any side', 'Her yana'),
      {
        type: 'p',
        text: t(
          '`side` on `GlassMenuContent` says where the menu lies (`bottom`, `top`, `left`, `right`) and `align` how it lines up with the button (`start`, `center`, `end`). The glass finds its own way there, and the menu flips to the other side when there is no room.',
          '`GlassMenuContent` üzerindeki `side` menünün nerede durduğunu (`bottom`, `top`, `left`, `right`), `align` ise butonla nasıl hizalandığını (`start`, `center`, `end`) söyler. Cam oraya kendi yolunu bulur; yer yoksa menü öbür tarafa döner.',
        ),
      },
      { type: 'demo', id: 'glass-menu-sides', title: t('Four buttons, four sides', 'Dört buton, dört yan') },
      h('Options, groups and shortcuts', 'Seçenekler, gruplar ve kısayollar'),
      {
        type: 'p',
        text: t(
          '`GlassMenuCheckboxItem` is an option that stays on or off, and `GlassMenuRadioItem`s in a `GlassMenuRadioGroup` share one value. Both keep the menu open, so several can be set in one visit. `GlassMenuGroup` with a `GlassMenuLabel` names a set of items. An item with a `shortcut` shows its keys through `GlassMenuShortcut`.',
          '`GlassMenuCheckboxItem` açık ya da kapalı kalan bir seçenektir; bir `GlassMenuRadioGroup` içindeki `GlassMenuRadioItem` öğeleri tek bir değeri paylaşır. İkisi de menüyü açık tutar; böylece tek seferde birkaçı ayarlanabilir. `GlassMenuLabel` taşıyan bir `GlassMenuGroup` bir öğe kümesine ad verir. `shortcut` verilen öğe, tuşlarını `GlassMenuShortcut` ile gösterir.',
        ),
      },
      { type: 'demo', id: 'glass-menu-options', title: t('A view menu', 'Bir görünüm menüsü') },
      h('Submenus', 'Alt menüler'),
      {
        type: 'p',
        text: t(
          'Put a `GlassMenuSub` among the items, with a `GlassMenuSubTrigger` and a `GlassMenuSubContent` inside. The row opens its submenu on hover, on a press and with the arrow key; the submenu is a card of the same glass that fades in beside its row. The menu at the top of the page has one.',
          'Öğelerin arasına, içinde bir `GlassMenuSubTrigger` ve bir `GlassMenuSubContent` olan bir `GlassMenuSub` koy. Satır, alt menüsünü üzerine gelince, basınca ve ok tuşuyla açar; alt menü, satırının yanında belirerek açılan aynı camdan bir karttır. Sayfanın başındaki menüde bir tane var.',
        ),
      },
      {
        type: 'code',
        title: 'submenu.tsx',
        code: `<GlassMenuContent>
  <GlassMenuItem>Share</GlassMenuItem>
  <GlassMenuSub>
    <GlassMenuSubTrigger>Move to</GlassMenuSubTrigger>
    <GlassMenuSubContent>
      <GlassMenuItem>Favourites</GlassMenuItem>
      <GlassMenuItem>Archive</GlassMenuItem>
    </GlassMenuSubContent>
  </GlassMenuSub>
</GlassMenuContent>`,
      },
      h('Out of a button group', 'Bir buton grubundan'),
      {
        type: 'p',
        text: t(
          'Wrap a GlassButtonGroup and the content in the menu, and put the trigger on one of the group\'s items with `asChild`. The whole group\'s glass is then the one that grows into the menu, and the menu takes its colour.',
          'Bir GlassButtonGroup\'u ve içeriği menüyle sar, tetikleyiciyi `asChild` ile grubun öğelerinden birine koy. Böylece menüye doğru büyüyen cam, bütün grubun camı olur ve menü onun rengini alır.',
        ),
      },
      {
        type: 'code',
        title: 'toolbar.tsx',
        code: `<GlassMenu>
  <GlassButtonGroup>
    <GlassMenuTrigger asChild>
      <GlassButtonGroupItem aria-label="More" className="px-0"><Ellipsis /></GlassButtonGroupItem>
    </GlassMenuTrigger>
  </GlassButtonGroup>
  <GlassMenuContent align="end">
    <GlassMenuItem>Mark as read</GlassMenuItem>
    <GlassMenuItem destructive>Delete</GlassMenuItem>
  </GlassMenuContent>
</GlassMenu>`,
      },
      { type: 'demo', id: 'glass-button-group-basic', title: t('The three dots of a toolbar', 'Bir araç çubuğunun üç noktası') },
      h('The motion on your own popup', 'Hareketi kendi açılır yüzeyinde kullanmak'),
      {
        type: 'p',
        text: t(
          'Menu is built on `GlassPopup`: `useGlassPopup({ opening: \'grow\' })` gives any control that opens a surface the same motion, with `GlassPopupAnchor` as the control\'s first child and `GlassPopupSurface` as the content\'s. Wrap the content\'s children in an element with `data-glass-list`. The numbers (the spring, which side leads, when the label goes and the content shows) are `MENU` in `engine.ts`.',
          'Menu, `GlassPopup` üzerine kuruludur: `useGlassPopup({ opening: \'grow\' })`, bir yüzey açan her kontrole aynı hareketi verir; `GlassPopupAnchor` kontrolün, `GlassPopupSurface` içeriğin ilk çocuğu olur. İçeriğin çocuklarını `data-glass-list` taşıyan bir öğeyle sar. Sayılar (yay, hangi kenarın önden gittiği, etiketin ne zaman gidip içeriğin ne zaman göründüğü) `engine.ts` içindeki `MENU` sabitindedir.',
        ),
      },
      h('API reference', 'API referansı'),
      {
        type: 'props',
        rows: [
          { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open: boolean) => void', description: t('On `GlassMenu`: control the menu yourself, or let it keep its own state.', '`GlassMenu` üzerinde: menüyü kendin yönet ya da kendi durumunu tutsun.') },
          { name: 'GlassMenuTrigger className', type: 'string', description: t('The button is a pill 48px tall. `w-12 px-0` makes it round for a single icon (give it an `aria-label`).', 'Buton 48px yüksekliğinde bir haptır. `w-12 px-0` onu tek bir ikon için yuvarlak yapar (`aria-label` ver).') },
          { name: 'GlassMenuTrigger asChild', type: 'boolean', default: 'false', description: t('Put the trigger on its single child (a `GlassButtonGroupItem`) instead of a glass button of its own: the group\'s glass grows into the menu.', 'Tetikleyiciyi kendi cam butonu yerine tek çocuğuna (bir `GlassButtonGroupItem`) koyar: menüye doğru büyüyen, grubun camı olur.') },
          { name: 'GlassMenuContent side', type: "'bottom' | 'top' | 'left' | 'right'", default: "'bottom'", description: t('Where the menu lies against its button. It flips when there is no room.', 'Menünün butona göre nerede durduğu. Yer yoksa öbür tarafa döner.') },
          { name: 'GlassMenuContent align', type: "'start' | 'center' | 'end'", default: "'start'", description: t('How the menu lines up with the button along that side.', 'Menünün o kenar boyunca butonla nasıl hizalandığı.') },
          { name: 'GlassMenuContent sideOffset', type: 'number', default: '8', description: t('The gap between the button and the menu, in px.', 'Buton ile menü arasındaki boşluk, px olarak.') },
          { name: 'GlassMenuItem onSelect', type: '() => void', description: t('Runs when the item is pressed; the menu then closes (`closeOnSelect={false}` keeps it open).', 'Öğeye basılınca çalışır; ardından menü kapanır (`closeOnSelect={false}` açık tutar).') },
          { name: 'GlassMenuItem destructive / disabled', type: 'boolean', default: 'false', description: t('`destructive` paints the item red, for Delete. `disabled` dims it and the keyboard skips it.', '`destructive` öğeyi kırmızıya boyar; Sil için. `disabled` onu soluklaştırır, klavye de atlar.') },
          { name: 'GlassMenuItem shortcut', type: 'string', description: t('The item\'s keys, as `Mod+R`. Put a `GlassMenuShortcut` inside the item to show them.', 'Öğenin tuşları, `Mod+R` biçiminde. Göstermek için öğenin içine bir `GlassMenuShortcut` koy.') },
          { name: 'GlassMenuCheckboxItem value', type: 'string', description: t('Names the option (required).', 'Seçeneğe ad verir (zorunlu).') },
          { name: 'GlassMenuCheckboxItem checked / defaultChecked / onCheckedChange', type: 'boolean / boolean / (checked: boolean) => void', description: t('The option\'s state, yours or its own. A check shows at its end while it is on.', 'Seçeneğin durumu; senin ya da kendi tuttuğu. Açıkken sonunda bir onay işareti görünür.') },
          { name: 'GlassMenuRadioGroup value / defaultValue / onValueChange', type: 'string / string / (value: string) => void', description: t('The one value its `GlassMenuRadioItem`s share; each item carries its own `value`.', 'İçindeki `GlassMenuRadioItem` öğelerinin paylaştığı tek değer; her öğe kendi `value` değerini taşır.') },
          { name: 'GlassMenuGroup / GlassMenuLabel', type: 'children', description: t('A set of items and its quiet heading.', 'Bir öğe kümesi ve onun sakin başlığı.') },
          { name: 'GlassMenuSeparator', type: 'className', description: t('A hairline between items.', 'Öğeler arasında ince bir çizgi.') },
          { name: 'GlassMenuSub / GlassMenuSubTrigger / GlassMenuSubContent', type: 'children', description: t('A submenu, the row that opens it and its card. `GlassMenuSubContent` takes `side`, `align` and `sideOffset` too.', 'Bir alt menü, onu açan satır ve kartı. `GlassMenuSubContent` de `side`, `align` ve `sideOffset` alır.') },
        ],
      },
      h('Accessibility', 'Erişilebilirlik'),
      {
        type: 'list',
        items: [
          t('A button with `aria-haspopup` that opens a `menu` of `menuitem`, `menuitemcheckbox` and `menuitemradio` rows (the WAI-ARIA menu button pattern).', '`menuitem`, `menuitemcheckbox` ve `menuitemradio` satırlarından oluşan bir `menu` açan, `aria-haspopup` taşıyan bir buton (WAI-ARIA menü butonu kalıbı).'),
          t('Arrow keys, Home and End move through the items, typing a letter jumps to a match, Enter or Space runs the item. The right arrow opens a submenu and the left arrow closes it. Escape closes the menu and returns focus to the button.', 'Ok tuşları, Home ve End öğeler arasında gezer; bir harf yazmak eşleşene atlar, Enter ya da Boşluk öğeyi çalıştırır. Sağ ok alt menüyü açar, sol ok kapatır. Escape menüyü kapatıp odağı butona döndürür.'),
          t('The button is hidden while the menu is out, and still there for the keyboard and for screen readers: focus returns to it on close.', 'Menü açıkken buton görünmez, ama klavye ve ekran okuyucular için oradadır: kapanınca odak ona döner.'),
          t('An icon-only button needs an `aria-label`.', 'Yalnız ikonlu buton `aria-label` ister.'),
          t('With reduced motion the menu opens and closes at once. Without WebGL2 it is a plain frosted list.', 'Hareketi azalt açıksa menü anında açılıp kapanır. WebGL2 yoksa düz, buzlu bir listedir.'),
        ],
      },
    ],
  },
]

export const pageBySlug = (slug: string) => PAGES.find((p) => p.slug === slug)

/** The components, numbered in reading order (01, 02, …). */
export const CATALOG = PAGES.filter((p) => p.group === 'components')

// ── Releases ────────────────────────────────────────────────────────────────
// Newest first. One list feeds the sidebar card, the New pills, each component's latest
// change, /changelog and changelog.md, so they never disagree. Versions have two levels:
// x.y is a version (announced when it adds a component), x.y.z its patch releases.

export type ChangeKind = 'new' | 'improved' | 'fixed' | 'removed'

export type Change = {
  kind: ChangeKind
  /** The docs page (slug) the change is about, when it is about one. */
  page?: string
  /** Other component pages it changes too: each gets the Updated pill while its line is current. */
  also?: string[]
  text: L
}

export type Release = {
  version: string
  /** ISO date. */
  date: string
  title: L
  changes: Change[]
}

export const CHANGE_KINDS: ChangeKind[] = ['new', 'improved', 'fixed', 'removed']

export const RELEASES: Release[] = [
  {
    version: '2.0.5',
    date: '2026-11-27',
    title: t('The site moved to liquidglass.onemorethink.dev.', 'Site liquidglass.onemorethink.dev adresine taşındı.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'Docs, install commands, the registry and the llms files now use liquidglass.onemorethink.dev. The old onemorethink.dev addresses for the docs, the registry and the llms files redirect to the same page here; onemorethink.dev itself is now the OneMoreThink page.',
          'Dokümanlar, kurulum komutları, registry ve llms dosyaları artık liquidglass.onemorethink.dev adresini kullanıyor. Dokümanların, registry\'nin ve llms dosyalarının eski onemorethink.dev adresleri buradaki aynı sayfaya yönleniyor; onemorethink.dev\'in kendisi artık OneMoreThink sayfası.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'The header carries the name as text, "Liquid" light and "Glass" heavy. The drawn logo stays in the footer.',
          'Başlıkta ad artık yazıyla duruyor: "Liquid" ince, "Glass" kalın. Çizilmiş logo altbilgide kalıyor.',
        ),
      },
      {
        kind: 'removed',
        text: t('The brand page is gone; its address redirects to the home page.', 'Marka sayfası kaldırıldı; adresi ana sayfaya yönleniyor.'),
      },
    ],
  },
  {
    version: '2.0.4',
    date: '2026-11-25',
    title: t('Card: the rows behind it run edge to edge.', 'Card: arkasındaki sıralar kenardan kenara uzanıyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'card',
        text: t(
          'In the Card example the rows of colour run from one side of the stage to the other, with no padding at the sides, and fade in at both ends through an SVG mask instead of a progressive blur.',
          'Card örneğinde renk sıraları sahnenin bir yanından öbür yanına, yanlarda boşluk olmadan uzanıyor ve iki uçta kademeli bulanıklık yerine bir SVG maskeyle beliriyor.',
        ),
      },
    ],
  },
  {
    version: '2.0.3',
    date: '2026-11-25',
    title: t('Card: far less to paint, upload and copy on every frame.', 'Card: her karede boyanan, yüklenen ve kopyalanan çok daha az.'),
    changes: [
      {
        kind: 'improved',
        page: 'card',
        text: t(
          'A Card kept room under its glass for a drop shadow it does not cast (its shadow is CSS): close to half of its canvas was empty, and was still painted, uploaded, shaded and copied on every frame. Glass that casts no shadow now keeps no room for one. The rows that went were all empty.',
          'Card, camının altında atmadığı bir gölge için yer tutuyordu (gölgesi CSS): tuvalinin yarıya yakını boştu ve yine de her karede boyanıyor, yükleniyor, gölgelendiriliyor ve kopyalanıyordu. Gölge atmayan cam artık gölge için yer tutmuyor. Giden satırların hepsi boştu.',
        ),
      },
      {
        kind: 'improved',
        page: 'card',
        text: t(
          'Glass frosted all over never reads the page at full size: every reading is a few mip levels up. The page is now painted that much smaller to begin with (a quarter or a sixteenth of the pixels), so there is that much less to paint, upload and build mipmaps from, which counts most on a phone. A 176 px live card on a double-density screen sent 256,000 pixels of the page to the GPU on every frame and now sends 11,000. Against the full picture the glass differs by 3 levels in 255 at most.',
          'Baştan sona buzlu cam, sayfayı hiçbir zaman tam boyutta okumaz: her okuma birkaç mip seviyesi yukarıdandır. Sayfa artık baştan o kadar küçük boyanıyor (piksellerin dörtte biri ya da on altıda biri); boyanacak, yüklenecek ve mipmap\'i kurulacak o kadar az şey kalıyor. Bu en çok telefonda fark eder. Çift yoğunluklu ekranda 176 px\'lik canlı bir kart her karede sayfanın 256.000 pikselini GPU\'ya yolluyordu, şimdi 11.000. Tam resimle karşılaştırıldığında cam 255 üzerinden en çok 3 seviye farklı.',
        ),
      },
    ],
  },
  {
    version: '2.0.2',
    date: '2026-11-25',
    title: t('The engine does less: nothing at rest, and far less for the GPU.', 'Motor daha az iş yapıyor: boştayken hiç, çizerken GPU\'ya çok daha az.'),
    changes: [
      {
        kind: 'fixed',
        page: 'menu',
        also: ['popover'],
        text: t(
          'A Menu or a Popover that was shut asked the engine for a new frame on every frame, for as long as it was on the page: the loop never stopped, and the browser went through a whole frame of its own each time with nothing moving. It now says once that it has landed, and the page is still again.',
          'Kapalı duran bir Menu ya da Popover, sayfada olduğu sürece her karede motordan yeni bir kare istiyordu: döngü hiç durmuyor, hiçbir şey kıpırdamazken tarayıcı her seferinde baştan sona bir kare işliyordu. Artık yerine oturduğunu bir kez söylüyor ve sayfa yeniden duruyor.',
        ),
      },
      {
        kind: 'fixed',
        page: 'badge',
        text: t(
          'Once its glass has drawn, a Badge hides its plain CSS look, but the marquee in that look kept running unseen. It ran on the main thread, so on every frame of anything else on the page the browser worked out all of the page\'s layers again: several milliseconds a frame, on every page with a Badge. The hidden marquee now stops; without WebGL2 it runs as before.',
          'Camı çizildikten sonra Badge düz CSS görünümünü gizler, ama o görünümdeki kayan yazı görünmeden çalışmaya devam ediyordu. Ana iş parçacığında çalıştığı için, sayfadaki başka herhangi bir şeyin her karesinde tarayıcı sayfanın bütün katmanlarını yeniden hesaplıyordu: Badge olan her sayfada kare başına birkaç milisaniye. Gizlenen kayan yazı artık duruyor; WebGL2 yoksa eskisi gibi çalışıyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'card',
        text: t(
          'The frost of a Card is 32 readings of the page for every pixel of the glass, most of what the GPU does for it. On large frosted glass (a canvas of about 0.3 megapixels or more, so mostly on high-density screens) the frost is now worked out first, into a picture a half or a third of the size, and the glass reads it; along the rim it is still worked out in full. Measured on one GPU, that is about a fifth less GPU time on a 0.36 megapixel card and three quarters less on a 1.9 megapixel one. The two pictures differ by 5 levels in 255 at most; smaller cards are drawn exactly as before.',
          'Card\'ın buzlanması, camın her pikseli için sayfadan 32 okuma demek; GPU\'nun onun için yaptığı işin çoğu bu. Büyük buzlu camda (tuvali yaklaşık 0,3 megapiksel ve üstü, yani çoğunlukla yüksek yoğunluklu ekranlarda) buzlanma artık önce yarı ya da üçte bir boyutunda bir resme hesaplanıyor ve cam onu okuyor; kenar boyunca yine tam hesaplanıyor. Tek bir GPU\'da ölçüldüğünde bu, 0,36 megapiksellik kartta yaklaşık beşte bir, 1,9 megapiksellik kartta dörtte üç daha az GPU süresi. İki resim arasındaki fark 255 üzerinden en çok 5 seviye; daha küçük kartlar eskisiyle birebir aynı çiziliyor.',
        ),
      },
      {
        kind: 'fixed',
        page: 'slider',
        also: ['switch', 'checkbox'],
        text: t(
          'Slider, Switch and Checkbox share one WebGL canvas, and it was resized to each control before that control was drawn: with controls of different sizes on screen, every control got a new drawing buffer on every frame, the costliest call on such a page by far. The canvas now only grows, and each control is drawn into a corner of it.',
          'Slider, Switch ve Checkbox tek bir WebGL tuvalini paylaşır; bu tuval her kontrol çizilmeden önce onun boyutuna getiriliyordu: ekranda farklı boyutlarda kontroller varken her kontrol her karede yeni bir çizim arabelleği alıyordu, böyle bir sayfadaki açık ara en pahalı çağrı buydu. Tuval artık yalnızca büyüyor ve her kontrol onun bir köşesine çiziliyor.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'The engine asks nothing of the GPU for a frame that would come out as the one already on the canvas, sends only the uniforms that changed, and writes a new picture of the page into the texture it has instead of having one allocated each time. The canvases those pictures are painted on are kept per size, no longer resized for every glass in turn.',
          'Motor, tuvaldekinin aynısı çıkacak bir kare için GPU\'dan hiçbir şey istemiyor, yalnızca değişen uniform\'ları gönderiyor ve sayfanın yeni resmini her seferinde yeni bir doku ayırtmak yerine elindeki dokuya yazıyor. Bu resimlerin boyandığı tuvaller boyuta göre saklanıyor; artık sırayla her cam için yeniden boyutlanmıyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'select',
        also: ['dropdown-menu', 'popover', 'menu'],
        text: t(
          'The control of a surface that opens keeps its picture of the page while the page scrolls under it, as a Button does, instead of painting the page again on every frame of a scroll. Reading the page for any glass also leaves out sooner what lies outside it.',
          'Açılan bir yüzeyin kontrolü, sayfa altından kayarken sayfanın resmini bir Button gibi koruyor; kaydırmanın her karesinde sayfayı yeniden boyamıyor. Herhangi bir cam için sayfa okunurken camın dışında kalanlar da artık daha erken eleniyor.',
        ),
      },
      {
        kind: 'fixed',
        text: t(
          'The site, the README and the introduction said one WebGL2 shader draws every component. Slider, Switch and Checkbox are drawn by a renderer of their own, built on three.js, so the line now reads "React components drawn in WebGL2", and the introduction says which components that renderer draws.',
          'Site, README ve giriş sayfası bütün bileşenleri tek bir WebGL2 gölgelendiricisinin çizdiğini söylüyordu. Slider, Switch ve Checkbox ise three.js üzerine kurulu kendi çizicisiyle çiziliyor; cümle artık "WebGL2 ile çizilen React bileşenleri" ve giriş sayfası o çizicinin hangi bileşenleri çizdiğini söylüyor.',
        ),
      },
    ],
  },
  {
    version: '2.0.1',
    date: '2026-11-25',
    title: t('Button: an example with every prop side by side.', 'Button: bütün prop\'ların yan yana durduğu bir örnek.'),
    changes: [
      {
        kind: 'improved',
        page: 'button',
        text: t(
          'The Examples section is back on this page with one example, "Every prop, side by side": one row per prop (`material`, `tint`, `size`, `icon`, `pull`), with clear and tinted buttons of different colours next to each other, close enough to melt into one another when you pull one.',
          'Örnekler bölümü tek bir örnekle bu sayfaya geri geldi, "Bütün prop\'lar yan yana": her prop için bir satır (`material`, `tint`, `size`, `icon`, `pull`), farklı renklerde berrak ve renkli butonlar yan yana, birini çekince birbirine kaynaşacak kadar yakın.',
        ),
      },
    ],
  },
  {
    version: '2.0.0',
    date: '2026-11-24',
    title: t('Buttons melt into each other as they come near.', 'Butonlar birbirine yaklaşınca kaynaşıyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'button',
        also: ['action-button', 'button-group'],
        text: t(
          'Cohesion: two buttons that come near each other melt into one body, as two drops of liquid do (the fusion of Liquid Glass Studio, MIT). Within reach the sides that face each other lean out, nearer still a bridge forms between them, and it thins and lets go as they part, whatever brings them together: a pull, a swell, the layout. Each glass keeps its own canvas and draws its side of the bridge; across it the two share their bevel, bend, tint and shadow, so the line where they meet does not show. Joined, hold one and part of the light of the press runs on into the other (a little of it by default, `light` in `COHESION`). Pull the round button towards the wide one in the "Hold and drag" example to see it. The engine does it for every button (`COHESION` in `engine.ts`); a card, a menu or a lens never melts.',
          'Kohezyon: birbirine yaklaşan iki buton, iki damla sıvı gibi tek gövdede kaynaşıyor (Liquid Glass Studio\'daki kaynaşma, MIT). Erime girince birbirine bakan kenarlar dışa doğru uzanıyor, daha da yaklaşınca aralarında bir köprü oluşuyor, ayrılırken köprü incelip kopuyor. Onları neyin yaklaştırdığı fark etmiyor: çekiş, şişme ya da yerleşim. Her cam kendi tuvalini koruyor ve köprünün kendi yarısını çiziyor; köprü boyunca ikisi kenar eğimini, bükülmeyi, rengi ve gölgeyi paylaşıyor, bu yüzden buluştukları çizgi görünmüyor. Birleşince birini basılı tut, basışın ışığının bir kısmı ötekine de akar (varsayılan olarak azı; `COHESION` içinde `light`). Görmek için "Basılı tutup çek" örneğindeki yuvarlak butonu geniş olana doğru çek. Motor bunu her buton için yapıyor (`engine.ts` içinde `COHESION`); kart, menü ya da mercek asla kaynaşmıyor.',
        ),
      },
      {
        kind: 'fixed',
        page: 'button',
        text: t(
          'The rim of clear glass mirrors a picture of what lies around it, taken now and then. Taken while a neighbour was still lit by a press (or swollen), it could keep that light on the rim after it had gone, until the pointer came back over the glass. While anything on the page moves or is lit, the glass now keeps the picture it has, and takes a new one at once when all is still.',
          'Şeffaf camın kenarı, çevresinin arada bir çekilen bir resmini yansıtır. Bu resim, bir komşu hâlâ basışın ışığıyla yanarken (ya da şişmişken) çekilirse, o ışık söndükten sonra da kenarda kalabiliyordu; imleç camın üzerine geri gelene kadar. Sayfada bir şey hareket ederken ya da yanarken cam artık elindeki resmi koruyor ve her şey durunca hemen yenisini çekiyor.',
        ),
      },
    ],
  },
  {
    version: '1.7.4',
    date: '2026-11-24',
    title: t('No magenta line as a Menu opens in Safari.', 'Safari\'de Menu açılırken mor çizgi yok.'),
    changes: [
      {
        kind: 'fixed',
        page: 'menu',
        also: ['dropdown-menu'],
        text: t(
          'Menu: in Safari on iPhone, a thin magenta line could show down the right side of the list for a frame or two as it came into focus. The list comes out of a blur while the glass, still smaller than the list, cuts it to its own shape, and WebKit draws a blur of under about a pixel and a half on a list cut that way with that line. The blur now ends at two device pixels instead of thinning to nothing. A Dropdown Menu with `over` brings its list in the same way, and its blur ends there too.',
          'Menu: iPhone\'da Safari\'de liste netleşirken bir iki kare boyunca listenin sağ kenarında ince, mor bir çizgi görünebiliyordu. Liste bir bulanıklıktan çıkıyor; bu sırada listeden henüz küçük olan cam onu kendi şekline kesiyor. WebKit böyle kesilmiş bir listede bir buçuk pikselden küçük bir bulanıklığı o çizgiyle çiziyor. Bulanıklık artık hiçe incelmek yerine iki cihaz pikselinde bitiyor. `over` ile açılan Dropdown Menu da listesini aynı yolla getiriyor; onun bulanıklığı da artık orada bitiyor.',
        ),
      },
    ],
  },
  {
    version: '1.7.3',
    date: '2026-11-24',
    title: t('A Menu out of a button group, and no line where the glass leaves its control.', 'Buton grubundan açılan Menu ve camın kontrolünden ayrıldığı yerde çizgi yok.'),
    changes: [
      {
        kind: 'improved',
        page: 'menu',
        text: t(
          'Menu opens out of a button group: `GlassMenuTrigger asChild` puts the trigger on an item of a GlassButtonGroup, and the whole group\'s glass grows into the menu. The three dots of the Button Group example are now a Menu.',
          'Menu artık bir buton grubundan açılabiliyor: `GlassMenuTrigger asChild` tetikleyiciyi bir GlassButtonGroup öğesine koyar ve menüye doğru bütün grubun camı büyür. Button Group örneğindeki üç nokta artık bir Menu.',
        ),
      },
      {
        kind: 'improved',
        page: 'menu',
        text: t(
          'The Menu page and its tile on the landing page now open with the menu button itself: the three dots that grow into a menu with a submenu. The four buttons that open to four sides moved down to "On any side".',
          'Menu sayfası ve açılış sayfasındaki karosu artık doğrudan menü butonuyla açılıyor: alt menülü bir menüye doğru büyüyen üç nokta. Dört yana açılan dört buton aşağıya, "Her yana" bölümüne taşındı.',
        ),
      },
      {
        kind: 'fixed',
        also: ['select', 'dropdown-menu', 'popover'],
        page: 'menu',
        text: t(
          'Menu, Select, Dropdown Menu and Popover: while the glass was on its way out of its control or back in, a thin dark line could show across it at the edge of the control, and the control\'s own box could look lighter than the rest. The glass is drawn there by two canvases, the control\'s and the surface\'s, that meet at the control\'s edge: each was cut at the same line, so both were half drawn along it and the page showed through, and the light of the press lit the control\'s side alone. The control\'s canvas now reaches a pixel under the surface\'s, and the surface\'s takes the same light.',
          'Menu, Select, Dropdown Menu ve Popover: cam kontrolünden çıkarken ya da geri dönerken, kontrolün kenarında camın üzerinde ince, koyu bir çizgi görünebiliyor ve kontrolün kendi kutusu camın geri kalanından açık görünebiliyordu. Cam orada iki tuvalle çiziliyor, kontrolünkü ve yüzeyinki; ikisi kontrolün kenarında buluşuyor. İkisi de aynı çizgiden kesildiği için o çizgi boyunca ikisi de yarım çiziliyor ve sayfa aradan görünüyordu; basışın ışığı da yalnız kontrol tarafını yakıyordu. Kontrolün tuvali artık yüzeyinkinin bir piksel altına uzanıyor ve yüzeyinki de aynı ışığı alıyor.',
        ),
      },
      {
        kind: 'improved',
        also: ['menu', 'select', 'dropdown-menu', 'popover'],
        text: t(
          'Select, Dropdown Menu, Popover and Menu: on the way out the content fades sooner, ahead of the glass. Popover and an over-the-control Dropdown Menu take it in 0.12 s instead of 0.24 s, Select and Dropdown Menu no longer keep it until the glass is nearly back in: it is gone in 0.07 s, and Menu no longer waits for the glass to shrink: its content is gone in 0.12 s.',
          'Select, Dropdown Menu, Popover ve Menu: kapanırken içerik camın önünde, daha çabuk saydamlaşıyor. Popover ve kontrolün üzerinde açılan Dropdown Menu bunu 0,24 sn yerine 0,12 sn\'de, Select ve Dropdown Menu içeriği artık cam neredeyse geri girene kadar tutmuyor, 0,07 sn\'de söndürüyor; Menu de artık camın küçülmesini beklemiyor, içeriği 0,12 sn\'de gidiyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'menu',
        text: t(
          'Menu: the moment its glass is a button again, the button swells once as under a hover and lets go, as Select, Dropdown Menu and Popover already did.',
          'Menu: camı yeniden düğme olduğu anda düğme, üzerine gelinmiş gibi bir kez şişip bırakıyor; Select, Dropdown Menu ve Popover zaten böyle yapıyordu.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'Docs: a component changed since the last one was added now says so with an Updated pill beside its name, in the sidebar and on its page.',
          'Dokümantasyon: son bileşen eklendiğinden beri değişen bir bileşenin adının yanında, kenar çubuğunda ve kendi sayfasında artık Güncellendi yazıyor.',
        ),
      },
    ],
  },
  {
    version: '1.7.2',
    date: '2026-11-24',
    title: t('Controls that open something: hold, pull, let go.', 'Bir şey açan kontroller: basılı tut, çekiştir, bırak.'),
    changes: [
      {
        kind: 'improved',
        also: ['menu', 'select', 'dropdown-menu', 'popover'],
        text: t(
          'Select, Dropdown Menu, Popover and Menu: the control that opens the surface is now held like a button. Press and hold it and it stays shut: it swells, lights up and, dragged, comes after the pointer and stretches as any button does (`PULL` in `engine.ts`). The surface opens when you let go on the control, and its opening starts from wherever the pull has the glass at that moment. Let go away from the control and nothing opens. Before, a mouse press opened a menu or a list at once, so there was nothing to hold. A press on an open control still closes it at once, and touch and the keyboard are as they were. Choosing an item by pressing the control, dragging to the item and letting go is gone.',
          'Select, Dropdown Menu, Popover ve Menu: yüzeyi açan kontrol artık bir buton gibi basılı tutulabiliyor. Basılı tuttuğunda kapalı kalır: şişer, ışıklanır; sürüklersen her buton gibi imlecin peşinden gelir ve esner (`engine.ts` içindeki `PULL`). Yüzey, kontrolün üzerinde bıraktığında açılır ve açılış, çekişin camı o an getirdiği yerden başlar. Kontrolün uzağında bırakırsan hiçbir şey açılmaz. Önceden fareyle basmak menüyü ya da listeyi hemen açıyordu, yani basılı tutacak bir şey yoktu. Açık bir kontrole basmak onu yine hemen kapatır; dokunma ve klavye eskisi gibidir. Kontrole basıp bir öğeye sürükleyerek bırakıp seçmek artık yok.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'The light of a press now follows one rule, kept in the engine. A button is lit by the flash of a press (`GLOW` in `engine.ts`): light comes up where the press lands, stays for a moment even on a quick click, then fades as it spreads; Space and Enter start it at the centre. Button, Action Button and Button Group take it now, as the controls of Select, Dropdown Menu, Popover and Menu do. A surface is lit by the soft light of 1.7.1 alone (`LIGHT`), where the press lands and for as long as it is held: Card, and the list or the menu a control opens. A surface that holds choices also lights up around a choice pressed in it, with a wide, soft light that stays inside the glass: the lists of Select, Dropdown Menu and Popover had it, and a Menu, its submenus and any card with rows take it now, from the engine. On every surface a control opens, the soft light is now measured from the surface itself, so it lands where the press does; before, it was measured from the control and mostly missed. The press that opens a Menu lights its button and fades there, without widening over the menu. A view tells the engine that it is a button (`button: true`); everything else is a surface.',
          'Basış ışığı artık motorda duran tek bir kurala bağlı. Buton, basışın parlamasıyla ışıklanır (`engine.ts` içindeki `GLOW`): ışık basışın indiği yerde yanar, hızlı bir tıklamada bile bir an kalır, sonra yayılarak söner; Space ve Enter onu ortadan başlatır. Button, Action Button ve Button Group artık bu ışığı alıyor; Select, Dropdown Menu, Popover ve Menu kontrolleri zaten alıyordu. Yüzey ise yalnızca 1.7.1\'in yumuşak ışığıyla (`LIGHT`) ışıklanır: basışın indiği yerde, basılı tutulduğu sürece. Card ve bir kontrolün açtığı liste ya da menü böyledir. Seçenek tutan yüzey ayrıca, içinde basılan seçeneğin çevresinde camın içinde kalan geniş, yumuşak bir ışıkla yanar: Select, Dropdown Menu ve Popover listelerinde bu vardı; Menu, alt menüleri ve satırlı kartlar da artık motordan alıyor. Bir kontrolün açtığı her yüzeyde yumuşak ışık artık yüzeyin kendisinden ölçülüyor, yani bastığın yere düşüyor; önceden kontrolden ölçülüyor ve çoğu zaman ıskalıyordu. Menu\'yü açan basış butonunu yakar ve ışık orada söner, menünün üzerine yayılmaz. Bir cam motora buton olduğunu söyler (`button: true`); geri kalan her şey yüzeydir.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'Pulled glass now draws its own stretch. Before, the whole picture was pulled out of shape with the button: the round ends went oval and what showed through the glass stretched with it. Now the glass stays a pill with round ends, as long and as thin as the pull makes it, and bends what really lies behind it, which stays where it is. A round button becomes a short pill. Button, Action Button, Button Group and the controls of Select, Dropdown Menu, Popover and Menu all do. The label still stretches with the button. A frame of a pull costs what it did (measured: 0.5 to 0.7 ms either way).',
          'Çekilen cam artık esnemesini kendisi çiziyor. Önceden bütün görüntü butonla birlikte geriliyordu: yuvarlak uçlar ovalleşiyor, camın içinden görünen de onunla uzuyordu. Artık cam, uçları yuvarlak bir hap olarak kalır, çekişin yaptığı kadar uzun ve ince; arkasında gerçekten ne varsa onu büker, arkadaki de yerinde durur. Yuvarlak buton kısa bir hapa dönüşür. Button, Action Button, Button Group ile Select, Dropdown Menu, Popover ve Menu kontrolleri böyle çalışır. Etiket yine butonla birlikte esner. Çekişin bir karesi eskisi kadar tutar (ölçüldü: iki durumda da 0,5–0,7 ms).',
        ),
      },
    ],
  },
  {
    version: '1.7.1',
    date: '2026-11-24',
    title: t('Glass lights up where it is pressed.', 'Cam, basıldığı yerde ışıklanıyor.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'Glass now lights up from within where it is pressed. Press a control and the light comes up where the press landed and stays there for as long as you hold; Space and Enter light the middle. Let go and it sinks back. The light follows nothing, and a pointer that only rests on the glass lights nothing. The light is white laid over the glass, strongest where the press landed and gone at its radius, and it never leaves the glass. Button, Action Button, Button Group, Badge, Slide to Confirm, Card, Slider, Switch and Checkbox take it, and the Tabs lens while it is held. Select, Dropdown Menu, Popover and Menu take it too, and keep the light of their own on top of it: the press that opens one lights it where it landed. On the first three that light widens with the surface as it opens; on Menu it stays where it is and fades. Its numbers are `LIGHT` in `engine.ts`; `on: false` there turns it off. The light is that of Glass HQ\'s liquid-glass (MIT).',
          'Cam artık basıldığı yerde içten ışıklanıyor. Bir kontrole bastığında ışık bastığın yerde yanar ve basılı tuttuğun sürece orada kalır; Space ve Enter camın ortasını yakar. Bırakınca söner. Işık hiçbir şeyi izlemez; yalnızca üzerinde duran imleç de hiçbir şeyi yakmaz. Işık, camın üzerine bindirilen beyazdır: bastığın yerde en güçlüdür, yarıçapının ucunda biter ve camın dışına taşmaz. Button, Action Button, Button Group, Badge, Slide to Confirm, Card, Slider, Switch ve Checkbox bu ışığı alır; Tabs merceği de basılı tutulurken. Select, Dropdown Menu, Popover ve Menu de bu ışığı alır ve bunun üstüne kendi ışıklarını korur: birini açan basış onu bastığın yerde yakar. İlk üçünde bu ışık yüzey açılırken onunla birlikte genişler; Menu\'de olduğu yerde kalır ve söner. Sayıları `engine.ts` içindeki `LIGHT` sabitindedir; oradaki `on: false` ışığı kapatır. Işık, Glass HQ\'nun liquid-glass kütüphanesindekidir (MIT).',
        ),
      },
    ],
  },
  {
    version: '1.7.0',
    date: '2026-11-24',
    title: t('Menu.', 'Menu.'),
    changes: [
      {
        kind: 'new',
        page: 'menu',
        text: t(
          'Menu: a menu its button grows into. The button\'s own glass pours towards where the menu lies (below, above or beside it), the edge that faces the menu ahead of the rest, and runs the same way back to close; a close turned round half way carries on from where it is. It comes with submenus, checkbox and radio items, groups with a label and shortcuts. Keyboard, typeahead, focus, positioning and ARIA come from UI SDK. The motion is that of Glass HQ\'s liquid-glass (MIT), ported onto the kit\'s own engine.',
          'Menu: butonunun büyüyerek dönüştüğü menü. Butonun kendi camı menünün durduğu yere (alta, üste ya da yana) akar; menüye bakan kenar önden gider. Kapanış aynı yolu geri gider; yarı yolda geri çevrilen kapanış bulunduğu yerden devam eder. Alt menüler, onay ve seçim öğeleri, etiketli gruplar ve kısayollarla gelir. Klavye, harfle arama, odak, konumlandırma ve ARIA UI SDK\'dan gelir. Hareket, Glass HQ\'nun liquid-glass kütüphanesindekidir (MIT); kitin kendi motoruna taşındı.',
        ),
      },
      {
        kind: 'improved',
        page: 'menu',
        text: t(
          '`GlassPopup` has a third way out: `useGlassPopup({ opening: \'grow\' })` grows a control\'s glass into the surface it opens, wherever that surface lies. One shape on one spring, drawn by one canvas once the label has gone, and the page behind is read once per opening. Its numbers are `MENU` in `engine.ts`. Select, Dropdown Menu and Popover keep their own motion.',
          '`GlassPopup`\'a üçüncü bir açılış geldi: `useGlassPopup({ opening: \'grow\' })`, kontrolün camını açtığı yüzeye, yüzey nerede duruyorsa oraya doğru büyütür. Tek yay üzerinde tek şekil; etiket gittikten sonra tek bir tuval çizer, arkadaki sayfa da her açılışta bir kez okunur. Sayıları `engine.ts` içindeki `MENU` sabitindedir. Select, Dropdown Menu ve Popover kendi hareketlerini korur.',
        ),
      },
    ],
  },
  {
    version: '1.6.13',
    date: '2026-11-24',
    title: t('Reflections: softer, stronger, closer to the rim.', 'Yansımalar: daha yumuşak, daha güçlü, kenara daha yakın.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'What the rim of clear glass mirrors of its neighbours has been retuned. A neighbour now shows more strongly just inside the rim, as a soft wash of its colour rather than a picture of itself. The wash is shallower (about half as deep) and fades evenly inwards. The rim also looks less far, so a neighbour has to be nearer to show. The values are `MIRROR` in `engine.ts`.',
          'Şeffaf camın kenarının komşularından yansıttığı görüntü yeniden ayarlandı. Komşu artık kenarın hemen içinde daha güçlü görünüyor; kendi resmi gibi değil, renginin yumuşak bir ışığı olarak. Bu ışık daha sığ (yaklaşık yarı derinlikte) ve içeri doğru eşit biçimde sönüyor. Kenar da daha yakına bakıyor: komşunun görünmesi için daha yakın olması gerekiyor. Değerler `engine.ts` içindeki `MIRROR` sabitinde.',
        ),
      },
    ],
  },
  {
    version: '1.6.12',
    date: '2026-11-24',
    title: t('Buttons: hold one and pull.', 'Butonlar: basılı tut, çekiştir.'),
    changes: [
      {
        kind: 'improved',
        page: 'button',
        text: t(
          'A new `pull` prop on Button and GlassLayer. A pointer that holds the glass and drags away pulls it after itself: it follows a little way through a rubber band, stretches along the pull and thins across it, and swings back like gel when let go. Small glass (up to 72 px) follows from the point it was pressed at, larger glass once the pointer is past its edge. It is for buttons, and on by default on all of them: Button, Action Button and Button Group (`pull={false}` on Button or GlassLayer keeps one in its place). No other glass is pulled. The engine does it; its numbers are `PULL` in `engine.ts`, and `on: false` there turns it off everywhere. The motion is that of Glass HQ\'s liquid-glass (MIT), ported onto the kit\'s engine.',
          'Button ve GlassLayer\'a yeni bir `pull` prop\'u geldi. Camı basılı tutup uzağa sürükleyen imleç onu peşinden çeker: cam bir lastik bantla biraz gelir, çekiş yönünde uzar, karşı yönde incelir; bırakınca jöle gibi yerine yaylanır. Küçük cam (72 px\'e kadar) basıldığı noktadan itibaren imleci izler, daha büyüğü imleç kenarını geçince. Butonlar içindir ve hepsinde varsayılan olarak açıktır: Button, Action Button ve Button Group (Button ya da GlassLayer üzerindeki `pull={false}` birini yerinde tutar). Başka hiçbir cam çekilmez. İşi motor yapar; sayıları `engine.ts` içindeki `PULL` sabitindedir, oradaki `on: false` hepsini kapatır. Hareket, Glass HQ\'nun liquid-glass kütüphanesindekinin (MIT) kit motoruna aktarılmış hâli.',
        ),
      },
    ],
  },
  {
    version: '1.6.11',
    date: '2026-11-24',
    title: t('Dropdown Menu: icons come back with the label, the list stays inside the glass.', 'Dropdown Menu: ikonlar yazıyla birlikte geri geliyor, liste camın içinde kalıyor.'),
    changes: [
      {
        kind: 'fixed',
        page: 'dropdown-menu',
        text: t(
          'With `over`, an icon on the control (the three dots of a Button Group, an icon beside a label) now comes back with the letters, out of the same blur and dark, instead of fading in on its own ahead of them.',
          '`over` ile kontroldeki ikon (Button Group\'un üç noktası, yazının yanındaki ikon) artık harflerle birlikte, aynı bulanıklıktan ve karanlıktan geri geliyor; onlardan önce kendi başına belirmiyor.',
        ),
      },
      {
        kind: 'fixed',
        page: 'dropdown-menu',
        text: t(
          'With `over`, the list no longer has its corners cut off while the surface is still round: it shrinks a little more until it fits inside the glass.',
          '`over` ile yüzey henüz yuvarlakken listenin köşeleri artık kesilmiyor: liste cama sığana dek biraz daha küçük kalıyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'dropdown-menu',
        text: t(
          'The light of the press that opens a surface spills past its edge as a much fainter glow, on every popup.',
          'Yüzeyi açan basışın ışığı, bütün açılır yüzeylerde kenarından çok daha hafif bir parıltıyla taşıyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'dropdown-menu',
        text: t(
          'With `over`, the content no longer leaves the surface empty and white while it goes back in: it shrinks with the glass and fades over 0.24 s, nearly to the end.',
          '`over` ile içerik, yüzey geri girerken onu artık boş ve beyaz bırakmıyor: camla birlikte küçülüyor ve 0,24 sn içinde, neredeyse sonuna kadar soluyor.',
        ),
      },
    ],
  },
  {
    version: '1.6.10',
    date: '2026-11-24',
    title: t('Action Button: a whole end after the merge.', 'Action Button: birleşmeden sonra uç tam.'),
    changes: [
      {
        kind: 'fixed',
        page: 'action-button',
        text: t(
          'With the pointer on the button, its end was cut off in a straight line for a few frames just after the droplet melted in: the swell that greets the merge pushed the droplet, not yet fully in, past the edge of the glass\'s canvas. The swell now waits until the two are one body, and the canvas makes room whenever the glass swells past it.',
          'İmleç butonun üstündeyken, damla gövdeye karıştıktan hemen sonra butonun ucu birkaç kare boyunca düz bir çizgiyle kesiliyordu: birleşmeyi karşılayan şişme, henüz tam erimemiş damlayı camın tuvalinin kenarından dışarı itiyordu. Şişme artık ikisi tek gövde olana dek bekliyor, tuval de cam ne zaman dışına taşsa ona yer açıyor.',
        ),
      },
    ],
  },
  {
    version: '1.6.9',
    date: '2026-11-24',
    title: t('Action Button: it answers when the action lands.', 'Action Button: eylem bitince karşılık veriyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'action-button',
        text: t(
          'The moment the action succeeds, the glass swells as it does under a hover and a press together. It stays swollen until the new label and the check are in, waits a moment, then settles. The label and the check stretch with it as it swells, a little more in height than in width, and are even again while it waits. GlassLayer has a new `pulse` prop for it: change its value and the glass answers once (`pulseHold` sets how long it stays swollen), and content with `scale: var(--glass-bend, 1)` follows it.',
          'Eylem başarıyla bittiği anda cam, üstüne gelinip basılmış gibi şişiyor. Yeni etiket ve onay işareti yerine gelene dek şişik kalıyor, bir an bekliyor, sonra yerine oturuyor. Etiket ve onay işareti de şişerken onunla birlikte esniyor (boyuna, enine olduğundan biraz daha fazla), cam beklerken yeniden düz duruyor. GlassLayer\'a bunun için yeni bir `pulse` prop\'u geldi: değeri değişince cam bir kez karşılık verir (`pulseHold` ne kadar şişik kalacağını belirler), `scale: var(--glass-bend, 1)` verilen içerik de onu izler.',
        ),
      },
      {
        kind: 'improved',
        page: 'action-button',
        text: t(
          'The glass also swells once, as it does under the pointer, when the droplet melts in and when it splits off again.',
          'Cam, damla gövdeye karışırken ve yeniden ayrılırken de imlecin altındaki gibi bir kez şişiyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'action-button',
        text: t(
          'Merged, the spinner and the check sit by the label as an icon in a button does: close after the text, with a little less room on their side than on the label\'s (20 px to 24 px on the large size). The merged button is narrower for it.',
          'Birleşik hâlde döner simge ve onay işareti, bir butondaki ikon gibi etiketin yanında duruyor: yazının hemen ardında, kendi taraflarında etiket tarafındakinden biraz daha az boşlukla (büyük boyda 24 px\'e karşı 20 px). Birleşik buton da bu kadar daralıyor.',
        ),
      },
      {
        kind: 'fixed',
        page: 'action-button',
        text: t(
          'As the droplet melts in, the button\'s end no longer grows taller than the rest for a moment and shrinks back: the bridge now only fills the dip between the droplet and the body.',
          'Damla gövdeye karışırken butonun ucu artık bir anlığına gövdeden uzun olup geri küçülmüyor: köprü yalnızca damla ile gövde arasındaki çukuru dolduruyor.',
        ),
      },
      {
        kind: 'fixed',
        page: 'action-button',
        text: t(
          'The blur of a label changing letter by letter is no longer cut off in a box around the text: it has room on every side and fades out softly.',
          'Harf harf değişen etiketin bulanıklığı artık yazının çevresinde bir kutu gibi kesilmiyor: her yanında yer var ve yumuşakça sönüyor.',
        ),
      },
    ],
  },
  {
    version: '1.6.8',
    date: '2026-11-23',
    title: t('Popover and Dropdown Menu: a softer close.', 'Popover ve Dropdown Menu: daha yumuşak kapanış.'),
    changes: [
      {
        kind: 'improved',
        page: 'action-button',
        text: t(
          'The label now changes letter by letter as the state changes, each letter coming out of a blur and the dark. A label that is not plain text rises in as one piece, as before.',
          'Durum değişirken etiket artık harf harf değişiyor; her harf bulanıklıktan ve karanlıktan çıkıyor. Düz metin olmayan etiketler eskisi gibi tek parça yükseliyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'popover',
        text: t(
          'Closing is no longer the opening played backwards. The content fades first, then the surface slides back into the button and slows as it lands, with no throw and no flash at the end, and the button\'s label comes back letter by letter. A press on a Close part now lights the surface where it lands, and the light goes into the button with it.',
          'Kapanış artık açılışın tersine oynatılması değil. Önce içerik soluyor, ardından yüzey butona geri girip yaklaşırken yavaşlıyor; sonda savrulma ve parlama yok, butonun yazısı da harf harf geri geliyor. Bir Close parçasına basmak artık yüzeyi basılan yerden aydınlatıyor ve ışık yüzeyle birlikte butona giriyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'popover',
        text: t(
          'The popover now opens around its button and comes up into place from below. `over="edge"` on `GlassPopoverContent` brings back the opening from the button\'s edge, and the new `from` prop on `GlassPopover` picks the way: `from="top"` brings back the drop from above.',
          'Popover artık butonunun çevresine açılıyor ve yerine aşağıdan çıkıyor. `GlassPopoverContent` üzerinde `over="edge"` butonun kenarından açılışı geri getirir; `GlassPopover` üzerindeki yeni `from` prop\'u da yönü seçiyor: `from="top"` yukarıdan inişi geri getirir.',
        ),
      },
      {
        kind: 'improved',
        page: 'dropdown-menu',
        text: t(
          'With `over="center"`, the menu closes the same softer way and the button\'s label comes back letter by letter. `over="edge"` is new: the menu grows from the button\'s own edge. The new `from` prop picks whether it comes down from above (the default) or up from below.',
          '`over="center"` ile menü de aynı yumuşak hareketle kapanıyor ve butonun yazısı harf harf geri geliyor. `over="edge"` yeni: menü butonun kendi kenarından büyür. Yeni `from` prop\'u yukarıdan mı (varsayılan) aşağıdan mı geleceğini seçiyor.',
        ),
      },
      {
        kind: 'fixed',
        page: 'dropdown-menu',
        text: t(
          'The soft close now ends still: once the surface is back in, the button no longer swells and settles for a moment. It showed most on a small button, such as the three dots of a Button Group. Popover closes the same way.',
          'Yumuşak kapanış artık durarak bitiyor: yüzey geri girdikten sonra buton bir anlığına şişip inmiyor. En çok küçük butonda görünüyordu, örneğin bir Button Group\'un üç noktasında. Popover da aynı şekilde kapanıyor.',
        ),
      },
      {
        kind: 'removed',
        text: t(
          'The stage that stood in for the Examples sections on the component pages is gone, heading included. The pages now show only what is there.',
          'Bileşen sayfalarında Örnekler bölümlerinin yerinde duran alan, başlığıyla birlikte kaldırıldı. Sayfalar artık yalnızca var olanı gösteriyor.',
        ),
      },
    ],
  },
  {
    version: '1.6.7',
    date: '2026-11-23',
    title: t('Action Button: no twitch after the merge.', 'Action Button: birleşmeden sonra seğirme yok.'),
    changes: [
      {
        kind: 'fixed',
        page: 'action-button',
        text: t(
          'With the pointer still on the button, its end no longer jumps out and back for a moment just after the droplet has melted in.',
          'İmleç butonun üstündeyken, damla gövdeye karıştıktan hemen sonra butonun ucu artık bir anlığına dışarı çıkıp geri dönmüyor.',
        ),
      },
    ],
  },
  {
    version: '1.6.6',
    date: '2026-11-23',
    title: t('A brand page.', 'Marka sayfası.'),
    changes: [
      {
        kind: 'new',
        text: t(
          'The new Brand page (linked in the footer) holds the logo and its symbol as SVG and PNG, the clear space and smallest sizes, the logo on the site\'s colours, the palette, the type and what not to do with the logo.',
          'Yeni Marka sayfası (alt bilgide) logoyu ve sembolünü SVG ve PNG olarak, güvenli alanı ve en küçük boyutları, logonun sitenin renkleri üstündeki hâlini, paleti, yazı tiplerini ve logoyla yapılmaması gerekenleri bir arada sunuyor.',
        ),
      },
    ],
  },
  {
    version: '1.6.5',
    date: '2026-11-23',
    title: t('The site moved to onemorethink.dev.', 'Site onemorethink.dev adresine taşındı.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'Docs, install commands, the registry and the llms files now use onemorethink.dev. The old address redirects to the same page.',
          'Dokümanlar, kurulum komutları, registry ve llms dosyaları artık onemorethink.dev adresini kullanıyor. Eski adres aynı sayfaya yönlendiriyor.',
        ),
      },
    ],
  },
  {
    version: '1.6.4',
    date: '2026-11-23',
    title: t('A new logo.', 'Yeni logo.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'The header, the phone menu and the footer now carry the new logo in place of the written name, and the browser tab shows its hand.',
          'Üst bilgi, telefon menüsü ve alt bilgi artık yazılı ad yerine yeni logoyu taşıyor, tarayıcı sekmesinde de logonun eli görünüyor.',
        ),
      },
    ],
  },
  {
    version: '1.6.3',
    date: '2026-11-23',
    title: t('Dropdown Menu: it can open around its button.', 'Dropdown Menu: butonunun çevresinde açılabiliyor.'),
    changes: [
      {
        kind: 'new',
        page: 'dropdown-menu',
        text: t(
          'With `over="center"`, the button or Button Group unfolds into the menu and the menu settles around it, the way Popover opens. The examples now use it. Without the prop, the opening has not changed.',
          '`over="center"` ile buton ya da Button Group menüye dönüşüyor ve menü, Popover\'ın açıldığı gibi çevresine oturuyor. Örnekler artık bunu kullanıyor. Bu prop verilmezse açılış değişmiyor.',
        ),
      },
    ],
  },
  {
    version: '1.6.2',
    date: '2026-11-23',
    title: t('Popover: the content and the glass move as one.', 'Popover: içerik ve cam tek parça hareket ediyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'popover',
        text: t(
          'The content now follows the width and the height of the glass, so it takes the glass\'s swing instead of resting inside it while it still moves. It fades up gradually as it comes into focus, and closing is quicker.',
          'İçerik artık camın genişliğini ve yüksekliğini izliyor; cam hâlâ hareket ederken içinde durmak yerine onun salınımına katılıyor. Netleşirken kademeli olarak beliriyor ve kapanış daha hızlı.',
        ),
      },
    ],
  },
  {
    version: '1.6.1',
    date: '2026-11-23',
    title: t('Select and Dropdown Menu: no square behind the control as it opens.', 'Select ve Dropdown Menu: açılırken kontrolün arkasında kare çıkmıyor.'),
    changes: [
      {
        kind: 'fixed',
        page: 'select',
        text: t(
          'Opening a Select no longer shows a faint square around its control. While the list swells out, the control\'s glass and the list\'s are two canvases that meet along the control\'s box; they overlapped by a pixel, and by more while the control was still swollen from the hover, so the shadow there was drawn twice. They now meet on one line and draw in the same space.',
          'Select açılırken kontrolün çevresinde artık silik bir kare görünmüyor. Liste şişerken kontrolün camı ile listenin camı, kontrolün kutusu boyunca birleşen iki ayrı canvas; bunlar bir piksel, kontrol hover\'dan hâlâ şişkinken daha da fazla üst üste biniyordu ve oradaki gölge iki kez çiziliyordu. Artık tek bir çizgide birleşiyor ve aynı uzayda çiziliyorlar.',
        ),
      },
      {
        kind: 'fixed',
        page: 'dropdown-menu',
        text: t(
          'The same square is gone from Dropdown Menu, and from a Button Group that opens one.',
          'Aynı kare Dropdown Menu\'den ve menü açan Button Group\'tan da kalktı.',
        ),
      },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-11-23',
    title: t('Popover.', 'Popover.'),
    changes: [
      {
        kind: 'new',
        page: 'popover',
        text: t(
          'Popover: a small surface its button unfolds into, right where the button is. It grows from the button\'s edge, thrown a little way by its own weight, and settles with the content coming into focus inside. The button, the card and the light are Select\'s. Positioning, focus, Escape and ARIA come from UI SDK.',
          'Popover: butonun bulunduğu yerde yayılarak dönüştüğü küçük yüzey. Butonun kenarından büyür, kendi ağırlığıyla hafifçe savrulur ve yerine oturur, içerik içeride netleşir. Buton, kart ve ışık Select\'inkidir. Konumlandırma, odak, Escape ve ARIA UI SDK\'dan gelir.',
        ),
      },
      {
        kind: 'improved',
        page: 'popover',
        text: t(
          '`GlassPopup` has a second way out: `useGlassPopup({ opening: \'morph\' })` turns any control into the surface it opens, for a menu of your own. Popover is built on it; Select and Dropdown Menu keep their stretch.',
          '`GlassPopup`\'a ikinci bir açılış geldi: `useGlassPopup({ opening: \'morph\' })`, kendi menün için herhangi bir kontrolü açtığı yüzeye dönüştürür. Popover bunun üstüne kurulu; Select ve Dropdown Menu esnemelerini korur.',
        ),
      },
      {
        kind: 'improved',
        page: 'popover',
        text: t(
          'Popover answers its own closing: as the surface comes back in, the button swells, lights up and is thrown the other way before it settles. The light reaches the label and the content too.',
          'Popover kendi kapanışına tepki veriyor: yüzey geri girerken buton şişiyor, parlıyor ve yerine oturmadan önce ters yöne savruluyor. Işık etiketi ve içeriği de etkiliyor.',
        ),
      },
    ],
  },
  {
    version: '1.5.12',
    date: '2026-11-23',
    title: t('Action Button: start over without a jump.', 'Action Button: baştan başlarken sıçramıyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'action-button',
        text: t(
          'A new `resetKey` prop returns the button to idle whenever its value changes: the droplet splits off again and the label morphs back, from a success or in the middle of an action (whose result is then dropped). "Start over" in the preview uses it; it used to rebuild the button, which snapped back to its first shape.',
          'Yeni `resetKey` prop\'u, değeri her değiştiğinde butonu boşta durumuna döndürüyor: damla yeniden ayrılıyor, etiket eski hâline dönüşüyor; başarıdan sonra da, eylemin ortasında da (o eylemin sonucu artık butona yansımıyor). Önizlemedeki "Start over" bunu kullanıyor; eskiden butonu baştan kuruyordu ve buton ilk biçimine birden atlıyordu.',
        ),
      },
    ],
  },
  {
    version: '1.5.11',
    date: '2026-11-23',
    title: t('Slide to Confirm: the check waits for the track, and the thumb greets it.', 'Slide to Confirm: tik rayı bekliyor, topuz da onu karşılıyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'slide-to-confirm',
        text: t(
          'A success now shows only once the track has drawn in around the thumb, however soon `onConfirm` settles: the glass takes its colour and the icon turns into the check then, not while the track is still moving. As the check appears the thumb swells and settles, on the same springs a button swells with under the pointer. On a bare track (`fill={false}`) the landed thumb keeps its clear-glass icon colour until the lens is half frosted over, so the icon never sits dark on dark glass.',
          'Başarı artık `onConfirm` ne kadar çabuk sonuçlanırsa sonuçlansın, ray topuzun çevresine oturduktan sonra görünüyor: cam rengini o zaman alıyor, ikon da o zaman tike dönüşüyor; ray hâlâ hareket ederken değil. Tik belirirken topuz, bir butonun imleç altında şiştiği yaylarla büyüyüp yerine oturuyor. Dolgusuz rayda (`fill={false}`) sona oturan topuz, mercek yarı buzlanana dek berrak camdaki ikon rengini koruyor; ikon böylece koyu camda koyu kalmıyor.',
        ),
      },
    ],
  },
  {
    version: '1.5.10',
    date: '2026-11-23',
    title: t('Slide to Confirm is introduced by the alarm.', 'Slide to Confirm artık alarmla tanıtılıyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'slide-to-confirm',
        text: t(
          'The alarm (your own clock, a Snooze button and a bare slide whose thumb mirrors it) is now the preview at the top of the page and the component\'s tile on the home page. The short "Send" track with its fill and pending action moves to the Examples.',
          'Alarm (kendi saatin, bir Snooze butonu ve topuzu onu yansıtan dolgusuz bir ray) artık sayfanın başındaki önizleme ve bileşenin ana sayfadaki kutusu. Dolgulu ve beklemeli kısa "Send" rayı Örnekler\'e taşındı.',
        ),
      },
      {
        kind: 'fixed',
        page: 'slide-to-confirm',
        text: t(
          'The thumb\'s shadow is no longer cut off at the sides: the glass now has room for all of it, at every size. And after a theme switch the thumb re-reads its colours, so a held thumb no longer shows the old theme\'s page through it.',
          'Topuzun gölgesi artık yanlardan kesilmiyor: cam, her boyutta gölgenin tamamına yer bırakıyor. Tema değiştikten sonra topuz renklerini yeniden okuyor; tutulan topuzun içinden artık eski temanın zemini görünmüyor.',
        ),
      },
      {
        kind: 'removed',
        text: t('The version pill beside the wordmark in the header. The version still sits in the footer and on the changelog.', 'Üst bilgide logonun yanındaki sürüm rozeti. Sürüm, alt bilgide ve sürüm notlarında durmaya devam ediyor.'),
      },
    ],
  },
  {
    version: '1.5.9',
    date: '2026-11-23',
    title: t('Slide to Confirm: the mirror is yours to turn on, and the track can go bare.', 'Slide to Confirm: ayna artık isteğe bağlı, ray da dolgusuz olabiliyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'slide-to-confirm',
        text: t(
          'The thumb\'s rim no longer mirrors the page around the track unless you ask: the new `mirror` prop turns it on, and a colourful neighbour then lights the rim that faces it while the thumb is held, with the icon inside glowing. `fill={false}` leaves the track bare, with no fill behind the thumb. A new example shows both: an alarm with your own clock, a plain orange Snooze button and a bare slide whose thumb mirrors it.',
          'Topuzun kenarı artık sen istemedikçe rayın çevresindeki sayfayı yansıtmıyor: yeni `mirror` prop\'u bunu açar; topuz tutulurken renkli bir komşu kendisine bakan kenarı aydınlatır, içindeki ikon da ışıldar. `fill={false}` rayı dolgusuz bırakır; topuzun arkasında dolgu olmaz. Yeni bir örnek ikisini birlikte gösteriyor: kendi saatini gösteren bir alarm, düz turuncu bir Snooze butonu ve topuzu onu yansıtan dolgusuz bir ray.',
        ),
      },
      {
        kind: 'fixed',
        page: 'slide-to-confirm',
        text: t(
          'When `onConfirm` settles at once, the icon no longer disappears and comes back before the check. The success now starts as the thumb lands, and a custom `icon` swaps straight to the check: it shrinks, blurs and fades while the check comes in the same way reversed.',
          '`onConfirm` hemen sonuçlandığında ikon artık tikten önce kaybolup geri gelmiyor. Başarı topuz sona oturur oturmaz başlıyor ve özel bir `icon` doğrudan tike dönüşüyor: küçülüp bulanıklaşarak sönerken tik aynı yolla, tersinden geliyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'slide-to-confirm',
        text: t(
          'The Examples section is back on this page, with the alarm as its one example; the full-width payment and the coloured fills are gone.',
          'Örnekler bölümü bu sayfada geri geldi; tek örneği alarm. Tam genişlikte ödeme ve renkli dolgu örnekleri kaldırıldı.',
        ),
      },
    ],
  },
  {
    version: '1.5.8',
    date: '2026-11-23',
    title: t('A clear badge mirrors what is around it.', 'Şeffaf rozet çevresini yansıtır.'),
    changes: [
      {
        kind: 'improved',
        page: 'badge',
        text: t(
          'A clear badge (`tint` at 0.6 or below) now mirrors its surroundings on its rim, as clear buttons do; a badge in its own colour looks the same as before. The first example is now a plain outlined card with one orange badge on its corner.',
          'Şeffaf rozet (`tint` 0.6 ya da altı) artık şeffaf butonlar gibi çevresini kenarında yansıtıyor; kendi renginde bir rozet eskisi gibi görünür. İlk örnek artık köşesinde tek bir turuncu rozet olan sade çerçeveli bir kart.',
        ),
      },
    ],
  },
  {
    version: '1.5.7',
    date: '2026-11-23',
    title: t('Clear glass mirrors what is around it.', 'Şeffaf cam çevresini yansıtır.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'The rim of clear glass now mirrors its surroundings. A neighbour of another colour than the surface the glass sits on shows on the rim that faces it: an orange button above a clear control lights its top edge orange, as a soft crescent that is deepest where the neighbour is nearest and thins out round the sides. Tinted glass, and a lens frosted over at rest (the Tabs lens, the Slide to Confirm thumb), mirror nothing until they turn clear. For this the engine takes a small picture of the page around each clear glass, and only when the glass is measured again: nothing extra runs at rest, on scroll or while the cursor moves. `optics.mirror` scales the reflection; 0 turns it off.',
          'Şeffaf camın kenarı artık çevresini yansıtıyor. Camın oturduğu yüzeyden farklı renkte bir komşu, kendisine bakan kenarda görünür: şeffaf bir kontrolün üstündeki turuncu buton, kontrolün üst kenarını turuncu aydınlatır; komşunun en yakın olduğu yerde en derin, yanlara doğru incelen yumuşak bir hilal olarak. Renkli cam ve dururken buzlu olan mercekler (Tabs merceği, Slide to Confirm topuzu) şeffaflaşana dek hiçbir şey yansıtmaz. Motor bunun için her şeffaf camın çevresindeki sayfanın küçük bir resmini çeker, o da yalnız cam yeniden ölçüldüğünde: dururken, kaydırırken ya da imleç gezerken fazladan hiçbir şey çalışmaz. `optics.mirror` yansımayı ölçekler; 0 kapatır.',
        ),
      },
      {
        kind: 'improved',
        page: 'button-group',
        text: t(
          'In the first example Snooze stands apart, in clear glass: it bends the grid behind it, and its rim mirrors the white glass on either side.',
          'İlk örnekte Snooze ayrı duruyor ve şeffaf camdan: arkasındaki ızgarayı büküyor, kenarı da iki yanındaki beyaz camı yansıtıyor.',
        ),
      },
      {
        kind: 'fixed',
        text: t(
          'The blue edge every glass carried on its far side is gone. It was a fixed colour that came from nowhere on the page, and it stood out most on a dark one. That side of the rim light is now plain white; on clear glass it takes the colour of what is around the glass.',
          'Her camın uzak tarafında taşıdığı mavi kenar kalktı. Sayfadaki hiçbir şeyden gelmeyen sabit bir renkti ve en çok koyu sayfada göze batıyordu. Kenar ışığının o tarafı artık düz beyaz; şeffaf camda rengini camın çevresinden alıyor.',
        ),
      },
    ],
  },
  {
    version: '1.5.6',
    date: '2026-11-23',
    title: t('One frame loop, however often a list opens.', 'Liste kaç kez açılırsa açılsın, tek kare döngüsü.'),
    changes: [
      {
        kind: 'fixed',
        text: t(
          'Opening and closing a Select, a Dropdown Menu or the menu on a Button Group no longer slows the page down. Each time a list went back into its control, the engine started a second frame loop beside the one already running. On a page where some glass never rests (a Badge), those loops never ended, so every open and close made each frame do more work: interactions grew slower and the fans louder. The engine now keeps to one loop, whatever wakes it.',
          'Select, Dropdown Menu ya da Button Group üzerindeki menüyü açıp kapatmak artık sayfayı yavaşlatmıyor. Liste kontrolüne her geri döndüğünde motor, çalışan döngünün yanında ikinci bir kare döngüsü başlatıyordu. Camın hiç durmadığı bir sayfada (bir Badge) bu döngüler hiç bitmiyor, her açıp kapatma her karenin işini artırıyordu: etkileşimler yavaşlıyor, fanlar hızlanıyordu. Motor artık onu ne uyandırırsa uyandırsın tek döngüde kalıyor.',
        ),
      },
    ],
  },
  {
    version: '1.5.5',
    date: '2026-11-23',
    title: t('One card on a phone.', 'Telefonda tek kart.'),
    changes: [
      {
        kind: 'fixed',
        page: 'card',
        text: t(
          'The first example shows one card where two do not fit side by side, centred on the two rows of colour. On a phone the cards used to stack, and the rows ran through the gap between them.',
          'İlk örnek, iki kartın yan yana sığmadığı yerde tek kart gösteriyor; kart iki renk şeridinin ortasında duruyor. Telefonda kartlar eskiden alt alta diziliyor, şeritler aralarındaki boşluktan geçiyordu.',
        ),
      },
    ],
  },
  {
    version: '1.5.4',
    date: '2026-11-23',
    title: t('A choice lights its own spot.', 'Seçim, kendi yerini aydınlatıyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'select',
        text: t(
          'Choosing an option lights the glass around that option only, and the light leaves with the list: a list on its way back into the button is no longer lit whole. Pressing the button to close the list lights the button alone. Dropdown Menu gets the same.',
          'Bir seçenek seçmek artık yalnızca o seçeneğin çevresindeki camı aydınlatıyor; ışık listeyle birlikte gidiyor: butona geri dönen liste artık baştan sona parlamıyor. Listeyi kapatmak için butona basmak yalnızca butonu aydınlatıyor. Dropdown Menu da aynısını alıyor.',
        ),
      },
    ],
  },
  {
    version: '1.5.3',
    date: '2026-11-23',
    title: t('A press lets light into the glass.', 'Basış, cama ışık salıyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'select',
        text: t(
          'Pressing the button lets light into the glass where the press lands. The light paints nothing: it brightens the glass\'s own colour; it lights the glass around that spot evenly, the near end of the list included, stays inside the button but spills a little past the edge of the open list, spreads and fades. Opened from the keyboard, it starts at the button\'s centre. The press that opens the list carries its light into it: the light grows with the list until it covers it whole, then fades. Presses that land before the last light has faded add up, so it grows brighter the more you press. Choosing an option lights the list where it lands, more softly. Dropdown Menu does the same. The list is now one surface from start to finish: it leaves the button already wearing the card\'s glass and the card\'s shadow, instead of the button\'s glass turning into a card once the neck lets go.',
          'Butona basmak, basılan noktadan camın içine ışık salıyor. Işık üstüne bir şey boyamıyor: camın kendi rengini parlatıyor; ışık o noktanın çevresindeki camı, listenin yakın ucu dahil, eşit aydınlatıyor, butonun dışına taşmıyor ama açık listenin kenarından biraz dışarı yansıyor, yayılıp sönüyor. Klavyeyle açılınca butonun ortasından başlıyor. Listeyi açan basışın ışığı listeyle birlikte büyüyor: bütün listeyi kaplayıp sönüyor. Önceki ışık sönmeden gelen basışlar üst üste biniyor; bastıkça daha çok parlıyor. Bir seçenek seçmek, listeyi basılan yerde daha sönük aydınlatıyor. Dropdown Menu da aynısını yapıyor. Liste artık baştan sona tek bir yüzey: butondan, kartın camını ve kartın gölgesini taşıyarak çıkıyor; eskiden butonun camı, boyun koptuktan sonra karta dönüşüyordu.',
        ),
      },
      {
        kind: 'improved',
        page: 'select',
        text: t(
          'The list closes faster, and the bridge between the button and the list is thinner. Dropdown Menu gets the same.',
          'Liste daha hızlı kapanıyor; butonla liste arasındaki köprü daha ince. Dropdown Menu da aynısını alıyor.',
        ),
      },
    ],
  },
  {
    version: '1.5.2',
    date: '2026-11-22',
    title: t('Lighter on every frame.', 'Her karede daha hafif.'),
    changes: [
      {
        kind: 'fixed',
        page: 'select',
        text: t(
          'Opening no longer stutters. The page behind the glass is uploaded once per opening instead of on every frame, the popup measures the page once per frame instead of after each of its own style writes, and it no longer reads its colours and sizes again while the list comes in. The drawing loop also stops once the motion has died out, where it used to run for seconds after. Closing is lighter too: it uploaded the page some twenty times as the button settled, and now does so once, when the motion ends. Dropdown Menu gets the same.',
          'Açılış artık takılmıyor. Camın arkasındaki sayfa her karede değil, açılış başına bir kez yükleniyor; açılır yüzey sayfayı kendi her stil yazısından sonra değil, kare başına bir kez ölçüyor; liste gelirken renklerini ve ölçülerini baştan okumuyor. Çizim döngüsü de hareket bitince duruyor; eskiden saniyelerce sürüyordu. Kapanış da hafifledi: buton yerine otururken sayfayı yirmi kadar kez yüklüyordu, artık hareket bitince bir kez yüklüyor. Dropdown Menu da aynısını alıyor.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'Scrolling costs far less. A clear glass that scrolls with the page keeps its picture of what lies behind it instead of reading the page again on every frame; it reads it again when a sticky or fixed element reaches it. If a script moves what lies behind as the page scrolls (parallax), `live` on Card or GlassLayer keeps the glass in step.',
          'Kaydırma artık çok daha ucuz. Sayfayla birlikte kayan şeffaf cam, arkasındakinin resmini her karede baştan okumak yerine saklıyor; yapışkan ya da sabit bir öğe ona ulaşınca yeniden okuyor. Sayfa kayarken arkadakini bir betik oynatıyorsa (paralaks), Card ya da GlassLayer üzerindeki `live` camı onunla aynı adımda tutuyor.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'Less work per frame for every component, with the same picture: a frame that would come out exactly as the one on screen is not drawn, a cursor moving far from a glass no longer redraws it, pixels outside the glass leave the shader early, an empty front layer is no longer uploaded, a hover or a state change no longer uploads a picture that came out the same, and colours are resolved once.',
          'Her bileşen için kare başına daha az iş, görüntü aynı: ekrandakiyle birebir aynı çıkacak kare çizilmiyor, camdan uzakta gezen imleç onu yeniden çizdirmiyor, camın dışındaki pikseller gölgelendiriciden erken çıkıyor, boş ön katman artık yüklenmiyor, üstüne gelme ya da durum değişimi aynı çıkan resmi yeniden yüklemiyor, renkler bir kez çözülüyor.',
        ),
      },
      {
        kind: 'fixed',
        text: t(
          'Slider, Switch and Checkbox now rest. Their drawing loop used to run on every frame for as long as the page was open, and three.js\'s own frame loop with it; both now stop when nothing moves and start again on a press, a key, a theme change or a cursor that changes their light. A cursor moving far from a control no longer redraws it.',
          'Slider, Switch ve Checkbox artık dinleniyor. Çizim döngüleri sayfa açık kaldıkça her karede çalışıyordu, three.js\'in kendi kare döngüsü de onunla birlikte; ikisi de artık hiçbir şey kıpırdamadığında duruyor, bir basışta, bir tuşta, tema değişiminde ya da ışıklarını değiştiren bir imleçte yeniden başlıyor. Kontrolden uzakta gezen imleç onu yeniden çizdirmiyor.',
        ),
      },
    ],
  },
  {
    version: '1.5.1',
    date: '2026-11-22',
    title: t('Behaviour from UI SDK.', 'Davranış UI SDK\'dan.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'Button, Tabs, Slider, Switch and Checkbox now take their behaviour (keyboard, focus, forms, ARIA) from UI SDK, as Select and Dropdown Menu do. They look and move as before, but now need `@ui-sdk/core` and `@ui-sdk/react`; the install command adds them.',
          'Button, Tabs, Slider, Switch ve Checkbox artık davranışını (klavye, odak, formlar, ARIA) Select ve Dropdown Menu gibi UI SDK\'dan alıyor. Görünüm ve hareket aynı; ama artık `@ui-sdk/core` ve `@ui-sdk/react` paketlerine ihtiyaç duyuyorlar, kurulum komutu onları ekliyor.',
        ),
      },
      {
        kind: 'improved',
        page: 'button',
        text: t(
          'Return a Promise from `onClick` and the button stays pending until it settles: no second press, and screen readers are told.',
          '`onClick`\'ten bir Promise döndürürsen buton, o sonuçlanana kadar beklemede kalıyor: ikinci basış yok, ekran okuyuculara da bildiriliyor.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'Tabs, Slider, Switch and Checkbox take a `name` and submit with the form around them.',
          'Tabs, Slider, Switch ve Checkbox bir `name` alıyor ve çevrelerindeki formla birlikte gönderiliyor.',
        ),
      },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-11-22',
    title: t('Button Group and Dropdown Menu.', 'Button Group ve Dropdown Menu.'),
    changes: [
      {
        kind: 'improved',
        page: 'select',
        text: t(
          'The button now swells under the pointer and grows when pressed, as Button does. The neck thins more slowly before it snaps, and the snap no longer throws the button or the list out of place. The bridge no longer raises a ridge on the far edge of a small control, and small controls get a tighter bridge of their own. The label sways with the glass, and once the list is back inside, the button swells as if hovered and lets go.',
          'Buton artık Button gibi imleç altında şişiyor ve basınca büyüyor. Boyun kopmadan önce daha yavaş inceliyor; kopuş artık butonu ya da listeyi yerinden savurmuyor. Köprü artık küçük bir kontrolün uzak kenarında çıkıntı oluşturmuyor; küçük kontroller kendi dar köprüsünü alıyor. Etiket camla birlikte sallanıyor; liste içeri döndüğünde buton, üstüne gelinmiş gibi şişip bırakıyor.',
        ),
      },
      {
        kind: 'new',
        page: 'dropdown-menu',
        text: t(
          'Dropdown Menu: a list of actions that swells out of its button as one body of glass, with Select\'s stretch. Wrap a Button Group in it and the list pours out of the whole group, in its colour. Keyboard, focus and ARIA come from UI SDK.',
          'Dropdown Menu: Select\'in esnemesiyle, butonundan tek bir cam gövde olarak şişen eylem listesi. Bir Button Group\'u onunla sar; liste bütün grubun içinden, onun renginde dökülür. Klavye, odak ve ARIA UI SDK\'dan gelir.',
        ),
      },
      {
        kind: 'new',
        page: 'button-group',
        text: t(
          'Button Group: related actions share one body of glass, side by side or stacked, with separators and text; nest groups to set some apart. It wears Button\'s glass, tinted white unless you colour it, in three sizes.',
          'Button Group: ilişkili eylemler tek bir cam gövdeyi paylaşır; yan yana ya da üst üste, ayraç ve metinle; bazılarını ayırmak için grupları iç içe koy. Button\'ın camını taşır; sen boyamadıkça beyaz renkli camdır, üç boyutta.',
        ),
      },
      {
        kind: 'fixed',
        text: t(
          'Less work per frame. Moving the mouse no longer re-uploads every visible glass\'s textures on each frame: only the light is shaded again. A `live` Card reads the page behind it about 60 times a second instead of on every frame of a 120 Hz display, and skips the upload when the picture is the same. The look is unchanged.',
          'Kare başına daha az iş. Fareyi oynatmak artık görünen her camın dokularını her karede yeniden yüklemiyor: yalnızca ışık yeniden hesaplanıyor. `live` bir Card arkasındaki sayfayı 120 Hz bir ekranın her karesinde değil, saniyede yaklaşık 60 kez okuyor ve görüntü aynıysa yüklemeyi atlıyor. Görünüm değişmedi.',
        ),
      },
    ],
  },
  {
    version: '1.4.2',
    date: '2026-11-22',
    title: t('Slide to Confirm gets a short, chunky size.', 'Slide to Confirm\'e kısa ve şişko bir boyut geldi.'),
    changes: [
      {
        kind: 'improved',
        page: 'slide-to-confirm',
        text: t(
          'New `xl` size: a 96 px track with an 88 px thumb, made for narrow widths.',
          'Yeni `xl` boyutu: dar genişlikler için 96 px ray ve 88 px topuz.',
        ),
      },
    ],
  },
  {
    version: '1.4.1',
    date: '2026-11-22',
    title: t('Select wears Button and Card glass.', 'Select, Button ve Card camını giydi.'),
    changes: [
      {
        kind: 'improved',
        page: 'select',
        text: t(
          'The button now has Button\'s glass. The open list has Card\'s frost with no light of its own, a thin line at the edge and a soft shadow beneath. The stretch between them stays. GlassPopup gets the same look.',
          'Buton artık Button\'ın camını taşıyor. Açık listede Card\'ın buzlu camı var; kendi ışığı yok, kenarda ince bir çizgi, altında yumuşak bir gölge var. Aralarındaki esneme korunuyor. GlassPopup da aynı görünümü aldı.',
        ),
      },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-11-22',
    title: t('Select: a list that stretches out of its button.', 'Select: butonundan esneyerek çıkan liste.'),
    changes: [
      {
        kind: 'new',
        page: 'select',
        text: t(
          'Select: the list swells out of the whole button as one body of glass, a neck stretches between them and snaps, and closing plays the same motion backwards. Keyboard, focus and ARIA come from UI SDK.',
          'Select: liste butonun tamamından tek bir cam gövde olarak şişer, aralarında bir boyun esneyip kopar ve kapanış aynı hareketi tersine oynatır. Klavye, odak ve ARIA UI SDK\'dan gelir.',
        ),
      },
      {
        kind: 'new',
        page: 'select',
        text: t(
          'GlassPopup, the building block behind it: put the same stretch on your own menu or popover.',
          'Arkasındaki yapı taşı GlassPopup: aynı esnemeyi kendi menüne ya da popover\'ına koy.',
        ),
      },
    ],
  },
  {
    version: '1.3.12',
    date: '2026-11-22',
    title: t('Examples are held back.', 'Örnekler şimdilik kaldırıldı.'),
    changes: [
      {
        kind: 'removed',
        text: t(
          'The Examples sections on the component pages are held back for now; a quiet stage with a fine grid stands in their place.',
          'Bileşen sayfalarındaki Örnekler bölümleri şimdilik kaldırıldı; yerlerinde ince bir ızgaralı sade bir alan duruyor.',
        ),
      },
    ],
  },
  {
    version: '1.3.11',
    date: '2026-11-22',
    title: t('The wordmark reads LiquidGlass Interfaces.', 'Logo artık LiquidGlass Interfaces yazıyor.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'The header and footer wordmark gains "Interfaces", set light like "Liquid".',
          'Üst ve alt bilgideki logoya "Liquid" gibi ince yazılmış "Interfaces" eklendi.',
        ),
      },
    ],
  },
  {
    version: '1.3.10',
    date: '2026-11-19',
    title: t('Dark text on a light badge.', 'Açık renkli rozette koyu yazı.'),
    changes: [
      {
        kind: 'fixed',
        page: 'badge',
        text: t(
          'A `text-*` class on the badge now always wins over its built-in white. Dark text on a light badge stayed white before: the Live badge in the examples was white on white.',
          'Rozete verilen `text-*` sınıfı artık yerleşik beyazı her zaman ezer. Açık renkli rozette koyu yazı önceden beyaz kalıyordu: örneklerdeki Live rozeti beyaz üstüne beyazdı.',
        ),
      },
    ],
  },
  {
    version: '1.3.9',
    date: '2026-11-19',
    title: t('Shorter URLs, without the glass- prefix.', 'glass- öneki olmadan, daha kısa URL\'ler.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'Component pages and registry items lose the `glass-` prefix: `/docs/button`, `/r/button.json`. The old addresses redirect.',
          'Bileşen sayfaları ve registry öğeleri `glass-` önekini bıraktı: `/docs/button`, `/r/button.json`. Eski adresler yönlendirilir.',
        ),
      },
      {
        kind: 'improved',
        page: 'tabs',
        text: t('The icons example uses the plain lens, with no colour of its own.', 'İkonlu örnek artık kendi rengi olmayan sade merceği kullanıyor.'),
      },
    ],
  },
  {
    version: '1.3.8',
    date: '2026-11-19',
    title: t('Your colour on Slider, Switch and Checkbox.', 'Slider, Switch ve Checkbox\'ta kendi rengin.'),
    changes: [
      {
        kind: 'improved',
        page: 'slider',
        text: t('A `color` prop for the filled part of the track. The examples are now the slider in a few colours, nothing else.', 'Rayın dolu kısmı için `color` prop\'u. Örnekler artık yalnızca birkaç renkte kaydırıcı.'),
      },
      {
        kind: 'improved',
        page: 'switch',
        text: t('A `color` prop for the track while on. The examples are now the switch in a few colours, nothing else.', 'Açıkken rayın rengi için `color` prop\'u. Örnekler artık yalnızca birkaç renkte anahtar.'),
      },
      {
        kind: 'improved',
        page: 'checkbox',
        text: t('A `color` prop for the box while checked. The examples are now the checkbox in a few colours, nothing else.', 'İşaretliyken kutunun rengi için `color` prop\'u. Örnekler artık yalnızca birkaç renkte onay kutusu.'),
      },
    ],
  },
  {
    version: '1.3.7',
    date: '2026-11-19',
    title: t('Badges in more colours.', 'Daha çok renkte rozetler.'),
    changes: [
      {
        kind: 'improved',
        page: 'badge',
        text: t(
          'Three more examples: a palette of six colours, a rose sale badge on a product and an orange badge on a dock item.',
          'Üç örnek daha: altı renkli bir palet, bir ürünün üstünde gül rengi indirim rozeti ve bir dock öğesinin üstünde turuncu rozet.',
        ),
      },
    ],
  },
  {
    version: '1.3.6',
    date: '2026-11-19',
    title: t('Glass sees hairlines.', 'Cam ince çizgileri görür.'),
    changes: [
      {
        kind: 'fixed',
        text: t(
          'Clear glass now bends 1 px lines behind it (dividers, grid lines). They were left out of the picture, so the glass looked filled over a fine grid.',
          'Berrak cam artık arkasındaki 1 piksellik çizgileri (ayraçlar, ızgara çizgileri) de büker. Bunlar görüntüye girmiyordu; ince bir ızgaranın üstünde cam dolu görünüyordu.',
        ),
      },
      {
        kind: 'improved',
        page: 'button',
        text: t(
          'The Play example is fully clear (`tint={0}`): only the bent grid shows through.',
          'Play örneği tamamen şeffaf (`tint={0}`): içinden yalnızca bükülen ızgara görünür.',
        ),
      },
    ],
  },
  {
    version: '1.3.5',
    date: '2026-11-19',
    title: t('One light for every glass.', 'Bütün camlarda tek ışık.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'The rim light leans towards the cursor on Tabs, Badge, Slider, Switch and Checkbox too, as it does on Button. Card stays unlit.',
          'Kenar ışığı artık Tabs, Badge, Slider, Switch ve Checkbox\'ta da Button\'daki gibi imlece doğru yatar. Card ışıksız kalır.',
        ),
      },
    ],
  },
  {
    version: '1.3.4',
    date: '2026-11-19',
    title: t('Widgets made of Card.', 'Card\'dan yapılmış widget\'lar.'),
    changes: [
      {
        kind: 'improved',
        page: 'card',
        text: t(
          'A new example in place of the notification: an activity ring, a battery list and a now-playing card over a still wallpaper of plain CSS. It scales down to fit a phone.',
          'Bildirim örneğinin yerine yeni bir örnek: düz CSS\'ten durağan bir duvar kâğıdının üstünde bir hareket halkası, bir pil listesi ve çalan parça kartı. Telefona sığacak şekilde küçülür.',
        ),
      },
    ],
  },
  {
    version: '1.3.3',
    date: '2026-11-19',
    title: t('More examples, and news that only means new components.', 'Daha fazla örnek; yenilik artık yalnız yeni bileşen demek.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'No gradients in the examples any more. Backdrops are flat colour and plain DOM: discs under the scrim, ruled lines behind the square corners, a grid drawn cell by cell on the Button page, solid tiles and bands behind the badges, and a stepped edge blur on the Card rows.',
          'Örneklerde artık gradyan yok. Zeminler düz renk ve sade DOM: örtünün altında diskler, köşeli butonların arkasında yatay çizgiler, Button sayfasında hücre hücre çizilen ızgara, rozetlerin arkasında düz karolar ve bantlar, Card satırlarında kademeli kenar bulanıklığı.',
        ),
      },
      {
        kind: 'improved',
        page: 'badge',
        text: t(
          'Three examples: your own colours, clearer glass over a colourful backdrop (`tint`, `speed`, a wider badge), and a badge inline next to a label.',
          'Üç örnek: kendi renklerin, renkli bir zeminde daha berrak cam (`tint`, `speed`, daha geniş rozet) ve bir etiketin yanında satır içi rozet.',
        ),
      },
      {
        kind: 'improved',
        page: 'slider',
        text: t('Examples for the four sizes, a range of its own with `min`, `max` and `step`, icons, and clear glass at rest.', 'Dört boyut, `min`, `max` ve `step` ile kendi aralığı, ikonlar ve dururken berrak cam için örnekler.'),
      },
      {
        kind: 'improved',
        page: 'switch',
        text: t('Examples: a settings list with a disabled switch, the three sizes and the label on either side.', 'Örnekler: devre dışı bir anahtar içeren ayar listesi, üç boyut ve iki yandaki etiket.'),
      },
      {
        kind: 'improved',
        page: 'checkbox',
        text: t('Examples: a list of choices with descriptions, both shapes in three sizes and a disabled box.', 'Örnekler: açıklamalı bir seçim listesi, üç boyutta iki biçim ve devre dışı bir kutu.'),
      },
      {
        kind: 'improved',
        text: t(
          'Versions have two levels. A version (v1.3) is announced when it adds a component; the fixes and refinements after it are its patch releases (v1.3.1, v1.3.2…), folded under it in the changelog. The site shows the version, the New pill marks only the components of the latest one, and the Updated pill is gone.',
          'Sürümler artık iki katmanlı. Bir sürüm (v1.3) bileşen eklediğinde duyurulur; ardından gelen düzeltme ve iyileştirmeler onun alt sürümleridir (v1.3.1, v1.3.2…) ve sürüm notlarında onun altında katlanır. Site sürümü gösterir, Yeni etiketi yalnız son sürümün bileşenlerini işaretler, Güncellendi etiketi kalktı.',
        ),
      },
    ],
  },
  {
    version: '1.3.2',
    date: '2026-11-19',
    title: t('Numbers roll to their new value.', 'Rakamlar yeni değerine kayarak geçiyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'tabs',
        text: t(
          'In the Tabs examples the figure above the control rolls to its new value with NumberFlow instead of swapping. The examples now import `@number-flow/react`; the component itself still needs no package.',
          'Tabs örneklerinde kontrolün üstündeki rakam, yer değiştirmek yerine NumberFlow ile yeni değerine kayıyor. Örnekler artık `@number-flow/react` içe aktarıyor; bileşenin kendisi hâlâ paket istemiyor.',
        ),
      },
      {
        kind: 'improved',
        text: t('The counts in the changelog filters animate as the filters change.', 'Değişiklik günlüğü filtrelerindeki sayılar, filtre değiştikçe animasyonla güncelleniyor.'),
      },
    ],
  },
  {
    version: '1.3.1',
    date: '2026-11-19',
    title: t('Bigger, clearer examples.', 'Daha büyük, daha anlaşılır örnekler.'),
    changes: [
      {
        kind: 'improved',
        text: t(
          'The examples for Button, Action Button, Tabs, Badge, Slide to Confirm and Card show the component at a larger size in a scene of its own, with no boxed card around it. What sits behind the clear glass is plain CSS and text: no pictures, no SVG.',
          'Button, Action Button, Tabs, Badge, Slide to Confirm ve Card örnekleri bileşeni daha büyük ve kendi sahnesinde gösteriyor; etrafında kutu yok. Berrak camın arkasında yalnız düz CSS ve yazı var: görsel yok, SVG yok.',
        ),
      },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-11-19',
    title: t('Slider, Switch and Checkbox are back.', 'Slider, Switch ve Checkbox geri döndü.'),
    changes: [
      { kind: 'new', page: 'slider', text: t('The range slider of the first previews: a glass pill that opens into a wide lens while held.', 'İlk önizlemelerdeki aralık kaydırıcısı: basılı tutunca geniş bir merceğe açılan cam hap.') },
      { kind: 'new', page: 'switch', text: t('The switch of the first previews: its knob swells into clear glass as it crosses the track.', 'İlk önizlemelerdeki anahtar: topuzu rayı geçerken berrak cama şişer.') },
      { kind: 'new', page: 'checkbox', text: t('The checkbox of the first previews: always under a cap of clear glass.', 'İlk önizlemelerdeki onay kutusu: hep berrak bir cam kapağın altında.') },
    ],
  },
  {
    version: '1.2.2',
    date: '2026-11-19',
    title: t('A softer, deeper shadow under Card.', 'Card\'ın altında daha yumuşak, daha derin bir gölge.'),
    changes: [
      {
        kind: 'fixed',
        page: 'card',
        text: t(
          'Card\'s drop shadow is two soft layers (16.5 px and 26.4 px down, 8% black each), the same at every card size.',
          'Card\'ın gölgesi iki yumuşak katman (16.5 px ve 26.4 px aşağıda, her biri %8 siyah); her kart boyutunda aynı.',
        ),
      },
      {
        kind: 'improved',
        page: 'card',
        text: t(
          'In the example, the rows of colour blur progressively as they reach either end, and the shadow is no longer cut off.',
          'Örnekte renk sıraları iki uca yaklaştıkça kademeli olarak bulanıklaşıyor ve gölge artık kesilmiyor.',
        ),
      },
      {
        kind: 'improved',
        text: t('Page titles, landing headings and the wordmark are set in Cal Sans.', 'Sayfa başlıkları, ana sayfa başlıkları ve logo yazısı Cal Sans ile yazılıyor.'),
      },
      {
        kind: 'removed',
        text: t(
          'The number and verb tags ("01 · Press") on the component tiles, the docs pages and the header menu.',
          'Bileşen kutularındaki, doküman sayfalarındaki ve üst menüdeki numara ve fiil etiketleri ("01 · Bas").',
        ),
      },
    ],
  },
  {
    version: '1.2.1',
    date: '2026-11-19',
    title: t('Flat resting pill for Tabs.', 'Tabs için düz bir duran hap.'),
    changes: [
      {
        kind: 'fixed',
        page: 'tabs',
        text: t(
          'The resting pill has no shadow, like a plain shadcn tab; the examples are back to their first versions.',
          'Duran hapın gölgesi yok, sade bir shadcn sekmesi gibi; örnekler ilk hallerine döndü.',
        ),
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-11-19',
    title: t('Card brings back its radial rim.', 'Card radyal kenarına geri dönüyor.'),
    changes: [
      {
        kind: 'improved',
        page: 'card',
        text: t(
          'Card\'s glass is the first card\'s again: the rim pulls what is behind towards the centre, deep and wide, and a 5 px frost blurs the bent picture, under a 70% tint (white on a light page, black on a dark one) and a 1.3 px white line. It is drawn by the WebGL glass, so it now looks the same in Safari, Firefox and on phones. Your `tint`, `blur` and `optics` still override it.',
          'Card\'ın camı yeniden ilk kartınki: kenar arkada kalanı merkeze doğru, derin ve geniş çeker; 5 px buz bükülmüş görüntüyü bulanıklaştırır; üstünde %70 ton (açık sayfada beyaz, koyu sayfada siyah) ve 1.3 px beyaz bir çizgi var. WebGL camla çizildiği için artık Safari\'de, Firefox\'ta ve telefonlarda da aynı görünür. `tint`, `blur` ve `optics` hâlâ bunun üstüne yazar.',
        ),
      },
    ],
  },
  {
    version: '1.1.4',
    date: '2026-11-19',
    title: t('A glass thumb for Slide to Confirm.', 'Slide to Confirm için cam bir tutamaç.'),
    changes: [
      {
        kind: 'improved',
        page: 'slide-to-confirm',
        text: t(
          'The thumb is drawn by the same glass as Button in every state, not only while it moves: frosted white glass with the chevron at rest and with the spinner while pending, and glass in the fill\'s colour with the check once it succeeds. Without WebGL2 or with reduced motion it stays a flat white disc.',
          'Tutamaç artık yalnızca hareket ederken değil, her hâlde Button\'la aynı camla çiziliyor: beklerken okla, yüklenirken dönen simgeyle buzlu beyaz cam; başarınca tikle, dolgunun renginde cam. WebGL2 yoksa ya da hareket azaltılmışsa düz beyaz bir disk olarak kalır.',
        ),
      },
    ],
  },
  {
    version: '1.1.3',
    date: '2026-11-18',
    title: t('A new look for Card.', 'Card için yeni bir görünüm.'),
    changes: [
      {
        kind: 'improved',
        page: 'card',
        text: t(
          'Card has a new default glass: a lighter 3.5 px frost with more vivid colour, a 68% white tint on light pages and 79% black on dark ones, a hairline of white at the rim, and a tighter bend with a slight colour split. The face carries no light or shadow. Your `tint`, `blur` and `optics` still override it.',
          'Card\'ın varsayılan camı yenilendi: daha hafif 3.5 px buz ve daha canlı renk, açık sayfada %68 beyaz, koyu sayfada %79 siyah ton, kenarda kıl inceliğinde beyaz bir çizgi ve hafif renk ayrışmalı daha sıkı bir bükülme. Yüzde ışık ya da gölge yok. `tint`, `blur` ve `optics` hâlâ bunun üstüne yazar.',
        ),
      },
      {
        kind: 'new',
        page: 'card',
        text: t(
          'GlassOptics: `dark` gives dark glass its own tint and rim line.',
          'GlassOptics: `dark`, koyu cama kendi tonunu ve kenar çizgisini verir.',
        ),
      },
    ],
  },
  {
    version: '1.1.2',
    date: '2026-11-18',
    title: t(
      'Shorter names in the docs, and a site built on shadcn/ui that works with a keyboard, a screen reader and a phone.',
      'Dokümanda kısa adlar ve klavyeyle, ekran okuyucuyla, telefonla çalışan, shadcn/ui üstüne kurulu bir site.',
    ),
    changes: [
      {
        kind: 'improved',
        text: t(
          'The docs say Button, Action Button, Tabs, Badge, Slide to Confirm and Card. The site is Liquid Glass already; the prefix stays in the code (`GlassButton`).',
          'Doküman artık Button, Action Button, Tabs, Badge, Slide to Confirm ve Card diyor. Site zaten Liquid Glass; ön ek kodda kalıyor (`GlassButton`).',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'The site chrome is shadcn/ui in the site\'s own look: the header menus, the phone menu, the Preview / Code and package-manager tabs, the release filters and the props tables.',
          'Site arayüzü, sitenin kendi görünümüyle shadcn/ui: header menüleri, telefon menüsü, Önizleme / Kod ve paket yöneticisi sekmeleri, sürüm filtreleri ve prop tabloları.',
        ),
      },
      {
        kind: 'fixed',
        text: t(
          'Keyboard: Tab from an open header menu goes into it, the tabs answer the arrow keys, and the phone menu keeps focus inside and gives it back when it closes.',
          'Klavye: açık bir header menüsünden Tab içine girer, sekmeler ok tuşlarına yanıt verir; telefon menüsü odağı içinde tutar ve kapanınca geri verir.',
        ),
      },
      {
        kind: 'fixed',
        text: t(
          'Screen readers: only the page you are on is announced as current, landmarks on Turkish pages have Turkish names, and copying says "Copied".',
          'Ekran okuyucular: yalnız bulunduğun sayfa "geçerli" diye okunur, Türkçe sayfalardaki bölgelerin adı Türkçe ve kopyalayınca "Kopyalandı" denir.',
        ),
      },
      {
        kind: 'fixed',
        text: t(
          'Small grey text, release labels and code comments reach 4.5:1 contrast in both themes.',
          'Küçük gri metinler, sürüm etiketleri ve kod yorumları iki temada da 4.5:1 kontrasta ulaşıyor.',
        ),
      },
      {
        kind: 'fixed',
        text: t(
          'Phones: the install command wraps instead of hiding its end, the release filters move to a second row, and the component picker no longer zooms the page on iOS.',
          'Telefonda: kurulum komutu sonunu gizlemek yerine alt satıra iniyor, sürüm filtreleri ikinci satıra geçiyor ve bileşen seçici iOS\'ta sayfayı yakınlaştırmıyor.',
        ),
      },
      {
        kind: 'fixed',
        text: t('With reduced motion, arrows no longer slide and chevrons flip without turning.', 'Hareketi azalt açıkken oklar kaymıyor; açılır oklar dönmeden yön değiştiriyor.'),
      },
    ],
  },
  {
    version: '1.1.1',
    date: '2026-11-18',
    title: t('The tabs lens takes the corners of your options.', 'Sekme merceği seçeneklerinin köşelerini alıyor.'),
    changes: [
      {
        kind: 'fixed',
        page: 'tabs',
        text: t(
          'GlassLens takes its corners from the highlight: rectangular options (`rounded-lg`) get a rounded-rectangle lens instead of a pill, its corners grow as it swells, and between options of different sizes they travel with the size. GlassTabs keeps its pill.',
          'GlassLens köşelerini vurgudan alıyor: dikdörtgen seçeneklere (`rounded-lg`) hap yerine köşeleri yuvarlatılmış dikdörtgen bir mercek geliyor; köşeler mercek şiştikçe büyüyor, farklı boyuttaki seçenekler arasında boyutla birlikte geçiyor. GlassTabs hap olarak kalıyor.',
        ),
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-11-18',
    title: t('GlassCard is back, a 64 px glass button, and a quieter site.', 'GlassCard geri döndü, 64 px cam buton ve daha sade bir site.'),
    changes: [
      {
        kind: 'new',
        page: 'card',
        text: t(
          'GlassCard: a card of frosted glass that holds your content. As on the 0.x card, its face blurs (`blur`, 5 px) and tints (`tint`, 60%) what is behind, its rim bends it, and it stays still under the pointer. Rebuilt on the shared engine, so it works in every browser with WebGL2.',
          'GlassCard: içeriğini tutan buzlu cam kart. 0.x kartındaki gibi yüzü arkasında kalanı bulanıklaştırır (`blur`, 5 px) ve tonlar (`tint`, %60), kenarı onu büker; imlecin altında büyümez. Ortak motorun üstüne yeniden kuruldu; WebGL2 olan her tarayıcıda çalışır.',
        ),
      },
      {
        kind: 'improved',
        page: 'card',
        text: t(
          'GlassLayer: `blur` frosts what clear glass shows, and `swell={false}` keeps the glass still under the pointer. GlassCard uses both; every other glass looks as before.',
          'GlassLayer: `blur` berrak camın gösterdiğini buzlar, `swell={false}` camı imlecin altında sabit tutar. GlassCard ikisini de kullanır; diğer camların görünümü değişmedi.',
        ),
      },
      {
        kind: 'improved',
        page: 'button',
        text: t('`size="xl"`: a 64 px glass button for the one action a page is about.', '`size="xl"`: sayfanın asıl eylemi için 64 px cam buton.'),
      },
      {
        kind: 'improved',
        page: 'button',
        text: t(
          'The clear-glass example is a larger button on a quiet grid and nothing else: the lines bending at its rim are what you see first.',
          'Berrak cam örneği artık sade bir ızgaranın ortasında büyük bir buton, başka bir şey yok: ilk gördüğün, kenarında bükülen çizgiler.',
        ),
      },
      {
        kind: 'improved',
        page: 'button',
        text: t(
          'The square-corners example sits on fine diagonal lines instead of a blue grid, so the Press demo keeps the site’s only grid.',
          'Köşeli örnek artık mavi ızgara yerine ince çapraz çizgilerin üstünde; sitenin tek ızgarası Press demosunda kalıyor.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'The home page is quiet again: neutral stages, no light effects, and colour only inside the demos, where the glass bends it.',
          'Ana sayfa yeniden sade: nötr sahneler, ışık efekti yok; renk yalnız camın büktüğü demoların içinde.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'The language switch moved to the footer, so the header keeps only what gets you around.',
          'Dil seçimi alt bilgiye taşındı; üst bar yalnız gezinmeye yarayanları tutuyor.',
        ),
      },
      {
        kind: 'improved',
        text: t(
          'Release notes: filters show how many changes each kind has, and a pill in the sidebar now means something (New for this minor line, Updated for the latest release).',
          'Sürüm notları: filtreler her türde kaç değişiklik olduğunu gösteriyor; kenar çubuğundaki etiket artık bir şey anlatıyor (bu sürüm hattı için Yeni, son sürüm için Güncel).',
        ),
      },
      {
        kind: 'fixed',
        text: t(
          'On phones the menu opened as a thin strip under the bar; it fills the screen again. The "What\'s new" row on component pages fits phones, and at tablet widths the version badge no longer sits under the menu.',
          'Telefonda menü, barın altında ince bir şerit olarak açılıyordu; artık yine tüm ekranı kaplıyor. Bileşen sayfalarındaki yenilikler satırı telefona sığıyor; tablet genişliğinde sürüm etiketi artık menünün altında kalmıyor.',
        ),
      },
      {
        kind: 'fixed',
        text: t('Versions and dates in the release notes are easier to read.', 'Sürüm notlarındaki sürüm numaraları ve tarihler daha kolay okunuyor.'),
      },
    ],
  },
  {
    version: '1.0.1',
    date: '2026-11-18',
    title: t('A centred arrow in the action droplet.', 'Eylem damlasında ortalanmış ok.'),
    changes: [
      {
        kind: 'fixed',
        page: 'action-button',
        text: t('The arrow sits optically centred in the droplet.', 'Ok, damlanın tam ortasında (optik olarak ortalı) duruyor.'),
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-11-18',
    title: t(
      'Five components, one verb each, drawn by one zero-dependency WebGL2 engine.',
      'Her biri tek fiilli beş bileşen; hepsini bağımlılıksız tek bir WebGL2 motoru çiziyor.',
    ),
    changes: [
      { kind: 'new', page: 'button', text: t('A clear or tinted glass button that swells under the pointer.', 'İmlecin altında şişen, şeffaf ya da renkli cam buton.') },
      { kind: 'new', page: 'action-button', text: t('An async action whose arrow droplet melts into the body when pressed.', 'Basınca ok damlası gövdeye eriyen asenkron eylem butonu.') },
      { kind: 'new', page: 'tabs', text: t('The selection travels between options as a lens (GlassLens included).', 'Seçim, seçenekler arasında bir mercek olarak kayar (GlassLens dahil).') },
      { kind: 'new', page: 'badge', text: t('A badge whose text flows through the glass.', 'Yazısı camın içinden akan rozet.') },
      { kind: 'new', page: 'slide-to-confirm', text: t('Drag a glass thumb to the end to run one deliberate action.', 'Tek bir bilinçli eylem için cam tutamağı sona kadar sürükle.') },
      { kind: 'new', page: 'installation', text: t('A shadcn registry: one command copies the exact files into components/liquid-glass/.', 'shadcn kaydı: tek komut birebir dosyaları components/liquid-glass/ içine kopyalar.') },
      { kind: 'new', page: 'ai', text: t('llms.txt, Markdown for every page and an agent skill, generated from the same docs.', 'Aynı dokümandan üretilen llms.txt, her sayfanın Markdown hâli ve bir ajan skill\'i.') },
      { kind: 'new', text: t('Bilingual documentation (English and Turkish) with release notes.', 'Sürüm notlarıyla birlikte iki dilli (İngilizce ve Türkçe) doküman.') },
      { kind: 'improved', text: t('The engine is shared: one WebGL2 context draws every glass surface and sleeps when nothing moves.', 'Motor ortak: tek WebGL2 bağlamı tüm cam yüzeyleri çizer, hiçbir şey kıpırdamıyorsa uyur.') },
      { kind: 'removed', text: t('GlassCard, the slider and the form controls of the 0.x previews. The kit is now five components.', '0.x önizlemelerindeki GlassCard, kaydırıcı ve form kontrolleri. Kit artık beş bileşen.') },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-11-01',
    title: t('Browser support notes and a lighter GlassCard on phones.', 'Tarayıcı desteği notları ve telefonda daha hafif bir GlassCard.'),
    changes: [
      { kind: 'improved', text: t('GlassCard renders fewer frames on mobile and documents which browsers get the glass.', 'GlassCard mobilde daha az kare çizer ve hangi tarayıcıların camı gördüğünü belgeler.') },
    ],
  },
  {
    version: '0.2.3',
    date: '2026-10-30',
    title: t('Live weather and calendar cards.', 'Canlı hava durumu ve takvim kartları.'),
    changes: [
      { kind: 'new', text: t('Weather and GitHub calendar examples behind the glass card.', 'Cam kartın arkasında hava durumu ve GitHub takvimi örnekleri.') },
      { kind: 'improved', text: t('Card shadow and a fixed tint per theme.', 'Kart gölgesi ve temaya göre sabit renk tonu.') },
    ],
  },
  {
    version: '0.2.2',
    date: '2026-10-30',
    title: t('Glass cards rest by default.', 'Cam kartlar varsayılan olarak durağan.'),
    changes: [
      { kind: 'improved', text: t('Cards are static until hovered; only the colour pills behind them loop.', 'Kartlar üzerine gelinene dek durağan; yalnız arkadaki renk hapları döner.') },
    ],
  },
  {
    version: '0.2.1',
    date: '2026-10-30',
    title: t('Rim light follows the cursor.', 'Kenar ışığı imleci izler.'),
    changes: [
      { kind: 'improved', text: t('The card rim lights up toward the pointer.', 'Kart kenarı imlecin yönüne doğru aydınlanır.') },
      { kind: 'fixed', text: t('Removed the blue bounce from the rim light.', 'Kenar ışığındaki mavi sekme kaldırıldı.') },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-10-30',
    title: t('Glass that refracts the live page.', 'Canlı sayfayı kıran cam.'),
    changes: [
      { kind: 'new', text: t('GlassCard with live DOM refraction: the page behind is painted into the lens.', 'Canlı DOM kırılmalı GlassCard: arkadaki sayfa merceğe boyanır.') },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-10-30',
    title: t('First preview.', 'İlk önizleme.'),
    changes: [
      { kind: 'new', text: t('A liquid glass slider and a set of glass form controls.', 'Sıvı cam kaydırıcı ve bir dizi cam form kontrolü.') },
      { kind: 'new', text: t('Hosting on Cloudflare Pages.', 'Cloudflare Pages üzerinde yayın.') },
    ],
  },
]

export const LATEST = RELEASES[0]

/** "1.3.2" → "1.3": the version people see. The third number is a patch release of it. */
export const minorOf = (version: string) => version.split('.').slice(0, 2).join('.')

/** The version the site shows (header, footer): the current line, without the patch. */
export const VERSION = minorOf(LATEST.version)

const isComponent = (slug?: string) => CATALOG.some((p) => p.slug === slug)

/**
 * The news. Only a release that adds a component, or one that opens a new major version
 * (2.0.0), is announced to visitors ("What's new", the New pills); everything shipped after
 * it is a patch release and lives in the changelog.
 */
const isAnnounced = (r: Release) => /^\d+\.0\.0$/.test(r.version) || r.changes.some((c) => c.kind === 'new' && isComponent(c.page))
export const FEATURED = RELEASES.find(isAnnounced) ?? LATEST

/** Changes about one docs page, newest first, each with its release. */
export const newsOf = (slug: string) =>
  RELEASES.flatMap((r) => r.changes.filter((c) => c.page === slug).map((c) => ({ ...c, version: r.version, date: r.date })))

/** The releases of the current line: the announced one and the patches shipped after it. */
const CURRENT = RELEASES.slice(0, RELEASES.indexOf(FEATURED) + 1)

/**
 * The sidebar pill: "new" on the components the announced release added, until the next one;
 * "updated" on the other components a release of the current line changed.
 */
export const badgeOf = (slug: string): 'new' | 'updated' | null =>
  FEATURED.changes.some((c) => c.kind === 'new' && c.page === slug)
    ? 'new'
    : isComponent(slug) && CURRENT.some((r) => r.changes.some((c) => c.page === slug || c.also?.includes(slug)))
      ? 'updated'
      : null

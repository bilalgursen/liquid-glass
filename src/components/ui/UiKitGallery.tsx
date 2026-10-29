import { Button } from './Button'
import { Card } from './Card'
import { RangeSlider } from './RangeSlider'
import { SegmentedControl } from './SegmentedControl'
import { Switch } from './Switch'
import { useState } from 'react'

import { useSyncedState, type Theme } from './shared'
import { SectionHeader } from '#/components/site/SiteChrome'

export type UiKitGalleryProps = {
  theme?: Theme
  onThemeChange?: (theme: Theme) => void
  columns?: '2' | '3'
  padding?: 'compact' | 'comfortable' | 'spacious'
  showDescriptions?: boolean
}

export function UiKitGallery({
  theme = 'light',
  onThemeChange,
  columns = '2',
  padding = 'comfortable',
  showDescriptions = true,
}: UiKitGalleryProps) {
  const [current, setCurrent] = useSyncedState(theme, onThemeChange)
  // The icon-only segment adds a "system" choice that follows prefers-color-scheme.
  const [choice, setChoice] = useState<Theme | 'system'>(theme)
  const pick = (next: Theme | 'system') => {
    setChoice(next)
    if (next !== 'system') setCurrent(next)
    else setCurrent(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }
  const card = (title: string, description: string) => ({
    title,
    description: showDescriptions ? description : undefined,
    padding,
  })

  return (
    <div
      id="kit"
      data-theme={current}
      className="w-full scroll-mt-14 px-6 sm:px-10"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 border-b border-border py-20 md:py-24">
        <SectionHeader
          title="Every control, live"
          description="Each control is drawn by the WebGL glass shader: clear lenses that bend what's beneath at the rim, swell when pressed and settle back into flat pills. Press, drag and toggle; all of it is live."
        />

        <div className={`grid grid-cols-1 items-start gap-6 md:grid-cols-2 ${columns === '3' ? 'xl:grid-cols-3' : ''}`}>
          <Card {...card('Buttons', 'Clear glass; swells on press.')}>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button>Glass</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button size="sm" icon="plus">
                New
              </Button>
              <Button size="lg" trailingIcon="arrow-right">
                Get started
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button icon="settings" iconOnly>
                Settings
              </Button>
              <Button icon="plus" iconOnly>
                Add
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </Card>

          <Card {...card('Segmented control', 'Hold and drag the frosted pill to turn it into a magnifying lens. The theme segments switch the page: sun, system, moon.')}>
            <SegmentedControl stretch />
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedControl
                size="sm"
                showIcons={false}
                options={[
                  { value: 'list', label: 'List' },
                  { value: 'grid', label: 'Grid' },
                  { value: 'board', label: 'Board' },
                ]}
              />
              <SegmentedControl
                showLabels={false}
                ariaLabel="Theme: light, system or dark"
                value={choice}
                onChange={(v) => pick(v as Theme | 'system')}
                options={[
                  { value: 'light', label: 'Light', icon: 'sun' },
                  { value: 'system', label: 'System', icon: 'sparkle' },
                  { value: 'dark', label: 'Dark', icon: 'moon' },
                ]}
              />
            </div>
            {/* Both theme segments are wired up: they switch the whole page's theme. */}
            <SegmentedControl
              ariaLabel="Theme"
              value={current}
              onChange={(v) => pick(v as Theme)}
              options={[
                { value: 'light', label: 'Light', icon: 'sun' },
                { value: 'dark', label: 'Dark', icon: 'moon' },
              ]}
            />
          </Card>

          <Card {...card('Toggles', 'Knobs lift into clear glass while held.')}>
            <Switch checked label="Notifications" description="Banners and sounds" />
            <Switch label="Reduce motion" />
          </Card>

          <Card {...card('Sliders', 'Glass thumbs over the accent fill; press and drag to swell the lens.')}>
            <RangeSlider label="Brightness" value={40} size="sm" startIcon="moon" endIcon="sun" restFrost={1} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default UiKitGallery

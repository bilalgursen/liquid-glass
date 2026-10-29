import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import type { Theme } from '#/components/ThemeSwitcher'
import { GetStarted } from '#/components/site/GetStarted'
import { HeroSection } from '#/components/site/HeroSection'
import { HowItWorks } from '#/components/site/HowItWorks'
import { SiteFooter } from '#/components/site/SiteChrome'
import { UiKitGallery } from '#/components/ui/UiKitGallery'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Liquid Glass UI — open-source glass controls for React' },
      {
        name: 'description',
        content: 'A React component kit where every control is a real refracting WebGL lens. MIT licensed.',
      },
    ],
  }),
  component: HomePage,
})

const THEME_KEY = 'liquid-glass-theme'
// Set this to the published repository.
const REPO_URL = 'https://github.com/bilalgursen/liquid-glass'

function HomePage() {
  const [theme, setTheme] = useState<Theme>('light')

  // Resolve the saved/system theme after hydration (the page prerenders as light).
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') setTheme(saved)
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark')
  }, [])

  useEffect(() => {
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const changeTheme = (next: Theme) => {
    setTheme(next)
    localStorage.setItem(THEME_KEY, next)
  }

  return (
    <main data-theme={theme} className="w-full bg-canvas transition-colors duration-500 dark:bg-canvas-dark">
      <HeroSection theme={theme} repoUrl={REPO_URL} />
      <UiKitGallery theme={theme} onThemeChange={changeTheme} />
      <HowItWorks theme={theme} />
      <GetStarted theme={theme} repoUrl={REPO_URL} />
      <SiteFooter repoUrl={REPO_URL} />
    </main>
  )
}

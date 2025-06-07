import { defineStore } from 'pinia'
import { ref, watchEffect, type Ref } from 'vue'

/**
 * Manages the application's theme state (light/dark mode).
 */
export const useThemeStore = defineStore('theme', () => {
  /**
   * Reactive state indicating if dark mode is active.
   * @type {Ref<boolean>}
   */
  const isDark: Ref<boolean> = ref(false)

  /**
   * Toggles the theme between light and dark mode.
   */
  function toggleDark(): void {
    isDark.value = !isDark.value
  }

  /**
   * Explicitly sets the theme mode.
   * @param {boolean} value - True for dark mode, false for light mode.
   */
  function setDark(value: boolean): void {
    isDark.value = value
  }

  /**
   * Initializes the theme based on localStorage or system preference.
   * This function is called automatically when the store is first used.
   */
  function initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    }
  }

  // Automatically initialize the theme when the store is created/used for the first time.
  initializeTheme()

  // Watch for changes in isDark and apply side effects (update HTML class and localStorage).
  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  })

  return {
    isDark,
    toggleDark,
    setDark,
  }
})
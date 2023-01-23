import { computed, ref, watch } from 'vue'
import { get, set } from 'lodash'

/**
 * Shorthand function for writing computed({ get, set })
 *
 */
export function writableComputed(object: any, path: string) {
  return computed({
    get: () => get(object, path),
    set: value => set(object, path, value),
  })
}

/**
 * Reactive local storage. warning, only use with non-object values for now
 */

export function useLocalStorage<T extends string, D>(key: T, defaultvalue: D) {
  const value = ref<D>(localStorage.getItem(key) as D ?? defaultvalue)

  watch(value, (value) => {
    localStorage.setItem(key, String(value))
  }, { immediate: true })

  return { value }
}

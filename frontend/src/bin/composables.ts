import { computed } from 'vue'
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

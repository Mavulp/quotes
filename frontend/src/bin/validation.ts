import { reactive, watch } from 'vue'
import { isEmpty, isNil } from 'lodash'

/**
 * Types
 */

export interface Error {
  type: string | null
  invalid: boolean
  errors: Set<string>
}

export interface Errors {
  [key: string]: Error
}

export interface ValidationRule {
  _validate: Function
  _message: Function
}

export interface Rule {
  [key: string]: ValidationRule
}

interface ValidationOptions {
  // Perform validation on each value update
  proactive?: boolean
  autoclear?: boolean
}

/**
 * Composable
 */

export function useFormValidation(
  form: object,
  rules: any,
  { proactive = false, autoclear = false }: ValidationOptions = {},
) {
  const errors = reactive<Errors>({})

  const root = reactive({ anyError: false, pending: false })

  if (autoclear) {
    watch(
      form,
      () => {
        reset()
      },
      { deep: true },
    )
  }

  if (proactive) {
    watch(
      form,
      () => {
        validate()
      },
      { deep: true },
    )
  }

  // Initial assignment
  reset()

  function _resetErrorObject() {
    Object.assign(errors, {
      ...Object.keys(form).reduce(
        (a, v) => ({
          ...a,
          [v]: {
            type: null,
            invalid: false,
            errors: new Set(),
          },
        }),
        {},
      ),
    })

    Object.assign(root, { anyError: false, pending: false })
  }

  function reset() {
    // Resets the form
    _resetErrorObject()
  }

  async function validate() {
    reset()

    root.pending = true

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      for (const [key, value] of Object.entries(form)) {
        if (!Reflect.has(rules.value, key))
          continue

        const itemRules: Rule = rules.value[key]

        for (const [ruleKey, ruleData] of Object.entries(itemRules)) {
          const { _message, _validate }: ValidationRule = ruleData

          const result = await _validate(value)

          if (!result) {
            root.anyError = true

            // Is error
            errors[key].type = ruleKey
            errors[key].invalid = true
            errors[key].errors.add(_message())
          }
        }
      }

      if (root.anyError)
        reject(errors)
      else
        resolve(true)

      root.pending = false
    })
  }

  return {
    errors,
    reset,
    validate,
    status: root,
  }
}

/**
 * Helpers
 */

export const withMessage = (message: string, validator: ValidationRule): ValidationRule => {
  const { _validate } = validator

  return {
    _validate,
    _message: () => message,
  }
}

export const validateIf = () => {
  // This will only validate if condition is met
}

/**
 * Validations
 */

/**
 * @Rule Input must not be empty, null or undefined
 */
export const required: ValidationRule = {
  _validate(value: any) {
    return (
      !isNil(value)
      && !isEmpty(value)
      && value.length > 0
      && value !== 'null'
      && value !== 'undefined'
    )
  },
  _message() {
    return 'Value is required'
  },
}

/**
 * @Rule Input must be equal or greater than the provided amount
 */
export const minLength = (len: number) => {
  return {
    _validate(value: any) {
      if (isNil(value))
        return false

      return value?.length ? value.length >= len : false
    },
    _message() {
      return `Value must be at least ${len} characters long`
    },
  }
}

/**
 * @Rule Input must be equal or lesser than the provided amount
 */

export const maxLength = (len: number) => {
  return {
    _validate(value: any) {
      if (isNil(value) || value.length === 0)
        return true

      return value?.length ? value.length <= len : false
    },
    _message() {
      return `Value must be equal or smaller than ${len} characters`
    },
  }
}

/**
 * @Rule Input must be a valid email address
 */

export const email = {
  _validate(value: any) {
    return /^\S+@\S+\.\S+$/.test(value)
  },
  _message() {
    return 'Value must be in a valid email format'
  },
}

/**
 * @Rule Input must match the provided `compared` value, either by value or by type & value
 *
 */

export const sameAs = (compared: any, leanient = false) => {
  return {
    _validate(value: any) {
      // eslint-disable-next-line eqeqeq
      return leanient ? value == compared : value === compared
    },
    _message() {
      return 'Values do not match'
    },
  }
}

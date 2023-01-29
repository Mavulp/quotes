import { isArray, merge } from 'lodash'
import { useLoading } from '../store/loading'

// Setup endpoint base
// export const rootUrl = "localhost:5173/api"
export const rootUrl = 'https://quotes.hivecom.net/api'

// export const url = process.env.NODE_ENV === "development" ? "localhost:5173" : rootUrl

// Controller used to abort requests
export const controller = new AbortController()
export const signal = controller.signal

export function get<T = any>(url: string, options?: object) {
  return _handleFetch<T>(
    url,
    merge(
      {
        method: 'GET',
      },
      options,
    ),
  )
}

export function post<T = any>(url: string, body: object | string, options?: object) {
  return _handleFetch<T>(
    url,
    merge(
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      options,
    ),
  )
}

export function put<T = any>(url: string, body: object | string, options?: object) {
  return _handleFetch<T>(
    url,
    merge(
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      options,
    ),
  )
}

/**
 * Special function to handle file uploads
 */

export function upload<T = any>(url: string, body: object | string, options?: object) {
  return _handleFetch<T>(url, {
    method: 'POST',
    body,
    ...options,
  })
}

export function del(url: string, options?: object) {
  return _handleFetch(
    url,
    merge(
      {
        method: 'DELETE',
      },
      options,
    ),
  )
}

// Private handler functions

async function _handleFetch<T>(url: string, options: object) {
  const token = localStorage.getItem('quotes_bearer_token')

  merge(options, {
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return fetch(rootUrl + url, options).then<T>(_handleResponse)
}

async function _handleResponse(response: Response) {
  // if (response.status && response.url) {
  //   window.location.href = response.url
  //   return
  // }

  if (response.status !== 200) {
    return response.text().then((text: string) => {
      let message = null

      try {
        const parsed = JSON.parse(text)
        message = parsed.message
      }
      catch (e) {
        message = text
      }

      return Promise.reject(new Error(
        message || `An unexpected error occured: ${response.statusText}`,
      ))
    })
  }

  return response.text().then((text: string) => {
    const data = text && JSON.parse(text)

    if (!response.ok)
      return Promise.reject(data)

    return data
  })
}

export async function $fetch<P>(name: string, promises: Promise<P>): Promise<P> {
  const loading = useLoading()
  loading.add(name)

  if (isArray(promises)) {
    return Promise.all(promises)
      .finally(() => {
        loading.del(name)
      }) as Promise<P>
  }

  return promises.finally(() => {
    loading.del(name)
  })
}

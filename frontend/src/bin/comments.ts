import { useUser } from '../store/user'

export const formats = ['.jpeg', '.gif', '.png', '.apng', '.svg', '.bmp', '.bmp', '.ico', '.jpg', '.webp']

/**
 * Checks wether an image within a comment is valid. Otherwise it handles it as a link
 */

export function isValidImage(text: string) {
  return formats.some(format => text.endsWith(format))
}

/**
 * Function which takes in the content of a comment and replaces image or links with their respective tags
 */
export function formatCommentContent(text: string) {
  const _regex = /\bhttps?:\/\/\S+/gi

  const urls = [...new Set(text.match(_regex))]

  const _img = (_url: string) => /* html */ `<img src="${_url}" />`
  const _a = (_url: string) => /* html */ `<a href="${_url}" target="_blank">${_url}</a>`

  if (urls && urls.length > 0) {
    // Loop over each url
    urls.forEach((url) => {
      let chunk

      if (isValidImage(url)) {
        // Is an image
        chunk = _img(url)
      }
      else {
        // is a link
        chunk = _a(url)
      }

      text = text.replaceAll(url, chunk)
    })
  }

  return text
}

/**
 * Detects if anywhere in the comment is '@text'. Then it checks if the username is
 * a registered user. If yes, provides a link to their profile
 */

export function formatCommentUsers(text: string) {
  const _regex = /@(\w+)/g
  return text.replaceAll(_regex, (original: string, parsed: string) => {
    // console.log(one, two, three)
    // const user = userStore.getUser(parsed)
    const users = useUser()
    const user = users.users.find(u => u.username === parsed)

    if (!user)
      return original

    return /* html */ `<button class="comment-user-link" data-title-link="${user.username}"  href="/${user.username}">${user.username}</button>`
  })
}

/**
 * Takes in a text and sanitizes any inline javascript
 */

export function sanitize(text: string) {
  if (!text)
    return null

  const regex = /\bon\w+\=\"?[\w\:\(\)\']+\"?/g
  return text.replaceAll(regex, '')
}

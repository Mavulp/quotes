export interface User {
  bio: string
  highlightedQuoteId: number
  profilePicture: string
  username: string
  createdAt: number
}

export interface Settings {
  bio: string
  profilePicture: string
  highlightedQuoteId: number
  colorTheme: 'light-theme' | 'dark-theme'
}

export interface EditableSettings {
  bio: string
  profilePicture: string
}

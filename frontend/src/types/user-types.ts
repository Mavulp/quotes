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
  highlightedQuoteId: number | null
  colorTheme: 'light-theme' | 'dark-theme'
}

export type UserRole = 'moderator' | 'edit-tags' | 'delete-tags' | 'edit-quote-metadata'

import { defineStore } from "pinia";
import { get } from "../bin/fetch";
import flags from "../bin/flags";

interface User {
    bio: string,
    colorTheme: "light-theme" | 'dark-theme',
    country: keyof typeof flags,
    displayName: string,
    highlightedQuoteId: number,
    profilePicture: string
}

interface State {
  user: User
}

export const useUser = defineStore('user', {
  state: () => ({
    user: {}
  }),
  actions: {
   async fetchUser() {
      get('/account/settings') 
        .then((res) => {
          console.log(res);
          
        })
    }
  },
  getters: {

  }
})
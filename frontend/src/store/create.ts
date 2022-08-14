import { defineStore } from "pinia"
import {
  ContextQuoteContent,
  HighlightQuoteContent,
  ImageQuoteContent,
  CreateQuote,
  Blocks
} from "../types/quote-types"

interface State {
  form: CreateQuote
  _index: number
}

// TODO: Add a type for CreateQuote
// Before submitting, this object will get serialized to
// correctly match the NewQuote interface
const defaultQuote: CreateQuote = {
  location: "",
  blocks: new Map(),
  offensive: null,
  comments: true,
  anonymous: false,
  anonymousQuotees: false
}

const defaultBlocks: [ImageQuoteContent, ContextQuoteContent, HighlightQuoteContent] = [
  { type: "image", url: "", quotee: "", highlight: false },
  { type: "context", text: "", quotee: "", highlight: false },
  { type: "highlight", text: "", quotee: "", highlight: false }
]

export const useCreate = defineStore("create", {
  state: () =>
    ({
      form: {},
      _index: 0
    } as State),
  actions: {
    reset() {
      this.form = structuredClone(defaultQuote)
    },
    appendBlock(type: Blocks) {
      const block = structuredClone(defaultBlocks.find((block) => block.type === type))

      if (block) {
        this.form.blocks.set(this._index, block)
        this._index++
      }
    },
    editBlock(
      index: number,
      updated: ImageQuoteContent | ContextQuoteContent | HighlightQuoteContent
    ) {
      this.form.blocks.set(index, updated)
      this._index--
    },
    delBlock(index: number) {
      this.form.blocks.delete(index)
    }
    // // Want to edit a field withing an interface
    // // @key is straightforward, just a keyof said interface
    // // @value should use the type it has within the interface at @key
    // editForm<T>(
    //   key: keyof BaseCreateQuote,
    //   /**
    //    * I guess I could provide the type as a parameter, but is there a way to infer the
    //    * type based on the key within the interface?
    //    */
    //   value: T
    // ) {

    //   if (T instanceof BaseCreateQuote) {
    //     // Want to be able to edit all of the interface except the excluded terms
    //     this.form[key] = value

    //   }
    // }
  }
})

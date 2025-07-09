import { Controller } from "@hotwired/stimulus"
import Sortable from "sortablejs"

export default class extends Controller {
    static values = {
      url: String
    }
  
    connect() {
      this.sortable = Sortable.create(this.element, {
        animation: 150,
        handle: '.category-drag-icon',
        direction: 'vertical',
        onEnd: this.reorder.bind(this)
      })
    }
  
    reorder() {
      const ids = Array.from(this.element.querySelectorAll("li")).map(el => el.dataset.id)
      const positions = Array.from(this.element.querySelectorAll("li")).map(el => el.dataset.position).sort((a, b) => a - b)

      fetch(this.urlValue, {
        method: "POST",
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
          "Content-Type": "application/json"
        },
          body: JSON.stringify({ categories: { ids: ids, positions: positions } })
      })
    }
  }
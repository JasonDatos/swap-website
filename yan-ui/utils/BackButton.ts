import { VueElement } from '@vue/test-utils/dist/types'
import { reactive } from 'vue'

class BackButtonState {
    public elements: any[] = []
    public going_back = false
}

export default class BackButton {
    public state: BackButtonState = reactive({
        elements: [],
        going_back: false,
    })

    public element_append = (element: any) => {
        this.state.going_back = false
        const elIndex = this.state.elements.findIndex(
            (el) => el.component === element.component,
        )
        if (elIndex !== -1) {
            // If component is already in the list, revert to the previous state.
            this.state.elements.splice(elIndex + 1, this.count())
        } else {
            this.state.elements.push(element)
        }
    }

    public element_remove = (element: any) => {
        this.state.elements = this.state.elements.filter((e) => e !== element)
    }

    public element_newest = () => {
        if (this.enabled()) {
            return this.state.elements[this.index()]
        } else {
            return null
        }
    }

    public element_remove_latest = () => {
        this.state.elements.pop()
    }

    public element_remove_range = (elements: any[]) => {
        this.state.elements = this.state.elements.filter(
            (e) => elements.indexOf(e) === -1,
        )
    }

    public clear = () => {
        this.state.elements = []
    }

    public enabled = () => {
        return this.state.elements.length > 0
    }

    public index = () => {
        return this.count() - 1
    }

    public count = () => {
        return this.state.elements.length
    }

    public current_title = () => {
        const el = this.element_newest()
        if (el && el.title) {
            return el.title
        } else {
            return null
        }
    }

    public back = (event: any) => {
        this.state.going_back = true
        event.preventDefault()
        event.stopPropagation()
        if (this.enabled()) {
            this.state.elements[this.index()].component.back_click()
            this.element_remove_latest()
        }
    }
}

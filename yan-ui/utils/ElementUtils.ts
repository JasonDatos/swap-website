export default class ElementUtils {
    public is_in_viewport(el: HTMLElement) {
        const rect = el.getBoundingClientRect()
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
                (window.innerWidth || document.documentElement.clientWidth)
        )
    }

    public is_in_element(el: HTMLElement, el_parent: HTMLElement) {
        const rect = el.getBoundingClientRect()
        const rect_parent = el.getBoundingClientRect()
        return (
            rect.top >= rect_parent.top &&
            rect.left >= rect_parent.left &&
            rect.bottom <= rect_parent.width &&
            rect.right <= rect_parent.height
        )
    }
}

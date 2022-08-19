export default class MathUtils {
    public static clamp(min: number, value: number, max: number): number {
        return Math.max(min, Math.min(value, max))
    }

    public static lerp(start: number, end: number, percent: number): number {
        return start + (end - start) * percent
    }

    public static approach(
        current: number,
        target: number,
        speed: number = 1,
    ): number {
        if (current < target) {
            return Math.min(current + speed, target)
        } else {
            return Math.max(current - speed, target)
        }
    }

    public static approach_smooth(
        current: number,
        target: number,
        speed: number = 0.15,
        accuracy: number = 1,
    ): number {
        const distance = target - current
        if (Math.abs(distance) < accuracy) {
            return target
        } else {
            return current + Math.sign(distance) * Math.abs(distance) * speed
        }
    }

    public static time_ago(time: number): string {
        const now = Date.now()

        const diff = Math.abs(now - new Date(time).getTime())

        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        let text = ''
        if (days > 0) {
            text = days + ' days ago'
        } else if (hours > 0) {
            text = hours + ' hours ago'
        } else if (minutes > 0) {
            text = minutes + ' minutes ago'
        } else if (seconds > 0) {
            text = seconds + ' seconds ago'
        } else {
            text = 'just now'
        }

        return text
    }

    public static time_to_local_date_time(time: number): string {
        const date = new Date(time)
        return date.toLocaleString()
    }
}

export interface BreadcrumbItem {
    text: string
    icon?: string
    link?: string
    key?: string
    [key: string]: any
}

export function BreadcrumbItemValidator(item: BreadcrumbItem): boolean {
    return !!item.text
}

export interface FilePreview {
    url: string
    type: string
}

export interface FileEntity {
    id: string
    name: string
    extension: string
    size: number
    type: string
    mime_type: string
    path: string
    created_at: string | Date
    updated_at: string | Date
    on_ipfs: boolean
    user_id: string
    favorite: boolean
    parent_id: string
    permission?: string
    preview?: FilePreview | null
    thumbnail?: string
    access?: string
    upload_object?: any
    additional_meta_data?: any
}

export function FileValidator(file: FileEntity): boolean {
    return !!(
        file.id &&
        file.name &&
        file.size &&
        file.type &&
        file.path &&
        file.created_at &&
        file.updated_at &&
        file.parent_id
    )
}

export function FilePreviewValidator(preview: FilePreview): boolean {
    return !!(preview.url && preview.type)
}

export interface RectSize {
    height?: number
    width?: number
    top?: number
    left?: number
}

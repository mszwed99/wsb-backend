



export interface PagintationOptions {
    take?: number;
    skip?: number;
}

export interface OrderPaginationOptions extends PagintationOptions {
    
}

export interface UserPaginationOptions extends PagintationOptions {
    addresses?: boolean;
    roles?: boolean;
    orders?: boolean;
    shops?: boolean;
}

export interface ShopPaginationOptions extends PagintationOptions {
    addresses?: boolean,
    products?: boolean,
    user?: boolean
    isActive?: boolean
}

export interface ProductPaginationOptions extends PagintationOptions {
    max?: number;
    min?: number;
    categoryID?: string[];
    name?: string;
}

export interface PaginationResponse<T> {
    total: number;
    data: T[]
}

export class PaginationResponse<T> {
    total: number;
    data: T[]
}
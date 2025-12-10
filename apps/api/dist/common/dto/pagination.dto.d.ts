export declare class PaginationDto {
    page?: number;
    limit?: number;
    get skip(): number;
    get take(): number;
}
export declare class PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
    constructor(data: T[], total: number, pagination: PaginationDto);
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResponse = exports.PaginationMeta = exports.PaginationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PaginationDto {
    page = 1;
    limit = 10;
    get skip() {
        return ((this.page ?? 1) - 1) * (this.limit ?? 10);
    }
    get take() {
        return this.limit ?? 10;
    }
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '페이지 번호 (1부터 시작)',
        minimum: 1,
        default: 1,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '페이지당 항목 수',
        minimum: 1,
        maximum: 100,
        default: 10,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PaginationDto.prototype, "limit", void 0);
class PaginationMeta {
    page;
    limit;
    total;
    totalPages;
    hasNextPage;
    hasPreviousPage;
}
exports.PaginationMeta = PaginationMeta;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '현재 페이지' }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '페이지당 항목 수' }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '총 항목 수' }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '총 페이지 수' }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '다음 페이지 존재 여부' }),
    __metadata("design:type", Boolean)
], PaginationMeta.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '이전 페이지 존재 여부' }),
    __metadata("design:type", Boolean)
], PaginationMeta.prototype, "hasPreviousPage", void 0);
class PaginatedResponse {
    data;
    meta;
    constructor(data, total, pagination) {
        const page = pagination.page ?? 1;
        const limit = pagination.limit ?? 10;
        const totalPages = Math.ceil(total / limit);
        this.data = data;
        this.meta = {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }
}
exports.PaginatedResponse = PaginatedResponse;
//# sourceMappingURL=pagination.dto.js.map
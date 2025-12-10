import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * 페이지네이션 요청 DTO
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: '페이지 번호 (1부터 시작)',
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  /**
   * Prisma skip 값 계산
   */
  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 10);
  }

  /**
   * Prisma take 값
   */
  get take(): number {
    return this.limit ?? 10;
  }
}

/**
 * 페이지네이션 응답 메타 정보
 */
export class PaginationMeta {
  @ApiPropertyOptional({ description: '현재 페이지' })
  page: number;

  @ApiPropertyOptional({ description: '페이지당 항목 수' })
  limit: number;

  @ApiPropertyOptional({ description: '총 항목 수' })
  total: number;

  @ApiPropertyOptional({ description: '총 페이지 수' })
  totalPages: number;

  @ApiPropertyOptional({ description: '다음 페이지 존재 여부' })
  hasNextPage: boolean;

  @ApiPropertyOptional({ description: '이전 페이지 존재 여부' })
  hasPreviousPage: boolean;
}

/**
 * 페이지네이션 응답 래퍼
 */
export class PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(data: T[], total: number, pagination: PaginationDto) {
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


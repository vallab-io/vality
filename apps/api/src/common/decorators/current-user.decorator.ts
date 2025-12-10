import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 현재 로그인한 사용자 정보를 가져오는 데코레이터
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // data가 있으면 특정 속성만 반환 (예: @CurrentUser('id'))
    return data ? user?.[data] : user;
  },
);


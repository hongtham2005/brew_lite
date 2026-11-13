// [TV5] Task 7
// TODO: Guard bảo vệ route đặt đơn
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

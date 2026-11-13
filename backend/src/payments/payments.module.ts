import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { OnlinePaymentGatewayService } from './online-payment-gateway.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule, 
    LoyaltyModule, 
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    OnlinePaymentGatewayService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
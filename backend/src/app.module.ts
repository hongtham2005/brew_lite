// [TV1] Task 1
// TODO: Import các module
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module'; // 1. Import PaymentsModule vào đây
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    OrdersModule,
    PaymentsModule, 
    ProductsModule,
    AuthModule,
    MailModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

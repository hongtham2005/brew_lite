import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  orderId!: number;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsString()
  method!: string;

  @IsNotEmpty()
  @IsString()
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  customerName?: string; 
}

export class PaymentMethodDto {
  @IsNotEmpty()
  @IsString()
  code!: string; 

  @IsNotEmpty()
  @IsString()
  name!: string;
}
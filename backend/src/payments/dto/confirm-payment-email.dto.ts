import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

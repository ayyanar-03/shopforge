import { IsIn } from 'class-validator';

export class VerifyReturnRequestDto {
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';
}

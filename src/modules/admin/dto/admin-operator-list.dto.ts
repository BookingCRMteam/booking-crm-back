import { ApiProperty } from '@nestjs/swagger';

export class AdminOperatorListDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  status: string;
}

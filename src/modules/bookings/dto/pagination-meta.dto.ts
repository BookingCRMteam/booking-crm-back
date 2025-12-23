import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 12 })
  total: number;

  @ApiProperty({ example: 6 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;
}

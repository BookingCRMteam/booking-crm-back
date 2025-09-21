import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstPersonName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstPersonSurname?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  secondPersonName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  secondPersonSurname?: string;

  @IsOptional()
  @IsString()
  @Length(6, 20)
  phone?: string;
}

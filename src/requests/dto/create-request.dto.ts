import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;
}
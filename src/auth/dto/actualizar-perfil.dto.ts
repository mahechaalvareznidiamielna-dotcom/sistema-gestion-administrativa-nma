import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ActualizarPerfilDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

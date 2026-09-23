import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearTareaDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(2)
  descripcion: string;

  @IsDateString()
  fecha: string;

  @IsDateString()
  fechaLimite: string;

  @IsIn(['alta', 'media', 'baja'])
  prioridad: 'alta' | 'media' | 'baja';

  @IsOptional()
  @IsIn(['pendiente', 'completada'])
  estado?: 'pendiente' | 'completada';
}

import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearMovimientoDto {
  @IsIn(['ingreso', 'gasto'])
  tipo: 'ingreso' | 'gasto';

  @IsDateString()
  fecha: string;

  @IsString()
  @MinLength(2)
  descripcion: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  valor: number;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsIn(['efectivo', 'transferencia', 'tarjeta', 'otro'])
  formaPago?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaGastoId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productoId?: number;
}

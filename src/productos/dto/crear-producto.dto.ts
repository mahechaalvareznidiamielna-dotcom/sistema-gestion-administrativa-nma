import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearProductoDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @Type(() => Number)
  @IsInt()
  categoriaId: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  cantidadDisponible: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioCompra: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioVenta: number;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class CsvStore {
  readonly dir: string;

  constructor() {
    // Si estamos en Vercel, el sistema de archivos raíz es de solo lectura; usamos /tmp
    const isVercel = Boolean(process.env.VERCEL);
    this.dir = isVercel ? '/tmp' : join(process.cwd(), 'data');
    try {
      mkdirSync(this.dir, { recursive: true });
    } catch {
      // Ignorar si ya existe
    }
  }

  path(archivo: string) {
    return join(this.dir, archivo);
  }

  read<T extends { id: number }>(archivo: string): T[] {
    const file = this.path(archivo);
    if (!existsSync(file)) return [];
    const text = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const headers = this.splitLine(lines[0]);
    return lines.slice(1).map((line) => {
      const cols = this.splitLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = cols[i] ?? '';
      });
      return this.cast(row) as T;
    });
  }

  write(
    archivo: string,
    rows: any[],
    headers: string[],
  ) {
    const lines = [headers.map((h) => this.escape(h)).join(',')];
    for (const row of rows) {
      lines.push(headers.map((h) => this.escape(row[h] ?? '')).join(','));
    }
    writeFileSync(this.path(archivo), lines.join('\n') + '\n', 'utf8');

    // También guardar respaldo en formato JSON automáticamente
    const jsonFile = archivo.replace(/\.csv$/, '.json');
    this.writeJson(jsonFile, rows);
  }

  readJson<T>(archivo: string): T | null {
    const file = this.path(archivo);
    if (!existsSync(file)) return null;
    try {
      const text = readFileSync(file, 'utf8');
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }

  writeJson<T>(archivo: string, data: T): void {
    const file = this.path(archivo);
    try {
      writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.warn(`No se pudo escribir archivo JSON ${archivo}:`, e);
    }
  }

  insert<T extends { id: number }>(
    archivo: string,
    headers: string[],
    data: Omit<T, 'id'> & { id?: number },
  ): T {
    const rows = this.read<T>(archivo);
    const id =
      data.id ||
      rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
    const row = { ...data, id } as T;
    rows.push(row);
    this.write(archivo, rows, headers);
    return row;
  }

  update<T extends { id: number }>(
    archivo: string,
    headers: string[],
    id: number,
    data: Partial<T>,
  ): T | null {
    const rows = this.read<T>(archivo);
    const idx = rows.findIndex((r) => Number(r.id) === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data, id };
    this.write(archivo, rows, headers);
    return rows[idx];
  }

  remove<T extends { id: number }>(
    archivo: string,
    headers: string[],
    id: number,
  ) {
    const rows = this.read<T>(archivo);
    const next = rows.filter((r) => Number(r.id) !== id);
    if (next.length === rows.length) return false;
    this.write(archivo, next, headers);
    return true;
  }

  private cast(row: Record<string, string>) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (value === '') {
        out[key] = key.endsWith('Id') || key === 'cantidad' ? null : '';
      } else if (
        /^(id|.*Id|cantidadDisponible|cantidad|precioCompra|precioVenta|valor)$/.test(
          key,
        )
      ) {
        out[key] = Number(value);
      } else {
        out[key] = value;
      }
    }
    return out;
  }

  private splitLine(line: string) {
    const result: string[] = [];
    let current = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          quoted = false;
        } else {
          current += ch;
        }
      } else if (ch === '"') {
        quoted = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  private escape(value: unknown) {
    const text = String(value ?? '');
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }
}

export const HEADERS = {
  usuarios: ['id', 'nombre', 'email', 'password', 'creadoEn'],
  categoriasProducto: ['id', 'nombre'],
  categoriasGasto: ['id', 'nombre'],
  productos: [
    'id',
    'nombre',
    'categoriaId',
    'cantidadDisponible',
    'precioCompra',
    'precioVenta',
    'ubicacion',
    'observaciones',
  ],
  tareas: [
    'id',
    'nombre',
    'descripcion',
    'fecha',
    'fechaLimite',
    'prioridad',
    'estado',
  ],
  movimientos: [
    'id',
    'tipo',
    'fecha',
    'descripcion',
    'valor',
    'observacion',
    'formaPago',
    'cantidad',
    'categoriaGastoId',
    'productoId',
  ],
};

export const FILES = {
  usuarios: 'usuarios.csv',
  categoriasProducto: 'categorias_producto.csv',
  categoriasGasto: 'categorias_gasto.csv',
  productos: 'productos.csv',
  tareas: 'tareas.csv',
  movimientos: 'movimientos.csv',
};

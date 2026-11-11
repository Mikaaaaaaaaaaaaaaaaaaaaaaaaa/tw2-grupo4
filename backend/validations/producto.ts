export interface DatosProducto {
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image?: string | null;
}

export interface ErrorValidacionProducto {
  campo: keyof DatosProducto;
  mensaje: string;
}

export interface ResultadoValidacionProducto {
  valido: boolean;
  errores: ErrorValidacionProducto[];
}

const MAX_PRICE = 99999999.99;

export function validarProducto(
  datos: DatosProducto,
): ResultadoValidacionProducto {
  const errores: ErrorValidacionProducto[] = [];

  if (typeof datos.title !== 'string' || datos.title.trim().length === 0) {
    errores.push({ campo: 'title', mensaje: 'El título es obligatorio.' });
  } else if (datos.title.trim().length < 3) {
    errores.push({
      campo: 'title',
      mensaje: 'El título debe tener al menos 3 caracteres.',
    });
  } else if (datos.title.trim().length > 150) {
    errores.push({
      campo: 'title',
      mensaje: 'El título no puede superar los 150 caracteres.',
    });
  }

  if (
    typeof datos.description !== 'string' ||
    datos.description.trim().length === 0
  ) {
    errores.push({
      campo: 'description',
      mensaje: 'La descripción es obligatoria.',
    });
  } else if (datos.description.trim().length < 10) {
    errores.push({
      campo: 'description',
      mensaje: 'La descripción debe tener al menos 10 caracteres.',
    });
  }

  if (
    typeof datos.category !== 'string' ||
    datos.category.trim().length === 0
  ) {
    errores.push({ campo: 'category', mensaje: 'La categoría es obligatoria.' });
  } else if (datos.category.trim().length > 100) {
    errores.push({
      campo: 'category',
      mensaje: 'La categoría no puede superar los 100 caracteres.',
    });
  }

  if (
    typeof datos.price !== 'number' ||
    !Number.isFinite(datos.price) ||
    datos.price <= 0
  ) {
    errores.push({
      campo: 'price',
      mensaje: 'El precio debe ser un número mayor a 0.',
    });
  } else if (
    datos.price > MAX_PRICE ||
    Math.abs(datos.price * 100 - Math.round(datos.price * 100)) >
      Number.EPSILON * Math.max(1, Math.abs(datos.price * 100))
  ) {
    errores.push({
      campo: 'price',
      mensaje:
        'El precio debe tener como máximo 2 decimales y no superar 99999999.99.',
    });
  }

  if (typeof datos.stock !== 'number' || !Number.isInteger(datos.stock)) {
    errores.push({
      campo: 'stock',
      mensaje: 'El stock debe ser un número entero.',
    });
  } else if (datos.stock < 0) {
    errores.push({
      campo: 'stock',
      mensaje: 'El stock debe ser mayor o igual a 0.',
    });
  }

  if (datos.image !== undefined && datos.image !== null) {
    if (typeof datos.image !== 'string' || datos.image.trim().length === 0) {
      errores.push({
        campo: 'image',
        mensaje: 'La imagen debe ser una URL http(s) válida.',
      });
    } else if (datos.image.trim().length > 500) {
      errores.push({
        campo: 'image',
        mensaje: 'La URL de la imagen no puede superar los 500 caracteres.',
      });
    } else if (!/^https?:\/\/\S+$/i.test(datos.image.trim())) {
      errores.push({
        campo: 'image',
        mensaje: 'La imagen debe ser una URL que comience con http:// o https://.',
      });
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}

import { format, parse, isValid } from 'date-fns';

/**
 * Formatea una fecha a dd/MM/yyyy
 * @param fecha - Fecha en formato string (puede ser yyyy-MM-dd u otros formatos comunes)
 * @returns Fecha formateada o "Fecha no válida"
 */
export const formatearFecha = (fecha: string): string => {
  try {
    if (!fecha) return 'Fecha no válida';

    // Intentar convertir el string en un objeto Date
    let date = new Date(fecha);

    // Si la fecha no es válida, probar con formatos comunes
    if (!isValid(date)) {
      const formatos = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'dd-MM-yyyy'];

      for (const formato of formatos) {
        date = parse(fecha, formato, new Date());
        if (isValid(date)) break;
      }
    }

    // Verificar si la fecha es válida después del parseo
    if (!isValid(date)) return 'Fecha no válida';

    // Sumar un día para ajustar la fecha correctamente si es necesario
    date.setDate(date.getDate() + 1);

    // Retornar la fecha en formato dd/MM/yyyy
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha no válida';
  }
};

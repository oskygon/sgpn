
import React from 'react';
import { Clock, FileText, User } from 'lucide-react';
import { Paciente } from '../services/db';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PatientCardProps {
  patient: Paciente;
  onClick: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  // Calcular edad
  const calcularEdad = (fechaNacimiento: string) => {
    try {
      const hoy = new Date();
      const fechaNac = new Date(fechaNacimiento);
      
      if (isNaN(fechaNac.getTime())) return 'Fecha no válida';
      
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        return `${edad - 1} años`;
      }
      
      if (edad === 0) {
        const meses = hoy.getMonth() - fechaNac.getMonth() + 
          (hoy.getDate() < fechaNac.getDate() ? -1 : 0) + 
          (hoy.getMonth() < fechaNac.getMonth() ? 12 : 0);
        
        if (meses === 0) {
          const dias = Math.floor((hoy.getTime() - fechaNac.getTime()) / (1000 * 60 * 60 * 24));
          return `${dias} días`;
        }
        
        return `${meses} meses`;
      }
      
      return `${edad} años`;
    } catch (e) {
      return 'Error en fecha';
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return 'Fecha no válida';
      return format(date, 'PPP', { locale: es });
    } catch (e) {
      return 'Fecha no válida';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="glass-card rounded-xl p-4 hover:shadow-xl animate-hover-subtle cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 rounded-full bg-medical-100 p-3 dark:bg-medical-800">
          <User className="w-6 h-6 text-medical-600 dark:text-medical-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-600">
            {patient.nombre} {patient.apellido}
          </h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-2 text-medical-500 dark:text-gray-400" />
              <span>
                {formatearFecha(patient.fechaNacimiento)} • {calcularEdad(patient.fechaNacimiento)}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FileText className="w-4 h-4 mr-2 text-medical-500 dark:text-gray-400" />
              <span>HC: {patient.numeroHistoriaClinica}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;

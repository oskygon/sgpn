import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { dbService, Paciente } from '../services/db';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import DocumentoImprimible from '@/components/DocumentoImprimible';
import { calcularPorcentajeDiferenciaPeso } from '../utils/pesoUtils';
import BotonFlotanteGuardar from '@/components/BotonFlotanteGuardar';



const EditarPaciente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [showDocumento, setShowDocumento] = useState(false);
  const [ddv, setDDV] = useState<number>(0);
  const calcularDDV = (fechaNacimiento: string): number => {
    // Convertir la fecha de nacimiento a un objeto Date
    const fechaNac = new Date(fechaNacimiento);
    
    // Obtener la fecha actual
    const fechaActual = new Date();
    
    // Calcular la diferencia en milisegundos
    const diferenciaMs = fechaActual.getTime() - fechaNac.getTime();
    
    // Convertir la diferencia de milisegundos a días
    const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    
    return diferenciaDias;
  };

  // Cargar los datos del paciente al iniciar
  useEffect(() => {
    const cargarPaciente = async () => {
      if (!id) return;
         try {
        const pacienteData = await dbService.obtenerPacientePorId(parseInt(id));
        if (pacienteData) {
          setPaciente(pacienteData);
          // Calcular DDV automáticamente
        const ddvCalculado = calcularDDV(pacienteData.fechaNacimiento);
        setPaciente((prev) => (prev ? { ...prev, ddv: ddvCalculado.toString() } : null));
      }
      
      } catch (error) {
        console.error('Error al cargar paciente:', error);
        toast.error('Error al cargar los datos del paciente');
      }
    };

    cargarPaciente();
  }, [id, navigate]);

  useEffect(() => {
    if (paciente?.fechaNacimiento) {
      const ddvCalculado = calcularDDV(paciente.fechaNacimiento);
      setPaciente((prev) => (prev ? { ...prev, ddv: ddvCalculado.toString() } : null));
    }
  }, [paciente?.fechaNacimiento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setPaciente((prev) => (prev ? { ...prev, [name]: checked } : null));
    } else {
      setPaciente((prev) => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleCancel = () => {
    navigate(`/paciente/${id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paciente?.nombre || !paciente?.apellido || !paciente?.numeroHistoriaClinica) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setSaving(true);
      await dbService.actualizarPaciente(paciente);
      toast.success('Paciente actualizado correctamente');
      setSaving(false);
      navigate(`/paciente/${id}`);
    } catch (error) {
      console.error('Error al actualizar el paciente:', error);
      toast.error('Error al actualizar el paciente');
      setSaving(false);
    }
  };

  if (!paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-300 dark:from-gray-900 dark:to-gray-800 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-6"
        >



          
          <button
            onClick={handleCancel}
            className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Editar Paciente</h1>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Información Personal */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-blue-600">Datos del Recién Nacido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={paciente.nombre}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={paciente.apellido}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={paciente.fechaNacimiento}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Hora de Nacimiento</label>
                  <input
                    type="time"
                    name="horaNacimiento"
                    value={paciente.horaNacimiento}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Número de Historia Clínica *</label>
                  <input
                    type="text"
                    name="numeroHistoriaClinica"
                    value={paciente.numeroHistoriaClinica}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    required
                  />
                  </div>
                  <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Pulsera</label>
                  <input
                    type="text"
                    name="pulsera"
                    value={paciente.pulsera}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  />
                
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Sexo</label>
                  <select
                    name="sexo"
                    value={paciente.sexo}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Datos de Nacimiento */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="block text-lg font-semibold text-gray-700 dark:text-blue-600">Datos de Nacimiento</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Peso (g)</label>
                  <input
                    type="text"
                    name="peso"
                    value={paciente.peso}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    placeholder="Ej: 3500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Talla (cm)</label>
                  <input
                    type="text"
                    name="talla"
                    value={paciente.talla}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    placeholder="Ej: 50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Perímetro Cefálico (cm)</label>
                  <input
                    type="text"
                    name="perimetroCefalico"
                    value={paciente.perimetroCefalico}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    placeholder="Ej: 34"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Edad Gestacional</label>
                  <input
                    type="text"
                    name="edadGestacional"
                    value={paciente.edadGestacional}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    placeholder="Ej: 38 sem"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">APGAR</label>
                  <input
                    type="text"
                    name="apgar"
                    value={paciente.apgar}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    placeholder="Ej: 9/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">DDV</label>
                  <input
                     type="text"
            name=""
            value={paciente.ddv}
            readOnly
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  />
                </div>
                
                
              </div>
            </div>

            {/* Datos del Parto */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold  text-gray-700 dark:text-blue-600">Datos del Parto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Nacido Por</label>
                  <select
                    name="nacidoPor"
                    value={paciente.nacidoPor}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Parto vaginal">Parto vaginal</option>
                    <option value="Cesárea">Cesárea</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Presentación</label>
                  <select
                    name="presentacion"
                    value={paciente.presentacion}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Cefálica">Cefálica</option>
                    <option value="Podálica">Podálica</option>
                    <option value="Transversa">Transversa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Líquido Amniótico</label>
                  <select
                    name="liquidoAmniotico"
                    value={paciente.liquidoAmniotico}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Claro">Claro</option>
                    <option value="Meconial">Meconial</option>
                    <option value="Teñido">Teñido</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Ruptura de Membranas</label>
                  <select
                    name="rupturaMembranas"
                    value={paciente.rupturaMembranas}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Espontánea">Espontánea</option>
                    <option value="Artificial">Artificial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Clasificación</label>
                  <input
                    type="text"
                    name="clasificacion"
                    value={paciente.clasificacion}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Procedencia</label>
                  <input
                    type="text"
                    name="procedencia"
                    value={paciente.procedencia}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Personal Médico */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-blue-600">Personal de Recepción</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Obstetra</label>
                  <input
                    type="text"
                    name="obstetra"
                    value={paciente.obstetra}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Enfermera</label>
                  <input
                    type="text"
                    name="enfermera"
                    value={paciente.enfermera}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Neonatólogo/a</label>
                  <input
                    type="text"
                    name="neonatologo"
                    value={paciente.neonatologo}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Vacunación y Pesquisa */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800  dark:text-blue-600 mb-4">Vacunación y Laboratorios</h3>
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Vacunación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vacunacionHbsag"
                        name="vacunacionHbsag"
                        checked={paciente.vacunacionHbsag}
                        onCheckedChange={(checked) =>
                          setPaciente((prev) => (prev ? { ...prev, vacunacionHbsag: checked === true } : null))
                        }
                      />
                      <label htmlFor="vacunacionHbsag" className="text-sm font-medium text-gray-700 dark:text-white">
                      HBsAg
                      </label>
                    </div>
                    {paciente.vacunacionHbsag && (
                      <div className="grid grid-cols-2 gap-2 pl-6">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Lote</label>
                          <input
                            type="text"
                            name="loteHbsag"
                            value={paciente.loteHbsag}
                            onChange={handleChange}
                            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Fecha</label>
                          <input
                            type="date"
                            name="fechaHbsag"
                            value={paciente.fechaHbsag}
                            onChange={handleChange}
                            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vacunacionBcg"
                        name="vacunacionBcg"
                        checked={paciente.vacunacionBcg}
                        onCheckedChange={(checked) =>
                          setPaciente((prev) => (prev ? { ...prev, vacunacionBcg: checked === true } : null))
                        }
                      />
                      <label htmlFor="vacunacionBcg" className="text-sm font-medium text-gray-700 dark:text-white">
                        BCG
                      </label>
                    </div>
                    {paciente.vacunacionBcg && (
                      <div className="grid grid-cols-2 gap-2 pl-6">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Lote</label>
                          <input
                            type="text"
                            name="loteBcg"
                            value={paciente.loteBcg}
                            onChange={handleChange}
                            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Fecha</label>
                          <input
                            type="date"
                            name="fechaBcg"
                            value={paciente.fechaBcg}
                            onChange={handleChange}
                            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Laboratorios</h4>
              <div className="mb-6">
          
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pesquisaMetabolica"
                      name="pesquisaMetabolica"
                      checked={paciente.pesquisaMetabolica}
                      onCheckedChange={(checked) =>
                        setPaciente((prev) => (prev ? { ...prev, pesquisaMetabolica: checked === true } : null))
                      }
                    />
                    <label htmlFor="pesquisaMetabolica" className="text-sm font-medium text-gray-700 dark:text-white">
                      Pesquisa Metabólica
                    </label>
                  </div>
                  {paciente.pesquisaMetabolica && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">N° Protocolo</label>
                        <input
                          type="text"
                          name="protocoloPesquisa"
                          value={paciente.protocoloPesquisa}
                          onChange={handleChange}
                          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Fecha</label>
                        <input
                          type="date"
                          name="fechaPesquisa"
                          value={paciente.fechaPesquisa}
                          onChange={handleChange}
                          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Hora</label>
                        <input
                          type="time"
                          name="horaPesquisa"
                          value={paciente.horaPesquisa}
                          onChange={handleChange}
                          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
              
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Bilirrubina Total (mg/dl)</label>
                    <input
                      type="text"
                      name="bilirrubinaTotalValor"
                      value={paciente.bilirrubinaTotalValor}
                      onChange={handleChange}
                      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                      placeholder="Ej: 12.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Bilirrubina Directa (mg/dl)</label>
                    <input
                      type="text"
                      name="bilirrubinaDirectaValor"
                      value={paciente.bilirrubinaDirectaValor}
                      onChange={handleChange}
                      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                      placeholder="Ej: 0.8"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Hematocrito (%)</label>
                    <input
                      type="text"
                      name="hematocritoValor"
                      value={paciente.hematocritoValor}
                      onChange={handleChange}
                      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                      placeholder="Ej: 45"
                    />
                  </div>
                </div>
                
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Grupo y Factor</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Recién Nacido</label>
                    <input
                      type="text"
                      name="grupoFactorRn"
                      value={paciente.grupoFactorRn}
                      onChange={handleChange}
                      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                      placeholder="Ej: A Rh+"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Materno</label>
                    <input
                      type="text"
                      name="grupoFactorMaterno"
                      value={paciente.grupoFactorMaterno}
                      onChange={handleChange}
                      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                      placeholder="Ej: O Rh+"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">PCD</label>
                    <select
                      name="pcd"
                      value={paciente.pcd}
                      onChange={handleChange}
                      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Positiva">Positiva</option>
                      <option value="Negativa">Negativa</option>
                      <option value="No realizada">No realizada</option>
                    </select>
                  </div>
                  </div>
                  <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Otros laboratorios</label>
                  <input
                    name="laboratorios"
                    value={paciente.laboratorios}
                    onChange={handleChange}
                    
                    className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                  />
                </div>
              
                </div>
              </div>
              
            </div>

        

            {/* Datos Maternos */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-600 mb-4">Datos Maternos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido y Nombre</label>
          <input
            name="datosMaternos"
            value={paciente.datosMaternos}
            onChange={handleChange}
            
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>

        <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Documento</label>
        <input
          type="text"
          name="numeroDocumento"
          value={paciente.numeroHistoriaClinica}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          readOnly // Esto hace que el campo sea de solo lectura
        />
      </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={paciente.telefono}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Obra Social</label>
          <select
            name="obraSocial"
            value={paciente.obraSocial}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          >
            <option value="">Seleccionar...</option>
            <option value="OSMATA">OSMATA</option>
            <option value="OSEIVIDRIO">OSEIVIDRIO</option>
            <option value="OSPIPLASTIC">OSPIPLASTIC</option>
            <option value="OSPESGYPE">OSPESGYPE</option>
            <option value="OSTFUTBOL">OSTFUTBOL</option>
            <option value="PARTICULAR">PARTICULAR</option>
          </select>
        </div>

        
        
              <div className="flex space-x-4">
  {/* SARS-CoV-2 (PCR) */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      SARS-CoV-2 (PCR)
    </label>
    <select
      name="sarsCov2"
      value={paciente.sarsCov2}
      onChange={handleChange}
      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    >
      <option value="">Seleccionar...</option>
      <option value="Positivo">Positivo</option>
      <option value="Negativo">Negativo</option>
      <option value="No realizado">No realizado</option>
      <option value="Pendiente">Pendiente</option>
    </select>
  </div>

  {/* Fecha */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Fecha
    </label>
    <input
      type="date"
      name="fechaCovid"
      value={paciente.fechaCovid}
      onChange={handleChange}
      className="cursor-pointer w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    />
  </div>
</div>
              <div className="flex space-x-4">
  {/* Chagas */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Chagas
    </label>
    <select
      name="chagas"
      value={paciente.chagas}
      onChange={handleChange}
      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    >
      <option value="">Seleccionar...</option>
      <option value="Positivo">Positivo</option>
      <option value="Negativo">Negativo</option>
      <option value="No realizado">No realizado</option>
      <option value="Pendiente">Pendiente</option>
    </select>
  </div>

  {/* Fecha */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Fecha
    </label>
    <input
      type="date"
      name="fechaChagas"
      value={paciente.fechaChagas}
      onChange={handleChange}
      className="cursor-pointer w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    />
  </div>
</div>
              <div className="flex space-x-4">
  {/* Toxoplasmosis */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Toxoplasmósis
    </label>
    <select
      name="toxoplasmosis"
      value={paciente.toxoplasmosis}
      onChange={handleChange}
      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    >
      <option value="">Seleccionar...</option>
      <option value="Positivo">Positivo</option>
      <option value="Negativo">Negativo</option>
      <option value="No realizado">No realizado</option>
      <option value="Zona gris">Zona gris</option>
      <option value="Pendiente">Pendiente</option>
    </select>
  </div>

  {/* Fecha */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Fecha
    </label>
    <input
      type="date"
      name="fechaToxo"
      value={paciente.fechaToxo}
      onChange={handleChange}
      className="cursor-pointer w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    />
  </div>
</div>
              <div className="flex space-x-4">
  {/* HIV */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      HIV
    </label>
    <select
      name="hiv"
      value={paciente.hiv}
      onChange={handleChange}
      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    >
      <option value="">Seleccionar...</option>
      <option value="Positivo">Positivo</option>
      <option value="Negativo">Negativo</option>
      <option value="No realizado">No realizado</option>
      <option value="Pendiente">Pendiente</option>
    </select>
  </div>

  {/* Fecha */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Fecha
    </label>
    <input
      type="date"
      name="fechaHIV"
      value={paciente.fechaHIV}
      onChange={handleChange}
      className="cursor-pointer w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    />
  </div>
</div>
              <div className="flex space-x-4">
  {/* VDRL */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      VDRL
    </label>
    <select
      name="vdrl"
      value={paciente.vdrl}
      onChange={handleChange}
      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    >
      <option value="">Seleccionar...</option>
      <option value="Positivo">Positivo</option>
      <option value="Negativo">Negativo</option>
      <option value="No realizado">No realizado</option>
      <option value="Pendiente">Pendiente</option>
    </select>
  </div>

  {/* Fecha */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Fecha
    </label>
    <input
      type="date"
      name="fechaVDRL"
      value={paciente.fechaVDRL}
      onChange={handleChange}
      className="cursor-pointer w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    />
  </div>
</div>
              <div className="flex space-x-4">
  {/* Hepatitis B */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Hepatitis B
    </label>
    <select
      name="hepatitis B"
      value={paciente.hepatitisB}
      onChange={handleChange}
      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    >
      <option value="">Seleccionar...</option>
      <option value="Positivo">Positivo</option>
      <option value="Negativo">Negativo</option>
      <option value="No realizado">No realizado</option>
      <option value="Pendiente">Pendiente</option>
    </select>
  </div>

  {/* Fecha */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Fecha
    </label>
    <input
      type="date"
      name="fechaHB"
      value={paciente.fechaHB}
      onChange={handleChange}
      className="cursor-pointer w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    />
  </div>
</div>
<div className="flex space-x-4">
  {/* EGB*/}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      EGB
    </label>
    <select
      name="egb"
      value={paciente.egb}
      onChange={handleChange}
      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    >
      <option value="">Seleccionar...</option>
      <option value="Positivo">Positivo</option>
      <option value="Negativo">Negativo</option>
      <option value="No realizado">No realizado</option>
      <option value="Pendiente">Pendiente</option>
    </select>
  </div>

  {/* Fecha */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Fecha
    </label>
    <input
      type="date"
      name="fechaEGB"
      value={paciente.fechaEGB}
      onChange={handleChange}
      className="cursor-pointer w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    />
  </div>
</div>
<div className="flex space-x-4">
  {/* Profilaxis ATB*/}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
      Profilaxis ATB
    </label>
    <select
      name="profilaxisATB"
      value={paciente.profilaxisATB}
      onChange={handleChange}
      className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
    >
      <option value="">Seleccionar...</option>
            <option value="Realizada">Realizada</option>
            <option value="No realizada">No realizada</option>

    </select>
  </div>

 
</div>

</div>
</div>

       
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-600 mb-4">Datos del Egreso</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Egreso</label>
          <input
            type="date"
            name="fechaEgreso"
            value={paciente.fechaEgreso}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora de Egreso</label>
          <input
            type="time"
            name="horaEgreso"
            value={paciente.horaEgreso}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso de Egreso (g)</label>
          <input
            type="text"
            name="pesoEgreso"
            value={paciente.pesoEgreso}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
            placeholder="Ej: 3200"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Diferencia de peso (%)</label>
          <input
            type="text"
            name=""
            value={calcularPorcentajeDiferenciaPeso(paciente)}
            readOnly
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
            placeholder=""
          />
          
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enfermera de Egreso</label>
          <input
            type="text"
            name="enfermeraEgreso"
            value={paciente.enfermeraEgreso}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Neonatólogo/a de Egreso</label>
          <input
            type="text"
            name="neonatologoEgreso"
            value={paciente.neonatologoEgreso}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
      </div>
  
      
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Evolución durante la internación</label>
          <textarea
            name="evolucionInternacion"
            value={paciente.evolucionInternacion}
            onChange={handleChange}
            rows={3}
            className="w-full h-auto p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Diagnósticos</label>
          <textarea
            name="diagnosticos"
            value={paciente.diagnosticos}
            onChange={handleChange}
            rows={3}
            className="w-full h-auto p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Indicaciones al egreso</label>
          <textarea
            name="indicacionesEgreso"
            value={paciente.indicacionesEgreso}
            onChange={handleChange}
            rows={3}
            className="w-full h-auto p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones</label>
          <textarea
            name="observaciones"
            value={paciente.observaciones}
            onChange={handleChange}
            rows={3}
            className="w-full h-auto p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
      
    
  
                
              </div>
            </div>

      {/* Botón flotante para guardar */}
            <div className="container mx-auto p-4 pb-20">
   
      
      <BotonFlotanteGuardar onClick={saving} saving={saving} />
    </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="px-6"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-medical-600 hover:bg-medical-700 text-white px-6"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default EditarPaciente;
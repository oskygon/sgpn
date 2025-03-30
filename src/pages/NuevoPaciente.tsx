import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { dbService, Paciente } from '../services/db';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { format, differenceInDays, parseISO } from 'date-fns';
import DocumentoImprimible from '@/components/DocumentoImprimible';

const NuevoPaciente = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [pacienteRegistrado, setPacienteRegistrado] = useState<Paciente | null>(null);
  const [showDocumento, setShowDocumento] = useState(false);
  const fechaActual = format(new Date(), 'yyyy-MM-dd');
  const horaActual = format(new Date(), 'HH:mm');

  // Combinar fecha y hora para el formulario
  const [fechaHoraNacimiento, setFechaHoraNacimiento] = useState(`${fechaActual}T${horaActual}`);
  
  const [formData, setFormData] = useState<Omit<Paciente, 'id' | 'createdAt'>>({
    nombre: '',
    apellido: '',
    fechaNacimiento: fechaActual,
    horaNacimiento: horaActual,
    numeroHistoriaClinica: '',
    sexo: '',
    peso: '',
    talla: '',
    perimetroCefalico: '',
    edadGestacional: '',
    apgar: '',
    ddv: '',
    hc: '',
    pulsera: '',
    nacidoPor: '',
    presentacion: '',
    liquidoAmniotico: '',
    rupturaMembranas: '',
    clasificacion: '',
    procedencia: '',
    sectorInternacion: '',
    obstetra: '',
    enfermera: '',
    neonatologo: '',
    vacunacionHbsag: false,
    loteHbsag: '',
    fechaHbsag: fechaActual,
    vacunacionBcg: false,
    loteBcg: '',
    fechaBcg: fechaActual,
    pesquisaMetabolica: false,
    protocoloPesquisa: '',
    fechaPesquisa: fechaActual,
    horaPesquisa: horaActual,
    grupoFactorRn: '',
    grupoFactorMaterno: '',
    pcd: '',
    bilirrubinaTotalValor: '',
    bilirrubinaDirectaValor: '',
    hematocritoValor: '',
    laboratorios: '',
    fechaEgreso: '',
    horaEgreso: '',
    pesoEgreso: '',
    evolucionInternacion: '',
    diagnosticos: '',
    indicacionesEgreso: '',
    observaciones: '',
    enfermeraEgreso: '',
    neonatologoEgreso: '',
    datosMaternos: '',
    numeroDocumento: '',
    telefono: "",
    obraSocial: "",  
    sarsCov2: '',
    fechaCovid: fechaActual,
    chagas: '',
    fechaChagas: fechaActual,
    toxoplasmosis: '',
    fechaToxo: fechaActual,
    hiv: '',
    fechaHIV: fechaActual,
    vdrl: '',
    fechaVDRL: fechaActual,
    hepatitisB: '',
    fechaHB: fechaActual,
    egb: '',
    fechaEGB: fechaActual,
    profilaxisATB: ''
  });

  // Manejador para el cambio de fecha-hora combinado
  const handleFechaHoraNacimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFechaHoraNacimiento(value);
    
    // Separar fecha y hora para actualizar el estado
    const [fecha, hora] = value.split('T');
    setFormData(prev => ({
      ...prev,
      fechaNacimiento: fecha,
      horaNacimiento: hora
    }));
  };

  useEffect(() => {
    if (formData.fechaNacimiento) {
      // Crear un objeto fecha combinando fecha y hora
      const fechaHora = new Date(`${formData.fechaNacimiento}T${formData.horaNacimiento || '00:00'}`);
      const hoy = new Date();
      const diasDeVida = differenceInDays(hoy, fechaHora);
      
      setFormData(prev => ({ 
        ...prev, 
        ddv: diasDeVida.toString() 
      }));
    }
  }, [formData.fechaNacimiento, formData.horaNacimiento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido || !formData.numeroHistoriaClinica) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }
    
    try {
      setSaving(true);
      const id = await dbService.agregarPaciente(formData);
      
      const pacienteCompleto = await dbService.obtenerPacientePorId(id);
      
      if (pacienteCompleto) {
        setPacienteRegistrado(pacienteCompleto);
        setShowDocumento(true);
        toast.success('Paciente registrado correctamente');
      } else {
        toast.error('Error al recuperar datos del paciente');
        setTimeout(() => {
          navigate(`/paciente/${id}`);
        }, 1000);
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error al guardar el paciente:', error);
      toast.error('Error al guardar el paciente');
      setSaving(false);
    }
  };

  const handleCloseDocumento = () => {
    setShowDocumento(false);
    if (pacienteRegistrado?.id) {
      navigate(`/paciente/${pacienteRegistrado.id}`);
    } else {
      navigate('/');
    }
  };

// Grupos de campos para mejor organización del formulario
const informacionPersonal = (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-600 mb-4">Datos del Recién Nacido</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Nombre *</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
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
          value={formData.apellido}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Fecha y Hora de Nacimiento *</label>
        <input
          type="datetime-local"
          name="fechaHoraNacimiento"
          value={fechaHoraNacimiento}
          onChange={handleFechaHoraNacimientoChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Número de Historia Clínica *</label>
        <input
          type="text"
          name="numeroHistoriaClinica"
          value={formData.numeroHistoriaClinica}
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
          value={formData.pulsera}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Sexo</label>
        <select
          name="sexo"
          value={formData.sexo}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
        >
          <option value="">Seleccionar...</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
    </div>
  </div>
);

const datosNacimiento = (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-600 mb-4">Datos del Nacimiento</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Peso (g)</label>
        <input
          type="text"
          name="peso"
          value={formData.peso}
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
          value={formData.talla}
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
          value={formData.perimetroCefalico}
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
          value={formData.edadGestacional}
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
          value={formData.apgar}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          placeholder="Ej: 9/10"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">DDV</label>
        <input
          type="text"
          name="ddv"
          value={formData.ddv}
          readOnly // Hacer el campo de solo lectura
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
        />
      </div>
    </div>
  </div>
);

const datosParto = (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-600 mb-4">Datos del Parto</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Nacido Por</label>
        <select
          name="nacidoPor"
          value={formData.nacidoPor}
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
          value={formData.presentacion}
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
          value={formData.liquidoAmniotico}
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
          value={formData.rupturaMembranas}
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
          value={formData.clasificacion}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Procedencia</label>
        <input
          type="text"
          name="procedencia"
          value={formData.procedencia}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
        />
      </div>
    </div>
  </div>
);

const personalMedico = (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-600 mb-4">Personal de Recepción</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Obstetra</label>
        <input
          type="text"
          name="obstetra"
          value={formData.obstetra}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Enfermera</label>
        <input
          type="text"
          name="enfermera"
          value={formData.enfermera}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Neonatólogo/a</label>
        <input
          type="text"
          name="neonatologo"
          value={formData.neonatologo}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
        />
      </div>
    </div>
  </div>
);

const vacunacionPesquisa = (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-600 mb-4">Vacunación y Laboratorios</h3>
    
    <div className="mb-6">
      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Vacunación</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="vacunacionHbsag"
              name="vacunacionHbsag"
              checked={formData.vacunacionHbsag} 
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, vacunacionHbsag: checked === true }))
              }
            />
            <label htmlFor="vacunacionHbsag" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              HBsAg
            </label>
          </div>
          
          {formData.vacunacionHbsag && (
            <div className="grid grid-cols-2 gap-2 pl-6">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Lote</label>
                <input
                  type="text"
                  name="loteHbsag"
                  value={formData.loteHbsag}
                  onChange={handleChange}
                  className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
                <input
                  type="date"
                  name="fechaHbsag"
                  value={formData.fechaHbsag}
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
              checked={formData.vacunacionBcg} 
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, vacunacionBcg: checked === true }))
              }
            />
            <label htmlFor="vacunacionBcg" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              BCG
            </label>
          </div>
          
          {formData.vacunacionBcg && (
            <div className="grid grid-cols-2 gap-2 pl-6">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Lote</label>
                <input
                  type="text"
                  name="loteBcg"
                  value={formData.loteBcg}
                  onChange={handleChange}
                  className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
                <input
                  type="date"
                  name="fechaBcg"
                  value={formData.fechaBcg}
                  onChange={handleChange}
                  className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
    
    <div className="mb-6">
      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Laboratorios</h4>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="pesquisaMetabolica"
            name="pesquisaMetabolica"
            checked={formData.pesquisaMetabolica} 
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, pesquisaMetabolica: checked === true }))
            }
          />
          <label htmlFor="pesquisaMetabolica" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Pesquisa Metabólica
          </label>
        </div>
        
        {formData.pesquisaMetabolica && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">N° Protocolo</label>
              <input
                type="text"
                name="protocoloPesquisa"
                value={formData.protocoloPesquisa}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input
                type="date"
                name="fechaPesquisa"
                value={formData.fechaPesquisa}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Hora</label>
              <input
                type="time"
                name="horaPesquisa"
                value={formData.horaPesquisa}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
    
    <div className="mb-6">
      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Grupo y Factor</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recién Nacido</label>
          <input
            type="text"
            name="grupoFactorRn"
            value={formData.grupoFactorRn}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
            placeholder="Ej: A Rh+"
          />
        </div>
        
        
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Materno</label>
            <input
              type="text"
              name="grupoFactorMaterno"
              value={formData.grupoFactorMaterno}
              onChange={handleChange}
              className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              placeholder="Ej: O Rh+"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PCD</label>
            <select
              name="pcd"
              value={formData.pcd}
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
      </div>
      
      <div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bilirrubina Total (mg/dl)</label>
            <input
              type="text"
              name="bilirrubinaTotalValor"
              value={formData.bilirrubinaTotalValor}
              onChange={handleChange}
              className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              placeholder="Ej: 12.5"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bilirrubina Directa (mg/dl)</label>
            <input
              type="text"
              name="bilirrubinaDirectaValor"
              value={formData.bilirrubinaDirectaValor}
              onChange={handleChange}
              className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              placeholder="Ej: 0.8"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hematocrito (%)</label>
            <input
              type="text"
              name="hematocritoValor"
              value={formData.hematocritoValor}
              onChange={handleChange}
              className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              placeholder="Ej: 45"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Otros laboratorios</label>
          <textarea
            name="laboratorios"
            value={formData.laboratorios}
            onChange={handleChange}
            rows={2}
            className="glass-input w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );

  
  const datosMaternos = (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-600 mb-4">Datos Maternos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido y Nombre</label>
          <input
            name="datosMaternos"
            value={formData.datosMaternos}
            onChange={handleChange}
            
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>

        <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Documento</label>
        <input
          type="text"
          name="numeroDocumento"
          value={formData.numeroHistoriaClinica}
          onChange={handleChange}
          className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          readOnly // Esto hace que el campo sea de solo lectura
        />
      </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Obra Social</label>
          <select
            name="obraSocial"
            value={formData.obraSocial}
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
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SARS-CoV-2 (PCR)</label>
          <select
            name="sarsCov2"
            value={formData.sarsCov2}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          >
            <option value="">Seleccionar...</option>
            <option value="Positivo">Positivo</option>
            <option value="Negativo">Negativo</option>
            <option value="No realizado">No realizado</option>
          </select>
          <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input
                type="date"
                name="fechaCovid"
                value={formData.fechaCovid}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chagas</label>
          <select
            name="chagas"
            value={formData.chagas}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          >
            <option value="">Seleccionar...</option>
            <option value="Positivo">Positivo</option>
            <option value="Negativo">Negativo</option>
            <option value="No realizado">No realizado</option>
            <option value="Pendiente">Pendiente</option>
          </select>
          <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input
                type="date"
                name="fechaChagas"
                value={formData.fechaChagas}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Toxoplasmosis</label>
          <select
            name="toxoplasmosis"
            value={formData.toxoplasmosis}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          >
            <option value="">Seleccionar...</option>
            <option value="Positivo">Positivo</option>
            <option value="Negativo">Negativo</option>
            <option value="No realizado">No realizado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Zona gris">Zona gris</option>
          </select>
          <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input
                type="date"
                name="fechaToxo"
                value={formData.fechaToxo}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">HIV</label>
          <select
            name="hiv"
            value={formData.hiv}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          >
            <option value="">Seleccionar...</option>
            <option value="Positivo">Positivo</option>
            <option value="Negativo">Negativo</option>
            <option value="No realizado">No realizado</option>
            <option value="Pendiente">Pendiente</option>
          </select>
          <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input
                type="date"
                name="fechaHIV"
                value={formData.fechaHIV}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">VDRL</label>
          <select
            name="vdrl"
            value={formData.vdrl}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          >
            <option value="">Seleccionar...</option>
            <option value="Positivo">Positivo</option>
            <option value="Negativo">Negativo</option>
            <option value="No realizado">No realizado</option>
            <option value="Pendiente">Pendiente</option>
          </select>
          <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input
                type="date"
                name="fechaVDRL"
                value={formData.fechaVDRL}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hepatitis B</label>
          <select
            name="hepatitisB"
            value={formData.hepatitisB}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          >
            <option value="">Seleccionar...</option>
            <option value="Positivo">Positivo</option>
            <option value="Negativo">Negativo</option>
            <option value="No realizado">No realizado</option>
            <option value="Pendiente">Pendiente</option>
          </select>
          <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input
                type="date"
                name="fechaHB"
                value={formData.fechaHB}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
        </div>
        
           
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">EGB</label>
          <select
            name="egb"
            value={formData.egb}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          >
            <option value="">Seleccionar...</option>
            <option value="Positivo">Positivo</option>
            <option value="Negativo">Negativo</option>
            <option value="No realizado">No realizado</option>
          </select>
          <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input
                type="date"
                name="fechaEGB"
                value={formData.fechaEGB}
                onChange={handleChange}
                className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
              />
            </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PROFILAXIS ATB</label>
          <select
            name="profilaxisATB"
            value={formData.profilaxisATB}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          >
            <option value="">Seleccionar...</option>
            <option value="Negativo">Realizada</option>
            <option value="No realizado">No realizada</option>
          </select>
        </div>
      </div>
    </div>
  );
  
  const datosEgreso = (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-600 mb-4">Datos del Egreso</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Egreso</label>
          <input
            type="date"
            name="fechaEgreso"
            value={formData.fechaEgreso}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora de Egreso</label>
          <input
            type="time"
            name="horaEgreso"
            value={formData.horaEgreso}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso de Egreso (g)</label>
          <input
            type="text"
            name="pesoEgreso"
            value={formData.pesoEgreso}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
            placeholder="Ej: 3200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enfermera de Egreso</label>
          <input
            type="text"
            name="enfermeraEgreso"
            value={formData.enfermeraEgreso}
            onChange={handleChange}
            className="w-full h-12 p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Neonatólogo/a de Egreso</label>
          <input
            type="text"
            name="neonatologoEgreso"
            value={formData.neonatologoEgreso}
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
            value={formData.evolucionInternacion}
            onChange={handleChange}
            rows={3}
            className="w-full h-auto p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Diagnósticos</label>
          <textarea
            name="diagnosticos"
            value={formData.diagnosticos}
            onChange={handleChange}
            rows={3}
            className="w-full h-auto p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Indicaciones al egreso</label>
          <textarea
            name="indicacionesEgreso"
            value={formData.indicacionesEgreso}
            onChange={handleChange}
            rows={3}
            className="w-full h-auto p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={3}
            className="w-full h-auto p-3 text-base rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-medical-300 focus:border-transparent transition-all duration-300 text-gray-700 dark:text-gray-200"
          />
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6">
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Registrar Nuevo Paciente</h1>
        </motion.div>
  
        <form onSubmit={handleSubmit}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {informacionPersonal}
            
            {datosNacimiento}
            
            {datosParto}
            
            {personalMedico}
            
            {vacunacionPesquisa}
            
            {datosMaternos}
  
            {datosEgreso}
            
  
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
                    Guardar Paciente
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </form>
      </div>
      
      {showDocumento && pacienteRegistrado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Ficha de Paciente Registrado
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseDocumento}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4">
              <DocumentoImprimible 
                paciente={pacienteRegistrado} 
                onClose={handleCloseDocumento} 
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCloseDocumento}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div> 
  
  );
};

export default NuevoPaciente;

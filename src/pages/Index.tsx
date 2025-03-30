
import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SearchInput from '../components/SearchInput';
import PatientCard from '../components/PatientCard';
import { dbService, Paciente } from '../services/db';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Paciente[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await dbService.initDB();
        setLoading(false);
      } catch (error) {
        console.error('Error initializing database:', error);
        toast.error('Error al inicializar la base de datos');
        setLoading(false);
      }
    };

    initializeDB();
  }, []);

  const handleSearch = async (query: string) => {
    setIsSearching(query.length > 0);
    try {
      const results = await dbService.buscarPacientesPorNombre(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Error al buscar pacientes');
    }
  };

  const handleNewPatient = () => {
    navigate('/nuevo-paciente');
  };

  const handlePatientClick = (id: number) => {
    navigate(`/paciente/${id}`);
  };

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">Sistema de Gestión de Pacientes Neonatales</h1>
    
          
          <p className="text-gray-600 dark:text-blue-400 max-w-2xl mx-auto">
            SANATORIO SAN FRANCISCO DE ASÍS
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="flex items-center">
                <Search className="w-6 h-6 text-medical-600 dark:text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-400">Buscar Paciente</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Buscar pacientes por nombre, apellido o historia clínica.
              </p>
              <SearchInput 
                onSearch={handleSearch}
                placeholder="Nombre, apellido o número de HC..."
                className="mt-2"
              />
            </div>
            
            <div 
              className="space-y-4 bg-medical-50 dark:bg-gray-700/50 rounded-xl p-5 cursor-pointer hover:bg-medical-100 dark:hover:bg-gray-700 transition-colors duration-300"
              onClick={handleNewPatient}
            >
              <div className="flex items-center">
                <PlusCircle className="w-6 h-6 text-medical-600 dark:text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-400">Nuevo Paciente</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Registrar un nuevo paciente en el sistema.
              </p>
              <button className="btn-medical mt-2 w-full">
                Crear nuevo paciente
              </button>
            </div>
          </div>
        </motion.div>

        {isSearching && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8"
          >
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-medical-600 mr-2" />
              <h2 className="text-xl font-semibold text-blue-600">Resultados de la búsqueda</h2>
              <div className="ml-auto text-sm text-gray-500">
                {searchResults.length} {searchResults.length === 1 ? 'paciente' : 'pacientes'} encontrado{searchResults.length !== 1 && 's'}
              </div>
            </div>
            
            <Separator className="mb-4" />
            
            {searchResults.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-12"
              >
                <p className="text-gray-500 dark:text-gray-300">No se encontraron pacientes con esos criterios de búsqueda.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((patient) => (
                  <motion.div key={patient.id} variants={itemVariants}>
                    <PatientCard 
                      patient={patient} 
                      onClick={() => patient.id && handlePatientClick(patient.id)} 
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;

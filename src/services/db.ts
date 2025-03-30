
const DB_NAME = 'ClinicaDB';
const DB_VERSION = 2; // Increased version for schema migration
const STORE_NAME = 'pacientes';

interface Paciente {
  id?: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  horaNacimiento: string;
  numeroHistoriaClinica: string;
  sexo: string;
  peso: string;
  talla: string;
  perimetroCefalico: string;
  edadGestacional: string;
  apgar: string;
  ddv: string;
  hc: string;
  pulsera: string;
  nacidoPor: string;
  presentacion: string;
  liquidoAmniotico: string;
  rupturaMembranas: string;
  clasificacion: string;
  procedencia: string;
  sectorInternacion: string;
  obstetra: string;
  enfermera: string;
  neonatologo: string;
  // Vacunación con nuevos campos
  vacunacionHbsag: boolean;
  loteHbsag: string;
  fechaHbsag: string;
  vacunacionBcg: boolean;
  loteBcg: string;
  fechaBcg: string;
  // Pesquisa con nuevos campos
  pesquisaMetabolica: boolean;
  protocoloPesquisa: string;
  fechaPesquisa: string;
  horaPesquisa: string;
  // Grupo y factor extendido
  grupoFactorRn: string;
  grupoFactorMaterno: string;
  pcd: string;
  // Laboratorios extendidos
  bilirrubinaTotalValor: string;
  bilirrubinaDirectaValor: string;
  hematocritoValor: string;
  laboratorios: string;
  // Datos de egreso
  fechaEgreso: string;
  horaEgreso: string;
  pesoEgreso: string;
  evolucionInternacion: string;
  diagnosticos: string;
  indicacionesEgreso: string;
  observaciones: string;
  enfermeraEgreso: string;
  neonatologoEgreso: string;
  // Campos existentes
  datosMaternos: string;
  numeroDocumento: string;
  telefono: string;          // Nuevo campo para el número de teléfono
  obraSocial: string;
  sarsCov2: string;
  fechaCovid: string;
  chagas: string;
  fechaChagas: string;
  toxoplasmosis: string;
  fechaToxo: string;
  hiv: string;
  fechaHIV: string;
  vdrl: string;
  fechaVDRL: string;
  hepatitisB: string;
  fechaHB: string;
  egb: string;
  fechaEGB: string;
  profilaxisATB: string;
  createdAt: number;
}

class DBService {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Create new store if it doesn't exist
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('nombreApellido', ['nombre', 'apellido'], { unique: false });
          store.createIndex('numeroHistoriaClinica', 'numeroHistoriaClinica', { unique: true });
        } else {
          // Get existing store for modification
          const store = transaction!.objectStore(STORE_NAME);
          
          // Migrate existing data if needed
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = function() {
            const allRecords = getAllRequest.result;
            
            // Update each record with new schema
            allRecords.forEach(record => {
              // Add new fields with default values if they don't exist
              const updatedRecord = {
                ...record,
                // Vacunación
                loteHbsag: record.loteHbsag || '',
                fechaHbsag: record.fechaHbsag || '',
                loteBcg: record.loteBcg || '',
                fechaBcg: record.fechaBcg || '',
                // Pesquisa
                protocoloPesquisa: record.protocoloPesquisa || '',
                fechaPesquisa: record.fechaPesquisa || '',
                horaPesquisa: record.horaPesquisa || '',
                // Grupo y factor
                grupoFactorRn: record.grupoFactorRn || record.grupoFactor || '',
                grupoFactorMaterno: record.grupoFactorMaterno || '',
                pcd: record.pcd || '',
                // Laboratorios
                bilirrubinaTotalValor: record.bilirrubinaTotalValor || '',
                bilirrubinaDirectaValor: record.bilirrubinaDirectaValor || '',
                hematocritoValor: record.hematocritoValor || '',
                // Datos de egreso
                fechaEgreso: record.fechaEgreso || '',
                horaEgreso: record.horaEgreso || '',
                pesoEgreso: record.pesoEgreso || '',
                evolucionInternacion: record.evolucionInternacion || '',
                diagnosticos: record.diagnosticos || '',
                indicacionesEgreso: record.indicacionesEgreso || '',
                observaciones: record.observaciones || '',
                enfermeraEgreso: record.enfermeraEgreso || '',
                neonatologoEgreso: record.neonatologoEgreso || ''
              };
              
              // Update the record
              store.put(updatedRecord);
            });
          };
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Base de datos inicializada correctamente');
        resolve(true);
      };

      request.onerror = (event) => {
        console.error('Error al abrir la base de datos:', (event.target as IDBOpenDBRequest).error);
        reject(false);
      };
    });
  }

  async agregarPaciente(paciente: Omit<Paciente, 'id' | 'createdAt'>): Promise<number> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const nuevoPaciente: Omit<Paciente, 'id'> = {
        ...paciente,
        createdAt: Date.now()
      };
      
      const request = store.add(nuevoPaciente);
      
      request.onsuccess = (event) => {
        const id = (event.target as IDBRequest<number>).result;
        resolve(id);
      };
      
      request.onerror = (event) => {
        console.error('Error al agregar paciente:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async buscarPacientesPorNombre(query: string): Promise<Paciente[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      const resultados: Paciente[] = [];
      
      query = query.toLowerCase().trim();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          const paciente = cursor.value as Paciente;
          const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`.toLowerCase();
          
          if (query === '' || nombreCompleto.includes(query) || 
              paciente.numeroHistoriaClinica.toLowerCase().includes(query)) {
            resultados.push(paciente);
          }
          
          cursor.continue();
        } else {
          resolve(resultados);
        }
      };
      
      request.onerror = (event) => {
        console.error('Error al buscar pacientes:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async obtenerPacientePorId(id: number): Promise<Paciente | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = (event) => {
        const paciente = (event.target as IDBRequest<Paciente>).result;
        resolve(paciente || null);
      };
      
      request.onerror = (event) => {
        console.error('Error al obtener paciente:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async actualizarPaciente(paciente: Paciente): Promise<boolean> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(paciente);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error al actualizar paciente:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }
}

// Singleton para asegurar una sola instancia de la base de datos
const dbService = new DBService();
export { dbService, type Paciente };

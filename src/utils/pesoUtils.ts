export const calcularPorcentajeDiferenciaPeso = (paciente: { peso?: string; pesoEgreso?: string }) => {
    if (!paciente?.peso || !paciente?.pesoEgreso) return '-';
    
    try {
      const pesoNacimiento = parseFloat(paciente.peso);
      const pesoEgreso = parseFloat(paciente.pesoEgreso);
      
      if (isNaN(pesoNacimiento) || isNaN(pesoEgreso) || pesoNacimiento === 0) {
        return 'Error en cálculo';
      }
      
      const porcentaje = ((pesoEgreso * 100) / pesoNacimiento) - 100;
      return porcentaje.toFixed(2) + '%';
    } catch (e) {
      return 'Error en cálculo';
    }
  };
  
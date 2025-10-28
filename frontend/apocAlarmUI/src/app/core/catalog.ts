export type InsurerKey = 'mundial'|'solidaria'|'previsora'|'coomeva';
export type RamoKey = 'soat'|'ape'|'ap'|'vida';

export const CATALOG = {
  mundial: {
    nombre: 'Seguros Mundial',
    ramos: {
      soat: {
        nombre: 'SOAT',
        amparos: {
          muerte: { nombre: 'Muerte y Gastos Funerarios', desc: 'Cobertura por fallecimiento y funerarios.' },
          incapacidad: { nombre: 'Incapacidad Permanente', desc: 'Incapacidad total y permanente.' },
          gastos: { nombre: 'Gastos Médicos, Quirúrgicos, Farmacéuticos y Hospitalarios', desc: 'Gastos derivados del siniestro.' }
        }
      },
      ape: { nombre: 'APE', amparos: {} },
      ap:  { nombre: 'AP',  amparos: {} },
      vida:{ nombre: 'VIDA',amparos: {} }
    }
  },
  solidaria: { nombre: 'Solidaria', ramos: {} },
  previsora: { nombre: 'Previsora', ramos: {} },
  coomeva:   { nombre: 'Coomeva',   ramos: {} }
} as const;

export type MentalStateId = 'bersemangat' | 'cukup_baik' | 'biasa_saja' | 'agak_lelah' | 'benar_benar_lelah';

export interface MentalState {
  id: MentalStateId;
  icon: string;
  label: string;
  response: string;
}

export const mentalStates: MentalState[] = [
  {
    id: 'bersemangat',
    icon: '☀️',
    label: 'Aku sedang bersemangat',
    response: 'Bagus.\nKalau begitu, mari kita manfaatkan energi ini dengan baik.'
  },
  {
    id: 'cukup_baik',
    icon: '🙂',
    label: 'Aku cukup baik',
    response: 'Senang mendengarnya.\nMari kita lihat apa yang perlu kita hadapi hari ini.'
  },
  {
    id: 'biasa_saja',
    icon: '😐',
    label: 'Aku biasa saja',
    response: 'Tidak apa-apa.\nKita tidak perlu merasa luar biasa untuk tetap melangkah.'
  },
  {
    id: 'agak_lelah',
    icon: '🌧️',
    label: 'Aku agak lelah',
    response: 'Aku mengerti.\nKita tidak perlu memaksakan semuanya hari ini.'
  },
  {
    id: 'benar_benar_lelah',
    icon: '🌙',
    label: 'Aku benar-benar lelah',
    response: 'Kalau begitu, kita pelan-pelan dulu.\nAku akan membantumu mencari apa yang benar-benar penting.'
  }
];

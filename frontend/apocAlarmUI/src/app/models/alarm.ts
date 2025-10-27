export type AlarmSeverity = 'Low' | 'Medium' | 'High';

export interface Alarm {
  id: string;
  title: string;
  description: string;
  severity: AlarmSeverity;
  createdAt: string;
  acknowledged: boolean;
}

export const formatStatus = (status: string | undefined | null) => 
  status ? status.replace('_', ' ') : 'Unknown';

export const getStatusStyles = (status: string) => ({
  backgroundColor: '#e0f7fa',
  color: '#00796b',
  padding: '4px 10px',
  borderRadius: '12px',
  textAlign: 'center',
  textTransform: 'capitalize',
});

export const getProviderColor = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'aws':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'azure':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'gcp':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

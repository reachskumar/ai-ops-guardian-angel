
export interface NetworkConnection {
  id: string;
  name: string;
  sourceProvider: string;
  targetProvider: string;
  status: 'connected' | 'connecting' | 'failed';
  type: string;
  bandwidth: string;
  latency: string;
}

export const mockConnections: NetworkConnection[] = [
  {
    id: '1',
    name: 'AWS-Azure-Primary',
    sourceProvider: 'aws',
    targetProvider: 'azure',
    status: 'connected',
    type: 'site-to-site-vpn',
    bandwidth: '1 Gbps',
    latency: '25ms'
  },
  {
    id: '2',
    name: 'Azure-GCP-Backup',
    sourceProvider: 'azure',
    targetProvider: 'gcp',
    status: 'connected',
    type: 'direct-connect',
    bandwidth: '500 Mbps',
    latency: '18ms'
  },
  {
    id: '3',
    name: 'AWS-GCP-Data',
    sourceProvider: 'aws',
    targetProvider: 'gcp',
    status: 'connecting',
    type: 'vpn-gateway',
    bandwidth: '2 Gbps',
    latency: '32ms'
  }
];

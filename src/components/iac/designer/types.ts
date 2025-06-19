
export interface ResourceNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
  connections: string[];
}

export interface Connection {
  from: string;
  to: string;
  type: 'network' | 'data' | 'dependency';
}

export interface ResourceType {
  type: string;
  label: string;
  icon: any;
  color: string;
}

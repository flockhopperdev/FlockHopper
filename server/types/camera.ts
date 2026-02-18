export interface ALPRCamera {
  osmId: number;
  osmType: 'node' | 'way';
  lat: number;
  lon: number;
  operator?: string;
  brand?: string;
  model?: string;
  direction?: number;
  directionCardinal?: string;
  surveillanceZone?: 'traffic' | 'town' | 'parking' | 'other';
  mountType?: 'pole' | 'wall' | 'street_light' | 'other';
  ref?: string;
  startDate?: string;
}

export interface CameraOnRoute {
  camera: ALPRCamera;
  distanceFromRoute: number;
  nearestRoutePoint: [number, number];
  isFacingRoute: boolean;
}

export interface CameraFilters {
  operators: string[];
  brands: string[];
  showAll: boolean;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

export interface OverpassElement {
  type: 'node' | 'way';
  id: number;
  lat: number;
  lon: number;
  tags?: {
    'man_made'?: string;
    'surveillance:type'?: string;
    'operator'?: string;
    'brand'?: string;
    'manufacturer'?: string;
    'direction'?: string;
    'camera:direction'?: string;
    'surveillance:zone'?: string;
    'camera:mount'?: string;
    'ref'?: string;
    'start_date'?: string;
    [key: string]: string | undefined;
  };
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  graphhopperEndpoint: process.env.GRAPHHOPPER_ENDPOINT || 'http://localhost:8989',
  cameraDataPath: process.env.CAMERA_DATA_PATH || '../public/cameras-us.json',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(','),
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

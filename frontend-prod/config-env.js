const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envConfig = process.env;

const envConfigFile = `
export const environment = {
  production: ${process.env.NODE_ENV === 'production'},
  prodUrl: '${envConfig.PROD_URL || ''}',
  jwtKey: '${envConfig.JWT_KEY || ''}',
  // Add other variables as needed
};
`;

fs.writeFileSync('./src/environments/environment.ts', envConfigFile);
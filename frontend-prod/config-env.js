const fs = require('fs');
const dotenv = require('dotenv').config();

const envConfigFile = `
export const environment = {
  production: ${process.env.NODE_ENV === 'production'},
  prodUrl: '${process.env.PROD_URL || ''}',
  jwtKey: '${process.env.JWT_KEY || ''}',
  // Add other variables as needed
};
`;

fs.writeFileSync('./src/environments/environment.ts', envConfigFile);
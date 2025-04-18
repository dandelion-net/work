const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SQLITE_URL = 'file:./dev.db';
const DEFAULT_PG_URL = 'postgresql://postgres:postgres@localhost:5432/p2p_network';

const PROVIDER_CONFIG = {
  sqlite: {
    provider: 'sqlite',
  },
  postgres: {
    provider: 'postgresql',
  }
};

function generateSchemaContent(type) {
  const templatePath = path.join(__dirname, 'schema.template.prisma');
  const modelsDir = path.join(__dirname, '..', 'prisma', 'models');
  
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: ${templatePath} does not exist`);
    process.exit(1);
  }

  // Read template schema
  let schemaContent = fs.readFileSync(templatePath, 'utf8');
  
  // Replace provider placeholder
  schemaContent = schemaContent.replace('{{provider}}', PROVIDER_CONFIG[type].provider);

  // Read and append all model files
  const modelFiles = fs.readdirSync(modelsDir);
  for (const file of modelFiles) {
    if (file.endsWith('.prisma')) {
      const modelContent = fs.readFileSync(path.join(modelsDir, file), 'utf8');
      schemaContent += '\n\n' + modelContent;
    }
  }

  return schemaContent;
}

function updateSchema(type) {
  const schemaContent = generateSchemaContent(type);
  const destPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  fs.writeFileSync(destPath, schemaContent);
}

function getCurrentDb() {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const providerMatch = schema.match(/provider\s*=\s*"([^"]+)"/);
  return providerMatch ? providerMatch[1] === 'postgresql' ? 'postgres' : providerMatch[1] : null;
}

function main() {
  const command = process.argv[2];
  
  if (command === 'status') {
    const currentDb = getCurrentDb();
    console.log(`Current database provider: ${currentDb}`);
    return;
  }
  
  if (!['sqlite', 'postgres'].includes(command)) {
    console.error('Usage: node switch-db.js [sqlite|postgres|status]');
    process.exit(1);
  }
  
  try {
    updateSchema(command);
    console.log(`Switched to ${command === 'postgres' ? 'PostgreSQL' : 'SQLite'} database`);
    
    // Generate Prisma client with new schema
    execSync('npm run prisma:generate', { stdio: 'inherit' });
    console.log('Prisma client generated successfully');
    
  } catch (error) {
    console.error('Error switching database:', error.message);
    process.exit(1);
  }
}

main();
const bcrypt = require('bcryptjs');
const mysql2 = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'construction_portal',
};

async function seed() {
  let conn;
  try {
    conn = await mysql2.createConnection(dbConfig);
    console.log('Connected to MySQL');

    // Clear existing data
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    await conn.execute('TRUNCATE TABLE documents');
    await conn.execute('TRUNCATE TABLE tasks');
    await conn.execute('TRUNCATE TABLE projects');
    await conn.execute('TRUNCATE TABLE users');
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleared existing data');

    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const clientHash = await bcrypt.hash('client123', 10);

    // Insert users
    const [adminResult] = await conn.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@portal.com', adminHash, 'admin']
    );
    const adminId = adminResult.insertId;

    const [clientResult] = await conn.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['John Smith', 'client@portal.com', clientHash, 'client']
    );
    const clientId = clientResult.insertId;

    console.log(`Created users: admin (id=${adminId}), client (id=${clientId})`);

    // Insert projects
    const [proj1] = await conn.execute(
      `INSERT INTO projects (project_name, description, status, progress_percentage, start_date, expected_completion, client_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Downtown Office Renovation',
        'Full renovation of a 5-story office building including structural reinforcement, interior redesign, and modern amenity installation.',
        'in_progress', 65,
        '2025-01-15', '2025-08-30',
        clientId,
      ]
    );

    const [proj2] = await conn.execute(
      `INSERT INTO projects (project_name, description, status, progress_percentage, start_date, expected_completion, client_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Riverside Residential Complex',
        'Construction of a 12-unit residential complex along the riverside with private parking and shared amenities.',
        'planning', 15,
        '2025-03-01', '2026-06-15',
        clientId,
      ]
    );

    const [proj3] = await conn.execute(
      `INSERT INTO projects (project_name, description, status, progress_percentage, start_date, expected_completion, client_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Warehouse Expansion - Phase 2',
        'Expansion of existing warehouse facility with a new 10,000 sq ft wing, loading docks, and upgraded electrical systems.',
        'completed', 100,
        '2024-06-01', '2025-01-10',
        clientId,
      ]
    );

    const proj1Id = proj1.insertId;
    const proj2Id = proj2.insertId;
    const proj3Id = proj3.insertId;

    console.log(`Created projects: ${proj1Id}, ${proj2Id}, ${proj3Id}`);

    // Insert tasks
    await conn.execute(
      'INSERT INTO tasks (title, description, project_id, status) VALUES (?, ?, ?, ?)',
      ['Structural assessment completed', 'Initial structural review by certified engineer', proj1Id, 'completed']
    );
    await conn.execute(
      'INSERT INTO tasks (title, description, project_id, status) VALUES (?, ?, ?, ?)',
      ['Electrical rewiring - floors 1-3', 'Replace all wiring on first three floors to meet current code', proj1Id, 'in_progress']
    );
    await conn.execute(
      'INSERT INTO tasks (title, description, project_id, status) VALUES (?, ?, ?, ?)',
      ['Interior drywall installation', 'Install drywall throughout all office spaces', proj1Id, 'pending']
    );
    await conn.execute(
      'INSERT INTO tasks (title, description, project_id, status) VALUES (?, ?, ?, ?)',
      ['Site survey and soil testing', 'Complete geotechnical survey before breaking ground', proj2Id, 'completed']
    );
    await conn.execute(
      'INSERT INTO tasks (title, description, project_id, status) VALUES (?, ?, ?, ?)',
      ['Permit applications submitted', 'File all required municipal building permits', proj2Id, 'in_progress']
    );

    console.log('Created 5 tasks');

    // Insert sample document records (no actual files)
    await conn.execute(
      'INSERT INTO documents (project_id, file_name, file_path) VALUES (?, ?, ?)',
      [proj1Id, 'Structural_Report_2025.pdf', 'sample-structural-report.pdf']
    );
    await conn.execute(
      'INSERT INTO documents (project_id, file_name, file_path) VALUES (?, ?, ?)',
      [proj3Id, 'Project_Completion_Certificate.pdf', 'sample-completion-cert.pdf']
    );

    console.log('Created 2 document records');

    console.log('\nSeed completed successfully!');
    console.log('----------------------------');
    console.log('Admin: admin@portal.com / admin123');
    console.log('Client: client@portal.com / client123');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

seed();

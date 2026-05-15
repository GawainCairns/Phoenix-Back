const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'Phoenixdb';

async function setup() {
  // Connect without specifying a database first
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
  });

  console.log('Connected to MySQL.');

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci`);
  console.log(`Database \`${DB_NAME}\` ready.`);

  await conn.query(`USE \`${DB_NAME}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) DEFAULT NULL,
      \`email\` varchar(100) DEFAULT NULL,
      \`password\` varchar(255) DEFAULT NULL,
      \`role\` varchar(20) DEFAULT 'user',
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Table `users` ready.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`surveys\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) DEFAULT NULL,
      \`discription\` varchar(2000) DEFAULT NULL,
      \`creator\` int NOT NULL,
      \`s_code\` varchar(64) NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uniq_s_code\` (\`s_code\`),
      CHECK (CHAR_LENGTH(\`s_code\`) >= 10)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Table `surveys` ready.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`questions\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`survey_id\` INT NOT NULL,
      \`question\` VARCHAR(500) NOT NULL,
      \`type\` VARCHAR(100) NOT NULL DEFAULT 'text',
      PRIMARY KEY (\`id\`),
      KEY \`idx_survey_id\` (\`survey_id\`),
      CONSTRAINT \`fk_questions_survey\` FOREIGN KEY (\`survey_id\`) REFERENCES \`surveys\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Table `questions` ready.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`answers\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`question_id\` INT NOT NULL,
      \`answer\` VARCHAR(1000) DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_question_id\` (\`question_id\`),
      CONSTRAINT \`fk_answers_question\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Table `answers` ready.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`responses\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`survey_id\` INT NOT NULL,
      \`question_id\` INT NOT NULL,
      \`answer\` VARCHAR(500) NOT NULL,
      \`responder_id\` INT NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_survey_id\` (\`survey_id\`),
      KEY \`idx_question_id\` (\`question_id\`),
      CONSTRAINT \`fk_responses_question\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`fk_responses_survey\` FOREIGN KEY (\`survey_id\`) REFERENCES \`surveys\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Table `responses` ready.');

  await conn.end();
  console.log('\nDatabase setup complete.');
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});

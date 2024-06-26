-- Создание базы данных
CREATE DATABASE --your_database_name;

-- Подключение к созданной базе данных
\c --your_database_name;

-- Создание таблиц
CREATE TABLE Users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role_id INT REFERENCES Roles(role_id) ON DELETE SET NULL
);

CREATE TABLE Projects (
  project_id SERIAL PRIMARY KEY,
  project_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INT REFERENCES Users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_id INT REFERENCES Project_Statuses(status_id) ON DELETE SET NULL
);

CREATE TABLE Tasks (
  task_id SERIAL PRIMARY KEY,
  task_name VARCHAR(100) NOT NULL,
  description TEXT,
  project_id INT REFERENCES Projects(project_id) ON DELETE CASCADE,
  assigned_to INT REFERENCES Users(user_id) ON DELETE SET NULL,
  created_by INT REFERENCES Users(user_id) ON DELETE SET NULL,
  priority_id INT REFERENCES Task_Priorities(priority_id) ON DELETE SET NULL;
  due_date TIMESTAMP,
  status VARCHAR(20)
);

CREATE TABLE Teams (
  team_id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL,
  created_by INT REFERENCES Users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Users_Teams (
  user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
  team_id INT REFERENCES Teams(team_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, team_id)
);

CREATE TABLE Task_Comments (
  comment_id SERIAL PRIMARY KEY,
  task_id INT REFERENCES Tasks(task_id) ON DELETE CASCADE,
  user_id INT REFERENCES Users(user_id) ON DELETE SET NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Task_Priorities (
  priority_id SERIAL PRIMARY KEY,
  priority_name VARCHAR(20) NOT NULL
);

CREATE TABLE Project_Statuses (
  status_id SERIAL PRIMARY KEY,
  status_name VARCHAR(20) NOT NULL
);

CREATE TABLE Roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(20) NOT NULL UNIQUE
);
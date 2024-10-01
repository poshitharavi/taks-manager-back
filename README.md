# Task Manager Backend Service

This is the backend for a Task Manager application, developed using **NestJS** with **Prisma** as the ORM and **PostgreSQL** as the database. It implements basic **JWT authentication** for securing the API routes.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```env
DATABASE_URL="postgresql://{{user}}:{{password}}@localhost:5432/taskManager?schema=public"
PORT=3000
```

Replace `{{user}}` and `{{password}}` with your PostgreSQL credentials.

### 2. Install Dependencies

To install the necessary packages, run the following command:

```bash
yarn
```

### 3. Set Up the Database

Push the database schema using Prisma by running:

```bash
yarn prisma db push
```

### 4. Start the Development Server

To start the development server, run:

```bash
yarn start:dev
```

For production, use:

```bash
yarn start:prod
```

## API Documentation

To check if the server is running, visit:

```
http://localhost:3000/api
```

### User Endpoints

- **Register**: `POST /api/user/register`

  Example request body:

  ```json
  {
    "name": "Sample",
    "email": "sample@gmail.com",
    "password": "1234"
  }
  ```

- **Login**: `POST /api/user/login`

  Example request body:

  ```json
  {
    "email": "sample@gmail.com",
    "password": "1234"
  }
  ```

### Task Endpoints

All task-related endpoints require the JWT token to be passed as a Bearer token in the request headers.

- **Create Task**: `POST /api/task/save`

  Example request body:

  ```json
  {
    "title": "Sample Title",
    "priority": "medium",
    "dueDate": "2024-10-01"
  }
  ```

- **Update Task**: `PATCH /api/task/update/:id`

  Example request body:

  ```json
  {
    "title": "Sample Title",
    "priority": "medium",
    "dueDate": "2024-10-02",
    "status": "completed"
  }
  ```

- **Get Task by ID**: `GET /api/task/details/:id`

- **Get All Tasks**: `GET /api/task/all`

- **Delete Task**: `DELETE /api/task/delete/:id`

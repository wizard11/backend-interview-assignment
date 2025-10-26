# Dropbox-like File Management Service

A NestJS-based backend service that provides Dropbox-like functionality including file storage, folder organization, user groups, and file sharing capabilities.

## Features

- **User Management**: Create, read, update, and delete users
- **File Management**: Upload, download, and organize files
- **Folder Management**: Create hierarchical folder structures
- **User Groups**: Create and manage user groups for collaboration
- **File Sharing**: Share files with users or groups with different permissions
- **Billing Module**: Manages end of month billing (structure ready)

## Tech Stack

- **Framework**: NestJS 9.x
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT-based (structure ready, simplified in current schema)
- **File Upload**: Multer for file handling
- **Validation**: class-validator and class-transformer

## Project Structure

```
src/
├── auth/                 # Authentication guards and strategies
├── user/                 # User management module
├── file-folder/          # File and folder operations
├── user-group/           # User group management
├── file-sharing/         # File sharing functionality
├── billing/              # Billing and subscriptions
├── prisma/              # Prisma service and configuration
└── main.ts              # Application entry point
```

## Database Schema

The application uses a MySQL database with the following main entities:

- **User**: Basic user information (id, email, firstName, lastName, avatar)
- **File**: File metadata and storage information
- **Folder**: Hierarchical folder structure
- **UserGroup**: Group management with owners and members
- **FileSharing**: Generic sharing system with entity-based permissions

## Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Setup environment variables:**
   Copy `.env` file and update database connection:

   ```bash
   DATABASE_URL="mysql://username:password@localhost:3306/dropbox_clone"
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   PORT=3000
   ```

3. **Setup database:**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init

   # (Optional) Seed database
   npx prisma db seed
   ```

4. **Start the application:**

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

## API Endpoints

### Users

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Files & Folders

- `POST /files-folders/files/upload` - Upload a file
- `GET /files-folders/files` - Get user's files
- `GET /files-folders/files/:id/download` - Download a file
- `POST /files-folders/folders` - Create a folder
- `GET /files-folders/folders` - Get user's folders
- `PATCH /files-folders/files/:id` - Update file metadata
- `DELETE /files-folders/files/:id` - Soft delete file

### User Groups

- `POST /user-groups` - Create a user group
- `GET /user-groups` - Get user's groups
- `GET /user-groups/:id` - Get group details
- `POST /user-groups/:id/members` - Add members to group
- `DELETE /user-groups/:id/members` - Remove members from group

## Development

### Database Operations

```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Configuration

Key configuration files:

- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables
- `nest-cli.json` - NestJS CLI configuration
- `tsconfig.json` - TypeScript configuration

## License

This project is [MIT licensed](LICENSE).

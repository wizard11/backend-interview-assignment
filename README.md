# Dropbox-like File Management Service

A NestJS-based backend service that provides Dropbox-like functionality including file storage, folder organization, user groups, and file sharing capabilities.

## Features

- **User Management**: Create, read, update, and delete users
- **File Management**: Upload, download, and organize files
- **Folder Management**: Create hierarchical folder structures
- **User Groups**: Create and manage user groups for collaboration
- **File Sharing**: Share files with users or groups with different permissions
- **Billing Module**: Manages end of month billing

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

- `POST /v1/users` - Create a new user
- `GET /v1/users` - Get all users
- `GET /v1/users/:id` - Get user by ID
- `PATCH /v1/users/:id` - Update user
- `DELETE /v1/users/:id` - Delete user

### Files & Folders

- `POST /v1/files` - Upload a file
- `GET /v1/files?folderId=randomid` - List files metadata
- `GET /v1/files/:id` - Get a file metadata
- `GET /v1/files/:id/download` - Download a file
- `DELETE /v1/files/:id` - delete file

- `POST /v1/folders` - Create a folder
- `GET /v1/folders?parentId=somefolder` - List folders metadata
- `GET /v1/folders/:id` - Get a folder metadata
- `DELETE /v1/folders/:id` - Delete folder

### User Groups

- `POST /v1/user-groups` - Create a user group
- `GET /v1/user-groups` - Get user's groups
- `GET /v1/user-groups/:id` - Get group details
- `POST /v1/user-groups/:id/members` - Add members to group
- `DELETE /v1/user-groups/:id/members` - Remove members from group

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

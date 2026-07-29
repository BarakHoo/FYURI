# FYURI - Docker + MySQL Setup Complete! נ³

## What's Been Added

### ג… MySQL Database Integration
- Entity Framework Core with MySQL provider
- Full database models with relationships
- Automatic database initialization and seeding
- 5 sample products with Hebrew translations

### ג… Docker Configuration
- **MySQL Container**: Database with persistent storage
- **Backend Container**: .NET 10 API
- **Frontend Container**: React app served by Nginx
- **Docker Compose**: Orchestrates all services

### ג… Controllers Updated
All controllers now use database instead of in-memory storage:
- ג… ProductsController - async EF Core operations
- ג… CartController - database-backed shopping cart
- ג… OrdersController - order persistence
- ג… ImagesController - file upload support

---

## נ€ Running with Docker

### Prerequisites
- **Docker Desktop** installed and running
- No other services on ports 3000, 5000, or 3306

### Quick Start

```powershell
# From the solution root (FYURI folder)
docker-compose up --build
```

That's it! The command will:
1. Build MySQL database container
2. Build .NET backend container  
3. Build React frontend container
4. Start all services
5. Initialize database with sample data

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MySQL Database**: localhost:3306

---

## נ›‘ Stopping Docker

```powershell
# Stop all containers (keeps data)
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

---

## נ”§ Development Mode (Without Docker)

If you prefer running without Docker:

### 1. Start MySQL Manually

**Option A: Use Docker for MySQL only**
```powershell
docker run --name fyuri_mysql -e MYSQL_ROOT_PASSWORD=root_password -e MYSQL_DATABASE=fyuri_db -e MYSQL_USER=fyuri_user -e MYSQL_PASSWORD=fyuri_password -p 3306:3306 -d mysql:8.0
```

**Option B: Install MySQL locally**
- Download MySQL 8.0 from https://dev.mysql.com/downloads/mysql/
- Create database: `fyuri_db`
- Create user: `fyuri_user` / `fyuri_password`

### 2. Run Database Migrations

```powershell
cd FYURI.Server
dotnet ef database update
```

### 3. Start Backend

```powershell
cd FYURI.Server
dotnet run
```

### 4. Start Frontend

```powershell
cd fyuri.client
npm run dev
```

Access: http://localhost:5173

---

## נ“¦ Database Schema

The following tables are created automatically:

- **Categories** - Product categories (Night Vision, Optics, etc.)
- **Products** - Night vision products with specs
- **CartItems** - Shopping cart (session-based)
- **OrderRequests** - Customer orders
- **OrderItems** - Individual items in orders

---

## נ—„ן¸ Seeded Data

The database initializes with:

### Categories (5)
1. Night Vision
2. Image Intensifier Tubes
3. Optics
4. Accessories
5. Spare Parts

### Products (5)
1. **BNVD-1431** - ג‚×8,500 (Gen 3, dual-tube)
2. **PVS-14** - ג‚×3,200 (Gen 3, monocular)
3. **BNVD-Barak** - ג‚×9,500 (Israeli, dual-tube)
4. **PVS-31** - ג‚×11,500 (Compact, dual-tube)
5. **AN/PVS-7** - ג‚×4,200 (Military standard)

All with full Hebrew translations and specifications.

---

## נ” Useful Docker Commands

```powershell
# View running containers
docker ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Restart a specific service
docker-compose restart backend

# Rebuild without cache
docker-compose build --no-cache

# Execute command in running container
docker exec -it fyuri_backend bash
docker exec -it fyuri_mysql mysql -u fyuri_user -p fyuri_db
```

---

## נ“ Database Management

### Connect to MySQL

```powershell
# Using Docker exec
docker exec -it fyuri_mysql mysql -u fyuri_user -p
# Password: fyuri_password

# Or use MySQL Workbench
Host: localhost
Port: 3306
User: fyuri_user
Password: fyuri_password
Database: fyuri_db
```

### View Tables

```sql
USE fyuri_db;
SHOW TABLES;
SELECT * FROM Products;
SELECT * FROM Categories;
SELECT * FROM OrderRequests;
```

---

## נ“¸ Image Upload

Images are stored in `/app/wwwroot/images/products` inside the container.

- Upload endpoint: `POST /api/images/upload`
- Delete endpoint: `DELETE /api/images?url=/images/products/filename.jpg`
- Max size: 5MB
- Allowed types: jpg, jpeg, png, gif, webp

---

## נ¨ Troubleshooting

### Port Already in Use

If ports 3000, 5000, or 3306 are busy, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change frontend port
  - "6000:8080"  # Change backend port
  - "3307:3306"  # Change MySQL port
```

### Database Connection Failed

Wait a few seconds for MySQL to fully start. The backend has a health check and will retry.

### Build Failed

```powershell
# Clean Docker cache and rebuild
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Cannot See Products

1. Check backend logs: `docker-compose logs backend`
2. Verify database connection
3. Ensure migrations ran: Check for tables in MySQL

---

## נ¯ Next Steps

### Production Deployment

1. **Environment Variables**: Use proper secrets management
2. **HTTPS**: Add SSL certificates (Let's Encrypt)
3. **Domain Names**: Update CORS and nginx config
4. **Database Backups**: Set up automated backups
5. **Monitoring**: Add logging and monitoring tools

### Add More Products

Use the admin panel (coming soon) or direct database inserts:

```sql
INSERT INTO Products (Name, NameHebrew, Sku, Price, CategoryId, InStock, StockQuantity, IsActive) 
VALUES ('New Product', '׳׳•׳¦׳¨ ׳—׳“׳©', 'NEW-001', 1500.00, 1, 1, 10, 1);
```

### Email Configuration

Update `appsettings.json` with SMTP details:

```json
"EmailSettings": {
  "AdminEmail": "your-admin@example.com",
  "SmtpServer": "smtp.gmail.com",
  "SmtpPort": 587,
  "SmtpUsername": "your-email@gmail.com",
  "SmtpPassword": "your-app-password"
}
```

---

## נ“ Migration Commands (For Development)

```powershell
# Create new migration
cd FYURI.Server
dotnet ef migrations add MigrationName

# Apply migrations to database
dotnet ef database update

# Remove last migration (if not applied)
dotnet ef migrations remove

# View migration SQL
dotnet ef migrations script
```

---

## ג¨ Summary

You now have a complete Dockerized e-commerce platform with:

ג… MySQL database for data persistence
ג… Entity Framework Core with migrations
ג… Docker containerization for easy deployment
ג… Automatic database seeding
ג… Image upload functionality
ג… Hebrew/RTL support
ג… Admin email notifications
ג… Production-ready architecture

Everything can be started with one command:
```
docker-compose up --build
```

Happy coding! נ€

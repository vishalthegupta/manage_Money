# Deployment Guide - Finance Management Application

Complete step-by-step guide to deploy your application using:
- **Vercel** for Frontend (React)
- **Render** for Backend (Spring Boot)
- **Supabase** for PostgreSQL Database

## Prerequisites

Before starting, ensure you have accounts on:
- [GitHub](https://github.com) (for code repository)
- [Vercel](https://vercel.com) (for frontend deployment)
- [Render](https://render.com) (for backend deployment)
- [Supabase](https://supabase.com) (for PostgreSQL database)

---

## Phase 1: Prepare Your Code Repository

### 1.1 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `finance-management-app`
3. Initialize with README (optional)
4. Clone the repository locally or push your existing code

### 1.2 Organize Your Project Structure

Ensure your project structure looks like this:
```
finance-management-app/
├── manageMoney/                     # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── ...
├── manageMoney_frontend/            # React frontend
│   └── vite-project/
│       ├── src/
│       ├── package.json
│       └── ...
└── README.md
```

### 1.3 Push Code to GitHub

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

---

## Phase 2: Database Setup (Supabase)

### 2.1 Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click **"New Project"**
3. Choose your organization
4. Fill in project details:
   - **Name**: `finance-management-db`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait for project initialization (2-3 minutes)

### 2.2 Get Database Connection Details

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Note down these details:
   - **Host**: `db.xxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (the one you created)

### 2.3 Configure Database URL

Create the JDBC URL format:
```
jdbc:postgresql://db.xxx.supabase.co:5432/postgres?user=postgres&password=YOUR_PASSWORD&sslmode=require
```

### 2.4 Test Connection (Optional)

You can test the connection using a PostgreSQL client or by running your Spring Boot app locally with the new database URL.

---

## Phase 3: Backend Deployment (Render)

### 3.1 Prepare Spring Boot Application

#### Update `application.yml` for Production

Create `src/main/resources/application-prod.yml`:

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    database-platform: org.hibernate.dialect.PostgreSQLDialect
  
  profiles:
    active: prod

server:
  port: ${PORT:8080}

# CORS configuration for production
cors:
  allowed-origins: ${FRONTEND_URL:https://your-app.vercel.app}

# JWT Configuration
jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000
```

#### Update CORS Configuration

In your Spring Boot CORS configuration class, update to use environment variable:

```java
@CrossOrigin(origins = "${cors.allowed-origins}")
```

Or in your WebConfig:

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
            .allowedOrigins(System.getenv("FRONTEND_URL"))
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
}
```

### 3.2 Create Render Service

1. Go to [Render](https://render.com)
2. Connect your GitHub account
3. Click **"New"** → **"Web Service"**
4. Select your repository
5. Configure the service:

   **Basic Settings:**
   - **Name**: `finance-management-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `manageMoney`
   - **Runtime**: `Java`

   **Build & Deploy:**
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/manageMoney-0.0.1-SNAPSHOT.jar`

   **Advanced Settings:**
   - **Auto-Deploy**: Yes

### 3.3 Configure Environment Variables

In Render, go to **Environment** tab and add:

```
DATABASE_URL=jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require
DB_USERNAME=postgres
DB_PASSWORD=your_supabase_password
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
FRONTEND_URL=https://your-app.vercel.app
SPRING_PROFILES_ACTIVE=prod
```

### 3.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://finance-management-backend.onrender.com`

---

## Phase 4: Frontend Deployment (Vercel)

### 4.1 Update Frontend Configuration

#### Update API Configuration

Edit `src/config/api.js`:

```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8080',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://finance-management-backend.onrender.com', // Your Render URL
    timeout: 15000,
  },
  staging: {
    baseURL: 'https://finance-management-backend.onrender.com',
    timeout: 12000,
  }
};
```

#### Create Environment Files

Create `.env.production` in your frontend project root:

```env
VITE_API_BASE_URL=https://finance-management-backend.onrender.com
VITE_APP_ENV=production
```

Update your `api.js` to use environment variables:

```javascript
const getCurrentEnvironment = () => {
  if (import.meta.env.PROD) {
    return 'production';
  } else if (import.meta.env.MODE === 'staging') {
    return 'staging';
  }
  return 'development';
};

// Alternative: Use environment variable directly
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

### 4.2 Create Vercel Project

1. Go to [Vercel](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure project:

   **Framework Preset**: Vite
   **Root Directory**: `manageMoney_frontend/vite-project`
   **Build Command**: `npm run build`
   **Output Directory**: `dist`
   **Install Command**: `npm install`

### 4.3 Configure Environment Variables

In Vercel project settings, add environment variables:

```
VITE_API_BASE_URL=https://finance-management-backend.onrender.com
VITE_APP_ENV=production
```

### 4.4 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Note your frontend URL: `https://your-app.vercel.app`

### 4.5 Update Backend CORS

Go back to Render and update the `FRONTEND_URL` environment variable with your actual Vercel URL:

```
FRONTEND_URL=https://your-app.vercel.app
```

---

## Phase 5: Final Configuration & Testing

### 5.1 Update CORS in Backend

Make sure your backend accepts requests from your Vercel domain. Redeploy backend if needed.

### 5.2 Test the Application

1. Visit your Vercel URL
2. Test user registration
3. Test login
4. Test all CRUD operations (Income, Expenses, Investments, Loans)
5. Check browser console for any errors

### 5.3 Set up Custom Domain (Optional)

#### For Vercel:
1. Go to project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

#### For Render:
1. Go to service settings → Custom Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Phase 6: Monitoring & Maintenance

### 6.1 Set up Monitoring

#### Render:
- Monitor logs in Render dashboard
- Set up alerts for service downtime

#### Vercel:
- Monitor analytics in Vercel dashboard
- Set up monitoring for performance

#### Supabase:
- Monitor database usage
- Set up backups

### 6.2 Environment Variables Summary

**Backend (Render):**
```
DATABASE_URL=jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require
DB_USERNAME=postgres
DB_PASSWORD=your_supabase_password
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
FRONTEND_URL=https://your-app.vercel.app
SPRING_PROFILES_ACTIVE=prod
```

**Frontend (Vercel):**
```
VITE_API_BASE_URL=https://finance-management-backend.onrender.com
VITE_APP_ENV=production
```

---

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
   - Check CORS configuration in Spring Boot

2. **Database Connection Issues**:
   - Verify Supabase credentials
   - Check if SSL is required (`sslmode=require`)

3. **Build Failures**:
   - Check build logs in Render/Vercel
   - Ensure all dependencies are in `package.json`/`pom.xml`

4. **API Not Responding**:
   - Check if backend service is running in Render
   - Verify environment variables are set correctly

5. **Frontend Not Loading**:
   - Check build logs in Vercel
   - Verify build command and output directory

### Useful Commands:

```bash
# Test backend locally with production DB
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# Test frontend build locally
npm run build
npm run preview

# Check environment variables
echo $DATABASE_URL
```

---

## Security Checklist

- [ ] JWT secret is strong and unique
- [ ] Database password is strong
- [ ] CORS is configured correctly
- [ ] Environment variables are set securely
- [ ] HTTPS is enabled (automatic with Vercel/Render)
- [ ] Database connection uses SSL

---

## Next Steps After Deployment

1. **Custom Domain**: Set up custom domains for better branding
2. **SSL Certificates**: Ensure HTTPS is working (should be automatic)
3. **Performance Monitoring**: Set up monitoring and alerts
4. **Backup Strategy**: Configure database backups
5. **CI/CD Pipeline**: Set up automated testing and deployment
6. **Documentation**: Update API documentation with production URLs

Your Finance Management application should now be fully deployed and accessible to users worldwide! 🚀
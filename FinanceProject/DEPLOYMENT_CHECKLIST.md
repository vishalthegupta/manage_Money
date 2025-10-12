# Deployment Checklist ✅

Use this checklist to ensure smooth deployment of your Finance Management application.

## Pre-Deployment Preparation

### Code Repository
- [ ] Code is committed and pushed to GitHub
- [ ] Project structure is organized (backend and frontend in separate folders)
- [ ] All dependencies are listed in package.json/pom.xml
- [ ] Environment files are created (.env.production for frontend)
- [ ] Production configuration files are created (application-prod.yml for backend)

### Accounts Setup
- [ ] GitHub account ready
- [ ] Supabase account created
- [ ] Render account created  
- [ ] Vercel account created

---

## Phase 1: Database (Supabase) ✅

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Connection details noted:
  - [ ] Host: `db.xxx.supabase.co`
  - [ ] Database: `postgres`
  - [ ] Port: `5432`
  - [ ] Username: `postgres`
  - [ ] Password: `[YOUR_PASSWORD]`
- [ ] JDBC URL formatted: `jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require`

---

## Phase 2: Backend (Render) ✅

### Service Configuration
- [ ] GitHub repository connected to Render
- [ ] Web Service created with settings:
  - [ ] Name: `finance-management-backend`
  - [ ] Root Directory: `manageMoney`  
  - [ ] Build Command: `./mvnw clean package -DskipTests`
  - [ ] Start Command: `java -jar target/manageMoney-0.0.1-SNAPSHOT.jar`

### Environment Variables Set
- [ ] `DATABASE_URL` = `jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require`
- [ ] `DB_USERNAME` = `postgres`
- [ ] `DB_PASSWORD` = `[YOUR_SUPABASE_PASSWORD]`
- [ ] `JWT_SECRET` = `[STRONG_32_CHAR_SECRET]`
- [ ] `FRONTEND_URL` = `https://your-app.vercel.app` (update after frontend deployment)
- [ ] `SPRING_PROFILES_ACTIVE` = `prod`

### Deployment
- [ ] Backend deployed successfully
- [ ] Backend URL noted: `https://[YOUR_SERVICE].onrender.com`
- [ ] Backend health check passes

---

## Phase 3: Frontend (Vercel) ✅

### Project Configuration  
- [ ] GitHub repository connected to Vercel
- [ ] Project settings configured:
  - [ ] Framework: Vite
  - [ ] Root Directory: `manageMoney_frontend/vite-project`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`

### Environment Variables Set
- [ ] `VITE_API_BASE_URL` = `https://[YOUR_BACKEND].onrender.com`
- [ ] `VITE_APP_ENV` = `production`

### Files Updated
- [ ] `.env.production` file updated with correct backend URL
- [ ] `src/config/api.js` updated to use environment variables

### Deployment
- [ ] Frontend deployed successfully  
- [ ] Frontend URL noted: `https://[YOUR_APP].vercel.app`
- [ ] Frontend loads without errors

---

## Phase 4: Integration & CORS ✅

### Backend CORS Update
- [ ] `FRONTEND_URL` environment variable updated in Render with actual Vercel URL
- [ ] Backend redeployed to apply CORS changes
- [ ] CORS configuration allows frontend domain

### Cross-Service Communication
- [ ] Frontend can communicate with backend
- [ ] API calls work from production frontend
- [ ] No CORS errors in browser console

---

## Phase 5: Testing ✅

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT token authentication works
- [ ] Logout functionality works

### Core Features
- [ ] Income CRUD operations work
- [ ] Expense CRUD operations work  
- [ ] Investment CRUD operations work
- [ ] Loan CRUD operations work
- [ ] Dashboard displays data correctly
- [ ] Profile management works

### Data Persistence
- [ ] Data saves to database
- [ ] Data persists after browser refresh
- [ ] Filters and search work correctly

---

## Phase 6: Final Checks ✅

### Performance
- [ ] Frontend loads quickly
- [ ] API responses are fast
- [ ] No console errors or warnings

### Security
- [ ] HTTPS enabled (automatic with Vercel/Render)
- [ ] JWT secret is secure and not exposed
- [ ] Database credentials are secure
- [ ] CORS is properly configured

### Monitoring
- [ ] Backend logs are accessible in Render
- [ ] Frontend analytics available in Vercel
- [ ] Database usage monitored in Supabase

---

## Important URLs & Credentials

### Production URLs
- **Frontend**: `https://[YOUR_APP].vercel.app`
- **Backend**: `https://[YOUR_BACKEND].onrender.com`
- **Database**: `db.xxx.supabase.co`

### Key Environment Variables
```bash
# Backend (Render)
DATABASE_URL=jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require
DB_USERNAME=postgres
DB_PASSWORD=[SUPABASE_PASSWORD]
JWT_SECRET=[32_CHAR_SECRET]
FRONTEND_URL=https://[YOUR_APP].vercel.app

# Frontend (Vercel)  
VITE_API_BASE_URL=https://[YOUR_BACKEND].onrender.com
VITE_APP_ENV=production
```

---

## Troubleshooting

### If something goes wrong:

1. **Check logs**:
   - Render: Service → Logs tab
   - Vercel: Functions → View Details
   - Supabase: Database → Logs

2. **Verify environment variables**:
   - All required variables are set
   - No typos in URLs or credentials
   - Values are correctly formatted

3. **Test locally first**:
   - Run backend with production database
   - Build frontend and test API calls

4. **Common fixes**:
   - Redeploy services after environment changes
   - Clear browser cache
   - Check CORS configuration

---

## Success! 🎉

When all items are checked, your Finance Management application should be:
- ✅ Fully deployed and accessible worldwide
- ✅ Using production database with SSL
- ✅ Properly configured for security
- ✅ Ready for users to register and manage their finances

**Next Steps**: Consider setting up custom domains, monitoring, and backup strategies!
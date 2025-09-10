# Backend Deployment to Vercel

## Prerequisites
- Vercel account
- GitHub repository

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare backend for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `backend` folder as the root directory
5. Vercel will auto-detect it as a Node.js project

### 3. Environment Variables
Add these environment variables in Vercel Dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://akhil7777:alan4444@studentcluster.wkf1foh.mongodb.net/StudentManagementSystem?retryWrites=true&w=majority&appName=StudentCluster
JWT_SECRET=your_super_secure_jwt_secret_change_this
JWT_EXPIRE=24h
EMAIL_FROM=akhilrock638362@gmail.com
EMAIL_PASSWORD=eovn ttwh pvuw gngb
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### 4. Important Notes
- Update `FRONTEND_URL` with your actual frontend Vercel URL
- Change `JWT_SECRET` to a secure random string for production
- The API will be available at: `https://your-backend-app.vercel.app`

### 5. Test Deployment
- Test the health endpoint: `https://your-backend-app.vercel.app/api/health`
- Verify CORS is working with your frontend

## File Structure
```
backend/
├── vercel.json          # Vercel configuration
├── index.js             # Entry point for Vercel
├── server.js           # Main server file
├── app.js              # Express app configuration
├── package.json        # Updated with engines field
└── .env.production     # Environment template
```

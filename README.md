# Designo Backend

## 🔧 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/designo
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start MongoDB:**
   - Cloud: Update `MONGODB_URI` in `.env` with your connection string

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001` (or your configured PORT).


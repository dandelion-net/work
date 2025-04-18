import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import topicRoutes from './routes/topics';
import vouchRoutes from './routes/vouches';
import voteRoutes from './routes/votes';

dotenv.config();

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/models/users', userRoutes);
  app.use('/api/models/topics', topicRoutes);
  app.use('/api/models/vouches', vouchRoutes);
  app.use('/api/votes', voteRoutes);

  return app;
}

if (require.main === module) {
  const app = createServer();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
// if (!PORT) {
//     throw new Error('PORT is not defined. Make sure your local npm scripts reference the .env file with --env-file=.env, or define PORT in your hosted environment settings.');
// }

import app from './app.js';
import { connectToDb } from './src/db/connect.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectToDb();
        console.log('successfully connected to the MongoDB!');
        
        app.listen(PORT, () => {
            console.log(`Server listening on port 127.0.0.1:${PORT}`);
        });
    } catch (error) {
        console.error('Database connection Failed:', error.message);
        process.exit(1);
    }
};

await startServer();
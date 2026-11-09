import express from 'express';
import './src/db/connect.js';

const app = express();

app.use(express.json());

// Homepage route
app.get('/', (req, res) => {
    // notification from Browser line-11
    console.log('HOMEPAGE ROUTE HAS BEEN REACHED');
    return res.status(200).json({ message: 'Server is running' });
});

// Get all trails from MongoDB (practice trails database 15-31)
// app.get('/trails', async (req, res) => {
//     // t.c
//     console.log('TRAILS ROUTE HAS BEEN REACHED');
//     try {
//         const trails = await getDb()
//         .collection('trails')
//         .find({})
//         .toArray();
        
//         return res.status(200).json(trails);

//     } catch (error) {
//         console.error('Failed to fetch trails:', error.message);
//         return res.status(500).json({ message: 'Failed to fetch trails' });
//     }
// });

export default app;
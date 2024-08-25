import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Define and initialize the connection pool
const masterPool = mysql.createPool({
    host: '',
    user: '',
    password: '****', // Use your actual password here
    database: '',
    port: '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test the connection
async function testConnection() {
    try {
        const connection = await masterPool.getConnection();
        console.log('Database connection successful');
        connection.release();
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

testConnection();

app.use(
    cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    socket.on('chat message', async (msg) => {
        const { id, text, sender, timestamp, status } = msg;
        const query =
            'INSERT INTO messages (id, text, sender, timestamp, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE text = VALUES(text), sender = VALUES(sender), timestamp = VALUES(timestamp), status = VALUES(status)';
        const values = [id, text, sender, timestamp, status];

        try {
            const [results] = await masterPool.query(query, values);
            console.log('Message saved to database:', results);
            io.emit('chat message', msg);
        } catch (err) {
            console.error('Error inserting message into database:', err);
            console.error('SQL Query:', query);
            console.error('SQL Values:', values);
        }
    });

    socket.on('status change', async ({ id, status }) => {
        const query = 'UPDATE messages SET status = ? WHERE id = ?';
        const values = [status, id];

        try {
            const [results] = await masterPool.query(query, values);
            console.log('Message status updated in database:', results);
            io.emit('status change', { id, status });
        } catch (err) {
            console.error('Error updating message status in database:', err);
        }
    });

    socket.on('request messages', async () => {
        const query = 'SELECT * FROM messages';

        try {
            const [rows] = await masterPool.query(query);
            socket.emit('messages', rows);
        } catch (err) {
            console.error('Error retrieving messages from database:', err);
            console.error('SQL Query:', query);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected: ' + socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

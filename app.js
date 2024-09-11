import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mysql from 'mysql2/promise';

import bcrypt from 'bcrypt'; // 해시 비교
import jwt from 'jsonwebtoken'; // 비밀번호 인증
//import { query } from './db'; // 데이터베이스 쿼리 함수

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// connection pool 초기화 및 정의
const masterPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '*****',
    database: 'chat_app',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// connection test 정보
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
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.use(express.json());
// 회원가입 처리
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [results] = await masterPool.query('INSERT INTO signup (username, email, password) VALUES (?, ?, ?)', [
            username,
            email,
            hashedPassword,
        ]);

        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        console.error('회원가입 처리 중 오류 발생:', error); // 오류 로그 출력
        res.status(500).json({ error: '회원가입 실패' });
    }
});

// 로그인 처리
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await masterPool.query('SELECT * FROM signup WHERE email = ?', [email]);
        const user = rows[0]; // 첫 번째 결과를 사용자로 할당

        if (user && (await bcrypt.compare(password, user.password))) {
            // 비밀번호가 일치할 경우 토큰 생성
            const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: '1h' });
            res.json({ token, id: user.id });
        } else {
            // 이메일 또는 비밀번호가 틀릴 경우
            res.status(401).json({ error: '잘못된 이메일 또는 비밀번호' });
        }
    } catch (error) {
        console.error('로그인 에러:', error); // 오류 로깅
        res.status(500).json({ error: '로그인 실패' });
    }
});

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    socket.on('chat message', async (msg) => {
        const { id, text, sender, timestamp, status, user_id } = msg; // user_id 추가
        // user_id를 정수형으로 변환
        const userId = parseInt(user_id, 10);

        if (isNaN(userId)) {
            console.error('Invalid user_id:', user_id);
            return;
        }

        const query = `
            INSERT INTO messages (id, text, sender, timestamp, status, user_id) 
            VALUES (?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                text = VALUES(text), 
                sender = VALUES(sender), 
                timestamp = VALUES(timestamp), 
                status = VALUES(status),
                user_id = VALUES(user_id)`;
        const values = [id, text, sender, timestamp, status, user_id]; // user_id 추가

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

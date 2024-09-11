<template>
    <div class="chat-container">
        <div class="message-list" ref="messageList">
            <ul>
                <li
                    v-for="msg in messages"
                    :key="msg.id"
                    :class="['message', msg.sender === userId ? 'me' : 'other']"
                    @click="selectedMessageId = selectedMessageId === msg.id ? null : msg.id"
                >
                    <div class="message-header">
                        <span class="message-sender">{{ msg.sender }}</span>
                        <span class="message-time">{{ msg.timestamp }}</span>
                    </div>
                    <span class="message-content">{{ msg.text }}</span>
                    <div v-if="msg.status" class="message-status">{{ msg.status }}</div>
                    <div v-if="selectedMessageId === msg.id" class="status-buttons">
                        <button @click="setMessageState(msg.id, '접수')" :disabled="msg.status === '접수'">접수</button>
                        <button @click="setMessageState(msg.id, '처리 중')" :disabled="msg.status === '처리 중'">
                            처리 중
                        </button>
                        <button @click="setMessageState(msg.id, '완료')" :disabled="msg.status === '완료'">완료</button>
                        <button @click="setMessageState(msg.id, '취소')" :disabled="msg.status === '취소'">취소</button>
                    </div>
                </li>
            </ul>
        </div>
        <form @submit.prevent="sendMessage">
            <input v-model="message" placeholder="Enter a message" />
            <input v-model="userId" placeholder="Your ID" />
            <button type="submit">Send</button>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { io } from 'socket.io-client';

const message = ref('');
const userId = ref(); // 로그인한 사용자의 user_id
const messages = ref([]);
const selectedMessageId = ref(null);
//const socket = io('http://localhost:5000/chatting');
const socket = io('http://localhost:5000', {
    // 서버 주소와 포트를 올바르게 지정합니다.
    transports: ['websocket'], // WebSocket을 우선적으로 사용하도록 설정
    withCredentials: true, // CORS 설정이 필요한 경우 추가
});

const messageList = ref(null);

const sendMessage = () => {
    if (!userId.value) {
        alert('Please enter your ID');
        return;
    }

    const timestamp = new Date().toLocaleTimeString(); // 현재 시간을 문자열로 포맷합니다.
    const id = Date.now(); // 각 메시지에 고유 id를 부여합니다.

    // Emit the message with a sender, id property, timestamp, and default status
    socket.emit('chat message', {
        id,
        text: message.value,
        sender: userId.value,
        timestamp,
        status: '',
        user_id: parseInt(userId.value, 10), // user_id 추가
    });
    message.value = '';
};

const scrollToBottom = () => {
    nextTick(() => {
        if (messageList.value) {
            messageList.value.scrollTop = messageList.value.scrollHeight;
        }
    });
};

const setMessageState = (id, state) => {
    const msg = messages.value.find((m) => m.id === id);
    if (msg && msg.status !== state) {
        // 상태가 변경된 경우만 전송
        msg.status = state;
        socket.emit('status change', { id, status: state });
    }
};

onMounted(() => {
    // 서버에 메시지 목록 요청
    socket.emit('request messages');

    // 서버로부터 메시지 목록 수신
    socket.on('messages', (msgs) => {
        console.log('Messages received from server:', msgs);
        messages.value = msgs;
        scrollToBottom();
    });

    socket.on('chat message', (msg) => {
        const existingMsg = messages.value.find((m) => m.id === msg.id);
        if (!existingMsg) {
            messages.value.push(msg);
        } else {
            Object.assign(existingMsg, msg); // 기존 메시지 업데이트
        }
        scrollToBottom();
    });

    socket.on('status change', ({ id, status }) => {
        const msg = messages.value.find((m) => m.id === id);
        if (msg) {
            msg.status = status; // 메시지 상태 업데이트
        }
    });
});

onUnmounted(() => {
    socket.off('chat message');
    socket.off('status change');
    socket.off('messages');
});
</script>

<style scoped>
.chat-container {
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #ddd;
    padding: 10px;
    display: flex;
    flex-direction: column;
    height: 400px;
    overflow: hidden;
}

.message-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.message-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.message-list li {
    padding: 10px;
    margin: 5px 0;
    border-radius: 10px;
    max-width: 70%;
    position: relative;
    word-wrap: break-word;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.message-list .me {
    background-color: #d1f7d6;
    align-self: flex-end;
    text-align: right;
    margin-left: auto;
}

.message-list .other {
    background-color: #f1f0f0;
    align-self: flex-start;
    text-align: left;
}

.message-content {
    display: block;
}

.message-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.8em;
    color: #888;
    margin-bottom: 5px;
}

.message-sender {
    font-weight: bold;
}

.message-time {
    font-style: italic;
}

.message-status {
    font-size: 0.8em;
    color: #555;
    margin-top: 5px;
}

form {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

input {
    flex: 1;
    padding: 5px;
}

button {
    padding: 5px 10px;
}

.status-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.status-buttons button {
    padding: 5px 10px;
    background-color: #04aa6d;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
}

.status-buttons button:nth-child(1) {
    background-color: #ff7e5f;
    color: white;
}

.status-buttons button:nth-child(1):hover {
    background-color: #ff6347;
}

.status-buttons button:nth-child(2) {
    background-color: #feb47b;
    color: white;
}

.status-buttons button:nth-child(2):hover {
    background-color: #ffa07a;
}

.status-buttons button:nth-child(3) {
    background-color: #86e3ce;
    color: white;
}

.status-buttons button:nth-child(3):hover {
    background-color: #66cdaa;
}

.status-buttons button:nth-child(4) {
    background-color: #e7e7e7;
    color: black;
}

.status-buttons button:nth-child(4):hover {
    background-color: #d3d3d3;
}
</style>

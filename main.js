import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 라우터 설정
import { io } from 'socket.io-client';
import { createPinia } from 'pinia'; // pinia

const socket = io('http://localhost:3000'); // 서버 URL에 맞게 조정

socket.on('connect', () => {
    console.log('Connected to socket server with ID:', socket.id);
});

// Pinia 생성
const pinia = createPinia();

const app = createApp(App);
app.config.globalProperties.$socket = socket;
app.use(router); // 라우터를 애플리케이션에 등록
app.use(pinia); // Pinia를 Vue 애플리케이션에 등록
app.mount('#app');

<template>
    <div class="auth-container">
        <h1>로그인</h1>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="login-email">이메일:</label>
                <input type="email" id="login-email" v-model="loginEmail" required />
                <p class="error-text">{{ errorEmail }}</p>
            </div>
            <div class="form-group">
                <label for="login-password">비밀번호:</label>
                <input type="password" id="login-password" v-model="loginPassword" required />
                <p class="error-text">{{ errorPassword }}</p>
            </div>
            <button type="submit" :disabled="!canLogin">로그인</button>
        </form>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // useRouter를 import
import { useUserStore } from '../data/user.js';

// store 호출
const userStore = useUserStore();
console.log('userStore.username:1', userStore.username);
    
// 라우터 객체 생성
const router = useRouter();

// 로그인 폼 상태
const loginEmail = ref('');
const loginPassword = ref('');

// 오류 메시지 상태
const errorEmail = ref('');
const errorPassword = ref('');

// 로그인 버튼 활성화 여부
const canLogin = computed(() => loginEmail.value && loginPassword.value);

const handleLogin = async () => {
    try {
        //  서버에서 로그인 요청을 하여 db 조회로 response로 id, token, username을 클라이언트로 전달한다
        //  클라이언트의 LoginView에서는 axios를 통해 이 응답 데이터를 받아오고,
        //  그 값을 Pinia store의 setUser를 이용해 상태로 저장한다.
        //  이후 ChatView에서는 Pinia store에 저장된 username을 가져와 
        //  화면에 표시하거나 채팅 메시지에 활용한다.
        
        const response = await axios.post(
            'http://localhost:5000/login',
            {
                email: loginEmail.value,
                password: loginPassword.value,
            },
            { withCredentials: true }
        );

        
        const { token, id, username } = response.data;
        console.log('response.data:', response.data);
        // localStorage는 브라우저 API입니다. 소규모 프로젝트에서는 사용할 수 있지만,
        // 보안에 취약하므로 실무에서는 HttpOnly Cookie 방식을 사용하는 것을 권장합니다.  (2026.07.06 추가)
        localStorage.setItem('token', response.data.token);

        localStorage.setItem('user_id', id);


        // store 또는 localStorage 에다 넣는다.
        userStore.setUser({ token, id, username });

        console.log('userStore.username:2', userStore.setUser.username);

        console.log('userStore.username:3', userStore.getUsername);


        
        alert('로그인 성공');
        // 로그인 성공 시 chatView로 이동
        router.push('/chat');

        loginEmail.value = '';
        loginPassword.value = '';
    } catch (error) {
        console.error('로그인 실패:', error);
        errorEmail.value = '이메일 또는 비밀번호가 잘못되었습니다.';
        errorPassword.value = '이메일 또는 비밀번호가 잘못되었습니다.';
        alert('로그인 실패');
    }
};
</script>

<style scoped>
.auth-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 1rem;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background-color: #0056b3;
}

.error-text {
    color: red;
    font-size: small;
    margin-top: 0.5rem;
}
</style>

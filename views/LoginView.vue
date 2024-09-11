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
        const response = await axios.post(
            'http://localhost:5000/login',
            {
                email: loginEmail.value,
                password: loginPassword.value,
            },
            { withCredentials: true }
        );

        console.log('response.data:', response.data);
        const { token, id } = response.data;
        localStorage.setItem('token', response.data.token);

        localStorage.setItem('user_id', id);

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

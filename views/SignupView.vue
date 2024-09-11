<template>
    <div class="auth-container">
        <h1>회원가입</h1>
        <form @submit.prevent="handleSignup">
            <div class="form-group">
                <label for="signup-username">사용자 이름:</label>
                <input type="text" id="signup-username" v-model="signup.username" required />
                <p class="error-text">{{ signup.errorUsername }}</p>
            </div>
            <div class="form-group">
                <label for="signup-email">이메일:</label>
                <input type="email" id="signup-email" v-model="signup.email" required />
                <p class="error-text">{{ signup.errorEmail }}</p>
            </div>
            <div class="form-group">
                <label for="signup-password">비밀번호:</label>
                <input type="password" id="signup-password" v-model="signup.password" required />
                <p class="error-text">{{ signup.errorPassword }}</p>
            </div>
            <div class="form-group">
                <label for="signup-password-confirm">비밀번호 확인:</label>
                <input type="password" id="signup-password-confirm" v-model="signup.passwordConfirm" required />
                <p class="error-text">{{ signup.errorPasswordConfirm }}</p>
            </div>
            <button type="submit" :disabled="!signup.canSignup">가입하기</button>
        </form>
        <p v-if="signup.message" :class="{ 'success-message': signup.isSuccess, 'error-message': !signup.isSuccess }">
            {{ signup.message }}
        </p>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useSignupStore } from '../store/signup.js';

const signup = useSignupStore();

const handleSignup = async () => {
    try {
        console.log('Sending signup request with data:', {
            username: signup.username,
            email: signup.email,
            password: signup.password,
            passwordConfirm: signup.passwordConfirm,
        });

        const response = await axios.post('http://localhost:5000/signup', {
            username: signup.username,
            email: signup.email,
            password: signup.password,
        });

        console.log('response:', response);

        // 서버로부터 성공적인 응답을 받았을 때
        signup.message = response.data.message || '회원가입이 완료되었습니다.';
        signup.isSuccess = true;

        // 입력 필드 초기화
        signup.username = '';
        signup.email = '';
        signup.password = '';
        signup.passwordConfirm = '';
    } catch (error) {
        // 오류가 발생했을 때
        if (error.response && error.response.data) {
            signup.message = error.response.data.message || '회원가입에 실패했습니다.';
        } else {
            signup.message = '회원가입에 실패했습니다.';
        }
        signup.isSuccess = false;
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

.success-message {
    color: green;
    font-size: small;
    margin-top: 0.5rem;
}

.error-message {
    color: red;
    font-size: small;
    margin-top: 0.5rem;
}
</style>

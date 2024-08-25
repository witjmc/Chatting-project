import { defineStore } from 'pinia';
import { fetchData } from './data'; // Ensure the path is correct;
import router from '../router';
import signup from '../views/HomeView.vue';

export const useSignupStore = defineStore('signup', {
    id: 'signup',

    state: () => ({
        email: '',
        password: '',
        passwordConfirm: '',
    }),

    getters: {
        errorEmail() {
            if (this.email.length == 0) return '이메일을 입력해주세요.';
            if (!checkEmail(this.email)) return '이메일 형식이 잘못되었습니다.';
            return '';
        },

        errorPassword() {
            if (this.password.length == 0) return '비밀번호를 입력해주세요.';
            if (this.password.length < 6) return '비밀번호는 6자 이상 입력해주세요.';
            return '';
        },

        errorPasswordConfirm() {
            if (this.passwordConfirm.length == 0) return '비밀번호를 입력해주세요.';
            if (this.passwordConfirm.length < 6) return '비밀번호는 6자 이상 입력해주세요.';
            if (this.passwordConfirm !== this.password) return '비밀번호가 일치하지 않습니다.';
            return '';
        },

        canSignup() {
            return (
                this.email != '' &&
                this.errorEmail === '' &&
                this.errorPassword === '' &&
                this.errorPasswordConfirm === ''
            );
        },
    },

    actions: {
        async submit() {
            const response = await signup.submit(this.$state);

            if (response.data.errorCode) {
                alert(response.data.errorMessage);
                return;
            }

            alert('회원가입이 완료되었습니다.');
            router.push({ path: '/' });
        },
    },
});

function checkEmail(email) {
    try {
        let pattern = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        return pattern.test(email);
    } catch (error) {
        return false;
    }
}

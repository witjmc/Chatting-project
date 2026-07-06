import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  //데이터 저장소
  state: () => ({
    user_id: null,
    username: ''
  }),


   getters: {
    isLoggedIn: (state) => {
      return !!state.user_id;
    },

    getUserId: (state) => state.user_id,

    getUsername: (state) => state.username,

    getToken: (state) => state.token,
  },


  //데이터를 바꾸는 함수
  actions: {
    setUser(user) {
      this.user_id = user.id;
      this.username = user.username;
      this.token = user.token;
    },

    logout() {
      this.user_id = null;
      this.username = '';
      this.token = '';
    },
  },
});

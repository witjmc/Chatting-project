프론트 : vue.js

           #  npm init vue 프로젝트명

  백서버 : node.js

           # npm install express socket.io moment

           # npm install socket.io-client

           # npm install cors 

  데이터베이스 : mysql 

           # npm install mysql2

  

  라우터 관리 : router/index.js

               # npm install vue-router

  api 관리 - pinia : store/

               # npm install pinia


 1. index.html 에서부터 시작
    - !DOCTYPE 문서 유형 선언은 html
    - script type 은 module (ES 모듈)
    - main.js 스크립트 파일을 로드
    - 루트 엘리먼트에다 애플리케이션 연결 
2. main.js 파일 로드
    - APP 컴포넌트 (App.vue) 를 vue 애플리케이션 인스턴스 생성 (루트 엘리먼트에다 애플리케이션 연결)  
    - 라우터 vue 애플리케이션에 등록
    - Pinia 인스턴스 생성 및 vue 애플리케이션에 등록
    - socket 서버url 연결 및 vue 애플리케이션의 전역 속성에 소켓 인스턴스 추가
3. App.vue (최상위 컴포넌트) 
   - <router-link to="" />, <router-view />
4. router/index.js
   - vue Router 인스턴스 생성  
5. app.js
   - 서버코드 (node.js + express + socket.IO)
   - Express.js 는 node.js 에서 웹 서버 구축하는 웹 프레임워크, Express 애플리케이션 인스턴스 생성 
   - HTTP 서버 생성
   - SocketIO 서버 생성 및 http 연결
   - io 객체를 통해서 클라이언트와 실시간 연결 관리
   - socket.io 서버의 cors 설정/ express 앱의 cors 설정

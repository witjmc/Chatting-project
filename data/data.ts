export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export interface Data {
    user: User;
}

export async function fetchData(): Promise<{ user: User }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                user: {
                    id: '1',
                    name: '홍길동',
                    email: 'email.com',
                    password: '1234',
                },
            });
        }, 1000);
    });
}

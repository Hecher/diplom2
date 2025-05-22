import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
            setError('Пожалуйста, заполните все поля');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const userData = {
                username: username,
                password: password
            };
            
            console.log('Отправляемые данные:', userData);
            
            const response = await fetch('http://localhost:3003/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            
            console.log('Статус ответа:', response.status);
            const data = await response.json();
            console.log('Ответ сервера:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Ошибка при входе');
            }
            
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            navigate('/main');
        } catch (err) {
            console.error('Ошибка авторизации:', err);
            setError(err.message || 'Неверный логин или пароль');
        } finally {
            setLoading(false);
        }
    }

    const handleRegister = () => {
        navigate('/register');
    }

    return (
        <form style={styles.form} onSubmit={handleLogin}>
            {error && <div style={styles.error}>{error}</div>}
            
            <label htmlFor="username" style={styles.label}>Введите логин</label>
            <input 
                type='text' 
                id="username" 
                placeholder='Ваш логин' 
                style={styles.input} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            
            <label htmlFor="password" style={styles.label}>Введите пароль</label>
            <input 
                type='password' 
                id="password" 
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            
            <div style={styles.buttonContainer}>
                <button 
                    type='submit' 
                    style={styles.button} 
                    disabled={loading}
                >
                    {loading ? 'Загрузка...' : 'Войти'}
                </button>
                <button 
                    type='button' 
                    style={styles.button} 
                    onClick={handleRegister}
                >
                    Регистрация
                </button>
            </div>
        </form>
    );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0,
        fontSize: '16px'
    },
    label: {
        marginBottom: '10px',
        width: '300px',
        textAlign: 'left'
    },
    input: {
        marginBottom: '20px',
        width: '300px',
        padding: '8px',
        fontSize: '16px'
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '300px'
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '48%'
    },
    error: {
        color: 'red',
        marginBottom: '15px',
        width: '300px',
        textAlign: 'center'
    }
}

export default Login;

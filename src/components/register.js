import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


const Register = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');


    const handleLogin = (e) => {
        navigate('/login');
    }

    const handleRegister = async (e) => {
        //доделать проверку
        //e.preventDefualt();
        if (!email || !username || !password) {
            setError('Заполните все поля!');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:3003/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    username,
                    password
                }),
            });
            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.message || 'Ошибка при регистрации');
            }

            navigate('/login');
        } catch (err) {
            setError(err.message || 'Произошла какая-то ошибка');
        } finally {
            setLoading(false);
        }
        //navigate('/main')
    }

    return (
        <form style={styles.form} onSubmit={handleRegister}>
            {error && <div style={styles.error}>{error}</div>}
            
            <label htmlFor="email" style={styles.label}>Введите почту</label>
            <input 
                type='email' 
                id="email" 
                placeholder='example@ex.com' 
                style={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            
            <label htmlFor="userID" style={styles.label}>Введите ваш логин</label>
            <input 
                type='text' 
                id='userID' 
                style={styles.input} 
                placeholder='exampleFIO'
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
                    {loading ? 'Загрузка...' : 'Подтвердить'}
                </button>
                <button 
                    type='button' 
                    style={styles.button} 
                    onClick={handleLogin}
                >
                    Войти
                </button>
            </div>
        </form>
    )
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

export default Register;
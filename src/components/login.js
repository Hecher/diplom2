import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = () => {

    const navigate = useNavigate();

    const handleLogin = (e) => {
        //доделать проверку
        //e.preventDefualt();
        navigate('/main');
    }

    const handleRegister = () => {
        navigate('/register')
    }

    return (
        <form style={styles.form}>
            <label for="email" style={styles.label}>Введите почту</label>
            <input type='email' id="email" placeholder='example@ex.com' style={styles.input} />
            <label for="password" style={styles.label}>Введите пароль</label>
            <input type='password' id="password" style={styles.input}/>
            
            <div style={styles.buttonContainer}>
                <button type='submit' style={styles.button} onClick={handleLogin}>Войти</button>
                <button type='button' style={styles.button} onClick={handleRegister}>Регистрация</button>
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
    }
  }

export default Login;
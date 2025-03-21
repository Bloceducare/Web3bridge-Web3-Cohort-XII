
import React from 'react';

import logo from '../src/assets/uniswap.png';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            marginBottom: '10px'
        }}>
            <img
                src={logo}
                alt="App Logo"
                style={{
                    height: '80px',
                    width: 'auto',
                    marginBottom: '10px'
                }}
            />
            <h1>{title}</h1>
        </header>
    );
};

export default Header;
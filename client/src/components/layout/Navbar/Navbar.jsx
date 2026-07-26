import {react} from 'react'
import './Navbar.css'

const Navbar = () => {
    return (
        <nav>
            <div className="nav-logo-container">
                <h1 className="logo-heading">INVEST <span>IQ</span></h1>
                
            </div>
            <ul className='nav-items'>
                <li className="nav-item">Features</li>
                <li className="nav-item">How it works</li>
                <li className="nav-item">Pricing</li>
                <li className="nav-item">Blog</li>
                <li className="nav-item">About</li>
            </ul>
            <div className="login-register-container">
                <button type="button" className="button login-button">Login</button>
                <button type="button" className="button register-button">Register</button>
            </div>
        </nav>

    )
}
export default Navbar
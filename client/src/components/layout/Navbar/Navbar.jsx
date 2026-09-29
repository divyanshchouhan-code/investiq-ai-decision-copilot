import {react} from 'react'
import Button from '../../common/Button/Button'
import Logo from '../Logo'
import './Navbar.css'

const Navbar = () => {
    return (
        <nav>
            <Logo />
            <ul className='nav-items'>
                <li className="nav-item">Features</li>
                <li className="nav-item">How it works</li>
                <li className="nav-item">Pricing</li>
                <li className="nav-item">Blog</li>
                <li className="nav-item">About</li>
            </ul>
            <div className="login-register-container">
                <Button variant="secondary">Login</Button>
                <Button>Register</Button>
            </div>
        </nav>

    )
}
export default Navbar
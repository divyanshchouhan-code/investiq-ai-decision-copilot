import {react} from 'react'
import Navbar from "../../components/layout/Navbar/Navbar.jsx";
import Footer from "../../components/layout/Footer/Footer.jsx";

import './Landing.css'
const Landing = () => {
    return (
        <>
        <Navbar />
        <div className="landing-container">
            <div className="left-container">
                <p className="main-heading-landing-page">AI-Powered Insights.<br/>Smarter <span className='highlight-heading'>Investment<br/> Decisions</span></p>
                <p className='brief-description'>InvestIQ analyzes your portfolio, market trends, and news to deliver personalized AI-driven investment briefs tailored to your goals.</p>
                <div className='button-container'>
                    <button type="button" className="button get-started-button">Get Started</button>
                    <button type="button" className="button how-works-button">How it wroks</button>
                </div>
            </div>
            <div className="right-container">
                
            </div>
        </div>

        <Footer />
        </>
        
    )
}

export default Landing
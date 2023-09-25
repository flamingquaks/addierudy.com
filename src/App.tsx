import './App.css'

import ContactPhoneRoundedIcon from '@mui/icons-material/ContactPhoneRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DescriptionIcon from '@mui/icons-material/Description';

function App() {


  return (
    <>
      <div>
        <h1 className='title'>Hey, it's <span className='pop-text'>Addie Rudy!</span></h1>
        <p className='subtitle'>Welcome to my page!</p>
        <p className='subtitle'>BTW, my pronouns are <span className='white-text'>they/them</span></p>
        <div className='lineItems'>
          <div className='lineItem'>
            <ContactPhoneRoundedIcon /> <a href="tel:+16786022545">+1 (678) 602-2545</a>
          </div>
          <div className='lineItem'>
            <AlternateEmailRoundedIcon/><a href="mailto:addie@addierudy.com">addie@addierudy.com</a>
          </div>
          <div className='lineItem'>
            <LinkedInIcon/><a href="https://www.linkedin.com/in/addierudy/" target='_blank'>addierudy</a>
          </div>
          <div className='lineItem'>
            <DescriptionIcon/><a href="https://flamingquaks.com/">Personal Blog</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default App



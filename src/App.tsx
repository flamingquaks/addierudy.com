import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Globe, MapPin } from 'lucide-react';
import './App.css';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import addieImage from './assets/addie.jpeg';

const DigitalContactCard = () => {
  const contactInfo = {
    name: "Addie Rudy",
    title: "Sr. Solutions Architect, Generative AI Specialist",
    email: "addie@addierudy.com",
    phone: "+1 (678) 602-2545",
    website: "addierudy.com",
    location: "Pittsboro, NC",
    linkedin: "linkedin.com/in/addierudy",
    github: "github.com/flamingquaks",
    avatar: addieImage,
  };

  const ContactItem = ({ icon: Icon, text, href }: { icon: any, text: string, href?: string }) => (
      <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
        {typeof Icon === 'function' ? <Icon size={18} /> : <Icon sx={{ fontSize: 18 }} />}
        {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {text}
        </a>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-6">
          <img
            src={contactInfo.avatar}
            alt={contactInfo.name}
            className="w-32 h-32 rounded-full mb-4 object-cover"
          />
          <h1 className="text-2xl font-bold text-gray-900">{contactInfo.name}</h1>
          <p className="text-gray-600 font-medium">{contactInfo.title}</p>
          {/* <p className="text-gray-500">{contactInfo.company}</p> */}
        </div>

        <div className="space-y-4">
          <ContactItem 
            icon={Mail} 
            text={contactInfo.email} 
            href={`mailto:${contactInfo.email}`}
          />
          <ContactItem 
            icon={Phone} 
            text={contactInfo.phone} 
            href={`tel:${contactInfo.phone}`}
          />
          <ContactItem 
            icon={Globe} 
            text={contactInfo.website} 
            href={`https://${contactInfo.website}`}
          />
          <ContactItem 
            icon={MapPin} 
            text={contactInfo.location} 
          />
          <ContactItem 
            icon={LinkedInIcon} 
            text="LinkedIn Profile" 
            href={`https://${contactInfo.linkedin}`}
          />
          <ContactItem 
            icon={GitHubIcon} 
            text="GitHub Profile" 
            href={`https://${contactInfo.github}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DigitalContactCard;
// src/pages/Welcome.jsx - CORRECTED VERSION
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, Package, Shield, QrCode, 
  ArrowRight, Users, Globe, Truck,
  LogIn, UserPlus, CheckCircle, Home,
  Mail, Phone, MapPin, ExternalLink
} from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  // Handle farmer signup
  const handleFarmerSignup = () => {
    navigate('/signup?type=farmer');
  };

  // Handle consumer verification
  const handleConsumerVerify = () => {
    navigate('/qr-scanner');
  };

  // Handle request demo
  const handleRequestDemo = () => {
    const subject = "AgriTrace Demo Request";
    const body = "Hello AgriTrace team,\n\nI would like to request a demo of your platform.\n\nBest regards,";
    window.location.href = `mailto:info@agritrace.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Handle social media links
  const handleSocialLink = (platform) => {
    const urls = {
      twitter: 'https://twitter.com/agritrace',
      linkedin: 'https://linkedin.com/company/agritrace',
      github: 'https://github.com/agritrace',
      discord: 'https://discord.gg/agritrace'
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  // Smooth scroll to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 40, 0, 0.85), rgba(0, 60, 0, 0.9)), url("https://i.pinimg.com/736x/fe/5c/23/fe5c2327c69e9f3462844b909820385d.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header/Navigation */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AgriTrace</h1>
                <p className="text-green-300 text-sm">Farm-to-Table Transparency</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-green-200 hover:text-white transition hover:underline"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how')}
                className="text-green-200 hover:text-white transition hover:underline"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-green-200 hover:text-white transition hover:underline"
              >
                Contact
              </button>
            </nav>
            
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="px-5 py-2 border-2 border-green-400 text-green-300 hover:bg-green-400 hover:text-gray-900 rounded-lg font-medium transition duration-300 flex items-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition duration-300 flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section - FIXED: Added closing div for text-center container */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-900 bg-opacity-50 rounded-full mb-8 border border-green-700">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-ping"></span>
              <span className="text-green-300 text-sm">Trust • Transparency • Traceability</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              From <span className="text-green-300">Farm</span> to 
              <span className="text-emerald-300"> Fork</span>, 
              <br />Every Step <span className="text-green-300">Tracked</span>
            </h1>
            
            <p className="text-2xl text-green-100 max-w-3xl mx-auto mb-12">
              Revolutionizing agricultural supply chains with blockchain-powered transparency. 
              Know exactly where your food comes from, every step of the way.
            </p>
            
            {/* Fixed Button Group */}
          
            
            {/* Stats Section - ADDED THIS BACK */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: '10K+', label: 'Farm Products', color: 'text-green-300', link: '/browse-products' },
                { number: '500+', label: 'Verified Farms', color: 'text-emerald-300', link: '/browse-products?filter=farms' },
                { number: '100%', label: 'Transparency', color: 'text-green-400', link: '/test-blockchain' },
                { number: '24/7', label: 'Track & Trace', color: 'text-emerald-400', link: '/qr-scanner' }
              ].map((stat, index) => (
                <Link 
                  key={index} 
                  to={stat.link}
                  className="text-center p-6 bg-black bg-opacity-30 rounded-2xl backdrop-blur-sm border border-green-900 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                  <div className="text-green-200">{stat.label}</div>
                </Link>
              ))}
            </div>
          </div> {/* ← THIS CLOSING DIV WAS MISSING */}
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-black bg-opacity-40">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Why Choose <span className="text-green-300">AgriTrace</span>?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-12 h-12" />,
                  title: 'Blockchain Security',
                  description: 'Immutable records stored on decentralized blockchain for tamper-proof transparency.',
                  link: '/test-blockchain'
                },
                {
                  icon: <QrCode className="w-12 h-12" />,
                  title: 'Instant Verification',
                  description: 'Scan QR codes to view complete product journey from farm to your table.',
                  link: '/qr-scanner'
                },
                {
                  icon: <Globe className="w-12 h-12" />,
                  title: 'Global Traceability',
                  description: 'Track products across borders with real-time location updates and certifications.',
                  link: '/new-shipment'
                },
                {
                  icon: <Package className="w-12 h-12" />,
                  title: 'Smart Packaging',
                  description: 'Digital product passports with harvest dates, farm details, and processing info.',
                  link: '/add-product'
                },
                {
                  icon: <Users className="w-12 h-12" />,
                  title: 'Farmer Empowerment',
                  description: 'Direct market access and fair pricing through transparent supply chains.',
                  link: '/farmer-dashboard'
                },
                {
                  icon: <Truck className="w-12 h-12" />,
                  title: 'Supply Chain Insights',
                  description: 'Analytics and reporting for efficient logistics and reduced waste.',
                  link: '/exporter-dashboard'
                }
              ].map((feature, index) => (
                <Link 
                  key={index} 
                  to={feature.link}
                  className="group p-8 rounded-2xl bg-black bg-opacity-40 border border-green-900 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-green-200">{feature.description}</p>
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-green-400 font-medium flex items-center">
                      Learn more 
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              How <span className="text-green-300">AgriTrace</span> Works
            </h2>
            
            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 transform -translate-y-1/2 z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {[
                  { 
                    step: '01', 
                    title: 'Farm Registration', 
                    desc: 'Farmers register products with harvest details',
                    link: '/add-product'
                  },
                  { 
                    step: '02', 
                    title: 'Digital Logging', 
                    desc: 'Each step logged on blockchain as product moves',
                    link: '/new-shipment'
                  },
                  { 
                    step: '03', 
                    title: 'QR Generation', 
                    desc: 'Unique QR code created for end-to-end tracking',
                    link: '/generate-qr'
                  },
                  { 
                    step: '04', 
                    title: 'Consumer Scan', 
                    desc: 'Consumers scan to verify origin and journey',
                    link: '/qr-scanner'
                  }
                ].map((item, index) => (
                  <Link 
                    key={index} 
                    to={item.link}
                    className="text-center group"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-2xl group-hover:scale-110 transition-transform">
                      <span className="text-3xl font-bold text-white">{item.step}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-green-200">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-12 rounded-3xl bg-gradient-to-r from-green-900 to-emerald-900 border-2 border-green-700">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Supply Chain?
              </h2>
              <p className="text-xl text-green-100 mb-10">
                Join thousands of farmers and consumers building a transparent food system.
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <Link 
                  to="/signup" 
                  className="px-10 py-4 bg-white hover:bg-gray-100 text-gray-900 text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Link>
                <button 
                  onClick={handleRequestDemo}
                  className="px-10 py-4 border-2 border-white hover:bg-white hover:text-gray-900 text-white text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Request Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Get in <span className="text-green-300">Touch</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <a 
                href="mailto:info@agritrace.com" 
                className="p-8 bg-black bg-opacity-30 rounded-2xl border border-green-900 hover:border-green-500 transition-all duration-300 text-center group"
              >
                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-green-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Email Us</h3>
                <p className="text-green-200 group-hover:text-green-300 transition">
                  info@agritrace.com
                </p>
              </a>
              
              <a 
                href="tel:+251925535630" 
                className="p-8 bg-black bg-opacity-30 rounded-2xl border border-green-900 hover:border-green-500 transition-all duration-300 text-center group"
              >
                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8 text-green-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Call Us</h3>
                <p className="text-green-200 group-hover:text-green-300 transition">
                  +251 (925) 535-630
                </p>
              </a>
              
              <div className="p-8 bg-black bg-opacity-30 rounded-2xl border border-green-900 text-center group">
                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8 text-green-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Visit Us</h3>
                <p className="text-green-200">
                  Ethiopia<br />
                  Addis Ababa, Kality
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-green-900 bg-black bg-opacity-60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <div className="mb-8 md:mb-0">
                <Link to="/" className="flex items-center space-x-3 mb-4 group">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">AgriTrace</h3>
                </Link>
                <p className="text-green-300 max-w-md">
                  Building trust in agriculture through blockchain transparency and traceability.
                </p>
              </div>
              
              <div className="flex space-x-6">
                {[
                  { name: 'twitter', icon: '𝕏', url: 'twitter' },
                  { name: 'linkedin', icon: 'in', url: 'linkedin' },
                  { name: 'github', icon: 'GH', url: 'github' },
                  { name: 'discord', icon: 'D', url: 'discord' }
                ].map((social) => (
                  <button 
                    key={social.name}
                    onClick={() => handleSocialLink(social.url)}
                    className="w-12 h-12 bg-green-900 bg-opacity-50 hover:bg-green-800 rounded-full flex items-center justify-center text-green-300 hover:text-white transition transform hover:scale-110"
                    aria-label={`Visit our ${social.name}`}
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><Link to="/features" className="text-green-300 hover:text-white transition">Features</Link></li>
                  <li><Link to="/pricing" className="text-green-300 hover:text-white transition">Pricing</Link></li>
                  <li><Link to="/testimonials" className="text-green-300 hover:text-white transition">Success Stories</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-green-300 hover:text-white transition">About Us</Link></li>
                  <li><Link to="/team" className="text-green-300 hover:text-white transition">Our Team</Link></li>
                  <li><Link to="/careers" className="text-green-300 hover:text-white transition">Careers</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><Link to="/blog" className="text-green-300 hover:text-white transition">Blog</Link></li>
                  <li><Link to="/docs" className="text-green-300 hover:text-white transition">Documentation</Link></li>
                  <li><Link to="/support" className="text-green-300 hover:text-white transition">Support</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link to="/privacy" className="text-green-300 hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-green-300 hover:text-white transition">Terms of Service</Link></li>
                  <li><Link to="/cookies" className="text-green-300 hover:text-white transition">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-green-900 text-center text-green-400">
              <p>© 2024 AgriTrace. All rights reserved. | Farm-to-Table Transparency Platform</p>
              <p className="mt-2 text-sm">
                Made with ❤️ for sustainable agriculture
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
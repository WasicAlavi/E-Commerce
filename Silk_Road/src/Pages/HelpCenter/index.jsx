import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { FaChevronDown, FaSearch, FaEnvelope, FaPhone, FaComments } from 'react-icons/fa';

const StyledButton = styled(Button)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  backgroundColor: '#9DC08B',
  color: '#fff',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#40513B',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#9DC08B',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#9DC08B',
    },
    '&:hover fieldset': {
      borderColor: '#40513B',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9DC08B',
    },
  },
}));

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqCategories = [
    {
      title: 'Ordering & Payment',
      icon: '🛒',
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'To place an order, simply browse our products, add items to your cart, and proceed to checkout. You can pay using credit/debit cards, bKash, Nagad, or PayPal.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept Visa, MasterCard, bKash, Nagad, and PayPal. All payments are processed securely.'
        },
        {
          question: 'Is it safe to shop online?',
          answer: 'Yes, we use industry-standard SSL encryption to protect your personal and payment information.'
        },
        {
          question: 'Can I cancel my order?',
          answer: 'You can cancel your order within 1 hour of placing it. After that, please contact our customer service team.'
        }
      ]
    },
    {
      title: 'Shipping & Delivery',
      icon: '🚚',
      faqs: [
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 3-5 business days within Bangladesh. Express shipping is available for 1-2 business days.'
        },
        {
          question: 'Do you offer free shipping?',
          answer: 'Yes, we offer free shipping on all orders over ৳3000 within Bangladesh.'
        },
        {
          question: 'How can I track my order?',
          answer: 'You can track your order using the order number provided in your confirmation email, or visit our order tracking page.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Currently, we only ship within Bangladesh. We are working on expanding our international shipping options.'
        }
      ]
    },
    {
      title: 'Returns & Refunds',
      icon: '↩️',
      faqs: [
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for most items. Products must be unused and in original packaging.'
        },
        {
          question: 'How do I return an item?',
          answer: 'To return an item, log into your account, go to your orders, and select the return option. You can also contact our customer service team.'
        },
        {
          question: 'How long does it take to process a refund?',
          answer: 'Refunds are typically processed within 5-7 business days after we receive your returned item.'
        },
        {
          question: 'Do you offer exchanges?',
          answer: 'Yes, we offer exchanges for different sizes or colors of the same item, subject to availability.'
        }
      ]
    },
    {
      title: 'Account & Security',
      icon: '🔒',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'You can create an account by clicking the "Register" button in the top navigation. You\'ll need to provide your email and create a password.'
        },
        {
          question: 'I forgot my password. What should I do?',
          answer: 'Click on the "Forgot Password" link on the login page. We\'ll send you an email with instructions to reset your password.'
        },
        {
          question: 'How do I update my account information?',
          answer: 'Log into your account and go to the "Profile" section to update your personal information, address, and preferences.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we take data security seriously. Your personal information is encrypted and stored securely.'
        }
      ]
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message. We\'ll get back to you within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-8 font-montserrat">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[#40513B] text-center mb-8">
            Help Center
          </h1>

          {/* Search Section */}
          <div className="bg-white rounded-lg p-8 shadow-md mb-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-[#40513B] mb-2">
                How can we help you?
              </h2>
              <p className="text-gray-600">
                Search our frequently asked questions or browse by category
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <StyledTextField
                  fullWidth
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <FaSearch className="text-gray-400 mr-2" />
                  }}
                />
              </div>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {filteredFAQs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-[#40513B] flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.title}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {category.faqs.map((faq, faqIndex) => (
                    <Accordion key={faqIndex} sx={{ boxShadow: 'none' }}>
                      <AccordionSummary
                        expandIcon={<FaChevronDown className="text-[#9DC08B]" />}
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            margin: '12px 0',
                          },
                          '&:hover': {
                            backgroundColor: '#f8f9fa',
                          },
                        }}
                      >
                        <h4 className="text-[#40513B] font-medium">{faq.question}</h4>
                      </AccordionSummary>
                      <AccordionDetails sx={{ backgroundColor: '#f8f9fa' }}>
                        <p className="text-[#40513B] leading-relaxed">{faq.answer}</p>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-[#40513B] mb-6">Contact Us</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StyledTextField
                    fullWidth
                    label="First Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                  <StyledTextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                </div>
                <StyledTextField
                  fullWidth
                  label="Subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  required
                />
                <StyledTextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                />
                <StyledButton type="submit" variant="contained" fullWidth>
                  Send Message
                </StyledButton>
              </form>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-[#40513B] mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#9DC08B] rounded-full flex items-center justify-center">
                    <FaPhone className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#40513B]">Phone Support</h4>
                    <p className="text-gray-600">+880 1234-567890</p>
                    <p className="text-sm text-gray-500">Monday - Friday, 9 AM - 6 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#9DC08B] rounded-full flex items-center justify-center">
                    <FaEnvelope className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#40513B]">Email Support</h4>
                    <p className="text-gray-600">support@silkroad.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#9DC08B] rounded-full flex items-center justify-center">
                    <FaComments className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#40513B]">Live Chat</h4>
                    <p className="text-gray-600">Available on our website</p>
                    <p className="text-sm text-gray-500">Monday - Friday, 9 AM - 6 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-[#40513B] mb-2">Quick Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check your order status in your account</li>
                  <li>• Use our order tracking tool for real-time updates</li>
                  <li>• Review our return policy before making a purchase</li>
                  <li>• Save your order confirmation emails</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter; 
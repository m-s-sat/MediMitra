import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  FileText, 
  Bot, 
  AlertTriangle,
  Smartphone,
  Shield,
  Users,
  Zap,
  ArrowRight,
  Star,
  Play
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { FeatureCard } from '../components/FeatureCard';
import logo from "../assets/Logo.png"
export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Calendar,
      title: t('features.appointments'),
      description: t('features.appointments.desc'),
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      icon: FileText,
      title: t('features.reports'),
      description: t('features.reports.desc'),
      gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600'
    },
    {
      icon: Bot,
      title: t('features.chatbot'),
      description: t('features.assistant.desc'),
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      icon: AlertTriangle,
      title: t('features.emergency'),
      description: t('features.helpdesk.desc'),
      gradient: 'bg-gradient-to-r from-red-500 to-red-600'
    }
  ];

  const comingSoonFeatures = [
    {
      icon: Smartphone,
      title: t('comingSoon.wearable'),
      description: t('comingSoon.wearable')
    },
    {
      icon: Shield,
      title: t('comingSoon.insurance'),
      description: t('comingSoon.insurance')
    },
    {
      icon: Users,
      title: t('comingSoon.family'),
      description: t('comingSoon.family')
    },
    {
      icon: Zap,
      title: t('comingSoon.symptomChecker'),
      description: t('comingSoon.symptomChecker')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              {t('hero.tagline')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>{t('nav.signup')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/login"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>{t('nav.login')}</span>
              </Link>
            </motion.div>

            {/* Demo Video Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 relative"
            >
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-1">
                <div className="bg-white rounded-xl p-8 relative overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">{t('common.demoVideo') || 'Watch Demo Video'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('featuresSection.title') || 'Everything You Need for Better Healthcare'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('featuresSection.subtitle') || 'Our comprehensive platform provides all the tools you need to manage your health effectively'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <motion.div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">{t('stats.happyUsers') || 'Happy Users'}</div>
            </motion.div>
            <motion.div>
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="text-blue-100">{t('stats.languages') || 'Languages Supported'}</div>
            </motion.div>
            <motion.div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">{t('stats.appointments') || 'Appointments Booked'}</div>
            </motion.div>
            <motion.div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">{t('stats.aiSupport') || 'AI Support'}</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('comingSoon.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('comingSoon.subtitle') || 'Exciting new features on the horizon to enhance your healthcare experience'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {comingSoonFeatures.map((feature, index) => (
              <motion.div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-1 rounded-full">
                    {t('common.stayTuned') || 'Stay Tuned'}
                  </span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote className="text-2xl font-medium text-gray-900 mb-6 max-w-4xl mx-auto">
            {t('testimonial.text') || `"Aarogya Mitra made it so easy to book appointments and communicate with doctors in my native language. The AI assistant is incredibly helpful and understanding."`}
          </blockquote>
          <div className="text-gray-600">
            <p className="font-semibold">{t('testimonial.name') || 'Maria Rodriguez'}</p>
            <p>{t('testimonial.location') || 'Patient from Barcelona'}</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-600 to-emerald-600 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {t('cta.title') || 'Ready to Take Control of Your Health?'}
        </h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
          {t('cta.subtitle') || 'Join thousands of users who trust Aarogya Mitra for their healthcare needs'}
        </p>
        <Link
          to="/signup"
          className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center space-x-2"
        >
          <span>{t('cta.button') || 'Start Your Journey'}</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <div className="w-20 h-20 rounded-lg flex items-center justify-center">
              <img
                src={logo}
                alt="Aarogya Mitra"
                className="max-h-full max-w-full object-contain"
              />
            </div>
                </div>
                <span className="text-xl font-bold">{t('footer.brand') || 'Aarogya Mitra'}</span>
              </div>
              <p className="text-gray-400">
                {t('footer.tagline') || 'Your trusted multilingual healthcare companion'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.product') || 'Product'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">{t('footer.features') || 'Features'}</a></li>
                <li><a href="#">{t('footer.pricing') || 'Pricing'}</a></li>
                <li><a href="#">{t('footer.api') || 'API'}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.company') || 'Company'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">{t('footer.about') || 'About'}</a></li>
                <li><a href="#">{t('footer.blog') || 'Blog'}</a></li>
                <li><a href="#">{t('footer.careers') || 'Careers'}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.support') || 'Support'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">{t('footer.help') || 'Help Center'}</a></li>
                <li><a href="#">{t('footer.privacy') || 'Privacy Policy'}</a></li>
                <li><a href="#">{t('footer.terms') || 'Terms of Service'}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {t('footer.brand') || 'Aarogya Mitra'}. {t('footer.rights') || 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

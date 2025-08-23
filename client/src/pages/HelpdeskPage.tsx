import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { 
  HelpCircle, 
  Plus, 
  Upload, 
  Send, 
  Phone,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Ticket {
  id: string;
  category: string;
  priority: 'Low' | 'Medium' | 'Urgent';
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const HelpdeskPage: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'raise-ticket' | 'my-tickets' | 'faqs'>('raise-ticket');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  
  const [newTicket, setNewTicket] = useState({
    category: '',
    priority: 'Medium' as const,
    subject: '',
    description: '',
    attachments: [] as File[]
  });

  const [tickets] = useState<Ticket[]>([
    {
      id: 'TKT001',
      category: 'Technical',
      priority: 'Medium',
      subject: 'Unable to upload prescription',
      description: 'I am getting an error when trying to upload my prescription document.',
      status: 'In Progress',
      createdAt: '2025-01-14T10:30:00Z',
      updatedAt: '2025-01-15T14:20:00Z',
      attachments: ['screenshot.png']
    },
    {
      id: 'TKT002',
      category: 'Appointment',
      priority: 'Urgent',
      subject: 'Appointment cancellation issue',
      description: 'Need to cancel my appointment but the system is not allowing me to do so.',
      status: 'Open',
      createdAt: '2025-01-15T09:15:00Z',
      updatedAt: '2025-01-15T09:15:00Z'
    },
    {
      id: 'TKT003',
      category: 'Billing',
      priority: 'Low',
      subject: 'Invoice clarification needed',
      description: 'I need clarification on the charges in my recent invoice.',
      status: 'Resolved',
      createdAt: '2025-01-10T16:45:00Z',
      updatedAt: '2025-01-12T11:30:00Z'
    }
  ]);

  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'support',
      message: 'Hello! I\'m here to help you with any questions or issues you might have. How can I assist you today?',
      timestamp: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      sender: 'user',
      message: 'Hi, I\'m having trouble booking an appointment. The system keeps showing an error.',
      timestamp: '2025-01-15T10:02:00Z'
    },
    {
      id: '3',
      sender: 'support',
      message: 'I\'m sorry to hear you\'re experiencing issues with appointment booking. Let me help you troubleshoot this. Can you tell me what error message you\'re seeing?',
      timestamp: '2025-01-15T10:03:00Z'
    }
  ]);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I schedule an appointment?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed luctus at sapien ac varius. Nullam facilisis, nunc vel tincidunt cursus, nulla nunc vehicula nunc, vel tincidunt nunc nunc vel nunc.',
      category: 'Appointments'
    },
    {
      id: '2',
      question: 'Can I upload my prescriptions?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In hac habitasse platea dictumst. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
      category: 'Documents'
    },
    {
      id: '3',
      question: 'What should I do if I forgot my password?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis nisl nec nulla interdum tempor. Sed auctor, nunc vel tincidunt cursus, nulla nunc vehicula nunc.',
      category: 'Account'
    },
    {
      id: '4',
      question: 'How do I contact technical support?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris euismod, nibh vitae luctus commodo, nunc nunc vehicula nunc, vel tincidunt nunc nunc vel nunc.',
      category: 'Support'
    },
    {
      id: '5',
      question: 'Can I request home sample collection?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur facilisis velit in nulla fermentum. Sed auctor, nunc vel tincidunt cursus, nulla nunc vehicula nunc.',
      category: 'Services'
    },
    {
      id: '6',
      question: 'Is my data secure?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse potenti. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
      category: 'Privacy'
    }
  ];

  const categories = ['Technical', 'Medical', 'Appointment', 'Billing', 'General'];

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'Resolved': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Closed': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-600';
      case 'Medium': return 'bg-yellow-100 text-yellow-600';
      case 'Urgent': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setNewTicket(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setNewTicket(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitTicket = () => {
    console.log('Submitting ticket:', newTicket);
    // Reset form
    setNewTicket({
      category: '',
      priority: 'Medium',
      subject: '',
      description: '',
      attachments: []
    });
    // Show success message or redirect
  };

  const handleEmergencyCall = () => {
    console.log('Emergency call initiated');
    alert('Calling emergency helpline...');
  };

  const handleSendChatMessage = () => {
    if (chatMessage.trim()) {
      console.log('Sending chat message:', chatMessage);
      setChatMessage('');
    }
  };

  const tabs = [
    { id: 'raise-ticket', label: 'Raise Ticket', icon: Plus },
    { id: 'my-tickets', label: 'My Tickets', icon: FileText },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Helpdesk & Support
          </h1>
          <p className="text-gray-600 text-lg">
            Get help with your healthcare journey - we're here 24/7
          </p>
        </motion.div>

        {/* Emergency Call Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
              <p className="text-red-100">
                For urgent medical assistance or technical emergencies
              </p>
            </div>
            <button
              onClick={handleEmergencyCall}
              className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center space-x-2 text-lg"
            >
              <Phone className="w-6 h-6" />
              <span>Emergency Call</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
              <div className="flex space-x-1 p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Raise Ticket Tab */}
              {activeTab === 'raise-ticket' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Raise a Support Ticket</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={newTicket.category}
                          onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority *
                        </label>
                        <div className="flex space-x-4">
                          {(['Low', 'Medium', 'Urgent'] as const).map(priority => (
                            <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="priority"
                                value={priority}
                                checked={newTicket.priority === priority}
                                onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(priority)}`}>
                                {priority}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of your issue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={newTicket.description}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={5}
                        placeholder="Please provide detailed information about your issue..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attachments (Optional)
                      </label>
                      <div className="space-y-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                          <span>Upload Files</span>
                        </button>
                        
                        {newTicket.attachments.length > 0 && (
                          <div className="space-y-2">
                            {newTicket.attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Paperclip className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">{file.name}</span>
                                </div>
                                <button
                                  onClick={() => removeAttachment(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitTicket}
                      disabled={!newTicket.category || !newTicket.subject || !newTicket.description}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </motion.div>
              )}

              {/* My Tickets Tab */}
              {activeTab === 'my-tickets' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  {tickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{ticket.subject}</h3>
                            <span className="text-sm text-gray-500">#{ticket.id}</span>
                          </div>
                          <p className="text-gray-600 mb-3">{ticket.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Category: {ticket.category}</span>
                            <span>•</span>
                            <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(ticket.status)}`}>
                            <span>{ticket.status}</span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </div>
                        </div>
                      </div>
                      
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                          <div className="flex space-x-2">
                            {ticket.attachments.map((attachment, i) => (
                              <span key={i} className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                                <Paperclip className="w-3 h-3" />
                                <span>{attachment}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* FAQs Tab */}
              {activeTab === 'faqs' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                  
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg"
                      >
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                            <span className="text-sm text-blue-600">{faq.category}</span>
                          </div>
                          {expandedFAQ === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedFAQ === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 text-gray-600 border-t border-gray-200">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Live Chat Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 sticky top-24"
            >
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Live Chat</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>

              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-75">
                          {message.sender === 'user' ? 'You' : 'Support'}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => chatFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>Attach File</span>
                </button>
                
                <input
                  ref={chatFileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      console.log('Chat file uploaded:', e.target.files[0].name);
                    }
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import {
  Code2,
  Video,
  Users,
  Play,
  BookOpen,
  Briefcase,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../Modals/AuthModal';
import './LandingPage.css';

type AuthMode = 'teaching' | 'interview';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('interview');

  const handleStartTeaching = () => {
    setAuthMode('teaching');
    setIsModalOpen(true);
  };

  const handleStartInterview = () => {
    setAuthMode('interview');
    setIsModalOpen(true);
  };

  const handleJoinAsUser = () => {
    // For "Join Room" button, we'll open interview mode modal
    // since it has the same join flow
    setAuthMode('interview');
    setIsModalOpen(true);
  };

  const handleModalLogin = (role: 'teacher' | 'interviewer' | 'user', roomId?: string) => {
    setIsModalOpen(false);
    login(role, roomId);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <img src="/codeLinkaLogo.png" alt="CodeLinka" className="nav-logo" />
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#modes" className="nav-link">Modes</a>
            <button className="nav-cta" onClick={handleStartInterview}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-badge">
              <Zap className="hero-badge-icon" />
              <span>Real-Time Collaborative Platform</span>
            </div>

            <h1 className="hero-title">
              Code Together,
              <span className="hero-title-gradient">Learn Together</span>
            </h1>

            <p className="hero-description">
              A powerful collaborative code editor built for interviews, teaching, and real-time collaboration.
              Write, compile, and communicate seamlessly in one unified platform.
            </p>

            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={handleStartInterview}>
                Start Collaborating
              </button>
            </div>

            <div className="hero-features-grid">
              {[
                { icon: Code2, label: 'Editor' },
                { icon: Briefcase, label: 'Interview' },
                { icon: BookOpen, label: 'Classroom' },
                { icon: Play, label: 'Compiler' },
                { icon: Video, label: 'Video' }
              ].map((item, idx) => (
                <div key={idx} className="hero-feature-card">
                  <item.icon className="hero-feature-icon" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <h2 className="section-title">Everything You Need in One Platform</h2>

          <div className="features-grid">
            {[
              {
                icon: Code2,
                title: 'Advanced Code Editor',
                description: 'Syntax highlighting, auto-completion, and real-time collaboration on code.'
              },
              {
                icon: Play,
                title: 'Integrated Compiler',
                description: 'Run and test code instantly with support for multiple programming languages.'
              },
              {
                icon: Video,
                title: 'HD Video & Audio',
                description: 'Crystal clear video calls with screen sharing capabilities built-in.'
              },
              {
                icon: Users,
                title: 'Multi-User Sync',
                description: 'See cursors, edits, and changes from all participants in real-time.'
              },
              {
                icon: Globe,
                title: 'Cloud-Based',
                description: 'Access your projects from anywhere, collaborate from any device.'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'End-to-end encryption ensures your code and conversations stay private.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon-wrapper">
                  <feature.icon className="feature-icon" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Modes Section */}
        <section id="modes" className="modes-section">
          <div className="modes-header">
            <h2 className="section-title">Choose Your Mode</h2>
            <p className="modes-subtitle">
              Optimized experiences for different collaboration scenarios
            </p>
          </div>

          <div className="modes-grid">
            {/* Teaching Mode */}
            <div className="mode-card mode-card-teaching">
              <div className="mode-card-glow"></div>
              <div className="mode-card-content">
                <div className="mode-icon-wrapper mode-icon-cyan">
                  <BookOpen className="mode-icon" />
                </div>

                <h3 className="mode-title">Teaching Mode</h3>
                <p className="mode-description">
                  Perfect for educators and mentors. Share knowledge, demonstrate concepts, and guide students through code in real-time.
                </p>

                <ul className="mode-features-list">
                  {[
                    'Live code demonstrations',
                    'Student monitoring dashboard',
                    'Interactive whiteboard',
                    'Session recording & replay',
                    'Assignment distribution'
                  ].map((item, idx) => (
                    <li key={idx} className="mode-feature-item">
                      <div className="mode-feature-dot mode-dot-cyan"></div>
                      {item}
                    </li>
                  ))}
                </ul>

                <button className="mode-btn mode-btn-cyan" onClick={handleStartTeaching}>
                  Start Teaching
                </button>
              </div>
            </div>

            {/* Interview Mode */}
            <div className="mode-card mode-card-interview">
              <div className="mode-card-glow mode-glow-blue"></div>
              <div className="mode-card-content">
                <div className="mode-icon-wrapper mode-icon-blue">
                  <Briefcase className="mode-icon" />
                </div>

                <h3 className="mode-title">Interview Mode</h3>
                <p className="mode-description">
                  Streamlined for technical interviews. Assess candidates, solve problems together, and evaluate coding skills efficiently.
                </p>

                <ul className="mode-features-list">
                  {[
                    'Candidate code evaluation',
                    'Built-in test cases',
                    'Problem library access',
                    'Performance metrics',
                    'Interview notes & feedback'
                  ].map((item, idx) => (
                    <li key={idx} className="mode-feature-item">
                      <div className="mode-feature-dot mode-dot-blue"></div>
                      {item}
                    </li>
                  ))}
                </ul>

                <button className="mode-btn mode-btn-blue" onClick={handleStartInterview}>
                  Start Interview
                </button>
              </div>
            </div>
          </div>

          {/* Join Room Section */}
          <div className="join-section">
            <div className="join-card">
              <div className="join-card-content">
                <Users className="join-icon" />
                <div className="join-text">
                  <h3>Join an Existing Room</h3>
                  <p>Have a room ID? Sign in as a participant to join a teaching session or interview.</p>
                </div>
                <button className="join-btn" onClick={handleJoinAsUser}>
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-card">
            <h2 className="cta-title">
              Ready to Transform Your Collaboration?
            </h2>
            <p className="cta-description">
              Join developers, educators, and teams who are already using CodeLinka to work better together.
            </p>
            <button className="cta-btn" onClick={handleStartInterview}>
              Get Started Free
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <img src="/codeLinkaLogo.png" alt="CodeLinka" className="footer-logo" />
          </div>
          <p className="footer-copyright">© 2026 CodeLinka. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isModalOpen}
        mode={authMode}
        onClose={handleModalClose}
        onLogin={handleModalLogin}
      />
    </div>
  );
};

export default LandingPage;

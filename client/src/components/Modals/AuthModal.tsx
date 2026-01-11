import React, { useState } from 'react';
import { X, ArrowLeft, BookOpen, Briefcase, Users, UserPlus, ChevronRight } from 'lucide-react';
import './Modals.css';

type AuthMode = 'teaching' | 'interview';
type ModalStep = 'login' | 'role-selection' | 'join-room';

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onLogin: (role: 'teacher' | 'interviewer' | 'user', roomId?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onLogin,
}) => {
  const [step, setStep] = useState<ModalStep>('login');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    // After Google login, show role selection
    setStep('role-selection');
  };

  const handleHostRole = () => {
    // Host creates a room - redirect to OAuth with host role
    const role = mode === 'teaching' ? 'teacher' : 'interviewer';
    onLogin(role);
  };

  const handleParticipantRole = () => {
    // Participant needs to enter room ID
    setStep('join-room');
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    // Join as user with room ID
    onLogin('user', roomId.trim());
  };

  const handleBack = () => {
    setError('');
    if (step === 'join-room') {
      setStep('role-selection');
    } else if (step === 'role-selection') {
      setStep('login');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modeConfig = {
    teaching: {
      title: 'Teaching Session',
      icon: BookOpen,
      hostTitle: 'I am a Teacher',
      hostDesc: 'Create a new classroom and invite students to join',
      participantTitle: 'I am a Student',
      participantDesc: 'Join an existing classroom with a room code',
    },
    interview: {
      title: 'Interview Session',
      icon: Briefcase,
      hostTitle: 'I am an Interviewer',
      hostDesc: 'Create a new interview room and invite candidates',
      participantTitle: 'I am a Candidate',
      participantDesc: 'Join an interview with your room code',
    },
  };

  const config = modeConfig[mode];
  const ModeIcon = config.icon;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* Login Step */}
        {step === 'login' && (
          <>
            <div className="modal-header">
              <img src="/codeLinkaLogo.png" alt="CodeLinka" className="modal-logo" />
              <div className={`modal-mode-badge ${mode}`}>
                <ModeIcon size={14} />
                {config.title}
              </div>
              <h2 className="modal-title">Welcome to CodeLinka</h2>
              <p className="modal-subtitle">Sign in to continue</p>
            </div>

            <div className="modal-body">
              <button className="login-btn login-btn-google" onClick={handleGoogleLogin}>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="modal-footer">
              <p className="modal-footer-text">
                By continuing, you agree to our Terms of Service
              </p>
            </div>
          </>
        )}

        {/* Role Selection Step */}
        {step === 'role-selection' && (
          <>
            <button className="modal-back-btn" onClick={handleBack}>
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="modal-header">
              <div className={`modal-mode-badge ${mode}`}>
                <ModeIcon size={14} />
                {config.title}
              </div>
              <h2 className="modal-title">Choose Your Role</h2>
              <p className="modal-subtitle">How would you like to join?</p>
            </div>

            <div className="modal-body">
              <div className="role-options">
                <button className="role-card role-host" onClick={handleHostRole}>
                  <div className="role-card-icon">
                    <UserPlus size={20} />
                  </div>
                  <h3 className="role-card-title">{config.hostTitle}</h3>
                  <p className="role-card-description">{config.hostDesc}</p>
                  <ChevronRight className="role-card-arrow" size={20} />
                </button>

                <button className="role-card role-participant" onClick={handleParticipantRole}>
                  <div className="role-card-icon">
                    <Users size={20} />
                  </div>
                  <h3 className="role-card-title">{config.participantTitle}</h3>
                  <p className="role-card-description">{config.participantDesc}</p>
                  <ChevronRight className="role-card-arrow" size={20} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Join Room Step */}
        {step === 'join-room' && (
          <>
            <button className="modal-back-btn" onClick={handleBack}>
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="modal-header">
              <div className={`modal-mode-badge ${mode}`}>
                <ModeIcon size={14} />
                {config.title}
              </div>
              <h2 className="modal-title">Join Room</h2>
              <p className="modal-subtitle">Enter the room code shared with you</p>
            </div>

            <div className="modal-body">
              {error && <div className="modal-error">{error}</div>}

              <div className="join-room-input-group">
                <label className="join-room-label" htmlFor="roomId">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomId"
                  className="join-room-input"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter room code (e.g., ABC123)"
                  autoFocus
                />
              </div>

              <button className="modal-btn modal-btn-primary" onClick={handleJoinRoom}>
                Join Room
              </button>
            </div>
          </>
        )}

        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

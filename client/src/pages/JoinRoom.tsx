import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './JoinRoom.css';

export const JoinRoom: React.FC = () => {
  const { user, logout, pendingRoomId, clearPendingRoom } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = useCallback(async (id: string) => {
    setIsJoining(true);
    try {
      // Clear the pending room before navigating
      clearPendingRoom();
      // Navigate to the room
      navigate(`/room/${id}`);
    } catch (err) {
      setError('Failed to join room. Please check the room ID.');
      setIsJoining(false);
    }
  }, [clearPendingRoom, navigate]);

  // If there's a pending room ID from before login, use it
  useEffect(() => {
    if (pendingRoomId) {
      setRoomId(pendingRoomId);
      // Auto-join if we have a pending room
      handleJoinRoom(pendingRoomId);
    }
  }, [pendingRoomId, handleJoinRoom]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    handleJoinRoom(roomId.trim());
  };

  return (
    <div className="join-room-page">
      <div className="join-room-container">
        <div className="join-room-header">
          <img src="/codeLinkaLogo.png" alt="CodeLinka" className="join-logo" />
          <h1>Join a Room</h1>
          {user && (
            <p className="welcome-text">
              Welcome, <strong>{user.name}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleJoin} className="join-room-form">
          <div className="form-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID (e.g., abc123)"
              autoFocus
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="join-button" disabled={isJoining}>
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </form>

        <div className="join-room-footer">
          <button onClick={logout} className="logout-link">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

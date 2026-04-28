import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { AppointmentStatus } from '../types';

export const VideoConsultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);

  // Generate a unique room name based on appointment ID
  const roomName = `HopCare_Consultation_${appointmentId || 'default'}`;

  const handleGoBack = () => {
    if (user?.role === 'doctor') {
      navigate('/doctor-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800 shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleGoBack}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors flex items-center justify-center"
            title="Leave and Go Back"
          >
            <ArrowLeft className="w-6 h-6 text-slate-300" />
          </button>
          <h1 className="text-lg font-semibold tracking-wide text-slate-100">
            Consultation Room
          </h1>
        </div>
        {!isJoined && (
          <div className="text-sm px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full font-medium">
            Preparing connection...
          </div>
        )}
      </div>

      {/* Jitsi Meeting Container */}
      <div className="flex-1 w-full relative bg-slate-800">
        <JitsiMeeting
          domain="meet.element.io"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          }}
          userInfo={{
            displayName: user?.name || 'Guest',
            email: user?.email || '',
          }}
          onApiReady={(externalApi) => {
            // Meeting logic or events can be attached here
            externalApi.addListener('videoConferenceJoined', () => {
              setIsJoined(true);
            });
            // When the user hangs up or leaves the call
            externalApi.addListener('readyToClose', async () => {
              try {
                if (appointmentId) {
                  // Mark the appointment as completed when they leave
                  await api.updateAppointmentStatus(appointmentId, AppointmentStatus.COMPLETED);
                }
              } catch (error) {
                console.error("Failed to update appointment status", error);
              }
              handleGoBack();
            });
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
          }}
        />
      </div>
    </div>
  );
};

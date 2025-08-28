import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, Users, ExternalLink, Settings, ArrowRight } from 'lucide-react';
import { googleAuth } from '/workspaces/sean4app/src/lib/googleAuth.ts';

interface CalendarManagerProps {
  onNavigate?: (view: string) => void;
}

const CalendarManager: React.FC<CalendarManagerProps> = ({ onNavigate }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const mockEvents = [
    {
      id: '1',
      title: 'פגישה עם דוד כהן',
      start: new Date(2024, 0, 26, 10, 0),
      end: new Date(2024, 0, 26, 11, 0),
      location: 'משרד תל אביב',
      attendees: ['david@kohen-tech.co.il']
    },
    {
      id: '2',
      title: 'שיחת מעקב - שרה לוי',
      start: new Date(2024, 0, 27, 14, 0),
      end: new Date(2024, 0, 27, 14, 30),
      location: 'שיחת טלפון',
      attendees: ['sara@levi-partners.co.il']
    }
  ];

  useEffect(() => {
    // בדיקה אם יש חיבור קיים
    const savedConnection = localStorage.getItem('google_calendar_connected');
    if (savedConnection) {
      setIsConnected(true);
      setEvents(mockEvents);
    }
  }, []);

  const handleConnectCalendar = () => {
    // חיבור אמיתי לגוגל קלנדר
    googleAuth.signIn()
      .then(user => {
        console.log('✅ התחברת לגוגל:', user);
        setShowConnectModal(true);
      })
      .catch(error => {
        console.error('❌ שגיאת התחברות:', error);
        alert('❌ שגיאה בהתחברות לגוגל. נסה שוב.');
      });
  };

  const handleConfirmConnection = () => {
    localStorage.setItem('google_calendar_connected', 'true');
    setIsConnected(true);
    setEvents(mockEvents);
    setShowConnectModal(false);
    alert('🎉 התחברת בהצלחה לגוגל קלנדר!');
  };

  const handleCreateEvent = () => {
    if (isConnected) {
      // פתיחת גוגל קלנדר ליצירת אירוע
      window.open('https://calendar.google.com/calendar/render?action=TEMPLATE', '_blank');
    } else {
      alert('❌ יש להתחבר לגוגל קלנדר קודם');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          {isConnected ? (
            <button
              onClick={handleCreateEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="h-5 w-5" />
              <span>פגישה חדשה</span>
            </button>
          ) : (
            <button
              onClick={handleConnectCalendar}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 space-x-reverse"
            >
              <Settings className="h-5 w-5" />
              <span>התחבר לגוגל קלנדר</span>
            </button>
          )}
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
          >
            <ExternalLink className="h-5 w-5" />
            <span>פתח גוגל קלנדר</span>
          </a>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-4 space-x-reverse mb-2">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
            >
              <ArrowRight className="h-5 w-5" />
              <span>חזרה לדשבורד</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">יומן פגישות</h1>
          <p className="text-gray-600">
            {isConnected ? `${events.length} פגישות השבוע` : 'לא מחובר לגוגל קלנדר'}
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
              {isConnected ? 'מחובר לגוגל קלנדר' : 'לא מחובר לגוגל קלנדר'}
            </span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <img 
              src="https://developers.google.com/calendar/images/calendar_icon.png" 
              alt="Google Calendar" 
              className="w-8 h-8"
            />
            <h3 className="text-lg font-semibold text-gray-900">Google Calendar</h3>
          </div>
        </div>
      </div>

      {/* Events List */}
      {isConnected ? (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    {event.start.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} - 
                    {event.end.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-right">{event.title}</h3>
              </div>
              
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-end space-x-2 space-x-reverse">
                  <span className="text-sm text-gray-600">{event.location}</span>
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-end space-x-2 space-x-reverse">
                  <span className="text-sm text-gray-600">{event.attendees.join(', ')}</span>
                  <Users className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500">
                  {event.start.toLocaleDateString('he-IL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">התחבר לגוגל קלנדר</h3>
          <p className="text-gray-500 mb-6">
            התחבר לגוגל קלנדר כדי לראות ולנהל פגישות ישירות מהמערכת
          </p>
          <button
            onClick={handleConnectCalendar}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            התחבר עכשיו
          </button>
        </div>
      )}

      {/* Connection Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                התחברות לגוגל קלנדר
              </h3>
              <p className="text-gray-600 mb-6 text-right">
                האם אתה מאשר חיבור לגוגל קלנדר? זה יאפשר למערכת לגשת ליומן שלך.
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  ביטול
                </button>
                <button
                  onClick={handleConfirmConnection}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  אשר חיבור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManager;
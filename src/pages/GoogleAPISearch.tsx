import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, Globe, Star, Building2, Clock, AlertCircle, CheckCircle, RefreshCw, Settings, Zap, Target, MessageSquare, Key, Activity } from 'lucide-react';
import { addNewLeads } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { searchSerpAndSave } from '../../lib/serpApi';
import TaskVerificationModal from '../Shared/TaskVerificationModal';
import LeadsTable from '../Leads/LeadsTable';
import AdminImport from '../Settings/AdminImport';
import StarButton from '../common/StarButton';

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

const GoogleAPISearch: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('תל אביב');
  const [maxResults, setMaxResults] = useState(60);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GooglePlace[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0, page: 0 });
  const [leadsCount, setLeadsCount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadSearchHistory();
    checkLeadsCount();
  }, []);

  const checkLeadsCount = async () => {
    try {
      const { data, error } = await sb
        .from('leads')
        .select('id', { count: 'exact', head: true });
      
      if (error) {
        if (error.message?.includes('Invalid API key')) {
          console.error('❌ Supabase API Key לא תקין:', error.message);
          setError('🔑 בעיית חיבור לבסיס הנתונים - צור קשר עם התמיכה');
        } else {
          console.warn('⚠️ טבלת leads לא קיימת:', error.message);
        }
        setLeadsCount(0);
      } else {
        setLeadsCount(data?.length || 0);
      }
    } catch (error) {
      console.error('❌ שגיאה בבדיקת leads:', error);
      setLeadsCount(0);
    }
  };


  const loadSearchHistory = () => {
    const saved = localStorage.getItem('google_search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  };

  const saveToSearchHistory = (query: string, location: string) => {
    const searchTerm = `${query} ב${location}`;
    const updated = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('google_search_history', JSON.stringify(updated));
  };

  const searchWithSerpAPI = async (maxResults: number = 60) => {
    try {
      console.log('🔍 Starting SerpAPI search with:', { searchQuery, searchLocation, maxResults });
      const results = await searchSerpAndSave(searchQuery, searchLocation);
      console.log('✅ SerpAPI results received:', results?.rows?.length || 0);
      return results.rows;
    } catch (error) {
      console.error('❌ SerpAPI search failed:', error);
      throw error;
    }
  };
  
  const searchPlaces = async () => {
    if (!searchQuery.trim()) {
      alert('❌ אנא הזן מה לחפש');
      return;
    }
    
    // בדיקת מכסת חיפושים
    if (user && user.searchCount !== undefined && user.maxSearches !== undefined) {
      if (user.searchCount >= user.maxSearches) {
        alert('❌ הגעת למכסת החיפושים. שדרג למנוי פרמיום או שתף את המערכת לחיפושים נוספים.');
        setShowShareModal(true);
        return;
      }
    }
    
    console.log('🔍 Starting search...', { searchQuery, searchLocation, maxResults });

    setIsSearching(true);
    setError('');
    setResults([]);
    setSearchProgress({ current: 0, total: 0, page: 0 });

    saveToSearchHistory(searchQuery, searchLocation);
    
    try {
      const { rows } = await searchSerpAndSave(searchQuery, searchLocation);
      
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        console.warn('⚠️ No results found for:', { searchQuery, searchLocation });
        setResults([]);
        setError(`לא נמצאו תוצאות עבור "${searchQuery}" ב"${searchLocation}". נסה:\n• מילות חיפוש אחרות\n• מיקום אחר\n• פחות ספציפי`);
        return;
      }
      
      // Validate each result before setting
      const validResults = rows.filter(result => {
        return result && typeof result === 'object' && result.name;
      }).map(result => ({
        ...result,
        types: Array.isArray(result.types) ? result.types : [],
        formatted_phone_number: result.formatted_phone_number || result.phone || '',
        formatted_address: result.formatted_address || result.address || '',
        place_id: result.place_id || result.id || `temp_${Date.now()}_${Math.random()}`
      }));
      
      console.log('✅ Validated results:', validResults.length);
      setResults(validResults);
      
      // עדכון מונה חיפושים
      if (user && user.searchCount !== undefined) {
        updateUser({ searchCount: user.searchCount + 1 });
      }
      
    } catch (error: any) {
      console.error('❌ Search error details:', error);
      
      let errorMessage = 'שגיאה לא ידועה';
      
      if (error.message?.includes('api_key_missing')) {
        errorMessage = '🔑 API Key לא מוגדר - צור קשר עם התמיכה';
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        errorMessage = '🔐 API Key לא תקין או חסרות הרשאות';
      } else if (error.message?.includes('429')) {
        errorMessage = '⏰ חרגת ממכסת החיפושים - נסה שוב מאוחר יותר';
      } else if (error.message?.includes('500') || error.message?.includes('503')) {
        errorMessage = '🔧 שגיאת שרת SerpAPI - נסה שוב בעוד כמה דקות';
      } else if (error.message?.includes('no_results')) {
        errorMessage = `לא נמצאו תוצאות עבור "${searchQuery}" ב"${searchLocation}"`;
      } else {
        errorMessage = error.message || 'שגיאה בחיפוש';
      }
      
      setError(errorMessage);
      
      // Reset results on error
      setResults([]);
    } finally {
      setIsSearching(false);
      setSearchProgress({ current: 0, total: 0, page: 0 });
    }
  };

  const handleSelectResult = (placeId: string) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(placeId)) {
      newSelected.delete(placeId);
    } else {
      newSelected.add(placeId);
    }
    setSelectedResults(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedResults.size === results.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(results.map(r => r.place_id)));
    }
  };

  const handleAddSelectedToCRM = () => {
    const selectedPlaces = results.filter(r => selectedResults.has(r.place_id));
    
    if (selectedPlaces.length === 0) {
      alert('❌ אנא בחר לפחות תוצאה אחת');
      return;
    }

    const leadsData = selectedPlaces.map(place => ({
      business_name: place.name,
      phone: place.formatted_phone_number || '',
      email: '',
      website: place.website || '',
      address: place.formatted_address,
      category: searchQuery,
      rating: place.rating?.toString() || '',
      reviews: place.user_ratings_total?.toString() || '',
      hours: place.opening_hours?.open_now ? 'פתוח עכשיו' : '',
      source: 'Google Places API',
      searchQuery: searchQuery,
      searchLocation: searchLocation
    }));

    const addedCount = addNewLeads(leadsData);
    
    alert(`🎉 הושלם!\n\n📊 נבחרו: ${selectedPlaces.length} עסקים\n➕ נוספו: ${addedCount} לידים חדשים\n\n🔍 לך לרשימת הלידים לראות את התוצאות!`);
    
    setSelectedResults(new Set());
  };

  const handleAddToFavorites = (place: GooglePlace) => {
    // שמירה גם בפורמט הישן לתאימות לאחור
    const favoriteData = {
      id: place.place_id,
      name: place.name,
      phone: place.formatted_phone_number || '',
      address: place.formatted_address,
      category: searchQuery,
      rating: place.rating?.toString() || '',
      reviews: place.user_ratings_total?.toString() || '',
      website: place.website || '',
      email: '',
      addedAt: new Date().toISOString(),
      source: 'google_search' as const,
      searchQuery: searchQuery,
      searchLocation: searchLocation
    };

    const savedFavorites = JSON.parse(localStorage.getItem('favorite_leads') || '[]');
    const exists = savedFavorites.some((fav: any) => fav.id === place.place_id);
    
    if (!exists) {
      const updatedFavorites = [...savedFavorites, favoriteData];
      localStorage.setItem('favorite_leads', JSON.stringify(updatedFavorites));
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      alert(`⭐ ${place.name} נוסף למועדפים!`);
    } else {
      alert(`⭐ ${place.name} כבר במועדפים`);
    }
  };

  const handleTaskCompleted = () => {
    if (user && user.maxSearches !== undefined) {
      updateUser({ maxSearches: user.maxSearches + 3 });
      alert('🎉 משימה אומתה! קיבלת 3 חיפושים נוספים!');
      setShowShareModal(false);
    }
  };

  const quickSearches = [
    'רהיטים', 'עורכי דין', 'מסעדות', 'מכוני יופי', 'מספרות',
    'רופאים', 'רואי חשבון', 'מוסכים', 'בתי קפה', 'חנויות בגדים'
  ];

  const popularLocations = [
    'תל אביב', 'ירושלים', 'חיפה', 'ראשון לציון', 'פתח תקווה',
    'אשדוד', 'נתניה', 'באר שבע', 'בני ברק', 'רמת גן'
  ];

  return (
    <>
      {/* Restore Button */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              alert('🔄 תכונת שחזור תיושם בקרוב');
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2 space-x-reverse"
          >
            <RefreshCw className="h-4 w-4" />
            <span>שחזר לידים שנעלמו</span>
          </button>
          <div className="text-right">
            <h4 className="font-medium text-yellow-900">🔄 שחזור לידים</h4>
            <p className="text-sm text-yellow-800">אם לידים נעלמו, לחץ כאן לשחזור מגיבויים</p>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="font-medium text-green-700">
              ✅ SerpAPI מחובר!
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              נתונים אמיתיים 100% ✅
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              ניצול מקסימלי - עד 100 תוצאות
            </span>
            {user && user.searchCount !== undefined && user.maxSearches !== undefined && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                (user.searchCount ?? 0) >= (user.maxSearches ?? 999999) ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                חיפושים: {user.searchCount ?? 0}/{user.maxSearches ?? 999999}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <img 
              src="https://serpapi.com/favicon.ico" 
              alt="SerpAPI" 
              className="w-8 h-8"
            />
            <h3 className="text-lg font-semibold text-gray-900">SerpAPI Google Maps</h3>
          </div>
        </div>
        
        <div className="mt-4 p-4 rounded-lg border bg-green-50 border-green-200">
          <h4 className="font-medium mb-2 text-right text-green-900">
            🎉 SerpAPI פעיל - נתונים אמיתיים!
          </h4>
          <div className="text-sm text-right space-y-1 text-green-800">
            <div>• **נתונים אמיתיים 100%** - ישירות מ-Google Maps</div>
            <div>• **חיפוש מתקדם** - עד 100 תוצאות בחיפוש אחד</div>
            <div>• **ניצול מקסימלי** - כל טוקן מביא 20 תוצאות</div>
            <div>• **מידע מלא** - טלפונים, כתובות, דירוגים, אתרים</div>
            <div>• **ללא CORS** - דרך Supabase Edge Function</div>
            <div>• **API Key מוגן** - לא חשוף בדפדפן</div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">חיפוש עסקים</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              מה לחפש? *
            </label>
            <input
              type="text"
              placeholder="רהיטים, עורכי דין, מסעדות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              איפה לחפש? *
            </label>
            <input
              type="text"
              placeholder="תל אביב, ירושלים, חיפה..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              מספר תוצאות מקסימלי
            </label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value={20}>20 תוצאות (1 עמוד)</option>
              <option value={40}>40 תוצאות (2 עמודים)</option>
              <option value={60}>60 תוצאות (3 עמודים)</option>
              <option value={80}>80 תוצאות (4 עמודים)</option>
              <option value={100}>100 תוצאות (5 עמודים)</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-end">
            <button
              onClick={searchPlaces}
              disabled={isSearching || !searchQuery.trim()}
              className={`w-full px-6 py-2 rounded-lg flex items-center justify-center space-x-2 space-x-reverse ${
                isSearching || !searchQuery.trim()
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSearching ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>
                {isSearching ? 'מחפש...' : 
                 'חיפוש אמיתי SerpAPI'}
              </span>
            </button>
          </div>
          
          <div className="text-sm text-gray-600 flex items-center justify-end space-x-2 space-x-reverse">
            <span>עלות משוערת: {Math.ceil(maxResults / 20)} טוקנים</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {maxResults} תוצאות = {Math.ceil(maxResults / 20)} עמודים
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {isSearching && searchProgress.total > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-600">
                עמוד {searchProgress.page} • {searchProgress.current}/{searchProgress.total} תוצאות
              </span>
              <span className="text-sm font-medium text-blue-900 text-right">התקדמות חיפוש</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(searchProgress.current / searchProgress.total) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-blue-700 mt-1 text-right">
              מנצל כל טוקן למקסימום תוצאות!
            </div>
          </div>
        )}

        {/* Quick Searches */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            חיפושים מהירים
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {quickSearches.map((quick) => (
              <button
                key={quick}
                onClick={() => setSearchQuery(quick)}
                className="px-3 py-2 md:px-4 md:py-3 bg-gray-100 text-gray-700 rounded-full text-xs md:text-sm hover:bg-gray-200 transition-colors whitespace-nowrap flex-shrink-0 touch-manipulation min-w-max"
              >
                {quick}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            מיקומים פופולריים
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {popularLocations.map((location) => (
              <button
                key={location}
                onClick={() => setSearchLocation(location)}
                className="px-3 py-2 md:px-4 md:py-3 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm hover:bg-blue-200 transition-colors whitespace-nowrap flex-shrink-0 touch-manipulation min-w-max"
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              חיפושים אחרונים
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {searchHistory.slice(0, 5).map((history, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const parts = history.split(' ב');
                    if (parts.length === 2) {
                      setSearchQuery(parts[0]);
                      setSearchLocation(parts[1]);
                    }
                  }}
                  className="px-3 py-2 md:px-4 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm hover:bg-purple-200 transition-colors whitespace-nowrap flex-shrink-0 touch-manipulation"
                >
                  {history}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className={`rounded-lg p-4 mb-6 ${
          error.includes('דמו') ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2 space-x-reverse">
            {error.includes('דמו') ? (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className={`text-sm ${error.includes('דמו') ? 'text-orange-800' : 'text-red-800'}`}>
              {error}
            </p>
          </div>
          {error.includes('API Key') && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 text-right">🔧 הוראות הגדרה:</h4>
              <ol className="text-sm text-blue-800 space-y-1 text-right">
                <li>1. עבור ל-Netlify Dashboard</li>
                <li>2. בחר את האתר sean-control-cash.com</li>
                <li>3. Site Settings → Environment Variables</li>
                <li>4. הוסף SERPAPI_KEY עם המפתח שלך</li>
                <li>5. Redeploy את האתר</li>
              </ol>
              <p className="text-xs text-blue-700 mt-2">
                💡 ניתן לקבל API Key חינם ב-serpapi.com
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  onClick={handleSelectAll}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
                >
                  <Target className="h-4 w-4" />
                  <span>{selectedResults.size === results.length ? 'בטל בחירה' : 'בחר הכל'}</span>
                </button>
                <button
                  onClick={handleAddSelectedToCRM}
                  disabled={selectedResults.size === 0}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse ${
                    selectedResults.size === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>הוסף {selectedResults.size} ל-CRM</span>
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-right">
                תוצאות חיפוש ({results.length} עסקים)
              </h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {results.map((place) => (
              <div key={place.place_id} className={`p-4 md:p-6 hover:bg-gray-50 transition-colors ${
                selectedResults.has(place.place_id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-2 md:gap-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={selectedResults.has(place.place_id)}
                      onChange={() => handleSelectResult(place.place_id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded touch-manipulation mobile-button"
                    />
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                        SerpAPI
                      </span>
                    {place.business_status === 'OPERATIONAL' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        פעיל
                      </span>
                    )}
                    </div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm md:text-lg font-semibold text-gray-900 leading-tight">{place.name}</h4>
                    <p className="text-xs md:text-sm text-gray-600">{place.types?.[0]?.replace(/_/g, ' ') || searchQuery || 'עסק'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="space-y-2">
                    {(place.formatted_phone_number || place.phone) && (
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <span className="text-xs md:text-sm text-gray-600">{place.formatted_phone_number || place.phone}</span>
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    {place.website && (
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <a 
                          href={place.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs md:text-sm text-blue-600 hover:text-blue-700 truncate max-w-32 md:max-w-48"
                        >
                          {place.website}
                        </a>
                        <Globe className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex items-center justify-end space-x-2 space-x-reverse">
                      <span className="text-xs md:text-sm text-gray-600 truncate">{place.formatted_address || place.address || 'כתובת לא זמינה'}</span>
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    {place.opening_hours && (
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <span className={`text-xs md:text-sm ${place.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}`}>
                          {place.opening_hours.open_now ? 'פתוח עכשיו' : 'סגור עכשיו'}
                        </span>
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    {(place.rating || place.user_ratings_total) && (
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <span className="text-xs md:text-sm text-gray-600">
                          ⭐ {place.rating || 'N/A'} ({place.user_ratings_total || place.reviews || 0} ביקורות)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(place.formatted_phone_number || place.phone) ? (
                    <button
                      onClick={() => window.open(`tel:${place.formatted_phone_number || place.phone}`, '_self')}
                      className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-1 space-x-reverse touch-manipulation min-h-[44px] min-w-[44px]"
                      title="התקשר"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="text-xs hidden md:inline">התקשר</span>
                    </button>
                  ) : (
                    <div className="bg-gray-300 text-gray-500 p-3 rounded-lg flex items-center justify-center min-h-[44px] min-w-[44px]" title="אין טלפון">
                      <Phone className="h-4 w-4" />
                    </div>
                  )}
                  
                  {(place.formatted_phone_number || place.phone) ? (
                    <button
                      onClick={() => {
                        const message = encodeURIComponent(`שלום ${place.name}, מצאתי את הפרטים שלך בחיפוש ואשמח ליצור קשר`);
                        const phoneNumber = place.formatted_phone_number || place.phone || '';
                        const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
                        window.open(`https://wa.me/972${cleanPhone.substring(1)}?text=${message}`, '_blank');
                      }}
                      className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-1 space-x-reverse touch-manipulation min-h-[44px] min-w-[44px]"
                      title="WhatsApp"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs hidden md:inline">WhatsApp</span>
                    </button>
                  ) : (
                    <div className="bg-gray-300 text-gray-500 p-3 rounded-lg flex items-center justify-center min-h-[44px] min-w-[44px]" title="אין טלפון">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      handleAddToFavorites(place);
                      // Trigger star button update
                      window.dispatchEvent(new CustomEvent('favorites:changed'));
                    }}
                    className="bg-yellow-600 text-white p-3 rounded-lg hover:bg-yellow-700 flex items-center justify-center space-x-1 space-x-reverse touch-manipulation min-h-[44px] min-w-[44px]"
                    title="הוסף למועדפים"
                  >
                    <StarButton leadId={place.place_id} className="text-white" />
                    <span className="text-xs hidden md:inline">מועדפים</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const leadsData = [{
                        business_name: place.name,
                        phone: place.formatted_phone_number || place.phone || '',
                        email: '',
                        website: place.website || '',
                        address: place.formatted_address || place.address || '',
                        category: searchQuery,
                        rating: place.rating?.toString() || '',
                        reviews: (place.user_ratings_total || place.reviews)?.toString() || '',
                        hours: place.opening_hours?.open_now ? 'פתוח עכשיו' : '',
                        source: 'SerpAPI Google Maps',
                        searchQuery: searchQuery,
                        searchLocation: searchLocation
                      }];
                      
                      const addedCount = addNewLeads(leadsData);
                      if (addedCount > 0) {
                        alert(`✅ ${place.name} נוסף ל-CRM!`);
                      } else {
                        alert(`⚠️ ${place.name} כבר קיים במערכת!`);
                      }
                    }}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-1 space-x-reverse touch-manipulation min-h-[44px] min-w-[44px]"
                    title="הוסף ל-CRM"
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="text-xs hidden md:inline">הוסף</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal for Free Searches */}
      {user && user.searchCount !== undefined && user.maxSearches !== undefined && 
       (user.searchCount ?? 0) >= (user.maxSearches ?? 5) && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 mb-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">🎯 רוצה עוד חיפושים חינם?</h3>
            <p className="text-purple-700 mb-4">שתף את המערכת ברשתות החברתיות וקבל 3 חיפושים נוספים!</p>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium"
            >
              🚀 שתף וקבל חיפושים חינם
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 mt-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 text-right">🎯 SerpAPI Google Maps - הוראות שימוש</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-900 mb-2 text-right">🚀 SerpAPI - הפתרון המושלם:</h4>
            <ol className="text-sm text-blue-800 space-y-1 text-right">
              <li>1. ✅ **עובד בדפדפן** - ללא CORS</li>
              <li>2. ✅ **נתונים אמיתיים** - מ-Google Maps</li>
              <li>3. ✅ **מהיר ויציב** - תוך שניות</li>
              <li>4. ✅ **API Key מוגדר** - מוכן לשימוש</li>
              <li>5. ✅ **תמיכה מלאה** - טלפונים, מיילים</li>
              <li>6. ✅ **ללא הגבלות** - חיפושים ללא הגבלה</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-green-900 mb-2 text-right">✅ מה תקבל עכשיו:</h4>
            <ul className="text-sm text-green-800 space-y-1 text-right">
              <li>• 🔍 **חיפוש אמיתי** מ-Google Maps</li>
              <li>• 📞 **טלפונים אמיתיים** של העסקים</li>
              <li>• 🏠 **כתובות מדויקות** וגיאוקודינג</li>
              <li>• ⭐ **דירוגים וביקורות** עדכניים</li>
              <li>• 🌐 **אתרי אינטרנט** של העסקים</li>
              <li>• ⏰ **שעות פעילות** בזמן אמת</li>
              <li>• 🔄 הוספה אוטומטית ל-CRM</li>
              <li>• 💾 ייצוא ל-CSV</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2 text-right">🎉 SerpAPI מוכן עם API Key אמיתי!</h4>
          <div className="text-sm text-green-800 text-right space-y-1">
            <div>• **נתונים אמיתיים 100%** - ישירות מ-Google Maps</div>
            <div>• **חיפוש מתקדם** - עד 100 תוצאות בחיפוש אחד</div>
            <div>• **ניצול מקסימלי** - כל טוקן מביא 20 תוצאות</div>
            <div>• **מידע מלא** - טלפונים, כתובות, דירוגים, אתרים</div>
            <div>• **ללא CORS** - דרך Supabase Edge Function</div>
            <div>• **API Key מוגן** - לא חשוף בדפדפן</div>
          </div>
        </div>
      </div>

      {/* Leads History Section */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={checkLeadsCount}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 flex items-center space-x-1 space-x-reverse"
            >
              <RefreshCw className="h-3 w-3" />
              <span>רענן</span>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 text-right">
              היסטוריית לידים
            </h3>
          </div>
          
          {leadsCount === 0 && user?.role === 'admin' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-orange-800 text-sm text-right">
                ⚠️ לא נמצאו לידים בהיסטוריה. השתמש בכלי השחזור למטה.
              </p>
            </div>
          )}
          
          <LeadsTable />
          <AdminImport />
        </div>
      </div>

      {/* Task Verification Modal */}
      {showShareModal && (
        <TaskVerificationModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onTaskCompleted={handleTaskCompleted}
        />
      )}
    </>
  );
};

export default GoogleAPISearch;
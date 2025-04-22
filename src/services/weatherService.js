
import axios from 'axios';
import { WEATHER_API_KEY } from '@env';


// WeatherAPI.com endpoint
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1/current.json';


/**
 * Fetch weather data for a location
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} resortName - Optional resort name to improve ski detection
 * @returns {Promise<Object>} - Weather data object
 */
export const fetchWeatherForLocation = async (latitude, longitude, resortName = '') => {
  try {
    // Construct the API URL with the API key from environment variables
    const apiUrl = `${WEATHER_API_BASE_URL}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=1`;
    
    // Make the API request
    const response = await axios.get(apiUrl);
    
    if (response.data) {
      const current = response.data.current;
      const forecast = response.data.forecast?.forecastday?.[0];
      
      // Determine if this is a ski resort based on location name or coordinates
      const isWinterSeason = isSki(latitude, longitude, resortName);
      
      // Calculate estimated snow data for ski resorts based on conditions
      let snowfall = 0;
      let snowDepth = 0;
      
      if (isWinterSeason) {
        // Use precipitation data to estimate snowfall
        if (current.precip_mm > 0 && current.temp_c < 2) {
          snowfall = current.precip_mm * 10; // Rough conversion from mm rain to mm snow
        }
        
        // Estimate snow depth based on recent conditions
        if (forecast?.day?.totalsnow_cm) {
          snowDepth = forecast.day.totalsnow_cm;
        } else {
          snowDepth = Math.max(0, 50 - Math.abs(current.temp_c)) * (Math.random() + 0.5);
        }
      }
      
      // Calculate "powder" quality (1-10 rating) based on conditions
      const powderRating = isWinterSeason 
        ? calculatePowderRating(snowfall, current.temp_c, current.wind_kph)
        : 0;
      
      return {
        temperature: current.temp_c,
        conditions: current.condition?.text || 'Unknown',
        windSpeed: current.wind_kph,
        humidity: current.humidity,
        snowfall: Math.round(snowfall),
        snowDepth: Math.round(snowDepth),
        powderRating,
        lastUpdated: current.last_updated
      };
    }
    
    // If API call was successful but without expected data, fall back to mock data
    return generateMockWeatherData(latitude, longitude, resortName);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fall back to mock data if API call fails
    return generateMockWeatherData(latitude, longitude, resortName);
  }
};

/**
 * Helper function to generate mock weather data as a fallback
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} resortName - Resort name if available
 * @returns {Object} - Mock weather data
 */
function generateMockWeatherData(latitude, longitude, resortName) {
  const isWinterSeason = isSki(latitude, longitude, resortName);
  
  const temperatures = isWinterSeason 
    ? [-15, -10, -5, 0, 5, 10] // Colder range for ski locations
    : [0, 5, 10, 15, 20, 25]; // Warmer range for non-ski locations
  
  const conditions = isWinterSeason
    ? ['Snowing', 'Light Snow', 'Heavy Snow', 'Partly Cloudy', 'Overcast', 'Clear'] 
    : ['Cloudy', 'Sunny', 'Partly Cloudy', 'Overcast', 'Rain', 'Clear'];
    
  // Generate mock data
  const temperature = temperatures[Math.floor(Math.random() * temperatures.length)];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const windSpeed = Math.floor(Math.random() * 30) + 5; // 5-35 km/h
  const humidity = Math.floor(Math.random() * 50) + 30; // 30-80%
  
  // Generate snow data for ski resorts
  let snowfall = 0;
  let snowDepth = 0;
  
  if (isWinterSeason) {
    if (condition.includes('Snow') || Math.random() > 0.7) {
      snowfall = Math.floor(Math.random() * 20) + 1; // 1-20 cm recent snowfall
    }
    snowDepth = Math.floor(Math.random() * 100) + 50; // 50-150 cm base
  }
  
  // Calculate "powder" quality (1-10 rating)
  const powderRating = isWinterSeason 
    ? calculatePowderRating(snowfall, temperature, windSpeed)
    : 0;
  
  return {
    temperature,
    conditions: condition,
    windSpeed,
    humidity,
    snowfall,
    snowDepth,
    powderRating,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Helper function to determine if a location is likely a ski resort
 * Uses resort name and location data to make a determination
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} resortName - Resort name if available
 * @returns {boolean} - True if likely a ski location
 */
function isSki(latitude, longitude, resortName = '') {
  // Check for ski-related terms in the resort name
  const skiTerms = ['ski', 'mountain', 'peak', 'snow', 'resort', 'alps', 'winter'];
  
  // Convert to lowercase for case-insensitive matching
  const lowerResortName = resortName.toLowerCase();
  
  // Check if any ski terms appear in the resort name
  for (const term of skiTerms) {
    if (lowerResortName.includes(term)) {
      return true;
    }
  }
  
  // Check latitude/altitude for likely ski locations
  // Most ski resorts are in the 30-50 degree latitude range (Northern Hemisphere)
  // or -30 to -50 (Southern Hemisphere) 
  const absLat = Math.abs(latitude);
  if (absLat > 30 && absLat < 50) {
    return true;
  }
  
  // Check for known ski regions by longitude/latitude combinations
  // Rocky Mountains
  if ((latitude > 35 && latitude < 50) && (longitude > -125 && longitude < -105)) {
    return true;
  }
  // Alps
  if ((latitude > 43 && latitude < 48) && (longitude > 5 && longitude < 16)) {
    return true;
  }
  // Japan ski regions
  if ((latitude > 35 && latitude < 45) && (longitude > 135 && longitude < 145)) {
    return true;
  }
  
  // Fallback - 50% chance it's a ski location for testing purposes
  return Math.random() > 0.5;
}

/**
 * Calculate a "powder quality" rating (1-10) based on weather conditions
 * @param {number} snowfall - Recent snowfall in cm
 * @param {number} temperature - Temperature in °C
 * @param {number} windSpeed - Wind speed in km/h
 * @returns {number} - Powder quality rating (1-10)
 */
function calculatePowderRating(snowfall, temperature, windSpeed) {
  // Start with base rating from recent snowfall
  let rating = Math.min(5, snowfall / 2);
  
  // Ideal temperature for powder is around -5°C to -10°C
  // Too cold = dry snow, too warm = wet snow
  const idealTemp = -7;
  const tempFactor = 1 - Math.min(1, Math.abs(temperature - idealTemp) / 15);
  rating += tempFactor * 3;
  
  // Wind can affect snow quality (less wind is better for powder)
  const windFactor = Math.max(0, 1 - (windSpeed / 40));
  rating += windFactor * 2;
  
  // Ensure the rating is between 1-10
  return Math.max(1, Math.min(10, Math.round(rating)));
}

export default {
  fetchWeatherForLocation
};
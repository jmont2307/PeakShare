/**
 * Weather service for the PeakShare app
 * This is a mock implementation that returns random weather data
 * In a production app, you would replace this with a real weather API
 */

export const fetchWeatherForLocation = async (latitude, longitude) => {
  try {
    // Since we don't have a real weather API key, we'll generate mock weather data
    // In a real app, you would call an API like OpenWeatherMap, Weather.com, etc.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate random weather data based on location
    // In a real app, this would come from the API response
    const isWinterSeason = isSki(latitude, longitude);
    
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
    if (isWinterSeason && (condition.includes('Snow') || Math.random() > 0.7)) {
      snowfall = Math.floor(Math.random() * 20) + 1; // 1-20 cm recent snowfall
    }
    
    // Calculate "powder" quality (1-10 rating)
    const powderRating = isWinterSeason 
      ? Math.min(10, Math.floor(snowfall / 2) + Math.floor(Math.random() * 5))
      : 0;
    
    return {
      temperature,
      conditions: condition,
      windSpeed,
      humidity,
      snowfall,
      powderRating,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating weather data:', error);
    // Return default values in case of error
    return {
      temperature: 0,
      conditions: 'Unknown',
      windSpeed: 10,
      humidity: 50,
      snowfall: 0,
      powderRating: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Helper function to determine if a location is likely a ski resort
 * In a real app, you would use a database of ski resorts or a more accurate method
 */
function isSki(latitude, longitude) {
  // This is just a mock implementation that returns true ~70% of the time
  // In a real app, you would check against a database of ski resort coordinates
  return Math.random() > 0.3;
}
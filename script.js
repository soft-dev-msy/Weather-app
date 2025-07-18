  // API Configuration
        const API_KEY = '914a387cc9cd8b68f264f2449551e098'; // Replace with your actual API key
        const BASE_URL = 'https://api.openweathermap.org/data/2.5';
        
        // DOM Elements
        const locationInput = document.getElementById('location-input');
        const searchBtn = document.getElementById('search-btn');
        const errorMessage = document.getElementById('error-message');
        const loadingElement = document.getElementById('loading');
        const currentWeatherSection = document.getElementById('current-weather');
        const forecastSection = document.getElementById('forecast-section');
        
        // Weather data units (metric for Celsius)
        const units = 'metric';
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', () => {
            // Set default location (New York)
            fetchWeather('New York');
            
            // Event listener for search button
            searchBtn.addEventListener('click', handleSearch);
            
            // Event listener for Enter key in search input
            locationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSearch();
                }
            });
        });
        
        // Handle search functionality
        function handleSearch() {
            const location = locationInput.value.trim();
            
            if (location) {
                fetchWeather(location);
            } else {
                showError('Please enter a location');
            }
        }
        
        // Fetch weather data from API
        async function fetchWeather(location) {
            try {
                // Show loading state
                showLoading(true);
                hideError();
                
                // Fetch current weather
                const currentWeatherUrl = `${BASE_URL}/weather?q=${location}&units=${units}&appid=${API_KEY}`;
                const currentResponse = await fetch(currentWeatherUrl);
                
                if (!currentResponse.ok) {
                    throw new Error('Location not found');
                }
                
                const currentData = await currentResponse.json();
                
                // Fetch forecast
                const forecastUrl = `${BASE_URL}/forecast?q=${location}&units=${units}&appid=${API_KEY}`;
                const forecastResponse = await fetch(forecastUrl);
                const forecastData = await forecastResponse.json();
                
                // Display weather data
                displayCurrentWeather(currentData);
                displayForecast(forecastData);
                
                // Hide loading state
                showLoading(false);
                
            } catch (error) {
                showLoading(false);
                showError(error.message || 'Failed to fetch weather data');
                console.error('Error fetching weather data:', error);
            }
        }
        
        // Display current weather data
        function displayCurrentWeather(data) {
            const { name, sys, main, weather, wind, dt } = data;
            
            // Set location
            document.getElementById('location').textContent = `${name}, ${sys.country}`;
            
            // Set date
            const date = new Date(dt * 1000);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('current-date').textContent = date.toLocaleDateString('en-US', options);
            
            // Set temperature and weather description
            document.getElementById('current-temp').textContent = `${Math.round(main.temp)}°C`;
            document.getElementById('weather-desc').textContent = weather[0].description;
            
            // Set weather icon
            const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
            document.getElementById('weather-icon').src = iconUrl;
            document.getElementById('weather-icon').alt = weather[0].main;
            
            // Set additional details
            document.getElementById('feels-like').textContent = `${Math.round(main.feels_like)}°C`;
            document.getElementById('humidity').textContent = `${main.humidity}%`;
            document.getElementById('wind-speed').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
            document.getElementById('pressure').textContent = `${main.pressure} hPa`;
            
            // Show current weather section
            currentWeatherSection.style.display = 'grid';
        }
        
        // Display 5-day forecast
        function displayForecast(data) {
            const forecastContainer = document.getElementById('forecast-container');
            forecastContainer.innerHTML = '';
            
            // Group forecast by day (OpenWeatherMap provides 3-hour intervals)
            const dailyForecast = {};
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dateString = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                
                if (!dailyForecast[dateString]) {
                    dailyForecast[dateString] = {
                        date: dateString,
                        temps: [],
                        weather: []
                    };
                }
                
                dailyForecast[dateString].temps.push(item.main.temp);
                dailyForecast[dateString].weather.push(item.weather[0]);
            });
            
            // Get the next 5 days
            const forecastDays = Object.values(dailyForecast).slice(0, 5);
            
            // Create forecast cards
            forecastDays.forEach(day => {
                // Calculate min/max temp
                const maxTemp = Math.round(Math.max(...day.temps));
                const minTemp = Math.round(Math.min(...day.temps));
                
                // Get most common weather condition
                const weatherCount = {};
                day.weather.forEach(weather => {
                    const key = weather.main;
                    weatherCount[key] = (weatherCount[key] || 0) + 1;
                });
                
                const mostCommonWeather = Object.keys(weatherCount).reduce((a, b) => 
                    weatherCount[a] > weatherCount[b] ? a : b
                );
                
                const weatherIcon = day.weather.find(w => w.main === mostCommonWeather).icon;
                
                // Create forecast card
                const forecastDayElement = document.createElement('div');
                forecastDayElement.className = 'forecast-day';
                forecastDayElement.innerHTML = `
                    <div class="forecast-date">${day.date}</div>
                    <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${mostCommonWeather}" class="forecast-icon">
                    <div class="forecast-temp">
                        <span class="temp-max">${maxTemp}°</span>
                        <span class="temp-min">${minTemp}°</span>
                    </div>
                `;
                
                forecastContainer.appendChild(forecastDayElement);
            });
            
            // Show forecast section
            forecastSection.style.display = 'block';
        }
        
        // Show loading state
        function showLoading(show) {
            loadingElement.style.display = show ? 'block' : 'none';
            currentWeatherSection.style.display = show ? 'none' : 'grid';
            forecastSection.style.display = show ? 'none' : 'block';
        }
        
        // Show error message
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        
        // Hide error message
        function hideError() {
            errorMessage.style.display = 'none';
        }

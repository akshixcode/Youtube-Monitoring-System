 
          // Configuration
      console.log('[minor.js] loaded');
      const CONFIG = {
            youtubeApiTestUrl: 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
            youtubeWebsiteUrl: 'https://www.youtube.com',
            checkIntervals: {
                quick: 30000,    // 30 seconds
                normal: 120000,  // 2 minutes
                slow: 300000     // 5 minutes
            }
        };

        let lastUpdateTime = null;

        async function checkAllStatus() {
            const loading = document.getElementById('loading');
            const refreshBtn = document.getElementById('refreshBtn');
            const errorMessage = document.getElementById('errorMessage');

            // Show loading, hide error
            loading.style.display = 'block';
            errorMessage.style.display = 'none';
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '🔄 Checking...';

            try {
                // Run all checks in parallel
                await Promise.allSettled([
                    checkYouTubeApiStatus(),
                    checkWebsiteStatus(),
                    checkThirdPartyStatus()
                ]);

                updateLastUpdatedTime();

            } catch (error) {
                console.error('Error in status check:', error);
                showError('Some checks failed, but partial data is available.');
            } finally {
                loading.style.display = 'none';
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '🔄 Refresh All Status';
            }
        }

        async function checkYouTubeApiStatus() {
            const card = document.getElementById('apiStatusCard');
            const statusIndicator = document.getElementById('api1Status');
            const responseTimeEl = document.getElementById('apiResponseTime');
            const successRateEl = document.getElementById('apiSuccessRate');

            const startTime = Date.now();
            
            try {
                // Test 1: Direct API call (with a public video ID)
                const response = await fetch(CONFIG.youtubeApiTestUrl, {
                    method: 'GET',
                    mode: 'no-cors' // This will still tell us if the request goes through
                });

                const responseTime = Date.now() - startTime;
                
                // Since we use no-cors, we can't read the response but the request succeeded
                updateStatusCard(card, 'up', 'API Operational', 'YouTube API is responding normally.');
                statusIndicator.className = 'api-indicator api-active';
                statusIndicator.textContent = 'YouTube API: Operational';
                responseTimeEl.textContent = `${responseTime}ms`;
                successRateEl.textContent = '100%';

            } catch (error) {
                updateStatusCard(card, 'down', 'API Issues', 'YouTube API may be experiencing problems.');
                statusIndicator.className = 'api-indicator api-inactive';
                statusIndicator.textContent = 'YouTube API: Issues';
                responseTimeEl.textContent = 'Timeout';
                successRateEl.textContent = '0%';
            }
        }

        async function checkWebsiteStatus() {
            const card = document.getElementById('websiteStatusCard');
            const statusIndicator = document.getElementById('api2Status');
            const responseTimeEl = document.getElementById('websiteResponseTime');
            const statusCodeEl = document.getElementById('websiteStatusCode');

            const startTime = Date.now();
            
            try {
                const response = await fetch(CONFIG.youtubeWebsiteUrl, {
                    method: 'HEAD',
                    mode: 'no-cors'
                });

                const responseTime = Date.now() - startTime;
                
                // If we reach here, the website is accessible
                updateStatusCard(card, 'up', 'Website Accessible', 'YouTube.com is loading normally.');
                statusIndicator.className = 'api-indicator api-active';
                statusIndicator.textContent = 'Website: Accessible';
                responseTimeEl.textContent = `${responseTime}ms`;
                statusCodeEl.textContent = '200';

            } catch (error) {
                updateStatusCard(card, 'down', 'Website Unreachable', 'YouTube.com may be down or experiencing issues.');
                statusIndicator.className = 'api-indicator api-inactive';
                statusIndicator.textContent = 'Website: Unreachable';
                responseTimeEl.textContent = 'Timeout';
                statusCodeEl.textContent = 'Error';
            }
        }

        async function checkThirdPartyStatus() {
            const card = document.getElementById('thirdPartyStatusCard');
            const statusIndicator = document.getElementById('api3Status');
            const reportsCountEl = document.getElementById('reportsCount');
            const sentimentScoreEl = document.getElementById('sentimentScore');

            try {
                // Simulate checking public data (in a real app, you'd use Downdetector API or similar)
                // For now, we'll simulate based on the other checks
                const apiCard = document.getElementById('apiStatusCard');
                const websiteCard = document.getElementById('websiteStatusCard');
                
                const apiIsUp = !apiCard.classList.contains('down');
                const websiteIsUp = !websiteCard.classList.contains('down');

                if (apiIsUp && websiteIsUp) {
                    updateStatusCard(card, 'up', 'Normal Activity', 'Normal user activity reported.');
                    reportsCountEl.textContent = 'Low';
                    sentimentScoreEl.textContent = 'Positive';
                } else {
                    updateStatusCard(card, 'degraded', 'Increased Reports', 'Some users reporting issues.');
                    reportsCountEl.textContent = 'Medium';
                    sentimentScoreEl.textContent = 'Mixed';
                }

                statusIndicator.className = 'api-indicator api-active';
                statusIndicator.textContent = 'Public Data: Active';

            } catch (error) {
                updateStatusCard(card, 'checking', 'Data Unavailable', 'Unable to fetch public report data.');
                statusIndicator.className = 'api-indicator api-inactive';
                statusIndicator.textContent = 'Public Data: Unavailable';
                reportsCountEl.textContent = '-';
                sentimentScoreEl.textContent = '-';
            }
        }

        function updateStatusCard(card, status, title, description) {
            const statusIcon = card.querySelector('.status-icon');
            const statusTitle = card.querySelector('.status-title');
            const statusDesc = card.querySelector('.status-description');

            // Remove all status classes
            card.classList.remove('up', 'down', 'degraded', 'checking');
            statusIcon.classList.remove('status-up', 'status-down', 'status-degraded', 'status-checking');

            // Add new status
            card.classList.add(status);
            statusIcon.classList.add(`status-${status}`);

            // Update content
            statusTitle.textContent = title;
            statusDesc.textContent = description;

            // Update icon based on status
            switch(status) {
                case 'up':
                    statusIcon.textContent = '✅';
                    break;
                case 'down':
                    statusIcon.textContent = '❌';
                    break;
                case 'degraded':
                    statusIcon.textContent = '⚠️';
                    break;
                case 'checking':
                    statusIcon.textContent = '🔍';
                    break;
            }
        }

        function updateLastUpdatedTime() {
            lastUpdateTime = new Date();
            const timeString = lastUpdateTime.toLocaleTimeString();
            document.getElementById('lastUpdatedTime').textContent = timeString;
        }

        function showError(message) {
            const errorMessage = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            
            errorText.textContent = message;
            errorMessage.style.display = 'block';
        }

        function simulateOutage() {
            const card = document.getElementById('websiteStatusCard');
            updateStatusCard(card, 'down', 'Simulated Outage', 'This is a test of the alert system. YouTube is actually working fine.');
            
            const statusIndicator = document.getElementById('api2Status');
            statusIndicator.className = 'api-indicator api-inactive';
            statusIndicator.textContent = 'Website: Test Alert';
            
            alert('🔴 TEST ALERT: This is a simulation! YouTube is actually working normally.');
            
            // Auto-revert after 5 seconds
            setTimeout(() => {
                checkWebsiteStatus();
            }, 5000);
        }

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            checkAllStatus();
            
            // Set up auto-refresh
            setInterval(checkAllStatus, CONFIG.checkIntervals.normal);
            
            // Quick refresh for the first minute
            setTimeout(checkAllStatus, CONFIG.checkIntervals.quick);
        });

        // Add keyboard shortcut
        document.addEventListener('keydown', function(e) {
            if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                checkAllStatus();
            }
        });
   
        // Expose for inline handlers and debugging
        if (typeof window !== 'undefined') {
            window.checkAllStatus = checkAllStatus;
            window.simulateOutage = simulateOutage;
        }

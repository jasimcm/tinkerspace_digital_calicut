export const fetchData = async () => {
    const API_URL = process.env.REACT_APP_API_BASE_URL;
    const SPACE_ID = process.env.REACT_APP_SPACE_ID;
    console.log(API_URL);

    try {
        if (!API_URL) {
            throw new Error('REACT_APP_API_BASE_URL is not set. Please configure it in your .env file.');
        }
        const checkinUrl = SPACE_ID
            ? `${API_URL}/checkin/active?space_id=${SPACE_ID}`
            : `${API_URL}/checkin/active`;
        const response = await fetch(checkinUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add any required authentication headers here
            },
            credentials: 'same-origin' // or 'include' if needed
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON. The backend server may not be running or the API URL is incorrect.");
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        // Return empty array instead of throwing to prevent app crash
        // The app will still work, just without data
        return [];
    }
};
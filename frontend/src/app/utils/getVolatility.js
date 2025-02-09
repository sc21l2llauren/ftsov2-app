export default async function getVolatility() {
    try {
        const response = await fetch("https://opt-chain.onrender.com/get_volatility", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Extract JSON from response
        console.log("Data:", data);
        return data; // Return the data so it can be used by the caller
    } catch (error) {
        console.error("Error fetching volatility:", error);
        return null; // Return null on error to prevent undefined errors elsewhere
    }
}

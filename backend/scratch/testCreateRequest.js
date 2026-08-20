const testCreateRequest = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/reports/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            threatTitle: "Network Probe Detected",
            description: "Attempted port scanning on production servers.",
            threatType: "Unauthorized Access",
            severity: "Medium",
            zone: "Central"
        })
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Data:", data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testCreateRequest();

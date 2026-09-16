const callPythonService = async (
    endpoint,
    data = {},
    method = "POST"
) => {
    const baseUrl =
        process.env.PYTHON_SERVICE_URL ||
        "http://127.0.0.1:8000";

    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (method !== "GET") {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(
            `${baseUrl}${endpoint}`,
            options
        );

        if (!response.ok) {
            throw new Error(
                `Python service failed: ${response.status}`
            );
        }

        return await response.json();
    } catch (err) {
        if (err.message.startsWith("Python service failed:")) {
            throw err;
        }
        throw new Error(`Python service unreachable at ${baseUrl}: ${err.message}`);
    }
};

module.exports = {
    callPythonService
};
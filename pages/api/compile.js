import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { code, language } = req.body;

    // Mapping language names to Piston API supported names
    const pistonLanguages = {
      javascript: "javascript",
      python: "python",
      cpp: "cpp",
      java: "java",
    };

    // Ensure the provided language is supported
    if (!pistonLanguages[language]) {
      return res.status(400).json({ error: "Unsupported language" });
    }

    try {
      // Call Piston API
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: pistonLanguages[language],
        version: "*", // Use the latest version
        files: [{ name: "main", content: code }],
        stdin: "", // Optional: Add input support if needed
      });

      // Extract output from Piston API response
      const output = response.data.run.output;
      res.status(200).json({ output });
    } catch (error) {
      console.error("Error calling Piston API:", error);
      res.status(500).json({ error: "Code execution failed. Please try again." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

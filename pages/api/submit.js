export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { code, language } = req.body;

        try {
            // Simulate successful response
            res.status(200).json({ message: `Submitted code for ${language}.` });
        } catch (error) {
            console.error("Server error:", error.message);
            res.status(500).json({ message: "Server error occurred." });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

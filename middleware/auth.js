const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'API Key tidak valid, yang benar: sazukaxcmv'
        });
    }
    
    next();
};

module.exports = authMiddleware;

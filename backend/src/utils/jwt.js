import jwt from "jsonwebtoken";

// generate access token 
export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId: userId.toString() },
        process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret',
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
};

// generate refresh token
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId: userId.toString() },
        process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );
};

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret');
    } catch (error) {
        console.error("JWT Access Token verification failed:", error.message);
        return null;
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret');
    } catch (error) {
        console.error("JWT Refresh Token verification failed:", error.message);
        return null;
    }
};